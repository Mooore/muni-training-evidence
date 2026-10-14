import { expect, test } from 'vitest';
import app from '../src/index';
test('health does not claim imported data', async () => {
 const response = await app.request('/health');
 expect(await response.json()).toMatchObject({status:'ok',dataset:'not-imported'});
});
