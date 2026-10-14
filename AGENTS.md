# Pravidla práce na projektu

## Cíl a omezení

Funkční evidence školení pro praktický úkol MUNI. Přibližně 4 hodiny na celý úkol včetně analýzy, ověření, nasazení a dokumentace. Data jsou zcela syntetická; zacházíme s nimi jako s citlivými pro demonstraci správných postupů. Priorita: správná doména, transparentní nejistota, použitelný přehled, návrh přiřazení na termíny, snadné spuštění. Design je vedlejší.

## Pracovní postup

- Plán byl uživatelem schválen 2026-10-14; implementace a průběžné commity jsou autorizované. Termín dokončení 12:20 Europe/Prague.
- Schválený rozsah a předpoklady jsou v docs/PLAN.md. Nové návrhy mimo tento rozsah neprezentovat jako schválené.
- Významná rozhodnutí, lidskou oponenturu, opravy AI a ověření průběžně zapisovat do docs/WORK_LOG.md. Nepřipisovat uživateli nevyřčené závěry.
- Po každém funkčním milníku udělat malý smysluplný commit, jakmile bude Git dostupný. Nečekat na kompletní aplikaci.
- Nezavádět další služby/frameworky bez konkrétního důvodu. Doména nesmí záviset na HTTP frameworku nebo hostingu.
- Testovat významné hraniční stavy importu, platnosti a plánování. Netrávit limit testy kosmetických detailů.
- Neoznačovat neověřené nasazení, nepřístupný repozitář nebo neproběhlý test za hotové.
- Při časovém skluzu vědomě zmenšit rozsah a popsat to v odevzdání. Zachovat čas na nasazení a README.

## Data a bezpečnost

- Originální CSV mimo veřejný Git. Do aplikace minimalizovaný syntetický seed bez rodných čísel a nepotřebných poznámek.
- Identita zaměstnance podle ID, žádné automatické sloučení podle emailu/jména.
- Chybné/nejasné údaje mají audit a stav nejistoty; nedovozovat úspěšné proškolení z nekvalitního záznamu.
- HTML escapovat, SQL parametrizovat, validovat requesty. Secrets mimo repo.
- Demo a skutečný provoz jasně oddělit v dokumentaci. Návrh účastníků není skutečná rezervace.

## Skills

Používat pouze podle skutečného úkolu. Pro analýzu CSV nejsou potřeba spreadsheet artefakty ani příslušný skill. Při realizaci webu přečíst a vyhodnotit sites:sites; případné požadavky na infrastrukturu vysvětlit uživateli. Pro běžné Markdown soubory v repozitáři není potřeba Pages. Pro případný požadovaný PDF/DOCX výstup použít odpovídající skill. Nevytvářet vlastní skill bez potřeby opakovaného workflow.
