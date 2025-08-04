document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in (for example, userId in localStorage)
  const userId = localStorage.getItem('userId');
  const navAccounts = document.querySelectorAll('#nav-account-link');
  navAccounts.forEach(navAccount => {
    if (userId) {
      navAccount.textContent = userId ? 'ACCOUNT' : 'SIGN UP/LOGIN';
      navAccount.onclick = function() {
        window.location.href = userId ? '/account' : '/login';
      };
      navAccount.style.cursor = 'pointer';
    }
  });
});


  if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('signup.html')) {
    const scrollTop = window.innerWidth > 600 ? 170 : 0;
    window.scrollTo({ top: scrollTop, behavior: 'auto' });
  }

