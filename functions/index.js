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

const INIT_BALANCE = {positive: {}, negative: {}};

exports.addNewNotes = functions.runWith(runtimeOpts).https.onCall(async (newNote) => {

  admin.database().ref('/notes').push(newNote);

  const allBalances = (await admin.database().ref('/balances').once('value')).val();
  const ownerBalance = allBalances[newNote.owner.id] || copy(INIT_BALANCE);
  newNote.moneyPerPerson.filter(moneyPerPerson => moneyPerPerson.personId !== newNote.owner.id)
    .forEach(moneyPerPerson => {
      ownerBalance.positive[moneyPerPerson.personId] = (ownerBalance.positive[moneyPerPerson.personId] || 0) + moneyPerPerson.money;
      console.log(ownerBalance);
      const personBalance = allBalances[moneyPerPerson.personId] || copy(INIT_BALANCE);
      console.log(personBalance);
      personBalance.negative[newNote.owner.id] = (personBalance.negative[newNote.owner.id] || 0) - moneyPerPerson.money;
      allBalances[moneyPerPerson.personId] = personBalance;
      console.log(allBalances);
      console.log('end loop');
    });
  allBalances[newNote.owner.id] = ownerBalance;
  console.log(allBalances);
  admin.database().ref('/balances').set(allBalances);
});
