# ⛳ Himmerland Golf – scorekort

Statisk scorekort til **2 runder golf for 2 spillere à 18 huller** efter Himmerland-husreglerne,
plus **et frit antal selvbeskrevne aktiviteter**. Der kan køre **så mange turneringer man vil** med
den samme opsætning. Alt ligger i én fil (`index.html`) uden byggetrin — hostes på `golf.vejleaa.dk`.

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

**Turneringer** – hver turnering er sit eget scorekort med navn, dato, to spillere, 2 runder og sine
egne aktiviteter. Skift mellem dem i vælgeren øverst på siden; de gamle bliver liggende med deres
resultater. *Kopiér opsætning* starter en ny turnering med samme spillere, par-tal og aktiviteter, men blanke
scores og resultater. Hver turnering har sin egen synk-kode, så flere kan køre side om side.

**Aktiviteter** – tilføj og fjern så mange I vil (op til 40). Titel, beskrivelse og begge spilleres
resultat skrives direkte på siden, og vinderen vælges med en knap. Skal der være aktiviteter for
hver dag, navngives de bare derefter — fx “Dag 1 – petanque”.

**Pointregnskab** – 4 point pr. runde (altså 8 fra golfen) plus 1 point pr. aktivitet. Totalen
følger antallet af aktiviteter og står nederst i stillingen. Uafgjort deler pointet ½–½, og
stillingen står altid øverst på siden.

Derudover: par kan justeres pr. hul, noter pr. runde, print/PDF, og eksport/import af hele
turneringshistorikken som JSON (import lægger turneringer oveni i stedet for at overskrive).
Siden følger telefonens lyse/mørke tilstand.

## Kørsel lokalt

Åbn `public/index.html` direkte i en browser, eller server mappen:

```bash
python3 -m http.server 8080 --directory public   # → http://localhost:8080
```

## Hosting: golf.vejleaa.dk

Siden er ren statisk HTML og ligger på **GitHub Pages**. Workflowen
`.github/workflows/deploy.yml` pakker `public/` og udgiver den ved hvert push til
`claude/himmerland-golf-scorecard-7g3jkj` — der er ingen manuelle deploy-trin. En kørsel tager
omkring 15 sekunder.

| Adresse | |
|---|---|
| `https://golf.vejleaa.dk` | Domænet, sat af `public/CNAME` |
| `https://cvejleaa.github.io/Himmerland/` | Pages-adressen |

DNS: én CNAME-record fra `golf` til `cvejleaa.github.io`. Certifikatet udsteder GitHub selv.

Opsætningen blev slået til én gang under **Settings → Pages → Source: GitHub Actions**; workflowen
kan ikke selv oprette Pages-siden første gang (GitHub tillader ikke at en workflow gør det).

> **Firebase Hosting bruges ikke.** Filerne `firebase.json` og `.firebaserc` ligger her, hvis du
> senere vil den vej (`firebase deploy --only hosting`), men den kræver login ved hver udgivelse.
> App Hosting duer slet ikke til en statisk side — den bygger med buildpacks og kræver en Node-app.

## Sky-synk (valgfrit, men rart)

Uden opsætning gemmes alt i browserens `localStorage` — ét scorekort pr. telefon.
Med sky-synk deler I ét fælles scorekort på tværs af telefoner, opdateret live:

1. **Firestore**: Console → Firestore Database → opret database (production mode).
2. **Anonym login**: Console → Authentication → Sign-in method → slå *Anonymous* til.
   (Reglerne kræver et login; siden logger selv anonymt ind.)
3. **Web-config**: Console → Projektindstillinger → Dine apps → Web-app. Kopiér værdierne ind i
   `public/firebase-config.js` i stedet for pladsholderne, og deploy igen.
4. **Regler**: `firebase deploy --only firestore:rules`
5. **Tilladte domæner**: Console → Authentication → Settings → Authorized domains → tilføj
   `golf.vejleaa.dk` og `cvejleaa.github.io`. Uden dem afviser Firebase det anonyme login.

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
| `firebase.json` | Firestore-regler + valgfri Firebase Hosting |
| `firestore.rules` | Adgang til samlingen `spil` |
| `.firebaserc` | Standardprojekt til Firebase CLI |
| `public/CNAME` | Domænet siden svarer på |
| `.github/workflows/deploy.yml` | Udgiver siden ved hvert push |
