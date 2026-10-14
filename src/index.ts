import { Hono } from 'hono';
const app = new Hono<{Bindings:{DB:D1Database}}>();
app.get('/health', c => c.json({status:'ok', version:'0.1.0', dataset:'not-imported'}));
app.get('/', c => c.html('<!doctype html><html lang="cs"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Evidence školení</title><link rel="stylesheet" href="/app.css"><main><h1>Evidence školení</h1><p>Základ aplikace. Import dat ještě neproběhl.</p></main></html>'));
export default app;
