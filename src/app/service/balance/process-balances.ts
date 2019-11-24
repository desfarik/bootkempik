function copy(obj) {
  return JSON.parse(JSON.stringify(obj));
}
function round(value) {
  return parseInt(value.toFixed(2));
}

const INIT_BALANCE = {positive: {}, negative: {}};

export function processBalances(allBalances, newNote) {
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
