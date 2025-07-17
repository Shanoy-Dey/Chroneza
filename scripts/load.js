

// Show loader and play reverse animation
function showReverseLoader(callback) {
  let loader = document.getElementById('timexa-loader');
  if (!loader) {
    return callback && callback();
  }
  loader.style.opacity = '1';
  loader.style.display = 'block';
  document.body.classList.add('loading');
  // Reset panels to off-screen
  document.querySelector('.panel-top').style.transform = 'translateY(-100%)';
  document.querySelector('.panel-bottom').style.transform = 'translateY(100%)';
  document.querySelector('.panel-left').style.transform = 'translateX(-100%)';
  document.querySelector('.panel-right').style.transform = 'translateX(100%)';
  document.querySelector('.center-box').style.opacity = '0';

  setTimeout(() => {
    // Animate panels inward (TIMEXA still hidden)
    document.querySelector('.panel-top').style.transform = 'translateY(0)';
    document.querySelector('.panel-bottom').style.transform = 'translateY(0)';
    document.querySelector('.panel-left').style.transform = 'translateX(0)';
    document.querySelector('.panel-right').style.transform = 'translateX(0)';
    // Do NOT show .center-box yet
  }, 10);

  // After panels have shut, show TIMEXA
  setTimeout(() => {
    document.querySelector('.center-box').style.opacity = '1';
  }, 700); // Adjust this to match your panel animation duration

  // After animation, call callback (navigate)
  setTimeout(() => {
    if (callback) callback();
  }, 1200); // Give time for TIMEXA to appear before navigating
}

// Normal loader on page load (panels slide out)
document.body.classList.add('loading');
window.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    document.querySelector('.panel-top').style.transform = 'translateY(-100%)';
    document.querySelector('.panel-bottom').style.transform = 'translateY(100%)';
    document.querySelector('.panel-left').style.transform = 'translateX(-100%)';
    document.querySelector('.panel-right').style.transform = 'translateX(100%)';
    document.querySelector('.center-box').style.opacity = '0';
  }, 600);

  setTimeout(() => {
    document.getElementById('timexa-loader').style.opacity = '0';
    document.body.classList.remove('loading');
    setTimeout(() => {
      const loader = document.getElementById('timexa-loader');
      if (loader) loader.style.display = 'none';
    }, 600);
  }, 2200);
});

// Intercept link clicks for reverse loader
document.addEventListener('DOMContentLoaded', function() {
  document.body.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (
      link &&
      link.href &&
      !link.target &&
      !link.href.startsWith('javascript:') &&
      !link.href.startsWith('#') &&
      link.origin === window.location.origin
    ) {
      e.preventDefault();
      showReverseLoader(() => {
        window.location.href = link.href;
      });
    }
  });
});