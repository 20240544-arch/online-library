/*
 * HTML5 attributes (required, pattern, minlength...) do most of the validation.
 * These functions only cover what HTML5 can't: spaces only, comparing two fields,
 * and checking the stored data. Errors are shown with setCustomValidity().
 */

// remove spaces from the start and the end
function trimValue(value) {
  return String(value == null ? '' : value).trim();
}

function isBlank(value) {
  return trimValue(value) === '';
}

// make an element and put the text with textContent (not innerHTML)
function createEl(tag, text, className) {
  var el = document.createElement(tag);
  if (text !== undefined && text !== null) el.textContent = text;
  if (className) el.className = className;
  return el;
}

/* each check gets the field and returns an error message, or '' if it is ok */

// text with only spaces (empty is handled by "required")
function blankCheck(field) {
  if (field.value.length > 0 && isBlank(field.value)) {
    return 'This field cannot be empty or contain only spaces.';
  }
  return '';
}

// field must be equal to another field (confirm password)
function matchCheck(otherField, message) {
  return function (field) {
    if (field.value === '') return '';
    return field.value === otherField.value ? '' : message;
  };
}

// error if the value already exists, takenFn(value) returns true if it exists
// example: takenCheck(isUsernameTaken, 'This username is already taken.')
function takenCheck(takenFn, message) {
  return function (field) {
    var value = trimValue(field.value);
    if (!value) return '';
    return takenFn(value) ? message : '';
  };
}

// run the checks one by one, the first error is the one we show
function runChecks(field, checks) {
  var message = '';
  for (var i = 0; i < checks.length; i++) {
    message = checks[i](field);
    if (message) break;
  }
  field.setCustomValidity(message);
  return message === '';
}

// check the field every time the user types or changes it
// relatedFields are other fields that should trigger the check too
// (for example the password field re-checks confirm password)
function watchField(field, checks, relatedFields) {
  function run() {
    return runChecks(field, checks);
  }
  [field].concat(relatedFields || []).forEach(function (f) {
    f.addEventListener('input', run);
    f.addEventListener('change', run);
  });
  // the red/green border shows only after the user leaves the field
  field.addEventListener('blur', function () {
    field.classList.add('touched');
  });
  run();
  return run;
}

// show a message above the form, kind is 'error' or 'success'
function showMessage(el, text, kind) {
  el.textContent = text;
  el.classList.remove('form-message-error', 'form-message-success');
  el.classList.add(kind === 'success' ? 'form-message-success' : 'form-message-error');
  el.hidden = false;
}

function hideMessage(el) {
  el.textContent = '';
  el.hidden = true;
}
