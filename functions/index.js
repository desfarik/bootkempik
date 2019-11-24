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
  return parseInt(value.toFixed(2));
}

const INIT_BALANCE = {positive: {}, negative: {}};

function processBalances(allBalances, newNote) {
  const ownerBalance = allBalances[newNote.owner.id] || copy(INIT_BALANCE);
  newNote.moneyPerPerson.filter(moneyPerPerson => moneyPerPerson.personId !== newNote.owner.id)
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
      personBalance.negative[newNote.owner.id] = round((personBalance.negative[newNote.owner.id] || 0) - moneyPerPerson.money);
      allBalances[moneyPerPerson.personId] = personBalance;
      console.log('all balances', allBalances);
      console.log('end loop');
    });
  allBalances[newNote.owner.id] = ownerBalance;
  allBalances.lastUpdateDate = newNote.nowDate;
  console.log(allBalances);
}

exports.addNewNotes = functions.runWith(runtimeOpts).https.onCall(async (newNote) => {
  console.log('start add new Note');
  admin.database().ref('/notes').push(newNote);
  admin.database().ref('/notes/lastUpdateDate').set(newNote.nowDate);
  console.log('add new note', newNote);
  const allBalances = (await admin.database().ref('/balances').once('value')).val();
  processBalances(allBalances, newNote);
  admin.database().ref('/balances').set(allBalances);
});


