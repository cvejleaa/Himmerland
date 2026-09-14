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

**Slagstatistik**: hvert slag tælles på tværs af spil og vises under historikken – antal slag, Mexico'er og
par mod det forventede (Mexico 5,6 %, par 16,7 %), fordelingen af alle 21 udfald med søjler og en streg for det
forventede, og pr. spiller. Terningerne trækkes med `crypto.getRandomValues`, så statistikken er til at se, om
noget afviger. *Nulstil slagstatistik* tømmer den.

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

## 🎲 10.000 – terningspil

`public/10000.html` er terningspillet 10.000 for **et vilkårligt antal spillere på én telefon**, bygget på samme
måde som Mexico: ingen opsætning, virker offline, det igangværende spil gemmes i browseren, og der er link
mellem de to spil i sidefoden. Ligger på `golf.vejleaa.dk/10000.html`.

| Regel | Sådan er den bygget ind |
|---|---|
| Seks terninger. 1 = 100, 5 = 50 | Terninger der giver point lyser grønt og er valgt på forhånd; tryk for at fravælge. |
| Tre ens = øjne × 100, tre 1'ere = 1000 | Fire, fem og seks ens i ét slag giver ×2, ×4 og ×8. |
| Tre par i ét slag og lige række 1–6 | Standard 500 og 1000, begge kan ændres under opsætningen. |
| Kæde: tre ens og derefter samme øjne i slaget lige efter fordobler | Hver ny terning med kædens øjne fordobler kædens værdi: 3 × 3 = 300, én 3'er i næste slag 600, to 3'ere 1200, én 3'er i slaget efter 2400. Kæden vises i turkortet, matchende terninger lyser lilla, og der råbes ×2/×4. Et slag uden match bryder kæden, men værdien beholdes. Kæden stopper når alle terninger er brugt. |
| Alle seks terninger brugt = frit slag | Man slår igen med alle seks og beholder pointene ("FRIT SLAG!"). Man kan ikke banke, når alle terninger er brugt, heller ikke hvis udvalget ville bruge dem alle – *Bank* er låst, og noten siger hvorfor. |
| Død tur = ingen point i slaget | Turens point mistes, og turen går videre af sig selv ("DØD TUR!"). |
| Åbningskrav (standard 350) | Første gang man banker skal turen give mindst kravet, ellers er *Bank* låst. Kan sættes til intet krav. |
| Minimum pr. tur (standard intet) | Når man er på tavlen, skal turen give mindst minimumskravet for at kunne banke. Sættes under opsætningen. |
| Mål (standard 10.000) og slutspil | Når en spiller passerer målet, får de øvrige én tur mere. I den tur skal hver af dem overgå det højeste pointtal på tavlen for at kunne banke; ellers må de slå videre. Højeste total vinder, ved lige stilling den der nåede målet først. |

*Bank* lægger turens point på tavlen. Stillingen sorteres efter point ved hver bankning, så nummer 1 altid står
øverst, og turkortet viser hvem der er næste. *Rækkefølge* åbner et panel, hvor spillerne kan flyttes op og ned i
spillerækkefølgen midt i spillet (ikke i sidste runde); under opsætningen flytter pilene ved navnene på samme
måde. *Fortryd* starter den aktuelle tur forfra eller går en tur tilbage, og *Nyt spil med samme spillere* lader
vinderen starte. Der er raflelyd, kasse-lyd ved bank, udbrud på skærmen og
via talesyntesen, og fejring af vinderen med konfetti og "Tillykke <navn>". Mellemrum slår, B banker.
Terningerne trækkes med `crypto.getRandomValues`.

## 🌐 Terningspillene online – Mexico og 10.000 i eget tempo

`public/spil.html` er lobbyen for online spil: **ét login** (Google eller e-mail/kodeord) giver adgang til begge
spil, og historik og statistik følger med på tværs. Spillene ligger i Firestore (samme projekt og database som
golf-scorekortet, samlingen `terningspil`), hver spiller spiller på sin egen telefon, og turen går videre, når
man har spillet – i dag, i morgen eller i næste uge.

**Sådan spiller man**
1. Log ind på `golf.vejleaa.dk/spil.html`. Navnet kan ændres i lobbyen.
2. *Nyt spil*: vælg Mexico eller 10.000 og indstillingerne (liv/straf, eller mål, åbning, minimum, tre par, lige
   række). Sæt kryds ved medspillere fra vennelisten (alle, der har logget ind før), eller send koden/linket fra
   venteværelset til dem, der skal med. Ejeren trykker *Start spillet*, når alle er inde.
3. *Dine spil* viser hvad der venter på dig ("Din tur" øverst), hvem der er på i de andre, og hvor længe der er
   ventet. *Spil* åbner spillet i den kendte spilside med `?spil=ID`; kun den, der har turen, kan slå, de andre
   følger med live. Bjælken øverst viser hvis tur det er, og *Lobby* går tilbage.
4. Har en spiller ikke taget sin tur i **3 dage**, kan de andre trykke *Spring turen over*: i Mexico tæller
   slaget som 31, i 10.000 giver turen ingen point.
5. Når spillet er slut, ligger det under *Historik* med placeringer, og *Statistik* tæller spil, sejre og point
   (1. plads 1 point, 5. plads 5 – færrest point fører, som i Mexicos rangliste), samlet og pr. spil.

**Administrator og standardværdier.** Den første, der trykker *Bliv administrator* i lobbyen, får rollen
(dokumentet `indstillinger/admin` kan kun oprettes, når det ikke findes). Administratorer ser kortet
*Administration*, hvor standardværdierne for nye spil sættes (Mexico: liv og straf; 10.000: mål, åbning,
minimum, tre par, lige række) og gemmes i `indstillinger/standard`. Formularen *Nyt spil* er udfyldt med dem hos
alle, og de kan stadig ændres i det enkelte spil. Administratorer kan give rollen til andre fra vennelisten; der
skal altid være mindst én.

I Mexico kører næste runde af sig selv online (rundens resultat står i rundeforløbet), og fortryd, omkamp og den
lokale historik/slagstatistik er slået fra – de hører til spil på én telefon. De almindelige spilsider uden
`?spil=` virker som før, også uden net.

**Push-beskeder** ("det er din tur", "spillet er i gang", "spillet er slut") sendes af Cloud Functionen i
`functions/index.js`, som reagerer på ændringer i `terningspil` og sender til de tokens, spillerne har gemt med
*Slå beskeder til* i lobbyen. `public/firebase-messaging-sw.js` viser beskeden og åbner spillet ved tryk. På
iPhone virker beskeder kun, når siden er lagt på hjemmeskærmen (iOS 16.4+).

**Opsætning i Firebase (én gang)**
1. *Authentication → Sign-in method*: slå **Google** og **Email/Password** til.
2. *Authentication → Settings → Authorized domains*: `golf.vejleaa.dk` og `cvejleaa.github.io` (skulle være der fra golf-synken).
3. Regler: fra en mappe med repoet (fx Cloud Shell: `git clone -b claude/himmerland-golf-scorecard-7g3jkj https://github.com/cvejleaa/Himmerland.git && cd Himmerland`)
   kør `firebase deploy --only firestore:rules`. `firebase.json` peger på databasen `golf`, og `firestore.rules` dækker `spil`,
   `brugere` og `terningspil`.
4. Push: *Project settings → Cloud Messaging → Web configuration → Web Push certificates → Generate key pair*, og
   sæt nøglen som `vapidKey` i `public/firebase-config.js`. Cloud Functions kræver Blaze-planen (betaling slået
   til; forbruget her ligger langt under det gratis niveau): `cd functions && npm install`, derefter
   `firebase deploy --only functions`. Funktionen ligger i europe-west4, som hører til databasens placering eur3;
   klager deployet over placeringen, rettes `region` i `functions/index.js` til den region, fejlen nævner. Uden functions
   virker alt andet – der kommer bare ingen beskeder.

Datamodel: `brugere/{uid}` (navn, e-mail, push-tokens) og `terningspil/{id}` (type, indstillinger, spillere, status
`venter`/`igang`/`slut`, `tur` = uid'et der har turen, `state` = hele spiltilstanden, `rev`, placeringer). Reglerne
lader kun spilleren med turen skrive under spillet, deltagerne skrive efter 3 dages stilhed, ejeren starte og
slette, og alle indloggede finde ventende spil på koden.

## 📴 Terningspillene uden net

Mexico og 10.000 kan spilles uden forbindelse. `public/sw.js` er en service worker, der ved første besøg gemmer
de to spilsider, deres manifester og ikoner på telefonen. Derefter hentes siden fra nettet, når der er net (så
en ny udgave slår igennem med det samme), og fra telefonen, når der ikke er. Golf-scorekortet og dets synk
rører den ikke. Et igangværende spil ligger i forvejen i browserens localStorage.

Spillene kan lægges på hjemmeskærmen som apps: `mexico.webmanifest` og `10000.webmanifest` giver navn, ikon
(`public/ikoner/`) og fuldskærm uden browserlinjer. På Android: menuen → *Føj til startskærm* (eller
*Installer app*). På iPhone: Del-knappen → *Føj til hjemmeskærm*. Første gang spillet er gemt, siger en lille
besked det, og ryger nettet, siger spillet at det kører videre.

Skal cachen tømmes efter en ændring i `sw.js`, tælles `VERSION` op i filen; gamle caches slettes automatisk.

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
| `public/10000.html` | Terningspillet 10.000 – selvstændig side uden synk |
| `public/sw.js`, `public/*.webmanifest`, `public/ikoner/` | Offline-cache og hjemmeskærms-apps for de to terningspil |
| `public/spil.html`, `public/online.js` | Lobby og online-lag for terningspillene: login, spil i skyen, historik, statistik, push |
| `functions/` | Cloud Function der sender "det er din tur"-beskeder |
| `public/firebase-messaging-sw.js` | Service worker der viser push-beskeder |
| `public/firebase-config.js` | Firebase web-config (pladsholdere indtil du udfylder dem) |
| `firebase.json` | Firestore-regler + valgfri Firebase Hosting |
| `firestore.rules` | Adgang til `spil` (golf), `brugere` og `terningspil` |
| `.firebaserc` | Standardprojekt til Firebase CLI |
| `public/CNAME` | Domænet siden svarer på |
| `.github/workflows/deploy.yml` | Udgiver siden ved hvert push |
