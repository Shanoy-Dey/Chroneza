document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in (for example, userId in localStorage)
  const userId = localStorage.getItem('userId');
  const navAccounts = document.querySelectorAll('#nav-account-link');
  navAccounts.forEach(navAccount => {
    if (userId) {
      navAccount.innerHTML = '<href="account.html">ACCOUNT</href>';
    } else {
      navAccount.innerHTML = '<href="login.html">SIGN UP/LOGIN</href>';
    }
  });
});


  if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('signup.html')) {
    const scrollTop = window.innerWidth > 600 ? 170 : 0;
    window.scrollTo({ top: scrollTop, behavior: 'auto' });
  }

