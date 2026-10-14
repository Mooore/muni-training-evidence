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
