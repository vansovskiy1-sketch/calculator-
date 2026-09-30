(function (global) {
  const SOLO_RATES = [[0,2000,125],[2000,3000,150],[3000,3500,185],[3500,4000,250],[4000,4500,300],[4500,5000,330],[5000,5620,400],[5620,6000,700],[6000,6500,900],[6500,7000,1200],[7000,7500,1500],[7500,8000,2000],[8000,8500,3000],[8500,9000,6000],[9000,9500,10000]];
  const PARTY_RATES = [[0,2000,70],[2000,3000,80],[3000,4000,90],[4000,4500,110],[4500,5000,150],[5000,5620,180],[5620,6000,250],[6000,6500,400],[6500,7000,750],[7000,7500,1000],[7500,8000,2000],[8000,8500,3000],[8500,9000,4000],[9000,9500,5000]];
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



  function progressiveBreakdown(start, target, rates) {
    const a = Math.max(0, Math.min(9500, Number(start) || 0));
    const b = Math.max(0, Math.min(9500, Number(target) || 0));
    const from = Math.min(a, b);
    const to = Math.max(a, b);
    return rates
      .map(([lo, hi, rate]) => {
        const segmentFrom = Math.max(from, lo);
        const segmentTo = Math.min(to, hi);
        const mmr = Math.max(0, segmentTo - segmentFrom);
        return { from: segmentFrom, to: segmentTo, mmr, rate, cost: mmr / 100 * rate };
      })
      .filter(segment => segment.mmr > 0);
  }

  function bandCount(start, target, rates) {
    return progressiveBreakdown(start, target, rates).length;
  }

  function partyRateFor(mmr) {
    const n = Number(mmr) || 0;
    const hit = PARTY_RATES.find(([a, b]) => n >= a && n < b);
    return hit ? hit[2] : PARTY_RATES[PARTY_RATES.length - 1][2];
  }

  function partyGain(mmr, doubles) {
    return (Number(mmr) < 4000 ? 40 : 25) * (doubles ? 2 : 1);
  }

  function partyBreakdown(startMmr, wins, doubles) {
    let mmr = Math.max(0, Number(startMmr) || 0);
    const totalGames = Math.max(0, Math.floor(Number(wins) || 0));
    const segments = [];
    let totalCost = 0;
    for (let game = 0; game < totalGames; game += 1) {
      const gain = partyGain(mmr, doubles);
      const rate = partyRateFor(mmr);
      const next = mmr + gain;
      const key = `${rate}|${mmr < 4000 ? 'low' : 'high'}`;
      const last = segments[segments.length - 1];
      if (last && last.key === key) {
        last.to = next;
        last.gain += gain;
        last.games += 1;
        last.cost += rate;
      } else {
        segments.push({ key, from: mmr, to: next, gain, games: 1, rate, cost: rate });
      }
      totalCost += rate;
      mmr = next;
    }
    return {
      startMmr: Math.max(0, Number(startMmr) || 0),
      endMmr: mmr,
      totalGames,
      totalCost,
      segments: segments.map(({key, ...segment}) => segment)
    };
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
    addonBreakdown,
    progressiveBreakdown,
    bandCount,
    SOLO_RATES,
    PARTY_RATES,
    partyBreakdown,
    partyGain
  };
})(window);
