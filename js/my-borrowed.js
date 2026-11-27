/*
 * my-borrowed.js - My Borrowed Books page (user only).
 * Lists books currently borrowed by the logged-in user, supports filtering,
 * and allows returning a book after re-checking ownership and status in storage.
 * All text from storage is rendered via textContent / createEl.
 */
(function () {
  'use strict';

  // Guard: guest -> login.html, admin -> admin-books.html
  var session = requireRole('user');
  if (!session) return;

  var titleInput = document.getElementById('borrowed-title');
  var categorySelect = document.getElementById('borrowed-category');
  var filterBtn = document.getElementById('filter-btn');
  var clearBtn = document.getElementById('clear-btn');

  var grid = document.getElementById('borrowed-grid');
  var countEl = document.getElementById('borrowed-count');
  var emptyState = document.getElementById('empty-state');
  var emptyTitle = document.getElementById('empty-title');
  var emptyText = document.getElementById('empty-text');
  var emptyBrowseBtn = document.getElementById('empty-browse-btn');

  var alertBox = document.getElementById('return-alert');
  var alertText = document.getElementById('return-alert-text');
  var alertClose = document.getElementById('alert-close');

  function capitalize(text) {
    text = String(text || '');
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function formatDate(isoString) {
    if (!isoString) return 'N/A';
    var date = new Date(isoString);
    if (isNaN(date.getTime())) return String(isoString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  function showAlert(message, isError) {
    alertText.textContent = message;
    alertBox.classList.toggle('alert-error', Boolean(isError));
    alertBox.classList.toggle('alert-success', !isError);
    alertBox.hidden = false;
  }

  // Re-verify session, role, status and borrower directly from storage on click
  function handleReturn(bookId) {
    var currentSession = getSession();
    if (!currentSession || !hasRole('user')) {
      window.location.replace('login.html');
      return;
    }

    var book = getById(TABLES.BOOKS, bookId);
    if (!book) {
      showAlert('This book no longer exists.', true);
      renderBorrowedBooks();
      return;
    }

    if (book.status !== 'Borrowed' || Number(book.borrowedBy) !== Number(currentSession.id)) {
      showAlert('You can only return books currently borrowed by your account.', true);
      renderBorrowedBooks();
      return;
    }

    var updated = update(TABLES.BOOKS, book.id, {
      status: 'Available',
      borrowedBy: null,
      borrowDate: null
    });

    if (!updated) {
      showAlert('Could not return the book. Please try again.', true);
      return;
    }

    showAlert('"' + book.title + '" was returned successfully.', false);
    renderBorrowedBooks();
  }

  function createBorrowedCard(book) {
    var card = createEl('article', null, 'card borrowed-card');

    var body = createEl('div');
    body.appendChild(createEl('span', 'Borrowed', 'badge badge-borrowed'));
    body.appendChild(createEl('p', 'ID-' + book.id, 'book-id'));
    body.appendChild(createEl('h3', book.title));
    body.appendChild(createEl('p', 'By ' + book.author, 'book-author'));
    body.appendChild(createEl('p', 'Category: ' + capitalize(book.category), 'book-category'));

    var datesList = createEl('dl', null, 'borrow-dates');
    var dateItem = createEl('div');
    dateItem.appendChild(createEl('dt', 'Borrowed on'));
    dateItem.appendChild(createEl('dd', formatDate(book.borrowDate)));
    datesList.appendChild(dateItem);
    body.appendChild(datesList);

    card.appendChild(body);

    var actions = createEl('div', null, 'card-actions');

    var detailsLink = createEl('a', 'View Details', 'btn btn-secondary');
    detailsLink.href = 'book-details.html?id=' + encodeURIComponent(book.id);
    actions.appendChild(detailsLink);

    var returnBtn = createEl('button', 'Return Book', 'btn btn-primary btn-return');
    returnBtn.type = 'button';
    returnBtn.addEventListener('click', function () {
      handleReturn(book.id);
    });
    actions.appendChild(returnBtn);

    card.appendChild(actions);
    return card;
  }

  function getUserBorrowedBooks() {
    var currentSession = getSession();
    if (!currentSession) return [];
    return find(TABLES.BOOKS, function (book) {
      return book.status === 'Borrowed' && Number(book.borrowedBy) === Number(currentSession.id);
    });
  }

  function renderBorrowedBooks() {
    var titleQuery = trimValue(titleInput.value).toLowerCase();
    var categoryQuery = trimValue(categorySelect.value).toLowerCase();

    var myBooks = getUserBorrowedBooks();
    var matches = myBooks.filter(function (book) {
      var titleMatch = String(book.title || '').toLowerCase().indexOf(titleQuery) !== -1;
      var categoryMatch = categoryQuery === '' ||
        String(book.category || '').toLowerCase() === categoryQuery;
      return titleMatch && categoryMatch;
    });

    grid.textContent = '';
    matches.forEach(function (book) {
      grid.appendChild(createBorrowedCard(book));
    });

    countEl.textContent = String(matches.length);

    if (myBooks.length === 0) {
      emptyTitle.textContent = 'No Borrowed Books';
      emptyText.textContent = 'You have no borrowed books right now. Browse the catalogue and borrow your next read.';
      emptyBrowseBtn.hidden = false;
      emptyState.hidden = false;
    } else if (matches.length === 0) {
      emptyTitle.textContent = 'No Matching Books';
      emptyText.textContent = 'No borrowed books match your current filter. Try clearing the search filters.';
      emptyBrowseBtn.hidden = true;
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
    }
  }

  function clearFilters() {
    titleInput.value = '';
    categorySelect.value = '';
    renderBorrowedBooks();
  }

  filterBtn.addEventListener('click', renderBorrowedBooks);
  clearBtn.addEventListener('click', clearFilters);

  titleInput.addEventListener('input', renderBorrowedBooks);
  titleInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') renderBorrowedBooks();
  });
  categorySelect.addEventListener('change', renderBorrowedBooks);

  alertClose.addEventListener('click', function () {
    alertBox.hidden = true;
  });

  renderBorrowedBooks();
})();