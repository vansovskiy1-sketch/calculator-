(function (global) {
  function addonPercent(mmrValue, addons, mode) {
    const m = Number(mmrValue) || 0;
    const a = addons || {};
    let pct = 0;

    if (a.doubles && mode === 'party' && m < 5620) pct += 0.50;
    else if (a.doubles && m >= 5620) pct += 0.30;

    if (a.core && m >= 5620) pct += 1.00;
    if (a.smurfpool && m >= 3500) pct += 0.15;
    if (a.smurfAccount && m >= 3500) pct += 0.15;
    if (a.lowOrder && m < 9000) pct += 0.20;
    if (a.lowCourtesy && m < 8000) pct += m < 6000 ? 0.20 : 0.10;

    return pct;
  }

  global.D2Pricing = {
    standardAddonPercent: (mmr, addons) => addonPercent(mmr, addons, 'standard'),
    partyAddonPercent: (mmr, addons) => addonPercent(mmr, addons, 'party')
  };
})(window);
