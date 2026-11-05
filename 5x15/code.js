'use strict';
const $ = id => document.getElementById(id);
const symbols = ['●', '◆', '▲', '■', '✦'];
const names = ['Coral', 'Gold', 'Green', 'Blue', 'Plum'];
let state, selected = null, hinted = null;
const key = 'five-fifteen-v1';
const clone = value => JSON.parse(JSON.stringify(value));
const signature = rows => JSON.stringify(rows);
function shuffled(items) {
  for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
  return items;
}
function deal(level = 1) {
  const tiles = shuffled(Array.from({length:75}, (_,i) => ({color:Math.floor(i/15), number:i%15+1})));
  const anchors = shuffled([0,1,2,3,4]);
  const rows = Array.from({length:5}, (_,r) => [{color:anchors[r],number:1}, ...tiles.slice(r*15,r*15+15).map(t => t.number === 1 ? null : t)]);
  state = {rows,level,moves:0,history:[],seen:[signature(rows)]}; selected = null; hinted = null; save(); render();
}
function allMoves(rows = state.rows, level = state.level) {
  if (rows.length === 5 && rows.every(row => row.slice(0,15).every((t,c) => t?.color === row[0]?.color && t?.number === c+1))) return [];
  const result = [];
  rows.forEach((row,r) => row.forEach((tile,c) => {
    if (tile) return;
    rows.forEach((source,sr) => source.forEach((t,sc) => {
      if (!t || sc === 0) return;
      const left = row[c-1], right = row[c+1];
      if ((left && left.color === t.color && left.number+1 === t.number) || (right && right.color === t.color && right.number-1 === t.number)) result.push({r,c,sr,sc,length:1});
    }));
    const end = row[c-1];
    if (end?.number !== 15) return;
    let start = c-1;
    while (start > 1 && row[start-1]?.color === end.color && row[start-1]?.number === row[start].number-1) start--;
    for (let sc = start; sc <= c-(level+2); sc++) result.push({r,c,sr:r,sc,length:c-sc});
  }));
  return result;
}
function orderedCount() {
  return state.rows.reduce((total,row) => { let c = 1; while(c < 15 && row[c]?.color === row[0].color && row[c]?.number === c+1) c++; return total+c-1; },0);
}
function matching(m) { return selected && m.sr === selected.r && m.sc === selected.c; }
function save() { try { localStorage.setItem(key,JSON.stringify(state)); } catch {} }
function render(message) {
  const legal = allMoves(), count = orderedCount();
  $('moves').textContent = state.moves;
  $('progress').innerHTML = `${count}<span>/70</span>`;
  $('undo').disabled = !state.history.length;
  $('level').value = state.level;
  $('board').replaceChildren();
  state.rows.forEach((row,r) => row.forEach((tile,c) => {
    const button = document.createElement('button');
    button.className = 'tile' + (!tile ? ' gap' : '') + (c===0 ? ' anchor' : '');
    if (tile) {
      button.dataset.color = tile.color;
      button.innerHTML = `${tile.number}<small aria-hidden="true">${symbols[tile.color]}</small>`;
      button.setAttribute('aria-label',`${names[tile.color]} ${tile.number}, row ${r+1}, ${c===0 ? 'fixed starting tile' : `column ${c}`}`);
      if (c===0) button.disabled = true;
      if (c>0 && c<15 && row.slice(1,c+1).every((t,i)=>t?.color===row[0].color && t?.number===i+2)) button.classList.add('ordered');
    } else button.setAttribute('aria-label',`Gap, row ${r+1}, column ${c}`);
    if (selected?.r===r && selected?.c===c) button.classList.add('selected');
    if (!tile && legal.some(m => matching(m) && m.r===r && m.c===c)) button.classList.add('destination');
    if (hinted && ((hinted.sr===r && hinted.sc===c)||(hinted.r===r && hinted.c===c))) button.classList.add('hinted');
    button.addEventListener('click',()=>choose(r,c));
    $('board').append(button);
  }));
  const loop = state.seen.slice(0,-1).includes(signature(state.rows));
  $('status').textContent = message || (count===70 ? 'Beautifully done. All five colors are in order! Start a new game whenever you’re ready.' : !legal.length ? 'No legal moves remain. Undo a move or try a fresh deal.' : loop ? 'You’ve returned to an earlier position. Try a different move to break the loop.' : selected ? 'Choose an outlined gap, or select another tile.' : 'Select a tile to see where it can go.');
}
function choose(r,c) {
  hinted = null;
  if (c===0 || orderedCount()===70) return;
  if (state.rows[r][c]) {
    selected = selected?.r===r && selected?.c===c ? null : {r,c};
    const canMove = allMoves().some(matching);
    render(selected && !canMove ? 'This tile has no legal destination. Try another tile.' : undefined);
    return;
  }
  const move = allMoves().find(m=>matching(m) && m.r===r && m.c===c);
  if (!move) { render('Select a tile first, then choose one of its outlined gaps.'); return; }
  state.history.push({rows:clone(state.rows),moves:state.moves,seenLength:state.seen.length});
  if(move.length===1) { state.rows[r][c]=state.rows[move.sr][move.sc]; state.rows[move.sr][move.sc]=null; }
  else { for(let i=c;i>move.sc;i--) state.rows[r][i]=state.rows[r][i-1]; state.rows[r][move.sc]=null; }
  state.moves++; state.seen.push(signature(state.rows)); selected=null; save(); render();
}
$('undo').addEventListener('click',()=>{const previous=state.history.pop();if(!previous)return;state.rows=previous.rows;state.moves=previous.moves;state.seen.length=previous.seenLength;selected=null;hinted=null;save();render('Move undone. Find a new way forward.');});
$('hint').addEventListener('click',()=>{const moves=allMoves();if(!moves.length)return;const move=moves.find(m=>m.length===1 && m.sc!==m.c && m.r!==m.sr) || moves[0];selected={r:move.sr,c:move.sc};hinted=move;render(move.length>1 ? `Try shifting this ${move.length}-tile run into the highlighted gap.` : 'Try moving the highlighted tile into the outlined gap.');});
let pendingLevel=null;
function requestDeal(level) { pendingLevel=level; if(state.moves===0){deal(level);return;} $('new-dialog').showModal(); }
$('new').addEventListener('click',()=>requestDeal(state.level));
$('level').addEventListener('change',e=>{const level=Number(e.target.value);e.target.value=state.level;requestDeal(level);});
$('cancel-new').addEventListener('click',()=>$('new-dialog').close());
$('confirm-new').addEventListener('click',()=>{$('new-dialog').close();deal(pendingLevel);});
$('rules-button').addEventListener('click',()=>$('rules').showModal());
$('rules').querySelector('.close').addEventListener('click',()=>$('rules').close());
$('theme').addEventListener('change',e=>{document.documentElement.dataset.theme=e.target.value;try{localStorage.setItem('five-fifteen-theme',e.target.value);}catch{}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){selected=null;hinted=null;render();}});
try { const theme=localStorage.getItem('five-fifteen-theme');if(['light','dark','solarized','dracula'].includes(theme)){document.documentElement.dataset.theme=theme;$('theme').value=theme;} const saved=JSON.parse(localStorage.getItem(key));if(saved && [1,2,3].includes(saved.level) && saved.rows?.length===5 && saved.rows.every(row=>row.length===16) && Array.isArray(saved.history) && Array.isArray(saved.seen))state=saved; } catch {}
if(state)render();else deal();
