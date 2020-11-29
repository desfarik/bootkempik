const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const runtimeOpts = {
  timeoutSeconds: 15,
  memory: '128MB'
};

function copy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function round(value) {
  return Number(value.toFixed(2));
}

const INIT_BALANCE = {positive: {}, negative: {}};

function processBalances(allBalances, newNote) {
  const ownerBalance = allBalances[newNote.ownerId] || copy(INIT_BALANCE);
  newNote.moneyPerPerson.filter(moneyPerPerson => moneyPerPerson.personId !== newNote.ownerId)
    .forEach(moneyPerPerson => {
      if (!ownerBalance.positive) {
        ownerBalance.positive = {};
      }
      ownerBalance.positive[moneyPerPerson.personId] = round((ownerBalance.positive[moneyPerPerson.personId] || 0) + moneyPerPerson.money);
      console.log(`add positive ${moneyPerPerson.personId} to owner`, ownerBalance);

      const personBalance = allBalances[moneyPerPerson.personId] || copy(INIT_BALANCE);
      console.log('before negative update person', personBalance);
      if (!personBalance.negative) {
        personBalance.negative = {};
      }
      personBalance.negative[newNote.ownerId] = round((personBalance.negative[newNote.ownerId] || 0) - moneyPerPerson.money);
      allBalances[moneyPerPerson.personId] = personBalance;
      console.log('all balances', allBalances);
      console.log('end loop');
    });
  allBalances[newNote.ownerId] = ownerBalance;
  allBalances.lastUpdateDate = newNote.nowDate;
  console.log(allBalances);
}

exports.addNewNotes = functions.runWith(runtimeOpts).https.onCall(async (newNote) => {
  console.log('start add new Note');
  await admin.database().ref('/notes').push(newNote);
  await admin.database().ref('/notes/lastUpdateDate').set(newNote.nowDate);
  console.log('add new note', newNote);
  const allBalances = (await admin.database().ref('/balances').once('value')).val();
  processBalances(allBalances, newNote);
  admin.database().ref('/balances').set(allBalances);
  return allBalances;
});

exports.getUserNotes = functions.runWith(runtimeOpts).https.onCall(async (userId) => {
  console.log('start get user Notes with id:' + userId);
  const id = Number(userId);
  const allNotes = (await admin.database().ref('/notes').once('value')).val();
  return Object.values(allNotes).filter(note => note.moneyPerPerson.find(moneyPerPerson => moneyPerPerson.personId === id));
});


exports.reduceCredit = functions.runWith(runtimeOpts).https.onCall(async (args) => {
  const [value, user, toUserId] = args;
  console.log('start reduce credit ', value, user.id, toUserId);
  const newNote = createNewNote(value, user, toUserId);
  await admin.database().ref('/notes').push(newNote);
  await admin.database().ref('/notes/lastUpdateDate').set(newNote.nowDate);
  console.log('added new note', newNote);
  const allBalances = (await admin.database().ref('/balances').once('value')).val();
  reduceBalance(allBalances, value, user.id, toUserId, newNote.nowDate);
  admin.database().ref('/balances').set(allBalances);
  return allBalances;
});

function reduceBalance(allBalances, value, userId, toUserId, date) {
  allBalances[userId].positive[toUserId] = round(allBalances[userId].positive[toUserId] - value);
  allBalances[toUserId].negative[userId] = round(allBalances[toUserId].negative[userId] + value);
  allBalances.lastUpdateDate = date;
}

exports.mutualReduceCredit = functions.runWith(runtimeOpts).https.onCall(async (user) => {
  console.log('start mutual reduce credit for', user.id);
  const allBalances = (await admin.database().ref('/balances').once('value')).val();
  const toReduce = {};
  Object.keys(allBalances[user.id].positive).forEach(key => {
    if (allBalances[user.id].positive[key] > 0 && allBalances[user.id].negative[key] < 0) {
      toReduce[key] = Math.min(allBalances[user.id].positive[key], Math.abs(allBalances[user.id].negative[key]));
    }
  });
  console.log('find next pairs ', toReduce);
  for (const key in toReduce) {
    const newNote = createNewNote(toReduce[key], user, key, "Взаимное списание");
    await admin.database().ref('/notes').push(newNote);
    reduceBalance(allBalances, toReduce[key], user.id, key, newNote.nowDate);
    reduceBalance(allBalances, toReduce[key], key, user.id, newNote.nowDate);
  }
  await admin.database().ref('/notes/lastUpdateDate').set(new Date().getTime());
  admin.database().ref('/balances').set(allBalances);
  return allBalances;
});


function createNewNote(value, user, toUserId, description = "Списал долг") {
  return {
    date: new Date().getTime(),
    nowDate: new Date().getTime(),
    amount: value,
    owner: user,
    description: description,
    moneyPerPerson: [{money: value, personId: parseInt(toUserId)}],
    positive: true
  }
}


