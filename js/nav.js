/*
 * nav.js - builds the navbar inside <header class="navbar" id="navbar"> from the session role.
 * Needs storage.js and auth.js loaded first (getSession, logout).
 * It does not use validation.js (that file loads after this one), so it has its own small helper.
 * All text is added with textContent.
 *
 *   guest : Home | Login | Register
 *   user  : Home | Catalogue | My Borrowed | [User] | Logout
 *   admin : Home | Admin Dashboard | [Admin] | Logout
 */
(function () {
  'use strict';

  var navbar = document.getElementById('navbar');
  if (!navbar) return;

  var session = getSession();

  /* the current page, so its link gets the "active" class */
  var currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  // pages that belong to a menu item
  var PAGE_OWNER = {
    'book-details.html': 'books.html',
    'add-edit-book.html': 'admin-books.html'
  };
  if (PAGE_OWNER[currentPage]) currentPage = PAGE_OWNER[currentPage];

  function el(tag, text, className) {
    var node = document.createElement(tag);
    if (text !== undefined && text !== null) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  // normal menu link; buttonClass is only for links that look like buttons
  function addLink(list, text, href, buttonClass) {
    var item = el('li');
    var link = el('a', text, buttonClass);
    link.href = href;
    if (!buttonClass && href === currentPage) link.classList.add('active');
    item.appendChild(link);
    list.appendChild(item);
  }

  function addBadge(list, text) {
    var item = el('li');
    item.appendChild(el('span', text, 'role-badge'));
    list.appendChild(item);
  }

  function addLogout(list) {
    var item = el('li');
    var link = el('a', 'Logout', 'btn btn-secondary btn-logout');
    link.href = '#';
    link.addEventListener('click', function (event) {
      event.preventDefault();
      logout();
    });
    item.appendChild(link);
    list.appendChild(item);
  }

  var list = el('ul', null, 'nav-links');

  if (!session) {
    addLink(list, 'Home', 'index.html');
    addLink(list, 'Login', 'login.html');
    addLink(list, 'Register', 'signup.html', 'btn btn-primary btn-register');
  } else if (session.role === 'admin') {
    addLink(list, 'Home', 'index.html');
    addLink(list, 'Admin Dashboard', 'admin-books.html');
    addBadge(list, 'Admin');
    addLogout(list);
  } else {
    addLink(list, 'Home', 'index.html');
    addLink(list, 'Catalogue', 'books.html');
    addLink(list, 'My Borrowed', 'my-borrowed.html');
    addBadge(list, 'User');
    addLogout(list);
  }

  var container = el('div', null, 'container nav-container');
  var logo = el('a', 'Alexandria Library', 'logo');
  logo.href = 'index.html';
  var nav = el('nav');
  nav.appendChild(list);
  container.appendChild(logo);
  container.appendChild(nav);

  navbar.textContent = '';
  navbar.appendChild(container);
})();
