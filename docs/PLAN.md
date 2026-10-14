# Schválený plán — evidence školení

Stav: uživatel schválil plán a autorizoval implementaci i průběžné commity dne 2026-10-14. Referenční datum exportu: 2026-10-01.

## Výsledek MVP

1. Přehled: počty lidí s chybějícím, prošlým, brzy končícím a nejistým povinným školením. Filtr útvaru, vyhledání zaměstnance. Počty zaměstnanců oddělit od počtů povinností.
2. Detail zaměstnance: požadovaná školení, stav, poslední důvěryhodné absolvování, platnost, zdroj rozhodnutí a varování. Nepovinná školení nesnižují splnění povinností.
3. Návrh přiřazení lidí na dostupné termíny: vysvětlitelná priorita, respektování kapacity a kolizí, seznam nezařazených s důvodem. Výslovně návrh, ne potvrzená rezervace. Dosavadní obsazenost odečíst; identity již přihlášených v datech nejsou.
4. Kvalita dat: počty oprav a odmítnutí, konkrétní důvody a zdrojové ID/číslo logického záznamu. Nejisté údaje neskrývat.
5. Veřejná webová demonstrace se syntetickými minimalizovanými daty, responzivní základ, README s lokálním spuštěním, klíčové testy, stručný odevzdávací text a AI log.

## Data a pravidla, která musí být vidět

- CSV parser respektuje uvozovky, oddělovače a víceřádkové buňky. Absolvování je Windows-1250 se středníkem; termíny UTF-8 se středníkem; zbývající UTF-8 s čárkou.
- Zaměstnance identifikovat podle ID, nikoli jména, rodného čísla nebo emailu. Dva duplicitní emaily vylučují jejich použití jako spolehlivého klíče. Nikdy automaticky neslučovat osoby.
- Rodná čísla a volné poznámky zaměstnanců neukládat do běhových dat. Originály ponechat mimo Git. Logy bez osobních údajů.
- Útvary normalizovat explicitní mapou aliasů (např. Laboratore → Laboratoře); zaznamenat změnu. Pět chybějících útvarů: univerzální a poziční povinnosti lze posoudit, útvarové mohou být nejisté.
- Kódy trim + uppercase, poté explicitní schválené aliasy. Neopravovat neznámé kódy fuzzy matchingem. BOZP-X, GDPR-2 a KYB3R vyžadují rozhodnutí; nesmí se potichu počítat jako známé školení.
- 7 přesných duplicit ignorovat s auditním záznamem. Z 15 opakovaných ID mohou zbývající být konfliktní verze: vyhodnotit a konflikty označit, ne použít last-write-wins. Opakovanou hlavičku v absolvování odstranit a nahlásit.
- Datum: ISO, české datum a rozumné excelové sériové číslo s explicitním předpokladem Excel 1900 date system. Nemožné datum, datum 1900 a záporná platnost znamenají problém, nikoli platný důkaz. Budoucí absolvování k referenčnímu datu není dokončené školení.
- Platnost: „2 roky“ = 24 kalendářních měsíců; LEAD 0 navrhnout jako jednorázové školení; ANGL nepovinné bez deklarované platnosti. Přičítání měsíců ořízne den na poslední den cílového měsíce.
- U periodických školení navrhnout katalog jako pravidlo obnovy. Uvedené platnost_do porovnat s výpočtem; při rozporu ukázat nejistotu, ne automaticky potvrdit splnění. Chybějící platnost_do dopočítat a označit původ. Alternativa: zdrojová platnost je autoritativní certifikát; vyžaduje vědomé rozhodnutí uživatele.
- Platnost včetně dne platnost_do. Blíží se konec = následujících 60 dnů včetně; uživatel volí referenční datum, default export 1. 10. 2026 pro reprodukovatelnost. UI výrazně označí, že jde o historický snapshot.
- Způsobilost podle nástupu, ukončení a stavu k referenčnímu dni. Budoucí nástup oddělit. Ukončené nesměřovat na termíny. Rodičovskou zobrazit odděleně, default neplánovat; návrat není znám. Rozpory stavu a dat hlásit. Není doménově odůvodněná automatická lhůta po nástupu.
- Audit je prvotní profil, ne počet všech chyb: nevalidní datum v JSON znamená nečitelné základním parserem (např. Excel serial), nikoli neopravidelný údaj. Číselné metriky splnění vzniknou až po přijetí pravidel.

## Plánovací algoritmus

Vstup: datum, horizont 60 dnů a důvěryhodné povinnosti. Zrušený/přeplněný termín, nulová kapacita, neznámý kód a minulý termín vyřadit. Přeplnění neinterpretovat jako záporný počet míst. Neznámé datum expirace nepředstírat jako známý deadline.

Pro každý kurz seřadit potřeby podle deadline (u chybějícího od nástupu; u prošlého expirace), dále stabilní ID. Pro urgentní potřeby hledat nejbližší volný nekolizní termín. Pro budoucí obnovu nejpozdější dostupný termín před expirací, aby se školení neopakovalo zbytečně brzy. Kolize kontrolovat napříč kurzy podle data a časových intervalů; ne podle pořadí řádků. Každou osobu na jeden kurz přiřadit nejvýše jednou. Termín po expiraci lze nabídnout jako opožděné řešení s výslovným varováním; nelze tvrdit souvislou platnost.

Jde o deterministickou heuristiku, ne globálně optimální rozvrh. Bez identity již přihlášených nelze vyloučit, že člověk rezervaci již má. Návrh nesmí tvrdit opak. Zachovat důvody nezařazení a testovat invarianty: kapacita, duplicity, kolize, způsobilost, zrušení a reprodukovatelnost.

## Stack

Doporučení A: TypeScript, Hono, serverové HTML a malý klientský skript, obyčejné CSS, SQL migrace, D1 na Cloudflare Workers; lokálně Wrangler a SQLite. Vitest pro doménu a import, jeden prohlížečový průchod Playwright. Bez SPA, ORM, mikroservis a komponentového systému.

Důvody: jedna jazyková sada, drobný HTTP framework, jeden deploy, relační integrita, dostupné lokální prostředí a bezplatné demo. Doména čisté funkce bez závislosti na HTTP/D1; import CLI; persistence za úzkým rozhraním. Rozšiřování pomocí modulů employees, catalog, completions, sessions a planning. D1 používá SQLite; přechod na PostgreSQL není bezpracný, ale oddělení SQL od domény omezí dopad. Free tier má limity a po jejich dosažení může odmítat dotazy; nejde o garanci produkční dostupnosti.

B: TypeScript + Fastify + serverové HTML + SQLite na jednom Node serveru. Výhody: známý běžný runtime, validace requestů/response, snadné Docker spuštění. Nevýhody: bezplatný hosting s perzistentním diskem a uspáváním může komplikovat demo. Rozumné, pokud je již dostupný server; nenavrhovat neověřený hosting.

C: statická TypeScript aplikace + Vite s minimalizovaným JSON, veřejný statický hosting. Nejméně provozní práce; pro neměnný anonymní snapshot plní zadání. Všechna data však jsou dostupná klientovi, žádná serverová autorizace ani sdílené rezervace. Dobrá záložní varianta pro demo, slabší demonstrace full-stack řešení.

## Bezpečnost a produkční hranice

Demo obsahuje pouze deklarovaná syntetická data a pouze čte. Nedělat veřejné importní nebo zapisovací API. Escapovat HTML, parametrizovat SQL, validovat vstupy, omezit stránkování/horizont a velikost požadavků, nastavit CSP a další bezpečnostní hlavičky. CSV export (pokud se stihne) neutralizuje vzorce v buňkách. Secrets mimo repo; žádná rodná čísla v Gitu, klientovi ani logu. CI: typecheck, klíčové testy a build.

Reálná evidence vyžaduje SSO, role HR/vedoucí, autorizaci na serveru, audit zápisů, zálohy/obnovu a pravidla uchování. Tohle vědomě nedodáme v limitu; nepoužívat označení kompletně production-ready. Připravit rozhraní pro identitu, nevytvářet vlastní heslový systém. Pokud přidáme skutečné rezervace později, vyžadují atomickou kontrolu kapacity v transakci a idempotenci; dnešní plánovací návrh nic nerezervuje.

## Časový rozpočet (celkem 240 minut)

- 0–35: analýza, pravidla, log, Git a shoda na stacku. Pokud už uplynulo více, zkrátit další rozsah, ne posunout limit.
- 35–75: projekt, parser, minimalizace, audit importu, migrace a seed.
- 75–120: doména platnosti a povinností, hraniční testy.
- 120–160: přehled, filtr, detail, kvalita dat a použití na mobilu.
- 160–195: plánovací heuristika a testy invariantů.
- 195–220: nasazení a smoke test veřejné URL i lokálního čistého spuštění.
- 220–240: README, odevzdávací text do jedné strany, AI log, závěrečné ověření.

Deploy ověřit malým základem už při scaffoldingu. Do 160. minuty musí fungovat přehled a detail. Pokud skluz, omezit plánovač na jeden vybraný kurz (výslovně uvést, že pak neřeší kolize napříč kurzy), vynechat export a nepovinné detaily. Nasazení a dokumentaci neškrtat.

## Převzetí a vědomě vynechané funkce

Hotovo znamená veřejná URL, zdrojový GitHub odkaz, spuštění podle README, dohledatelné předpoklady, žádná citlivá nadbytečná pole a automaticky ověřená doména/plánovač. Mobil bez horizontálně neovladatelné tabulky, základní klávesnicové ovládání a označené vstupy.

Vynechat: účty/SSO, skutečné přihlašování na termíny, notifikace/emaily, CRUD katalogu a zaměstnanců, univerzální import libovolných souborů, PDF, optimální rozvrhování, mikroservisy a pokročilý design. Ve výstupu jasně rozlišit hotové, chybějící a navazující produkční práci.

## Prameny krátkého research

- https://hono.dev/docs/getting-started/cloudflare-workers — oficiální cesta Hono na Workers.
- https://developers.cloudflare.com/d1/examples/d1-and-hono/ — propojení D1 a Hono.
- https://developers.cloudflare.com/d1/reference/faq/ — možnost prototypování zdarma a chování limitů.
- https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/ — validace a serializace alternativního Node stacku.

## Doplnění po nezávislé AI revizi

- Způsobilost pro přiřazení kontrolovat v den konkrétního termínu, nejen k datu přehledu. Navrhovaný předpoklad: den ukončení je poslední den pracovního poměru.
- Oddělit nejistotu povinnosti od nejistoty absolvování. Nejnovější nevalidní záznam automaticky neruší starší důvěryhodný doklad, ale konflikt zůstává viditelný. Případy k ověření musí mít vlastní seznam a nesmějí potichu zmizet z řešení.
- Určit pevné pořadí kurzů (nejbližší deadline mezi potřebami, potom kód) a stabilní pořadí osob. Testovat nezávislost na pořadí řádků. „Heuristika nenalezla přiřazení“ neznamená důkaz neexistence řešení.
- Prvotní audit není plná validace. Před implementací doplnit bezpečné parsování čísel, konflikty ID, chronologii pracovního poměru a intervaly termínů. Souhrnný report nesmí obsahovat emaily.
- Před rozsáhlejším vývojem ověřit GitHub a minimální deploy; čtyřhodinový rozpočet počítat včetně již provedené analýzy.

## Upřesnění FE a ověřování po diskusi s uživatelem

Uživatel požaduje automatické testování tam, kde dává smysl, včetně chování a deploymentu, a bezpečné fallbacky/rollbacky. Navrhuje Sass bez frameworku a základ design systému.

### Frontend

Doporučeno SCSS kompilované pomocí Dart Sass do běžného CSS. SCSS je syntaxe Sass kompatibilní s CSS. Žádný CSS framework ani runtime stylovací knihovna. Vlastní drobný design systém: CSS custom properties pro barvy, mezery, typografii, hranice a focus; SCSS pro organizaci pomocí @use a případné opakované responsive vzory. Nevytvářet abstrakce bez konkrétního použití.

Minimum komponent: tlačítko/odkaz, označený input/select, stavový badge, informační upozornění, přehledová karta, tabulka/seznam, prázdný a chybový stav. Každý stav školení má text, nikoli jen barvu. Viditelný focus, sémantické HTML, ovládání klávesnicí a čitelný mobilní detail. Design systému nebudovat vlastní dokumentační web ani Storybook.

### Automatické kontroly

- Každý push/PR v CI: instalace ze zamčených závislostí, TypeScript typecheck, unit/integration testy a produkční build včetně Sass. Nepředstírat typovou kontrolu jako runtime validaci CSV/HTTP.
- Import: CSV uvozovky/víceřádkové buňky, různá kódování, aliasy, duplicitní a konfliktní ID, neznámé reference a datum. Testovací data minimalizovaná syntetická; nekopírovat rodná čísla.
- Doména: kalendářní měsíce a konec měsíce, hranice platnosti, budoucí doklad, jednorázové školení, povinnosti podle role/útvaru, chybějící a konfliktní důkazy, způsobilost k dni termínu.
- Plánovač: kapacita po odečtení obsazenosti, zákaz duplicitních přiřazení a časových kolizí, zrušené termíny, pořadí vstupů, vysvětlitelné nezařazení.
- Integrace: migrace+seed do čisté lokální databáze; reprezentativní route a SQL načtení do doménového výsledku; escapování textu a validace filtrů.
- Playwright: jeden ucelený průchod přehled → filtr → detail → návrh → nezařazení; jeden mobilní viewport, základní ovládání klávesnicí a chybový/prázdný stav. Kontrolovat obsah, nikoli křehké pixelové snapshoty.
- Nasazení: kontrolovaný build před deployem, poté HTTP smoke test veřejné URL a reprezentativní stránky. Ověřit očekávanou verzi a skutečné načtení dat; samotné HTTP 200 nestačí. Stejný smoke test použitelný lokálně i vzdáleně. Závislé kroky CI se spouštějí až po úspěchu předchozích.

### Bezpečné selhání a rollback

- Chyba jednotlivého importního řádku: odmítnout nebo karanténa s důvodem; neskrýt nejistotu v přehledu. Neznámá povinnost/doklad nesmí přejít na zelený stav.
- Chybné kódování, hlavička či struktura celého souboru: zastavit import. Import do stagingu/transakce; aktivovat nový dataset až po kontrolách. Částečný import nesmí nahradit poslední validovaný dataset.
- Nedostupná DB/API: srozumitelný chybový stav, možnost opakovat a žádné falešné nuly nebo falešné splnění. Případný poslední snapshot lze zobrazit pouze s jasným označením stáří; pro MVP nemusí být implementovaný.
- Selhání plánovače: přehled může fungovat dál; návrh nevydávat jako kompletní a nezapisovat rezervace. Omezené plánování pro jeden kurz je rozsahová záloha, ne tichý fallback měnící význam výsledku.
- Deploy: neúspěšné předdeploy kontroly zabrání publikaci. Po neúspěšném smoke testu vrátit poslední ověřenou verzi, pokud existuje a hosting to umožňuje; následně smoke test opakovat. První deploy nemá předchozí funkční verzi.
- Rollback kódu nevrací automaticky databázi. Pro MVP nedestruktivní migrace kompatibilní s předchozí verzí a před změnou dat export/záloha. Obnovu dat provádět cíleně, ne slepým automatickým rollbackem. Jednou lokálně nacvičit návrat k předchozímu datasetu/verzi, pokud již existují.

Časová priorita: import, doména a kapacitní invarianty mají přednost před rozsáhlou testovací infrastrukturou a vizuálními detaily. Testy ani bezpečnost nejsou důvodem posunout čtyřhodinový limit; při skluzu omezit funkce.

## Výkon jako podmínka dokončení

Uživatel výslovně požaduje rychlé interakce; několikasekundová odezva běžného kliknutí je nepřijatelná. Níže jsou návrhové cíle, nikoli již dosažené výsledky nebo produkční SLA.

- Běžný přehled/filtr/detail: cílové p95 odezvy serveru do 500 ms na nasazeném demu pro reprezentativní sekvenční požadavky. Zvlášť uvést první požadavek, chyby a podmínky měření. Nízký počet vzorků není spolehlivá produkční statistika.
- Prohlížeč: hlavní obsah běžné stránky cílově použitelný do 1 s na běžném připojení; na simulovaném mobilním připojení orientační LCP do 2,5 s. Měřit zvlášť od času serveru. Neblokovat klikání dlouhým výpočtem v klientovi.
- Plánovací výpočet měřit samostatně od DB a HTTP. Na dodané datové sadě cílově pod 200 ms lokálně; ověřit také skutečné CPU omezení zvoleného hostingu. Algoritmus, který je rychlý na notebooku, nemusí vyhovět Workers Free.
- Základ: serverové HTML, minimum JS, systémové fonty, žádné nepotřebné obrázky ani externí knihovny. Kompilované statické CSS/JS s verzovanými názvy a vhodnou cache. Data považovaná za citlivá necachovat veřejně.
- Indexy podle dotazů (zaměstnanec+kurz, kurz+datum termínu), žádné dotazy v cyklu pro každého zaměstnance. Načíst data dávkově, vytvořit lookup mapy, doménu nepočítat znovu pro každý řádek. Stránkovat a omezit velikost odpovědí; import mimo request.
- Automatický performance smoke: fixní reprezentativní URL, první a opakované požadavky, velikost odpovědí, chybovost, median a p95 z přiměřeného počtu vzorků. Žádný neomezený zátěžový test. Výsledky zapsat spolu s prostředím a verzí aplikace.
- Ověřit plánovač a doménu na deterministicky rozšířené syntetické sadě (např. 10x) kvůli zjevnému kvadratickému chování, pokud to čas dovolí. Nezaměňovat tento test za potvrzení kapacity produkce.
- Při selhání cíle najít konkrétní úzké místo (DB, výpočet, přenos, klient), opravit a znovu změřit. Pokud zůstává omezení, pravdivě ho uvést; kosmetické funkce mají nižší prioritu.

## Průběžné sledování kroků a času

Aktuální stav je veden v docs/STATUS.md. Každý milník aktualizuje hotovo/rozpracováno/dále, ověření, překážky a čas. Komunikace uživateli při změně kroku a nejméně jednou za minutu aktivní práce. Oddělovat naměřený čas od odhadu; nezapočítávat tichou pauzu automaticky jako osobně odpracovaný čas. Rozpočet nesmí být resetován začátkem implementace.

## Oponentura použitelnosti první verze — 2026-10-14

Uživatel upozornil na nesrozumitelné zkratky a vysvětlení návrhu, nejasný pojem nejistoty a neviditelnou prioritu. Doplnění v rozsahu MVP: plné názvy školení, skutečné pořadí a rozhodné datum přiřazování, vysvětlení volby konkrétního termínu a akční vysvětlení „K ověření“. Dosavadní algoritmus se tím nemění; změna pravidla na jiné obchodní priority by byla další rozhodnutí.
