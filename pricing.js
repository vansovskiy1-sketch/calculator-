(function (global) {
  const ADDON_RULES = {
    doubles: { partyBefore5620: 0.50, after5620: 0.30 },
    core: { always: true, percent: 1.00 },
    smurfpool: { minMmr: 3500, percent: 0.15 },
    lowOrder: { maxOrder: 9000, percent: 0.20 },
    lowCourtesy: { maxNoAddon: 8000, mid: 6000, midPercent: 0.10, lowPercent: 0.20 }
  };

  function isAddonEligible(service, addonId, mmrValue) {
    const mmr = Number(mmrValue) || 0;
    switch (addonId) {
      case 'doubles': return service === 'party' || mmr >= 5620;
      case 'core': return true;
      case 'smurfpool': return mmr >= 3500;
      default: return false;
    }
  }

  function addonPercent(mmrValue, addons, service, order, courtesy) {
    const mmr = Number(mmrValue) || 0;
    const a = addons || {};
    let pct = 0;
    if (a.doubles && isAddonEligible(service, 'doubles', mmr)) pct += service === 'party' && mmr < 5620 ? 0.50 : 0.30;
    if (a.core) pct += 1.00;
    if (a.smurfpool && mmr >= 3500) pct += 0.15;
    if (Number(order) < 9000) pct += 0.20;
    const c = Number(courtesy) || 0;
    if (c < 6000) pct += 0.20;
    else if (c < 8000) pct += 0.10;
    return pct;
  }

  function addonBreakdown(mmrValue, addons, service, order, courtesy) {
    const mmr = Number(mmrValue) || 0;
    const a = addons || {};
    const rows = [];
    if (a.doubles && isAddonEligible(service, 'doubles', mmr)) rows.push({ id:'doubles', label:'Двойной жетон победы', percent: service === 'party' && mmr < 5620 ? 0.50 : 0.30 });
    if (a.core) rows.push({ id:'core', label:'Игра на кор роли', percent:1.00 });
    if (a.smurfpool && mmr >= 3500) rows.push({ id:'smurfpool', label:'Смурфпулл', percent:0.15 });
    if (Number(order) < 9000) rows.push({ id:'order', label:'Порядочность', percent:0.20 });
    const c = Number(courtesy) || 0;
    const cp = c < 6000 ? 0.20 : c < 8000 ? 0.10 : 0;
    if (cp) rows.push({ id:'courtesy', label:'Вежливость', percent:cp });
    return rows;
  }

  global.D2Pricing = {
    isAddonEligible,
    addonPercent: (mmr, addons, service, order, courtesy) => addonPercent(mmr, addons, service, order, courtesy),
    standardAddonPercent: (mmr, addons, order, courtesy) => addonPercent(mmr, addons, 'standard', order, courtesy),
    partyAddonPercent: (mmr, addons, order, courtesy) => addonPercent(mmr, addons, 'party', order, courtesy),
    addonBreakdown
  };
})(window);
