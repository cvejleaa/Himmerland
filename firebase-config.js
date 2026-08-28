/* Firebase web-config til golf.vejleaa.dk
 *
 * Hent værdierne i Firebase Console → Projektindstillinger → Dine apps → Web-app,
 * og indsæt dem herunder. Så snart apiKey ikke længere er en pladsholder,
 * slår siden automatisk sky-synk til.
 *
 * Værdierne her er offentlige af design (de identificerer blot projektet).
 * Adgangen styres af reglerne i firestore.rules.
 */
window.FIREBASE_CONFIG = {
  apiKey:            "DIN_API_KEY",
  authDomain:        "himmerland.firebaseapp.com",
  projectId:         "himmerland",
  storageBucket:     "himmerland.appspot.com",
  messagingSenderId: "DIT_SENDER_ID",
  appId:             "DIT_APP_ID"
};
