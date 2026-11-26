/* 
 * HTML5 (in login.html): username and password are required.
 * JS here: username with only spaces, then login() from auth.js checks the user
 * and redirectToHome() sends him to the page of his role.
 */
(function () {
  'use strict';

  // already logged in, so go to the home page
  if (redirectIfLoggedIn()) return;

  var form = document.getElementById('login-form');
  var message = document.getElementById('form-message');
  var submitBtn = document.getElementById('submit');
  var username = form.elements['username'];
  var password = form.elements['password'];

  var runUsernameCheck = watchField(username, [blankCheck]);
  password.addEventListener('blur', function () {
    password.classList.add('touched');
  });

  // message that comes from the sign up page (?registered=1)
  if (new URLSearchParams(window.location.search).get('registered') === '1') {
    showMessage(message, 'Account created successfully. Please log in.', 'success');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    hideMessage(message);
    form.classList.add('was-submitted');

    runUsernameCheck();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitBtn.disabled = true;
    login(username.value, password.value).then(function (result) {
      if (!result.ok) {
        // same message for any mistake, so we don't say which one is wrong
        showMessage(message, result.message, 'error');
        submitBtn.disabled = false;
        return;
      }
      redirectToHome();
    });
  });
})();
