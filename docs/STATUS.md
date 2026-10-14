# Stav realizace

Poslední aktualizace: 2026-10-14 11:59 Europe/Prague.

## Čas

Termín 12:20 Europe/Prague. Finální funkční přejímka a schválené uživatelské úpravy dokončeny 11:59 před termínem. Začátek byl podle uživatele přibližně v 08:00 s přestávkami; nejde o přesně změřený osobně odpracovaný čas. Rozpočet nebyl resetován implementací.

## Kroky

| Krok | Stav | Výstup / podmínka |
| --- | --- | --- |
| 0. Analýza a schválení | Hotovo | Schválený plán, dohledatelné předpoklady |
| 1. Git a provozní podmínky | Hotovo | GitHub ověřen, průběžné commity/pushe; na výslovný souhlas repozitář zveřejněn |
| 2. Minimální projekt a deploy | Hotovo | Veřejný Worker + D1; plná aplikace obsahově ověřena |
| 3. Import a databáze | Hotovo pro dodané exporty | Minimalizace, audit, neměnné datasety a kontrolovaná aktivace |
| 4. Doména a testy | Hotovo v rozsahu MVP | Platnost, povinnosti, nejistota, způsobilost, hraniční testy |
| 5. UI a SCSS | Hotovo | Přehled, detail, filtry, audit, termíny; mobilní přehled bez vodorovného posunu |
| 6. Plánovač | Hotovo v rozsahu heuristiky | Návrh nic nerezervuje; kapacity, kolize, důvody; ověřen i na 10× sadě |
| 7. Ověření a odevzdání | Hotovo v rozsahu MVP | README, odevzdání, výsledky; finální veřejný smoke a aplikační CI úspěšné |

## Odkazy

- Demo: https://muni-training-evidence.mirinda-posp.workers.dev
- Veřejný zdroj: https://github.com/Mooore/muni-training-evidence
- [Přesné výsledky a podmínky ověření](VERIFICATION.md)
- [Stručné odevzdání](ODEVZDANI.md)

## Ověření a otevřené hranice

32 unit/integration testů, typecheck a build prošly. Dvacet pět prohlížečových průchodů prošlo lokálně i veřejně, včetně multiselectu stavů se školením, plynulého přejíždění mezi řádky, klávesnice, dotyku a nativního chování bez JS. GitHub CI poslední aplikační revize úspěšné včetně čisté instalace, migrací, seedu a E2E. Dřívější nezávislé lokální spuštění čistého exportu i návrat datasetu jsou doloženy ve VERIFICATION.

Veřejně ověřená finální aplikační revize 4a8a640, dataset 8329fc51214bfc0b, Cloudflare version d1e20629-4763-4bc7-b656-f547aa79e5a0. Následný dokumentační commit nemění běžící kód. Poslední HTTP smoke: audit medián/p95 213,3/273,5 ms; přehled 147,9/669,3 ms; návrh 94,9/142,5 ms. Vzorek zahrnuje síť a není SLA. Server-Timing přehledu měl medián/p95 54/541 ms; návrhový cíl 500 ms tedy v této malé sadě nebyl splněn. Browser obsah 261 ms, simulovaný mobil LCP 400 ms.

Předchozí CPU měření revize fb600f5 (nové nebylo provedeno): SQL audit první zachycený požadavek 12 ms CPU, další 2–8 ms. Zachycené špičky přehledu/plánovače 57/61 ms stále překračují 10 ms Free limit; vhodnost celé aplikace pro Free není potvrzena. Všech 32 zachycených runtime událostí bylo ok, tail neobsahuje všechny požadavky. Konkrétní billing tarif nelze s oprávněním ověřit (403); žádný tarif nebyl změněn. Podmínky měření a přejímka jsou ve VERIFICATION.

Vědomě vynecháno dle plánu: SSO/role, CRUD, skutečné rezervace, notifikace, exporty, optimální rozvrh. Automatický návrat kódu je připraven, jeho chybová větev nebyla na veřejném hostingu záměrně vyvolána. Žádná testovací/hostovací neznámá není vydávána za ověřenou.

## Zapracování uživatelské oponentury (hotovo 10:14)

Nasazená a ověřená úprava srozumitelnosti: celé názvy školení, konkrétní pořadí a důvod termínu, vysvětlení „K ověření“ a odkazy na podklady. Pravidlo priority se nemění. Porovnání na třech datech zachovalo výsledky. 26 testů, build, 4 lokální i veřejné E2E a CI prošly. Na třech datech byla ověřena shoda rozhodnutí s předchozí verzí.

## Schválené zjednodušení přehledu (hotovo 10:34)

Nasazen graf splnění s unikátními osobami (90/153), konkrétní úkoly, rozbalovací podrobnosti a pokročilé filtry, stručnější úvod plánovače. 29 testů, build, 5 lokálních i veřejných E2E a CI úspěšné. Úkoly zachovávají výběr při přechodu do seznamu; upravené pokročilé filtry se automaticky otevřou. Přiřazovací algoritmus se nemění.

## Oprava caps-lock křestních jmen (hotovo 10:54)

Veřejně ověřena auditovaná oprava šesti běžných křestních jmen včetně LUCIE → Lucie. Dataset 8329fc51214bfc0b, šest dodatečných oprav, stejná ID a všechny doménové výsledky. 30 testů, build, 6 lokálních i veřejných E2E a CI úspěšné. Před změnou exportována záloha D1 mimo Git; předchozí dataset je stále uložen pro návrat.

## SQL audit a přejímka (hotovo 11:15)

Audit filtruje a stránkuje v SQL, přenáší nejvýše 30 událostí a malé agregace. Health neparsuje celý dataset. Index aplikován lokálně i vzdáleně, nasazení a veřejný smoke úspěšné. 32 testů, build, 7 lokálních i veřejných E2E a CI úspěšné. README a stručné odevzdání zkontrolovány, výsledky i zbývající CPU omezení zapsány. Schválený rozsah této iterace dokončen.

## Double-check FE filtrů (hotovo 11:23)

Osm nových scénářů chrání konkrétní ID/počty, všechny volby útvarů/způsobilostí/stavů, průniky, hledání, audit, celé stránkování, datum, reset, neplatné URL a mobilní Enter/reload. V ověřeném rozsahu nebyla nalezena chyba aplikace. 32 unit/integration a celkem 15 lokálních i veřejných E2E úspěšných. Běžící revize fb600f5 beze změny; nový commit obsahuje testy a dokumentaci.

[CI testovacího commitu 40c3d0d](https://github.com/Mooore/muni-training-evidence/actions/runs/38542018773) úspěšné: čistá instalace, 32 unit/integration testů, typy/build, migrace/seed a všech 15 browser testů.


## Filtr školení (hotovo 11:31)

Implementován výběr celého názvu/kódu školení, který omezuje graf, úkoly a seznam. 32 unit/integration testů, typy/build, 17 lokálních i veřejných E2E a čisté CI úspěšné. Nasazena revize 0f329c2. BOZP-Z referenčně 137/153 aktivních splněno, 9 prošlé a 7 chybí k 1. 10. 2026. Povinnost/nejistota odlišena od osob bez povinnosti.


## Stavové bubliny (hotovo 11:40)

Implementován rychlý výpis celých názvů/kódů školení po najetí/focusu/klepnutí na stav v tabulce. Respektuje konkrétní školení, nad scrollovací tabulkou, Escape/outside dismiss. 32 unit/integration testů, typy/build, 21 lokálních i veřejných E2E a čisté CI úspěšné. Nasazena revize 30cbb46; nativní kliknutí/Escape funguje i bez JS.


## Multiselect stavů a průjezd mezi řádky (hotovo 11:50)

Implementována OR checkbox skupina a zkratka „Vše kromě Platné“ s filtrem školení, opakované state URL parametry. Bublina vlevo od stavového sloupce, odstraněn dashed border/hover fill. 32 testů, typy/build, 25 lokálních i veřejných E2E a čisté CI úspěšné. Nasazena revize eb4ea9f.


## Závěrečné doladění a uzavření (hotovo 11:59)

Reset filtrů má vzhled sekundárního tlačítka vedle hlavní akce. Zachováno chování odkazu i resetu. Vizuálně zkontrolováno rozložení, reset ověřen existujícími testy. Finální deploy/smoke, 32 unit/integration, 25 lokálních i veřejných E2E a čisté CI úspěšné. Repozitář znovu ověřen PUBLIC, main. MVP uzavřené a připravené k odevzdání; produkční a výkonové hranice výslovně zůstávají uvedené výše.
