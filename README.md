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
| 3 sejre: For 9, Bag 9, hele runden | For 9/Bag 9 afgøres på flest vundne huller. Hele runden afgøres på **enten** færrest netto slag **eller** flest Stableford-point — vælges pr. runde under *resultat*. 1 point hver. |
| 9 udtrukne huller | “Træk 9 huller” trækker tilfældigt — eller tryk på et hulnummer for at vælge manuelt. Flest vundne af dem giver 1 ekstra point. |
| Slagtilskud (handicap) | Den ene spiller kan få ekstra slag — fordelt jævnt over runden med ét tryk, eller sat hul for hul med “+ slag”-chippen. Hul, For 9, Bag 9 og hele runden afgøres derefter på **netto**. Højst 4 slag på ét hul. |
| Stableford | Hvert hul giver point efter netto score — 2 for par, 3 for birdie, 4 for eagle, 1 for bogey, 0 for dobbeltbogey eller værre. Pointene står ved hver score. |
| Fødderne (afløser rebet) | Hver spiller har et antal fødder til frit drop på runden. Totalen sættes øverst i runden, forbruget noteres på hvert hul, og resten står ved regelforbruget — gul ved nul, rød hvis der er brugt for mange. |

**Turneringer** – hver turnering er sit eget scorekort med navn, dato, to spillere, 2 runder og sine
egne aktiviteter. Skift mellem dem i vælgeren øverst på siden; de gamle bliver liggende med deres
resultater. *Kopiér opsætning* starter en ny turnering med samme spillere, par-tal og aktiviteter, men blanke
scores og resultater. Hver turnering har sin egen synk-kode, så flere kan køre side om side.

**Aktiviteter** – tilføj og fjern så mange I vil (op til 40). Titel, beskrivelse og begge spilleres
resultat skrives direkte på siden, og vinderen vælges med en knap. Skal der være aktiviteter for
hver dag, navngives de bare derefter — fx “Dag 1 – petanque”.

**Handicap** – er der forskel på spillernes niveau, gives den ene ekstra slag. Uden tilskud afgøres
alt på rå score, præcis som før.

**Stableford** – pointene beregnes automatisk på hvert hul ud fra netto score og vises ved siden af
slagene. Hele runden kan afgøres på point i stedet for slag, hvilket lægger loft over hvad et enkelt
dårligt hul koster.

**Pointregnskab** – 4 point pr. runde (altså 8 fra golfen) plus 1 point pr. aktivitet. Totalen
følger antallet af aktiviteter og står nederst i stillingen. Uafgjort deler pointet ½–½, og
stillingen står altid øverst på siden.

Derudover: par kan justeres pr. hul, noter pr. runde, print/PDF, og eksport/import af hele
turneringshistorikken som JSON (import lægger turneringer oveni i stedet for at overskrive).
Siden følger telefonens lyse/mørke tilstand.

## 🎲 Mexico – terningspil

`public/mexico.html` er et selvstændigt terningspil til **et vilkårligt antal spillere på én telefon** –
telefonen erstatter raflebægeret og sendes rundt om bordet. Ingen opsætning, virker offline, og det
igangværende spil gemmes i browseren så en genindlæsning ikke koster runden. Ligger på
`golf.vejleaa.dk/mexico.html`.

| Regel | Sådan er den bygget ind |
|---|---|
| To terninger, højeste er tierne | 5 og 3 vises som **53**. |
| Mexico (2 og 1) slår alt, derefter par 66–11, derefter 65…31 | Rangordenen er indbygget, og Mexico stopper turen automatisk. |
| Startspilleren slår op til 3 gange og sætter loftet, dog mindst 2 | Loftet vises for de øvrige med hvem der satte det, og turen stopper selv når loftet er nået. |
| Laveste slag mister ét liv; ved delt laveste taber alle de laveste | Alle med rundens laveste slag mister liv. |
| Tab mod Mexico koster 2 liv | Kan sættes til 1 under opsætningen. |
| Vinderen (højeste slag) starter næste runde | Ved delt højeste starter den af dem der slog først. |
| Sidste spiller med liv vinder | Ryger alle tilbageværende ud i samme runde, får de ét liv hver og spiller en afgørende runde. |

Liv pr. spiller vælges under opsætningen (standard 6). *Fortryd* starter den aktuelle runde forfra
eller går en runde tilbage, og *Nyt spil med samme spillere* lader vinderen starte.

**Skru**: tryk *Skru* i stedet for *Slå* for at ryste bægeret på den særlige, berusede måde. Terningerne
snurrer længere og vildere med snurre-lyd og hik, og der råbes "Skru!". Det ændrer ikke slaget og tæller som
et almindeligt slag. Statistikken ved spilslut tæller antal skru.

**Fejring af vinderen** når spillet er slut: skærmen går i sort med trommehvirvel og "Og vinderen er…",
navnet smækkes ind i guld med airhorn, fyrværkeri, konfetti og vibration (Android), kommentatoren råber
"Campeón" mens talesyntesen siger "Tillykke <navn>, du er Mexico-mester!", publikum synger "Olé, olé olé
olé", og til sidst kommer podiet med guld, sølv og bronze og en kampstatistik (runder, liv tilbage, antal
Mexico'er, første ud). Et tryk på skærmen springer fejringen over. Podiet og statistikken bliver stående i
resultatkortet, og historikken viser sølv og bronze.

**Historik** gemmes på telefonen: hvert færdigt spil med tidspunkt, vinder, antal runder og
placeringer (rækkefølgen spillerne røg ud i), samt en samlet rangliste: hver placering giver lige så mange point som
placeringen (1. plads 1 point, 5. plads 5 point), og færrest point fører. Ved siden af står antal spil,
gennemsnitsplacering og sejre. Ryger flere ud i samme runde, deler de placeringen. Fortrydes den sidste runde, fjernes spillet fra historikken igen. *Ryd historik* sletter
alt. Rundeforløbet i det igangværende spil viser alle runder med *Vis alle* når der er mange.

Par lyser lilla med et *PAR*-mærke på terningerne, i turkortet, i stillingen og i resultatet, så de
ikke forveksles med almindelige slag. Der er raflelyd når der slås – terningerne klaprer i bægeret og lander med hop på bordet (lavet
med Web Audio, ingen lydfiler), og udbrud på skærmen og via telefonens talesyntese: **Ecuadooooooor!** ved Mexico (råbt langsomt og
trukket ud, som en sydamerikansk
fodboldkommentators "GOOOOOL": en syntetisk stemme holder ordet i otte sekunder med voksende styrke og
vibrato, stadionekko og publikum under, mens talesyntesen siger det med latinamerikansk stemme), **Ohh no!** ved 31, **Not good** ved 32, og **Farvel <navn>** når en spiller ryger ud. Højttaler-knappen øverst slår lyd og råb til og fra, og valget huskes.

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

To ting skulle sættes én gang i **Settings → Pages**, fordi GitHub ikke lader en workflow gøre det
(begge dele svarer `Resource not accessible by integration`):

- **Source: GitHub Actions**
- **Custom domain: `golf.vejleaa.dk`** — `public/CNAME` alene rækker ikke, når der udgives via
  Actions; domænet skal stå i selve Pages-opsætningen, ellers svarer det 404.

> **Firebase Hosting bruges ikke.** Filerne `firebase.json` og `.firebaserc` ligger her, hvis du
> senere vil den vej (`firebase deploy --only hosting`), men den kræver login ved hver udgivelse.
> App Hosting duer slet ikke til en statisk side — den bygger med buildpacks og kræver en Node-app.

## Sky-synk (valgfrit, men rart)

Uden opsætning gemmes alt i browserens `localStorage` — ét scorekort pr. telefon.
Med sky-synk deler I ét fælles scorekort på tværs af telefoner, opdateret live:

1. **Firestore**: Console → Firestore Database → opret database (production mode). Hedder databasen
   noget andet end `(default)`, skal navnet sættes som `databaseId` i `public/firebase-config.js` —
   i dette projekt hedder den `golf`.
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
| `public/mexico.html` | Terningspillet Mexico – selvstændig side uden synk |
| `public/firebase-config.js` | Firebase web-config (pladsholdere indtil du udfylder dem) |
| `firebase.json` | Firestore-regler + valgfri Firebase Hosting |
| `firestore.rules` | Adgang til samlingen `spil` |
| `.firebaserc` | Standardprojekt til Firebase CLI |
| `public/CNAME` | Domænet siden svarer på |
| `.github/workflows/deploy.yml` | Udgiver siden ved hvert push |
