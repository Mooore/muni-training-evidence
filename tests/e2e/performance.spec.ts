import {test,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
test('browser content timing on desktop and throttled mobile',async({page})=>{
 const desktopStart=performance.now();await page.goto('/');await expect(page.getByRole('heading',{name:'Přehled školení',exact:true})).toBeVisible();const desktopVisibleMs=performance.now()-desktopStart;
 const desktop=await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;return {ttfbMs:n.responseStart,domContentLoadedMs:n.domContentLoadedEventEnd,transferBytes:n.transferSize};});
 await page.setViewportSize({width:390,height:844});const cdp=await page.context().newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:75000});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await page.addInitScript(()=>{(window as unknown as {__lcp:number}).__lcp=0;new PerformanceObserver(list=>{for(const entry of list.getEntries())(window as unknown as {__lcp:number}).__lcp=entry.startTime;}).observe({type:'largest-contentful-paint',buffered:true});});
 await page.goto('/');await expect(page.getByRole('heading',{name:'Přehled školení',exact:true})).toBeVisible();await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
 const mobile=await page.evaluate(()=>({lcpMs:(window as unknown as {__lcp:number}).__lcp,domContentLoadedMs:(performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).domContentLoadedEventEnd}));
 const report={timestamp:new Date().toISOString(),url:page.url(),desktopVisibleMs,desktop,mobile,conditions:'Chromium; mobile 390x844, 150 ms latency, 1.6 Mbps download, 0.6 Mbps upload, 4x CPU, disabled cache; one sample, not production distribution'};
 mkdirSync('.artifacts',{recursive:true});writeFileSync('.artifacts/browser-performance.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));expect(mobile.lcpMs).toBeGreaterThan(0);
});
