# ⛳ Himmerland Golf – scorekort

Statisk scorekort til **2 runder golf for 2 spillere à 18 huller** efter Himmerland-husreglerne,
plus **5 selvbeskrevne aktiviteter**. Alt ligger i én fil (`index.html`) uden byggetrin — hostes på
`golf.vejleaa.dk`.

## Hvad siden kan

**Golf (runde 1 og 2)**

| Regel | Sådan er den bygget ind |
|---|---|
| 3 mulligans – drive, jern, putt | Afkrydsning pr. spiller pr. runde, med valgfrit hulnummer. Siden viser hvad der er tilbage. |
| 1 gimmie putt pr. runde | Samme afkrydsning, én pr. spiller pr. runde. |
| 3-putt = ingen køller på næste hul | Sæt hak ved “3-putt”, og næste hul får automatisk mærket 🚫 *Ingen køller*. |
| PAR = dametee på næste hul | Beregnes ud fra score vs. par (par eller bedre) og vises som 🏌️‍♀️ *Dametee* på næste hul. |
| 3 sejre: For 9, Bag 9, hele runden | For 9/Bag 9 afgøres på flest vundne huller, hele runden på færrest slag. 1 point hver. |
| 9 udtrukne huller | “Træk 9 huller” trækker tilfældigt — eller tryk på et hulnummer for at vælge manuelt. Flest vundne af dem giver 1 ekstra point. |
| 5 m rebet | Gælder hele runden uden begrænsning, så det står som huskeregel under fanen *Regler*. |

**Aktiviteter** – 5 frie felter hvor titel, beskrivelse og begge spilleres resultat skrives direkte
på siden. Vinderen vælges med en knap og giver 1 point.

**Pointregnskab** – 4 point pr. runde + 5 point fra aktiviteterne = **13 point i alt**.
Uafgjort deler pointet ½–½. Stillingen står altid øverst på siden.

Derudover: par kan justeres pr. hul, noter pr. runde, print/PDF, og eksport/import af scorekortet
som JSON.

## Kørsel lokalt

Åbn `index.html` direkte i en browser, eller:

```bash
python3 -m http.server 8080     # → http://localhost:8080
```

## Hosting på golf.vejleaa.dk (Firebase Hosting)

Firebase-projektet hedder **himmerland**. Ret evt. `projects.default` i `.firebaserc`, hvis
projekt-id'et er et andet (fx `himmerland-1a2b3`).

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting
```

Tilføj derefter domænet: **Firebase Console → Hosting → Add custom domain → `golf.vejleaa.dk`**,
og opret de DNS-records (A/TXT), Firebase viser, hos din DNS-udbyder. Certifikatet klares
automatisk.

## Sky-synk (valgfrit, men rart)

Uden opsætning gemmes alt i browserens `localStorage` — ét scorekort pr. telefon.
Med sky-synk deler I ét fælles scorekort på tværs af telefoner, opdateret live:

1. **Firestore**: Console → Firestore Database → opret database (production mode).
2. **Anonym login**: Console → Authentication → Sign-in method → slå *Anonymous* til.
   (Reglerne kræver et login; siden logger selv anonymt ind.)
3. **Web-config**: Console → Projektindstillinger → Dine apps → Web-app. Kopiér værdierne ind i
   `firebase-config.js` i stedet for pladsholderne, og deploy igen.
4. **Regler**: `firebase deploy --only firestore:rules`

Scorekortene ligger i samlingen `spil`, ét dokument pr. **spilkode**. Under fanen *Stilling → Sky-synk*
sættes koden (fx `himmerland-2026`), og knappen *Kopiér link til medspiller* laver et link med
`?kode=…`, så den anden telefon åbner det samme spil.

Har du ikke lyst til at lægge config'en i repoet, kan den i stedet indsættes direkte i feltet under
*Stilling → Sky-synk* på hver telefon — så gemmes den kun lokalt.

## Filer

| Fil | Formål |
|---|---|
| `index.html` | Hele appen: layout, regler, pointberegning og synk |
| `firebase-config.js` | Firebase web-config (pladsholdere indtil du udfylder dem) |
| `firebase.json` | Hosting- og Firestore-opsætning |
| `firestore.rules` | Adgang til samlingen `spil` |
| `.firebaserc` | Standardprojekt til Firebase CLI |
