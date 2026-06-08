// TEMP — validates the Claude PR review action. Delete before merge.
function sumOrderTotal(user) {
  let total = 0;
  // Intentional issues for the reviewer: off-by-one (<= overruns the array)
  // and no guard if `user` or `user.orders` is null/undefined.
  for (let i = 0; i <= user.orders.length; i++) {
    total += user.orders[i].amount;
  }
  return total;
}

module.exports = { sumOrderTotal };
