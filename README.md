# Evidence školení — praktický úkol MUNI

Projekt je ve fázi analýzy a plánování. Aplikace ani veřejné nasazení zatím neexistují.

Vstupní exporty jsou zcela syntetické, k 1. 10. 2026. V návrhu simulujeme zacházení s citlivými daty: minimalizace, dohledatelné rozhodování a oddělení demo režimu od reálného provozu.

## Podklady

- [Návrh rozsahu, domény, stacku a časového plánu](docs/PLAN.md)
- [Work log, oponentura a použití AI](docs/WORK_LOG.md)
- [Prvotní profil dat](docs/data-audit.json)
- [Pravidla práce](AGENTS.md)

## Reprodukce prvotního auditu

Vyžaduje Python 3 a originální čtyři CSV. Audit soubory nemění. Adresář vstupů se předává jako argument; jde o analytický nástroj, nikoli budoucí způsob spuštění aplikace.

```sh
python3 scripts/audit_data.py /cesta/k/exportum
```

Audit používá skutečný CSV parser a kódování/oddělovače po jednotlivých souborech. Číselné Excel datum zatím hlásí jako neinterpretované základním parserem. Import aplikace bude mít vlastní validaci podle odsouhlasených pravidel.

Instrukce ke spuštění aplikace, testům a nasazení doplníme při implementaci.
