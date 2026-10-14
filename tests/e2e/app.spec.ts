import {test,expect} from '@playwright/test';
test('overview, filtering, detail, proposal and unassigned reasons',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:'Přehled školení',exact:true})).toBeVisible();
 await expect(page.getByText('Syntetické demo · historický snapshot')).toBeVisible();
 if(process.env.CAPTURE)await page.screenshot({path:'.artifacts/overview-desktop.png',fullPage:true});
 await page.getByRole('combobox',{name:'Útvar',exact:true}).selectOption('Laboratoře');await page.getByRole('button',{name:'Filtrovat',exact:true}).click();
 const person=page.locator('tbody th a').first();const name=await person.textContent();await person.click();
 await expect(page.getByRole('heading',{name:name!,exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Požadavky a platnost'})).toBeVisible();
 await expect(page.getByText('BOZP-Z · povinné')).toBeVisible();
 await page.getByRole('link',{name:'Návrh přiřazení',exact:true}).click();await expect(page.getByText('Návrh není rezervace.',{exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'Nezařazené potřeby',exact:true})).toBeVisible();
 await expect(page.locator('#unassigned + p')).toContainText('neznamená důkaz');
 await page.getByRole('link',{name:'Kvalita dat',exact:true}).click();await page.getByRole('combobox',{name:'Typ události',exact:true}).selectOption('warning');await page.getByRole('button',{name:'Filtrovat audit'}).click();await expect(page.locator('tbody')).toContainText('Upozornění');
});
test('mobile keyboard, empty and error states without document overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Přeskočit na obsah'})).toBeFocused();
 await expect(page.getByLabel('Zaměstnanec',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 if(process.env.CAPTURE)await page.screenshot({path:'.artifacts/overview-mobile.png',fullPage:true});
 await page.getByLabel('Zaměstnanec',{exact:true}).fill('nenalezeno-xyz');await page.getByRole('button',{name:'Filtrovat',exact:true}).click();await expect(page.getByText('Žádný zaměstnanec neodpovídá filtrům.')).toBeVisible();
 const bad=await page.goto('/?date=2026-02-30');expect(bad?.status()).toBe(400);await expect(page.getByRole('heading',{name:'Neplatný vstup'})).toBeVisible();
 const missing=await page.goto('/employees/no-such-id');expect(missing?.status()).toBe(404);await expect(page.getByRole('heading',{name:'Zaměstnanec nenalezen'})).toBeVisible();
});
