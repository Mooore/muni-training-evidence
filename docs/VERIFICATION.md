# Ověření a praktická omezení

Ověřeno 2026-10-14, macOS, Node 22.17, instalovaný Google Chrome; lokálně Wrangler/D1, vzdáleně Cloudflare Workers/D1. Výchozí syntetický dataset před opravou jmen `239aef0a043c4b76`; novější revize a dataset jsou uvedeny v poslední sekci. HTTP smoke první verze MVP: revize `817535a`, Cloudflare verze `760b97c2-f8e0-4923-8cbc-8b62abdd920c`. Prohlížeč a runtime CPU byly měřeny na optimalizované revizi `2311d72`; finální změny nemění plánovací/doménový výpočet.

## Funkční kontroly

- 23 unit/integration testů: CSV včetně citovaných a víceřádkových buněk, struktura, minimalizace, identity a konflikty, kalendářní měsíce a hranice platnosti, nejistota, způsobilost, kapacita, kolize, stabilita pořadí, SQL migrace+seed, escapování a validace requestů. Dodatečný test ověřuje, že ani zahřátá cache nezakryje výpadek DB.
- 3 Playwright průchody lokálně i na veřejné URL: přehled → filtr → detail → návrh → nezařazené důvody → audit; mobil a klávesnice, prázdný/chybový stav; browser timing.
- Typecheck a produkční build prošly. CI na GitHubu pro dosavadní implementační commity prošlo; [finální aplikační běh 817535a prošel](https://github.com/Mooore/muni-training-evidence/actions/runs/38530086768).
- Čistý export Git revize `2311d72` do samostatného adresáře: npm ci, migrace, seed, testy, build i vlastní server na portu 8790 úspěšné. HTTP ověřil skutečný dataset a obsah. Nevychází z původních CSV nebo pracovního .wrangler. Čistý export obsahoval tehdejších 20 testů; tři dodatečné testy byly spuštěny v hlavní pracovní kopii.
- Lokální dataset rollback nacvičen v integračním SQLite testu: neúplný staging nezměnil aktivní dataset; nová kopie aktivována a předchozí pointer obnoven. Chyba DB vrací 503 bez falešných nul.
- Deployment gate kontroluje typy, testy a build; veřejný smoke kontroluje obsah, revizi, dataset a bezpečnostní hlavičky. První plný deploy dostal při okamžitém smoke ještě starou odpověď; po ověření propagace opakovaný smoke prošel. Skript nyní čeká na správný obsah nejvýše 45 sekund.
- Automatický rollback k předchozí explicitně zadané verzi je připraven; jeho chybová větev nebyla na veřejném hostingu vynuceně spuštěna. Rollback kódu nevrací data.
- Kontrola historie před zveřejněním: 66 blobů, žádné původní CSV, emailové adresy, rodná čísla ve formátu s lomítkem nebo běžné formáty secrets. Jde o cílenou kontrolu, nikoli důkaz absence libovolného tajemství.

## HTTP výkon po optimalizaci

12 sekvenčních požadavků na každou cestu, první zvlášť a dalších 11 pro medián/p95. Plný přenos těla z klienta v ČR, Cloudflare edge VIE, DB EEUR. Malý vzorek není produkční p95 ani zátěžový test. Nejde vždy o nový Worker isolate; údaj první neznamená garantovaný cold start.

| Cesta | První celkem ms | Medián celkem ms | p95 celkem ms | p95 server app ms | HTML bajtů |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` | 85.4 | 67.3 | 86.2 | 22.0 | 13127 |
| `/?department=Laborato%C5%99e` | 58.6 | 63.9 | 82.7 | 21.0 | 13194 |
| `/employees/E0001` | 57.9 | 60.5 | 80.4 | 38.0 | 9148 |
| `/planning` | 67.1 | 63.3 | 71.9 | 22.0 | 49784 |
| `/quality?level=warning` | 151.5 | 57.6 | 79.4 | 20.0 | 8759 |

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

Konkrétní běžící Worker má usage_model=standard a bez explicitního CPU limitu. Billing tarif se s dostupným OAuth oprávněním ověřit nepodařilo (403). Žádný tarif nebyl změněn ani objednán. Aktuální veřejný hosting požadavky obsloužil bez limitních chyb; to není garance chování na jiném/free účtu. SQL stránkování auditu bylo následně realizováno a přeměřeno níže. Omezení studeného načítání celého datasetu pro ostatní cesty zůstává dalším možným krokem. Před produkcí nebo přesunem na Free nutno ověřit.

Snapshot cache je pouze interní paměť stejného isolate. Aktivní pointer se vždy čte z DB; její výpadek vrací chybu a změna pointeru invaliduje snapshot. Veřejné odpovědi mají no-store. Runtime kontrola byla dočasná; sdílené výsledky obsahují jen časy, outcome a verzi, nikoli request IP/hlavičky.

## Po uživatelské oponentuře — 10:14

Aktuální aplikace e831be3, Cloudflare version 1b667c2c-0d83-464e-87f8-93630bc1d0e4, stejný dataset. Doplněny celé názvy školení, trace pořadí a volby termínu i konkrétní vysvětlení „K ověření“. Algoritmické rozhodování se nemění. Porovnání s předchozí verzí na třech datech potvrdilo stejné přiřazené a nezařazené dvojice (1. 10.: 148/66; 20. 10.: 189/67; 15. 11.: 178/92).

26 testů, typecheck, produkční build a 4 lokální i veřejné E2E prošly. Nový průchod vede z vysvětlení k osobě s chybějícím útvarem. [CI aplikačního commitu úspěšné](https://github.com/Mooore/muni-training-evidence/actions/runs/38533480633). Vizuálně ověřen desktopový návrh.

Stejná metodika omezeného HTTP smoke (12 sekvenčních požadavků na cestu, první odděleně):

| Cesta | Medián celkem ms | p95 celkem ms | p95 server app ms | HTML bajtů |
| --- | ---: | ---: | ---: | ---: |
| `/` | 96 | 507.7 | 302.0 | 13754 |
| `/?department=Laborato%C5%99e` | 73.7 | 183.9 | 94.0 | 13836 |
| `/employees/E0001` | 71.2 | 78.2 | 23.0 | 9415 |
| `/planning` | 77 | 114.2 | 22.0 | 141190 |
| `/quality?level=warning` | 65.8 | 109.8 | 28.0 | 8759 |

Desktopový obsah přehledu viditelný za 260 ms, simulovaný mobil LCP 364 ms při stejných podmínkách jako výše. Jeden vzorek na režim; nejde o SLA. Serverové p95 v tomto měření do 500 ms, u přehledu jeden celkový přenos 507,7 ms (samotný server 302 ms). Dřívější CPU/Free omezení nadále platí; nové měření CPU nebylo provedeno.

## Zjednodušený přehled — 10:34

Aktuální aplikace 4266f2b, Cloudflare version a9cff5a8-dff0-4012-a28b-ecd2fd05c3ac, stejný dataset. Graf obsahuje dvě disjunktní skupiny osob: 90/153 aktuálně splněno, 63 řešit nebo ověřit. Úkoly mají překrývající se osoby; odlišení je uvedeno v UI. Prázdný výběr nemá graf a netvrdí splnění.

29 unit/integration testů, typecheck, build a 5 lokálních i veřejných E2E úspěšné. Nové testy pokrývají agregaci unikátních osob, překryv pracovních úkolů, nejisté a nepovinné požadavky, přesný snapshot, odkazy úkolů a zachování útvaru, rozbalení aktivních filtrů a prázdný výběr. Vizuálně zkontrolován desktop i mobil. Graf používá nativní HTML progress bez JS/knihovny a má přístupný název i textovou legendu. [CI aplikačního commitu úspěšné](https://github.com/Mooore/muni-training-evidence/actions/runs/38535706839).

Stejný omezený HTTP smoke (12 sekvenčních požadavků/cestu, první odděleně):

| Cesta | Medián celkem ms | p95 celkem ms | p95 server app ms |
| --- | ---: | ---: | ---: |
| `/` | 96.6 | 237.9 | 90.0 |
| `/?department=Laborato%C5%99e` | 75.5 | 263.2 | 97.0 |
| `/employees/E0001` | 80.3 | 230.2 | 92.0 |
| `/planning` | 88.5 | 703.6 | 25.0 |
| `/quality?level=warning` | 72.1 | 162.6 | 102.0 |

Veřejný desktopový obsah přehledu viditelný za 298 ms; simulovaný mobil LCP 380 ms při stejných podmínkách jako dříve. Jeden vzorek na režim. P95 přenosu návrhu 703,6 ms zahrnuje síť; jeho serverové p95 bylo 25 ms. Žádná chyba HTTP během smoke. Dosavadní CPU/Free omezení nadále platí; nové CPU měření se neprovádělo.

## Auditovaná oprava formátu křestních jmen — 10:54

Aktuální aplikace 1b38fb4, Cloudflare version 9acdf47e-385d-4671-840e-41c6661caa98, nový dataset 8329fc51214bfc0b. Opraveno šest křestních jmen podle explicitního seznamu; audit +6 událostí, nyní 4 433. Identity, všechny ostatní atributy osob, katalog, doklady a termíny beze změny; předchozí audit se pouze rozšířil. Plánování přesně shodné na třech referenčních datech, aktuální splnění stále 90/153 osob.

Před vzdálenou aktivací exportována záloha D1 do ignorovaného lokálního artefaktu. Předchozí neměnný dataset 239aef0a043c4b76 zůstává uložen pro návrat pointeru. Originální CSV se nepřepisují.

30 testů, typecheck, build a 6 lokálních i veřejných E2E prošly. Nový test ukazuje Lucie na detailu E0020 a dohledává auditní opravu se souborem a řádkem; import test chrání odlišná ID při stejném sjednoceném jméně, diakritiku i neobvyklé zápisy. [CI aplikačního commitu úspěšné](https://github.com/Mooore/muni-training-evidence/actions/runs/38537710754).

Omezený veřejný smoke se stejnou metodikou:

| Cesta | Medián celkem ms | p95 celkem ms | p95 server app ms |
| --- | ---: | ---: | ---: |
| `/` | 119 | 283 | 91.0 |
| `/?department=Laborato%C5%99e` | 85 | 117.3 | 26.0 |
| `/employees/E0001` | 74.1 | 108.6 | 23.0 |
| `/planning` | 87.2 | 403.5 | 58.0 |
| `/quality?level=warning` | 69.1 | 186.8 | 99.0 |

Desktopový obsah přehledu viditelný za 274 ms, simulovaný mobil LCP 384 ms. Jednotlivé vzorky za stejných podmínek jako výše, nikoli SLA. Žádná chyba HTTP během smoke; předchozí CPU/Free omezení nadále platí.


## SQL audit a závěrečná přejímka (11:15)

Veřejná aplikace `fb600f52ff7af4fa12dd88014e2ba5bc8714ae4c`, Cloudflare verze `8e826edf-e3ea-47d9-b857-713b2fe4d4a4`, dataset nadále `8329fc51214bfc0b`. Nedestruktivní index z migrace 0002 aplikován lokálně i vzdáleně. Audit nyní počítá a filtruje v SQL a parsuje nejvýše 30 událostí; nezávisí na načtení ostatních entit. Health čte metadata a počty, neověřuje obsah každého dokladu.

32 unit/integration testů, typecheck, build a 7 lokálních i veřejných Playwright průchodů úspěšných. Nová ověření zahrnují stabilní pořadí/stránkování, globální souhrny, literální hledání s injekčními znaky a nezávislost auditu na poškozeném dokladu při zachování 503 na přehledu. [CI této revize](https://github.com/Mooore/muni-training-evidence/actions/runs/38539835227) úspěšné včetně instalace, čistých migrací, seedu a E2E.

HTTP smoke: 12 sekvenčních požadavků na každou cestu, audit první po count-only health. První odpověď oddělena od zbývajících 11; Node fetch čte celé tělo. Medián/p95 nejsou produkční distribuce, zahrnují síť.

| Cesta | První přenos ms | Další medián / p95 ms |
| --- | ---: | ---: |
| Audit | 172,2 | 155,5 / 198,1 |
| Audit, warning | 185,1 | 150,6 / 320,3 |
| Přehled | 260,5 | 89,9 / 131,4 |
| Přehled, útvar | 93,1 | 88,1 / 118,3 |
| Detail | 73,1 | 79,5 / 89,9 |
| Návrh | 100 | 90,2 / 102,9 |

Runtime tail zachytil 32 událostí nové verze během smoke a E2E, všechny `outcome=ok`; není to kompletní záznam všech požadavků. Ukládaly se jen čas, CPU/wall time, verze a třída routy, bez query, ID osoby, IP a hlaviček. Z 13 zachycených auditů měl první 12 ms CPU, dalších 12 rozsah 2–8 ms (medián celé auditní sady 5 ms). Starší první audit měl 45 ms; jde o orientační historické srovnání, nikoli řízený experiment ve stejném isolate. První požadavek po deploy není garantovaný cold start. První zachycený přehled měl 57 ms a nejvyšší zachycený plánovač 61 ms. Samotné SQL stránkování tedy **neřeší Free kompatibilitu celé aplikace**. Na aktuálním hostingu nebyly pozorovány runtime chyby, billing tarif nadále neověřen a nezměněn. Oficiální Free limit 10 ms CPU znovu ověřen 14. 10. 2026 v odkazu výše.

Veřejný desktopový obsah viditelný za 315 ms, simulovaný mobil LCP 372 ms, stejné podmínky jako výše a jeden vzorek na režim.

Přejímka: README odpovídá aktuálním příkazům a migracím; čisté spuštění poslední revize ověřilo CI. Stručné odevzdání obsahuje veřejné odkazy, rozsah, doménová rozhodnutí, způsob spuštění, ověření a produkční výluky. Originální CSV a lokální zálohy zůstávají mimo Git. Dataset ani pravidla přiřazení tato úprava nemění. Automatická chybová větev návratu kódu nebyla veřejně vyvolána; dříve nacvičený lokální návrat datasetu zůstává doložen výše. MVP připraveno k odevzdání před termínem 12:20.


## Dodatečná přejímka FE filtrů (11:23)

Přidáno osm E2E scénářů v `tests/e2e/filters.spec.ts`, celkem nyní 15 browser testů. Přesná ID osob a počty se porovnávají proti snapshotu a doménovým pravidlům, bez volání filtrační funkce view. Pokryto všech devět útvarů, šest způsobilostí, pět stavů, jméno/ID/case/diakritika, průniky, prázdné výsledky, všechny stránky seznamu bez duplicit/vynechání, zastaralá stránka, datum, zachování/reset filtrů a detail/zpět. Audit má kontrolu průniku ID/úrovně včetně přesných řádků a počtů. Mobilní test používá Enter, kombinovaný výběr a reload. Neplatné hodnoty v URL vrací 400, speciální HTML/SQL znaky jsou literální hledání.

V tomto rozsahu se aplikační chyba neprokázala. Výslovně chráněno stávající chování: stav povinnosti omezuje seznam, graf respektuje populaci před tímto filtrem; reset zachovává datum. Nejde o exhaustivní test všech kartézských kombinací všech hodnot. Kontrola 32 unit/integration testů, typů a buildu úspěšná, celá sada 15 lokálních E2E úspěšná. Běžící aplikační revize a dataset beze změny.

Všech 15 veřejných E2E rovněž úspěšných (25,1 s). Orientačně desktop obsah 404 ms, simulovaný mobil LCP 376 ms za dosavadních podmínek, jednotlivé vzorky. Změna přidává testy/dokumentaci a nevyžaduje nové nasazení běhového kódu.

[CI testovacího commitu 40c3d0d](https://github.com/Mooore/muni-training-evidence/actions/runs/38542018773) úspěšné: čistá instalace, 32 unit/integration testů, typy/build, migrace/seed a všech 15 browser testů.


## Filtr konkrétního školení (11:31)

Aplikační revize `0f329c2`, Cloudflare verze `f768d6d0-0ef6-4b71-b81a-2a3a1dddb729`, dataset beze změny. Viditelný výběr názvu/kódu omezuje graf, úkoly, počty i řádkové stavy na zvolený kurz. Osoby bez povinnosti se uvádějí odděleně a nepočítají se jako proškolené; nejistá povinnost se nezamlčuje. Filtr se zachovává v úkolech/stránkování, reset jej zruší a neznámý kurz vrací 400.

32 unit/integration testů, typy/build a všech 17 lokálních i veřejných E2E prošlo. [Čisté CI této revize](https://github.com/Mooore/muni-training-evidence/actions/runs/38542616573) success. Nové scénáře porovnávají konkrétní ID a přesný čitatel/jmenovatel pro všech deset kurzů, nepovinné ANGL bez falešného 100 %, průnik BOZP se všemi stavy v útvaru, úkoly, stránkování, reset a mobilní Enter/reload. BOZP-Z k 1. 10. 2026: 137/153 aktivních splněno (včetně 2 obnov do 60 dnů), 9 prošlé, 7 chybí.

Deploy smoke šest cest × 12 bez HTTP chyb: audit median/p95 130,7/157 ms, přehled 63,6/171,9 ms, plán 67,1/97,1 ms. První přehled 195,7 ms; malý vzorek zahrnuje síť a není SLA. Veřejný desktop obsah 253 ms, simulovaný mobil LCP 372 ms, jednotlivé vzorky za stejných podmínek jako dříve. Nové CPU měření neproběhlo; dosavadní Free omezení se neodvolává. Databáze a plánovací algoritmus se nemění.


## Rychlé stavové bubliny (11:40)

Veřejná aplikace `30cbb46`, Cloudflare verze `84fc865b-d16d-46c4-b129-334ef4359771`, dataset beze změny. Skupina stavu ve sloupci Povinná školení otevírá seznam celých názvů a kódů odpovídajících kurzů pro danou osobu, se zachováním filtru kurzu. Nativní popover se vykresluje nad scrollovací tabulkou; malý same-origin vanilla JS pouze na přehledu doplňuje hover/focus a umístění. CSP dovoluje pouze self skripty, bez inline/eval. Bez JavaScriptu zůstává nativní kliknutí a Escape funkční v testovaném Chromiu.

32 unit/integration testů, typy/build a 21 lokálních i veřejných E2E úspěšných. [Čisté CI této revize](https://github.com/Mooore/muni-training-evidence/actions/runs/38543786053) success. Čtyři nové scénáře pokrývají přesné seznamy všech pěti stavů a počty, přechod myši do bubliny, odjezd, Escape, opakovaný klávesnicový focus, filtr BOZP, skutečný dotykový kontext s tap/outside a hranice viewportu, kliknutí/Escape s vypnutým JS. Vizuálně zkontrolován lokální desktopový screenshot; bublina čitelná a neoříznutá tabulkou. Nejde o audit všech prohlížečů/asistenčních technologií.

Veřejný smoke šest cest × 12 bez chyb: přehled první 171,5 ms, další median/p95 156,5/334,7 ms; filtr útvaru 64,2/220,9 ms; plán 67,4/86,5 ms. HTML přehledu má nyní 32 787 B před kompresí, protože obsahuje i seznamy školení; browser transfer HTML přibližně 5,1 kB. Desktopový obsah 380 ms, simulovaný mobil LCP 388 ms, jednotlivé vzorky za dosavadních podmínek. Síťová měření nejsou CPU ani SLA. Nové CPU měření neproběhlo, dřívější Free omezení nadále platí. Doména, import, data a přiřazovací algoritmus se nemění.


## Multiselect stavů a nezakrytý stavový sloupec (11:50)

Veřejná aplikace `eb4ea9f`, Cloudflare verze `980c252b-9243-4830-9296-1d936a62c2cd`, dataset stejný. Bublina na desktopu leží vlevo od celé stavové buňky, aby neblokovala přejíždění mezi odznaky různých řádků; na úzkém viewportu nad odznakem. Dashed border a hover podbarvení triggeru odstraněny; keyboard focus zachován. Reaguje i na scroll vnořené tabulky.

Stav se vybírá checkboxy (OR), bez výběru jsou všechny stavy. Zkratky „Vše kromě Platné“ a „Všechny stavy“ respektují aktuálně aplikované ostatní filtry včetně školení. První zahrnuje také Končí do 60 dnů, což je stále aktuálně platné školení. U zvoleného kurzu se stav testuje pouze na tomto kurzu. URL přenáší všechny state hodnoty opakovanými parametry, validační chyba kterékoli hodnoty vrátí 400; duplicity se deduplikují a původní single-state URL funguje. Graf zůstává nad populací před stavovým omezením seznamu.

32 unit/integration testů, typy/build a všech 25 lokálních i veřejných E2E úspěšných. [Čisté CI této revize](https://github.com/Mooore/muni-training-evidence/actions/runs/38544956905) success. Čtyři nové scénáře kontrolují přesné ID pro OR výběr se školením, další filtry a datum, opakované URL parametry při stránkování/reloadu, reset, mobilní zkratky, legacy/duplicate/invalid URL; geometricky potvrzují bublinu mimo stavový sloupec při najetí na tři po sobě jdoucí řádky a nulový border/transparentní hover. Dosavadní keyboard/touch/Escape/fallback scénáře nadále prošly.

Smoke šest cest × 12 bez chyb: přehled první 175,4 ms, další median/p95 65,8/75,2 ms; útvar 64,8/72 ms; plán 68,3/144,9 ms. Veřejný browser desktop obsah 665 ms (TTFB 507 ms), simulovaný mobil LCP 404 ms. Jednotlivé browser vzorky a malé HTTP sady zahrnují síť, nejde o SLA ani CPU. Nové CPU měření neproběhlo; předchozí Free omezení se neodvolává. Doménová pravidla a dataset zůstávají stejné.
