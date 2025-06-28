document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in (for example, userId in localStorage)
  const userId = localStorage.getItem('userId');
  const navAccounts = document.querySelectorAll('#nav-account-link');
  navAccounts.forEach(navAccount => {
    if (userId) {
      navAccount.innerHTML = '<a id="nav-account-link" href="account.html">ACCOUNT</a>';
    } else {
      navAccount.innerHTML = '<a id="nav-account-link" href="login.html">SIGN UP/LOGIN</a>';
    }
  });
});
  