/* 
 * HTML5 (in signup.html): required, length, pattern, email type and the role select.
 * JS here: confirm password, username/email already used, spaces only.
 * Then registerUser() from auth.js saves the user.
 */
(function () {
  'use strict';

  // if the user is already logged in, send him to his home page
  if (redirectIfLoggedIn()) return;

  var form = document.getElementById('signup-form');
  var message = document.getElementById('form-message');
  var submitBtn = document.getElementById('submit');

  var username = form.elements['username'];
  var email = form.elements['email'];
  var password = form.elements['password'];
  var confirmPassword = form.elements['confirmPassword'];
  var role = form.elements['role'];

  // checks that run while the user is typing (and again on submit)
  var runners = [
    watchField(username, [blankCheck, takenCheck(isUsernameTaken, 'This username is already taken.')]),
    watchField(email, [blankCheck, takenCheck(isEmailTaken, 'This email is already registered.')]),
    // when password changes, confirm password is checked again
    watchField(confirmPassword, [matchCheck(password, 'Passwords do not match.')], [password])
  ];

  // these two have no custom check, but they still need the "touched" class
  [password, role].forEach(function (field) {
    field.addEventListener('blur', function () {
      field.classList.add('touched');
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    hideMessage(message);
    form.classList.add('was-submitted');

    // run the checks again, maybe the username was taken in another tab
    runners.forEach(function (run) { run(); });
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitBtn.disabled = true;
    registerUser({
      username: username.value,
      email: email.value,
      password: password.value,
      role: role.value
    }).then(function (result) {
      if (!result.ok) {
        showMessage(message, result.message, 'error');
        submitBtn.disabled = false;
        return;
      }
      // go to login page with a success message
      window.location.href = 'login.html?registered=1';
    });
  });
})();
