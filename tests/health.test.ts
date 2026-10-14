import { expect, test } from 'vitest';
import app from '../src/index';
test('database failure produces unavailable response, never false zeros', async () => {
 const response = await app.request('/health');
 expect(response.status).toBe(503);expect(await response.json()).toMatchObject({status:'unavailable'});
 const page=await app.request('/');expect(page.status).toBe(503);expect(await page.text()).toContain('Data nyní nejsou dostupná');
});
test('request validation runs before database access',async()=>{expect((await app.request('/?date=2026-02-30')).status).toBe(400);expect((await app.request('/?page=-1')).status).toBe(400);expect((await app.request('/',{method:'POST'})).status).toBe(405);});
