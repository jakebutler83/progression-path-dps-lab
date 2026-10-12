// Headless local development QA only. No authenticated services or remote writes.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin=process.env.LAB_PREVIEW_URL||'http://127.0.0.1:4174';
await mkdir('.lab-qa',{recursive:true});
const fixture={schema:'progression-path-dps/v1',character:{name:'HP Shooter',skills:{Attack:75,Strength:80,Defence:70,Hitpoints:77,Ranged:76,Magic:75,Prayer:70,Mining:64,Herblore:65}},loadout:{slots:{weapon:{name:'Abyssal whip',id:4151},neck:{name:'Amulet of glory(6)',id:11978},shield:{name:'Dragon defender',id:12954}}},target:{name:'King Black Dragon'}};
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:{})});
try{
  const context=await browser.newContext({viewport:{width:1440,height:1050},hasTouch:true,serviceWorkers:'block'}),page=await context.newPage(),errors=[],remote=[];
  context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('https://**',route=>{remote.push(route.request().url());return route.abort();});
  await page.goto(origin);await page.locator('#lab-title').waitFor();
  await page.waitForFunction(()=>Number(document.querySelector('[data-lab-metric="dps"]').textContent)>0);
  await page.locator('.lab-import summary').tap();
  await page.locator('#lab-import-json').fill(JSON.stringify(fixture));
  await page.getByRole('button',{name:'Import selected setup',exact:true}).tap();
  await page.waitForFunction(()=>document.querySelector('[data-lab-metric="dps"]').nextElementSibling.textContent.includes('HP Shooter'));
  assert.match(await page.locator('.lab-import-status').innerText(),/Imported HP Shooter/);
  assert.equal(await page.locator('.lab-target-art strong').innerText(),'King Black Dragon');
  await page.waitForFunction(()=>Number(document.querySelector('[data-lab-metric="dps"]').textContent)>0);
  const kbd=await page.locator('[data-lab-metric="dps"]').innerText();
  await page.getByRole('button',{name:'Abyssal demon',exact:true}).tap();
  await page.waitForFunction(old=>document.querySelector('[data-lab-metric="dps"]').textContent!==old,kbd);
  await page.getByRole('button',{name:'Compare setup',exact:true}).tap();
  assert.equal(await page.locator('.lab-player').getByRole('button',{name:'2',exact:true}).count(),1);
  await page.getByRole('button',{name:'Share',exact:true}).tap();
  const modal=page.getByRole('dialog');await modal.waitFor({state:'attached'});await modal.locator('input').waitFor();
  await page.waitForFunction(()=>document.querySelector('[role="dialog"] input')?.value.includes('#loadout='));
  const link=await modal.locator('input').inputValue();assert.ok(link.startsWith(origin+'/#loadout='));
  const fresh=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  await fresh.route('https://**',route=>route.abort());const restored=await fresh.newPage();restored.on('pageerror',e=>errors.push(e.message));
  await restored.goto(link);await restored.waitForFunction(()=>document.querySelector('[data-lab-metric="dps"]')?.nextElementSibling.textContent.includes('Loadout 2'));
  await restored.locator('.lab-player').getByRole('button',{name:'1',exact:true}).tap();
  await restored.waitForFunction(()=>document.querySelector('[data-lab-metric="dps"]').nextElementSibling.textContent.includes('HP Shooter'));
  assert.equal(await restored.locator('.lab-target-art strong').innerText(),'Abyssal demon');
  await restored.waitForFunction(()=>Number(document.querySelector('[data-lab-metric="dps"]').textContent)>0);
  await restored.locator('.lab-player').getByRole('button',{name:'Skills',exact:true}).tap();
  assert.equal(await restored.getByTitle('Your base Attack level',{exact:true}).inputValue(),'75');
  const beforeSkill=await restored.locator('[data-lab-metric="dps"]').innerText();
  await restored.getByTitle('Your base Attack level',{exact:true}).fill('99');
  await restored.getByTitle('Your base Attack level',{exact:true}).blur();
  await restored.waitForFunction(old=>document.querySelector('[data-lab-metric="dps"]').textContent!==old,beforeSkill);
  for(const width of [320,390,430]){
    await restored.setViewportSize({width,height:844});
    assert.ok(await restored.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),`skill controls overflow at ${width}`);
  }
  await restored.setViewportSize({width:390,height:844});
  await restored.locator('.lab-player').getByRole('button',{name:'Equipment',exact:true}).tap();
  const equipment=restored.getByPlaceholder('Search for equipment...');await equipment.tap();await equipment.fill('Rune scimitar');
  await restored.getByRole('option',{name:'Rune scimitar',exact:true}).tap();
  await equipment.press('Escape');
  await modal.getByRole('button',{name:'Close',exact:true}).tap();
  for(const width of [320,390,430,768,1440]){
    await page.setViewportSize({width,height:1050});await page.waitForTimeout(200);
    const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,items:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+3&&getComputedStyle(e).position!=='absolute').slice(0,8).map(e=>({tag:e.tagName,cls:e.className}))}));
    assert.ok(overflow.scroll<=width+3,JSON.stringify(overflow));
  }
  await page.setViewportSize({width:1440,height:1100});await page.locator('.lab-import summary').tap();await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:'.lab-qa/dps-desktop.png'});
  await restored.evaluate(()=>scrollTo(0,0));await restored.screenshot({path:'.lab-qa/dps-mobile.png'});
  await restored.locator('.lab-player').scrollIntoViewIfNeeded();await restored.screenshot({path:'.lab-qa/dps-mobile-controls.png'});
  assert.deepEqual(errors,[]);assert.deepEqual(remote,[],'normal calculation/import/compare/share must not use external APIs');
  await fresh.close();console.log('DPS Lab browser QA passed: worker DPS, exact account import, target changes, compare, fragment share in a fresh browser, no external API calls and five responsive widths.');
}finally{await browser.close();}
