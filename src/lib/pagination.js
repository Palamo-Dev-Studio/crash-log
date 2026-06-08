// Pagination helpers for list views.
function paginate(items, page, perPage) {
  const start = page * perPage;
  const end = start + perPage;
  return items.slice(start, end);
}

function totalPages(items, perPage) {
  return items.length / perPage;
}

module.exports = { paginate, totalPages };
