# Evidence školení — praktický úkol MUNI

Čtecí demonstrace evidence povinných školení a vysvětlitelného návrhu přiřazení na termíny. Všechna data jsou syntetická. Výchozí vyhodnocení je **historický snapshot k 1. 10. 2026**, nikoli živá evidence.

Demo: https://muni-training-evidence.mirinda-posp.workers.dev

Zdroj: https://github.com/Mooore/muni-training-evidence.

## Lokální spuštění

Node.js 22.17+ (testy používají experimentální vestavěný SQLite), npm, Git. Pro lokální demo není nutný Cloudflare účet ani originální CSV.

```sh
npm ci
npm run db:local
npm run seed:local
npm run build:css
npm run dev
```

Otevřít http://localhost:8787. Databáze se ukládá do ignorovaného `.wrangler/`. Seed i migrace lze spustit znovu. Příkazy neprovádějí vzdálené zápisy, pokud není výslovně přidáno `--remote`.

```sh
npm run check        # typy, unit/integration testy, produkční dry-run build
npx playwright install chromium
CI=1 npm run test:e2e  # spustí vlastní lokální server, pokud žádný neběží
npm run smoke -- http://localhost:8787
npx tsx scripts/verify/domain.ts
```

Na macOS E2E standardně používají instalovaný Google Chrome; v CI používají Chromium instalované Playwrightem. Pro jiný systém použít `CI=1`. Jestli server již běží lokálně, spustit `npm run test:e2e` bez `CI=1`, nebo zadat `BASE_URL=http://localhost:8787`. GitHub CI provádí také čistou migraci, seed a prohlížečové průchody. Samostatná sada `tests/e2e/filters.spec.ts` ověřuje přesná ID a počty pro útvary, způsobilosti, stavy, kombinace hledání, stránkování, reset, datum, audit i mobilní odeslání Enterem.

## Izolované lokální spuštění přes Docker Compose

Ověřeno na Docker Desktop 29.4.3 / Linux arm64: build včetně typů a 32 unit/integration testů, skutečný start, obsahový HTTP smoke, 25 browser scénářů a zachování svazku po znovuvytvoření kontejneru.

```sh
docker compose up --build -d
docker compose logs -f app
```

Otevřít http://localhost:8787. Image připraví závislosti, ověří typy/testy a sestaví CSS; start aplikuje lokální migrace a minimalizovaný seed. Cloudflare účet ani originální CSV nejsou potřeba. Port je dostupný pouze na loopback hostitele. Kontejner běží jako neprivilegovaný uživatel s read-only kořenovým souborovým systémem, dočasným `/tmp` a samostatným svazkem pro lokální D1; bez připojení zdrojů, Docker socketu nebo hostitelských credentials. Omezené capabilities, procesy, paměť a CPU. Kontejner není virtuální stroj a odchozí síť není zakázaná. První build potřebuje síť pro image a npm.

Zastavení: `docker compose down` (data zůstávají). Reset lokálních dat: `docker compose down --volumes` (výslovně smaže pouze svazek tohoto Compose projektu). Při startu se znovu aktivuje dodaný demo snapshot; jde o vývojové prostředí, nikoli produkční nasazení. Změny kódu se do běžícího kontejneru nepřipojují; po úpravě znovu spustit `docker compose up --build -d`. Unit testy běží při buildu image, jejich cache nemusí být zapisovatelná v běžícím read-only kontejneru. Pomocné stahování `Request.cf` metadat Miniflare je pro lokální běh vypnuté.

## Co aplikace řeší

- Přehled s grafem aktuálního splnění (každá osoba jednou), konkrétními úkoly pro prošlá/chybějící školení a nejasné údaje, méně naléhavými obnovami do 60 dnů a odkazy do filtrovaného seznamu. Podrobné počty jsou k rozbalení. Hledání, útvar a konkrétní školení (celý název i kód) jsou viditelné, datum/způsobilost/stav pod dalšími filtry; aktivní omezení je automaticky otevřené.
- Stavové skupiny v seznamu osob mají bublinu s celými názvy a kódy školení. Na desktopu se bublina otevírá vlevo od stavového sloupce, aby šlo plynule přejíždět mezi řádky. Otevření myší nebo klávesnicovým focusem, kliknutím/klepnutím; zavření Escape nebo mimo. Seznam respektuje filtr školení. Nativní kliknutí funguje i bez pomocného JS.
- Detail s pravidlem povinnosti, důvěryhodným dokladem, platností a varováním; historie zahrnuje i problematické doklady.
- Audit oprav, odmítnutí a upozornění se zdrojovým ID a číslem logického CSV řádku.
- Návrh pro 60 dnů: celé názvy školení, skutečné pořadí výpočtu a jeho datum, důvod potřeby a volby termínu, odečtená obsazenost, kolize napříč kurzy, způsobilost v den termínu a konkrétní důvody nezařazení.

Výběr školení omezuje graf, úkoly, stavové počty a seznam na tento kurz. Zahrnuje osoby s povinným kurzem nebo nejasnou povinností; počet osob, pro které kurz není povinný, se uvádí odděleně. Například `/?course=BOZP-Z` ukazuje základní BOZP. Stavový filtr se vztahuje jen na zvolený kurz. Lze zaškrtnout více stavů (OR: alespoň jedna odpovídající povinnost). Bez zaškrtnutí se zobrazují všechny stavy. Zkratka „Vše kromě Platné“ vybere Končí do 60 dnů, Prošlé, Chybí a K ověření; stav Končí do 60 dnů je stále aktuálně platný. Výběr se zachovává v URL, při reloadu a stránkování.

Jedna osoba může být v několika stavových kartách. Nepovinná školení nesnižují splnění. Den expirace je platný včetně; konec do 60 dnů je samostatný stav. „2 roky“ znamená 24 kalendářních měsíců, konec měsíce se ořízne; LEAD je jednorázové. Rozpor zdrojové expirace s katalogem je nejistota. Novější vadný doklad neruší starší důvěryhodný doklad, ale varování zůstává. Neznámý útvar může znamenat nejistou útvarovou povinnost. Identitou je výhradně ID zaměstnance.

Priorita: u chybějícího školení se pro řazení používá nástup, u prošlého či brzy končícího konec platnosti. Nejprve se zpracuje celé školení s nejstarším takovým datem mezi způsobilými potřebami (shoda podle kódu), v něm osoby od nejstaršího data (shoda podle ID). Chybějící školení s dávným nástupem tak může předběhnout nedávno prošlé; nejde o pravidlo „prošlé vždy první“. Nástup zde není potvrzená lhůta pro absolvování. V UI je dohledatelné konkrétní pořadí i rozhodné datum.

**Návrh nic nerezervuje.** Existující účastníci nejsou identifikováni, proto nelze vyloučit již existující rezervaci. Heuristika není globálně optimální; nenalezení přiřazení není důkaz neexistence řešení. Rodičovská, budoucí nástup a nejasná způsobilost se automaticky neplánují. Opožděný termín neznamená souvislou platnost.

## Architektura a import

TypeScript + Hono, serverové HTML bez klientského frameworku, s malým vanilla JS pouze pro hover/focus a umístění bublin, SCSS/Dart Sass, Cloudflare Workers a D1/SQLite. Doména v `src/domain/` nezávisí na Hono ani D1. `src/repository.ts` načítá data dávkově; SQL klíče mají indexy. Audit má samostatný read model: filtr, počty a stránkování se provádějí v SQL, do Workeru přijde nejvýše 30 událostí a malé agregace. Nevyžaduje načtení zaměstnanců/dokladů/termínů. `/health` kontroluje dostupnost aktivního datasetu a jeho počty; obsah a funkční průchod ověřují navazující smoke/E2E, nejde o kontrolu každého payloadu. Minimalizované entity jsou uloženy jako JSON payloady s relačními klíči, nikoli jako plně normalizovaný budoucí produkční model. HTTP poskytuje pouze čtení.

Originální CSV zůstávají mimo Git. Běhová data neobsahují emaily, rodná čísla, volné poznámky ani poskytovatele. Jméno, útvar a pozice zůstávají syntetické. Parser respektuje citované oddělovače a víceřádkové buňky; absolvování čte jako Windows-1250 se středníkem, termíny UTF-8 se středníkem, ostatní UTF-8 s čárkou.

```sh
npm run import -- /cesta/k/originalnim/csv
npm run seed:local
```

Import nejprve validuje strukturu všech souborů v paměti. Chybná hlavička, strukturálně neplatné CSV nebo duplicitní identita zaměstnance import zastaví. Problémové doklady a termíny zůstávají označené; nejsou důvěryhodným důkazem ani plánovací kapacitou. Alias je explicitní, bez fuzzy matching. U šesti ověřených běžných křestních jmen psaných caps lockem se používá výslovný seznam oprav (např. LUCIE → Lucie, ALEŠ → Aleš); každá oprava má audit podle ID a řádku. Neprovádí se obecný title-case osobních jmen ani slučování podle sjednoceného zápisu. Konfliktní verze ID dokladu se nepřepisují. Přesné duplicity se rozpoznávají před minimalizací.

Generuje `data/demo.json`, `seed.sql`, `activate.sql` a `manifest.json`. Seed vytváří nový neměnný dataset. **Aktivace je oddělená a kontroluje úplnost všech tabulek**; přerušený staging neaktivuje částečný dataset. Do vzdálené databáze se nic automaticky neimportuje. Před použitím jiných dat znovu posoudit minimalizaci a veřejný přístup; toto není bezpečný veřejný import libovolných skutečných HR dat.

Prvotní profil lze reprodukovat pomocí `python3 scripts/audit_data.py /cesta/k/exportum`; nejde o plnou validaci aplikace.

## Nasazení a návrat

Vlastník potřebuje Cloudflare účet s Workers/D1. `wrangler.jsonc` odkazuje na databázi tohoto dema; pro vlastní instalaci vytvořit vlastní `npx wrangler d1 create ...` a upravit ID. Přihlášení přes `npx wrangler login`; credentials nevkládat do repozitáře.

```sh
npx wrangler d1 migrations apply DB --remote
npx wrangler d1 export DB --remote --output /bezpecna/cesta/zaloha.sql
npx wrangler d1 execute DB --remote --file data/seed.sql
npx wrangler d1 execute DB --remote --file data/activate.sql
npm run deploy
```

`deploy` spouští typecheck, testy a build před publikací. Vloží revizi Git commitu; následný smoke ověřuje skutečný dataset, počty, revizi, reprezentativní stránky a hlavičky, nikoli jen HTTP 200. Skript odmítne nečistý pracovní strom před kontrolami i po buildu; revize musí odpovídat skutečným zdrojům. Výkonový smoke je omezený na 12 sekvenčních požadavků na šest cest (audit první po lehkém health probe), první odpověď odděluje od dalších.

Pokud již existuje ověřená verze kompatibilní se stejným datasetem, lze nastavit `ROLLBACK_VERSION=<Cloudflare-version-id> npm run deploy`. Při neúspěchu smoke se kód vrátí k této konkrétní verzi a smoke zopakuje; neúspěšný deploy se přesto hlásí jako chyba. Bez explicitní verze se nic naslepo nevrací. Manuálně: `npx wrangler rollback <version-id> --yes`.

Rollback kódu **nevrací data**. Dataset se vrací změnou `active_dataset.dataset_id` na předchozí ověřené ID z `datasets`; nejprve ověřit jeho přítomnost a `validated=1`. Lokální integrační test nacvičuje neúplný staging, aktivaci nové kopie a návrat pointeru. Migrace jsou zatím pouze přidávající. Zálohu držet mimo Git.

## Bezpečnost a hranice

Výstupní text je escapovaný, dotazy na DB parametrizované, filtry a datum validované, stránky mají CSP, no-store a další bezpečnostní hlavičky. Při chybě DB se vrací 503 bez falešných nul; při chybě plánovače se nevydává kompletní návrh. Aplikace nevytváří vlastní přihlašování ani veřejné zapisovací API.

Demo není produkční HR systém. Reálný provoz potřebuje SSO, role a serverovou autorizaci, audit zápisů, pravidla uchování, zálohy a ověřenou obnovu. Skutečné rezervace vyžadují atomickou kontrolu kapacity a idempotenci. Cloudflare tarif má limity; naměřený výkon není SLA. Po SQL optimalizaci měl první zachycený audit 12 ms CPU a další 2–8 ms; některé požadavky přehledu/plánovače stále dosáhly 57/61 ms. Kompatibilita všech cest s Free není potvrzena; podmínky malého měření jsou v dokumentaci ověření. Na stávajícím účtu bylo demo ověřeno bez runtime chyb. Vynecháno: CRUD, notifikace, exporty, skutečné rezervace a optimální rozvrh.

## Dokumentace

- [Schválený plán a předpoklady](docs/PLAN.md)
- [Aktuální stav](docs/STATUS.md)
- [Výsledky ověření a výkonová omezení](docs/VERIFICATION.md)
- [Stručné odevzdání](docs/ODEVZDANI.md)
- [Work log, opravy AI a oponentura](docs/WORK_LOG.md)
- [Původní profil dat](docs/data-audit.json)
- [Pravidla projektu](AGENTS.md)
