document.addEventListener('DOMContentLoaded', function() {
  const userId = localStorage.getItem('userId');
  const navAccounts = document.querySelectorAll('#nav-account-link');
  navAccounts.forEach(navAccount => {
    if (userId) {
      navAccount.textContent = 'ACCOUNT';
      navAccount.href = '/account';
      navAccount.style.cursor = 'pointer';
    } else {
      navAccount.textContent = 'SIGN UP/LOGIN';
      navAccount.href = '/login';
      navAccount.style.cursor = 'pointer';
    }
  });
});


  if (window.location.pathname.endsWith('/login') || window.location.pathname.endsWith('/signup')) {
    const scrollTop = window.innerWidth > 600 ? 170 : 0;
    window.scrollTo({ top: scrollTop, behavior: 'auto' });
  }

