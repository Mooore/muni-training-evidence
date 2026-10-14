#!/bin/sh
set -eu
npm run db:local
npm run seed:local
exec ./node_modules/.bin/wrangler dev --local --ip 0.0.0.0 --port 8787
