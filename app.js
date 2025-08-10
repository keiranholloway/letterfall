
const COLS = 10, ROWS = 20;
const boardEl = document.getElementById('board');
const grid = document.createElement('div');
grid.className = 'grid';
boardEl.appendChild(grid);
const alphabet = 'ETAOINSHRDLCUMWFGYPBVKJXQZ';
function randLetter() { return alphabet[Math.floor(Math.random()*alphabet.length)]; }
for (let r=0; r<ROWS; r++) {
  for (let c=0; c<COLS; c++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    if (r > ROWS - 5) { cell.classList.add('junk'); cell.textContent = randLetter(); }
    else if (Math.random()<0.12) { cell.textContent = randLetter(); }
    if (r===12 && c>=2 && c<=6) { cell.classList.add('word'); cell.textContent = ['C','R','A','N','E'][c-2]; }
    grid.appendChild(cell);
  }
}
const queue = document.getElementById('queue');
[['T','E','A'],['S','H'],['I','N','G']].forEach(arr=>{
  const div = document.createElement('div'); div.className='mini';
  arr.forEach(ch=>{ const t=document.createElement('span'); t.className='tile'; t.textContent=ch; div.appendChild(t); });
  queue.appendChild(div);
});
