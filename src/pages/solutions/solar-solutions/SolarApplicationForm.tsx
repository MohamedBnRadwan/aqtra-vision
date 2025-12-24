import React, { useMemo, useState } from 'react';
import HeaderBanner from '@/components/HeaderBanner';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faBank, faTractor, faIndustry, faHome, faSolarPanel, faCalculator, faHospital, faSlash, faHandHolding, faHandHoldingUsd, faRulerCombined, faDollarSign, faTachometerAlt, faMoneyBill, faCarBattery, faExclamationTriangle, faSun } from '@fortawesome/free-solid-svg-icons';
import {
  billFromMonthlyKwh,
  monthlyKwhFromBill,
  tariffForPrimaryUse,
  type IndustryConnection,
  type IndustryFuelCompBand,
} from '@/lib/saudiElectricityTariffs';

import './SolarApplicationForm.css';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const SolarApplicationForm: React.FC = () => {
  const [monthlyKWh, setMonthlyKWh] = useState<number | ''>(1000);
  const [monthlyBill, setMonthlyBill] = useState<number | ''>('');
  const [availableArea, setAvailableArea] = useState<number | ''>('');
  const [hasGrid, setHasGrid] = useState<boolean>(true);
  const [wantBackup, setWantBackup] = useState<boolean>(false);
  const [hugeBill, setHugeBill] = useState<boolean>(false);
  const [primaryUse, setPrimaryUse] = useState<string>('home');
  const [industryConnection, setIndustryConnection] = useState<IndustryConnection>('grid');
  const [industryFuelCompBand, setIndustryFuelCompBand] = useState<IndustryFuelCompBand>('standard');
  const [panelTier, setPanelTier] = useState<'economy' | 'standard' | 'premium'>('standard');
  const [result, setResult] = useState<React.ReactNode>(null);
  const [peakSunHours, setPeakSunHours] = useState<number>(5); // Default to 5

  const LOSSES = 0.85;      // design losses accounted when sizing kW
  const DERATE = 0.8;       // production derate for soiling/temp
  const SYSTEM_LIFETIME_YEARS = 25;
  const INSTALL_MARKUP = 0.35; // inverter + installation as % of panels cost

  const panelPricing = useMemo(() => ({
    economy: { label: 'Economy', costPerPanel: 320, efficiency: 0.8, wattage: 350, note: 'Lower cost, shorter lifespan' },
    standard: { label: 'Standard', costPerPanel: 420, efficiency: 1.0, wattage: 400, note: 'Balanced price/performance' },
    premium: { label: 'Premium', costPerPanel: 800, efficiency: 1.2, wattage: 450, note: 'Higher efficiency, longer lifespan' },
  }), []);

  function round(val: number, decimals = 1) {
    const m = Math.pow(10, decimals);
    return Math.round(val * m) / m;
  }

  const electricityTariff = useMemo(() => {
    return tariffForPrimaryUse(primaryUse, {
      connection: industryConnection,
      fuelCompBand: industryFuelCompBand,
    });
  }, [primaryUse, industryConnection, industryFuelCompBand]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const monthly = typeof monthlyKWh === 'number' && monthlyKWh > 0
      ? monthlyKWh
      : (typeof monthlyBill === 'number' && monthlyBill > 0 ? monthlyKwhFromBill(monthlyBill, electricityTariff) : 0);
    if (!monthly) {
      setResult(<span className='text-danger'>Please provide a valid average monthly energy consumption or monthly bill amount.</span>);
      return;
    }

    const dailyKWh = monthly / 30;
    const requiredKw = dailyKWh / peakSunHours; // Use user-provided value
    const systemKw = requiredKw / LOSSES; // account design losses when sizing
    const selectedPricing = panelPricing[panelTier];
    const adjustedPanelWatt = selectedPricing.wattage * selectedPricing.efficiency; // Adjust panel wattage by efficiency
    const panels = Math.ceil((systemKw * 1000) / adjustedPanelWatt); // Calculate panels based on adjusted wattage
    const kwPerArea = 9.5;
    // const areaPerPanel = 1.7; // sqm
    // const kwhPerPanelPerDay = (panelWatt / 1000) * PEAK_SUN_HOURS * DERATE;
    // const areaNeeded = round(panels * areaPerPanel);
    const areaNeeded = round(systemKw * kwPerArea);

    // Billing & pricing
    const { totalSar: monthlyBillComputed, avgSarPerKwh: effectiveKwhPrice } = billFromMonthlyKwh(monthly, electricityTariff);

    // Solar production & savings
    const annualProdKwh = systemKw * peakSunHours * 365 * DERATE * selectedPricing.efficiency;
    const annualLoadKwh = monthly * 12;
    const annualOffset = Math.min(annualProdKwh, annualLoadKwh);
    const annualSavingsSar = annualOffset * effectiveKwhPrice;

    // Costs
    const panelsCost = panels * selectedPricing.costPerPanel;
    const inverterInstall = panelsCost * INSTALL_MARKUP;
    const totalSystemCost = panelsCost + inverterInstall;

    // Payback & lifetime value
    const paybackYears = annualSavingsSar > 0 ? totalSystemCost / annualSavingsSar : Infinity;
    const lifetimeGrossSavings = annualSavingsSar * SYSTEM_LIFETIME_YEARS;
    const lifetimeNetSavings = lifetimeGrossSavings - totalSystemCost;

    let recommendedType = <><FontAwesomeIcon icon={faTachometerAlt} className='text-primary me-1' /> On-Grid (Grid-Tied)</>;
    if (!hasGrid) recommendedType = <><FontAwesomeIcon icon={faCarBattery} className='text-primary me-1' /> Off-Grid (Standalone)</>;
    else if (wantBackup) recommendedType = <><FontAwesomeIcon icon={faSolarPanel} className='text-primary me-1' /> Hybrid (With Battery Backup)</>;
    if (primaryUse === 'agricultural') recommendedType = <><FontAwesomeIcon icon={faTractor} className='text-primary me-1' /> Solar Pumping System</>;
    if (hugeBill) recommendedType = <><FontAwesomeIcon icon={faDollarSign} className='text-primary me-1' /> Larger On-Grid System</>;
    let panelsMsg = <><FontAwesomeIcon icon={faSolarPanel} className='text-primary me-1' /> {panels} panels (~{round(systemKw)} kW)</>;

    let typeMsg = <></>;
    if (primaryUse === 'hospital' || primaryUse === 'bank' || primaryUse === 'industry') {
      typeMsg = <><FontAwesomeIcon icon={faHandHolding} className='text-primary me-1' /> Consider commercial-grade inverters and modules for enhanced reliability.</>;
    }

    if (primaryUse === 'home') {
      typeMsg = <><FontAwesomeIcon icon={faHome} className='text-primary me-1' /> Suitable for residential energy needs.</>;
    } else if (primaryUse === 'agricultural') {
      typeMsg = <><FontAwesomeIcon icon={faTractor} className='text-primary me-1' /> Ideal for agricultural water pumping applications.</>;
    }

    let areaMsg = <><FontAwesomeIcon icon={faRulerCombined} className='text-primary me-1' /> Estimated installation area needed: {areaNeeded} m².</>;
    let areaAlertMessage = <></>;
    if (availableArea && typeof availableArea === 'number' && (availableArea + availableArea * 0.1) < areaNeeded) {
      areaAlertMessage = <span className='rounded-pill lh-1 text-bg-danger'> <FontAwesomeIcon icon={faExclamationTriangle} className='text-warning me-1' /> Provided area ({availableArea} m²) may be insufficient — consider higher-efficiency modules or ground mounts.</span>;
    }

    setResult(
      <div className="row g-3">
        <div className="col-12">
          <div className="alert alert-success mb-2">
            <div className="fw-bold">Recommended system: {recommendedType}</div>
            <div>{typeMsg}</div>
            <div>{panelsMsg}</div>
            <div>{areaMsg}</div>
            <div>{areaAlertMessage}</div>
          </div>
        </div>

        <div className="col-md-12">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Electricity Costs (with VAT)</h6>
              <ul className="mb-0">
                <li>Monthly bill (before solar): {round(monthlyBillComputed, 2)} SAR</li>
                <li>Effective tariff: {round(effectiveKwhPrice, 3)} SAR/kWh</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-12">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Solar Production &amp; Savings</h6>
              <ul className="mb-0">
                <li>Estimated annual solar production: {round(annualProdKwh, 0)} kWh</li>
                <li>Annual savings: {round(annualSavingsSar, 0)} SAR</li>
                <li>Payback period: {paybackYears === Infinity ? 'N/A' : `${round(paybackYears, 2)} years`}</li>
                <li>{SYSTEM_LIFETIME_YEARS}-year gross savings: {round(lifetimeGrossSavings, 0)} SAR</li>
                <li>{SYSTEM_LIFETIME_YEARS}-year net savings (after cost): {round(lifetimeNetSavings, 0)} SAR</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="card-title">System Cost Estimate — {selectedPricing.label}</h6>
              <ul className="mb-0">
                <li>Cost per panel: {selectedPricing.costPerPanel} SAR</li>
                <li>Total panels cost: {round(panelsCost, 0)} SAR</li>
                <li>Inverter + installation (est. {Math.round(INSTALL_MARKUP * 100)}%): {round(inverterInstall, 0)} SAR</li>
                <li className="fw-bold text-primary">Estimated system cost: {round(totalSystemCost, 0)} SAR</li>
              </ul>
              <small className="text-muted">Assumptions: PSH {peakSunHours} h/day, derate {Math.round(DERATE * 100)}%, VAT included in electricity bill.</small>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <HeaderBanner title="Solar Application Form" subtitle="Answer a few questions to get a recommended system." backgroundImage="/src/assets/hero-bg-2.jpg" />

      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-10 col-lg-9">
            <div className="card card-form-holder p-4">

              <h3 className='display-4 text-center mb-4'>Tell us about your needs</h3>
              <form className='row' onSubmit={handleSubmit}>
                <div className='d-flex flex-wrap justify-content-between mb-3'>
                  <div className="w-25 mb-3">
                    <label className="form-label d-flex align-items-center flex-column">
                      <FontAwesomeIcon icon={faTachometerAlt} className='fa-2x text-primary me-1' />
                      <small className='text-center'>Average monthly energy consumption (kWh)</small>
                    </label>
                    <input type="number" className="form-control text-center" value={monthlyKWh as any} onChange={e => setMonthlyKWh(e.target.value === '' ? '' : Number(e.target.value))} min={0} />
                  </div>


                  <div className="w-25 mb-3">
                    <label className="form-label d-flex align-items-center flex-column">
                      {/* <span className='fs-5 text-primary fw-bold me-1'>&#x20C1;</span> */}
                      <FontAwesomeIcon icon={faMoneyBill} className='fa-2x text-primary me-1' />

                      <small className='text-center'>Average monthly electricity bill (optional)</small>
                    </label>
                    <div className="input-group">
                      <input type="number" className="form-control text-center" value={monthlyBill as any} onChange={e => setMonthlyBill(e.target.value === '' ? '' : Number(e.target.value))} min={0} />
                      <span className="input-group-text text-primary bg-white">&#x20C1;</span>
                    </div>
                  </div>

                  <div className="w-25 mb-3">
                    <label className="form-label d-flex align-items-center flex-column">
                      <FontAwesomeIcon icon={faRulerCombined} className='fa-2x text-primary me-1' />
                      <small className='text-center'>Available installation area (m²) (optional)</small>
                    </label>
                    <input type="number" className="form-control text-center" value={availableArea as any} onChange={e => setAvailableArea(e.target.value === '' ? '' : Number(e.target.value))} min={0} />
                  </div>

                  <div className="w-25 mb-3">
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


                <div className='col-md-6'>

                  <div className="form-check form-switch mb-2">
                    <input className="form-check-input" type="checkbox" role="switch" id="grid" checked={hasGrid} onChange={e => setHasGrid(e.target.checked)} />
                    <label className="form-check-label" htmlFor="grid">
                      <FontAwesomeIcon icon={faBolt} className='text-warning' />
                      Do you have grid connection?</label>
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
                      Are you suffering from a bill price that is too high?</label>
                  </div>
                </div>



                <div className='col-md-6'>
                  <div className="mb-3">
                    <label className="form-label d-flex align-items-center gap-2"><FontAwesomeIcon icon={faSolarPanel} className='text-primary' /> Panel price category</label>
                    <div className="d-flex flex-wrap gap-2 flex-column">
                      {(['economy', 'standard', 'premium'] as const).map(key => (
                        <div key={key} className='form-check form-check-inline border rounded px-3 py-2'>
                          <input className="form-check-input" type="radio" name="panelTier" id={`panel-${key}`} value={key} checked={panelTier === key} onChange={e => setPanelTier(e.target.value as any)} />
                          <label className="form-check-label" htmlFor={`panel-${key}`}>
                            <span className='fw-bold text-capitalize'>{panelPricing[key].label}</span>
                            <span className='d-block small text-muted'>{panelPricing[key].costPerPanel} SAR / panel — {panelPricing[key].note}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>


                <div className="mb-3 mt-4">
                  <h3 className='display-1 fs-4'>Primary use</h3>
                  <div className='d-flex flex-wrap'>

                    <div className='m-1'>
                      <input type="radio" className="btn-check" name='primaryUse' id="btn-check-home" value="home" autoComplete="off"
                        onChange={e => setPrimaryUse(e.target.value)}
                        checked={primaryUse === 'home'}
                      />
                      <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-home">
                        <FontAwesomeIcon icon={faHome} className='fa-2x m-1' />
                        <span>Home</span>
                      </label>
                    </div>

                    <div className='m-1'>
                      <input type="radio" className="btn-check" name='primaryUse' id="btn-check-bank" value="bank" autoComplete="off"
                        onChange={e => setPrimaryUse(e.target.value)}
                        checked={primaryUse === 'bank'}
                      />
                      <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-bank">
                        <FontAwesomeIcon icon={faBank} className='fa-2x m-1' />
                        <span>Bank</span>
                      </label>
                    </div>

                    <div className='m-1'>
                      <input type="radio" className="btn-check" name='primaryUse' id="btn-check-hospital" value="hospital" autoComplete="off"
                        onChange={e => setPrimaryUse(e.target.value)}
                        checked={primaryUse === 'hospital'}
                      />
                      <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-hospital">
                        <FontAwesomeIcon icon={faHospital} className='fa-2x m-1' />
                        <span>Hospital</span>
                      </label>
                    </div>

                    <div className='m-1'>
                      <input type="radio" className="btn-check" name='primaryUse' id="btn-check-tractor" value="agricultural" autoComplete="off"
                        onChange={e => setPrimaryUse(e.target.value)}
                        checked={primaryUse === 'agricultural'}
                      />
                      <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-tractor">
                        <FontAwesomeIcon icon={faTractor} className='fa-2x m-1' />
                        <span>Agricultural</span>
                      </label>
                    </div>


                    <div className='m-1'>
                      <input type="radio" className="btn-check" name='primaryUse' id="btn-check-industry" value="industry" autoComplete="off"
                        onChange={e => setPrimaryUse(e.target.value)}
                        checked={primaryUse === 'industry'}
                      />
                      <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-industry">
                        <FontAwesomeIcon icon={faIndustry} className='fa-2x m-1' />
                        <span>Industry</span>
                      </label>
                    </div>
                  </div>
                </div>

                {primaryUse === 'industry' && (
                  <div className="col-12 mb-3">
                    <div className="border rounded p-3">
                      <div className="fw-bold mb-2">Industrial tariff options</div>
                      <div className="row g-2">
                        <div className="col-md-6">
                          <label className="form-label">Fuel-cost compensation band</label>
                          <select
                            className="form-select"
                            value={industryFuelCompBand}
                            onChange={e => setIndustryFuelCompBand(e.target.value as IndustryFuelCompBand)}
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
                            disabled={industryFuelCompBand === 'standard'}
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

                <div className="d-flex justify-content-end gap-2">
                  <button className="btn btn-primary d-flex justify-content-center flex-column align-items-center" type="submit">
                    <FontAwesomeIcon icon={faCalculator} className='fa-3x' />
                    <small className='ms-2'>
                      Get Recommendations
                    </small>
                  </button>
                </div>
              </form>

              {result && (
                <div className="mt-4 alert alert-success">
                  <h5 className='display-6'>Recommendation</h5>
                  <div className='container' style={{ whiteSpace: 'pre-wrap' }}>
                    {result}
                  </div>
                  <p className="mt-3 text-muted">
                    * Please note: The estimated prices provided include only the cost of solar panels. Additional components such as batteries, wiring, and inverters are not included. This calculation is intended as a preliminary step to help you evaluate the feasibility of transitioning to solar energy.
                  </p>
                  <a
                    href="https://wa.me/yourwhatsappnumber?text=I%20am%20interested%20in%20a%20free%20solar%20consultation%20quote."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success btn-lg w-100 mt-3"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className='me-2' />
                    Contact via WhatsApp for Free Consultant Quote
                  </a>
                </div>
              )}
              <Link to="/solar-solutions" className="btn my-2 btn-outline-secondary">Back to Solar systems</Link>

            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SolarApplicationForm;
