/*
 * books.js - Book Catalogue and Search (user only).
 * HTML5 (in books.html): input types only.
 * JS here: cards come from storage, filters are trimmed, case-insensitive,
 * partial match for title and author, exact category, and all filters combine (AND).
 * Text from storage is added with textContent.
 */
(function () {
  'use strict';

  // guest -> login.html, admin -> admin-books.html
  var session = requireRole('user');
  if (!session) return;

  var titleInput = document.getElementById('book-title');
  var authorInput = document.getElementById('book-author');
  var categorySelect = document.getElementById('book-category');
  var searchBtn = document.getElementById('search-btn');

  var grid = document.getElementById('books-grid');
  var emptyState = document.getElementById('books-empty');
  var emptyTitle = document.getElementById('empty-title');
  var emptyText = document.getElementById('empty-text');

  // "programming" -> "Programming" (category values may be stored in lower case)
  function capitalize(text) {
    text = String(text || '');
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  // one book card (the same look as the cards on the home page)
  function createBookCard(book) {
    var card = createEl('article', null, 'card');
    var body = createEl('div');

    var top = createEl('div', null, 'card-top');
    var available = book.status === 'Available';
    top.appendChild(createEl('span', available ? 'Available' : 'Borrowed',
      'badge ' + (available ? 'badge-available' : 'badge-borrowed')));
    top.appendChild(createEl('span', 'ID-' + book.id, 'book-id'));
    body.appendChild(top);

    body.appendChild(createEl('h3', book.title));
    body.appendChild(createEl('p', 'By ' + book.author, 'book-author'));
    body.appendChild(createEl('p', 'Category: ' + capitalize(book.category), 'book-category'));
    body.appendChild(createEl('p', book.description, 'book-description'));
    card.appendChild(body);

    var link = createEl('a', 'View Details', 'btn btn-secondary');
    link.href = 'book-details.html?id=' + encodeURIComponent(book.id);
    card.appendChild(link);

    return card;
  }

  function contains(value, wanted) {
    return String(value || '').toLowerCase().indexOf(wanted) !== -1;
  }

  // read the filters, keep the matching books and draw them
  function applyFilters() {
    var title = trimValue(titleInput.value).toLowerCase();
    var author = trimValue(authorInput.value).toLowerCase();
    var category = trimValue(categorySelect.value).toLowerCase();

    var all = getAll(TABLES.BOOKS);
    var matches = all.filter(function (book) {
      return contains(book.title, title) &&
        contains(book.author, author) &&
        (category === '' || String(book.category || '').toLowerCase() === category);
    });

    grid.textContent = '';
    matches.forEach(function (book) {
      grid.appendChild(createBookCard(book));
    });

    if (all.length === 0) {
      emptyTitle.textContent = 'No Books Yet';
      emptyText.textContent = 'The library has no books at the moment. Please check back soon.';
    } else {
      emptyTitle.textContent = 'No Books Found';
      emptyText.textContent = "We couldn't find any books matching your search. Try another title, author, or category.";
    }
    emptyState.hidden = matches.length > 0;
  }

  searchBtn.addEventListener('click', applyFilters);
  [titleInput, authorInput].forEach(function (input) {
    input.addEventListener('input', applyFilters);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') applyFilters();
    });
  });
  categorySelect.addEventListener('change', applyFilters);

  applyFilters();
})();
