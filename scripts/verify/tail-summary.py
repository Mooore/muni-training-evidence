"""Retain runtime timings and route class only; discard IP, headers, query and employee IDs."""
import sys,json
from urllib.parse import urlsplit
buffer='';decoder=json.JSONDecoder()
try:
 for line in sys.stdin:
  buffer+=line
  while buffer.strip():
   buffer=buffer.lstrip()
   try:event,end=decoder.raw_decode(buffer)
   except json.JSONDecodeError:break
   buffer=buffer[end:]
   path=urlsplit(event.get('event',{}).get('request',{}).get('url','')).path
   route='/employees/:id' if path.startswith('/employees/') else path if path in {'/','/health','/quality','/planning','/sessions','/app.css'} else 'other'
   result={key:event.get(key) for key in ['eventTimestamp','cpuTime','wallTime','outcome','scriptVersion']}
   print(json.dumps({**result,'route':route}),flush=True)
except KeyboardInterrupt:
 pass
