# Stav realizace

Poslední aktualizace: 2026-10-14 09:20 Europe/Prague.

## Čas

Celkový limit: přibližně 240 minut včetně analýzy, implementace, ověření a odevzdání.
Uživatel upřesnil začátek přibližně 08:00 s přestávkami, konečný čas přibližně 12:20 Europe/Prague. V 08:47 zbývá přibližně 213 minut do konce. Analýza se počítá; čas implementace limit neresetuje.

## Kroky

| Krok | Stav | Výstup / podmínka |
| --- | --- | --- |
| 0. Analýza a schválení | Hotovo | Schválený plán a průběžný log |
| 1. Git a provozní podmínky | Hotovo | GitHub ověřen, dokumentace a scaffold commitnuté a pushnuté |
| 2. Minimální projekt a deploy | Hotovo pro základ | Veřejná URL odpovídá health obsahem; plné UI zatím nenasazeno |
| 3. Import a databáze | Lokálně ověřeno | 174 osob, 10 kurzů, 2 860 dokladů, 34 termínů; staging + oddělená aktivace |
| 4. Doména a testy | Základ ověřen | Import, platnost a způsobilost mají hraniční testy |
| 5. UI a SCSS | Lokálně ověřeno (E2E) | Přehled, detail, audit, termíny |
| 6. Plánovač | Lokálně ověřen včetně celé a 10× sady | Návrh, důvody, kapacita a kolize |
| 7. Závěrečné ověření a odevzdání | Čeká | E2E, výkon, plný deploy, README, odevzdání |

## Teď a dále

Teď: lokální integrační a prohlížečové ověření. Následuje oprava zjištění, plný deploy a měření výkonu.
Veřejný základ: https://muni-training-evidence.mirinda-posp.workers.dev (zatím pouze scaffold, nikoli hotová aplikace).
Čas: v 09:13 zbývá do 12:20 asi 187 minut; jde o čas do termínu, nikoli evidenci osobně odpracovaného času.

## Ověření

20 automatických testů a 2 E2E průchody prošly. Typecheck prošel. První scaffold dry-run build a deploy prošly, HTTP /health ověřen. Lokální migrace, seed i aktivace úspěšné. Lokální prohlížeč a výkon ověřeny. Plný veřejný deployment a výkon hostingu ještě čekají.
