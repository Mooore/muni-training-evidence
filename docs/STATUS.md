# Stav realizace

Poslední aktualizace: 2026-10-14 09:44 Europe/Prague.

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

23 unit/integration testů prošlo, typecheck prošel. Tři prohlížečové průchody prošly lokálně i na veřejné optimalizované revizi. Čistá kopie: instalace, migrace, seed, tehdejších 20 testů, build i skutečné HTTP spuštění prošly. Dataset rollback nacvičen lokálně. GitHub CI finálního aplikačního commitu 817535a úspěšné včetně browser testů.

Veřejně ověřená finální aplikační revize 817535a, dataset 239aef0a043c4b76, Cloudflare version 760b97c2-f8e0-4923-8cbc-8b62abdd920c. Následný dokumentační commit nemění běžící kód. Všechny implementační milníky byly commitnuty a pushnuty. Poslední HTTP smoke: p95 celého přenosu 71,9–86,2 ms, malý vzorek.

Výkonové cíle interakcí splněny v omezeném měření. CPU studeného auditu a některých požadavků překračuje 10 ms Free limit; vhodnost všech cest pro Workers Free není potvrzena. Aktuální hosting neměl runtime chyby, konkrétní billing tarif nelze s oprávněním ověřit (403); žádný tarif nebyl změněn. Nejde o produkční SLA.

Vědomě vynecháno dle plánu: SSO/role, CRUD, skutečné rezervace, notifikace, exporty, optimální rozvrh. Automatický návrat kódu je připraven, jeho chybová větev nebyla na veřejném hostingu záměrně vyvolána. Žádná testovací/hostovací neznámá není vydávána za ověřenou.
