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

### Veřejné ověření a korekce výkonu (09:31)

- Plná verze 67eca86 publikována, Cloudflare version 7b109893-2934-4153-a6ad-37c685e14df2. První bezprostřední smoke vrátil starý scaffold, proto deploy nebyl označen za ověřený. Následný health a deployments list potvrdily aktivní revizi/dataset; opakovaný smoke prošel. Doplněno omezené čekání na obsahovou připravenost (45 s), ne maskování pozdějších chyb.
- Veřejný smoke 12 sekvenčních požadavků/cestu: přehled medián 156,7 ms, p95 196,8 ms; filtr 140,2 / 159,8; detail 139,2 / 172,4; plán 137,9 / 140,8; audit 132,1 / 356,3. Časy zahrnují síť a celé tělo; serverový čas je samostatně v Server-Timing.
- Tři veřejné Playwright průchody úspěšné. Desktop obsah viditelný za 485 ms. Simulace mobilu 390×844, 150 ms latence, 1,6 Mbps down / 0,6 Mbps up, 4× CPU, bez cache: LCP 436 ms. Jeden vzorek není produkční distribuce.
- Doplňková runtime kontrola odhalila 44–74 ms CPU přes rychlý HTTP výsledek. Oficiální Workers Free limit je 10 ms, proto nelze tvrdit vhodnost pro tento tarif. Nastavení Workeru hlásí usage_model=standard, konkrétní billing plán nelze s OAuth oprávněním číst (403). Žádné placené služby ani tarif nebyly objednány/změněny.
- Oprava: audit se načítá jen pro auditní stránku, neměnný dataset je možné znovu použít v paměti stejného Worker isolate. Aktivní pointer se vždy čte z DB, chyba DB stále vrací 503 a změna datasetu invaliduje cache. Lokální testy/E2E prošly, veřejné CPU se musí přeměřit.

### Dokončení a veřejný zdroj (09:41)

- Optimalizovaná revize 2311d72 nasazena a obsahově ověřena. Opakované veřejné E2E prošly; desktop 315 ms do viditelného obsahu a simulovaný mobil LCP 372 ms v jednom vzorku.
- Runtime po optimalizaci: zahřátá sekvenční sada 5–9 ms CPU; první audit 45 ms, některé další požadavky 14–16 ms. Všechny sledované výsledky ok; Free kompatibilitu všech cest nelze tvrdit. Omezení je v README, VERIFICATION i STATUS.
- Čistý export 2311d72: npm ci (audit 0), migrace, seed, 20 tehdejších testů, typecheck, build i samostatný server 8790 s kontrolou skutečného datasetu prošly. První E2E z exportu znovu použilo již běžící server, proto nebylo vydáváno za nezávislý důkaz clean boot; ten byl následně ověřen na odděleném portu.
- Dodatečný test ověřuje, že zahřátá cache při výpadku DB vrátí 503. Další dva testy kontrolují Windows-1250/neplatné UTF-8 a negativní volitelnou platnost/rozpor zaměstnání/špatná čísla termínu. Celkem 23 testů prošlo. Oprava AI: i nepovinné školení se zápornou deklarovanou platností musí mít problém, nikoli bezvýhradně přijaté null.
- Uživatel výslovně zvolil zveřejnění zdrojů a minimalizovaného syntetického seedu. Před akcí zkontrolováno 66 historických blobů, bez nálezů cílených vzorů. gh repo edit a následné repo view potvrdily PUBLIC. Originální CSV nikdy nebyla přidána.
- Aktualizována dříve plánovací formulace AGENTS.md podle skutečného schválení. README a jednostránkový Markdown odevzdávací text doplněny; nevytvářel se nevyžádaný PDF/DOCX ani další skill.

### Finální ověření a předání (09:44)

- Aplikační commit 817535a pushnut a nasazen jako Cloudflare version 760b97c2-f8e0-4923-8cbc-8b62abdd920c. Předdeploy 23 testů, typy a build prošly, po deployi obsahový smoke s přesnou revizí/datasetem prošel.
- Finální HTTP malý vzorek: přehled median/p95 67,3/86,2 ms; filtr 63,9/82,7; detail 60,5/80,4; plán 63,3/71,9; audit 57,6/79,4. Audit první 151,5 ms odděleně. Nejde o SLA nebo garanci cold startu.
- GitHub Actions run 38530086768: completed/success, včetně E2E a čistého lokálního seedu. Anonymní GitHub API i raw README vracejí 200; zdroje jsou pro hodnotitele dostupné bez přihlášení.
- Ručně ověřena ochrana deploye: nečistý strom odmítnut před publikací. U posledních dvou deployů byl uveden konkrétní předchozí ověřený version ID jako případný rollback; smoke prošel, návrat nebyl spuštěn.
- V rozsahu MVP hotovo před 12:20. Zůstávají výslovné produkční výluky a CPU/Free omezení popsané v dokumentaci. Žádná neověřená billing informace nebo produkční garance se nevydává za fakt.
- Závěrečný commit aktualizuje pouze dokumentaci výsledků; běžící aplikační revize zůstává 817535a.

## 2026-10-14 — uživatelská oponentura první verze (10:04–10:12)

- Uživatel: zkratky školení v návrhu nejsou dost srozumitelné; požaduje lidské názvy. Nerozumí vysvětlení volby, výrazu „prověřit nejistotu“ ani prioritě heuristiky. Toto je skutečná lidská připomínka, nikoli AI oponentura.
- Rozhodnutí AI v autorizovaném rozsahu: doplnit názvy do přiřazených i nezařazených potřeb; oddělit důvod potřeby, pořadí a důvod termínu. Pravidlo priority bez nového rozhodnutí uživatele neměnit.
- Návrh nyní nese skutečné pořadí zpracování, pořadí školení/osoby, rozhodné datum a jeho původ (nástup/konec platnosti), kapacitu před přiřazením a přeskočené kandidáty kvůli kapacitě, kolizi či způsobilosti. Zobrazení nezaměňuje toto pořadí za globální bodové skóre naléhavosti.
- Výslovně vysvětlen důsledek dosavadního pravidla: staré datum nástupu u chybějícího školení může mít přednost před nedávno prošlým školením; nejprve se zpracuje celý kurz. Nezavedena neodsouhlasená preference „prošlé vždy první“.
- „K ověření“ dostalo vysvětlení na přehledu, návrhu i detailu, konkrétní chybějící údaj nebo ID/řádek problémového dokladu a odkaz na další krok. Počty ručního ověření jsou založené na kategorii, nikoli hledání slov v textu.
- Porovnání proti předchozí implementaci na datech 2026-10-01, 2026-10-20 a 2026-11-15 potvrdilo shodné přiřazení i nezařazené dvojice osoba/kurz. Výchozí výsledek nadále 148 přiřazení a 66 nezařazených potřeb.
- Před nasazením: 26 testů, typecheck, build a 4 lokální E2E prošly. Nové testy vysvětlují skutečné pořadí (včetně chybějícího staršího před prošlým), jeho shody, trace kolizí a konkrétní problémy dat. Vizuálně ověřen desktopový návrh; veřejný deploy nové revize ještě čeká.

### Ověření zapracovaných připomínek (10:14)

- Commit e831be3 pushnut, nasazen jako Cloudflare version 1b667c2c-0d83-464e-87f8-93630bc1d0e4. Předdeploy kontroly a veřejný obsahový smoke prošly.
- Čtyři veřejné E2E úspěšné: zahrnují názvy školení a pořadí i cestu „K ověření“ → detail s konkrétním chybějícím útvarem. GitHub CI run 38533480633 completed/success.
- Návrh HTTP median/p95 77/114,2 ms; přehled 96/507,7 ms včetně přenosu, jeho serverové p95 302 ms. Desktop obsah 260 ms, simulovaný mobil LCP 364 ms. Metodika a omezení v VERIFICATION.md. Nové CPU měření neproběhlo, starší omezení Free se neodvolává.
- Dokončovací dokumentační commit nemění nasazenou revizi. Přiřazovací pravidlo nezměněno a nezaměněno za nově schválenou obchodní prioritu.

## 2026-10-14 — schválené zjednodušení přehledu (10:22–10:28)

- Uživatel souhlasí s navrženým přehledem a výslovně žádá implementaci: graf aktuálního splnění, tři konkrétní pracovní výzvy, méně naléhavé obnovy do 60 dnů, podrobné rozdělení k rozbalení, jednoduché filtry a stručnější úvod plánovače.
- Graf je nativní HTML progress bez knihovny/JavaScriptu a bez inline stylů blokovaných CSP. Počítá disjunktní skupiny osob: všechny známé povinnosti aktuálně splněny vs. řešit/ověřit. Expirující, ale ještě platné doklady plnění nesnižují; nejistá povinnost jej nepotvrzuje.
- Výchozí aktivní snapshot: 90/153 splněno, 63 řešit/ověřit. Úkoly 21 osob / 39 prošlých povinností, 42 / 49 chybějících, 4 / 8 k ověření; obnovy 73 / 82. Osoby mezi úkoly se mohou překrývat, uživatelsky označeno.
- Úkoly odkazují na filtrovaný seznam se zachováním data/útvaru/hledání/způsobilosti. Graf a úkoly vyhodnocují celý aktuální výběr, filtr stavu omezuje seznam; popis je viditelný. Upravené pokročilé filtry se automaticky otevřou.
- Prázdný výběr nemá graf s falešným splněním ani tvrzení o absenci problémů. Podrobné počty jsou k rozbalení. V plánovači zůstává krátké shrnutí; plný algoritmus je k rozbalení.
- 29 testů, typecheck, build a 5 lokálních E2E prošly. Nové testy ověřují unikátní osoby proti překryvům úkolů, nejisté/nepovinné povinnosti, skutečný snapshot, odkazy a zachování filtrů i prázdný výběr. Vizuálně zkontrolován desktop a mobil. Před publikací ještě dolaďujeme text vybraného rozsahu a skloňování počtů.

- Dokončení lokálního ověření (10:30): popis vybraného rozsahu nad grafem a skloňování počtů doplněny; typecheck, 29 testů, build a 5 E2E úspěšné. Lokální browser timing 108 ms do viditelného obsahu, simulovaný mobil LCP 356 ms (jednotlivé vzorky, nikoli SLA). Připraveno ke commitu a veřejnému ověření.

### Veřejné ověření zjednodušeného přehledu (10:34)

- Commit 4266f2b pushnut a nasazen jako Cloudflare version a9cff5a8-dff0-4012-a28b-ecd2fd05c3ac. Deployment gate a obsahový smoke úspěšné; připraven návrat k předchozí ověřené verzi, nebyl potřeba.
- Všech 5 veřejných E2E a GitHub Actions run 38535706839 completed/success. Ověřeny skutečné hodnoty grafu, odkazy úkolů, zachování výběru, viditelnost aktivních filtrů i rozbalení podrobné priority plánovače.
- Přehled HTTP medián/p95 96,6/237,9 ms (server p95 90 ms), plán 88,5/703,6 ms (server p95 25 ms). Desktop obsah 298 ms, simulovaný mobil LCP 380 ms. Malé vzorky a podmínky popsány ve VERIFICATION; nezaměňují se síť a CPU/server.
- Závěrečná dokumentace zachycuje schválení a ověření; běžící revize zůstává 4266f2b.

## 2026-10-14 — oprava zápisu křestních jmen (10:38–10:47)

- Uživatel upozornil na zjevný caps-lock zápis „LUCIE“ místo „Lucie“. Kontrola čtyř původních syntetických exportů zjistila šest takových běžných křestních jmen v zaměstnancích (E0020, E0065, E0079, E0087, E0142, E0162), žádné all-caps příjmení.
- AI volba v rámci opravy stejného problému: explicitní seznam šesti ověřených podob LUCIE/HANA/MARTINA/ZUZANA/JANA/ALEŠ. Nejde o uživatelovo výslovné schválení obecného automatického přepisování všech jmen; takové pravidlo se nezavedlo. Příjmení, složená a neznámá jména se netitle-casují.
- Oprava probíhá při importu, každá z šesti změn má audit (soubor, logický řádek, ID, důvod), bez jmenných hodnot v auditním textu. Identita výhradně podle ID. Test ověřuje i stejné výsledné jméno dvou různých ID, diakritiku a zachování nestandardního zápisu.
- Nový dataset 8329fc51214bfc0b, stále 174 osob, 10 školení, 2 860 dokladů, 34 termínů; audit 4 433 událostí (přidáno 6 oprav). Original CSV zůstávají beze změn mimo Git.
- Porovnání před/po: změněno přesně šest name hodnot, ostatní atributy zaměstnanců, katalog, doklady a termíny identické. Předchozí audit beze změny po odfiltrování šesti nových oprav. Přiřazení na třech datech přesně shodná; souhrn nadále 90/153 splněno, 63 řešit/ověřit.
- Lokální seed a aktivace nového datasetu proběhly; 30 testů, typecheck, build a 6 E2E prošly včetně zobrazení Lucie na E0020 a dohledání opravy v auditu. Veřejná záloha, aktivace a deployment ještě čekají.

### Veřejné ověření opravy jmen (10:54)

- Před vzdálenou změnou úspěšně exportována D1 do ignorovaného .artifacts/pre-name-normalization-20261014.sql. Staging a aktivace nového datasetu proběhly, předchozí dataset zůstává uložený.
- Commit 1b38fb4 nasazen jako Cloudflare version 9acdf47e-385d-4671-840e-41c6661caa98. Veřejný smoke potvrzuje nový dataset 8329fc51214bfc0b, revizi a počty.
- Šest veřejných E2E včetně jména Lucie a auditního záznamu opravy úspěšných; GitHub Actions run 38537710754 completed/success.
- Změna je pouze formát jmen a přidaný audit, nezvyšuje/nepotvrzuje proškolení ani neslučuje osoby. Závěrečný dokumentační commit nemění běžící revizi.

## 2026-10-14 — optimalizace auditu a závěrečná přejímka (10:56–11:04)

- Uživatel schválil pokračování: odlehčení auditu SQL filtrem/stránkováním, nové měření prvního a opakovaného načtení a dokončení přejímky dokumentace.
- Nová auditní cesta čte aktivní metadata, malé SQL agregace, počet nalezených a nejvýše 30 payloadů s explicitním pořadím. Nevolá obecné načítání celého datasetu; údaje školení na ní nejsou závislostí. Hledání ID zachovává literální podřetězec, hodnoty jsou bind parametry. Filtr úrovně má nedestruktivní index.
- Souhrn oprav/odmítnutí/varování a důvodů stále pokrývá celý dataset, počet nalezených a tabulka respektují filtry. Mimo rozsah stránky se přechází na poslední skutečnou stránku.
- Health probe nyní čte metadata a SQL počty bez parsování tisíců payloadů. Nezaměňujeme jej za validaci každého obsahu: smoke stále otevírá reprezentativní stránky a E2E skutečný průchod.
- 32 testů, typecheck, build a 7 lokálních E2E prošly. Nové testy porovnávají SQL výsledky s kompletním auditem, stabilitu stránek a globální souhrny, literální injekční/wildcard vstup, nezávislost auditu na vadném training payloadu a zachování 503 při výpadku DB. Skutečný lokální D1 index aplikován, migrace testů načítají všechny SQL soubory.
- Runtime sumarizátor přidává pouze třídu routy a timestamp pro přiřazení CPU měření; neukládá query, employee ID, IP ani hlavičky. Syntetický test prokázal odstranění těchto hodnot. Veřejné CPU měření nové verze zatím čeká.

- Pro nové veřejné měření smoke prochází audit první po count-only health a ověřuje nefiltrovanou i filtrovanou variantu. Celkem šest cest × 12 sekvenčních požadavků, první zvlášť. Nejde o garantovaný nový isolate ani zátěžový test.


## 2026-10-14 — veřejné ověření SQL auditu a přejímka (11:10–11:15)

- Commit fb600f5 zveřejněn, vzdálená migrace 0002 úspěšná. Nasazena verze 8e826edf-e3ea-47d9-b857-713b2fe4d4a4 se stejným datasetem 8329fc51214bfc0b; deploy gate a obsahový smoke úspěšné, automatický rollback nebyl potřeba.
- 32 testů, build a 7 veřejných E2E úspěšných. GitHub CI 38539835227 success včetně čisté instalace, migrací, seedu a browser testů. Desktop obsah 315 ms, simulovaný mobil LCP 372 ms; jednotlivé vzorky, nikoli SLA.
- Sanitizovaný runtime tail zachytil 32 událostí nové verze, všechny ok. Audit n=13: první 12 ms CPU, dalších 12 hodnot 2–8 ms; proti staršímu prvnímu auditu 45 ms jde o orientační zlepšení, nikoli kontrolovaný cold-start experiment. Tail nezachytil každý požadavek. Přehled první 57 ms, plánovač maximum 61 ms: CPU/Free omezení celé aplikace přetrvává, výsledek není označen jako úplné vyřešení. Měření ukončeno, pouze minimalizovaný lokální artefakt mimo Git.
- HTTP smoke šest cest × 12 bez chyb; audit median/p95 155,5/198,1 ms, přehled 89,9/131,4, návrh 90,2/102,9. Čekání na DB i síť se neplete s CPU; audit přidal několik malých SQL dotazů výměnou za nezávislost a omezené parsování.
- Zkontrolována shoda README s package scripts/CI/migracemi a aktuální stručné odevzdání. Výsledky a podmínky doplněny do VERIFICATION/STATUS; žádné další služby ani tarif nebyly zavedeny. Závěrečná přejímka schválené iterace hotová před 12:20, zůstávají výslovné produkční výluky.


## 2026-10-14 — double-check FE filtrů (11:17–11:23)

- Uživatel požádal o další kontrolu korektnosti FE filtrů a doplnění testů. Ručně zkontrolováno propojení formulářů, validace HTTP, výběr zaměstnanců a SQL audit; přidána samostatná browser sada `tests/e2e/filters.spec.ts` s osmi scénáři.
- Očekávané výsledky vycházejí z minimalizovaného snapshotu a již testovaných doménových pravidel, nikoli z view filtrační funkce. Kontrolují se konkrétní ID/pořadí a celkové počty: všech devět útvarů, všech šest způsobilostí, všech pět stavů povinnosti, hledání jména/ID bez ohledu na velikost písmen a s českou diakritikou, průniky filtrů i prázdný výběr.
- Stránkování prověřuje všech 174 osob bez vynechání/duplicit, poslední stránku při zastaralém page=9999, zachování parametrů, detail/zpět a změnu filtru z druhé stránky. Reset maže výběr, ale záměrně zachovává referenční datum. Filtr stavu omezuje seznam a nemění graf populace, což sada výslovně chrání.
- Audit kontroluje současný filtr ID a každé úrovně události, přesné počty, ID i úrovně zobrazených řádků, další stránku a zachování data. Další scénáře: literální HTML/SQL znaky, odmítnutí neplatných URL hodnot, mobilní kombinace, Enter a reload.
- První spuštění zablokoval sandbox lokálních portů/logů; opakováno přes schválení oprávnění. Počáteční chyby nových testů byly nevhodné getByLabel pro select a kontrola aktivní hodnoty v úmyslně zavřených dalších filtrech; opraveny selektory/otevření, nikoli funkce aplikace. V ověřovaném chování filtrů nebyla nalezena aplikační chyba.
- Kompletní `npm run check` (32 unit/integration testů, typecheck, build) a všech 15 lokálních browser testů úspěšných. Aplikační zdroje, dataset a veřejná revize fb600f5 se nemění; tento milník přidává testy a dokumentaci.
- Všech 15 veřejných E2E úspěšných (25,1 s), včetně nové sady filtrů. Orientační desktop obsah 404 ms, simulovaný mobil LCP 376 ms; jednotlivé vzorky za dosavadních podmínek, nikoli nové výkonové SLA. Změna nepotřebuje deploy aplikace, protože neobsahuje běhový kód.

[CI testovacího commitu 40c3d0d](https://github.com/Mooore/muni-training-evidence/actions/runs/38542018773) úspěšné: čistá instalace, 32 unit/integration testů, typy/build, migrace/seed a všech 15 browser testů.


## 2026-10-14 — filtr druhu školení (11:25–11:29)

- Uživatel výslovně žádá filtr konkrétního školení, aby šlo zjistit například pokrytí BOZP. Doplněn viditelný select názvu/kódu a validace course proti katalogu; výběr zachovávají úkoly i stránkování, reset jej ruší.
- Graf, souhrny, úkoly a řádkové stavy vycházejí jen z vybraného kurzu. Osoby bez povinnosti pro tento kurz nejsou započteny jako splněné, počet nezahrnutých je explicitní. Nejistá povinnost zůstává v jmenovateli a nepotvrzuje splnění. Nepovinné ANGL má prázdný graf s vysvětlením místo falešného 100 %.
- Referenční výsledek BOZP-Z k 1. 10. 2026 mezi aktivními: 137/153 aktuálně splněno, z toho 2 končí do 60 dnů; 9 prošlých a 7 chybějících. Dataset, import a plánovací pravidla se nemění.
- Dva nové browser scénáře ověřují všech deset kurzů, přesné osoby, čitatel/jmenovatel grafu, jen jeden kurz v řádkových počtech, nepovinné kurzy, průnik se všemi stavy v útvaru, úkoly, stránkování a reset. Mobilní Enter/reload nyní také obsahuje BOZP. 17 lokálních E2E úspěšných. Po zpřesnění přístupného názvu grafu čeká veřejné ověření.
