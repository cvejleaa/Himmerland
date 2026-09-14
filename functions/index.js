/* Cloud Function: sender en push-besked til den spiller, der får turen i et terningspil.
   Udløses hver gang et dokument i "terningspil" ændres i databasen "golf". Tokens ligger på
   spillerens profil i "brugere/{uid}.tokens". Deploy: firebase deploy --only functions */
const {onDocumentUpdated} = require('firebase-functions/v2/firestore');
const {initializeApp} = require('firebase-admin/app');
const {getFirestore} = require('firebase-admin/firestore');
const {getMessaging} = require('firebase-admin/messaging');

initializeApp();
const DATABASE = 'golf';
const SITE = 'https://golf.vejleaa.dk/';

exports.dinTur = onDocumentUpdated({document: 'terningspil/{id}', database: DATABASE, region: 'europe-west4'}, async event => {
  const before = event.data.before.data() || {};
  const after = event.data.after.data() || {};
  const id = event.params.id;
  const db = getFirestore(DATABASE);
  const navnAf = uid => (after.spillere || []).filter(p => p.uid === uid).map(p => p.navn)[0] || 'en medspiller';
  const typeNavn = after.type === 'mexico' ? 'Mexico' : '10.000';
  const side = after.type === 'mexico' ? 'mexico.html' : '10000.html';

  const sends = [];
  // Turen skiftede til en ny spiller
  if(after.status === 'igang' && after.tur && after.tur !== before.tur){
    sends.push({uid: after.tur, title: `${typeNavn}: det er din tur`, body: `${navnAf(before.tur)} har spillet – nu er det dig.`, url: `${SITE}${side}?spil=${id}`});
  }
  // Spillet er slut: alle andre end den, der afsluttede, får besked
  if(after.status === 'slut' && before.status !== 'slut'){
    const vinder = navnAf(after.vinder);
    (after.spillerUids || []).filter(u => u !== before.tur).forEach(uid => sends.push({uid, title: `${typeNavn}: spillet er slut`, body: `${vinder} vandt. Se resultatet i lobbyen.`, url: `${SITE}spil.html`}));
  }
  // Nyt spil: inviterede spillere får besked, når ejeren starter
  if(after.status === 'igang' && before.status === 'venter'){
    (after.spillerUids || []).filter(u => u !== after.ejer && u !== after.tur).forEach(uid => sends.push({uid, title: `${typeNavn}: spillet er i gang`, body: `${navnAf(after.ejer)} har startet spillet.`, url: `${SITE}${side}?spil=${id}`}));
  }
  if(!sends.length) return;

  for(const s of sends){
    const snap = await db.collection('brugere').doc(s.uid).get();
    const tokens = (snap.exists && snap.data().tokens) || [];
    if(!tokens.length) continue;
    const res = await getMessaging().sendEachForMulticast({
      tokens,
      notification: {title: s.title, body: s.body},
      webpush: {fcmOptions: {link: s.url}, notification: {icon: `${SITE}ikoner/${after.type === 'mexico' ? 'mexico' : '10000'}-192.png`, badge: `${SITE}ikoner/${after.type === 'mexico' ? 'mexico' : '10000'}-192.png`}},
      data: {url: s.url},
    });
    // Ryd tokens der ikke virker længere
    const dead = tokens.filter((t, i) => res.responses[i].error && /registration-token-not-registered|invalid-argument/.test(res.responses[i].error.code || ''));
    if(dead.length) await snap.ref.update({tokens: tokens.filter(t => !dead.includes(t))});
  }
});
