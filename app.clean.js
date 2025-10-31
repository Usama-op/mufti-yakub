// app.clean.js - cleaned app behavior (nav fixed, no dragging)
// NOTE: Replace 'YOUR_GOOGLE_CLIENT_ID' with your actual Google Web app client ID to enable live sign-in.
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // <-- put your client id here

function $(s){return document.querySelector(s)}
function lsGet(key){try{return JSON.parse(localStorage.getItem(key))}catch(e){return null}}
function lsSet(key,val){localStorage.setItem(key, JSON.stringify(val))}

// Theme handling
function applyTheme(theme){
  if(theme === 'light') document.documentElement.classList.add('light');
  else document.documentElement.classList.remove('light');
  lsSet('theme', theme);
  $('#theme-toggle') && ($('#theme-toggle').textContent = theme === 'dark' ? '🌙' : '☀️');
}

function toggleTheme(){
  const current = lsGet('theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// Simple JWT payload decoder (for Google credential response)
function decodeJwtPayload(token){
  try{
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g,'+').replace(/_/g,'/');
    const json = decodeURIComponent(atob(base64).split('').map(function(c){
      return '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(json);
  }catch(e){return null}
}

function handleCredentialResponse(response){
  const payload = decodeJwtPayload(response.credential);
  if(payload){
    const user = {id: payload.sub, name: payload.name, email: payload.email, picture: payload.picture};
    lsSet('user', user);
    updateUserArea();
    // redirect to home if on signin page
  if(location.pathname.endsWith('comments.html')) location.href = 'index.html';
  }
}

// Mock sign-in for local development
function mockSignIn(){
  const user = {id:'mock-1', name:'Ahmed Al-Sadiq', email:'ahmed@example.com', picture:''};
  lsSet('user', user);
  updateUserArea();
  if(location.pathname.endsWith('comments.html')) location.href = 'index.html';
}

function signOut(){
  localStorage.removeItem('user');
  if(window.google && google.accounts && google.accounts.id) try{ google.accounts.id.disableAutoSelect(); }catch(e){}
  updateUserArea();
}

function updateUserArea(){
  const ua = $('#user-area');
  const user = lsGet('user');
  if(!ua) return;
  ua.innerHTML = '';
  if(user){
    const img = document.createElement('img');
    img.className = 'user-avatar';
    img.alt = user.name || 'User';
    img.src = user.picture || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="100%" height="100%" fill="%230ea5a4" rx="8"/></svg>';
    const name = document.createElement('span');
    name.className = 'user-name';
    name.textContent = user.name || user.email || 'User';

    const menu = document.createElement('div');
    menu.style.display = 'flex'; menu.style.alignItems='center'; menu.style.gap = '.6rem';

    const outBtn = document.createElement('button'); outBtn.className='btn outline'; outBtn.textContent='Sign out'; outBtn.onclick = signOut;
    menu.appendChild(name);
    menu.appendChild(outBtn);

    ua.appendChild(img);
    ua.appendChild(menu);

    const authLink = document.getElementById('auth-link'); if(authLink) authLink.textContent = 'Account';
  } else {
  const a = document.createElement('a'); a.href = 'comments.html'; a.className='btn'; a.textContent = 'Comments';
    ua.appendChild(a);
    const authLink = document.getElementById('auth-link'); if(authLink) authLink.textContent = 'Sign In';
  }
}

function initGSI(){
  if(!window.google || !google.accounts || !google.accounts.id) return;
  if(!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID'){
    console.info('Google CLIENT_ID not set. GSI will not be initialized. Use Mock Sign In to test locally.');
    return;
  }

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse
  });

  const gsiContainer = document.getElementById('gsi-button');
  if(gsiContainer) google.accounts.id.renderButton(gsiContainer, {theme:'outline', size:'large'});
}

// attach events and initialize UI
document.addEventListener('DOMContentLoaded', ()=>{
  // set year
  const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();

  // theme
  const savedTheme = lsGet('theme') || 'dark';
  applyTheme(savedTheme);
  const tbtn = document.getElementById('theme-toggle'); if(tbtn) tbtn.onclick = toggleTheme;

  // mock signin
  const mockBtn = document.getElementById('mock-signin'); if(mockBtn) mockBtn.onclick = mockSignIn;

  // init google identity after script loads (allow time)
  setTimeout(initGSI, 400);

  updateUserArea();
  // video category chips
  const chips = document.querySelectorAll('.chip');
  chips.forEach(c=> c.addEventListener('click', ()=>{
    document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
    c.classList.add('active');
    filterVideos(c.dataset.cat);
  }));

  // nav categories dropdown links
  const navCats = document.querySelectorAll('#nav-categories a');
  navCats.forEach(a=> a.addEventListener('click', (e)=>{ e.preventDefault(); const cat=a.dataset.cat; document.querySelectorAll('.chip').forEach(x=>x.classList.toggle('active', x.dataset.cat===cat)); filterVideos(cat); }))

  // render upcoming sample videos
  renderUpcoming([
    {title:'Upcoming: Ramadan Reflections', date:'2026-03-01', desc:'Short series: daily reflections for Ramadan.'},
    {title:'Upcoming: Advanced Tajweed', date:'2026-04-10', desc:'Deep dive into tajweed rules with examples.'}
  ]);

  // floating nav handlers (fixed, non-draggable)
  const floating = document.querySelector('.floating-nav');
  if(floating){
    // show with simple entrance (no floating animation)
    setTimeout(()=>{ floating.classList.add('show'); }, 250);

    floating.addEventListener('click', (ev)=>{
      const btn = ev.target.closest('.fbtn');
      if(!btn) return;
      // If the fbtn is an anchor with an href, let the browser handle navigation
      if(btn.tagName === 'A' && btn.getAttribute('href')) return;
      const action = btn.dataset.action;
      if(action === 'home'){
        const h = document.getElementById('home'); if(h) h.scrollIntoView({behavior:'smooth'}); else window.scrollTo({top:0, behavior:'smooth'});
      } else if(action === 'videos'){
        const v = document.getElementById('videos'); v && v.scrollIntoView({behavior:'smooth'});
      } else if(action === 'categories'){
        const chips = document.getElementById('category-chips'); if(chips){ chips.classList.add('show'); chips.scrollIntoView({behavior:'smooth', block:'center'}); setTimeout(()=>chips.classList.remove('show'), 3500); }
      } else if(action === 'upcoming'){
        const u = document.getElementById('upcoming-grid'); u && u.scrollIntoView({behavior:'smooth', block:'center'});
      }
    });
  }

  // back button on each page
  const backBtn = document.getElementById('back-btn');
  if(backBtn){
    const path = location.pathname.split('/').pop();
    if(!path || path === '' || path === 'index.html') backBtn.style.display = 'none';
    backBtn.addEventListener('click', ()=>{
      if(history.length > 1) history.back(); else location.href = 'index.html';
    });
  }

  // Mobile embed fallback: replace/hide iframes with clickable poster on small/touch devices.
  (function enhanceMobileEmbeds(){
    try{
      var isMobile = (window.innerWidth <= 600) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || /Mobi|Android/i.test(navigator.userAgent);
      if(!isMobile) return;
      document.querySelectorAll('.video-wrap iframe').forEach(function(ifr){
        if(!ifr) return;
        var src = ifr.getAttribute('src') || '';
        var m = src.match(/embed\/(?:videoseries|)([a-zA-Z0-9_-]{6,})/);
        if(!m || !m[1]){
          // try another pattern
          m = src.match(/embed\/([a-zA-Z0-9_-]{6,})/);
        }
        var vid = m && m[1] ? m[1] : null;
        if(!vid) return;

        var wrapper = ifr.parentElement;
        if(!wrapper) return;

        // if we already added a poster, skip
        if(wrapper.querySelector('.video-poster')){
          ifr.style.display = 'none';
          return;
        }

        // create poster link to open YouTube watch page
        var a = document.createElement('a');
        a.className = 'video-poster';
        a.href = 'https://www.youtube.com/watch?v=' + vid;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';

        var img = document.createElement('img');
        img.src = 'https://i.ytimg.com/vi/' + vid + '/hqdefault.jpg';
        img.alt = 'Play video';
        a.appendChild(img);

        var play = document.createElement('span');
        play.className = 'video-playbtn';
        play.innerHTML = '&#9658;';
        a.appendChild(play);

        // insert poster before iframe and hide iframe to avoid playback issues
        wrapper.insertBefore(a, ifr);
        ifr.style.display = 'none';
      });
    }catch(e){ console.warn('enhanceMobileEmbeds error', e); }
  })();

  // mobile top menu toggle removed - button is no longer present in the header
});

function filterVideos(category){
  const grid = document.getElementById('video-grid');
  const cards = grid ? grid.querySelectorAll('.card') : [];
  cards.forEach(card=>{
    const cat = card.dataset.category || 'all';
    if(category === 'all' || category === 'All') card.style.display = '';
    else if(category === 'Upcoming') card.style.display = 'none';
    else card.style.display = (cat === category) ? '' : 'none';
  });
}

function renderUpcoming(items){
  const el = document.getElementById('upcoming-grid');
  if(!el) return;
  el.innerHTML = '';
  items.forEach(it=>{
    const a = document.createElement('article'); a.className='card glass upcoming-card';
    a.innerHTML = `<div class="card-body"><h4>${it.title}</h4><p class="small">Release: ${it.date}</p><p class="small">${it.desc}</p></div>`;
    el.appendChild(a);
  });
}
