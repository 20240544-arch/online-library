Alexandria Digital Library - IS231 Web Technology - Phase 2 (Project 2: Online Library)
Team / IDs / Group: see the cover page.

HOW TO RUN
Open the folder with VS Code "Live Server" (or any local server) and start from index.html.
Do not open the files by double-click: the Web Crypto API (password hashing) only works on localhost/https.
A brand new site is empty. Create accounts from the sign-up page; nothing is hard-coded.

FOLDER STRUCTURE
  *.html          8 pages (+ any extra page)
  css/style.css   shared styles
  js/storage.js   the only file that calls localStorage (CRUD)
  js/auth.js      session, password hashing, login/register, page guards
  js/nav.js       builds the navbar from the session role
  js/validation.js shared validation helpers
  js/*.js         one script per page

STORAGE KEYS (localStorage, prefix "onlineLibrary_")
  onlineLibrary_users            JSON array of users
  onlineLibrary_users_nextId     counter, ids are never reused
  onlineLibrary_books            JSON array of books
  onlineLibrary_books_nextId     counter, ids are never reused
SESSION (sessionStorage)
  onlineLibrary_session          {id, username, role}  (no password, no hash)

RECORD FIELDS
  users: id, username, email, passwordHash (SHA-256 hex), role ("user" | "admin")
  books: id, title, author, category, description, status ("Available" | "Borrowed"),
         borrowedBy (user id, or null when available), borrowDate (ISO date string, or null)
  Tables are related by id: a book stores the borrower's user id, pages look the username up.

VALIDATION RULES
Sign-up
  HTML5: username required, minlength 3, maxlength 20, pattern [A-Za-z0-9_]+ with title;
         email type=email required; password required, minlength 8, pattern
         (?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,} with title; confirm password required;
         role required select (User / Administrator).
  JavaScript: confirm password equals password (re-checked when either changes);
         username unique ignoring case; email unique ignoring case; whitespace-only text rejected.
Login
  HTML5: username and password required.
  JavaScript: must match a stored user, one generic message "Invalid username or password";
         a logged-in user opening login/sign-up is sent to their home page.
Add/Edit Book
  HTML5: title required, minlength 2, maxlength 100; author required with a letters/spaces/dots/hyphens
         pattern and title; category required select (5 categories); description required,
         minlength 20, maxlength 500.
  JavaScript: text is trimmed and whitespace-only values are rejected; status is not a form field,
         new books are always Available.
Search / filters (title, author, category)
  HTML5: input types only.
  JavaScript: text trimmed, case-insensitive, partial match, filters combine (AND).

ASSUMPTIONS
  1. Each book record is one borrowable copy; two copies of a title are two records.
  2. Roles are stored as "user" and "admin"; the role chosen at sign-up is saved with the account.
  3. Empty search: all filters empty shows every book.
  4. Usernames and emails are unique ignoring case; login matches the username ignoring case.
  5. The session lives in sessionStorage: refreshing keeps the login, a new tab does not.
  6. A user who opens a page of the other role is redirected to their own home page
     (user: books.html, admin: admin-books.html); a guest is redirected to login.html.
  7. Admins share one catalogue and can edit any book's text fields, never its status or borrower.
  8. A deleted user account invalidates that session on the next page load.
  9. Dates are saved as ISO strings (YYYY-MM-DD) and shown to the user in a readable format.

WHY localStorage IS NOT SAFE FOR REAL CREDENTIALS
Anyone who opens the browser DevTools can read and edit everything in localStorage and sessionStorage,
including every user record, and any script on the same origin can read it. Our passwords are hashed with
SHA-256 (Web Crypto API) instead of stored as plain text, but this is still only a stand-in: a fast unsalted
hash can be brute-forced, and a user could simply edit their own role in storage. Phase 3 moves users and
authentication to a real server and database, where passwords are salted and slow-hashed and permissions
are enforced on the server.
