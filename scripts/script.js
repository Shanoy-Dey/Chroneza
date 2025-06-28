let menuOpen = false;
      function toggleDropdownMenu() {
      const menu = document.getElementById('dropdown-menu');
      const icon = document.getElementById('navimg2');
      menuOpen = !menuOpen;
      menu.style.display = menuOpen ? 'block' : 'none';
      icon.style.transform = menuOpen ? 'rotate(90deg)' : 'rotate(0deg)';
      icon.style.transition = 'transform 0.3s';
      }
      // Optional: Hide menu when clicking outside
      document.addEventListener('click', function(e) {
      const menu = document.getElementById('dropdown-menu');
      const icon = document.getElementById('navimg2');
      if (!icon.contains(e.target) && !menu.contains(e.target)) {
        menu.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
        menuOpen = false;
      }
      });
let buttonHoverInterval = null;
function buttonhover() {
  if (buttonHoverInterval) return; // Prevent multiple intervals
  let progress = 0;
  const button = document.getElementById("hero-button");
  buttonHoverInterval = setInterval(() => {
    if (progress > 100) {
      clearInterval(buttonHoverInterval);
      buttonHoverInterval = null;
      button.style.background = `#c2185b`;
      return;
    }
    button.style.background = `linear-gradient(90deg, #c2185b 0%, rgb(243, 179, 211) ${progress}%, #c2185b 100%)`;
    button.style.transition = "background 0s";
    progress += 5;
  }, 20); // Smoother and a bit faster
}

