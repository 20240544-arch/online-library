/* 
 * Everything is made from the session and from storage, nothing is written by hand.
 * Text from storage is added with textContent.
 */
(function () {
  'use strict';

  var session = getSession();

  /* welcome text and buttons, they depend on who is logged in */
  var actions = document.getElementById('home-actions');

  function addButton(text, href, kind) {
    var link = createEl('a', text, 'btn ' + kind);
    link.href = href;
    actions.appendChild(link);
  }

  if (!session) {
    addButton('Create Account', 'signup.html', 'btn-primary');
    addButton('Login', 'login.html', 'btn-secondary');
  } else {
    var welcome = document.getElementById('welcome-text');
    welcome.textContent = 'Welcome back, ' + session.username + '.';
    welcome.hidden = false;
    if (session.role === 'admin') {
      addButton('Open Admin Dashboard', getHomePage('admin'), 'btn-primary');
    } else {
      addButton('Browse Catalogue', getHomePage('user'), 'btn-primary');
      addButton('My Borrowed Books', 'my-borrowed.html', 'btn-secondary');
    }
  }

  /* featured books: the 3 newest books in storage */
  var grid = document.getElementById('featured-grid');
  var emptyState = document.getElementById('featured-empty');
  var books = getAll(TABLES.BOOKS).slice().sort(function (a, b) { return b.id - a.id; }).slice(0, 3);

  // no books yet, show the empty message
  if (books.length === 0) {
    emptyState.hidden = false;
    return;
  }

  books.forEach(function (book) {
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
    body.appendChild(createEl('p', 'Category: ' + book.category, 'book-category'));
    body.appendChild(createEl('p', book.description, 'book-description'));
    card.appendChild(body);

    // the details page is only for users, so the button changes with the role
    var link = null;
    if (!session) {
      link = createEl('a', 'Login to view', 'btn btn-secondary');
      link.href = 'login.html';
    } else if (session.role === 'user') {
      link = createEl('a', 'View Details', 'btn btn-secondary');
      link.href = 'book-details.html?id=' + encodeURIComponent(book.id);
    }
    if (link) card.appendChild(link);

    grid.appendChild(card);
  });
})();
