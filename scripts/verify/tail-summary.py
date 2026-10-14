"""Read wrangler tail JSON on stdin, retain timing/outcome only (no IP, URL, headers)."""
import sys,json
buffer='';decoder=json.JSONDecoder()
for line in sys.stdin:
 buffer+=line
 while buffer.strip():
  buffer=buffer.lstrip()
  try:event,end=decoder.raw_decode(buffer)
  except json.JSONDecodeError:break
  buffer=buffer[end:]
  print(json.dumps({key:event.get(key) for key in ['cpuTime','wallTime','outcome','scriptVersion']}),flush=True)
