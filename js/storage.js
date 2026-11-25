/*
 * storage.js - the ONLY file that touches localStorage.
 * Every table is one localStorage key holding a JSON array of objects.
 * Each table has a counter key so an id is never reused after a delete.
 * Load order on every page: storage.js -> auth.js -> nav.js -> validation.js -> page script.
 */

const STORAGE_PREFIX = 'onlineLibrary_';

// Table names. Always use these constants instead of typing strings.
const TABLES = Object.freeze({
    USERS: 'users',   // id, username, email, passwordHash, role ('user' | 'admin')
    BOOKS: 'books'    // id, title, author, category, description, status, borrowedBy, borrowDate
});

function tableKey(table) {
    return STORAGE_PREFIX + table;
}

function counterKey(table) {
    return STORAGE_PREFIX + table + '_nextId';
}

// Returns the array of records. Missing or corrupted data gives [].
function getAll(table) {
    try {
        const raw = localStorage.getItem(tableKey(table));
        if (raw === null) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        console.error('storage: could not read table "' + table + '"', err);
        return [];
    }
}

// Saves the whole array. Returns true on success, false on failure (quota, private mode...).
function saveAll(table, records) {
    try {
        localStorage.setItem(tableKey(table), JSON.stringify(records));
        return true;
    } catch (err) {
        console.error('storage: could not save table "' + table + '"', err);
        return false;
    }
}

// Returns the next id and bumps the counter. Falls back to max(id)+1 if the counter is missing/corrupted.
function nextId(table) {
    let next = NaN;
    try {
        next = parseInt(localStorage.getItem(counterKey(table)), 10);
    } catch (err) {
        next = NaN;
    }
    if (!Number.isInteger(next) || next < 1) {
        next = getAll(table).reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;
    }
    try {
        localStorage.setItem(counterKey(table), String(next + 1));
    } catch (err) {
        console.error('storage: could not save counter for "' + table + '"', err);
    }
    return next;
}

// id may be a number or a string such as the one read from ?id=4. Returns the record or null.
function getById(table, id) {
    const numericId = Number(id);
    if (!Number.isInteger(numericId)) return null;
    return getAll(table).find(r => r.id === numericId) || null;
}

// Assigns the next id, saves, returns the new record (or null if saving failed).
function insert(table, record) {
    const records = getAll(table);
    const newRecord = Object.assign({}, record, { id: nextId(table) });
    records.push(newRecord);
    return saveAll(table, records) ? newRecord : null;
}

// Merges `changes` into the record. The id can never be changed. Returns the updated record or null.
function update(table, id, changes) {
    const numericId = Number(id);
    const records = getAll(table);
    const index = records.findIndex(r => r.id === numericId);
    if (index === -1) return null;
    records[index] = Object.assign({}, records[index], changes, { id: records[index].id });
    return saveAll(table, records) ? records[index] : null;
}

// Deletes one record. Returns true if something was removed.
function remove(table, id) {
    const numericId = Number(id);
    const records = getAll(table);
    const kept = records.filter(r => r.id !== numericId);
    if (kept.length === records.length) return false;
    return saveAll(table, kept);
}

// Returns every record for which predicate(record) is true.
function find(table, predicate) {
    return getAll(table).filter(predicate);
}
