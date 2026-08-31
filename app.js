const SOLO_RATES = [
  [0, 2000, 125], [2000, 3000, 150], [3000, 3500, 185], [3500, 4000, 250],
  [4000, 4500, 300], [4500, 5000, 330], [5000, 5620, 400], [5620, 6000, 700],
  [6000, 6500, 900], [6500, 7000, 1200], [7000, 7500, 1500], [7500, 8000, 2000],
  [8000, 8500, 3000], [8500, 9000, 6000], [9000, 9500, 10000]
];
const PARTY_RATES = [
  [0, 2000, 70], [2000, 3000, 80], [3000, 4000, 90], [4000, 4500, 110], [4500, 5000, 150],
  [5000, 5620, 180], [5620, 6000, 250], [6000, 6500, 400], [6500, 7000, 750], [7000, 7500, 1000],
  [7500, 8000, 2000], [8000, 8500, 3000], [8500, 9000, 4000], [9000, 9500, 5000]
];
const CALIBRATION_RATES = [
  [0, 2000, 55], [2000, 3000, 65], [3000, 4000, 75], [4000, 4500, 90], [4500, 5000, 100],
  [5000, 5620, 135], [5620, 6000, 250], [6000, 6500, 300], [6500, 7000, 450], [7000, 7500, 600],
  [7500, 8000, 1000], [8000, 8500, 2000], [8500, 9000, 3500], [9000, 9500, 5000]
];
const SERVICES = {
  solo: { title: 'ММР буст', rates: SOLO_RATES, unit: '₽ / 100 MMR' },
  party: { title: 'Пати буст', rates: PARTY_RATES, unit: '₽ / вин' },
  calibration: { title: 'Калибровка', rates: CALIBRATION_RATES, unit: '₽ / вин' },
  coaching: { title: 'Коучинг', rates: null, unit: '₽ / час' },
  battlecup: { title: 'Боевой кубок', rates: null, unit: '₽ / заказ' }
};

const state = {
  service: 'solo',
  values: { current: 1000, target: 3000, mmr: 3000, wins: 10, hours: 1, tier: 3 },
  addons: {}
};

const $ = (sel) => document.querySelector(sel);
const money = (value) => `${Math.round(value).toLocaleString('ru-RU')} ₽`;
const mmr = (value) => `${Math.round(value).toLocaleString('ru-RU')} MMR`;

function rateFor(mmrValue, rates) {
  const m = Number(mmrValue);
  if (!rates) return 0;
  for (const [from, to, rate] of rates) {
    if (m >= from && m < to) return rate;
  }
  return m >= rates[rates.length - 1][1] ? rates[rates.length - 1][2] : rates[0][2];
}

function progressivePrice(from, to, rates) {
  let a = Math.min(Number(from) || 0, Number(to) || 0);
  let b = Math.max(Number(from) || 0, Number(to) || 0);
  if (b <= a) return 0;
  let total = 0;
  for (const [low, high, rate] of rates) {
    const start = Math.max(a, low);
    const end = Math.min(b, high);
    if (end > start) total += ((end - start) / 100) * rate;
  }
  return total;
}

function optionList(items) {
  return items.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
}

function renderForm() {
  const s = state.service;
  $('#serviceTitle').textContent = SERVICES[s].title;
  $('#chipPrice').textContent = SERVICES[s].unit;
  $('#formArea').innerHTML = '';

  if (s === 'solo') {
    $('#formArea').innerHTML = `
      <div class="form-grid">
        <div class="field">
          <label for="current">Текущий MMR</label>
          <input id="current" type="number" min="0" max="9500" step="1" value="${state.values.current}">
          <small>Откуда начинается буст</small>
        </div>
        <div class="field">
          <label for="target">Желаемый MMR</label>
          <input id="target" type="number" min="1" max="9500" step="1" value="${state.values.target}">
          <small>Конечный MMR</small>
        </div>
        <div class="field full">
          <label>Опции</label>
          <div class="checks">
            ${s === 'party'
              ? check('doubles', 'Двойной жетон победы', 'до 5620: +50% · выше 5620: +30%', state.addons.doubles)
              : check('doubles', 'Двойной жетон победы', 'выше 5620: +30% к фиксу', state.addons.doubles)}
            ${check('core', 'Кор роль после 5620', '+30% к фиксу', state.addons.core)}
            ${check('smurfpool', 'Смурфпулл', 'от 3500 MMR: +15% к фиксу', state.addons.smurfpool)}
            ${check('low_0_4', 'Низкая порядочность 0–4k', 'поряда < 6k: +15% к фиксу', state.addons.low_0_4)}
            ${check('low_4_6', 'Низкая порядочность 4–6k', 'поряда < 8k: +15% к фиксу', state.addons.low_4_6)}
            ${check('low_6_plus', 'Низкая порядочность 6k+', 'поряда < 9k: +15% к фиксу', state.addons.low_6_plus)}
            ${check('smurf_account', 'Смурфпулл аккаунт', 'от 3500 MMR: +15% к фиксу', state.addons.smurf_account)}
          </div>
        </div>
      </div>`;
  }

  if (s === 'party' || s === 'calibration') {
    const label = s === 'party' ? 'MMR клиента' : 'MMR аккаунта';
    const max = 9500;
    $('#formArea').innerHTML = `
      <div class="form-grid">
        <div class="field">
          <label for="mmr">${label}</label>
          <input id="mmr" type="number" min="0" max="${max}" step="1" value="${state.values.mmr}">
          <small>По этому MMR выбирается ставка</small>
        </div>
        <div class="field">
          <label for="wins">Количество вин</label>
          <input id="wins" type="number" min="1" max="1000" step="1" value="${state.values.wins}">
          <small>${s === 'calibration' ? 'Цена за одну победу' : 'Цена за одну победу с клиентом'}</small>
        </div>
        <div class="field full">
          <label>Опции</label>
          <div class="checks">
            ${s === 'party'
              ? check('doubles', 'Двойной жетон победы', 'до 5620: +50% · выше 5620: +30%', state.addons.doubles)
              : check('doubles', 'Двойной жетон победы', 'выше 5620: +30% к фиксу', state.addons.doubles)}
            ${check('core', 'Кор роль после 5620', '+30% к фиксу', state.addons.core)}
            ${check('smurfpool', 'Смурфпулл', 'от 3500 MMR: +15% к фиксу', state.addons.smurfpool)}
            ${check('low_0_4', 'Низкая порядочность 0–4k', 'поряда < 6k: +15% к фиксу', state.addons.low_0_4)}
            ${check('low_4_6', 'Низкая порядочность 4–6k', 'поряда < 8k: +15% к фиксу', state.addons.low_4_6)}
            ${check('low_6_plus', 'Низкая порядочность 6k+', 'поряда < 9k: +15% к фиксу', state.addons.low_6_plus)}
            ${check('smurf_account', 'Смурфпулл аккаунт', 'от 3500 MMR: +15% к фиксу', state.addons.smurf_account)}
          </div>
        </div>
      </div>`;
  }

  if (s === 'coaching') {
    $('#formArea').innerHTML = `
      <div class="form-grid">
        <div class="field">
          <label for="mmr">MMR клиента</label>
          <input id="mmr" type="number" min="0" max="12000" step="1" value="${state.values.mmr}">
          <small>Ставка зависит от MMR</small>
        </div>
        <div class="field">
          <label for="hours">Количество часов</label>
          <input id="hours" type="number" min="0.5" max="100" step="0.5" value="${state.values.hours}">
          <small>Можно указать половину часа</small>
        </div>
      </div>`;
  }

  if (s === 'battlecup') {
    $('#formArea').innerHTML = `
      <div class="form-grid">
        <div class="field full">
          <label for="tier">Тир боевого кубка</label>
          <select id="tier">${optionList([[3,'3 тир — 200 ₽'],[4,'4 тир — 250 ₽'],[5,'5 тир — 300 ₽'],[6,'6 тир — 400 ₽'],[7,'7 тир — 500 ₽'],[8,'8 тир — 1 000 ₽']])}</select>
        </div>
      </div>`;
    $('#tier').value = state.values.tier;
  }

  bindFormEvents();
}

function check(id, title, desc, checked) {
  return `<label class="check"><span class="check-copy"><strong>${title}</strong><em>${desc}</em></span><span class="switch"><input type="checkbox" data-addon="${id}" ${checked ? 'checked' : ''}><span class="switch-track"><span class="switch-thumb"></span></span></span></label>`;
}

function bindFormEvents() {
  document.querySelectorAll('#formArea input, #formArea select').forEach(el => {
    el.addEventListener('input', handleInput);
    el.addEventListener('change', handleInput);
  });
}

function handleInput(e) {
  const el = e.target;
  if (el.dataset.addon) state.addons[el.dataset.addon] = el.checked;
  if (el.id in state.values) state.values[el.id] = Number(el.value);
  calculate();
}

function activeAddonPercent() {
  return Object.values(state.addons).filter(Boolean).reduce((sum, yes) => sum + (yes ? 0.15 : 0), 0);
}

function soloAddonPercent(from, to) {
  const maxMmr = Math.max(Number(from) || 0, Number(to) || 0);
  let pct = 0;
  if (maxMmr >= 5620 && state.addons.doubles) pct += 0.30;
  if (maxMmr >= 5620 && state.addons.core) pct += 0.30;
  if (maxMmr >= 3500 && state.addons.smurfpool) pct += 0.15;
  if (maxMmr >= 0 && maxMmr <= 4000 && state.addons.low_0_4) pct += 0.15;
  if (maxMmr > 4000 && maxMmr <= 6000 && state.addons.low_4_6) pct += 0.15;
  if (maxMmr > 6000 && state.addons.low_6_plus) pct += 0.15;
  if (maxMmr >= 3500 && state.addons.smurf_account) pct += 0.15;
  return pct;
}

function coachingRate(m) {
  if (m >= 7000) return 700;
  if (m >= 5630) return 500;
  return 330;
}

function battlecupRate(tier) {
  return ({3: 200, 4: 250, 5: 300, 6: 400, 7: 500, 8: 1000})[tier] || 0;
}

function calculate() {
  let total = 0;
  let rows = [];
  let note = '';
  let chip = SERVICES[state.service].unit;

  if (state.service === 'solo') {
    const from = Math.max(0, Number(state.values.current) || 0);
    const to = Math.max(0, Number(state.values.target) || 0);
    const base = progressivePrice(from, to, SOLO_RATES);
    const pct = soloAddonPercent(from, to);
    const surcharge = base * pct;
    total = base + surcharge;
    chip = `${money(rateFor(Math.max(from, to), SOLO_RATES))} / 100 MMR`;
    rows = [
      ['Маршрут', `${mmr(from)} → ${mmr(to)}`],
      ['Базовая цена', money(base)],
      ['Наценка', pct ? `+${Math.round(pct * 100)}%` : 'Нет'],
      ['Доплата', money(surcharge)]
    ];
    note = to <= from ? 'Укажите конечный MMR выше текущего.' : `Учтены ${countSoloBands(from, to)} ценовых ${plural(countSoloBands(from, to), 'диапазон', 'диапазона', 'диапазонов')}.`;
  }

  if (state.service === 'party' || state.service === 'calibration') {
    const m = Math.max(0, Number(state.values.mmr) || 0);
    const wins = Math.max(0, Number(state.values.wins) || 0);
    const rate = rateFor(m, SERVICES[state.service].rates);
    const base = rate * wins;
    const pct = state.service === 'party'
      ? D2Pricing.partyAddonPercent(m, state.addons)
      : D2Pricing.standardAddonPercent(m, state.addons);
    const surcharge = base * pct;
    total = base + surcharge;
    chip = `${money(rate)} / вин`;
    rows = [
      ['MMR клиента', mmr(m)],
      ['Ставка', `${money(rate)} / вин`],
      ['Количество вин', wins.toLocaleString('ru-RU')],
      ['Наценка', pct ? `+${Math.round(pct * 100)}%` : 'Нет'],
      ['Доплата', money(surcharge)]
    ];
    note = wins > 0 ? `Итог рассчитан по ставке для ${m.toLocaleString('ru-RU')} MMR.` : 'Укажите количество побед.';
  }

  if (state.service === 'coaching') {
    const m = Math.max(0, Number(state.values.mmr) || 0);
    const hours = Math.max(0, Number(state.values.hours) || 0);
    const rate = coachingRate(m);
    total = rate * hours;
    chip = `${money(rate)} / час`;
    rows = [
      ['MMR клиента', mmr(m)],
      ['Ставка', `${money(rate)} / час`],
      ['Количество часов', hours.toLocaleString('ru-RU')],
      ['Формула', `${money(rate)} × ${hours}`]
    ];
    note = m >= 7000 ? 'Применена ставка для 7000+ MMR.' : m >= 5630 ? 'Применена ставка для 5630+ MMR.' : 'Применена базовая ставка до 5630 MMR.';
  }

  if (state.service === 'battlecup') {
    const tier = Number(state.values.tier) || 3;
    const rate = battlecupRate(tier);
    total = rate;
    chip = `${money(rate)} / заказ`;
    rows = [
      ['Тир', `${tier} тир`],
      ['Цена', money(rate)],
      ['Передача аккаунта', 'Да']
    ];
    note = 'Стоимость боевого кубка указана за один заказ.';
  }

  $('#chipPrice').textContent = chip;
  $('#totalPrice').textContent = money(total);
  $('#resultNote').textContent = note;
  $('#summary').innerHTML = rows.map(([a,b], i) => `<div class="summary-row ${i === rows.length - 1 ? 'accent' : ''}"><span>${a}</span><strong>${b}</strong></div>`).join('');
  updateTable();
}

function countSoloBands(from, to) {
  return SOLO_RATES.filter(([low, high]) => Math.min(to, high) > Math.max(from, low)).length;
}

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

function updateTable() {
  const s = state.service;
  const head = $('#priceTableHead');
  const body = $('#priceTableBody');
  $('#tableTitle').textContent = SERVICES[s].title === 'ММР буст' ? 'Ставки ММР буста' : `Прайс — ${SERVICES[s].title}`;
  const hint = document.querySelector('.table-hint');

  if (s === 'solo') {
    head.innerHTML = '<th>Диапазон MMR</th><th>Ставка</th>';
    body.innerHTML = SOLO_RATES.map(([a,b,r]) => `<tr><td>${a.toLocaleString('ru-RU')}–${b.toLocaleString('ru-RU')}</td><td>${money(r)} / 100 MMR</td></tr>`).join('');
    hint.textContent = '₽ / 100 MMR';
    return;
  }
  if (s === 'party' || s === 'calibration') {
    const rates = SERVICES[s].rates;
    head.innerHTML = '<th>Диапазон MMR</th><th>Ставка</th>';
    body.innerHTML = rates.map(([a,b,r]) => `<tr><td>${a.toLocaleString('ru-RU')}–${b.toLocaleString('ru-RU')}</td><td>${money(r)} / вин</td></tr>`).join('');
    hint.textContent = '₽ / вин';
    return;
  }
  if (s === 'coaching') {
    head.innerHTML = '<th>MMR</th><th>Ставка</th>';
    body.innerHTML = '<tr><td>0–5629</td><td>330 ₽ / час</td></tr><tr><td>5630–6999</td><td>500 ₽ / час</td></tr><tr><td>7000+</td><td>700 ₽ / час</td></tr>';
    hint.textContent = '₽ / час';
    return;
  }
  head.innerHTML = '<th>Тир</th><th>Цена</th><th>Услуга</th>';
  body.innerHTML = [[3,200],[4,250],[5,300],[6,400],[7,500],[8,1000]].map(([t,r]) => `<tr><td>${t} тир</td><td>${money(r)}</td><td>С передачей аккаунта</td></tr>`).join('');
  hint.textContent = '₽ / заказ';
}

function bindTabs() {
  document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.service = btn.dataset.service;
    $('#copyStatus').textContent = '';
    renderForm();
    calculate();
  }));
}

function reset() {
  state.service = 'solo';
  state.values = { current: 1000, target: 3000, mmr: 3000, wins: 10, hours: 1, tier: 3 };
  state.addons = {};
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.service === 'solo'));
  renderForm();
  calculate();
}

async function copyCalculation() {
  const text = `Dota 2 — ${SERVICES[state.service].title}\n${$('#summary').innerText}\nИтого: ${$('#totalPrice').innerText}`;
  try {
    await navigator.clipboard.writeText(text);
    $('#copyStatus').textContent = 'Расчёт скопирован.';
  } catch {
    $('#copyStatus').textContent = 'Не удалось скопировать — выделите текст вручную.';
  }
}

$('#resetBtn').addEventListener('click', reset);
$('#copyBtn').addEventListener('click', copyCalculation);
bindTabs();
renderForm();
calculate();
