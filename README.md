# ⛳ Himmerland Golf – scorekort

Statisk scorekort til **2 runder golf for 2 spillere à 18 huller** efter Himmerland-husreglerne,
plus **5 selvbeskrevne aktiviteter**. Der kan køre **så mange turneringer man vil** med den samme
opsætning. Alt ligger i én fil (`index.html`) uden byggetrin — hostes på `golf.vejleaa.dk`.

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

**Turneringer** – hver turnering er sit eget scorekort med navn, dato, to spillere, 2 runder og 5
aktiviteter. Skift mellem dem i vælgeren øverst på siden; de gamle bliver liggende med deres
resultater. *Kopiér opsætning* starter en ny turnering med samme spillere og par-tal, men blanke
scores. Hver turnering har sin egen synk-kode, så flere kan køre side om side.

**Aktiviteter** – 5 frie felter hvor titel, beskrivelse og begge spilleres resultat skrives direkte
på siden. Vinderen vælges med en knap og giver 1 point.

**Pointregnskab** – 4 point pr. runde + 5 point fra aktiviteterne = **13 point i alt**.
Uafgjort deler pointet ½–½. Stillingen står altid øverst på siden.

Derudover: par kan justeres pr. hul, noter pr. runde, print/PDF, og eksport/import af hele
turneringshistorikken som JSON (import lægger turneringer oveni i stedet for at overskrive).
Siden følger telefonens lyse/mørke tilstand.

## Kørsel lokalt

Åbn `public/index.html` direkte i en browser, eller server mappen:

```bash
python3 -m http.server 8080 --directory public   # → http://localhost:8080
```

## Hosting på golf.vejleaa.dk (Firebase Hosting)

Siden er ren statisk HTML — ét dokument uden byggetrin — så den lægges bare på CDN'et.
Firebase-projektet hedder **himmerland**.

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting
```

Du får en `*.web.app`-adresse med det samme. Domænet tilføjes derefter under
**Firebase Console → Hosting → Add custom domain → `golf.vejleaa.dk`**, hvor Firebase viser de
DNS-records (A/TXT), du skal oprette hos din DNS-udbyder. Certifikatet klares automatisk.

`firebase.json` peger på `public/`, sætter `no-cache` på `index.html` og `firebase-config.js`, så
en ny udgivelse slår igennem med det samme, og sender ukendte stier videre til appen, så
`?kode=`-links virker.

> **Ikke App Hosting.** App Hosting bygger repoet med buildpacks og kræver en Node-app; en statisk
> side fejler i build-trinnet. Er der oprettet en App Hosting-backend på projektet, kan den slettes
> — den bruges ikke her.

## Sky-synk (valgfrit, men rart)

Uden opsætning gemmes alt i browserens `localStorage` — ét scorekort pr. telefon.
Med sky-synk deler I ét fælles scorekort på tværs af telefoner, opdateret live:

1. **Firestore**: Console → Firestore Database → opret database (production mode).
2. **Anonym login**: Console → Authentication → Sign-in method → slå *Anonymous* til.
   (Reglerne kræver et login; siden logger selv anonymt ind.)
3. **Web-config**: Console → Projektindstillinger → Dine apps → Web-app. Kopiér værdierne ind i
   `public/firebase-config.js` i stedet for pladsholderne, og deploy igen.
4. **Regler**: `firebase deploy --only firestore:rules`

Scorekortene ligger i samlingen `spil`, ét dokument pr. **turneringskode**. Koden dannes ud fra
turneringens navn og kan ændres under fanen *Stilling → Sky-synk*. Knappen *Kopiér link til
medspiller* laver et link med `?kode=…` — åbner medspilleren det, hentes turneringen ned og lægges
i vedkommendes egen liste. Kun den aktive turnering synkroniseres; skifter du turnering, følger
synken med.

Har du ikke lyst til at lægge config'en i repoet, kan den i stedet indsættes direkte i feltet under
*Stilling → Sky-synk* på hver telefon — så gemmes den kun lokalt.

## Filer

| Fil | Formål |
|---|---|
| `public/index.html` | Hele appen: layout, regler, pointberegning, turneringer og synk |
| `public/firebase-config.js` | Firebase web-config (pladsholdere indtil du udfylder dem) |
| `firebase.json` | Hosting- og Firestore-opsætning |
| `firestore.rules` | Adgang til samlingen `spil` |
| `.firebaserc` | Standardprojekt til Firebase CLI |
