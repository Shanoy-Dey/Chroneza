let menuOpen = false;
function toggleDropdownMenu() {
  const menu = document.getElementById('mob-nav');
  const hero= document.getElementById('hero');
  const icon = document.getElementById('navimg2');
  menuOpen = !menuOpen;
  if (menuOpen) {
    menu.classList.add('open');
    hero.classList.add('down');
    icon.style.transform = 'rotate(90deg)';
  } else {
    hero.classList.remove('down');
    menu.classList.remove('open');
    icon.style.transform = 'rotate(0deg)';
  }
  icon.style.transition = 'transform 0.3s';
}
// Optional: Hide menu when clicking outside
document.addEventListener('click', function(e) {
  const menu = document.getElementById('mob-nav');
  const icon = document.getElementById('navimg2');
  const hero = document.getElementById('hero');
  if (!icon.contains(e.target) && !menu.contains(e.target)) {
    hero.classList.remove('down');
    menu.classList.remove('open');
    icon.style.transform = 'rotate(0deg)';
    menuOpen = false;
  }
});

// Close menu on window resize
window.addEventListener('resize', function() {
  const menu = document.getElementById('mob-nav');
  const icon = document.getElementById('navimg2');
  const hero = document.getElementById('hero');
  if (menuOpen) {
    hero.classList.remove('down');
    menu.classList.remove('open');
    icon.style.transform = 'rotate(0deg)';
    menuOpen = false;
  }
});


