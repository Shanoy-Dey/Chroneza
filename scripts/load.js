// Prevent scrolling while loading
document.body.classList.add('loading');

// Animate panels and blur
window.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    // Move panels outward
    document.querySelector('.panel-top').style.transform = 'translateY(-100%)';
    document.querySelector('.panel-bottom').style.transform = 'translateY(100%)';
    document.querySelector('.panel-left').style.transform = 'translateX(-100%)';
    document.querySelector('.panel-right').style.transform = 'translateX(100%)';
    // Unblur center text
    document.querySelector('.center-box').style.opacity = '0';
  }, 600);

  // Remove loader after animation
  setTimeout(() => {
    document.getElementById('timexa-loader').style.opacity = '0';
    document.body.classList.remove('loading');
    setTimeout(() => {
      const loader = document.getElementById('timexa-loader');
      if (loader) loader.remove();
    }, 600);
  }, 2200); // Adjust for desired duration
});