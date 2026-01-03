import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderBanner from '@/components/HeaderBanner';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faBank, faTractor, faIndustry, faHome, faSolarPanel, faSave, faHospital, faSlash, faHandHolding, faHandHoldingUsd, faRulerCombined, faDollarSign, faTachometerAlt, faMoneyBill, faCarBattery, faExclamationTriangle, faSun, faTrash, faPrint } from '@fortawesome/free-solid-svg-icons';
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
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
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
  const pageUrl = typeof window !== 'undefined' && window.location ? window.location.href : '';

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

  function parseBool(val: string | null | undefined) {
    return val === '1' || val === 'true';
  }

  const formatPowerSupplyLabel = (type: 'grid' | 'generator' | 'mixed' | 'none' = powerSupplyType, share = generatorShare) => {
    if (type === 'grid') return t('solarCalc.powerSupplyLabelGrid');
    if (type === 'generator') return t('solarCalc.powerSupplyLabelGenerator');
    if (type === 'none') return t('solarCalc.powerSupplyLabelNone');
    const normalizedShare = Number.isFinite(share) ? Math.max(0, Math.min(100, share)) : 0;
    return t('solarCalc.powerSupplyLabelMixed', { share: formatNumber(normalizedShare, 0) });
  };

  const formatPrimaryUseLabel = (use: string) => {
    if (use === 'home') return t('solarCalc.siteHome');
    if (use === 'bank') return t('solarCalc.siteBank');
    if (use === 'hospital') return t('solarCalc.siteHospital');
    if (use === 'agricultural') return t('solarCalc.siteAgricultural');
    if (use === 'industry') return t('solarCalc.siteIndustrial');
    return use;
  };

  const formatSystemType = (type: string) => {
    if (type === 'onGrid') return t('solarCalc.recommendedType.onGrid');
    if (type === 'offGrid') return t('solarCalc.recommendedType.offGrid');
    if (type === 'hybrid') return t('solarCalc.recommendedType.hybrid');
    if (type === 'pumping') return t('solarCalc.recommendedType.pumping');
    return type;
  };

  function buildShareUrl() {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href.split('#')[0]);
    const params = new URLSearchParams();
    if (typeof monthlyKWh === 'number' && monthlyKWh > 0) params.set('mkwh', String(monthlyKWh));
    if (typeof monthlyBill === 'number' && monthlyBill > 0) params.set('mbill', String(monthlyBill));
    if (typeof availableArea === 'number' && availableArea > 0) params.set('area', String(availableArea));
    params.set('grid', String(hasGrid ? 1 : 0));
    params.set('backup', String(wantBackup ? 1 : 0));
    params.set('huge', String(hugeBill ? 1 : 0));
    params.set('use', primaryUse);
    params.set('conn', industryConnection);
    params.set('fuel', industryFuelCompBand);
    params.set('panel', panelTier);
    params.set('psh', String(peakSunHours));
    params.set('supply', powerSupplyType);
    params.set('gcost', String(generatorCostPerKwh));
    params.set('gshare', String(generatorShare));
    params.set('adv', String(showAdvanced ? 1 : 0));
    url.search = params.toString();
    return url.toString();
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
    if (powerSupplyType === 'generator' || powerSupplyType === 'none') {
      return null; // skip validation for generator-only or no-grid scenarios
    }

    if (typeof input.monthlyKWh === 'number' && typeof input.monthlyBill === 'number' && input.monthlyKWh > 0 && input.monthlyBill > 0) {
      const impliedRate = input.monthlyBill / input.monthlyKWh;
      if (impliedRate < 0.05) {
        return t('solarCalc.validationLow');
      }
      if (impliedRate > 2) {
        return t('solarCalc.validationHigh');
      }
    }

    // if (typeof input.monthlyKWh === 'number' && input.monthlyKWh > 50000 && (input.monthlyBill === undefined || input.monthlyBill <= 0)) {
    //   return 'Consumption value is unusually high. Add a bill amount or recheck the kWh value.';
    // }

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
  const SHOW_ADVANCED_KEY = 'solarShowAdvanced';

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
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const mkwh = params.get('mkwh');
    const mbill = params.get('mbill');
    const area = params.get('area');
    const grid = params.get('grid');
    const backup = params.get('backup');
    const huge = params.get('huge');
    const use = params.get('use');
    const conn = params.get('conn');
    const fuel = params.get('fuel');
    const panel = params.get('panel');
    const psh = params.get('psh');
    const supply = params.get('supply');
    const gcost = params.get('gcost');
    const gshare = params.get('gshare');
    const adv = params.get('adv');

    if (mkwh !== null && !Number.isNaN(Number(mkwh))) setMonthlyKWh(Number(mkwh));
    if (mbill !== null && !Number.isNaN(Number(mbill))) setMonthlyBill(Number(mbill));
    if (area !== null && !Number.isNaN(Number(area))) setAvailableArea(Number(area));
    if (grid !== null) setHasGrid(parseBool(grid));
    if (backup !== null) setWantBackup(parseBool(backup));
    if (huge !== null) setHugeBill(parseBool(huge));
    if (use) setPrimaryUse(use);
    if (conn) setIndustryConnection(conn as IndustryConnection);
    if (fuel) setIndustryFuelCompBand(fuel as IndustryFuelCompBand);
    if (panel && (['economy', 'standard', 'premium'] as const).includes(panel as any)) setPanelTier(panel as PanelTierKey);
    if (psh !== null && !Number.isNaN(Number(psh))) setPeakSunHours(Number(psh));
    if (supply && (['grid', 'generator', 'mixed', 'none'] as const).includes(supply as any)) setPowerSupplyType(supply as any);
    if (gcost !== null && !Number.isNaN(Number(gcost))) setGeneratorCostPerKwh(Number(gcost));
    if (gshare !== null && !Number.isNaN(Number(gshare))) setGeneratorShare(Number(gshare));
    if (adv !== null) setShowAdvanced(parseBool(adv));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(SHOW_ADVANCED_KEY);
    if (saved === 'true') setShowAdvanced(true);
    if (saved === 'false') setShowAdvanced(false);
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(SHOW_ADVANCED_KEY, String(showAdvanced));
  }, [showAdvanced]);

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
    if (!calc.ok || !calc.data) return <span className='text-danger'>{t('solarCalc.calcFailed')}</span>;
    const data = calc.data;
    const selectedPricing = data.selectedPanel;

    let recommendedType = <><FontAwesomeIcon icon={faTachometerAlt} className='text-primary me-1' /> {t('solarCalc.recommendedType.onGrid')}</>;
    if (data.systemType === 'offGrid') recommendedType = <><FontAwesomeIcon icon={faCarBattery} className='text-primary me-1' /> {t('solarCalc.recommendedType.offGrid')}</>;
    else if (data.systemType === 'hybrid') recommendedType = <><FontAwesomeIcon icon={faSolarPanel} className='text-primary me-1' /> {t('solarCalc.recommendedType.hybrid')}</>;
    if (primaryUse === 'agricultural') recommendedType = <><FontAwesomeIcon icon={faTractor} className='text-primary me-1' /> {t('solarCalc.recommendedType.pumping')}</>;

    let typeMsg = <></>;
    if (primaryUse === 'hospital' || primaryUse === 'bank' || primaryUse === 'industry') {
      typeMsg = <><FontAwesomeIcon icon={faHandHolding} className='text-primary me-1' /> {t('solarCalc.typeMsg.commercial')}</>;
    }

    if (primaryUse === 'home') {
      typeMsg = <><FontAwesomeIcon icon={faHome} className='text-primary me-1' /> {t('solarCalc.typeMsg.home')}</>;
    } else if (primaryUse === 'agricultural') {
      typeMsg = <><FontAwesomeIcon icon={faTractor} className='text-primary me-1' /> {t('solarCalc.typeMsg.agri')}</>;
    }

    const areaNeeded = data.areaNeeded;
    let areaMsg = <><FontAwesomeIcon icon={faRulerCombined} className='text-primary me-1' /> {t('solarCalc.areaNeeded', { area: formatNumber(areaNeeded, 0) })}</>;
    let areaAlertMessage = <></>;
    if (availableArea && typeof availableArea === 'number' && (availableArea + availableArea * 0.1) < areaNeeded) {
      areaAlertMessage = <span className='rounded-pill lh-1 text-bg-danger'> <FontAwesomeIcon icon={faExclamationTriangle} className='text-warning me-1' /> {t('solarCalc.areaInsufficient', { area: availableArea })}</span>;
    }

    return (
      <>
        <div className="row g-3">
          <div className="col-12">
            <div className="alert alert-success mb-2">
              <div className="fw-bold">{t('solarCalc.recommended')}: {recommendedType}</div>
              <div>{typeMsg}</div>
              <div><FontAwesomeIcon icon={faSolarPanel} className='text-primary me-1' /> {t('solarCalc.panelSummary', { count: data.panels, kw: round(data.systemKw, 1) })}</div>
              <div>{areaMsg}</div>
              <div>{areaAlertMessage}</div>
              {hugeBill && (
                <div className="alert alert-warning mt-2 mb-0 py-2">
                  <div className="fw-semibold">{t('solarCalc.highBillFocus')}</div>
                  <ul className="mb-0 ps-3">
                    <li>⚡ {t('solarCalc.hugeBillTip1')}</li>
                    <li>💡 {t('solarCalc.hugeBillTip2')}</li>
                    <li>📊 {t('solarCalc.hugeBillTip3')}</li>
                    <li>💰 {t('solarCalc.hugeBillTip4')}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {hasMonthlyBill || hasGrid ? (
            <div className="col-md-12">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title">{t('solarCalc.electricityCosts')}</h6>
                  <ul className="mb-0">
                    <li>{t('solarCalc.monthlyBillBefore', { value: formatNumber(data.monthlyBillComputed, 2) })}</li>
                    <li>{t('solarCalc.effectiveTariff', { value: formatNumber(data.effectiveKwhPrice, 3) })}</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : null}

          <div className="col-md-12">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h6 className="card-title">{t('solarCalc.solarProduction')}</h6>
                <ul className="mb-0">
                  <li>{t('solarCalc.solarProdAnnual', { value: formatNumber(data.annualProdKwh, 0) })}</li>
                  <li>{t('solarCalc.solarProdSavings', { value: formatNumber(data.annualSavingsSar, 0) })}</li>
                  <li>{t('solarCalc.solarProdPayback', { value: data.paybackYears === Infinity ? t('solarCalc.na') : `${formatNumber(data.paybackYears, 2)}` })}</li>
                  <li>{t('solarCalc.solarProdGross', { value: formatNumber(data.lifetimeGrossSavings, 0) })}</li>
                  <li>{t('solarCalc.solarProdNet', { value: formatNumber(data.lifetimeNetSavings, 0) })}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="card-title">{t('solarCalc.systemCost', { tier: selectedPricing.label })}</h6>
                <ul className="mb-0">
                  {/* <li>Cost per panel: {formatNumber(selectedPricing.costPerPanel, 0)} SAR</li> */}
                  <li>{t('solarCalc.systemCostPanels', { value: formatNumber(data.panelsCost, 0) })}</li>
                  {/* <li >Inverter + install allowance (included): {formatNumber(data.inverterInstallBase, 0)} SAR</li> */}
                  <li className="fw-semibold">{t('solarCalc.systemCostPackage', { value: formatNumber(data.packagePriceSar, 0) })}</li>
                  {data.batteryCost > 0 && (
                    <li>{t('solarCalc.systemCostBattery', { kwh: formatNumber(data.batteryKwhNeeded, 1), cost: formatNumber(data.batteryCost, 0) })}</li>
                  )}
                  {data.inverterUpgradeAdder > 0 && (
                    <li>{t('solarCalc.systemCostInverter', { cost: formatNumber(data.inverterUpgradeAdder, 0) })}</li>
                  )}
                  {data.systemKw > 500 && (
                    <li className="text-warning fw-semibold">{t('solarCalc.systemCostLarge')}</li>
                  )}
                  {/* <li className="fw-bold text-primary">Estimated total system cost (package + any batteries/upgrades): {formatNumber(data.totalSystemCost, 0)} SAR</li> */}
                  {/* <li className="text-muted">Package already includes panels, inverter, and balance-of-system; allowances shown above are not added on top.</li> */}

                </ul>
                <small className="text-muted">{t('solarCalc.assumptions', { psh: peakSunHours })}</small>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12 mb-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">
                    <FontAwesomeIcon icon={faTachometerAlt} className='text-primary me-2' />
                    {t('solarCalc.quickSnapshot')}
                  </h6>
                  <small className="text-muted">{t('solarCalc.autoUpdates')}</small>
                </div>
                <div className="row g-2 text-center">
                  <div className="col">
                    <div className="border rounded p-2 h-100">
                      <div className="small text-muted">{t('solarCalc.consumption')}</div>
                      <div className="fw-semibold">{typeof monthlyKWh === 'number' && monthlyKWh > 0 ? `${formatNumber(monthlyKWh, 0)} kWh` : '—'}</div>
                      {syncConsumption && <span className="badge bg-primary-subtle text-primary mt-1">{t('solarCalc.syncedFromBill')}</span>}
                    </div>
                  </div>
                  <div className="col">
                    <div className="border rounded p-2 h-100">
                      <div className="small text-muted">{t('solarCalc.bill')}</div>
                      <div className="fw-semibold">{typeof monthlyBill === 'number' && monthlyBill > 0 ? t('solarCalc.sarAmount', { value: formatNumber(monthlyBill, 2) }) : '—'}</div>
                      {syncBill && <span className="badge bg-primary-subtle text-primary mt-1">{t('solarCalc.syncedFromKwh')}</span>}
                    </div>
                  </div>
                  <div className="col">
                    <div className="border rounded p-2 h-100">
                      <div className="small text-muted">{t('solarCalc.powerSupply')}</div>
                      <div className="fw-semibold">
                        {formatPowerSupplyLabel()}
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="border rounded p-2 h-100">
                      <div className="small text-muted">{t('solarCalc.area')}</div>
                      <div className="fw-semibold">{typeof availableArea === 'number' && availableArea > 0 ? `${formatNumber(availableArea, 0)} m²` : '—'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
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
      ? t('solarCalc.powerSupplyLabelGrid')
      : powerSupplyType === 'mixed'
        ? t('solarCalc.supplyMixedDetailed', { cost: formatNumber(generatorCostPerKwh, 2), share: formatNumber(generatorShare, 0) })
        : powerSupplyType === 'generator'
          ? t('solarCalc.supplyGeneratorDetailed', { cost: formatNumber(generatorCostPerKwh, 2) })
          : t('solarCalc.supplyNoGrid');

    const inputsLine = [
      t('solarCalc.whatsappUse', { value: formatPrimaryUseLabel(primaryUse) }),
      t('solarCalc.whatsappGrid', { value: hasGrid ? t('solarCalc.yes') : t('solarCalc.no') }),
      t('solarCalc.whatsappBackup', { value: wantBackup ? t('solarCalc.yes') : t('solarCalc.no') }),
      t('solarCalc.whatsappSupply', { value: supplyLabel }),
      typeof monthlyKWh === 'number' ? t('solarCalc.whatsappMonthlyKwh', { value: formatNumber(monthlyKWh, 0) }) : undefined,
      typeof monthlyBill === 'number' ? t('solarCalc.whatsappMonthlyBill', { value: formatNumber(monthlyBill, 2) }) : undefined,
      typeof availableArea === 'number' ? t('solarCalc.whatsappArea', { value: formatNumber(availableArea, 0) }) : undefined,
      t('solarCalc.whatsappPsh', { value: formatNumber(peakSunHours, 1) }),
      t('solarCalc.whatsappPanelTier', { value: panelTier }),
    ].filter(Boolean).join(' | ');

    if (!calc.ok || !calc.data) {
      return `${t('solarCalc.whatsappReference')}\n${t('solarCalc.whatsappInputs')}: ${inputsLine}\n${t('solarCalc.whatsappCalcMissing')}`;
    }

    const d = calc.data;
    const summary = [
      t('solarCalc.whatsappSystem', { type: formatSystemType(d.systemType), kw: formatNumber(d.systemKw, 1), panels: formatNumber(d.panels, 0) }),
      t('solarCalc.whatsappTotalCost', { cost: formatNumber(d.totalSystemCost, 0) }),
      d.batteryKwhNeeded ? t('solarCalc.whatsappBattery', { kwh: formatNumber(d.batteryKwhNeeded, 1), cost: formatNumber(d.batteryCost, 0) }) : undefined,
      t('solarCalc.whatsappSavings', { savings: formatNumber(d.annualSavingsSar, 0), payback: d.paybackYears === Infinity ? t('solarCalc.na') : `${formatNumber(d.paybackYears, 2)}` }),
      t('solarCalc.whatsappTariff', { tariff: formatNumber(d.effectiveKwhPrice, 3) }),
    ].filter(Boolean).join('\n');

    return `${t('solarCalc.whatsappReference')}\n${t('solarCalc.whatsappInputs')}: ${inputsLine}\n${summary}`;
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

  const handlePrintRecommendation = () => {
    window.print();
  };

  const handleShareLink = async (e?: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (e) e.preventDefault();
    const shareUrl = buildShareUrl();
    try {
      if (navigator.share) {
        await navigator.share({ title: t('solarCalc.shareTitle'), url: shareUrl });
        return;
      }
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(shareUrl);
        window.alert(t('solarCalc.shareCopied'));
        return;
      }
    } catch (err) {
      console.error(t('solarCalc.shareFailed'), err);
    }
    window.prompt(t('solarCalc.shareCopyPrompt'), shareUrl);
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

    // If generator-only/no-grid and user provided only a bill, derive kWh from generator cost
    let derivedMonthlyKWh = nextInput.monthlyKWh;
    if ((nextInput.powerSupplyType === 'generator' || nextInput.powerSupplyType === 'none')
      && (!derivedMonthlyKWh || derivedMonthlyKWh <= 0)
      && typeof nextInput.monthlyBill === 'number' && nextInput.monthlyBill > 0
      && typeof nextInput.generatorCostPerKwh === 'number' && nextInput.generatorCostPerKwh > 0) {
      derivedMonthlyKWh = nextInput.monthlyBill / nextInput.generatorCostPerKwh;
    }
    nextInput.monthlyKWh = derivedMonthlyKWh;

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

  useEffect(() => {
    const validInput = (typeof monthlyKWh === 'number' && monthlyKWh > 0) || (typeof monthlyBill === 'number' && monthlyBill > 0);
    if (!validInput) return;
    runCalculation({}, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  return (
    <>
      <HeaderBanner title={t('solarCalc.title')} subtitle={t('solarCalc.subtitle')} backgroundImage="/src/assets/hero-bg-2.jpg" />

      <section className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-md-11">
            <div className="row">
              <div className="col-md-7">
                <div className="card card-form-holder p-4">
                  <h4 className='display-6 text-center mb-4'>
                    <FontAwesomeIcon icon={faSolarPanel} className='text-primary me-2' />
                    {t('solarCalc.plannerHeading')}
                  </h4>
                  <form className='row align-items-baseline' onSubmit={handleSubmit}>


                    <div className='col-12 d-flex flex-wrap justify-content-between mb-3'>
                      <div className='row'>

                        <div className="col mb-3">
                          <div className='card p-2 input-card'>

                            <label className="form-label d-flex align-items-center flex-column">
                              <FontAwesomeIcon icon={faTachometerAlt} className='fa-2x text-primary me-1' />
                              <small className='text-center'>{t('solarCalc.consumption')}</small>
                            </label>
                            <input type="number" className="form-control text-center" value={monthlyKWh as any} onChange={e => setMonthlyKWh(e.target.value === '' ? '' : Number(e.target.value))} min={0} />

                            <div className="d-flex justify-content-end">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id="syncConsumption"
                                  checked={syncConsumption}
                                  onChange={e => {
                                    const next = e.target.checked;
                                    setSyncConsumption(next);
                                    if (next) setSyncBill(false);
                                  }}
                                />
                                <label className="form-check-label small" htmlFor="syncConsumption">{t('solarCalc.syncedFromBill')}</label>
                              </div>
                            </div>
                            <small className="form-text text-muted helper-text">
                              {t('solarCalc.monthlyKwhHelper')}
                            </small>
                          </div>

                        </div>

                        <div className="col mb-3">
                          <div className='card p-2 input-card'>

                            <label className="form-label d-flex align-items-center flex-column">
                              {/* <span className='fs-5 text-primary fw-bold me-1'>&#x20C1;</span> */}
                              <FontAwesomeIcon icon={faMoneyBill} className='fa-2x text-primary me-1' />

                              <small className='text-center'>{t('solarCalc.bill')}</small>
                            </label>
                            <div className={`input-group ${isRtl ? 'flex-row-reverse' : ''}`}>
                              <input type="number" className="form-control text-center" value={monthlyBill as any} onChange={e => setMonthlyBill(e.target.value === '' ? '' : Number(e.target.value))} min={0} />
                              <span className="input-group-text text-primary bg-white">&#x20C1;</span>
                            </div>

                            <div className="d-flex justify-content-end">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id="syncBill"
                                  checked={syncBill}
                                  onChange={e => {
                                    const next = e.target.checked;
                                    setSyncBill(next);
                                    if (next) setSyncConsumption(false);
                                  }}
                                />
                                <label className="form-check-label small" htmlFor="syncBill">{t('solarCalc.syncedFromKwh')}</label>
                              </div>
                            </div>

                            <small className="form-text text-muted helper-text">
                              {t('solarCalc.monthlyBillHelper')}
                            </small>
                          </div>
                        </div>

                        <div className="col mb-3">
                          <div className='card p-2 input-card'>
                            <label className="form-label d-flex align-items-center flex-column">
                              <FontAwesomeIcon icon={faRulerCombined} className='fa-2x text-primary me-1' />
                              <small className='text-center'>{t('solarCalc.area')}</small>
                            </label>
                            <input type="number" className="form-control text-center" value={availableArea as any} onChange={e => setAvailableArea(e.target.value === '' ? '' : Number(e.target.value))} min={0} />
                            <small className="form-text text-muted helper-text">
                              {t('solarCalc.areaHelper')}
                            </small>
                          </div>
                        </div>

                        {showAdvanced && (
                          <div className="col mb-3">
                            <div className='card p-2 input-card'>
                              <label className="form-label d-flex align-items-center flex-column">
                                <FontAwesomeIcon icon={faSun} className='fa-2x text-primary me-1' />
                                <small className='text-center'>{t('solarCalc.pshLabel')}</small>
                              </label>
                              <input
                                type="number"
                                className="form-control text-center"
                                value={peakSunHours}
                                onChange={e => {
                                  const next = Number(e.target.value);
                                  if (!Number.isFinite(next)) {
                                    setPeakSunHours(5);
                                    return;
                                  }
                                  const clamped = Math.min(Math.max(next, 2), 7);
                                  setPeakSunHours(clamped);
                                }}
                                min={2}
                                max={7}
                                step={0.1}
                              />
                              <small className="form-text text-muted helper-text">
                                {t('solarCalc.pshHelper')}
                              </small>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-12 mb-3">
                      <div className="mb-3 mt-4">
                        <h3 className='display-1 fs-4'>
                          <FontAwesomeIcon icon={faHome} className='text-primary' />
                          {t('solarCalc.siteType')}
                        </h3>
                        <div className='card p-3'>
                          <div className='row justify-content-center flex-row'>

                            <div className='col'>
                              <input type="radio" className="btn-check" name='primaryUse' id="btn-check-home" value="home" autoComplete="off"
                                onChange={e => setPrimaryUse(e.target.value)}
                                checked={primaryUse === 'home'}
                              />
                              <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-home">
                                <FontAwesomeIcon icon={faHome} className='fa-2x m-1' />
                                <span>{t('solarCalc.siteHome')}</span>
                              </label>
                            </div>

                            <div className='col'>
                              <input type="radio" className="btn-check" name='primaryUse' id="btn-check-bank" value="bank" autoComplete="off"
                                onChange={e => setPrimaryUse(e.target.value)}
                                checked={primaryUse === 'bank'}
                              />
                              <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-bank">
                                <FontAwesomeIcon icon={faBank} className='fa-2x m-1' />
                                <span>{t('solarCalc.siteBank')}</span>
                              </label>
                            </div>

                            <div className='col'>
                              <input type="radio" className="btn-check" name='primaryUse' id="btn-check-hospital" value="hospital" autoComplete="off"
                                onChange={e => setPrimaryUse(e.target.value)}
                                checked={primaryUse === 'hospital'}
                              />
                              <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-hospital">
                                <FontAwesomeIcon icon={faHospital} className='fa-2x m-1' />
                                <span>{t('solarCalc.siteHospital')}</span>
                              </label>
                            </div>

                            <div className='col'>
                              <input type="radio" className="btn-check" name='primaryUse' id="btn-check-tractor" value="agricultural" autoComplete="off"
                                onChange={e => setPrimaryUse(e.target.value)}
                                checked={primaryUse === 'agricultural'}
                              />
                              <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-tractor">
                                <FontAwesomeIcon icon={faTractor} className='fa-2x m-1' />
                                <span>{t('solarCalc.siteAgricultural')}</span>
                              </label>
                            </div>


                            <div className='col'>
                              <input type="radio" className="btn-check" name='primaryUse' id="btn-check-industry" value="industry" autoComplete="off"
                                onChange={e => setPrimaryUse(e.target.value)}
                                checked={primaryUse === 'industry'}
                              />
                              <label className="btn btn-outline-primary d-flex align-items-center flex-column" htmlFor="btn-check-industry">
                                <FontAwesomeIcon icon={faIndustry} className='fa-2x m-1' />
                                <span>{t('solarCalc.siteIndustrial')}</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {showAdvanced && primaryUse === 'industry' && (
                        <div className="mb-3">
                          <div className="border rounded p-3">
                            <div className="fw-bold mb-2">{t('solarCalc.industrialOptions')}</div>
                            <div className="row g-2">
                              <div className="col-md-6">
                                <label className="form-label">{t('solarCalc.fuelCompBand')}</label>
                                <select
                                  className="form-select"
                                  value={industryFuelCompBand}
                                  onChange={e => setIndustryFuelCompBand(e.target.value as IndustryFuelCompBand)}
                                // disabled={!hasGrid} Disable if grid is not available
                                >
                                  <option value="standard">{t('solarCalc.industrialStandard')}</option>
                                  <option value="lte20">{t('solarCalc.fuelCompLte20')}</option>
                                  <option value="gt20">{t('solarCalc.fuelCompGt20')}</option>
                                </select>
                              </div>

                              <div className="col-md-6">
                                <label className="form-label">{t('solarCalc.connectionType')}</label>
                                <select
                                  className="form-select"
                                  value={industryConnection}
                                  onChange={e => setIndustryConnection(e.target.value as IndustryConnection)}
                                  disabled={industryFuelCompBand === 'standard' || !hasGrid} // Disable if standard or no grid
                                >
                                  <option value="grid">{t('solarCalc.gridConnected')}</option>
                                  <option value="powerPlant">{t('solarCalc.powerPlantConnected')}</option>
                                </select>
                                {industryFuelCompBand === 'standard' && (
                                  <div className="form-text">{t('solarCalc.industrialStandardNote')}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className='col-md-12'>
                      <h3 className='display-1 fs-4'>
                        <FontAwesomeIcon icon={faBolt} className='text-primary' />
                        {t('solarCalc.powerBackupOptions')}
                      </h3>
                      <div className='card p-3 mb-3'>

                        <div className="mt-2">
                          <div className="fw-semibold mb-2">{t('solarCalc.currentPowerSupply')}</div>
                          <div className="d-flex flex-wrap gap-2">
                            <div className="form-check form-check-inline border rounded px-3 py-2">
                              <input className="form-check-input" type="radio" name="powerSupply" id="ps-grid" value="grid" checked={powerSupplyType === 'grid'} onChange={() => setPowerSupplyType('grid')} />
                              <label className="form-check-label" htmlFor="ps-grid">{t('solarCalc.gridOnly')}</label>
                            </div>
                            <div className="form-check form-check-inline border rounded px-3 py-2">
                              <input className="form-check-input" type="radio" name="powerSupply" id="ps-generator" value="generator" checked={powerSupplyType === 'generator'} onChange={() => setPowerSupplyType('generator')} />
                              <label className="form-check-label" htmlFor="ps-generator">{t('solarCalc.generatorOnly')}</label>
                            </div>
                            <div className="form-check form-check-inline border rounded px-3 py-2">
                              <input className="form-check-input" type="radio" name="powerSupply" id="ps-mixed" value="mixed" checked={powerSupplyType === 'mixed'} onChange={() => setPowerSupplyType('mixed')} />
                              <label className="form-check-label" htmlFor="ps-mixed">{t('solarCalc.mixed')}</label>
                            </div>
                            <div className="form-check form-check-inline border rounded px-3 py-2">
                              <input className="form-check-input" type="radio" name="powerSupply" id="ps-none" value="none" checked={powerSupplyType === 'none'} onChange={() => setPowerSupplyType('none')} />
                              <label className="form-check-label" htmlFor="ps-none">{t('solarCalc.none')}</label>
                            </div>
                          </div>

                          {(powerSupplyType === 'generator' || powerSupplyType === 'mixed' || (powerSupplyType === 'none' && typeof monthlyBill === 'number' && monthlyBill > 0)) && (
                            <div className="row g-2 mt-2">
                              <div className="col-md-6">
                                <label className="form-label">{t('solarCalc.generatorCost')}</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={generatorCostPerKwh}
                                  onChange={e => setGeneratorCostPerKwh(Number(e.target.value) || 0)}
                                  min={0}
                                  step={0.05}
                                />
                                <div className="form-text">{t('solarCalc.generatorCostHelp')}{powerSupplyType === 'none' ? ' ' + t('solarCalc.generatorCostHelpNoGrid') : ''}</div>
                              </div>
                              {powerSupplyType === 'mixed' && (
                                <div className="col-md-6">
                                  <label className="form-label">{t('solarCalc.generatorShare')}</label>
                                  <div className={`input-group ${isRtl ? 'flex-row-reverse' : ''}`}>
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
                                  <div className="form-text">{t('solarCalc.generatorShareHelp')}</div>
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
                            {t('solarCalc.outageQuestion')}</label>
                        </div>

                        <div className="form-check form-switch mb-2">
                          <input className="form-check-input" type="checkbox" role="switch" id="hugeBill" checked={hugeBill} onChange={e => setHugeBill(e.target.checked)} />
                          <label className="form-check-label" htmlFor="hugeBill">
                            <FontAwesomeIcon icon={faHandHoldingUsd} className='text-warning' />
                            {t('solarCalc.highBillQuestion')}</label>
                        </div>




                      </div>
                    </div>



                    {showAdvanced && (
                      <div className='col-md-6'>
                        <div className="mb-3">
                          <label className="form-label d-flex align-items-center gap-2"><FontAwesomeIcon icon={faSolarPanel} className='text-primary' /> {t('solarCalc.panelPriceCategory')}</label>
                          <div className="d-flex flex-wrap gap-2 flex-column">
                            {(['economy', 'standard', 'premium'] as const).map(key => (
                              <div key={key} className='form-check form-check-inline border rounded px-3 py-2'>
                                <input className="form-check-input" type="radio" name="panelTier" id={`panel-${key}`} value={key} checked={panelTier === key} onChange={e => setPanelTier(e.target.value as PanelTierKey)} />
                                <label className="form-check-label" htmlFor={`panel-${key}`}>
                                  <span className='fw-bold text-capitalize'>{t(`solarCalc.panelTier.${key}.label`)}</span>
                                  <span className='d-block small text-muted'>{t('solarCalc.panelTierCostLine', { cost: PANEL_PRICING[key].costPerPanel, note: t(`solarCalc.panelTier.${key}.note`) })}</span>
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
                          {t('solarCalc.showAdvanced')}</label>
                      </div>
                      <div className="d-flex w-100 justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={handleShareLink}
                          title={t('solarCalc.shareLinkHelp')}
                        >
                          {t('solarCalc.shareLink')}
                        </button>
                        <button className="btn btn-primary d-flex w-100 justify-content-center flex-row align-items-center" type="submit">
                          <FontAwesomeIcon icon={faSave} className='fa-3x' />
                          <small className='ms-2'>
                            {t('solarCalc.saveCompare')}
                          </small>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="col-md-5">
                <div className="card card-form-holder p-4" id="recommendationPrint">
                  <div className="mt-4">
                    <div className="print-only print-brand">
                      <img src="/src/assets/solar/solar-logo-icon.png" alt="AQTRACO" />
                      <img src="/src/assets/solar/solar-logo-txt.png" alt="AQTRACO" />
                    </div>
                    <h4 className='display-6 text-center mb-4'>
                      <FontAwesomeIcon icon={faHandHoldingUsd} className='text-primary me-2' />
                      {t('solarCalc.recommendation')}
                    </h4>
                    {result && (
                      <>
                        <div className='container' style={{ whiteSpace: 'pre-wrap' }}>
                          {result}
                        </div>
                        <p className="mt-3 text-muted">
                          {t('solarCalc.approxNotice')}
                        </p>
                        <div className="print-only print-qr">
                          <div className="mb-2">
                            <a href={pageUrl} title={t('solarCalc.backToCalculator')}>{pageUrl || 'https://aqtraco.com/solar-solutions'}</a>
                          </div>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pageUrl || 'https://aqtraco.com/solar-solutions')}`}
                            alt="QR to calculator"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handlePrintRecommendation}
                          className="btn btn-outline-secondary w-100 mt-2 no-print"
                          title={t('solarCalc.printRecommendationTitle')}
                        >
                          <FontAwesomeIcon icon={faPrint} className='me-2' />
                          {t('solarCalc.printRecommendation')}
                        </button>
                      </>
                    )}
                    <a
                      href="#"
                      onClick={handleWhatsAppClick}
                      className="btn btn-success btn-lg w-100 mt-3 no-print"
                      title={t('solarCalc.whatsappCta')}
                    >
                      <FontAwesomeIcon icon={faWhatsapp} className='me-2' />
                      {t('solarCalc.whatsappCta')}
                    </a>
                  </div>
                  <Link to="/solar-solutions" className="btn my-2 btn-outline-secondary no-print">{t('solarCalc.backToSolar')}</Link>
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
                  <h5 className="card-title mb-0">
                    <FontAwesomeIcon icon={faSave} className='text-primary me-2' />
                    {t('solarCalc.savedCalcs')}
                  </h5>
                  <small className="text-muted">{t('solarCalc.savedCalcsHelp')}</small>
                </div>
                {history.length === 0 ? (
                  <div className="text-muted">{t('solarCalc.noCalcs')}</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead>
                        <tr>
                          <th>{t('solarCalc.table.use')}</th>
                          <th>{t('solarCalc.table.type')}</th>
                          <th>{t('solarCalc.table.size')}</th>
                          <th>{t('solarCalc.table.panels')}</th>
                          <th>{t('solarCalc.table.totalCost')}</th>
                          <th>{t('solarCalc.table.battery')}</th>
                          <th>{t('solarCalc.table.actions')}</th>
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
                                    <tr key={entry.id} className="align-middle" style={{ cursor: 'pointer' }} onClick={() => handleSelectHistory(entry)} title={t('solarCalc.table.selectRow')}>
                              <td><FontAwesomeIcon icon={useIcon} className='text-primary' /></td>
                              <td>{formatSystemType(data.systemType)}</td>
                              <td>{formatNumber(data.systemKw, 1)}</td>
                              <td>{formatNumber(data.panels, 0)}</td>
                              <td>{formatNumber(data.totalSystemCost, 0)}</td>
                              <td>{data.batteryKwhNeeded ? formatNumber(data.batteryKwhNeeded, 1) : '-'}</td>
                              <td className="d-flex gap-2">
                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={(e) => { e.stopPropagation(); handleRemoveHistory(entry.id); }} title={t('solarCalc.table.remove')}>
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
