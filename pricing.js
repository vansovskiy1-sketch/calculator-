(function attachPricing(global) {
  function standardAddonPercent(mmrValue, addons) {
    const m = Number(mmrValue) || 0;
    const selected = addons || {};
    let pct = 0;
    if (m >= 5620 && selected.doubles) pct += 0.30;
    if (m >= 5620 && selected.core) pct += 0.30;
    if (m >= 3500 && selected.smurfpool) pct += 0.15;
    if (m <= 4000 && selected.low_0_4) pct += 0.15;
    if (m > 4000 && m <= 6000 && selected.low_4_6) pct += 0.15;
    if (m > 6000 && selected.low_6_plus) pct += 0.15;
    if (m >= 3500 && selected.smurf_account) pct += 0.15;
    return pct;
  }

  function partyAddonPercent(mmrValue, addons) {
    const m = Number(mmrValue) || 0;
    const selected = addons || {};
    return standardAddonPercent(m, selected) + (m < 5620 && selected.doubles_before_5620 ? 0.50 : 0);
  }

  global.D2Pricing = { standardAddonPercent, partyAddonPercent };
})(window);
