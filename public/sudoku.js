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
  // version 1: niveau efter den sværeste teknik (de første baner). Version 2: Svær og Ekspert efter
  // sværhedsprofilen (antal svære øjeblikke, hvor tidligt, prøv-og-se-dybde). Let og Mellem er ens i begge.
  const VERSION = 2;
  function accepts(level, puzzle, solution, version){
    if(version === 1 || level === 'let' || level === 'mellem') return levelOf(puzzle) === level;
    const tier = grade(puzzle).tier;                       // hurtigt forfilter før den dyrere profil
    if(level === 'svaer' && tier !== 2) return false;
    if(level === 'ekspert' && tier < 2) return false;
    return levelOf2(puzzle, solution) === level;
  }
  function generate(level, seed, version){
    if(!LEVELS.includes(level)) throw new Error('Ukendt niveau: ' + level);
    version = version || VERSION;
    const rand = rng(seed == null ? Math.floor(Math.random() * 4294967296) : seed);
    for(let attempt = 1; attempt <= 1500; attempt++){
      const solution = fullGrid(rand);
      const puzzle = carve(solution, rand, TARGET[level]);
      if(accepts(level, puzzle, solution, version)) return {puzzle, solution, level, attempts: attempt, version};
    }
    throw new Error('Kunne ikke lave en opgave på niveau ' + level);
  }

  /* ---------- forklarende hint i tre trin ----------
     Finder det næste logiske træk ud fra de rigtige tal på pladen og forklarer det:
     trin 1 = hvor man skal kigge, trin 2 = hvorfor, trin 3 = tallet sættes.
     Hvert trin har area (felter der fremhæves som område) og focus (felter der peges på). */
  const BOX_NAMES = ['øverst til venstre', 'øverst i midten', 'øverst til højre', 'i midten til venstre', 'i midten', 'i midten til højre', 'nederst til venstre', 'nederst i midten', 'nederst til højre'];
  const unitName = u => u < 9 ? `række ${u + 1}` : u < 18 ? `kolonne ${u - 8}` : `boksen ${BOX_NAMES[u - 18]}`;
  const cellName = i => `feltet i række ${ROW(i) + 1}, kolonne ${COL(i) + 1}`;
  const andList = a => a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' og ' + a[a.length - 1];
  const digitList = m => andList(digitsOf(m).map(String));
  const orList = m => { const a = digitsOf(m).map(String); return a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' eller ' + a[a.length - 1]; };
  const TECH = {locked: 'låste kandidater', nakedPair: 'et nøgent par', hiddenPair: 'et skjult par', nakedTriple: 'en nøgen trippel', xwing: 'en X-wing'};

  function candidatesOf(g){
    const cand = new Array(81).fill(0);
    for(let i = 0; i < 81; i++) if(!g[i]){ let m = ALL; for(const p of PEERS[i]) if(g[p]) m &= ~bit(g[p]); cand[i] = m; }
    return cand;
  }
  // Alle singler: skjult single i en boks/række/kolonne, eller nøgen single i et felt
  function findSingles(g, cand){
    const out = [];
    for(const u of [18, 19, 20, 21, 22, 23, 24, 25, 26, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]){
      for(let d = 1; d <= 9; d++){
        if(UNITS[u].some(i => g[i] === d)) continue;
        const cells = UNITS[u].filter(i => !g[i] && (cand[i] & bit(d)));
        if(cells.length === 1) out.push({type: 'skjult', unit: u, d, i: cells[0]});
      }
    }
    for(let i = 0; i < 81; i++) if(!g[i] && popcount(cand[i]) === 1) out.push({type: 'nøgen', i, d: digitsOf(cand[i])[0]});
    return out;
  }
  // Fjernelser med kandidat-teknikker (simpleste først). Hver: {tech, area, cells, elim: [[felt, tal]], text}
  function findEliminations(g, cand){
    const out = [];
    const has = (i, d) => !g[i] && (cand[i] & bit(d));
    const add = (tech, area, cells, elim, text) => { if(elim.length) out.push({tech, area, cells, elim, text}); };
    // låste kandidater: boks → linje
    for(let b = 0; b < 9; b++){ const box = UNITS[18 + b];
      for(let d = 1; d <= 9; d++){ const cells = box.filter(i => has(i, d)); if(cells.length < 2) continue;
        for(const [same, lineOf, lu] of [[new Set(cells.map(ROW)), ROW, 0], [new Set(cells.map(COL)), COL, 9]]){
          if(same.size !== 1) continue; const line = lu + [...same][0];
          const elim = UNITS[line].filter(i => BOX(i) !== b && has(i, d)).map(i => [i, d]);
          add('locked', box, cells, elim, `I ${unitName(18 + b)} kan ${d} kun stå i ${unitName(line)}. Derfor kan ${d} ikke stå andre steder i ${unitName(line)}.`);
        } } }
    // låste kandidater: linje → boks
    for(let li = 0; li < 18; li++){ const line = UNITS[li];
      for(let d = 1; d <= 9; d++){ const cells = line.filter(i => has(i, d)); if(cells.length < 2) continue;
        const bs = new Set(cells.map(BOX)); if(bs.size !== 1) continue; const b = 18 + [...bs][0];
        const elim = UNITS[b].filter(i => !line.includes(i) && has(i, d)).map(i => [i, d]);
        add('locked', line, cells, elim, `I ${unitName(li)} kan ${d} kun stå inde i ${unitName(b)}. Derfor kan ${d} ikke stå andre steder i den boks.`);
      } }
    // nøgent par
    for(let u = 0; u < 27; u++){ const cells = UNITS[u].filter(i => !g[i] && popcount(cand[i]) === 2);
      for(let a = 0; a < cells.length; a++) for(let b = a + 1; b < cells.length; b++){ if(cand[cells[a]] !== cand[cells[b]]) continue; const m = cand[cells[a]];
        const elim = []; UNITS[u].forEach(i => { if(i !== cells[a] && i !== cells[b] && !g[i]) digitsOf(cand[i] & m).forEach(d => elim.push([i, d])); });
        add('nakedPair', UNITS[u], [cells[a], cells[b]], elim, `To felter i ${unitName(u)} kan begge kun være ${orList(m)}. Så må de to tal stå netop dér, og de kan ikke stå andre steder i ${unitName(u)}.`);
      } }
    // skjult par
    for(let u = 0; u < 27; u++){ const pos = {};
      for(let d = 1; d <= 9; d++){ if(UNITS[u].some(i => g[i] === d)) continue; const cs = UNITS[u].filter(i => has(i, d)); if(cs.length === 2) pos[d] = cs; }
      const ds = Object.keys(pos).map(Number);
      for(let a = 0; a < ds.length; a++) for(let b = a + 1; b < ds.length; b++){ const p = pos[ds[a]], q = pos[ds[b]]; if(p[0] !== q[0] || p[1] !== q[1]) continue;
        const m = bit(ds[a]) | bit(ds[b]); const elim = []; p.forEach(i => digitsOf(cand[i] & ~m).forEach(d => elim.push([i, d])));
        add('hiddenPair', UNITS[u], p, elim, `I ${unitName(u)} kan ${ds[a]} og ${ds[b]} kun stå i de samme to felter. Så må de to felter være ${ds[a]} og ${ds[b]}, og alle andre kandidater i dem kan streges.`);
      } }
    // nøgen trippel
    for(let u = 0; u < 27; u++){ const cells = UNITS[u].filter(i => !g[i] && popcount(cand[i]) >= 2 && popcount(cand[i]) <= 3);
      for(let a = 0; a < cells.length; a++) for(let b = a + 1; b < cells.length; b++) for(let c = b + 1; c < cells.length; c++){
        const m = cand[cells[a]] | cand[cells[b]] | cand[cells[c]]; if(popcount(m) !== 3) continue; const trio = [cells[a], cells[b], cells[c]];
        const elim = []; UNITS[u].forEach(i => { if(!trio.includes(i) && !g[i]) digitsOf(cand[i] & m).forEach(d => elim.push([i, d])); });
        add('nakedTriple', UNITS[u], trio, elim, `Tre felter i ${unitName(u)} kan tilsammen kun være ${digitList(m)}. De tre tal skal altså stå i de tre felter og kan ikke stå andre steder i ${unitName(u)}.`);
      } }
    // X-wing
    for(const dir of [0, 9]){
      for(let d = 1; d <= 9; d++){ const lines = [];
        for(let k = 0; k < 9; k++){ const cs = UNITS[dir + k].filter(i => has(i, d)); if(cs.length === 2) lines.push({k, cs, at: cs.map(dir === 0 ? COL : ROW)}); }
        for(let a = 0; a < lines.length; a++) for(let b = a + 1; b < lines.length; b++){ const A = lines[a], B = lines[b]; if(A.at[0] !== B.at[0] || A.at[1] !== B.at[1]) continue;
          const other = dir === 0 ? 9 : 0, elim = [];
          A.at.forEach(x => UNITS[other + x].forEach(i => { const ln = dir === 0 ? ROW(i) : COL(i); if(ln !== A.k && ln !== B.k && has(i, d)) elim.push([i, d]); }));
          add('xwing', UNITS[dir + A.k].concat(UNITS[dir + B.k]), A.cs.concat(B.cs), elim,
            `I ${unitName(dir + A.k)} og ${unitName(dir + B.k)} kan ${d} kun stå i ${unitName(other + A.at[0])} og ${unitName(other + A.at[1])}. Uanset hvordan de placeres, optager de begge ${dir === 0 ? 'kolonner' : 'rækker'}, så ${d} kan ikke stå andre steder i dem.`);
        } } }
    return out;
  }
  // Hvorfor kan d kun stå i felt i i enheden u? Peger på de tal d, der spærrer de andre tomme felter
  function blockersFor(g, u, d, i){
    const others = UNITS[u].filter(j => j !== i && !g[j]);
    const blockers = [], names = [];
    others.forEach(j => {
      if(blockers.some(p => PEERS[j].includes(p))) return;
      const p = PEERS[j].find(k => g[k] === d); if(p === undefined) return;
      blockers.push(p);
      const lu = ROW(p) === ROW(j) && u >= 9 ? ROW(p) : COL(p) === COL(j) && (u < 9 || u >= 18) ? 9 + COL(p) : 18 + BOX(p);
      const nm = unitName(lu); if(!names.includes(nm)) names.push(nm);
    });
    return {blockers, names, filled: UNITS[u].filter(j => j !== i && g[j]).length};
  }
  function singleWhy(g, s){
    if(s.type === 'nøgen'){
      const r = UNITS[ROW(s.i)].map(j => g[j]).filter(Boolean), c = UNITS[9 + COL(s.i)].map(j => g[j]).filter(v => v && !r.includes(v)),
        b = UNITS[18 + BOX(s.i)].map(j => g[j]).filter(v => v && !r.includes(v) && !c.includes(v));
      const parts = [];
      if(r.length) parts.push(`rækken har ${andList(r.sort().map(String))}`);
      if(c.length) parts.push(`kolonnen har ${parts.length ? 'også ' : ''}${andList(c.sort().map(String))}`);
      if(b.length) parts.push(`boksen har ${parts.length ? 'også ' : ''}${andList(b.sort().map(String))}`);
      return {text: `${parts.length ? andList(parts).replace(/^./, x => x.toUpperCase()) + '. ' : ''}Det eneste tal fra 1 til 9, der mangler, er ${s.d}.`, focus: [s.i], marks: []};
    }
    const bl = blockersFor(g, s.unit, s.d, s.i);
    const txt = bl.names.length
      ? `${s.d} står allerede i ${andList(bl.names)} (markeret), så ${s.d} kan ikke stå i de andre tomme felter. ${bl.filled ? 'Resten af felterne er udfyldt. ' : ''}Der er kun ét sted tilbage til ${s.d} i ${unitName(s.unit)}.`
      : `Der er kun ét ledigt felt tilbage til ${s.d} i ${unitName(s.unit)}.`;
    return {text: txt, focus: [s.i], marks: bl.blockers};
  }
  function explain(values, solution, prefer){
    const g = values.map((v, i) => v === solution[i] ? v : 0);
    const pick = list => list.find(s => s.i === prefer) || list[0];
    // 1) en fejl på pladen rettes først
    const wrongs = []; values.forEach((v, i) => { if(v && v !== solution[i]) wrongs.push(i); });
    if(wrongs.length){
      const w = wrongs.includes(prefer) ? prefer : wrongs[0];
      return {kind: 'fejl', cell: w, digit: solution[w], steps: [
        {text: `Der er et forkert tal på pladen. Kig i ${unitName(ROW(w))}.`, area: UNITS[ROW(w)], focus: []},
        {text: `Tallet ${values[w]} i ${cellName(w)} er forkert – det passer ikke med løsningen. Tjek, om det står to gange, eller om du har taget fejl af et andet felt.`, area: UNITS[ROW(w)], focus: [w]},
        {text: `Der skal stå ${solution[w]} i ${cellName(w)}. Fejlen er rettet.`, area: [], focus: [w]},
      ]};
    }
    const cand = candidatesOf(g);
    // 2) en single direkte ud fra tallene på pladen
    const singles = findSingles(g, cand);
    if(singles.length){
      const s = pick(singles), why = singleWhy(g, s);
      const look = s.type === 'nøgen'
        ? {text: `Kig på ${cellName(s.i)}. Hvilke tal mangler i dens række, kolonne og boks?`, area: PEERS[s.i].concat([s.i]), focus: [s.i]}
        : {text: `Kig på ${unitName(s.unit)}. Hvor kan ${s.d} stå?`, area: UNITS[s.unit], focus: []};
      return {kind: s.type === 'nøgen' ? 'nøgen single' : 'skjult single', cell: s.i, digit: s.d, steps: [
        look,
        {text: why.text, area: look.area, focus: why.focus, marks: why.marks},
        {text: `Derfor skal der stå ${s.d} i ${cellName(s.i)}.`, area: [], focus: [s.i]},
      ]};
    }
    // 3) kandidat-teknikker, indtil en single dukker op
    const work = cand.slice(), used = [];
    for(let round = 0; round < 40; round++){
      const elims = findEliminations(g, work); if(!elims.length) break;
      let chosen = null, single = null;
      for(const e of elims){
        const trial = work.slice(); e.elim.forEach(([i, d]) => { trial[i] &= ~bit(d); });
        const ss = findSingles(g, trial); if(ss.length){ chosen = e; single = pick(ss); break; }
      }
      if(!chosen){ elims[0].elim.forEach(([i, d]) => { work[i] &= ~bit(d); }); used.push(elims[0]); continue; }
      chosen.elim.forEach(([i, d]) => { work[i] &= ~bit(d); });
      const before = used.length ? ` (Først skal der streges ${used.length} kandidat${used.length > 1 ? 'er' : ''} med ${andList([...new Set(used.map(u => TECH[u.tech]))])} – derefter:)` : '';
      // Det streg, der gør udslaget: kandidaten fjernet fra målfeltet, eller tallet fjernet fra enheden
      const key = single.type === 'nøgen' ? chosen.elim.filter(([i]) => i === single.i) : chosen.elim.filter(([i, d]) => d === single.d && UNITS[single.unit].includes(i));
      const struck = key.length ? (single.type === 'nøgen'
        ? `Dermed streges ${andList(key.map(([, d]) => String(d)))} i ${cellName(single.i)}, `
        : `Dermed streges ${single.d} i ${key.length === 1 ? cellName(key[0][0]) : 'felterne i ' + andList(key.map(([i]) => cellName(i).replace('feltet i ', '')))}, `) : '';
      const result = single.type === 'nøgen'
        ? `${struck ? struck + 'så det' : `Så kan ${cellName(single.i)}`} nu kun ${struck ? 'kan ' : ''}være ${single.d}.`
        : `${struck ? struck + 'så' : 'Så kan'} ${single.d} ${struck ? 'kan ' : ''}nu kun stå ét sted i ${unitName(single.unit)}.`;
      return {kind: TECH[chosen.tech], cell: single.i, digit: single.d, steps: [
        {text: `Her er der ingen tal, der kan sættes direkte – du skal bruge kandidater (små hjælpetal). Kig efter ${TECH[chosen.tech]} i det markerede område.${before}`, area: chosen.area, focus: []},
        {text: `${chosen.text} ${result}`, area: chosen.area, focus: chosen.cells.concat([single.i])},
        {text: `Derfor skal der stå ${single.d} i ${cellName(single.i)}.`, area: [], focus: [single.i]},
      ]};
    }
    // 4) prøv-og-se: et tovalgsfelt, hvor det ene tal hurtigt kører fast
    const tr = bestTrial(g, work);
    if(tr && tr.right === solution[tr.i]){
      const efter = tr.depth === 0 ? 'med det samme' : `efter ${tr.depth} træk med "kun ét sted"`;
      return {kind: 'prøv-og-se', cell: tr.i, digit: tr.right, steps: [
        {text: `Her kommer du ikke videre med de almindelige teknikker. Kig på felterne, der kun kan have to tal – prøv det ene og se, om det går galt.`, area: UNITS[18 + BOX(tr.i)], focus: []},
        {text: `${cap1(cellName(tr.i))} kan kun være ${tr.wrong} eller ${tr.right}. Sætter du ${tr.wrong}, går det galt ${efter}: et felt ender uden mulige tal, eller et tal kan ikke stå nogen steder i en række, kolonne eller kasse. Derfor kan det ikke være ${tr.wrong}.`, area: UNITS[18 + BOX(tr.i)], focus: [tr.i]},
        {text: `Der skal stå ${tr.right} i ${cellName(tr.i)}.`, area: [], focus: [tr.i]},
      ]};
    }
    // 5) kræver en teknik, hintet ikke kan forklare: peg på feltet med færrest kandidater
    let best = -1, bc = 10;
    for(let i = 0; i < 81; i++) if(!g[i] && popcount(work[i]) < bc){ bc = popcount(work[i]); best = i; }
    if(best < 0) return null;
    return {kind: 'avanceret', cell: best, digit: solution[best], steps: [
      {text: `Her skal der en avanceret teknik til (fx kæder), som hintet ikke kan forklare kort. Kig på felterne med færrest kandidater.`, area: UNITS[18 + BOX(best)], focus: []},
      {text: `${cap1(cellName(best))} kan kun være ${orList(work[best])}. Prøv i tankerne, hvad der sker med hvert af tallene – det ene fører til en modstrid.`, area: UNITS[18 + BOX(best)], focus: [best]},
      {text: `Der skal stå ${solution[best]} i ${cellName(best)}.`, area: [], focus: [best]},
    ]};
  }
  const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);

  /* ---------- dagens opgave ---------- */
  function todayKey(date){
    // Dansk dato som ÅÅÅÅ-MM-DD
    try{ return (date || new Date()).toLocaleDateString('sv-SE', {timeZone: 'Europe/Copenhagen'}); }
    catch(e){ const d = date || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  }
  function dailyLevel(key){ const [y, m, d] = key.split('-').map(Number); return DAILY_LEVEL[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]; }
  // Dagens baner før skiftet til version 2 laves med version 1, så historik og ranglister passer
  const V2_FROM = '2026-11-23';
  const dailyVersion = key => key >= V2_FROM ? 2 : 1;
  function daily(key){ key = key || todayKey(); const level = dailyLevel(key); return Object.assign(generate(level, 'himmerland-sudoku-' + key, dailyVersion(key)), {dato: key}); }

  /* ---------- hvor svært var det tal? ----------
     Ud fra de rigtige tal på pladen (uden det nye tal): kan feltet nås med singler alene – også i flere
     led? Så er det 0. Ellers bruges de simpleste kandidat-teknikker én ad gangen, og den sværeste, der
     skulle til, før feltet kunne findes, giver niveauet: 1 låste kandidater, 2 par, 3 trippel/X-wing,
     4 kan ikke nås med de teknikker (avanceret). */
  const TECH_TIER = {locked: 1, nakedPair: 2, hiddenPair: 2, nakedTriple: 3, xwing: 3};
  function hardness(values, solution, target){
    const g = values.map((v, i) => v && v === solution[i] ? v : 0); g[target] = 0;
    const cand = candidatesOf(g);
    let tier = 0, tech = null;
    for(let guard = 0; guard < 300; guard++){
      const ss = findSingles(g, cand);
      if(ss.some(x => x.i === target)) return {tier, tech};
      if(ss.length){ const x = ss[0]; g[x.i] = x.d; cand[x.i] = 0; for(const p of PEERS[x.i]) cand[p] &= ~bit(x.d); continue; }
      const elims = findEliminations(g, cand);
      if(!elims.length) return {tier: 4, tech: 'avanceret logik'};
      const minT = Math.min(...elims.map(e => TECH_TIER[e.tech]));
      const e = elims.find(x => TECH_TIER[x.tech] === minT);
      e.elim.forEach(([i, d]) => { cand[i] &= ~bit(d); });
      if(minT > tier){ tier = minT; tech = TECH[e.tech]; }
    }
    return {tier: 4, tech: 'avanceret logik'};
  }

  /* ---------- sværhedsprofil (version 2) ----------
     Spiller banen igennem som en menneskelig spiller med noter: singler sættes, og hver gang man går
     i stå, registreres et "svært øjeblik" med den sværeste teknik, der skulle til for at komme videre,
     og hvor mange felter der stadig var tomme. Kan ingen af teknikkerne hjælpe, prøves tovalgsfelter:
     hvor mange træk tager det, før det forkerte valg kører fast? Kort prøv-og-se er lettere end langt.
     score = Σ vægt × (0,5 + tomme/51): tidlige og svære øjeblikke vejer mest. */
  const ADV_UNSOLVED = 99;
  function contradiction(h){
    const c = candidatesOf(h);
    for(let k = 0; k < 81; k++) if(!h[k] && !c[k]) return true;
    for(const u of UNITS) for(let d = 1; d <= 9; d++){
      if(u.some(k => h[k] === d)) continue;
      if(!u.some(k => !h[k] && (c[k] & bit(d)))) return true;
    }
    return false;
  }
  // Sæt d i felt i og fyld singler ud: antal træk før modstrid, eller -1 hvis ingen modstrid opstår
  function trialDepth(g, i, d){
    const h = g.slice(); h[i] = d;
    for(let n = 0; n < 81; n++){
      if(contradiction(h)) return n;
      const ss = findSingles(h, candidatesOf(h));
      if(!ss.length) return -1;
      h[ss[0].i] = ss[0].d;
    }
    return -1;
  }
  function bestTrial(g, cand){
    let best = null;
    for(let i = 0; i < 81; i++){
      if(g[i] || popcount(cand[i]) !== 2) continue;
      for(const d of digitsOf(cand[i])){
        const dep = trialDepth(g, i, d);
        if(dep >= 0 && (!best || dep < best.depth)) best = {i, wrong: d, right: digitsOf(cand[i]).find(x => x !== d), depth: dep};
      }
    }
    return best;
  }
  const advWeight = depth => depth <= 4 ? 2 : depth <= 8 ? 3 : 4.5;
  function profile(puzzle, solution){
    const g = puzzle.slice(), cand = candidatesOf(g), moments = [];
    const place = (i, d) => { g[i] = d; cand[i] = 0; for(const p of PEERS[i]) cand[p] &= ~bit(d); };
    for(let guard = 0; guard < 400 && g.some(v => !v); guard++){
      const ss = findSingles(g, cand);
      if(ss.length){ place(ss[0].i, ss[0].d); continue; }
      const empty = g.filter(v => !v).length;
      let worst = 0, progressed = false;
      for(let round = 0; round < 60; round++){
        const el = findEliminations(g, cand); if(!el.length) break;
        const minT = Math.min(...el.map(e => TECH_TIER[e.tech]));
        el.find(e => TECH_TIER[e.tech] === minT).elim.forEach(([i, d]) => { cand[i] &= ~bit(d); });
        worst = Math.max(worst, minT);
        if(findSingles(g, cand).length){ progressed = true; break; }
      }
      if(progressed){ moments.push({w: worst, empty, adv: false}); continue; }
      const t = bestTrial(g, cand);
      const depth = t ? t.depth : ADV_UNSOLVED;
      moments.push({w: advWeight(depth), empty, adv: true, depth});
      let i = t ? t.i : -1;
      if(i < 0){ let bc = 10; for(let k = 0; k < 81; k++) if(!g[k] && popcount(cand[k]) < bc){ bc = popcount(cand[k]); i = k; } }
      place(i, solution[i]);
    }
    const score = moments.reduce((a, m) => a + m.w * (0.5 + m.empty / 51), 0);
    return {moments, score: Math.round(score * 10) / 10, first: moments.length ? moments[0].empty : 0,
      adv: moments.some(m => m.adv), maxW: moments.reduce((a, m) => Math.max(a, m.w), 0)};
  }
  // Niveau efter version 2. null = ligger mellem to niveauer og bruges ikke
  function levelOf2(puzzle, solution){
    const clues = puzzle.filter(Boolean).length, pr = profile(puzzle, solution);
    if(!pr.moments.length) return clues >= 34 ? 'let' : 'mellem';
    if(!pr.adv && pr.maxW <= 2 && pr.moments.length >= 2 && pr.score >= LEVEL2.svaerMin && pr.score <= LEVEL2.svaerMax) return 'svaer';
    if(pr.score >= LEVEL2.ekspertMin && pr.first >= LEVEL2.ekspertFirst
      && (pr.moments.length >= 3 || pr.moments.some(m => m.adv && m.depth >= LEVEL2.ekspertDepth))) return 'ekspert';
    return null;
  }
  const LEVEL2 = {svaerMin: 2, svaerMax: 6, ekspertMin: 6.5, ekspertFirst: 27, ekspertDepth: 5};

  /* ---------- banekoder ----------
     Træningsbaner: niveaubogstav + 5 tegn, fx S-K7PM2 (L=let, M=mellem, S=svær, E=ekspert).
     Koden er frøet til generatoren, så samme kode altid giver samme bane.
     Dagens sudoku: D-ÅÅMMDD, fx D-261119. */
  const CODE_ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const LEVEL_LETTER = {let: 'L', mellem: 'M', svaer: 'S', ekspert: 'E'};
  const LETTER_LEVEL = {L: 'let', M: 'mellem', S: 'svaer', E: 'ekspert'};
  const CODE_RE = /^[LMSE]-[A-HJ-NP-Z2-9]{5}$/, DAY_RE = /^D-\d{6}$/;   // uden 0, 1, I og O, der let forveksles
  function makeCode(level, rand){
    rand = rand || Math.random;
    let s = LEVEL_LETTER[level] + '-';
    for(let k = 0; k < 5; k++) s += CODE_ALPHA[Math.floor(rand() * CODE_ALPHA.length)];
    return s;
  }
  // Tåler små bogstaver, mellemrum og manglende bindestreg. Ugyldig kode giver null
  function normalizeCode(input){
    let s = String(input || '').toUpperCase().replace(/[\s_.]/g, '');
    if(/^[LMSED][A-Z0-9]+$/.test(s)) s = s[0] + '-' + s.slice(1);
    return CODE_RE.test(s) || DAY_RE.test(s) ? s : null;
  }
  const isDayCode = c => DAY_RE.test(c);
  const dayCode = key => 'D-' + key.slice(2).replace(/-/g, '');
  const dateOfCode = c => '20' + c.slice(2, 4) + '-' + c.slice(4, 6) + '-' + c.slice(6, 8);
  const levelOfCode = c => isDayCode(c) ? dailyLevel(dateOfCode(c)) : LETTER_LEVEL[c[0]];
  // version: 1 for træningskoder fra før skiftet (siden ved det ud fra historikken), ellers den nyeste
  function fromCode(code, version){
    if(isDayCode(code)) return Object.assign(daily(dateOfCode(code)), {kode: code});
    if(!CODE_RE.test(code)) throw new Error('Ugyldig kode: ' + code);
    return Object.assign(generate(LETTER_LEVEL[code[0]], 'himmerland-bane-' + code, version), {kode: code});
  }

  const api = {LEVELS, LEVEL_NAMES, DAILY_LEVEL, PEERS, ROW, COL, BOX, rng, countSolutions, solve, grade, levelOf, generate, todayKey, dailyLevel, daily, explain, hardness, profile, levelOf2, VERSION, V2_FROM, makeCode, normalizeCode, isDayCode, dayCode, dateOfCode, levelOfCode, fromCode};
  if(typeof module !== 'undefined' && module.exports) module.exports = api; else root.Sudoku = api;
})(typeof self !== 'undefined' ? self : this);
