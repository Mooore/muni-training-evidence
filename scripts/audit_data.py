"""Read-only audit of original exports; Python standard library only."""
import argparse, csv, io, json
from pathlib import Path
from collections import Counter
from datetime import date, datetime
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('directory', type=Path, help='Directory containing the four original CSV exports')
ROOT = parser.parse_args().directory
CONFIG = {'zamestnanci': ('utf-8-sig', ','), 'katalog_skoleni': ('utf-8-sig', ','), 'terminy_skoleni': ('utf-8-sig', ';'), 'absolvovana_skoleni': ('cp1250', ';')}
data = {name: list(csv.DictReader(io.StringIO((ROOT / (name + '.csv')).read_bytes().decode(enc), newline=''), delimiter=sep)) for name, (enc, sep) in CONFIG.items()}
def dt(s):
    s=s.strip()
    for fmt in ['%Y-%m-%d', '%d. %m. %Y', '%d.%m.%Y', '%d/%m/%Y', '%Y/%m/%d']:
        try: return datetime.strptime(s,fmt).date()
        except ValueError: pass
    return None
e=data['zamestnanci']; c=data['katalog_skoleni']; t=data['terminy_skoleni']; a=data['absolvovana_skoleni']; ids={x['id_zamestnance'] for x in e}; codes={x['kod'] for x in c}; ref=date(2026,10,1)
result={'files':{n:{'rows':len(r),'encoding':CONFIG[n][0],'delimiter':CONFIG[n][1], 'exact_duplicate_rows':len(r)-len({json.dumps(x,sort_keys=True,ensure_ascii=False) for x in r})} for n,r in data.items()},'employees':{'statuses':dict(Counter(x['stav'] for x in e)),'departments':dict(Counter(x['utvar'] for x in e)), 'duplicate_email_groups':sum(v>1 for v in Counter(x['email'].strip().lower() for x in e).values()),'unknown_manager_rows':sum(x['vedouci_email'] not in {y['email'].strip().lower() for y in e} for x in e),'start_after_reference':sum((dt(x['datum_nastupu']) or date.min)>ref for x in e)},'completions':{'duplicate_ids':{k:v for k,v in Counter(x['id_zaznamu'] for x in a).items() if v>1},'unknown_employee_ids':dict(Counter(x['id_zamestnance'] for x in a if x['id_zamestnance'] not in ids)), 'unknown_codes_after_trim_upper':dict(Counter(x['kod_skoleni'].strip().upper() for x in a if x['kod_skoleni'].strip().upper() not in codes)), 'invalid_completion_dates':dict(Counter(x['datum_absolvovani'] for x in a if not dt(x['datum_absolvovani']))),'invalid_nonempty_expiry_dates':dict(Counter(x['platnost_do'] for x in a if x['platnost_do'] and not dt(x['platnost_do']))),'missing_expiry':sum(not x['platnost_do'] for x in a),'future_completions':sum((dt(x['datum_absolvovani']) or date.min)>ref for x in a),'completion_before_1950':sum(bool(dt(x['datum_absolvovani'])) and dt(x['datum_absolvovani'])<date(1950,1,1) for x in a),'expiry_before_completion':sum(bool(dt(x['platnost_do']) and dt(x['datum_absolvovani'])) and dt(x['platnost_do'])<dt(x['datum_absolvovani']) for x in a)},'sessions':{'unknown_codes':[x['id_terminu'] for x in t if x['kod_skoleni'] not in codes], 'overbooked':[x['id_terminu'] for x in t if int(x['obsazeno'])>int(x['kapacita'])],'zero_capacity':[x['id_terminu'] for x in t if int(x['kapacita'])==0],'cancelled':[x['id_terminu'] for x in t if x['stav']=='zrušeno']}}
print(json.dumps(result,ensure_ascii=False,indent=2))
