const firebaseConfig = { 
  apiKey: "AIzaSyB-vHc4nWntJQwf-Ezd6QH5ChXldCkiYBM", 
  authDomain: "babysell-8b37b.firebaseapp.com", 
  projectId: "babysell-8b37b", 
  databaseURL: "https://babysell-8b37b-default-rtdb.firebaseio.com", 
  appId: "1:955498378146:web:52f027f8e97398e75b78fb" 
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(), db = firebase.database();
let bal = 0;

const LOOT = [
  { n: "АКР тунельні твари", p: 1400, img: "https://i.postimg.cc/3NW96mG1/AK.png" },
  { n: "ГЛОК карамельное яблуко", p: 450, img: "https://i.postimg.cc/Hk5Jznr2/Glock.png" }
];

const langData = {
    ua: { back: "← НАЗАД", open: "ВІДКРИТИ ЗА 500 B", opening: "ВІДКРИТТЯ...", win: "ВИГРАШ!", claim: "ЗАБРАТИ", sell: "ПРОДАНО" },
    ru: { back: "← НАЗАД", open: "ОТКРЫТЬ ЗА 500 B", opening: "ОТКРЫТИЕ...", win: "ВЫИГРЫШ!", claim: "ЗАБРАТЬ", sell: "ПРОДАНО" },
    en: { back: "← BACK", open: "OPEN FOR 500 B", opening: "OPENING...", win: "YOU WIN!", claim: "CLAIM", sell: "SOLD" }
};

window.setLang = (l) => {
    document.getElementById('t-back').innerText = langData[l].back;
    document.getElementById('t-open-btn').innerText = langData[l].open;
    document.getElementById('t-opening').innerText = langData[l].opening;
    document.getElementById('t-win-title').innerText = langData[l].win;
    document.getElementById('t-claim').innerText = langData[l].claim;
    window.currentLang = l;
};

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('user-info').style.display = 'block';
    document.getElementById('u-pic').src = user.photoURL;
    db.ref('users/' + user.uid + '/balance').on('value', s => {
      bal = s.val() || 0;
      document.getElementById('u-balance').innerText = bal.toLocaleString();
    });
  }
});

window.googleAuth = () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());

window.usePromo = () => {
    const input = document.getElementById('promo-input').value.trim();
    if (input === "ADMIN2027" && auth.currentUser) {
        db.ref(`users/${auth.currentUser.uid}/balance`).transaction(c => (c || 0) + 99999);
    }
    document.getElementById('promo-input').value = '';
};

window.showScreen = (id) => {
  document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
  const target = document.getElementById(id);
  if (target) target.style.display = 'flex';
};

window.startSpin = () => {
  if (bal < 500) return alert("Low balance!");
  const uId = auth.currentUser.uid;
  db.ref(`users/${uId}/balance`).transaction(c => (c || 0) - 500);
  showScreen('screen-roulette');
  
  const winIndex = 55; 
  const winItem = LOOT[Math.floor(Math.random() * LOOT.length)];
  const track = document.getElementById('track');
  
  track.style.transition = 'none';
  track.style.transform = 'translateX(0)';
  
  let html = '';
  for (let i = 0; i < 70; i++) {
    const cur = (i === winIndex) ? winItem : LOOT[Math.floor(Math.random() * LOOT.length)];
    html += `<div><img src="${cur.img}"></div>`; // Тут без тексту <span>
  }
  track.innerHTML = html;

  setTimeout(() => {
    track.style.transition = 'transform 7s cubic-bezier(0.1, 0, 0.05, 1)';
    const itemWidth = 160;
    const finalShift = (winIndex * itemWidth) - (800 / 2) + (itemWidth / 2);
    track.style.transform = `translateX(-${finalShift}px)`;
  }, 100);

  setTimeout(() => {
    db.ref(`users/${uId}/balance`).transaction(c => (c || 0) + winItem.p);
    document.getElementById('win-res').innerHTML = `<img src="${winItem.img}" width="150"><h3>${winItem.n}</h3>`;
    document.getElementById('auto-sell-text').innerText = `${langData[window.currentLang || 'ru'].sell}: +${winItem.p} B`;
    document.getElementById('win-modal').style.display = 'flex';
  }, 7500);
};

window.closeWin = () => { document.getElementById('win-modal').style.display = 'none'; showScreen('screen-cases'); };

particlesJS("particles-js", {
  particles: {
    number: { value: 60, density: { enable: true, value_area: 800 } },
    color: { value: "#00ffaa" },
    opacity: { value: 0.2 },
    size: { value: 2 },
    line_linked: { enable: true, distance: 150, color: "#00ffaa", opacity: 0.1, width: 1 },
    move: { enable: true, speed: 1 }
  },
  interactivity: { events: { onhover: { enable: true, mode: "grab" } } },
  retina_detect: true
});

setLang('ru');
window.onload = () => showScreen('screen-cases');