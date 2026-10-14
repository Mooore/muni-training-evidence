# Evidence školení — odevzdání

**Demo:** https://muni-training-evidence.mirinda-posp.workers.dev  
**Zdroj:** https://github.com/Mooore/muni-training-evidence

Aplikace poskytuje přehled povinných školení, filtraci osob, detail dokladů, audit kvality dat a vysvětlitelný návrh přiřazení na termíny. Výchozí datum 1. 10. 2026 je výrazně označený historický snapshot. Všechna data jsou syntetická; zacházení s nimi demonstruje minimalizaci citlivých údajů.

Zpracováno 174 zaměstnanců, 10 kurzů a 34 termínů. Ze 2 868 zdrojových řádků absolvování bylo odstraněno 7 přesných duplicit a opakovaná hlavička; 2 860 dokladů zůstává dohledatelných. Identitu určuje ID, osoby se podle jména nebo emailu neslučují. Běhová data neobsahují rodná čísla, emaily ani volné poznámky.

Klíčová rozhodnutí: katalog určuje periodu obnovy; rozpor zdrojové platnosti znamená nejistotu. Platnost platí včetně posledního dne, roky se převádějí na kalendářní měsíce. Jednorázové LEAD se neobnovuje. Novější vadný doklad neruší starší důvěryhodný, ale problém zůstává viditelný. Chybějící útvar může znemožnit rozhodnutí o útvarové povinnosti.

Plánovač odečítá obsazenost, respektuje časové kolize i způsobilost k datu termínu a vrací důvody nezařazení. Jde o deterministickou heuristiku, nikoli optimální rozvrh nebo rezervaci. Identity již přihlášených nejsou dostupné; nelze vyloučit existující rezervaci. Opožděné řešení se označuje a nedokazuje souvislou platnost.

Řešení: TypeScript, Hono, serverové HTML, SCSS bez CSS frameworku, Workers a D1/SQLite. Doména je oddělená od HTTP a persistence. Import vytváří neměnný dataset a aktivuje jej až po kontrole úplnosti. Při chybě DB aplikace nezobrazuje falešné splnění ani nulové počty. SQL dotazy jsou parametrizované, HTML escapované, vstupy validované, demo poskytuje pouze čtení.

Ověření zahrnuje import, hraniční data platnosti, konfliktní doklady, kapacitní a kolizní invarianty, čistou migraci a seed, lokální návrat datasetu, desktopový i mobilní průchod a veřejný smoke se skutečnou revizí a daty. Konkrétní výsledky a omezení měření jsou v `VERIFICATION.md`. Lokální spuštění nevyžaduje originální CSV ani účet Cloudflare; postup je v README.

Vědomě vynecháno: SSO/role, CRUD, skutečné rezervace, notifikace, exporty a globální optimalizace. Produkční provoz potřebuje autorizaci, audit zápisů, pravidla uchování a ověřené zálohy/obnovu. AI pomáhala s analýzou, návrhem, implementací i testy; opravy a lidská/AI oponentura se odlišují v `WORK_LOG.md`. Nejde o kompletní produkční HR systém.
