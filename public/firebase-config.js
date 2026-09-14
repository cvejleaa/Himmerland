/* Firebase web-config til golf.vejleaa.dk
 *
 * Værdierne her er offentlige af design — de identificerer projektet, de
 * beskytter det ikke. Adgangen til data styres af firestore.rules.
 *
 * Hentes i Firebase Console → Projektindstillinger → Dine apps → Web-app.
 */
window.FIREBASE_CONFIG = {
  // Web push-nøgle (VAPID) til "det er din tur"-beskeder: Console → Cloud Messaging → Web configuration → Web Push certificates
  vapidKey:          "BAygmyNVOQXBL5eFGMJoQLTxEXMg8Hq0x-u2-nE-FfbJxDGFEnRcjMVLBqo5liMizJE6lKayNIDwRIfSoTY4LkQ",

  apiKey:            "AIzaSyBI6scLPgQyyTLA7vEWzTA-bqKLXk5_B4s",
  authDomain:        "himmerland.firebaseapp.com",
  projectId:         "himmerland",
  storageBucket:     "himmerland.firebasestorage.app",
  messagingSenderId: "942817781646",
  appId:             "1:942817781646:web:c2e28f02018a562895a6df",
  measurementId:     "G-1BS3Y6RMVB",

  // Firestore-databasen i projektet hedder "golf", ikke "(default)"
  databaseId:        "golf"
};
