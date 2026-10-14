import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {overview,eligibility} from '../../src/domain/evidence';
import type {Dataset,State} from '../../src/domain/types';
const data=JSON.parse(readFileSync('data/demo.json','utf8')) as Dataset;
const obligations=overview(data,data.meta.reference);

test('hover groups show the exact course names for each state, stay readable on hover and dismiss with Escape',async({page})=>{
 for(const state of ['valid','expiring','expired','missing','uncertain'] as State[]){
  const first=obligations.find(o=>o.state===state&&o.required!==false&&eligibility(o.employee,data.meta.reference)==='active')!;
  await page.goto('/?q='+first.employee.id);
  const group=page.locator('.training-group').filter({has:page.locator('.badge.'+state)}).first();
  const trigger=group.getByRole('button'),bubble=group.getByRole('tooltip');
  const expected=obligations.filter(o=>o.employee.id===first.employee.id&&o.required!==false&&o.state===state).sort((a,b)=>a.course.code.localeCompare(b.course.code));
  await expect(bubble).toBeHidden();await trigger.hover();await expect(bubble).toBeVisible();
  expect(await bubble.locator('li').allTextContents()).toEqual(expected.map(o=>`${o.course.name} (${o.course.code})`));
  await expect(trigger.locator('strong')).toHaveText(String(expected.length));
  await bubble.hover();await expect(bubble).toBeVisible();
  const box=await bubble.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.y).toBeGreaterThanOrEqual(0);
  if(process.env.CAPTURE)await page.screenshot({path:'.artifacts/training-popover-desktop.png'});
  await page.mouse.move(5,5);await expect(bubble).toBeHidden();
  await trigger.hover();await expect(bubble).toBeVisible();
  await page.keyboard.press('Escape');await expect(bubble).toBeHidden();
 }
});

test('keyboard focus opens the list, Escape closes it, and filtered lists contain only the selected course',async({page})=>{
 await page.goto('/?course=BOZP-Z');
 const trigger=page.locator('.training-trigger').first(),bubble=page.locator('.training-popover').first();
 await trigger.focus();await expect(bubble).toBeVisible();await expect(trigger).toHaveAttribute('aria-expanded','true');
 await expect(bubble.locator('li')).toHaveCount(1);await expect(bubble).toContainText('(BOZP-Z)');
 await page.keyboard.press('Escape');await expect(bubble).toBeHidden();
 await expect(trigger).toHaveAttribute('aria-expanded','false');await expect(trigger).toBeFocused();
 await page.keyboard.press('Tab');await expect(bubble).toBeHidden();
 await page.keyboard.press('Shift+Tab');await expect(bubble).toBeVisible();
});

test.describe('touch interaction',()=>{
 test.use({hasTouch:true});
 test('mobile tap opens and outside tap closes a bubble fully inside the viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const trigger=page.locator('.training-trigger').first(),bubble=page.locator('.training-popover').first();
 await trigger.tap();await expect(bubble).toBeVisible();
 const box=await bubble.boundingBox();expect(box).not.toBeNull();
 expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(390);
 expect(box!.y).toBeGreaterThanOrEqual(0);expect(box!.y+box!.height).toBeLessThanOrEqual(844);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('heading',{name:'Přehled školení',exact:true}).tap();await expect(bubble).toBeHidden();
});

});


test.describe('native fallback',()=>{
 test.use({javaScriptEnabled:false});
 test('click and Escape still work without the hover enhancement script',async({page})=>{
  await page.goto('/?course=BOZP-Z');
  const trigger=page.locator('.training-trigger').first(),bubble=page.locator('.training-popover').first();
  await trigger.click();await expect(bubble).toBeVisible();await expect(bubble).toContainText('(BOZP-Z)');
  await page.keyboard.press('Escape');await expect(bubble).toBeHidden();
 });
});


test('desktop bubbles leave the status column clear for continuous vertical movement and triggers have no border or hover fill',async({page})=>{
 await page.goto('/?course=BOZP-Z');
 const triggers=page.locator('.training-trigger');
 const first=triggers.nth(0),second=triggers.nth(1),third=triggers.nth(2);
 await second.scrollIntoViewIfNeeded();
 for(const trigger of [first,second,third]){
  await trigger.hover();
  const id=await trigger.getAttribute('popovertarget'),bubble=page.locator('[id="'+id+'"]');await expect(bubble).toBeVisible();
  const box=await bubble.boundingBox(),cell=await trigger.locator('xpath=ancestor::td').boundingBox();
  expect(box!.x+box!.width).toBeLessThanOrEqual(cell!.x);
  const style=await trigger.evaluate(el=>({border:getComputedStyle(el).borderTopWidth,background:getComputedStyle(el).backgroundColor}));
  expect(style).toEqual({border:'0px',background:'rgba(0, 0, 0, 0)'});
 }
});
