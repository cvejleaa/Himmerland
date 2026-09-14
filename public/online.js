/* Online-laget til terningspillene: login, spil i skyen, historik, statistik og push.
   Bruges af spil.html (lobbyen) og af mexico.html/10000.html i online-tilstand (?spil=ID).
   Alt går gennem et lille "backend"-lag, så testene kan bytte Firebase ud med en attrap
   (window.__onlineBackend). Firebase indlæses først når Online.init() kaldes. */
(function(){
  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  const COL = {users: 'brugere', games: 'terningspil'};
  const SKIP_AFTER_MS = 3 * 24 * 3600 * 1000;   // efter 3 dage kan de andre springe turen over

  /* ---------- Firebase-backend ---------- */
  function firebaseBackend(){
    let app, auth, db, fs, authMod, msgMod, messaging = null;
    const conv = d => d ? d : null;
    return {
      async init(cfg){
        const [{initializeApp}, fsMod, aMod] = await Promise.all([
          import(SDK + 'firebase-app.js'), import(SDK + 'firebase-firestore.js'), import(SDK + 'firebase-auth.js')]);
        fs = fsMod; authMod = aMod;
        app = initializeApp(cfg);
        auth = aMod.getAuth(app);
        db = cfg.databaseId ? fs.getFirestore(app, cfg.databaseId) : fs.getFirestore(app);
        try{ await aMod.setPersistence(auth, aMod.browserLocalPersistence); }catch(e){}
        try{ await aMod.getRedirectResult(auth); }catch(e){ console.warn('redirect-login', e); }
      },
      auth: {
        onChange(cb){ return authMod.onAuthStateChanged(auth, u => cb(u ? {uid: u.uid, navn: u.displayName || '', email: u.email || ''} : null)); },
        async google(){
          const p = new authMod.GoogleAuthProvider();
          try{ await authMod.signInWithPopup(auth, p); }
          catch(e){
            if(['auth/popup-blocked', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/operation-not-supported-in-this-environment'].includes(e.code)) await authMod.signInWithRedirect(auth, p);
            else throw e;
          }
        },
        emailIn(e, p){ return authMod.signInWithEmailAndPassword(auth, e, p); },
        async emailUp(e, p, navn){ const c = await authMod.createUserWithEmailAndPassword(auth, e, p); if(navn) await authMod.updateProfile(c.user, {displayName: navn}); },
        reset(e){ return authMod.sendPasswordResetEmail(auth, e); },
        out(){ return authMod.signOut(auth); },
      },
      db: {
        ref(path){ const parts = path.split('/'); return fs.doc(db, ...parts); },
        async get(path){ const s = await fs.getDoc(this.ref(path)); return s.exists() ? s.data() : null; },
        set(path, data, opts){ return fs.setDoc(this.ref(path), data, opts && opts.merge ? {merge: true} : undefined); },
        update(path, data){ return fs.updateDoc(this.ref(path), data); },
        async txn(path, fn){
          return fs.runTransaction(db, async t => {
            const s = await t.get(this.ref(path));
            const next = fn(s.exists() ? s.data() : null);
            if(next === undefined) return false;
            t.set(this.ref(path), next);
            return true;
          });
        },
        watch(path, cb){ return fs.onSnapshot(this.ref(path), s => cb(s.exists() ? s.data() : null), e => console.warn('watch', e)); },
        // field kan være et feltnavn eller en liste af [felt, op, værdi]
        q(col, field, op, value){
          const filters = Array.isArray(field) ? field : field ? [[field, op, value]] : [];
          return fs.query(fs.collection(db, col), ...filters.map(f => fs.where(f[0], f[1], f[2])));
        },
        async list(col, field, op, value){
          const s = await fs.getDocs(this.q(col, field, op, value)); return s.docs.map(d => Object.assign({id: d.id}, d.data()));
        },
        watchList(col, field, op, value, cb){
          return fs.onSnapshot(this.q(col, field, op, value), s => cb(s.docs.map(d => Object.assign({id: d.id}, d.data()))), e => console.warn('watchList', e));
        },
        newId(){ return fs.doc(fs.collection(db, COL.games)).id; },
      },
      push: {
        async supported(){
          try{ msgMod = msgMod || await import(SDK + 'firebase-messaging.js'); return await msgMod.isSupported(); }catch(e){ return false; }
        },
        async token(cfg){
          if(!(await this.supported()) || !cfg.vapidKey) return null;
          messaging = messaging || msgMod.getMessaging(app);
          const reg = await navigator.serviceWorker.register('firebase-messaging-sw.js');
          return msgMod.getToken(messaging, {vapidKey: cfg.vapidKey, serviceWorkerRegistration: reg});
        },
        onMessage(cb){ if(messaging && msgMod) msgMod.onMessage(messaging, cb); },
      },
    };
  }

  /* ---------- Fælles lag ---------- */
  const Online = {
    SKIP_AFTER_MS,
    backend: null, user: null, profile: null, cfg: null,
    _authCbs: [], _ready: null,

    init(){
      if(this._ready) return this._ready;
      this.cfg = window.FIREBASE_CONFIG || null;
      this.backend = window.__onlineBackend || firebaseBackend();
      this._ready = (async () => {
        if(!window.__onlineBackend && !this.cfg) throw new Error('Ingen Firebase-config');
        await this.backend.init(this.cfg);
        await new Promise(resolve => {
          let first = true;
          this.backend.auth.onChange(async u => {
            this.user = u;
            if(u){ this.profile = await this.ensureProfile(u); }
            else this.profile = null;
            this._authCbs.forEach(cb => cb(this.user, this.profile));
            if(first){ first = false; resolve(); }
          });
        });
        return this;
      })();
      return this._ready;
    },
    onAuth(cb){ this._authCbs.push(cb); if(this._ready && this.user !== undefined) cb(this.user, this.profile); },

    async ensureProfile(u){
      const path = `${COL.users}/${u.uid}`;
      const cur = await this.backend.db.get(path);
      const navn = (cur && cur.navn) || u.navn || (u.email ? u.email.split('@')[0] : 'Spiller');
      const data = {navn, email: u.email || '', sidstSet: Date.now()};
      if(!cur) data.oprettet = Date.now();
      await this.backend.db.set(path, data, {merge: true});
      return Object.assign({uid: u.uid, tokens: []}, cur || {}, data);
    },
    async setName(navn){
      navn = String(navn || '').trim().slice(0, 20); if(!navn) return;
      await this.backend.db.update(`${COL.users}/${this.user.uid}`, {navn});
      this.profile.navn = navn;
    },
    signInGoogle(){ return this.backend.auth.google(); },
    signInEmail(e, p){ return this.backend.auth.emailIn(e, p); },
    signUpEmail(e, p, navn){ return this.backend.auth.emailUp(e, p, navn); },
    resetPassword(e){ return this.backend.auth.reset(e); },
    signOut(){ return this.backend.auth.out(); },

    /* ---- venner og spil ---- */
    watchUsers(cb){ return this.backend.db.watchList(COL.users, null, null, null, us => cb(us.map(u => ({uid: u.id, navn: u.navn || '?'})).sort((a, b) => a.navn.localeCompare(b.navn, 'da')))); },
    async allUsers(){ const us = await this.backend.db.list(COL.users); return us.map(u => ({uid: u.id, navn: u.navn || '?'})).sort((a, b) => a.navn.localeCompare(b.navn, 'da')); },

    makeCode(){ const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; const b = new Uint32Array(6); crypto.getRandomValues(b); for(const x of b) s += A[x % A.length]; return s; },

    // Opretter et spil i venteposition. spillere: [{uid, navn}] – ejeren er altid med
    async createGame(type, settings, spillere){
      const me = {uid: this.user.uid, navn: this.profile.navn};
      const list = [me].concat((spillere || []).filter(p => p.uid !== me.uid));
      const id = this.backend.db.newId();
      const doc = {
        type, settings: settings || {}, kode: this.makeCode(), ejer: me.uid,
        spillere: list, spillerUids: list.map(p => p.uid),
        status: 'venter', tur: null, state: null, rev: 0,
        oprettet: Date.now(), opdateret: Date.now(), sluttet: null, vinder: null, placeringer: null,
      };
      await this.backend.db.set(`${COL.games}/${id}`, doc);
      return Object.assign({id}, doc);
    },
    async findByCode(kode){
      const hits = await this.backend.db.list(COL.games, [['kode', '==', String(kode || '').trim().toUpperCase()], ['status', '==', 'venter']]);
      return hits[0] || null;
    },
    async joinGame(id){
      const me = {uid: this.user.uid, navn: this.profile.navn};
      const ok = await this.backend.db.txn(`${COL.games}/${id}`, g => {
        if(!g || g.status !== 'venter' || g.spillerUids.includes(me.uid)) return undefined;
        return Object.assign({}, g, {spillere: g.spillere.concat([me]), spillerUids: g.spillerUids.concat([me.uid]), opdateret: Date.now()});
      });
      return ok;
    },
    async leaveGame(id){
      const uid = this.user.uid;
      return this.backend.db.txn(`${COL.games}/${id}`, g => {
        if(!g || g.status !== 'venter' || g.ejer === uid) return undefined;
        return Object.assign({}, g, {spillere: g.spillere.filter(p => p.uid !== uid), spillerUids: g.spillerUids.filter(u => u !== uid), opdateret: Date.now()});
      });
    },
    async removePlayer(id, uid){
      return this.backend.db.txn(`${COL.games}/${id}`, g => {
        if(!g || g.status !== 'venter' || g.ejer !== this.user.uid || uid === g.ejer) return undefined;
        return Object.assign({}, g, {spillere: g.spillere.filter(p => p.uid !== uid), spillerUids: g.spillerUids.filter(u => u !== uid), opdateret: Date.now()});
      });
    },
    async deleteGame(id){
      return this.backend.db.txn(`${COL.games}/${id}`, g => {
        if(!g || g.ejer !== this.user.uid) return undefined;
        return Object.assign({}, g, {status: 'slettet', spillerUids: [], opdateret: Date.now()});
      });
    },
    // Ejeren starter spillet: state laves af spilsiden (newGame), tur = første spiller
    async startGame(id, state, tur){
      return this.backend.db.txn(`${COL.games}/${id}`, g => {
        if(!g || g.status !== 'venter' || g.ejer !== this.user.uid || g.spillere.length < 2) return undefined;
        return Object.assign({}, g, {status: 'igang', state, tur, rev: (g.rev || 0) + 1, startet: Date.now(), opdateret: Date.now()});
      });
    },
    getGame(id){ return this.backend.db.get(`${COL.games}/${id}`); },
    watchGame(id, cb){ return this.backend.db.watch(`${COL.games}/${id}`, cb); },
    watchMyGames(cb){ return this.backend.db.watchList(COL.games, 'spillerUids', 'array-contains', this.user.uid, cb); },
    myGames(){ return this.backend.db.list(COL.games, 'spillerUids', 'array-contains', this.user.uid); },

    // Spilsiden skriver sin tilstand efter hvert træk. meta: {tur, status, vinder, placeringer}
    async pushState(id, rev, state, meta){
      const data = Object.assign({state, rev, opdateret: Date.now()}, meta || {});
      if(meta && meta.status === 'slut'){ data.sluttet = Date.now(); data.tur = null; }
      await this.backend.db.update(`${COL.games}/${id}`, data);
    },
    canSkip(g){ return g && g.status === 'igang' && g.tur && g.tur !== (this.user && this.user.uid) && Date.now() - (g.opdateret || 0) > SKIP_AFTER_MS; },

    /* ---- historik og statistik ---- */
    // Point efter placering (1. plads 1 point …). Færrest point fører – som Mexicos rangliste.
    stats(games, type){
      const done = games.filter(g => g.status === 'slut' && (!type || g.type === type) && g.placeringer);
      const by = new Map();
      done.forEach(g => {
        g.spillere.forEach(p => {
          const s = by.get(p.uid) || {uid: p.uid, navn: p.navn, spil: 0, sejre: 0, point: 0, placeringer: []};
          s.navn = p.navn;
          const r = g.placeringer[p.uid]; if(!r) return;
          s.spil += 1; s.point += r; s.placeringer.push(r); if(r === 1) s.sejre += 1;
          by.set(p.uid, s);
        });
      });
      return [...by.values()].map(s => Object.assign(s, {snit: s.spil ? s.point / s.spil : 0})).sort((a, b) => a.snit - b.snit || b.sejre - a.sejre || b.spil - a.spil);
    },

    /* ---- push ---- */
    async enablePush(){
      if(!('Notification' in window)) return {ok: false, why: 'Browseren understøtter ikke beskeder'};
      const perm = await Notification.requestPermission();
      if(perm !== 'granted') return {ok: false, why: 'Beskeder er ikke tilladt'};
      const token = await this.backend.push.token(this.cfg || {});
      if(!token) return {ok: false, why: 'Push er ikke sat op (vapidKey mangler eller browseren kan ikke)'};
      await this.backend.db.txn(`${COL.users}/${this.user.uid}`, u => {
        const tokens = (u && u.tokens) || [];
        return Object.assign({}, u || {}, {tokens: tokens.includes(token) ? tokens : tokens.concat([token]).slice(-10)});
      });
      return {ok: true};
    },

    /* ---- hjælpere ---- */
    fmtWhen(ms){ if(!ms) return ''; const d = new Date(ms); return d.toLocaleDateString('da-DK', {day: 'numeric', month: 'short'}) + ' ' + d.toLocaleTimeString('da-DK', {hour: '2-digit', minute: '2-digit'}); },
    fmtAgo(ms){
      const s = Math.max(0, Date.now() - ms) / 1000;
      if(s < 60) return 'lige nu'; if(s < 3600) return `${Math.floor(s / 60)} min`; if(s < 86400) return `${Math.floor(s / 3600)} t`; return `${Math.floor(s / 86400)} d`;
    },
    gameUrl(g){ return `${g.type === 'mexico' ? 'mexico' : '10000'}.html?spil=${g.id}`; },
    typeName(t){ return t === 'mexico' ? 'Mexico' : '10.000'; },
    gameId(){ try{ return new URLSearchParams(location.search).get('spil'); }catch(e){ return null; } },
  };
  window.Online = Online;
})();
