var mergeTwoLists = function (l1, l2) {
  return l1.value >= l2.value ? merge(l1, l2) : merge(l2, l1);
};

function merge(l1, l2) {
  // l1[0] >= l2[0]
  const result = l1;
  let prev = null;
  while (l1 && l2) {
    while (l2?.value <= l1?.value) {
      const newNode = {value: l2.value, next: l1};
      if (prev)
        prev.next = newNode;
      prev = newNode;
      l2 = l2.next;
    }
    l1 = l1.next;
  }
  prev.next = l1 || l2;
  return result;

}

console.log(mergeTwoLists([1, 2, 4], [1, 3, 4]));
