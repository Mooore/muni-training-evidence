# Stav realizace

Poslední aktualizace: 2026-10-14 10:34 Europe/Prague.

## Čas

Termín 12:20 Europe/Prague. V 09:44 bylo hotovo s rezervou 156 minut do termínu. Začátek byl podle uživatele přibližně v 08:00 s přestávkami; nejde o přesně změřený osobně odpracovaný čas. Rozpočet nebyl resetován implementací.

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

29 unit/integration testů prošlo, typecheck prošel. Pět prohlížečových průchodů prošlo lokálně i na veřejné verzi zjednodušeného přehledu. Čistá kopie: instalace, migrace, seed, tehdejších 20 testů, build i skutečné HTTP spuštění prošly. Dataset rollback nacvičen lokálně. GitHub CI aplikačního commitu 4266f2b úspěšné včetně browser testů.

Veřejně ověřená aktuální aplikační revize 4266f2b, dataset 239aef0a043c4b76, Cloudflare version a9cff5a8-dff0-4012-a28b-ecd2fd05c3ac. Následný dokumentační commit nemění běžící kód. Všechny implementační milníky byly commitnuty a pushnuty. Poslední HTTP smoke: přehled medián/p95 celého přenosu 96,6/237,9 ms (server p95 90 ms); návrh 88,5/703,6 ms (server p95 25 ms). Malý vzorek zahrnuje síť; výsledek není SLA.

Výkonové cíle interakcí splněny v omezeném měření. CPU studeného auditu a některých požadavků překračuje 10 ms Free limit; vhodnost všech cest pro Workers Free není potvrzena. Aktuální hosting neměl runtime chyby, konkrétní billing tarif nelze s oprávněním ověřit (403); žádný tarif nebyl změněn. Nejde o produkční SLA.

Vědomě vynecháno dle plánu: SSO/role, CRUD, skutečné rezervace, notifikace, exporty, optimální rozvrh. Automatický návrat kódu je připraven, jeho chybová větev nebyla na veřejném hostingu záměrně vyvolána. Žádná testovací/hostovací neznámá není vydávána za ověřenou.

## Zapracování uživatelské oponentury (hotovo 10:14)

Nasazená a ověřená úprava srozumitelnosti: celé názvy školení, konkrétní pořadí a důvod termínu, vysvětlení „K ověření“ a odkazy na podklady. Pravidlo priority se nemění. Porovnání na třech datech zachovalo výsledky. 26 testů, build, 4 lokální i veřejné E2E a CI prošly. Na třech datech byla ověřena shoda rozhodnutí s předchozí verzí.

## Schválené zjednodušení přehledu (hotovo 10:34)

Nasazen graf splnění s unikátními osobami (90/153), konkrétní úkoly, rozbalovací podrobnosti a pokročilé filtry, stručnější úvod plánovače. 29 testů, build, 5 lokálních i veřejných E2E a CI úspěšné. Úkoly zachovávají výběr při přechodu do seznamu; upravené pokročilé filtry se automaticky otevřou. Přiřazovací algoritmus se nemění.
