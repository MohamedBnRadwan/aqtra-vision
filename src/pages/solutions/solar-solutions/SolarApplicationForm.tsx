import React, { useEffect, useState } from 'react';
import HeaderBanner from '@/components/HeaderBanner';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faBank, faTractor, faIndustry, faHome, faSolarPanel, faSave, faHospital, faSlash, faHandHolding, faHandHoldingUsd, faRulerCombined, faDollarSign, faTachometerAlt, faMoneyBill, faCarBattery, faExclamationTriangle, faSun, faTrash } from '@fortawesome/free-solid-svg-icons';
import {
  computeSolarEstimate,
  PANEL_PRICING,
  effectivePriceForMonthlyKwh,
  monthlyKwhFromBill,
  tariffForPrimaryUse,
  type PanelTierKey,
  type IndustryConnection,
  type IndustryFuelCompBand,
  type SolarEstimateResult,
} from '@/lib/saudiElectricityTariffs';

import './SolarApplicationForm.css';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const SolarApplicationForm: React.FC = () => {
  const [monthlyKWh, setMonthlyKWh] = useState<number | ''>('');
  const [monthlyBill, setMonthlyBill] = useState<number | ''>('');
  const [availableArea, setAvailableArea] = useState<number | ''>('');
  const [hasGrid, setHasGrid] = useState<boolean>(true);
  const [wantBackup, setWantBackup] = useState<boolean>(false);
  const [hugeBill, setHugeBill] = useState<boolean>(false);
  const [primaryUse, setPrimaryUse] = useState<string>('home');
  const [industryConnection, setIndustryConnection] = useState<IndustryConnection>('grid');
  const [industryFuelCompBand, setIndustryFuelCompBand] = useState<IndustryFuelCompBand>('standard');
  const [panelTier, setPanelTier] = useState<PanelTierKey>('standard');
  const [result, setResult] = useState<React.ReactNode>(null);
  const [peakSunHours, setPeakSunHours] = useState<number>(5); // Default to 5
  const [history, setHistory] = useState<SolarCalcHistoryEntry[]>([]);
  const [powerSupplyType, setPowerSupplyType] = useState<'grid' | 'generator' | 'mixed' | 'none'>('grid');
  const [generatorCostPerKwh, setGeneratorCostPerKwh] = useState<number>(0.8);
  const [generatorShare, setGeneratorShare] = useState<number>(50); // % of energy from generator when mixed
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [syncConsumption, setSyncConsumption] = useState<boolean>(false);
  const [syncBill, setSyncBill] = useState<boolean>(false);
  const [syncArea, setSyncArea] = useState<boolean>(false);

  function round(val: number, decimals = 1) {
    const m = Math.pow(10, decimals);
    return Math.round(val * m) / m;
  }

  function formatNumber(value: number, decimals = 0) {
    if (!Number.isFinite(value)) return 'N/A';
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function estimateBillFromKwh(kwh: number, use: string, options: { connection: IndustryConnection; fuelCompBand: IndustryFuelCompBand }): number | undefined {
    if (!Number.isFinite(kwh) || kwh <= 0) return undefined;
    const effective = effectivePriceForMonthlyKwh(kwh, use, options);
    if (effective === undefined) return undefined;
    return round(kwh * effective, 2);
  }

  function validateInputs(input: {
    monthlyKWh?: number;
    monthlyBill?: number;
  }): string | null {
    if (typeof input.monthlyKWh === 'number' && typeof input.monthlyBill === 'number' && input.monthlyKWh > 0 && input.monthlyBill > 0) {
      const impliedRate = input.monthlyBill / input.monthlyKWh;
      if (impliedRate < 0.05) {
        return 'Monthly bill looks too low for the entered consumption. Please verify both values.';
      }
      if (impliedRate > 2) {
        return 'Monthly bill looks too high for the entered consumption. Please verify both values.';
      }
    }

    if (typeof input.monthlyKWh === 'number' && input.monthlyKWh > 50000 && (input.monthlyBill === undefined || input.monthlyBill <= 0)) {
      return 'Consumption value is unusually high. Add a bill amount or recheck the kWh value.';
    }

    return null;
  }

  type SolarCalcHistoryEntry = {
    id: string;
    timestamp: number;
    input: {
      monthlyKWh?: number;
      monthlyBill?: number;
      availableArea?: number;
      hasGrid: boolean;
      wantBackup: boolean;
      hugeBill: boolean;
      primaryUse: string;
      industryConnection: IndustryConnection;
      industryFuelCompBand: IndustryFuelCompBand;
      panelTier: PanelTierKey;
      peakSunHours: number;
      powerSupplyType: 'grid' | 'generator' | 'mixed' | 'none';
      generatorCostPerKwh?: number;
      generatorShare?: number;
    };
    result: SolarEstimateResult;
  };

  const HISTORY_KEY = 'solarCalcHistory';

  useEffect(() => {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return;
    try {
      const parsed: SolarCalcHistoryEntry[] = JSON.parse(raw);
      setHistory(parsed);
    } catch (e) {
      console.error('Failed to parse history', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    // Keep hasGrid aligned with selected power supply
    setHasGrid(powerSupplyType === 'grid' || powerSupplyType === 'mixed');
  }, [powerSupplyType]);

  useEffect(() => {
    if (!syncBill) return;
    if (typeof monthlyKWh !== 'number' || monthlyKWh <= 0) return;
    const est = estimateBillFromKwh(monthlyKWh, primaryUse, { connection: industryConnection, fuelCompBand: industryFuelCompBand });
    if (est === undefined) return;
    if (typeof monthlyBill === 'number' && Math.abs(monthlyBill - est) < 0.5) return;
    setMonthlyBill(est);
  }, [syncBill, monthlyKWh, primaryUse, industryConnection, industryFuelCompBand]);

  useEffect(() => {
    if (!syncConsumption) return;
    if (typeof monthlyBill !== 'number' || monthlyBill <= 0) return;
    const tariff = tariffForPrimaryUse(primaryUse, { connection: industryConnection, fuelCompBand: industryFuelCompBand });
    const estKwh = monthlyKwhFromBill(monthlyBill, tariff);
    if (!Number.isFinite(estKwh)) return;
    if (typeof monthlyKWh === 'number' && Math.abs(monthlyKWh - estKwh) < 0.5) return;
    setMonthlyKWh(round(estKwh, 0));
  }, [syncConsumption, monthlyBill, primaryUse, industryConnection, industryFuelCompBand]);

  const renderResult = (calc: SolarEstimateResult, hasMonthlyBill: boolean) => {
    if (!calc.ok || !calc.data) return <span className='text-danger'>Calculation failed.</span>;
    const data = calc.data;
    const selectedPricing = data.selectedPanel;

    let recommendedType = <><FontAwesomeIcon icon={faTachometerAlt} className='text-primary me-1' /> On-Grid (Grid-Tied)</>;
    if (data.systemType === 'offGrid') recommendedType = <><FontAwesomeIcon icon={faCarBattery} className='text-primary me-1' /> Off-Grid (Standalone)</>;
    else if (data.systemType === 'hybrid') recommendedType = <><FontAwesomeIcon icon={faSolarPanel} className='text-primary me-1' /> Hybrid (With Battery Backup)</>;
    if (primaryUse === 'agricultural') recommendedType = <><FontAwesomeIcon icon={faTractor} className='text-primary me-1' /> Solar Pumping System</>;

    let typeMsg = <></>;
    if (primaryUse === 'hospital' || primaryUse === 'bank' || primaryUse === 'industry') {
      typeMsg = <><FontAwesomeIcon icon={faHandHolding} className='text-primary me-1' /> Consider commercial-grade inverters and modules for enhanced reliability.</>;
    }

    if (primaryUse === 'home') {
      typeMsg = <><FontAwesomeIcon icon={faHome} className='text-primary me-1' /> Suitable for residential energy needs.</>;
    } else if (primaryUse === 'agricultural') {
      typeMsg = <><FontAwesomeIcon icon={faTractor} className='text-primary me-1' /> Ideal for agricultural water pumping applications.</>;
    }

    const areaNeeded = data.areaNeeded;
    let areaMsg = <><FontAwesomeIcon icon={faRulerCombined} className='text-primary me-1' /> Estimated installation area needed: {formatNumber(areaNeeded, 0)} m².</>;
    let areaAlertMessage = <></>;
    if (availableArea && typeof availableArea === 'number' && (availableArea + availableArea * 0.1) < areaNeeded) {
      areaAlertMessage = <span className='rounded-pill lh-1 text-bg-danger'> <FontAwesomeIcon icon={faExclamationTriangle} className='text-warning me-1' /> Provided area ({availableArea} m²) may be insufficient — consider higher-efficiency modules or ground mounts.</span>;
    }

    return (
      <div className="row g-3">
        <div className="col-12">
          <div className="alert alert-success mb-2">
            <div className="fw-bold">Recommended system: {recommendedType}</div>
            <div>{typeMsg}</div>
            <div><FontAwesomeIcon icon={faSolarPanel} className='text-primary me-1' /> {formatNumber(data.panels, 0)} panels (~{formatNumber(round(data.systemKw, 1), 1)} kW)</div>
            <div>{areaMsg}</div>
            <div>{areaAlertMessage}</div>
            {hugeBill && (
              <div className="alert alert-warning mt-2 mb-0 py-2">
                <div className="fw-semibold">High bill focus</div>
                <ul className="mb-0 ps-3">
                  <li>⚡ Higher ROI potential — expect faster payback with your current bill level.</li>
                  <li>💡 Consider upsizing the system by ~20-30% to maximize reduction and hedge future rates.</li>
                  <li>📊 We recommend an energy audit to capture quick efficiency wins before final sizing.</li>
                  <li>💰 We can also review your tariff tier to ensure you’re on the optimal plan.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {hasMonthlyBill || hasGrid ? (
          <div className="col-md-12">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h6 className="card-title">Electricity Costs (with VAT)</h6>
                <ul className="mb-0">
                  <li>Monthly bill (before solar): {formatNumber(data.monthlyBillComputed, 2)} SAR</li>
                  <li>Effective tariff: {formatNumber(data.effectiveKwhPrice, 3)} SAR/kWh</li>
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        <div className="col-md-12">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Solar Production &amp; Savings</h6>
              <ul className="mb-0">
                <li>Estimated annual solar production: {formatNumber(data.annualProdKwh, 0)} kWh</li>
                <li>Annual savings: {formatNumber(data.annualSavingsSar, 0)} SAR</li>
                <li>Payback period: {data.paybackYears === Infinity ? 'N/A' : `${formatNumber(data.paybackYears, 2)} years`}</li>
                <li>25-year gross savings: {formatNumber(data.lifetimeGrossSavings, 0)} SAR</li>
                <li>25-year net savings (after cost): {formatNumber(data.lifetimeNetSavings, 0)} SAR</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="card-title">System Cost Estimate — {selectedPricing.label}</h6>
              <ul className="mb-0">
                <li>Cost per panel: {formatNumber(selectedPricing.costPerPanel, 0)} SAR</li>
                <li>Total panels cost: {formatNumber(data.panelsCost, 0)} SAR</li>
                <li>Base inverter + installation (est. 35%): {formatNumber(data.inverterInstallBase, 0)} SAR</li>
                <li>Package price by output (on-grid baseline): {formatNumber(data.packagePriceSar, 0)} SAR</li>
                {data.batteryCost > 0 && (
                  <li>Battery allowance (~{formatNumber(data.batteryKwhNeeded, 1)} kWh): {formatNumber(data.batteryCost, 0)} SAR</li>
                )}
                {data.inverterUpgradeAdder > 0 && (
                  <li>Hybrid/Off-grid inverter upgrade: {formatNumber(data.inverterUpgradeAdder, 0)} SAR</li>
                )}
                <li className="fw-bold text-primary">Estimated total system cost: {formatNumber(data.totalSystemCost, 0)} SAR</li>
                <li className="text-muted">(Panel parts: {formatNumber(data.panelsCost, 0)} SAR; inverter/install base: {formatNumber(data.inverterInstallBase, 0)} SAR; package baseline includes balance-of-system)</li>

              </ul>
              <small className="text-muted">Assumptions: PSH {peakSunHours} h/day, derate 80%, VAT included in electricity bill. Hybrid/Off-grid pricing includes batteries and larger inverter allowances.</small>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const buildWhatsAppMessage = (): string => {
    const nextInput = {
      monthlyKWh: typeof monthlyKWh === 'number' ? monthlyKWh : undefined,
      monthlyBill: typeof monthlyBill === 'number' ? monthlyBill : undefined,
      availableArea: typeof availableArea === 'number' ? availableArea : undefined,
      hasGrid,
      wantBackup,
      hugeBill,
      primaryUse,
      industryConnection,
      industryFuelCompBand,
      panelTier,
      peakSunHours,
      powerSupplyType,
      generatorCostPerKwh,
      generatorShare,
    };

    const calc: SolarEstimateResult = computeSolarEstimate({
      monthlyKWh: nextInput.monthlyKWh,
      monthlyBill: nextInput.monthlyBill,
      primaryUse: nextInput.primaryUse,
      industryOptions: { connection: nextInput.industryConnection, fuelCompBand: nextInput.industryFuelCompBand },
      peakSunHours: nextInput.peakSunHours,
      panelTier: nextInput.panelTier,
      hasGrid: nextInput.hasGrid,
      wantBackup: nextInput.wantBackup,
      availableArea: nextInput.availableArea,
    });

    const supplyLabel = powerSupplyType === 'grid'
      ? 'Grid only'
      : powerSupplyType === 'mixed'
        ? `Mixed (gen cost ~${formatNumber(generatorCostPerKwh, 2)} SAR/kWh, gen share ${generatorShare}%)`
        : powerSupplyType === 'generator'
          ? `Generator only (~${formatNumber(generatorCostPerKwh, 2)} SAR/kWh)`
          : 'No grid (off-grid)';

    const inputsLine = [
      `Use: ${primaryUse}`,
      `Grid: ${hasGrid ? 'Yes' : 'No'}`,
      `Backup: ${wantBackup ? 'Yes' : 'No'}`,
      `Supply: ${supplyLabel}`,
      typeof monthlyKWh === 'number' ? `Monthly kWh: ${formatNumber(monthlyKWh, 0)}` : undefined,
      typeof monthlyBill === 'number' ? `Monthly bill: ${formatNumber(monthlyBill, 2)} SAR` : undefined,
      typeof availableArea === 'number' ? `Area: ${formatNumber(availableArea, 0)} m²` : undefined,
      `PSH: ${formatNumber(peakSunHours, 1)} h/day`,
      `Panel tier: ${panelTier}`,
    ].filter(Boolean).join(' | ');

    if (!calc.ok || !calc.data) {
      return `Solar inquiry reference\nInputs: ${inputsLine}\nNote: Calculation did not run — please review inputs.`;
    }

    const d = calc.data;
    const summary = [
      `System: ${d.systemType} — ${formatNumber(d.systemKw, 1)} kW (~${formatNumber(d.panels, 0)} panels)`,
      `Total cost: ${formatNumber(d.totalSystemCost, 0)} SAR`,
      d.batteryKwhNeeded ? `Battery: ~${formatNumber(d.batteryKwhNeeded, 1)} kWh (${formatNumber(d.batteryCost, 0)} SAR)` : undefined,
      `Annual savings: ${formatNumber(d.annualSavingsSar, 0)} SAR | Payback: ${d.paybackYears === Infinity ? 'N/A' : formatNumber(d.paybackYears, 2) + ' years'}`,
      `Tariff avg: ${formatNumber(d.effectiveKwhPrice, 3)} SAR/kWh`,
    ].filter(Boolean).join('\n');

    return `Solar inquiry reference\nInputs: ${inputsLine}\n${summary}`;
  };

  const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const msg = buildWhatsAppMessage();
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(msg).catch(() => { });
    }
    const url = `https://wa.me/966562405666?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener');
  };

  const runCalculation = (payload?: Partial<SolarCalcHistoryEntry['input']>, skipHistory = false) => {
    const nextInput = {
      monthlyKWh: typeof monthlyKWh === 'number' ? monthlyKWh : undefined,
      monthlyBill: typeof monthlyBill === 'number' ? monthlyBill : undefined,
      availableArea: typeof availableArea === 'number' ? availableArea : undefined,
      hasGrid,
      wantBackup,
      hugeBill,
      primaryUse,
      industryConnection,
      industryFuelCompBand,
      panelTier,
      peakSunHours,
      powerSupplyType,
      generatorCostPerKwh,
      generatorShare,
      ...payload,
    };

    const resolvedPowerSupply = nextInput.powerSupplyType ?? (nextInput.hasGrid ? 'grid' : 'none');
    const resolvedHasGrid = resolvedPowerSupply === 'grid' || resolvedPowerSupply === 'mixed';
    nextInput.hasGrid = resolvedHasGrid;
    nextInput.powerSupplyType = resolvedPowerSupply;

    const validationError = validateInputs(nextInput);
    if (validationError) {
      setResult(<div className="alert alert-warning mb-0">{validationError}</div>);
      return;
    }

    const hasMonthlyBill = typeof nextInput.monthlyBill === 'number' && nextInput.monthlyBill > 0;

    // derive blended/override effective price when generator is involved
    let overrideEffectiveKwhPrice: number | undefined;
    if (nextInput.powerSupplyType === 'generator' || nextInput.powerSupplyType === 'none') {
      overrideEffectiveKwhPrice = nextInput.generatorCostPerKwh;
    } else if (nextInput.powerSupplyType === 'mixed') {
      const tariff = tariffForPrimaryUse(nextInput.primaryUse, { connection: nextInput.industryConnection, fuelCompBand: nextInput.industryFuelCompBand });
      const monthlyBase = typeof nextInput.monthlyKWh === 'number'
        ? nextInput.monthlyKWh
        : typeof nextInput.monthlyBill === 'number'
          ? monthlyKwhFromBill(nextInput.monthlyBill, tariff)
          : 0;
      const gridPrice = monthlyBase > 0 ? effectivePriceForMonthlyKwh(monthlyBase, nextInput.primaryUse, { connection: nextInput.industryConnection, fuelCompBand: nextInput.industryFuelCompBand }) : undefined;
      const share = typeof nextInput.generatorShare === 'number' ? Math.min(Math.max(nextInput.generatorShare, 0), 100) / 100 : 0.5;
      if (gridPrice !== undefined && typeof nextInput.generatorCostPerKwh === 'number') {
        overrideEffectiveKwhPrice = gridPrice * (1 - share) + nextInput.generatorCostPerKwh * share;
      }
    }

    const calc: SolarEstimateResult = computeSolarEstimate({
      monthlyKWh: nextInput.monthlyKWh,
      monthlyBill: nextInput.monthlyBill,
      primaryUse: nextInput.primaryUse,
      industryOptions: { connection: nextInput.industryConnection, fuelCompBand: nextInput.industryFuelCompBand },
      peakSunHours: nextInput.peakSunHours,
      panelTier: nextInput.panelTier,
      hasGrid: nextInput.hasGrid,
      wantBackup: nextInput.wantBackup,
      availableArea: nextInput.availableArea,
      overrideEffectiveKwhPrice,
    });

    if (!calc.ok || (!calc.data && (calc as any).message)) {
      setResult(<span className='text-danger'>{(calc as any).message}</span>);
      return;
    }

    setResult(renderResult(calc, hasMonthlyBill));

    if (skipHistory) return;

    const entry: SolarCalcHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: Date.now(),
      input: nextInput,
      result: calc,
    };

    setHistory(prev => [entry, ...prev].slice(0, 25));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCalculation();
  };

  const handleSelectHistory = (entry: SolarCalcHistoryEntry) => {
    const inp = entry.input;
    setMonthlyKWh(typeof inp.monthlyKWh === 'number' ? inp.monthlyKWh : '');
    setMonthlyBill(typeof inp.monthlyBill === 'number' ? inp.monthlyBill : '');
    setAvailableArea(typeof inp.availableArea === 'number' ? inp.availableArea : '');
    setHasGrid(inp.hasGrid);
    setWantBackup(inp.wantBackup);
    setHugeBill(inp.hugeBill);
    setPrimaryUse(inp.primaryUse);
    setIndustryConnection(inp.industryConnection);
    setIndustryFuelCompBand(inp.industryFuelCompBand);
    setPanelTier(inp.panelTier);
    setPeakSunHours(inp.peakSunHours);
    setPowerSupplyType(inp.powerSupplyType ?? (inp.hasGrid ? 'grid' : 'none'));
    if (typeof inp.generatorCostPerKwh === 'number') setGeneratorCostPerKwh(inp.generatorCostPerKwh);
    if (typeof inp.generatorShare === 'number') setGeneratorShare(inp.generatorShare);
    runCalculation(inp, true);
  };

  const handleRemoveHistory = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  useEffect(() => {
    const validInput = (typeof monthlyKWh === 'number' && monthlyKWh > 0) || (typeof monthlyBill === 'number' && monthlyBill > 0);
    if (!validInput) return;
    runCalculation({}, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthlyKWh, monthlyBill, availableArea, hasGrid, wantBackup, hugeBill, primaryUse, industryConnection, industryFuelCompBand, panelTier, peakSunHours, powerSupplyType, generatorCostPerKwh, generatorShare]);

  return (
    <>
      <HeaderBanner title="Solar Application Form" subtitle="Answer a few questions to get a recommended system." backgroundImage="/src/assets/hero-bg-2.jpg" />

      <section className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-md-11">
            <div className="row">
              <div className="col-md-8">
                <div className="card card-form-holder p-4">
                  <h4 className='display-6 text-center mb-4'>Tell us about your needs</h4>
                  <form className='row align-items-baseline' onSubmit={handleSubmit}>


                    <div className='col-12 d-flex flex-wrap justify-content-between mb-3'>
                      <div className='row'>

                        <div className="col mb-3">
                          <div className=' card p-2'>
                            <label className="form-label d-flex align-items-center flex-column">
                              <FontAwesomeIcon icon={faTachometerAlt} className='fa-2x text-primary me-1' />
                              <small className='text-center'>Monthly consumption</small>
                            </label>
                            <input type="number" className="form-control text-center" value={monthlyKWh as any} onChange={e => setMonthlyKWh(e.target.value === '' ? '' : Number(e.target.value))} min={0} />
                            <div className="d-flex justify-content-end">
                              <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" role="switch" id="syncConsumption" checked={syncConsumption} onChange={e => setSyncConsumption(e.target.checked)} />
                                <label className="form-check-label small" htmlFor="syncConsumption">Sync</label>
                              </div>
                            </div>
                            <small className="form-text text-muted">
                              Average monthly energy consumption (kWh) (optional).
                              Leave blank to estimate from monthly bill.
                            </small>
                          </div>
                        </div>

                        <div className="col mb-3">
                          <div className=' card p-2'>
                            <label className="form-label d-flex align-items-center flex-column">
                              {/* <span className='fs-5 text-primary fw-bold me-1'>&#x20C1;</span> */}
                              <FontAwesomeIcon icon={faMoneyBill} className='fa-2x text-primary me-1' />

                              <small className='text-center'>Monthly bill</small>
                            </label>
                            <div className="input-group">
                              <input type="number" className="form-control text-center" value={monthlyBill as any} onChange={e => setMonthlyBill(e.target.value === '' ? '' : Number(e.target.value))} min={0} />
                              <span className="input-group-text text-primary bg-white">&#x20C1;</span>
                            </div>
                            <div className="d-flex justify-content-end">
                              <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" role="switch" id="syncBill" checked={syncBill} onChange={e => setSyncBill(e.target.checked)} />
                                <label className="form-check-label small" htmlFor="syncBill">Sync</label>
                              </div>
                            </div>
                            <small className="form-text text-muted">
                              Average monthly electricity bill (optional).
                              Leave blank if unknown.
                            </small>
                          </div>
                        </div>

                        <div className="col mb-3">
                          <div className=' card p-2'>
                            <label className="form-label d-flex align-items-center flex-column">
                              <FontAwesomeIcon icon={faRulerCombined} className='fa-2x text-primary me-1' />
                              <small className='text-center'>Area</small>
                            </label>
                            <input type="number" className="form-control text-center" value={availableArea as any} onChange={e => setAvailableArea(e.target.value === '' ? '' : Number(e.target.value))} min={0} />
                            <div className="d-flex justify-content-end">
                              <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" role="switch" id="syncArea" checked={syncArea} onChange={e => setSyncArea(e.target.checked)} />
                                <label className="form-check-label small" htmlFor="syncArea">Sync</label>
                              </div>
                            </div>
                            <small className="form-text text-muted">
                              Available installation area (m²) (optional).
                              Leave blank if unknown.
                            </small>
                          </div>
                        </div>

                        {showAdvanced && (
                          <div className="col mb-3">
                            <div className='card p-2'>
                              <label className="form-label d-flex align-items-center flex-column">
                                <FontAwesomeIcon icon={faSun} className='fa-2x text-primary me-1' />
                                <small className='text-center'>Peak Sun Hours (PSH)</small>
                              </label>
                              <input
                                type="number"
                                className="form-control text-center"
                                value={peakSunHours}
                                onChange={e => setPeakSunHours(Number(e.target.value) || 5)}
                                min={0}
                                step={0.1}
                              />
                              <small className="form-text text-muted">
                                Average PSH: ~6 hours (summer), ~4 hours (winter) in KSA.
                              </small>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-12 mb-3">
                      <div className="mb-3 mt-4">
                        <h3 className='display-1 fs-4'>
                          <FontAwesomeIcon icon={faSolarPanel} className='text-primary' />
                          Primary use</h3>
                        <div className='card p-3'>
                          <div className='row justify-content-center flex-row'>

                            <div className='col'>
                              <input type="radio" className="btn-check" name='primaryUse' id="btn-check-home" value="home" autoComplete="off"
                                onChange={e => setPrimaryUse(e.target.value)}
                                checked={primaryUse === 'home'}
                              />
                              <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-home">
                                <FontAwesomeIcon icon={faHome} className='fa-2x m-1' />
                                <span>Home</span>
                              </label>
                            </div>

                            <div className='col'>
                              <input type="radio" className="btn-check" name='primaryUse' id="btn-check-bank" value="bank" autoComplete="off"
                                onChange={e => setPrimaryUse(e.target.value)}
                                checked={primaryUse === 'bank'}
                              />
                              <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-bank">
                                <FontAwesomeIcon icon={faBank} className='fa-2x m-1' />
                                <span>Bank</span>
                              </label>
                            </div>

                            <div className='col'>
                              <input type="radio" className="btn-check" name='primaryUse' id="btn-check-hospital" value="hospital" autoComplete="off"
                                onChange={e => setPrimaryUse(e.target.value)}
                                checked={primaryUse === 'hospital'}
                              />
                              <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-hospital">
                                <FontAwesomeIcon icon={faHospital} className='fa-2x m-1' />
                                <span>Hospital</span>
                              </label>
                            </div>

                            <div className='col'>
                              <input type="radio" className="btn-check" name='primaryUse' id="btn-check-tractor" value="agricultural" autoComplete="off"
                                onChange={e => setPrimaryUse(e.target.value)}
                                checked={primaryUse === 'agricultural'}
                              />
                              <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-tractor">
                                <FontAwesomeIcon icon={faTractor} className='fa-2x m-1' />
                                <span>Agricultural</span>
                              </label>
                            </div>


                            <div className='col'>
                              <input type="radio" className="btn-check" name='primaryUse' id="btn-check-industry" value="industry" autoComplete="off"
                                onChange={e => setPrimaryUse(e.target.value)}
                                checked={primaryUse === 'industry'}
                              />
                              <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-industry">
                                <FontAwesomeIcon icon={faIndustry} className='fa-2x m-1' />
                                <span>Industrial</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {showAdvanced && primaryUse === 'industry' && (
                        <div className="mb-3">
                          <div className="border rounded p-3">
                            <div className="fw-bold mb-2">Industrial tariff options</div>
                            <div className="row g-2">
                              <div className="col-md-6">
                                <label className="form-label">Fuel-cost compensation band</label>
                                <select
                                  className="form-select"
                                  value={industryFuelCompBand}
                                  onChange={e => setIndustryFuelCompBand(e.target.value as IndustryFuelCompBand)}
                                // disabled={!hasGrid} Disable if grid is not available
                                >
                                  <option value="standard">Industrial (grid-connected)</option>
                                  <option value="lte20">Fuel-cost compensation ≤ 20%</option>
                                  <option value="gt20">Fuel-cost compensation &gt; 20%</option>
                                </select>
                              </div>

                              <div className="col-md-6">
                                <label className="form-label">Connection type</label>
                                <select
                                  className="form-select"
                                  value={industryConnection}
                                  onChange={e => setIndustryConnection(e.target.value as IndustryConnection)}
                                  disabled={industryFuelCompBand === 'standard' || !hasGrid} // Disable if standard or no grid
                                >
                                  <option value="grid">Grid-connected</option>
                                  <option value="powerPlant">Power-plant connected</option>
                                </select>
                                {industryFuelCompBand === 'standard' && (
                                  <div className="form-text">Standard industrial tariff is defined as grid-connected.</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className='col-md-12'>
                      <h3 className='display-1 fs-4'>
                        <FontAwesomeIcon icon={faSolarPanel} className='text-primary' />
                        Solar Solutions
                      </h3>
                      <div className='card p-3 mb-3'>

                        <div className="mt-2">
                          <div className="fw-semibold mb-2">Current power supply</div>
                          <div className="d-flex flex-wrap gap-2">
                            <div className="form-check form-check-inline border rounded px-3 py-2">
                              <input className="form-check-input" type="radio" name="powerSupply" id="ps-grid" value="grid" checked={powerSupplyType === 'grid'} onChange={() => setPowerSupplyType('grid')} />
                              <label className="form-check-label" htmlFor="ps-grid">Grid only</label>
                            </div>
                            <div className="form-check form-check-inline border rounded px-3 py-2">
                              <input className="form-check-input" type="radio" name="powerSupply" id="ps-generator" value="generator" checked={powerSupplyType === 'generator'} onChange={() => setPowerSupplyType('generator')} />
                              <label className="form-check-label" htmlFor="ps-generator">Generator only</label>
                            </div>
                            <div className="form-check form-check-inline border rounded px-3 py-2">
                              <input className="form-check-input" type="radio" name="powerSupply" id="ps-mixed" value="mixed" checked={powerSupplyType === 'mixed'} onChange={() => setPowerSupplyType('mixed')} />
                              <label className="form-check-label" htmlFor="ps-mixed">Mixed (grid + generator)</label>
                            </div>
                            <div className="form-check form-check-inline border rounded px-3 py-2">
                              <input className="form-check-input" type="radio" name="powerSupply" id="ps-none" value="none" checked={powerSupplyType === 'none'} onChange={() => setPowerSupplyType('none')} />
                              <label className="form-check-label" htmlFor="ps-none">None</label>
                            </div>
                          </div>

                          {powerSupplyType !== 'grid' && powerSupplyType !== 'none' && (
                            <div className="row g-2 mt-2">
                              <div className="col-md-6">
                                <label className="form-label">Generator cost (SAR/kWh)</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={generatorCostPerKwh}
                                  onChange={e => setGeneratorCostPerKwh(Number(e.target.value) || 0)}
                                  min={0}
                                  step={0.05}
                                />
                                <div className="form-text">Approximate fuel+O&M cost per kWh.</div>
                              </div>
                              {powerSupplyType === 'mixed' && (
                                <div className="col-md-6">
                                  <label className="form-label">Generator share of energy (%)</label>
                                  <div className="input-group">
                                    <input
                                      type="number"
                                      className="form-control"
                                      value={generatorShare}
                                      onChange={e => setGeneratorShare(Number(e.target.value) || 0)}
                                      min={0}
                                      max={100}
                                      step={1}
                                    />
                                    <span className="input-group-text">%</span>
                                  </div>
                                  <div className="form-text">Share of total kWh currently supplied by generator.</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="form-check form-switch mb-2">
                          <input className="form-check-input" type="checkbox" role="switch" id="backup" checked={wantBackup} onChange={e => setWantBackup(e.target.checked)} />
                          <label className="form-check-label" htmlFor="backup">
                            <span className="fa-layers fa-fw">
                              <FontAwesomeIcon icon={faBolt} className='text-warning' />
                              <FontAwesomeIcon icon={faSlash} className='text-danger' transform="grow-2" />
                            </span>
                            Do you suffer from frequent power outages?</label>
                        </div>

                        <div className="form-check form-switch mb-2">
                          <input className="form-check-input" type="checkbox" role="switch" id="hugeBill" checked={hugeBill} onChange={e => setHugeBill(e.target.checked)} />
                          <label className="form-check-label" htmlFor="hugeBill">
                            <FontAwesomeIcon icon={faHandHoldingUsd} className='text-warning' />
                            Do you suffer from a bill price that is too high?</label>
                        </div>



                        
                      </div>
                    </div>



                    {showAdvanced && (
                      <div className='col-md-6'>
                        <div className="mb-3">
                          <label className="form-label d-flex align-items-center gap-2"><FontAwesomeIcon icon={faSolarPanel} className='text-primary' /> Panel price category</label>
                          <div className="d-flex flex-wrap gap-2 flex-column">
                            {(['economy', 'standard', 'premium'] as const).map(key => (
                              <div key={key} className='form-check form-check-inline border rounded px-3 py-2'>
                                <input className="form-check-input" type="radio" name="panelTier" id={`panel-${key}`} value={key} checked={panelTier === key} onChange={e => setPanelTier(e.target.value as PanelTierKey)} />
                                <label className="form-check-label" htmlFor={`panel-${key}`}>
                                  <span className='fw-bold text-capitalize'>{PANEL_PRICING[key].label}</span>
                                  <span className='d-block small text-muted'>{PANEL_PRICING[key].costPerPanel} SAR / panel — {PANEL_PRICING[key].note}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}



                    <div className='col-12'>
                      <div className="form-check float-end form-switch mb-2">
                        <input className="form-check-input" type="checkbox" role="switch" id="advancedOptions" checked={showAdvanced} onChange={e => setShowAdvanced(e.target.checked)} />
                        <label className="form-check-label" htmlFor="advancedOptions">
                          <FontAwesomeIcon icon={faTachometerAlt} className='text-primary' />
                          Show advanced options</label>
                      </div>
                      <div className="d-flex w-100 justify-content-end gap-2">
                        <button className="btn btn-primary d-flex w-100 justify-content-center flex-row align-items-center" type="submit">
                          <FontAwesomeIcon icon={faSave} className='fa-3x' />
                          <small className='ms-2'>
                            Save and Compare
                          </small>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card card-form-holder p-4">
                  <div className="mt-4">
                    <h4 className='display-6 text-center mb-4'>Recommendation</h4>
                    {result && (
                      <>
                        <div className='container' style={{ whiteSpace: 'pre-wrap' }}>
                          {result}
                        </div>
                        <p className="mt-3 text-muted">
                          Approximation notice: This calculator provides an estimate and is not 100% accurate. Final system design and pricing require an engineer assessment and detailed load study. Contact us to get a tailored calculation and quote that fits your business.
                        </p>
                      </>
                    )}
                    <a
                      href="#"
                      onClick={handleWhatsAppClick}
                      className="btn btn-success btn-lg w-100 mt-3"
                      title="Copy details and open WhatsApp"
                    >
                      <FontAwesomeIcon icon={faWhatsapp} className='me-2' />
                      Contact via WhatsApp for Free Consultant Quote
                    </a>
                  </div>
                  <Link to="/solar-solutions" className="btn my-2 btn-outline-secondary">Back to Solar systems</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row justify-content-center mt-4">
          <div className="col-md-11">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">Saved Calculations</h5>
                  <small className="text-muted">Click a row to reuse inputs; changes auto-recalculate.</small>
                </div>
                {history.length === 0 ? (
                  <div className="text-muted">No calculations yet. Submit the form to add entries.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead>
                        <tr>
                          <th>Use</th>
                          <th>Type</th>
                          <th>Size (kW)</th>
                          <th>Panels</th>
                          <th>Total Cost (SAR)</th>
                          <th>Battery (kWh)</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map(entry => {
                          if (!entry.result.ok || !entry.result.data) return null;
                          const data = entry.result.data;
                          const primary = entry.input.primaryUse;
                          const useIcon =
                            primary === 'home' ? faHome :
                              primary === 'bank' ? faBank :
                                primary === 'hospital' ? faHospital :
                                  primary === 'agricultural' ? faTractor :
                                    primary === 'industry' ? faIndustry : faSolarPanel;
                          return (
                            <tr key={entry.id} className="align-middle" style={{ cursor: 'pointer' }} onClick={() => handleSelectHistory(entry)} title="Select this calculation to compare">
                              <td><FontAwesomeIcon icon={useIcon} className='text-primary' /></td>
                              <td>{data.systemType}</td>
                              <td>{formatNumber(data.systemKw, 1)}</td>
                              <td>{formatNumber(data.panels, 0)}</td>
                              <td>{formatNumber(data.totalSystemCost, 0)}</td>
                              <td>{data.batteryKwhNeeded ? formatNumber(data.batteryKwhNeeded, 1) : '-'}</td>
                              <td className="d-flex gap-2">
                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={(e) => { e.stopPropagation(); handleRemoveHistory(entry.id); }} title="Remove">
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SolarApplicationForm;
