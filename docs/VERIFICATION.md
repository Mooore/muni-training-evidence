# Ověření a praktická omezení

Ověřeno 2026-10-14, macOS, Node 22.17, instalovaný Google Chrome; lokálně Wrangler/D1, vzdáleně Cloudflare Workers/D1. Syntetický dataset `239aef0a043c4b76`. Veřejný smoke a měření níže: revize `2311d72`, Cloudflare verze `59899514-3eb1-4486-a7ff-5742e3b81b25`.

## Funkční kontroly

- 23 unit/integration testů: CSV včetně citovaných a víceřádkových buněk, struktura, minimalizace, identity a konflikty, kalendářní měsíce a hranice platnosti, nejistota, způsobilost, kapacita, kolize, stabilita pořadí, SQL migrace+seed, escapování a validace requestů. Dodatečný test ověřuje, že ani zahřátá cache nezakryje výpadek DB.
- 3 Playwright průchody lokálně i na veřejné URL: přehled → filtr → detail → návrh → nezařazené důvody → audit; mobil a klávesnice, prázdný/chybový stav; browser timing.
- Typecheck a produkční build prošly. CI na GitHubu pro dosavadní implementační commity prošlo; konečný stav je uveden ve STATUS.md.
- Čistý export Git revize `2311d72` do samostatného adresáře: npm ci, migrace, seed, testy, build i vlastní server na portu 8790 úspěšné. HTTP ověřil skutečný dataset a obsah. Nevychází z původních CSV nebo pracovního .wrangler. Čistý export obsahoval tehdejších 20 testů; tři dodatečné testy byly spuštěny v hlavní pracovní kopii.
- Lokální dataset rollback nacvičen v integračním SQLite testu: neúplný staging nezměnil aktivní dataset; nová kopie aktivována a předchozí pointer obnoven. Chyba DB vrací 503 bez falešných nul.
- Deployment gate kontroluje typy, testy a build; veřejný smoke kontroluje obsah, revizi, dataset a bezpečnostní hlavičky. První plný deploy dostal při okamžitém smoke ještě starou odpověď; po ověření propagace opakovaný smoke prošel. Skript nyní čeká na správný obsah nejvýše 45 sekund.
- Automatický rollback k předchozí explicitně zadané verzi je připraven; jeho chybová větev nebyla na veřejném hostingu vynuceně spuštěna. Rollback kódu nevrací data.
- Kontrola historie před zveřejněním: 66 blobů, žádné původní CSV, emailové adresy, rodná čísla ve formátu s lomítkem nebo běžné formáty secrets. Jde o cílenou kontrolu, nikoli důkaz absence libovolného tajemství.

## HTTP výkon po optimalizaci

12 sekvenčních požadavků na každou cestu, první zvlášť a dalších 11 pro medián/p95. Plný přenos těla z klienta v ČR, Cloudflare edge VIE, DB EEUR. Malý vzorek není produkční p95 ani zátěžový test. Nejde vždy o nový Worker isolate; údaj první neznamená garantovaný cold start.

| Cesta | První celkem ms | Medián celkem ms | p95 celkem ms | p95 server app ms | HTML bajtů |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` | 180 | 181 | 378.1 | 285.0 | 13139 |
| `/?department=Laborato%C5%99e` | 65.7 | 67.9 | 85.6 | 21.0 | 13206 |
| `/employees/E0001` | 67.5 | 60.4 | 81.2 | 22.0 | 9160 |
| `/planning` | 78.2 | 61.4 | 94.8 | 38.0 | 49796 |
| `/quality?level=warning` | 154.5 | 57.5 | 151.5 | 97.0 | 8771 |

Server app v Server-Timing zahrnuje čekání na DB a renderování; není to CPU time. Časy celkem zahrnují i síť. Vzorky byly bez HTTP chyb. Běžné cesty splnily navržený cíl serverového p95 do 500 ms v tomto měření.

## Prohlížeč a doména

Veřejná revize 2311d72: desktopový obsah viditelný za 315 ms, DOMContentLoaded 180 ms. Mobil 390×844, 150 ms latence, 1,6 Mbps down / 0,6 Mbps up, 4× CPU, cache vypnutá: LCP 372 ms. Jeden vzorek na režim, nejde o polní Core Web Vitals.

Doménový výpočet bez HTTP/DB, deterministicky rozšířená syntetická sada:

| Rozsah | Osob | Dokladů | Přehled ms | Plán ms | Přiřazení / nezařazené potřeby |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1× | 174 | 2860 | 12.4 | 4.5 | 148 / 66 |
| 10× | 1740 | 28600 | 32.5 | 27.1 | 1480 / 660 |

Na obou sadách ověřena kapacita po odečtení obsazenosti, unikátnost osoba/kurz, intervalové kolize, způsobilost, zrušení a nezávislost na pořadí vstupů. Nejde o potvrzení produkční kapacity.

## CPU a hosting — přetrvávající omezení

Před optimalizací runtime tail ukázal 44–74 ms CPU. Po oddělení auditu a opakovaném použití neměnného datasetu v paměti: prvních osm sledovaných sekvenčních požadavků 5–9 ms CPU, všechny outcome=ok. Další prohlížečové požadavky zahrnovaly 45 ms při prvním načtení auditu a hodnoty 14–16 ms. **Nelze slíbit, že všechny cesty a cold start vyhovují Workers Free.** [Oficiální limit Free je 10 ms CPU](https://developers.cloudflare.com/workers/platform/limits/).

Konkrétní běžící Worker má usage_model=standard a bez explicitního CPU limitu. Billing tarif se s dostupným OAuth oprávněním ověřit nepodařilo (403). Žádný tarif nebyl změněn ani objednán. Aktuální veřejný hosting požadavky obsloužil bez limitních chyb; to není garance chování na jiném/free účtu. Další optimalizací by bylo stránkování auditu přímo v SQL a omezení studeného načítání celého datasetu. Před produkcí nebo přesunem na Free nutno ověřit.

Snapshot cache je pouze interní paměť stejného isolate. Aktivní pointer se vždy čte z DB; její výpadek vrací chybu a změna pointeru invaliduje snapshot. Veřejné odpovědi mají no-store. Runtime kontrola byla dočasná; sdílené výsledky obsahují jen časy, outcome a verzi, nikoli request IP/hlavičky.
