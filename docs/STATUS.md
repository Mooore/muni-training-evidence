# Stav realizace

Poslední aktualizace: 2026-10-14 10:14 Europe/Prague.

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

26 unit/integration testů prošlo, typecheck prošel. Čtyři prohlížečové průchody prošly lokálně i na veřejné revizi po uživatelské oponentuře. Čistá kopie: instalace, migrace, seed, tehdejších 20 testů, build i skutečné HTTP spuštění prošly. Dataset rollback nacvičen lokálně. GitHub CI aplikačního commitu e831be3 úspěšné včetně browser testů.

Veřejně ověřená aktuální aplikační revize e831be3, dataset 239aef0a043c4b76, Cloudflare version 1b667c2c-0d83-464e-87f8-93630bc1d0e4. Následný dokumentační commit nemění běžící kód. Všechny implementační milníky byly commitnuty a pushnuty. Poslední HTTP smoke po oponentuře: návrh medián/p95 celého přenosu 77/114,2 ms; přehled 96/507,7 ms (server p95 302 ms); malý vzorek.

Výkonové cíle interakcí splněny v omezeném měření. CPU studeného auditu a některých požadavků překračuje 10 ms Free limit; vhodnost všech cest pro Workers Free není potvrzena. Aktuální hosting neměl runtime chyby, konkrétní billing tarif nelze s oprávněním ověřit (403); žádný tarif nebyl změněn. Nejde o produkční SLA.

Vědomě vynecháno dle plánu: SSO/role, CRUD, skutečné rezervace, notifikace, exporty, optimální rozvrh. Automatický návrat kódu je připraven, jeho chybová větev nebyla na veřejném hostingu záměrně vyvolána. Žádná testovací/hostovací neznámá není vydávána za ověřenou.

## Zapracování uživatelské oponentury (hotovo 10:14)

Nasazená a ověřená úprava srozumitelnosti: celé názvy školení, konkrétní pořadí a důvod termínu, vysvětlení „K ověření“ a odkazy na podklady. Pravidlo priority se nemění. Porovnání na třech datech zachovalo výsledky. 26 testů, build, 4 lokální i veřejné E2E a CI prošly. Na třech datech byla ověřena shoda rozhodnutí s předchozí verzí.
