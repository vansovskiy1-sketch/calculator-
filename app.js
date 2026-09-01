const SOLO_RATES=[[0,2000,125],[2000,3000,150],[3000,3500,185],[3500,4000,250],[4000,4500,300],[4500,5000,330],[5000,5620,400],[5620,6000,700],[6000,6500,900],[6500,7000,1200],[7000,7500,1500],[7500,8000,2000],[8000,8500,3000],[8500,9000,6000],[9000,9500,10000]];
const PARTY_RATES=[[0,2000,70],[2000,3000,80],[3000,4000,90],[4000,4500,110],[4500,5000,150],[5000,5620,180],[5620,6000,250],[6000,6500,400],[6500,7000,750],[7000,7500,1000],[7500,8000,2000],[8000,8500,3000],[8500,9000,4000],[9000,9500,5000]];
const CAL_RATES=[[0,2000,55],[2000,3000,65],[3000,4000,75],[4000,4500,90],[4500,5000,100],[5000,5620,135],[5620,6000,250],[6000,6500,300],[6500,7000,450],[7000,7500,600],[7500,8000,1000],[8000,8500,2000],[8500,9000,3500],[9000,9500,5000]];
const SERVICES={solo:{title:'ММР буст',rates:SOLO_RATES,unit:'₽ / 100 MMR'},party:{title:'Пати буст',rates:PARTY_RATES,unit:'₽ / вин'},calibration:{title:'Калибровка',rates:CAL_RATES,unit:'₽ / вин'},coaching:{title:'Коучинг',rates:null,unit:'₽ / час'},battlecup:{title:'Боевой кубок',rates:null,unit:'₽ / заказ'}};
const DEFAULT={current:1000,target:3000,mmr:3000,wins:10,hours:1,tier:3,order:10000,courtesy:10000};
const state={service:'solo',values:{...DEFAULT},addons:{}};
const $=s=>document.querySelector(s); const money=v=>`${Math.round(v).toLocaleString('ru-RU')} ₽`; const fmt=v=>Math.round(v).toLocaleString('ru-RU');
const clamp=(v,min,max)=>Math.min(max,Math.max(min,Number(v)||0));
function rateFor(m,rates){const mmm=Number(m)||0; if(!rates)return 0; const hit=rates.find(([a,b])=>mmm>=a&&mmm<b); return hit?hit[2]:mmm>=rates[rates.length-1][1]?rates[rates.length-1][2]:rates[0][2]}
function progressive(a,b,rates){const from=Math.min(clamp(a,0,9500),clamp(b,0,9500)),to=Math.max(clamp(a,0,9500),clamp(b,0,9500));return rates.reduce((sum,[lo,hi,rate])=>sum+Math.max(0,Math.min(to,hi)-Math.max(from,lo))/100*rate,0)}
function addonDefinitions(service){const defs=[
 ['doubles','Двойной жетон победы',service==='party'?'до 5620: +50% · от 5620: +30%':'от 5620: +30%',m=>service==='party'?true:m>=5620],
 ['core','Игра на кор роли','от 5620 MMR: +100%',m=>m>=5620],
 ['smurfpool','Смурфпулл','от 3500 MMR: +15%',m=>m>=3500],
 ['smurfAccount','Смурфпулл аккаунт','от 3500 MMR: +15%',m=>m>=3500],
 ['lowOrder','Низкая порядность','ниже 9000 порядности: +20%',()=>true],
 ['lowCourtesy','Низкая вежливость','6000–7999: +10% · ниже 6000: +20%',()=>true]
 ]; return defs}

function numberField(id,label,value,min,max,step,help){const inputmode=Number(step)%1===0?'numeric':'decimal';return `<div class="field"><label for="${id}">${label}</label><div class="number-control"><button type="button" class="number-step" data-for="${id}" data-step="-${step}" aria-label="Уменьшить ${label}">−</button><input id="${id}" class="number-input" type="text" inputmode="${inputmode}" pattern="[0-9]*" autocomplete="off" value="${String(value).replace('.',',')}" data-min="${min}" data-max="${max}" data-step="${step}" aria-label="${label}"><button type="button" class="number-step" data-for="${id}" data-step="${step}" aria-label="Увеличить ${label}">+</button></div><small>${help}</small></div>`}
function parseFieldValue(value){const raw=String(value??'').replace(',', '.').replace(/[^0-9.]/g,'');const n=Number(raw);return Number.isFinite(n)?n:0}
function refreshOptionEligibility(){const mmr=state.service==='solo'?Math.max(Number(state.values.current)||0,Number(state.values.target)||0):Number(state.values.mmr)||0;document.querySelectorAll('[data-addon]').forEach(input=>{const service=state.service;const def=addonDefinitions(service).find(x=>x[0]===input.dataset.addon);if(!def)return;const eligible=def[3](mmr);input.disabled=!eligible;if(!eligible){input.checked=false;state.addons[input.dataset.addon]=false;}const card=input.closest('.option');card?.classList.toggle('disabled-option',!eligible);const badge=card?.querySelector('.hint-badge');if(!eligible&&!badge){const title=card?.querySelector('.option-title');if(title)title.insertAdjacentHTML('beforeend','<span class="hint-badge">Недоступно</span>')}else if(eligible&&badge){badge.remove();}input.setAttribute('aria-checked',String(input.checked));});}
function renderOptions(service,mmrValue){return addonDefinitions(service).map(([id,title,desc,eligible])=>{const enabled=eligible(Number(mmrValue)||0); const checked=!!state.addons[id]&&enabled; return `<label class="option ${enabled?'':'disabled-option'}"><span class="option-copy"><span class="option-title">${title}${enabled?'':'<span class="hint-badge">Недоступно</span>'}</span><span class="option-desc">${desc}</span></span><span class="switch"><input type="checkbox" data-addon="${id}" role="switch" ${checked?'checked':''} ${enabled?'':'disabled'} aria-label="${title}" aria-checked="${checked}"><span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span></span></label>`}).join('')}
function renderFields(){
 const s=state.service;
 $('#serviceTitle').textContent=SERVICES[s].title;
 $('#chipPrice').textContent=SERVICES[s].unit;
 if(s==='solo'){
  $('#formArea').innerHTML=`<div class="form-grid">
   ${numberField('current','Текущий MMR',state.values.current,0,9500,100,'Точка старта буста')}
   ${numberField('target','Желаемый MMR',state.values.target,1,9500,100,'Конечный MMR')}
   <div class="field"><div class="metric-row"><div class="metric"><span>Прибавка</span><strong id="metricMmr">—</strong></div><div class="metric"><span>Диапазоны</span><strong id="metricBands">—</strong></div></div></div>
   <div class="field-help full">Цена ММР буста считается прогрессивно: каждый участок пути оплачивается по своей ставке.</div>
   <div class="field full option-section"><div class="section-line"><strong>Дополнительные условия</strong><span>Включайте только нужные</span></div><div class="options">${renderOptions('solo',Math.max(state.values.current,state.values.target))}</div></div>
   ${numberField('order','Порядность аккаунта',state.values.order,0,12000,100,'ниже 9000 → +20%')}
   ${numberField('courtesy','Вежливость аккаунта',state.values.courtesy,0,12000,100,'ниже 6000 → +20% · 6000–7999 → +10%')}
  </div>`;
 } else if(s==='party'||s==='calibration'){
  const label=s==='party'?'MMR клиента':'MMR аккаунта';
  $('#formArea').innerHTML=`<div class="form-grid">
   ${numberField('mmr',label,state.values.mmr,0,9500,100,'По этому MMR выбирается ставка')}
   ${numberField('wins','Количество вин',state.values.wins,1,1000,1,`${s==='party'?'Победы вместе с клиентом':'Победы при калибровке'}`)}
   <div class="field full option-section"><div class="section-line"><strong>Дополнительные условия</strong><span>Наценка считается от всей суммы</span></div><div class="options">${renderOptions(s,state.values.mmr)}</div></div>
   ${numberField('order','Порядность аккаунта',state.values.order,0,12000,100,'ниже 9000 → +20%')}
   ${numberField('courtesy','Вежливость аккаунта',state.values.courtesy,0,12000,100,'ниже 6000 → +20% · 6000–7999 → +10%')}
  </div>`;
 } else if(s==='coaching'){
  $('#formArea').innerHTML=`<div class="form-grid">
   ${numberField('mmr','MMR клиента',state.values.mmr,0,12000,100,'0–5629: 330 ₽ · 5630–6999: 500 ₽ · 7000+: 700 ₽')}
   ${numberField('hours','Количество часов',state.values.hours,0.5,100,0.5,'Можно указывать половину часа')}
  </div>`;
 } else {
  $('#formArea').innerHTML=`<div class="form-grid"><div class="field full"><label for="tier">Тир боевого кубка</label><select id="tier"><option value="3">3 тир — 200 ₽</option><option value="4">4 тир — 250 ₽</option><option value="5">5 тир — 300 ₽</option><option value="6">6 тир — 400 ₽</option><option value="7">7 тир — 500 ₽</option><option value="8">8 тир — 1 000 ₽</option></select><small>Услуга с передачей аккаунта</small></div></div>`;
  $('#tier').value=state.values.tier;
 }
 bindFields(); updateMetrics(); refreshOptionEligibility();
}
function bindFields(){document.querySelectorAll('#formArea input,#formArea select').forEach(el=>{el.addEventListener('input',onInput);el.addEventListener('change',onInput)});document.querySelectorAll('.number-step').forEach(btn=>btn.addEventListener('click',()=>{const input=$(`#${btn.dataset.for}`);if(!input)return;const min=Number(input.dataset.min)||0,max=Number(input.dataset.max)||9500,step=Number(input.dataset.step)||1,current=parseFieldValue(input.value);const next=Math.min(max,Math.max(min,current+Number(btn.dataset.step)));input.value=String(Number(next.toFixed(2))).replace('.',',');input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();}))}
function onInput(e){const el=e.target;if(el.dataset.addon){state.addons[el.dataset.addon]=el.checked;el.setAttribute('aria-checked',String(el.checked));}else if(el.id in state.values){const raw=String(el.value).replace(',', '.');const cleaned=raw.replace(/[^0-9.]/g,'');if(el.value!==cleaned.replace('.',','))el.value=cleaned.replace('.',',');state.values[el.id]=parseFieldValue(el.value);if(el.dataset.min)state.values[el.id]=Math.max(Number(el.dataset.min),state.values[el.id]);if(el.dataset.max)state.values[el.id]=Math.min(Number(el.dataset.max),state.values[el.id]);}refreshOptionEligibility();calculate()}
function updateMetrics(){if(state.service==='solo'){const add=Math.abs(Number(state.values.target)-Number(state.values.current));const bands=SOLO_RATES.filter(([a,b])=>Math.min(Number(state.values.current),Number(state.values.target))<b&&Math.max(Number(state.values.current),Number(state.values.target))>a).length;$('#metricMmr').textContent=`+${fmt(add)} MMR`;$('#metricBands').textContent=String(bands)}}
function coachingRate(m){return m>=7000?700:m>=5630?500:330} function battleRate(t){return({3:200,4:250,5:300,6:400,7:500,8:1000})[t]||0}
function calculate(){const s=state.service;let total=0,base=0,pct=0,rows=[],route='';
 if(s==='solo'){const a=clamp(state.values.current,0,9500),b=clamp(state.values.target,0,9500);base=progressive(a,b,SOLO_RATES);pct=D2Pricing.standardAddonPercent(Math.max(a,b),{...state.addons,lowOrder:state.addons.lowOrder,lowCourtesy:state.addons.lowCourtesy});if(state.addons.lowOrder&&state.values.order>=9000)pct-=.20;if(state.addons.lowCourtesy){pct-=state.values.courtesy<6000?.20:state.values.courtesy<8000?.10:0} total=base+base*pct;route=`${fmt(a)} → ${fmt(b)} MMR`;rows=[['Базовая стоимость',money(base)],['MMR к бусту',`+${fmt(Math.abs(b-a))}`],['Доплаты',pct?`+${Math.round(pct*100)}%`:'Нет'],['Стоимость доплат',money(base*pct)]]}
 else if(s==='party'||s==='calibration'){const m=clamp(state.values.mmr,0,9500),wins=clamp(state.values.wins,0,1000),rate=rateFor(m,SERVICES[s].rates);base=rate*wins;pct=s==='party'?D2Pricing.partyAddonPercent(m,state.addons):D2Pricing.standardAddonPercent(m,state.addons);if(state.addons.lowOrder&&state.values.order>=9000)pct-=.20;if(state.addons.lowCourtesy)pct-=state.values.courtesy<6000?.20:state.values.courtesy<8000?.10:0;total=base+base*pct;route=`${fmt(m)} MMR · ${fmt(wins)} побед`;rows=[['Ставка',`${money(rate)} / вин`],['Победы',fmt(wins)],['Доплаты',pct?`+${Math.round(pct*100)}%`:'Нет'],['Стоимость доплат',money(base*pct)]]}
 else if(s==='coaching'){const m=clamp(state.values.mmr,0,12000),h=Math.max(.5,Number(state.values.hours)||0);const rate=coachingRate(m);base=rate*h;total=base;route=`${fmt(m)} MMR · ${h.toLocaleString('ru-RU')} ч`;rows=[['Ставка',`${money(rate)} / час`],['Часы',h.toLocaleString('ru-RU')],['Формула',`${money(rate)} × ${h}`]]}
 else{const tier=Number(state.values.tier)||3;base=battleRate(tier);total=base;route=`${tier} тир · передача аккаунта`;rows=[['Тир',`${tier} тир`],['Цена',money(base)],['Передача аккаунта','Да']]}
 $('#chipPrice').textContent=s==='solo'?`${money(rateFor(Math.max(state.values.current,state.values.target),SOLO_RATES))} / 100 MMR`:s==='coaching'?`${money(coachingRate(state.values.mmr))} / час`:s==='battlecup'?`${money(base)} / заказ`:money(rateFor(state.values.mmr,SERVICES[s].rates))+' / вин'; $('#routeLine').textContent=route;$('#totalPrice').textContent=money(total);$('#resultNote').textContent=base>0?'Расчёт обновляется автоматически.':'Укажите корректные параметры.';$('#summary').innerHTML=rows.map((r,i)=>`<div class="summary-row ${i===rows.length-1?'accent':''}"><span>${r[0]}</span><strong>${r[1]}</strong></div>`).join('');updateTable()}
function updateTable(){const s=state.service;$('#tableTitle').textContent=s==='solo'?'Ставки ММР буста':`Прайс — ${SERVICES[s].title}`;const head=$('#priceTableHead'),body=$('#priceTableBody');if(['solo','party','calibration'].includes(s)){const rates=SERVICES[s].rates;head.innerHTML='<th>Диапазон MMR</th><th>Ставка</th>';body.innerHTML=rates.map(([a,b,r])=>`<tr><td>${fmt(a)}–${fmt(b)}</td><td>${money(r)} / ${s==='solo'?'100 MMR':'вин'}</td></tr>`).join('');$('#tableHint').textContent=s==='solo'?'₽ / 100 MMR':'₽ / вин';return}if(s==='coaching'){head.innerHTML='<th>MMR</th><th>Ставка</th>';body.innerHTML='<tr><td>0–5629</td><td>330 ₽ / час</td></tr><tr><td>5630–6999</td><td>500 ₽ / час</td></tr><tr><td>7000+</td><td>700 ₽ / час</td></tr>';$('#tableHint').textContent='₽ / час';return}head.innerHTML='<th>Тир</th><th>Цена</th><th>Формат</th>';body.innerHTML=[[3,200],[4,250],[5,300],[6,400],[7,500],[8,1000]].map(x=>`<tr><td>${x[0]} тир</td><td>${money(x[1])}</td><td>С передачей</td></tr>`).join('');$('#tableHint').textContent='₽ / заказ'}
function switchService(s){state.service=s;document.querySelectorAll('.service-tab').forEach(b=>b.classList.toggle('active',b.dataset.service===s));renderFields();calculate();window.scrollTo({top:document.querySelector('.service-nav').offsetTop-12,behavior:'smooth'})}
function reset(){state.service='solo';state.values={...DEFAULT};state.addons={};switchService('solo')}
function buildOrderText(){const addons=[];document.querySelectorAll('[data-addon]:checked').forEach(i=>addons.push(i.getAttribute('aria-label')));return [`Dota Boost Calculator`, `Услуга: ${SERVICES[state.service].title}`,$('#routeLine').textContent,...addons.length?[`Доплаты: ${addons.join(', ')}`]:[],`Итого: ${$('#totalPrice').textContent}`].flat().join('\n')}
function orderTelegram(){const text=encodeURIComponent(buildOrderText());window.open(`https://t.me/share/url?url=${encodeURIComponent(location.href)}&text=${text}`,'_blank','noopener')}
async function copyCalc(){try{await navigator.clipboard.writeText(buildOrderText());$('#copyStatus').textContent='Расчёт скопирован';setTimeout(()=>$('#copyStatus').textContent='',1800)}catch{$('#copyStatus').textContent='Не удалось скопировать'}}
document.querySelectorAll('.service-tab').forEach(b=>b.addEventListener('click',()=>switchService(b.dataset.service)));$('#resetBtn').addEventListener('click',reset);$('#copyBtn').addEventListener('click',copyCalc);$('#orderBtn').addEventListener('click',orderTelegram);renderFields();calculate();
