# Work log a záznam použití AI

Pravidlo: zaznamenáváme významná rozhodnutí, důvody, ověření a oponenturu. Návrh AI není schválené rozhodnutí. Nevymýšlíme lidské připomínky ani osobně odpracovaný čas. Čtyřhodinový rozpočet zahrnuje analýzu, vývoj, nasazení a odevzdání; přesný začátek měření ještě nebyl dohodnut.

## 2026-10-14 — analýza a plánování

- Uživatel: požaduje funkční omezenou aplikaci pro výběrové řízení, produkční kvalitu základů, moderní lehký stack, možnost rozšíření, bezpečnost a limit přibližně čtyř hodin. Vzhled má nízkou prioritu. Chce plán schválit a průběžně oponovat AI návrhům.
- AI: OpenAI Codex v této relaci; analýza CSV pomocí Python standardní knihovny, návrh doménových pravidel a architektury, krátký průzkum oficiální dokumentace Hono, Fastify a Cloudflare D1. Přesná identifikace modelu není v relaci ověřena.
- Stav: žádná aplikace nebyla implementována. Vytvořen reprodukovatelný audit a plán k diskusi.
- Zjištění: 174 zaměstnanců, 10 školení, 34 termínů, 2 868 absolvování. Tři UTF-8 exporty, absolvování Windows-1250; dva oddělovače. CSV obsahuje citované víceřádkové buňky; musí se číst skutečným CSV parserem.
- Oprava AI výstupu: první předpoklad společného UTF-8 kódování neplatil; ani společné Windows-1250. Následně určeno kódování po souborech. Prvotní splitlines() ztratil odřádkování v buňkách; trvalý audit používá StringIO s newline=''. Shellový head byl v prostředí jiný program; čtení převedeno na Python.
- Bezpečnost: rodná čísla nejsou potřebná. Nenahrávat originální CSV do veřejného repozitáře; publikovat pouze minimalizovaná syntetická seed data. V poznámkách jsou vzorce pro tabulkové aplikace; exporty musí zamezit CSV injection.
- Provozní překážky: git init odmítnut kvůli zápisu do .git; gh auth status hlásí neplatný token. Nevytvořen lokální ani vzdálený repozitář, nebylo nasazeno.
- Návrh AI k diskusi: TypeScript + Hono + jednoduché serverem vykreslené HTML + SQLite/D1, modulární monolit. Plánování jako vysvětlitelný návrh, bez skutečných registrací.
- Oponentura uživatele: zatím žádná reakce na konkrétní návrh. Příští připomínky zaznamenat doslovně nebo věrnou parafrází spolu s dopadem na řešení.

## Šablona dalšího záznamu

- Čas / fáze:
- Problém a návrh AI:
- Oponentura uživatele:
- Výsledné rozhodnutí a důvod:
- Změněné soubory / commit:
- Ověření a výsledek:
- Vědomě vynecháno / zbývající riziko:

### Doplnění zadání uživatelem

- Uživatel potvrzuje, že všechna vstupní data jsou absolutně syntetická a reálný únik nehrozí. Požaduje však simulaci zacházení s citlivými daty. Dopad: minimalizace není reakce na skutečné osobní údaje, ale demonstrace bezpečného návrhu.
- Uživatel potvrzuje zcela čistý projekt a ukládá AI vytvořit Markdown dokumentaci a zvolit vhodné skills.
- Vytvořeny AGENTS.md, README.md, docs/PLAN.md a tento log. Skill zvolen podle fáze: analýza přímo Pythonem, pro realizaci webu bude vyhodnocen sites:sites. Zatím žádný skill nebyl aplikován.

### Nezávislá kontrola a skills

- Uživatel výslovně žádá postupné subagenty k průběžné kontrole a přímé oponentuře AI práce. Spuštěn read-only agent `oponent` pro plán a audit; jeho připomínky budou vedeny jako AI revize, nikoli lidská oponentura.
- Přečten skill sites:sites. Pro serverové aplikace nabízí Cloudflare Workers a explicitní Worker ESM starter; výchozí serverový Vinext starter by byl pro tento rozsah zbytečně těžký. Před realizací ověřit možnost veřejného přístupu bez účtu: nové Sites jsou podle skillu privátní, což samo o sobě nesplňuje otevření hodnotiteli bez dalšího účtu. Hono/D1 zůstává návrhem, žádná Site ani infrastruktura nebyla vytvořena.

### Oponentura subagenta — první revize

- AI oponent upozornil na způsobilost k dni termínu, rozdíl mezi nejistou povinností a dokladem, únik emailů do souhrnného auditu, neúplnou validaci, závislost plánovače na pořadí kurzů a nereálnost časového plánu bez ověřené infrastruktury.
- Přijato: odstraněny konkrétní emaily z verzovaného JSON a auditu, nahrazeny počtem duplicitních skupin. Audit přijímá cestu k exportům jako argument; výsledek po této změně ověřen porovnáním s předchozím reportem (před změnou minimalizace).
- Doplněna pravidla do plánu. Rozšíření validátoru ponecháno implementační fázi; dnešní audit je prvotní profil a nepředstírá kompletní kontrolu.
- Tato revize je AI oponentura. Uživatel zatím konkrétní stack/doménová pravidla neschválil.

### Testování a návrh Sass

- Uživatel souhlasně reaguje na vysvětlení stacku a požaduje automatické kontroly zdrojů, chování a deploymentu tam, kde dávají smysl, včetně bezpečných fallbacků a rollbacků.
- Uživatel navrhuje základní Sass bez frameworku a nástřel design systému. AI doporučuje SCSS/Dart Sass, CSS proměnné a malou sadu sémantických komponent. Dřívější návrh obyčejného CSS byl minimalizace build nástrojů, nikoli argument proti Sass.
- Rozšířen plán o smysluplné testovací vrstvy a selhání importu/DB/plánování/deploymentu. Výslovně oddělen rollback kódu od obnovy databáze. Žádné testy aplikace ještě nebyly napsány nebo spuštěny.

### Schválení plánu a Git

- Uživatel schvaluje plán a výslovně autorizuje AI k dalšímu samostatnému commitování. Požaduje celkovou rekapitulaci a následující kroky.
- Lokálně ověřeno: Git existuje, větev main sleduje origin/main, origin je https://github.com/Mooore/muni-training-evidence.git. Počáteční commit 401aacc: docs: add initial analysis and implementation proposal. Pracovní strom byl před tímto záznamem čistý.
- Živé ověření vzdáleného repozitáře nebylo možné: gh hlásí neplatný token/chybu připojení a git ls-remote selhal na DNS github.com. Lokální napojení není důkaz vzdálené dostupnosti ani oprávnění push.
- Schválený návrh: TypeScript, Hono, serverové HTML, SCSS/Dart Sass bez CSS frameworku, D1/SQLite, oddělená doména, cílené automatické testy a kontrola deploymentu. Reálné rezervace a autentizace mimo MVP, syntetická data zpracovávaná jako citlivá.

### Výkon a sledování postupu

- Uživatel přidává rychlost a výkon jako klíčový aspekt; běžný klik nesmí trvat několik sekund. Žádá průběžné hlášení aktuálního/následujícího kroku a časového stavu.
- AI doplnila výkonové cíle a způsob měření do plánu. Jde o cíle, žádná aplikace ani naměřený výkon zatím neexistují.
- Zavedeno docs/STATUS.md pro sledování sedmi implementačních kroků. Přesný začátek společného čtyřhodinového měření není doložen; nesmí být vymyšlen ani vynulován při implementaci.

### Krok 1 — ověření po zahájení implementace (08:47)

- Uživatel upřesnil začátek cca 08:00 s přestávkami a konec cca 12:20; v 08:47 zbývá cca 213 minut.
- Opakované ověření: git ls-remote selhal na DNS, gh auth status hlásí neplatný token, git add selhal na zakázaném zápisu .git/index.lock. GitHub konektor GET repo vrátil 404; soukromý repozitář může být konektoru nepřístupný. Dostupnost repo není potvrzena.
- Krok 1 není hotový. Potřeba oprávnění zápisu .git a funkční přístup GitHub. Návrh pracovní kopie v /tmp opuštěn, protože nesmí obcházet výslovnou restrikci .git.
- Změny dokumentace existují v pracovním stromu, nejsou commitnuté ani pushnuté.

### Pokračování se schválenými oprávněními (09:00)

- Uživatel potvrzuje schválení plánu, autorizuje implementaci a průběžné commity, stanovuje konec 12:20.
- Ověření mimo sandbox se schválením: git ls-remote origin HEAD úspěšné, gh auth status potvrzuje účet Mooore, gh repo view potvrzuje soukromý repozitář Mooore/muni-training-evidence. Předchozí síťová překážka není aktuální.
- Plán označen za schválený; původní návrhové formulace a předpoklady uvnitř dokumentu zůstávají dohledatelné.
- Přečten a vyhodnocen skill sites:sites; zatím nebyla vytvořena Site ani ověřen deployment.

### Základ aplikace a hosting (09:08)

- Commit dokumentace 63776ce úspěšně pushnut na GitHub.
- Vytvořen Hono/Workers scaffold, TypeScript, SCSS, Vitest a CI. První health test a produkční dry-run build prošly. Build vyžadoval oprávnění zápisu lokálních logů Wrangleru; ověřeno mimo sandbox se schválením.
- Oprava AI: původně zvolená datovaná verze Workers types neexistovala. Ověřena skutečná verze npm. Audit nalezl problémy ve starších dev závislostech Vitest a csv-parse; aktualizovány, npm uvádí 0 zranitelností.
- Uživatel dokončil Cloudflare OAuth. CLI potvrzuje přihlášení; vytvořena vyhrazená D1 databáze muni-training-evidence. Zatím není nasazená aplikace.
- Sites vyhodnocen, pro schválený stack používáme přímo Cloudflare účet a Wrangler; nevytváříme další Site ani kopii repozitáře.
- Uživatel poskytl cesty originálů v Downloads. Zůstávají mimo Git; generovaný seed obsahuje pouze povolená doménová pole. Import a doména rozpracované.

### Import a doménový základ (09:13)

- Import skutečně přečetl čtyři exporty z Downloads. Minimalizovaný seed neobsahuje emaily, rodná čísla, poskytovatele ani volné poznámky. Přesné duplicity se porovnávají před minimalizací, aby se nezkryly konflikty zdroje.
- 7 přesných duplicit a 1 opakovaná hlavička odmítnuty, 2 860 dokladů zachováno; 33 rozporů platnosti s katalogem a 16 konfliktních verzí ID označeno jako nedůvěryhodné.
- Lokální migrace a seed úspěšné. Oddělená aktivace datasetu kontroluje počty všech tabulek; částečný staging nenahradí aktivní dataset. D1 ukládá pouze minimalizované JSON payloady s indexovanými doménovými klíči.
- Veřejný scaffold nasazen a ověřen /health s očekávanou verzí a deklarací not-imported. URL: https://muni-training-evidence.mirinda-posp.workers.dev. Plná aplikace zatím nenasazena.
- 18 unit testů importu, domény, plánovače a bezpečného selhání prošlo. UI a plánovač jsou rozpracované, čekají na integrační/E2E ověření.

### UI, plánovač a lokální ověření (09:20)

- Přehled odděluje osoby od povinností, filtruje útvar/jméno/ID/způsobilost/stav; detail ukazuje pravidlo, poslední důvěryhodný doklad i problematické záznamy. Audit stránkovaný a filtrovatelný, přehled termínů.
- Plánovač pracuje napříč kurzy, odečítá obsazenost, kontroluje intervalové kolize a způsobilost v den termínu. Deterministické pořadí, obnova nejpozději před expirací, opožděné řešení označené. Návrh nic nerezervuje.
- 20 unit/integration testů, typecheck a build prošly; 2 Playwright průchody nad skutečným lokálním D1/Workerem prošly (filtr/detail/návrh/audit; mobil/klávesnice/prázdný/chybový stav). První E2E selhal na getByLabel exact pro select; role-based selektor opraven, aplikace se nevydávala za ověřenou před opakováním.
- Lokální rollback datasetu nacvičen v SQLite integračním testu: neúplný staging aktivní data nenahradil, nová kopie aktivována a předchozí pointer úspěšně obnoven.
- Lokální HTTP smoke: 12 sekvenčních požadavků na 5 cest; mediány 22,5–26,4 ms, nejvyšší malé-vzorkové p95 63,5 ms včetně přenosu. Nejde o produkční statistiku.
- Doména 174 osob / 2 860 dokladů: přehled 12,4 ms, plán 4,5 ms; 10× deterministická sada: přehled 32,5 ms, plán 27,1 ms. Kapacita, duplicity, kolize, způsobilost a nezávislost na pořadí ověřeny na obou sadách.
- GitHub CI scaffold i import commitů úspěšné. Doplněn E2E krok CI. Veřejná plná verze a výkon hostingu ještě čekají.
- Nativní náhled v dostupném CUA nelze otevřít: prohlížeče iab/chrome nejsou dostupné. Automatický Playwright s instalovaným Chrome funguje; UI ověřujeme touto cestou.

### Korekce při vizuální kontrole (09:22)

- Screenshot mobilu ukázal, že stavy školení zůstávaly za okrajem posuvné tabulky. Přehled na mobilu převeden CSS na karty osob; ostatní široké tabulky mají fokusovatelný pojmenovaný posuvný region. E2E znovu prošly.
- Doplněn počet osob se všemi aktuálně splněnými povinnostmi (včetně brzy končících); jednotlivé stavové karty nejsou celková míra splnění.
- Oprava auditního počtu: stejná chyba data se zaznamenávala dvakrát (v parseru a v souhrnu řádku). Odstraněno 7 duplicitních událostí; aktuálně 4 427 událostí, dataset 239aef0a043c4b76. Počty osob, dokladů a termínů se nemění.
- Vzdálená migrace a první staging syntetických dat úspěšné. Aktuální dataset po korekci bude nahrán a aktivován před plným deployem.
