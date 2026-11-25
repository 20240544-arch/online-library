/*
 * auth.js - session (sessionStorage), password hashing, login/register and page guards.
 * Needs storage.js loaded first.
 * Roles: 'user' and 'admin'. The sign-up form must use exactly these two values.
 */

const SESSION_KEY = STORAGE_PREFIX + 'session';
const LOGIN_PAGE = 'login.html';
const HOME_PAGES = Object.freeze({
    user: 'books.html',          // users land on the catalogue
    admin: 'admin-books.html'    // admins land on the dashboard
});
const GUEST_HOME = 'index.html';

/* ---------- Session ---------- */

// Stores id, username and role only. The password (or its hash) never goes in the session.
function setSession(user) {
    const session = { id: user.id, username: user.username, role: user.role };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// Returns {id, username, role} or null. If the account was deleted meanwhile, the session is cleared.
function getSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (raw === null) return null;
        const session = JSON.parse(raw);
        if (!session || !session.id || !session.role) return null;
        const stored = getById(TABLES.USERS, session.id);
        if (!stored || stored.role !== session.role) {
            clearSession();
            return null;
        }
        return session;
    } catch (err) {
        clearSession();
        return null;
    }
}

function clearSession() {
    try {
        sessionStorage.removeItem(SESSION_KEY);
    } catch (err) { /* nothing to clear */ }
}

// Home page for a role (guests go to index.html).
function getHomePage(role) {
    return HOME_PAGES[role] || GUEST_HOME;
}

function redirectToHome() {
    const session = getSession();
    window.location.href = session ? getHomePage(session.role) : GUEST_HOME;
}

/* ---------- Page guards ---------- */
/*
 * Put `hidden` on <body> of every protected page so nothing flashes before the guard runs.
 * The guards reveal the page only when access is allowed.
 */

function revealPage() {
    if (document.body) document.body.hidden = false;
}

// Guest -> login page. Returns the session when allowed, otherwise null.
function requireLogin() {
    const session = getSession();
    if (!session) {
        window.location.replace(LOGIN_PAGE);
        return null;
    }
    revealPage();
    return session;
}

// Guest -> login page. Wrong role -> back to that user's own home page.
function requireRole(role) {
    const session = getSession();
    if (!session) {
        window.location.replace(LOGIN_PAGE);
        return null;
    }
    if (session.role !== role) {
        window.location.replace(getHomePage(session.role));
        return null;
    }
    revealPage();
    return session;
}

// For login.html and signup.html: a logged-in user is sent to their home page.
function redirectIfLoggedIn() {
    const session = getSession();
    if (session) {
        window.location.replace(getHomePage(session.role));
        return true;
    }
    return false;
}

// Use inside edit/delete/borrow/return functions (permissions are checked in code, not only by hiding buttons).
function hasRole(role) {
    const session = getSession();
    return !!session && session.role === role;
}

/* ---------- Passwords (SHA-256 via Web Crypto) ---------- */

// Returns the SHA-256 of the password as a hex string.
// Web Crypto only exists on https or localhost (open the site with Live Server, not as a file path).
async function hashPassword(password) {
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error('Web Crypto is unavailable. Open the site through localhost (Live Server).');
    }
    const bytes = new TextEncoder().encode(password);
    const digest = await window.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/* ---------- Uniqueness checks (use them with setCustomValidity in the sign-up form) ---------- */

function isUsernameTaken(username, ignoreId) {
    const wanted = String(username).trim().toLowerCase();
    return find(TABLES.USERS, u =>
        u.username.toLowerCase() === wanted && u.id !== Number(ignoreId)
    ).length > 0;
}

function isEmailTaken(email, ignoreId) {
    const wanted = String(email).trim().toLowerCase();
    return find(TABLES.USERS, u =>
        u.email.toLowerCase() === wanted && u.id !== Number(ignoreId)
    ).length > 0;
}

/* ---------- Register / Login / Logout ---------- */

// data: {username, email, password, role}. Returns {ok:true, user} or {ok:false, message}.
// Never throws, and re-checks everything so a bad record can't be saved even if the form was bypassed.
async function registerUser(data) {
    const username = String(data.username || '').trim();
    const email = String(data.email || '').trim();
    const password = String(data.password || '');
    const role = data.role;

    if (!username || !email || !password) {
        return { ok: false, message: 'All fields are required.' };
    }
    if (role !== 'user' && role !== 'admin') {
        return { ok: false, message: 'Invalid role.' };
    }
    if (isUsernameTaken(username)) {
        return { ok: false, message: 'This username is already taken.' };
    }
    if (isEmailTaken(email)) {
        return { ok: false, message: 'This email is already registered.' };
    }

    try {
        const passwordHash = await hashPassword(password);
        const user = insert(TABLES.USERS, { username, email, passwordHash, role });
        if (!user) return { ok: false, message: 'Could not save the account. Storage may be full.' };
        return { ok: true, user };
    } catch (err) {
        console.error('auth: register failed', err);
        return { ok: false, message: 'Something went wrong while creating the account.' };
    }
}

// Finds the user by username (ignoring case), compares hashes, starts the session.
// One generic message for every failure, so nobody learns which field was wrong.
async function login(username, password) {
    const generic = { ok: false, message: 'Invalid username or password' };
    try {
        const wanted = String(username || '').trim().toLowerCase();
        const user = find(TABLES.USERS, u => u.username.toLowerCase() === wanted)[0];
        if (!user) return generic;
        const hash = await hashPassword(String(password || ''));
        if (hash !== user.passwordHash) return generic;
        setSession(user);
        return { ok: true, user };
    } catch (err) {
        console.error('auth: login failed', err);
        return generic;
    }
}

// Clears the session and goes to the login page.
function logout() {
    clearSession();
    window.location.href = LOGIN_PAGE;
}
