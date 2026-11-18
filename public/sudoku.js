/* Sudoku-motor: generator med entydig løsning, løser og sværhedsbedømmelse ud fra løseteknikker.
   Ren JavaScript uden afhængigheder; virker i browseren (window.Sudoku) og i Node (module.exports).
   Dagens opgave laves ud fra datoen med en fast tilfældighedsgenerator, så alle får den samme. */
(function(root){
  'use strict';
  const LEVELS = ['let', 'mellem', 'svaer', 'ekspert'];
  const LEVEL_NAMES = {let: 'Let', mellem: 'Mellem', svaer: 'Svær', ekspert: 'Ekspert'};
  // Dagens niveau pr. ugedag (0 = søndag)
  const DAILY_LEVEL = ['ekspert', 'let', 'mellem', 'svaer', 'let', 'mellem', 'svaer'];

  /* ---------- enheder ---------- */
  const ROW = i => Math.floor(i / 9), COL = i => i % 9, BOX = i => Math.floor(ROW(i) / 3) * 3 + Math.floor(COL(i) / 3);
  const UNITS = [];
  for(let r = 0; r < 9; r++) UNITS.push(Array.from({length: 9}, (_, c) => r * 9 + c));
  for(let c = 0; c < 9; c++) UNITS.push(Array.from({length: 9}, (_, r) => r * 9 + c));
  for(let b = 0; b < 9; b++){ const br = Math.floor(b / 3) * 3, bc = (b % 3) * 3; const u = []; for(let r = 0; r < 3; r++) for(let c = 0; c < 3; c++) u.push((br + r) * 9 + bc + c); UNITS.push(u); }
  const PEERS = Array.from({length: 81}, (_, i) => {
    const s = new Set(); UNITS.forEach(u => { if(u.includes(i)) u.forEach(j => { if(j !== i) s.add(j); }); }); return [...s];
  });
  const UNITS_OF = Array.from({length: 81}, (_, i) => [ROW(i), 9 + COL(i), 18 + BOX(i)]);
  const ALL = 0x3FE;   // bit 1..9
  const bit = d => 1 << d;
  const popcount = m => { let c = 0; while(m){ m &= m - 1; c++; } return c; };
  const digitsOf = m => { const r = []; for(let d = 1; d <= 9; d++) if(m & bit(d)) r.push(d); return r; };

  /* ---------- tilfældighed ---------- */
  function hashString(s){ let h = 1779033703 ^ s.length; for(let i = 0; i < s.length; i++){ h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return (h >>> 0) || 1; }
  function rng(seed){
    let a = typeof seed === 'string' ? hashString(seed) : (seed >>> 0) || 1;
    return function(){ a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function shuffle(arr, rand){ for(let i = arr.length - 1; i > 0; i--){ const j = Math.floor(rand() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }

  /* ---------- løser (antal løsninger, højst `limit`) ---------- */
  function countSolutions(grid, limit){
    limit = limit || 2;
    const g = grid.slice(), rows = new Array(9).fill(0), cols = new Array(9).fill(0), boxes = new Array(9).fill(0);
    for(let i = 0; i < 81; i++){ const d = g[i]; if(d){ const b = bit(d); if((rows[ROW(i)] | cols[COL(i)] | boxes[BOX(i)]) & b) return 0; rows[ROW(i)] |= b; cols[COL(i)] |= b; boxes[BOX(i)] |= b; } }
    let count = 0, solution = null;
    (function search(){
      if(count >= limit) return;
      let best = -1, bestMask = 0, bestN = 10;
      for(let i = 0; i < 81; i++){
        if(g[i]) continue;
        const m = ALL & ~(rows[ROW(i)] | cols[COL(i)] | boxes[BOX(i)]);
        const n = popcount(m);
        if(n === 0) return;
        if(n < bestN){ best = i; bestMask = m; bestN = n; if(n === 1) break; }
      }
      if(best < 0){ count++; if(!solution) solution = g.slice(); return; }
      const r = ROW(best), c = COL(best), b = BOX(best);
      for(let d = 1; d <= 9; d++){
        if(!(bestMask & bit(d))) continue;
        g[best] = d; rows[r] |= bit(d); cols[c] |= bit(d); boxes[b] |= bit(d);
        search();
        g[best] = 0; rows[r] &= ~bit(d); cols[c] &= ~bit(d); boxes[b] &= ~bit(d);
        if(count >= limit) return;
      }
    })();
    return limit === 1 && solution ? {count, solution} : count;
  }
  function solve(grid){ const r = countSolutions(grid, 1); return r && r.solution ? r.solution : null; }

  /* ---------- fuld løsning ---------- */
  function fullGrid(rand){
    const g = new Array(81).fill(0), rows = new Array(9).fill(0), cols = new Array(9).fill(0), boxes = new Array(9).fill(0);
    (function fill(i){
      if(i === 81) return true;
      const m = ALL & ~(rows[ROW(i)] | cols[COL(i)] | boxes[BOX(i)]);
      for(const d of shuffle(digitsOf(m), rand)){
        g[i] = d; rows[ROW(i)] |= bit(d); cols[COL(i)] |= bit(d); boxes[BOX(i)] |= bit(d);
        if(fill(i + 1)) return true;
        g[i] = 0; rows[ROW(i)] &= ~bit(d); cols[COL(i)] &= ~bit(d); boxes[BOX(i)] &= ~bit(d);
      }
      return false;
    })(0);
    return g;
  }

  /* ---------- logisk løser: hvilke teknikker kræver opgaven? ----------
     Niveau 1: nøgne og skjulte singler. Niveau 2: låste kandidater, nøgne og skjulte par.
     Niveau 3: nøgne tripler og X-wing. Niveau 4: kan ikke løses med disse teknikker. */
  function grade(puzzle){
    const g = puzzle.slice(), cand = new Array(81).fill(0);
    for(let i = 0; i < 81; i++) if(!g[i]){ let m = ALL; for(const p of PEERS[i]) if(g[p]) m &= ~bit(g[p]); cand[i] = m; }
    let hardest = 0;
    const place = (i, d) => { g[i] = d; cand[i] = 0; for(const p of PEERS[i]) cand[p] &= ~bit(d); };
    const solved = () => g.every(v => v);
    const steps = [
      [1, function nakedSingle(){ for(let i = 0; i < 81; i++) if(!g[i] && popcount(cand[i]) === 1){ place(i, digitsOf(cand[i])[0]); return true; } return false; }],
      [1, function hiddenSingle(){ for(const u of UNITS) for(let d = 1; d <= 9; d++){ let where = -1, n = 0; for(const i of u){ if(!g[i] && (cand[i] & bit(d))){ n++; where = i; } } if(n === 1){ place(where, d); return true; } } return false; }],
      [2, function lockedCandidates(){
        let changed = false;
        for(let b = 0; b < 9; b++){ const box = UNITS[18 + b];
          for(let d = 1; d <= 9; d++){ const cells = box.filter(i => !g[i] && (cand[i] & bit(d))); if(cells.length < 2) continue;
            const rs = new Set(cells.map(ROW)), cs = new Set(cells.map(COL));
            if(rs.size === 1){ for(const i of UNITS[[...rs][0]]) if(BOX(i) !== b && (cand[i] & bit(d))){ cand[i] &= ~bit(d); changed = true; } }
            if(cs.size === 1){ for(const i of UNITS[9 + [...cs][0]]) if(BOX(i) !== b && (cand[i] & bit(d))){ cand[i] &= ~bit(d); changed = true; } }
          } }
        for(let li = 0; li < 18; li++){ const line = UNITS[li];
          for(let d = 1; d <= 9; d++){ const cells = line.filter(i => !g[i] && (cand[i] & bit(d))); if(cells.length < 2) continue;
            const bs = new Set(cells.map(BOX)); if(bs.size !== 1) continue;
            for(const i of UNITS[18 + [...bs][0]]) if(!line.includes(i) && (cand[i] & bit(d))){ cand[i] &= ~bit(d); changed = true; }
          } }
        return changed;
      }],
      [2, function nakedPair(){
        let changed = false;
        for(const u of UNITS){ const cells = u.filter(i => !g[i] && popcount(cand[i]) === 2);
          for(let a = 0; a < cells.length; a++) for(let b = a + 1; b < cells.length; b++){ if(cand[cells[a]] !== cand[cells[b]]) continue; const m = cand[cells[a]];
            for(const i of u) if(i !== cells[a] && i !== cells[b] && !g[i] && (cand[i] & m)){ cand[i] &= ~m; changed = true; } } }
        return changed;
      }],
      [2, function hiddenPair(){
        let changed = false;
        for(const u of UNITS){ const pos = {}; for(let d = 1; d <= 9; d++){ const cs = u.filter(i => !g[i] && (cand[i] & bit(d))); if(cs.length === 2) pos[d] = cs; }
          const ds = Object.keys(pos).map(Number);
          for(let a = 0; a < ds.length; a++) for(let b = a + 1; b < ds.length; b++){ const p = pos[ds[a]], q = pos[ds[b]]; if(p[0] !== q[0] || p[1] !== q[1]) continue;
            const m = bit(ds[a]) | bit(ds[b]); for(const i of p) if(cand[i] & ~m){ cand[i] &= m; changed = true; } } }
        return changed;
      }],
      [3, function nakedTriple(){
        let changed = false;
        for(const u of UNITS){ const cells = u.filter(i => !g[i] && popcount(cand[i]) >= 2 && popcount(cand[i]) <= 3);
          for(let a = 0; a < cells.length; a++) for(let b = a + 1; b < cells.length; b++) for(let c = b + 1; c < cells.length; c++){
            const m = cand[cells[a]] | cand[cells[b]] | cand[cells[c]]; if(popcount(m) !== 3) continue;
            for(const i of u) if(i !== cells[a] && i !== cells[b] && i !== cells[c] && !g[i] && (cand[i] & m)){ cand[i] &= ~m; changed = true; } } }
        return changed;
      }],
      [3, function xWing(){
        let changed = false;
        for(const dir of [0, 9]){ // 0: rækker som basis, 9: kolonner som basis
          for(let d = 1; d <= 9; d++){ const lines = [];
            for(let k = 0; k < 9; k++){ const cs = UNITS[dir + k].filter(i => !g[i] && (cand[i] & bit(d))); if(cs.length === 2) lines.push({k, at: cs.map(dir === 0 ? COL : ROW)}); }
            for(let a = 0; a < lines.length; a++) for(let b = a + 1; b < lines.length; b++){ const A = lines[a], B = lines[b]; if(A.at[0] !== B.at[0] || A.at[1] !== B.at[1]) continue;
              for(const x of A.at) for(const i of UNITS[(dir === 0 ? 9 : 0) + x]){ const line = dir === 0 ? ROW(i) : COL(i); if(line !== A.k && line !== B.k && !g[i] && (cand[i] & bit(d))){ cand[i] &= ~bit(d); changed = true; } } }
          } }
        return changed;
      }],
    ];
    let guard = 0;
    while(!solved() && guard++ < 1000){
      let progressed = false;
      for(const [tier, fn] of steps){ if(fn()){ hardest = Math.max(hardest, tier); progressed = true; break; } }
      if(!progressed) return {tier: 4, solved: false};
    }
    return {tier: Math.max(hardest, 1), solved: true};
  }
  function levelOf(puzzle){
    const clues = puzzle.filter(Boolean).length, gr = grade(puzzle);
    if(gr.tier === 1) return clues >= 34 ? 'let' : 'mellem';
    if(gr.tier === 2) return 'svaer';
    return 'ekspert';
  }

  /* ---------- generator ---------- */
  // Fjerner tal i symmetriske par, så længe løsningen er entydig, og stopper ved målet for antal givne tal
  function carve(solution, rand, minClues){
    const p = solution.slice();
    const order = shuffle(Array.from({length: 41}, (_, i) => i), rand);
    for(const i of order){
      const j = 80 - i, pair = i === j ? [i] : [i, j];
      if(p.filter(Boolean).length - pair.length < minClues) continue;
      const keep = pair.map(k => p[k]); pair.forEach(k => { p[k] = 0; });
      if(countSolutions(p, 2) !== 1) pair.forEach((k, n) => { p[k] = keep[n]; });
    }
    return p;
  }
  const TARGET = {let: 36, mellem: 28, svaer: 22, ekspert: 17};
  function generate(level, seed){
    if(!LEVELS.includes(level)) throw new Error('Ukendt niveau: ' + level);
    const rand = rng(seed == null ? Math.floor(Math.random() * 4294967296) : seed);
    for(let attempt = 1; attempt <= 400; attempt++){
      const solution = fullGrid(rand);
      const puzzle = carve(solution, rand, TARGET[level]);
      if(levelOf(puzzle) === level) return {puzzle, solution, level, attempts: attempt};
    }
    throw new Error('Kunne ikke lave en opgave på niveau ' + level);
  }

  /* ---------- dagens opgave ---------- */
  function todayKey(date){
    // Dansk dato som ÅÅÅÅ-MM-DD
    try{ return (date || new Date()).toLocaleDateString('sv-SE', {timeZone: 'Europe/Copenhagen'}); }
    catch(e){ const d = date || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  }
  function dailyLevel(key){ const [y, m, d] = key.split('-').map(Number); return DAILY_LEVEL[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]; }
  function daily(key){ key = key || todayKey(); const level = dailyLevel(key); return Object.assign(generate(level, 'himmerland-sudoku-' + key), {dato: key}); }

  const api = {LEVELS, LEVEL_NAMES, DAILY_LEVEL, PEERS, ROW, COL, BOX, rng, countSolutions, solve, grade, levelOf, generate, todayKey, dailyLevel, daily};
  if(typeof module !== 'undefined' && module.exports) module.exports = api; else root.Sudoku = api;
})(typeof self !== 'undefined' ? self : this);
