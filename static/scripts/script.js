let menuOpen = false;
function toggleDropdownMenu() {
  const menu = document.getElementById('mob-nav');
  const hero = document.getElementById('hero');
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
document.addEventListener('click', function (e) {
  const menu = document.getElementById('mob-nav');
  const icon = document.getElementById('navimg2');
  const hero = document.getElementById('hero');
  if (!icon.contains(e.target) && !menu.contains(e.target)) {
    if(!menuOpen) return;
    hero.classList.remove('down');
    menu.classList.remove('open');
    icon.style.transform = 'rotate(0deg)';
    menuOpen = false;
  }
});

// Close menu on window resize
window.addEventListener('resize', function () {
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

let lastMinute = 0;
let lastHour = 0;
let lastSecond = 0;
let secRotations = 0;
let minRotations=0;
let hrRotations=0;

function updateClock() {
  const now = new Date();

  const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
  const minutes = now.getMinutes() + seconds / 60;
  const hours   = (now.getHours() % 12) + minutes / 60;

  // detect when we pass from 59.x -> 0.x
  if (seconds < lastSecond) {
    secRotations++;
  }
  lastSecond = seconds;

  if (minutes < lastMinute) {
    minRotations++;
  }
  lastMinute = minutes;

  if (hours < lastHour) {
    hrRotations++;
  }
  lastHour = hours;

  const secondDeg = seconds * 6 + secRotations * 360;
  const minuteDeg = minutes * 6+ minRotations * 360;
  const hourDeg   = hours * 30 + hrRotations * 360;

 const secondHand = document.querySelector('.second');
const minuteHand = document.querySelector('.minute');
const hourHand = document.querySelector('.hour');

if (secondHand) secondHand.style.transform = `rotate(${secondDeg}deg)`;
if (minuteHand) minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
if (hourHand)   hourHand.style.transform   = `rotate(${hourDeg}deg)`;
}

setInterval(updateClock, 16);
updateClock();