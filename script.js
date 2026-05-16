(function(){
const startBtn = document.getElementById('start');
const strictBtn = document.getElementById('strict');
const levelSpan = document.getElementById('level');
const message = document.getElementById('message');
const colors = Array.from(document.querySelectorAll('.color'));


let sequence = [];
let playerIndex = 0;
let playing = false;
let strict = false;
let level = 0;
let playbackDelay = 600;
const MIN_DELAY = 150;

const freqs = [392, 330, 262, 196];
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function beep(freq, duration=200){
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.frequency.value = freq;
  o.type = 'sine';
  o.connect(g);
  g.connect(audioCtx.destination);
  g.gain.setValueAtTime(0.001, audioCtx.currentTime);
  g.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
  o.start();
  setTimeout(()=>{ g.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.02); o.stop(audioCtx.currentTime + 0.03); }, duration);
}

function flash(index){
  const el = document.getElementById('c'+index);
  el.classList.add('active');
  beep(freqs[index], Math.max(120, playbackDelay*0.8));
  setTimeout(()=> el.classList.remove('active'), Math.max(120, playbackDelay*0.8));
}

function nextRound(){
  sequence.push(Math.floor(Math.random()*4));
  level = sequence.length;
  levelSpan.textContent = `Level: ${level}`;
  playerIndex = 0;
  playing = true;
  message.textContent = 'Watch the sequence';
  playSequence();
  adjustSpeed();
}

function adjustSpeed(){
  const reduce = Math.floor((level-1)/3)*50;
  playbackDelay = Math.max(MIN_DELAY, 600 - reduce);
}

function playSequence(){
  let i=0;
  disableInput();
  const interval = setInterval(()=>{
    flash(sequence[i]);
    i++;
    if(i>=sequence.length){
      clearInterval(interval);
      setTimeout(()=>{ playing=false; enableInput(); message.textContent='Your turn'; }, playbackDelay);
    }
  }, playbackDelay + 120);
}

function handleInput(color){
  if(playing) return;
  flash(color);
  if(sequence[playerIndex] === color){
    playerIndex++;
    if(playerIndex === sequence.length){
      message.textContent = 'Good! Next round...';
      disableInput();
      setTimeout(nextRound, 800);
    }
  } else {
    message.textContent = 'Wrong!';
    if(strict){
      message.textContent += ' Game over.';
      saveHighscore(level-1);
      setTimeout(resetGame, 800);
    } else {
      message.textContent += ' Replay sequence.';
      playerIndex = 0;
      disableInput();
      setTimeout(playSequence, 900);
    }
  }
}

function disableInput(){ colors.forEach(c=>c.disabled=true); }
function enableInput(){ colors.forEach(c=>c.disabled=false); }

function resetGame(){
  sequence = [];
  playerIndex = 0;
  level = 0;
  playbackDelay = 600;
  levelSpan.textContent = 'Level: 0';
  message.textContent = 'Press Start';
  enableInput();
}

function saveHighscore(lv){
  try{ const prev = parseInt(localStorage.getItem('memory-high')||'0',10); if(lv>prev) localStorage.setItem('memory-high', String(lv)); }catch(e){}
}

startBtn.addEventListener('click', ()=>{
  if(audioCtx.state === 'suspended') audioCtx.resume();
  resetGame();
  nextRound();
});

strictBtn.addEventListener('click', ()=>{
  strict = !strict;
  strictBtn.textContent = `Strict: ${strict? 'On':'Off'}`;
});

colors.forEach((btn, idx)=>{
  btn.addEventListener('click', ()=> handleInput(idx));
  btn.addEventListener('mousedown', ()=>{ btn.classList.add('active'); });
  btn.addEventListener('mouseup', ()=>{ btn.classList.remove('active'); });
});


message.textContent = 'Press Start';
disableInput();

})();
