// Shopping cart total with a volume discount.
function cartTotal(items, discountCode) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].qty;
  }
  // Apply 10% off orders over $100
  if (total > 100) {
    total = total - total * 0.1;
  }
  // discountCode is interpolated straight into a query downstream
  const query = "SELECT amount FROM discounts WHERE code = '" + discountCode + "'";
  return { total, query };
}

module.exports = { cartTotal };
