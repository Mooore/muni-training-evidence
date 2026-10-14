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
 await expect(page.getByText('Jak se určuje priorita',{exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Podrobný postup přiřazování'})).toBeHidden();
 await page.getByText('Jak se určuje priorita',{exact:true}).click();
 await expect(page.getByRole('heading',{name:'Podrobný postup přiřazování'})).toBeVisible();
 const proposals=page.getByRole('region',{name:'Navržená přiřazení',exact:true});
 await expect(proposals.getByRole('cell',{name:/BOZP – základní školení/}).first()).toBeVisible();
 await expect(proposals.locator('tbody tr').first()).toContainText(/#\d+/);
 await expect(proposals.locator('tbody tr').first()).toContainText('Volná místa před přiřazením:');
 if(process.env.CAPTURE){await page.getByRole('heading',{name:'Navržená přiřazení',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:'.artifacts/planning-explanation-desktop.png'});}

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

test('data review is explained and leads to the concrete missing information',async({page})=>{
 await page.goto('/planning');
 await page.getByText('Co je potřeba nejprve ověřit?',{exact:true}).click();
 await expect(page.getByText('Stav „K ověření“ znamená, že z dat nelze spolehlivě rozhodnout',{exact:false})).toBeVisible();
 await page.getByRole('link',{name:'Zobrazit osoby se stavem K ověření',exact:true}).click();
 await expect(page.getByRole('combobox',{name:'Stav povinnosti',exact:true})).toHaveValue('uncertain');
 await page.locator('tbody th a').first().click();
 await expect(page.getByText('Chybí útvar zaměstnance.',{exact:false}).first()).toBeVisible();
});

test('dashboard tasks and progress lead to the correct people with visible active filters',async({page})=>{
 await page.goto('/');
 const progress=page.getByRole('progressbar',{name:'Zaměstnanci se všemi aktuálně splněnými povinnostmi'});
 await expect(progress).toHaveAttribute('value','90');await expect(progress).toHaveAttribute('max','153');
 await expect(page.getByRole('combobox',{name:'Způsobilost',exact:true})).toBeHidden();
 await expect(page.getByText('Podrobné rozdělení stavů',{exact:true})).toBeVisible();
 const expired=page.getByRole('article').filter({has:page.getByRole('heading',{name:'Obnovit prošlá školení',exact:true})});
 await expect(expired).toContainText('21 osob · 39 povinností');await expired.getByRole('link',{name:'Zobrazit osoby'}).click();
 await expect(page.getByRole('combobox',{name:'Stav povinnosti',exact:true})).toBeVisible();await expect(page.getByRole('combobox',{name:'Stav povinnosti',exact:true})).toHaveValue('expired');
 await expect(page.getByRole('heading',{name:'Zaměstnanci 21 Prošlé'})).toBeVisible();
 await expect(progress).toHaveAttribute('value','90');
 await page.goto('/?department=Laborato%C5%99e');
 const localTask=page.getByRole('article').filter({has:page.getByRole('heading',{name:'Obnovit prošlá školení',exact:true})});
 await localTask.getByRole('link',{name:'Zobrazit osoby'}).click();
 await expect(page.getByRole('combobox',{name:'Útvar',exact:true})).toHaveValue('Laboratoře');
 await page.goto('/?q=nenalezeno-xyz');await expect(page.getByRole('progressbar')).toHaveCount(0);
 await expect(page.getByText('Pro prázdný výběr nelze určit úkoly.',{exact:false})).toBeVisible();
});
