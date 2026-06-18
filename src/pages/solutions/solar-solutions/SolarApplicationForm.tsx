import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderBanner from '@/components/HeaderBanner';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faBank, faTractor, faIndustry, faHome, faSolarPanel, faSave, faHospital, faSlash, faHandHolding, faHandHoldingUsd, faRulerCombined, faDollarSign, faTachometerAlt, faMoneyBill, faCarBattery, faExclamationTriangle, faSun, faTrash, faPrint, faNetworkWired } from '@fortawesome/free-solid-svg-icons';
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
  type SolarEstimateData,
  type SystemType,
} from '@/lib/saudiElectricityTariffs';

import './SolarApplicationForm.css';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const SolarApplicationForm: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const lang = i18n.language === 'ar' ? 'ar' : 'en';
  const [calcMethod, setCalcMethod] = useState<'consumption' | 'systemSize' | 'equipmentLoad'>('consumption');
  const [targetSystemKw, setTargetSystemKw] = useState<number | ''>('');
  const [equipmentLoadKw, setEquipmentLoadKw] = useState<number | ''>('');
  const [equipmentRunHours, setEquipmentRunHours] = useState<number | ''>('');
  const [monthlyKWh, setMonthlyKWh] = useState<number | ''>('');
  const [monthlyBill, setMonthlyBill] = useState<number | ''>('');
  const [availableArea, setAvailableArea] = useState<number | ''>('');
  const [hasGrid, setHasGrid] = useState<boolean>(true);
  const [wantBackup, setWantBackup] = useState<boolean>(false);
  const [connectionType, setConnectionType] = useState<'onGrid' | 'offGrid' | 'hybrid' | 'pumping'>('onGrid');
  const [customBatteryKwh, setCustomBatteryKwh] = useState<number | ''>('');
  const [isBatteryOverridden, setIsBatteryOverridden] = useState<boolean>(false);
  const [calculatedData, setCalculatedData] = useState<SolarEstimateData | null>(null);
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
  const [splitMeters, setSplitMeters] = useState<boolean>(false);
  const [metersCount, setMetersCount] = useState<number>(1);
  const [clientCompany, setClientCompany] = useState<string>('');
  const [clientContact, setClientContact] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [quoteRef, setQuoteRef] = useState<string>('');
  const [quoteDate, setQuoteDate] = useState<string>('');
  const [quoteValidUntil, setQuoteValidUntil] = useState<string>('');
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
    if (connectionType === 'pumping') return t('solarCalc.recommendedType.pumping');
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
    params.set('cmeth', calcMethod);
    if (calcMethod === 'systemSize' && typeof targetSystemKw === 'number' && targetSystemKw > 0) params.set('tskw', String(targetSystemKw));
    if (calcMethod === 'equipmentLoad') {
      if (typeof equipmentLoadKw === 'number' && equipmentLoadKw > 0) params.set('elkw', String(equipmentLoadKw));
      if (typeof equipmentRunHours === 'number' && equipmentRunHours > 0) params.set('erh', String(equipmentRunHours));
    }
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
    params.set('connType', connectionType);
    params.set('split', String(splitMeters ? 1 : 0));
    params.set('mcount', String(metersCount));
    if (clientCompany) params.set('ccomp', clientCompany);
    if (clientContact) params.set('ccont', clientContact);
    if (clientPhone) params.set('cphone', clientPhone);
    if (clientEmail) params.set('cmail', clientEmail);
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
      calcMethod?: 'consumption' | 'systemSize' | 'equipmentLoad';
      targetSystemKw?: number;
      equipmentLoadKw?: number;
      equipmentRunHours?: number;
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
      connectionType?: 'onGrid' | 'offGrid' | 'hybrid' | 'pumping';
      customBatteryKwh?: number | '';
      isBatteryOverridden?: boolean;
      generatorCostPerKwh?: number;
      generatorShare?: number;
      splitMeters?: boolean;
      metersCount?: number;
      clientCompany?: string;
      clientContact?: string;
      clientPhone?: string;
      clientEmail?: string;
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
    const d = new Date();
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const random = Math.floor(100 + Math.random() * 900);
    setQuoteRef(prev => prev || `AQ-SOL-${yy}${mm}${dd}-${random}`);

    // Format quote date
    const dateStr = d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setQuoteDate(dateStr);

    // Format valid date (30 days later)
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 30);
    const validStr = validDate.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setQuoteValidUntil(validStr);
  }, [lang]);

  useEffect(() => {
    document.body.classList.add('solar-calculator-page');
    return () => {
      document.body.classList.remove('solar-calculator-page');
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const cmeth = params.get('cmeth');
    const tskw = params.get('tskw');
    const elkw = params.get('elkw');
    const erh = params.get('erh');
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
    const connType = params.get('connType');
    const split = params.get('split');
    const mcount = params.get('mcount');
    const ccomp = params.get('ccomp');
    const ccont = params.get('ccont');
    const cphone = params.get('cphone');
    const cmail = params.get('cmail');

    if (cmeth && (['consumption', 'systemSize', 'equipmentLoad'] as const).includes(cmeth as any)) setCalcMethod(cmeth as any);
    if (tskw !== null && !Number.isNaN(Number(tskw))) setTargetSystemKw(Number(tskw));
    if (elkw !== null && !Number.isNaN(Number(elkw))) setEquipmentLoadKw(Number(elkw));
    if (erh !== null && !Number.isNaN(Number(erh))) setEquipmentRunHours(Math.min(24, Math.max(0, Number(erh))));
    if (mkwh !== null && !Number.isNaN(Number(mkwh))) setMonthlyKWh(Number(mkwh));
    if (mbill !== null && !Number.isNaN(Number(mbill))) setMonthlyBill(Number(mbill));
    if (area !== null && !Number.isNaN(Number(area))) setAvailableArea(Number(area));
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
    if (split !== null) setSplitMeters(parseBool(split));
    if (mcount !== null && !Number.isNaN(Number(mcount))) setMetersCount(Number(mcount));
    if (ccomp !== null) setClientCompany(ccomp);
    if (ccont !== null) setClientContact(ccont);
    if (cphone !== null) setClientPhone(cphone);
    if (cmail !== null) setClientEmail(cmail);

    const resolvedGrid = grid !== null ? parseBool(grid) : true;
    const resolvedBackup = backup !== null ? parseBool(backup) : false;
    const resolvedUse = use || 'home';
    if (connType && (['onGrid', 'offGrid', 'hybrid', 'pumping'] as const).includes(connType as any)) {
      setConnectionType(connType as any);
    } else {
      if (resolvedUse === 'agricultural') {
        if (!resolvedGrid) {
          setConnectionType('pumping');
        } else if (resolvedBackup) {
          setConnectionType('hybrid');
        } else {
          setConnectionType('onGrid');
        }
      } else {
        if (!resolvedGrid) {
          setConnectionType('offGrid');
        } else if (resolvedBackup) {
          setConnectionType('hybrid');
        } else {
          setConnectionType('onGrid');
        }
      }
    }
  }, []);

  useEffect(() => {
    if (connectionType === 'onGrid') {
      setHasGrid(true);
      setWantBackup(false);
    } else if (connectionType === 'offGrid') {
      setHasGrid(false);
      setWantBackup(false);
    } else if (connectionType === 'hybrid') {
      setHasGrid(true);
      setWantBackup(true);
    } else if (connectionType === 'pumping') {
      setHasGrid(false);
      setWantBackup(false);
    }
  }, [connectionType]);

  useEffect(() => {
    if (primaryUse !== 'agricultural') {
      if (connectionType === 'pumping') {
        setConnectionType('hybrid');
      }
    }
  }, [primaryUse]);

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
    if (connectionType === 'offGrid') recommendedType = <><FontAwesomeIcon icon={faCarBattery} className='text-primary me-1' /> {t('solarCalc.recommendedType.offGrid')}</>;
    else if (connectionType === 'hybrid') recommendedType = <><FontAwesomeIcon icon={faSolarPanel} className='text-primary me-1' /> {t('solarCalc.recommendedType.hybrid')}</>;
    else if (connectionType === 'pumping') recommendedType = <><FontAwesomeIcon icon={faTractor} className='text-primary me-1' /> {t('solarCalc.recommendedType.pumping')}</>;

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
                    <li>{t('solarCalc.hugeBillTip1')}</li>
                    <li>{t('solarCalc.hugeBillTip2')}</li>
                    <li>{t('solarCalc.hugeBillTip3')}</li>
                    <li>{t('solarCalc.hugeBillTip4')}</li>
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
                  {data.batteryKwhNeeded > 0 && (data as any).autonomyHours > 0 && (
                    <li className="text-success fw-semibold">
                      {isRtl 
                        ? `سعة البطارية توفر تغطية تشغيلية تقديرية لـ ${formatNumber((data as any).autonomyHours, 1)} ساعة` 
                        : `Battery capacity provides approximately ${formatNumber((data as any).autonomyHours, 1)} hours of backup runtime`
                      }
                    </li>
                  )}
                  {data.inverterUpgradeAdder > 0 && (
                    <li>{t('solarCalc.systemCostInverter', { cost: formatNumber(data.inverterUpgradeAdder, 0) })}</li>
                  )}
                  {splitMeters && metersCount > 1 && (
                    <li>
                      {lang === 'ar'
                        ? `إضافة تقسيم العدادات (${metersCount} عدادات): +${formatNumber((data as any).splitMetersCost, 0)} ريال`
                        : `Multi-meter split adder (${metersCount} meters): +${formatNumber((data as any).splitMetersCost, 0)} SAR`
                      }
                    </li>
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

        {/* Technical Quotation / BOQ Breakdown */}
        <div className="row mt-3 print-boq-section">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body p-3">
                <h6 className="card-title fw-bold mb-3 border-bottom pb-2 d-flex justify-content-between align-items-center">
                  <span>
                    <FontAwesomeIcon icon={faSave} className="text-success me-2 animate-pulse" />
                    {lang === 'ar' ? 'تفاصيل بنود العرض والمكونات (BOQ):' : 'Technical Quotation & BOQ Breakdown:'}
                  </span>
                  {splitMeters && metersCount > 1 && (
                    <span className="badge bg-warning text-dark fs-6" style={{ fontSize: '0.75rem' }}>
                      {lang === 'ar' ? `مقسم على ${metersCount} عدادات` : `Split across ${metersCount} meters`}
                    </span>
                  )}
                </h6>
                <div className="table-responsive">
                  <table className="table table-bordered table-sm small mb-0 align-middle" style={{ fontSize: '0.8rem' }}>
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '5%' }} className="text-center">#</th>
                        <th style={{ width: '25%' }}>{lang === 'ar' ? 'بند النظام' : 'System Component'}</th>
                        <th style={{ width: '55%' }}>{lang === 'ar' ? 'المواصفات الفنية المعتمدة' : 'Technical Specifications'}</th>
                        <th style={{ width: '15%' }} className="text-center">{lang === 'ar' ? 'الكمية' : 'Qty'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 1. Solar Panels */}
                      <tr>
                        <td className="text-center">1</td>
                        <td className="fw-bold">{lang === 'ar' ? 'الألواح الشمسية الضوئية' : 'PV Solar Panels'}</td>
                        <td>
                          {lang === 'ar' 
                            ? `ألوح شمسية أحادية البلورة عالية الكفاءة (A-Grade Mono) من الفئة ${selectedPricing.label} بقدرة ${selectedPricing.wattage} واط لكل لوح.`
                            : `High-efficiency Monocrystalline A-Grade PV Modules (${selectedPricing.label} tier, ${selectedPricing.wattage}W per panel).`
                          }
                          {splitMeters && metersCount > 1 && (
                            <div className="small text-muted mt-1">
                              {lang === 'ar' 
                                ? `موزعة: ~${Math.round(data.panels / metersCount)} لوح لكل عداد/عاكس`
                                : `Distributed: ~${Math.round(data.panels / metersCount)} panels per meter/inverter`
                              }
                            </div>
                          )}
                        </td>
                        <td className="text-center fw-semibold">{data.panels} {lang === 'ar' ? 'لوح' : 'Pcs'}</td>
                      </tr>

                      {/* 2. Inverters / Converters */}
                      <tr>
                        <td className="text-center">2</td>
                        <td className="fw-bold">{lang === 'ar' ? 'محولات الطاقة (العواكس)' : 'Inverters / Converters'}</td>
                        <td>
                          {splitMeters && metersCount > 1 ? (
                            lang === 'ar' 
                              ? `عواكس طاقة شمسية ذكية بقدرة ${(data.systemKw / metersCount).toFixed(1)} كيلوواط لكل عداد، متوافقة مع متطلبات الربط والتشغيل.`
                              : `Smart Solar Inverters rated at ${(data.systemKw / metersCount).toFixed(1)} kW per meter, matching electrical integration criteria.`
                          ) : (
                            lang === 'ar'
                              ? `عاكس طاقة شمسية ذكي بقدرة ${Math.ceil(data.systemKw)} كيلوواط متوافق مع نظام التشغيل المختار.`
                              : `Smart Solar Inverter rated at ${Math.ceil(data.systemKw)} kW matching selected system specifications.`
                          )}
                          <div className="small text-muted mt-1">
                            {connectionType === 'hybrid' 
                              ? (lang === 'ar' ? 'نوع العاكس: هجين (Hybrid) مع وحدة التحكم الذكية وإدارة البطاريات' : 'Inverter type: Hybrid with Intelligent Energy controller & BMS management')
                              : connectionType === 'offGrid'
                              ? (lang === 'ar' ? 'نوع العاكس: منفصل عن الشبكة (Off-Grid) مع شواحن تنظيم الأحمال' : 'Inverter type: Off-Grid Standalone with charge controller integration')
                              : connectionType === 'pumping'
                              ? (lang === 'ar' ? 'نوع العاكس: عاكس تشغيل مضخة ذكي مع مغير التردد VFD المباشر' : 'Inverter type: Smart Solar Pump controller with built-in VFD driver')
                              : (lang === 'ar' ? 'نوع العاكس: متصل بالشبكة (On-Grid) فئة الخدمة العامة' : 'Inverter type: On-Grid Utility scale inverter')
                            }
                          </div>
                        </td>
                        <td className="text-center fw-semibold">
                          {splitMeters && metersCount > 1 
                            ? `${metersCount} ${lang === 'ar' ? 'وحدات' : 'Sets'}` 
                            : `1 ${lang === 'ar' ? 'وحدة' : 'Set'}`
                          }
                        </td>
                      </tr>

                      {/* 3. Batteries (Only if hybrid or offGrid) */}
                      {data.batteryKwhNeeded > 0 && (
                        <tr>
                          <td className="text-center">3</td>
                          <td className="fw-bold">{lang === 'ar' ? 'بطاريات التخزين (الليثيوم)' : 'Lithium Backup Batteries'}</td>
                          <td>
                            {lang === 'ar'
                              ? `نظام بطاريات ليثيوم حديد فوسفات (LiFePO4) بسعة إجمالية ${formatNumber(data.batteryKwhNeeded, 1)} كيلوواط ساعة مع نظام إدارة البطارية الذكي BMS.`
                              : `Lithium Iron Phosphate (LiFePO4) Battery Storage system with total capacity of ${formatNumber(data.batteryKwhNeeded, 1)} kWh, built-in smart BMS.`
                            }
                            {splitMeters && metersCount > 1 && (
                              <div className="small text-muted mt-1">
                                {lang === 'ar'
                                  ? `موزعة: ~${(data.batteryKwhNeeded / metersCount).toFixed(1)} كيلوواط ساعة لكل عداد/نظام`
                                  : `Distributed: ~${(data.batteryKwhNeeded / metersCount).toFixed(1)} kWh per meter/system`
                                }
                              </div>
                            )}
                          </td>
                          <td className="text-center fw-semibold">
                            {splitMeters && metersCount > 1 
                              ? `${metersCount} ${lang === 'ar' ? 'أنظمة' : 'Sets'}` 
                              : `1 ${lang === 'ar' ? 'نظام' : 'Set'}`
                            }
                          </td>
                        </tr>
                      )}

                      {/* 4. Mounting Structure */}
                      <tr>
                        <td className="text-center">{data.batteryKwhNeeded > 0 ? 4 : 3}</td>
                        <td className="fw-bold">{lang === 'ar' ? 'الهياكل وحوامل الألواح' : 'Mounting Structures'}</td>
                        <td>
                          {lang === 'ar'
                            ? 'هياكل تثبيت معدنية مجلفنة أو من الألمنيوم عالي المقاومة ومضاد للصدأ، مصممة لمقاومة سرعات الرياح الشديدة والظروف البيئية.'
                            : 'High-strength anodized aluminum or hot-dip galvanized steel mounting structures designed to withstand extreme wind velocities and weather conditions.'
                          }
                        </td>
                        <td className="text-center fw-semibold">1 {lang === 'ar' ? 'مجموعة' : 'Set'}</td>
                      </tr>

                      {/* 5. Cabling & Accessories */}
                      <tr>
                        <td className="text-center">{data.batteryKwhNeeded > 0 ? 5 : 4}</td>
                        <td className="fw-bold">{lang === 'ar' ? 'الكابلات والتوصيلات الكهربائية' : 'DC/AC Cabling & Accessories'}</td>
                        <td>
                          {lang === 'ar'
                            ? `كابلات طاقة شمسية خاصة (DC 4/6mm²)، كابلات المخرجات المترددة (AC)، قنوات حماية وتوصيلات معزولة مقاومة للشمس.`
                            : `Specialized DC solar cables (4/6mm²), AC output cables, UV-resistant conduits, cable trays, grounding accessories and connectors.`
                          }
                          {splitMeters && metersCount > 1 && (
                            <div className="small text-muted mt-1">
                              {lang === 'ar'
                                ? `تشمل كابلات ومجموعات إضافية للتوصيل المنفصل لـ ${metersCount} مسارات مختلفة`
                                : `Includes extra cabling lots for routing ${metersCount} separate connection lines`
                              }
                            </div>
                          )}
                        </td>
                        <td className="text-center fw-semibold">
                          {splitMeters && metersCount > 1 
                            ? `${metersCount} ${lang === 'ar' ? 'مجموعات' : 'Lot'}`
                            : `1 ${lang === 'ar' ? 'مجموعة' : 'Lot'}`
                          }
                        </td>
                      </tr>

                      {/* 6. Combiner boxes, ATS, Control Panels */}
                      <tr>
                        <td className="text-center">{data.batteryKwhNeeded > 0 ? 6 : 5}</td>
                        <td className="fw-bold">
                          {lang === 'ar' ? 'لوحات التحكم وحماية العدادات' : 'Protection Boxes & Control Panels'}
                        </td>
                        <td>
                          {lang === 'ar'
                            ? `لوحات تجميع وحماية (DC/AC Combiner Boxes) مع قواطع الحماية وموانع الصواعق (Surge Protection).`
                            : `Weatherproof DC/AC combiner protection boxes fitted with circuit breakers, fuses, surge protection devices (SPDs), and grounding.`
                          }
                          {connectionType === 'hybrid' && (
                            <div className="small text-muted mt-1">
                              {lang === 'ar' 
                                ? 'تتضمن لوحة التحويل التلقائي الذكي ATS لإدارة تغذية الحمل من البطارية/الشبكة'
                                : 'Includes Automatic Transfer Switch (ATS) cabinet for battery/grid load management'
                              }
                            </div>
                          )}
                          {splitMeters && metersCount > 1 && (
                            <div className="small text-muted mt-1 text-warning fw-semibold">
                              {lang === 'ar'
                                ? `يتطلب لوحة تحكم وتجميع مستقلة لكل عداد من الـ ${metersCount} عدادات`
                                : `Requires a separate protection combiner box for each of the ${metersCount} split meters`
                              }
                            </div>
                          )}
                        </td>
                        <td className="text-center fw-semibold">
                          {splitMeters && metersCount > 1 
                            ? `${metersCount} ${lang === 'ar' ? 'لوحات' : 'Sets'}`
                            : `1 ${lang === 'ar' ? 'لوحة' : 'Set'}`
                          }
                        </td>
                      </tr>

                      {/* 7. EPC Works */}
                      <tr>
                        <td className="text-center">{data.batteryKwhNeeded > 0 ? 7 : 6}</td>
                        <td className="fw-bold">{lang === 'ar' ? 'الهندسة والتركيب والاعتمادات' : 'EPC, Testing & Grid Integration'}</td>
                        <td>
                          {lang === 'ar'
                            ? 'الأعمال المدنية والميكانيكية للتركيب، المخططات الهندسية، الفحص والتشغيل والتنسيق للحصول على موافقات شركة الكهرباء SEC.'
                            : 'Site mechanical/civil works, system installation, engineering documentation, post-commissioning safety testing, and coordination for SEC utility approval.'
                          }
                        </td>
                        <td className="text-center fw-semibold">1 {lang === 'ar' ? 'عملية' : 'Job'}</td>
                      </tr>
                    </tbody>
                  </table>
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
      calcMethod,
      targetSystemKw: typeof targetSystemKw === 'number' ? targetSystemKw : undefined,
      equipmentLoadKw: typeof equipmentLoadKw === 'number' ? equipmentLoadKw : undefined,
      equipmentRunHours: typeof equipmentRunHours === 'number' ? equipmentRunHours : undefined,
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

    let derivedMonthlyKWh = nextInput.monthlyKWh;
    if (calcMethod === 'equipmentLoad') {
      if (typeof equipmentLoadKw === 'number' && typeof equipmentRunHours === 'number') {
        derivedMonthlyKWh = equipmentLoadKw * equipmentRunHours * 30;
      }
    } else if (calcMethod === 'systemSize') {
      if (typeof targetSystemKw === 'number') {
        const LOSSES = 0.85;
        derivedMonthlyKWh = targetSystemKw * LOSSES * peakSunHours * 30;
      }
    } else {
      if ((powerSupplyType === 'generator' || powerSupplyType === 'none')
        && (!derivedMonthlyKWh || derivedMonthlyKWh <= 0)
        && typeof monthlyBill === 'number' && monthlyBill > 0
        && typeof generatorCostPerKwh === 'number' && generatorCostPerKwh > 0) {
        derivedMonthlyKWh = monthlyBill / generatorCostPerKwh;
      }
    }

    const calc: SolarEstimateResult = computeSolarEstimate({
      monthlyKWh: derivedMonthlyKWh,
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
    let resolvedBatteryKwh = d.batteryKwhNeeded;
    
    if (connectionType === 'pumping') {
      resolvedBatteryKwh = 0;
    } else if (isBatteryOverridden && typeof customBatteryKwh === 'number') {
      resolvedBatteryKwh = customBatteryKwh;
    }

    const costPerKwh = connectionType === 'offGrid' || connectionType === 'pumping' ? 1700 : connectionType === 'hybrid' ? 1400 : 0;
    const newBatteryCost = resolvedBatteryKwh * costPerKwh;
    const upgradeFactor = connectionType === 'offGrid' || connectionType === 'pumping' ? 0.7 : connectionType === 'hybrid' ? 0.4 : 0;
    const newInverterUpgradeAdder = d.inverterInstallBase * upgradeFactor;
    const splitMetersCost = splitMeters && metersCount > 1 ? (metersCount - 1) * 800 : 0;

    d.batteryKwhNeeded = resolvedBatteryKwh;
    d.batteryCost = newBatteryCost;
    d.inverterUpgradeAdder = newInverterUpgradeAdder;
    d.totalSystemCost = d.packagePriceSar + newBatteryCost + newInverterUpgradeAdder + splitMetersCost;
    d.paybackYears = d.annualSavingsSar > 0 ? d.totalSystemCost / d.annualSavingsSar : Infinity;
    d.lifetimeNetSavings = d.lifetimeGrossSavings - d.totalSystemCost;
    const summary = [
      t('solarCalc.whatsappSystem', { type: formatSystemType(d.systemType), kw: formatNumber(d.systemKw, 1), panels: formatNumber(d.panels, 0) }),
      splitMeters && metersCount > 1 ? (lang === 'ar' ? `تقسيم النظام: على عدد ${metersCount} عدادات كهربائية` : `Split System: across ${metersCount} electric meters`) : undefined,
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
    const url = `https://wa.me/966565210897?text=${encodeURIComponent(msg)}`;
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
      calcMethod,
      targetSystemKw: typeof targetSystemKw === 'number' ? targetSystemKw : undefined,
      equipmentLoadKw: typeof equipmentLoadKw === 'number' ? equipmentLoadKw : undefined,
      equipmentRunHours: typeof equipmentRunHours === 'number' ? equipmentRunHours : undefined,
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
      splitMeters: payload?.splitMeters !== undefined ? payload.splitMeters : splitMeters,
      metersCount: payload?.metersCount !== undefined ? payload.metersCount : metersCount,
      clientCompany: payload?.clientCompany !== undefined ? payload.clientCompany : clientCompany,
      clientContact: payload?.clientContact !== undefined ? payload.clientContact : clientContact,
      clientPhone: payload?.clientPhone !== undefined ? payload.clientPhone : clientPhone,
      clientEmail: payload?.clientEmail !== undefined ? payload.clientEmail : clientEmail,
      ...payload,
    };

    let derivedMonthlyKWh = nextInput.monthlyKWh;
    if (calcMethod === 'equipmentLoad') {
      if (typeof equipmentLoadKw === 'number' && typeof equipmentRunHours === 'number') {
        derivedMonthlyKWh = equipmentLoadKw * equipmentRunHours * 30;
      }
    } else if (calcMethod === 'systemSize') {
      if (typeof targetSystemKw === 'number') {
        const LOSSES = 0.85; // Matches saudiElectricityTariffs.ts
        derivedMonthlyKWh = targetSystemKw * LOSSES * peakSunHours * 30;
      }
    } else {
      // If generator-only/no-grid and user provided only a bill, derive kWh from generator cost
      if ((nextInput.powerSupplyType === 'generator' || nextInput.powerSupplyType === 'none')
        && (!derivedMonthlyKWh || derivedMonthlyKWh <= 0)
        && typeof nextInput.monthlyBill === 'number' && nextInput.monthlyBill > 0
        && typeof nextInput.generatorCostPerKwh === 'number' && nextInput.generatorCostPerKwh > 0) {
        derivedMonthlyKWh = nextInput.monthlyBill / nextInput.generatorCostPerKwh;
      }
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
      setCalculatedData(null);
      return;
    }

    const data = calc.data;
    let resolvedBatteryKwh = data.batteryKwhNeeded;
    
    if (connectionType === 'pumping') {
      resolvedBatteryKwh = 0;
    } else if (isBatteryOverridden && typeof customBatteryKwh === 'number') {
      resolvedBatteryKwh = customBatteryKwh;
    }

    const costPerKwh = connectionType === 'offGrid' || connectionType === 'pumping' ? 1700 : connectionType === 'hybrid' ? 1400 : 0;
    const newBatteryCost = resolvedBatteryKwh * costPerKwh;
    
    const upgradeFactor = connectionType === 'offGrid' || connectionType === 'pumping' ? 0.7 : connectionType === 'hybrid' ? 0.4 : 0;
    const newInverterUpgradeAdder = data.inverterInstallBase * upgradeFactor;

    const splitMetersCost = splitMeters && metersCount > 1 ? (metersCount - 1) * 800 : 0;
    const newTotalSystemCost = data.packagePriceSar + newBatteryCost + newInverterUpgradeAdder + splitMetersCost;
    (data as any).splitMetersCost = splitMetersCost;
    
    let autonomyHours = 0;
    if (resolvedBatteryKwh > 0) {
      const dailyKwh = data.monthly / 30;
      if (dailyKwh > 0) {
        autonomyHours = (resolvedBatteryKwh * 0.8 * 24) / dailyKwh;
      }
    } else {
      if (connectionType === 'offGrid') autonomyHours = 16;
      else if (connectionType === 'hybrid') autonomyHours = 6;
      else autonomyHours = 0;
    }

    data.batteryKwhNeeded = resolvedBatteryKwh;
    data.batteryCost = newBatteryCost;
    data.inverterUpgradeAdder = newInverterUpgradeAdder;
    data.totalSystemCost = newTotalSystemCost;
    data.paybackYears = data.annualSavingsSar > 0 ? newTotalSystemCost / data.annualSavingsSar : Infinity;
    data.lifetimeNetSavings = data.lifetimeGrossSavings - newTotalSystemCost;
    (data as any).autonomyHours = autonomyHours;

    setCalculatedData(data);
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

  const checkDataAnomalies = (): { type: 'danger' | 'warning' | 'info'; messageEn: string; messageAr: string }[] => {
    const anomalies: { type: 'danger' | 'warning' | 'info'; messageEn: string; messageAr: string }[] = [];
    
    // 1. Low Bill / High kWh Anomaly
    if (calcMethod === 'consumption' && typeof monthlyKWh === 'number' && monthlyKWh > 0 && typeof monthlyBill === 'number' && monthlyBill > 0) {
      const impliedRate = monthlyBill / monthlyKWh;
      const isAgri = primaryUse === 'agricultural';
      const minRateThreshold = isAgri ? 0.09 : 0.15;
      
      if (impliedRate < minRateThreshold) {
        anomalies.push({
          type: 'warning',
          messageEn: `Very low electricity rate: The effective rate is ${impliedRate.toFixed(3)} SAR/kWh. The standard KSA residential tariff starts at 0.18 SAR/kWh (0.207 with VAT). Please double check your bill amount or consumption (kWh) inputs.`,
          messageAr: `تعرفة كهرباء منخفضة جداً: التعرفة الفعلية المحسوبة هي ${impliedRate.toFixed(3)} ريال/ك.و.س. تبدأ التعرفة السكنية القياسية في السعودية من 0.18 ريال/ك.و.س (0.207 مع الضريبة). يرجى التحقق من قيم الفاتورة أو الاستهلاك.`
        });
      } else if (impliedRate > 0.42) {
        anomalies.push({
          type: 'warning',
          messageEn: `Very high electricity rate: The effective rate is ${impliedRate.toFixed(3)} SAR/kWh, which exceeds standard KSA utility tariffs (max residential is 0.30 SAR/kWh, commercial is 0.36 SAR/kWh, before VAT). Please verify if your input includes other non-electricity fees.`,
          messageAr: `تعرفة كهرباء مرتفعة جداً: التعرفة الفعلية المحسوبة هي ${impliedRate.toFixed(3)} ريال/ك.و.س، وهي تتجاوز التعرفة القياسية في السعودية (الحد الأقصى السكني 0.30 ريال، والتجاري 0.36 ريال قبل الضريبة). يرجى التحقق مما إذا كانت الفاتورة تشمل رسومًا أخرى غير الكهرباء.`
        });
      }
    }

    // 2. Extreme Load Anomaly
    const currentSystemKw = calculatedData?.systemKw || 0;
    if (currentSystemKw > 200 || (calcMethod === 'equipmentLoad' && typeof equipmentLoadKw === 'number' && equipmentLoadKw > 200)) {
      anomalies.push({
        type: 'info',
        messageEn: `Commercial scale system (${formatNumber(currentSystemKw || (equipmentLoadKw as number), 1)} kW): Systems above 200 kW are subject to special grid-connection regulations with SEC, medium-voltage design reviews, and require a formal custom engineering audit.`,
        messageAr: `نظام بمقياس تجاري ضخم (${formatNumber(currentSystemKw || (equipmentLoadKw as number), 1)} كيلوواط): الأنظمة التي تتجاوز 200 كيلوواط تخضع للوائح ربط خاصة مع شركة الكهرباء SEC، وتتطلب مراجعة مخططات الجهد المتوسط ودراسة هندسية متكاملة.`
      });
    }

    // 3. Batteries sizing warnings (skip for pumping / on-grid)
    if (connectionType !== 'onGrid' && connectionType !== 'pumping' && calculatedData) {
      const activeBatteryKwh = calculatedData.batteryKwhNeeded;
      if (activeBatteryKwh > 0 && currentSystemKw > 0) {
        const ratio = activeBatteryKwh / currentSystemKw;
        if (ratio < 0.2) {
          anomalies.push({
            type: 'danger',
            messageEn: `Under-sized battery bank: Your selected battery storage (${activeBatteryKwh.toFixed(1)} kWh) is extremely small relative to the solar system size (${currentSystemKw.toFixed(1)} kW). The battery may deplete too quickly and can shut down during peak loads. We recommend at least 1.0x to 2.0x of the PV capacity (i.e. ${currentSystemKw.toFixed(1)} to ${(currentSystemKw * 2).toFixed(1)} kWh).`,
            messageAr: `سعة بطارية غير كافية: بنك البطاريات المختار (${activeBatteryKwh.toFixed(1)} ك.و.س) صغير جداً مقارنة بحجم الألواح (${currentSystemKw.toFixed(1)} ك.و). قد تفرغ البطارية بسرعة كبيرة أو تتعطل نتيجة السحب المفاجئ للأحمال. نوصي بسعة لا تقل عن 1.0x إلى 2.0x من قدرة الألواح (أي من ${currentSystemKw.toFixed(1)} إلى ${(currentSystemKw * 2).toFixed(1)} ك.و.س).`
          });
        } else if (ratio > 5.0) {
          anomalies.push({
            type: 'warning',
            messageEn: `Over-sized battery bank: Your selected battery capacity (${activeBatteryKwh.toFixed(1)} kWh) is very large compared to the solar system size (${currentSystemKw.toFixed(1)} kW). The solar PV array will not generate enough daily excess energy to fully recharge this battery bank. Consider increasing the solar system capacity or reducing the battery storage size.`,
            messageAr: `سعة بطارية ضخمة جداً: سعة البطارية المحددة (${activeBatteryKwh.toFixed(1)} ك.و.س) كبيرة للغاية مقارنة بحجم نظام الألواح (${currentSystemKw.toFixed(1)} ك.و). لن تتمكن الألواح من إنتاج طاقة فائضة كافية لإعادة شحن البطارية بالكامل يومياً. ننصح بزيادة الألواح أو تقليل سعة البطاريات.`
          });
        }
      }
    }

    // 4. Pumping Run Hours daylight limit warning
    if (connectionType === 'pumping' && calcMethod === 'equipmentLoad' && typeof equipmentRunHours === 'number' && equipmentRunHours > 8) {
      anomalies.push({
        type: 'warning',
        messageEn: `Direct pumping daylight limit: Solar pumping systems run directly on solar power without battery backup. Continuous daylight operation is limited to 6–8 hours max. Operating for ${equipmentRunHours} hours daily requires an auxiliary grid connection, battery storage, or a hybrid generator.`,
        messageAr: `محدودية التشغيل النهاري للضخ: تعمل أنظمة الضخ المباشر بالطاقة الشمسية بدون بطاريات. يقتصر التشغيل المستقر على 6 إلى 8 ساعات نهارية كحد أقصى. التشغيل لـ ${equipmentRunHours} ساعة يتطلب ربطاً بالشبكة، أو بطاريات احتياطية، أو مولد طاقة هجين.`
      });
    }

    return anomalies;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCalculation();
  };

  const handleSelectHistory = (entry: SolarCalcHistoryEntry) => {
    const inp = entry.input;
    if (inp.calcMethod) setCalcMethod(inp.calcMethod);
    setTargetSystemKw(typeof inp.targetSystemKw === 'number' ? inp.targetSystemKw : '');
    setEquipmentLoadKw(typeof inp.equipmentLoadKw === 'number' ? inp.equipmentLoadKw : '');
    setEquipmentRunHours(typeof inp.equipmentRunHours === 'number' ? inp.equipmentRunHours : '');
    setMonthlyKWh(typeof inp.monthlyKWh === 'number' ? inp.monthlyKWh : '');
    setMonthlyBill(typeof inp.monthlyBill === 'number' ? inp.monthlyBill : '');
    setAvailableArea(typeof inp.availableArea === 'number' ? inp.availableArea : '');
    setHasGrid(inp.hasGrid);
    setWantBackup(inp.wantBackup);
    if (inp.connectionType) {
      setConnectionType(inp.connectionType);
    } else {
      const resolvedUse = inp.primaryUse || 'home';
      if (resolvedUse === 'agricultural') {
        if (!inp.hasGrid) setConnectionType('pumping');
        else setConnectionType('onGrid');
      } else {
        if (!inp.hasGrid) setConnectionType('offGrid');
        else if (inp.wantBackup) setConnectionType('hybrid');
        else setConnectionType('onGrid');
      }
    }
    setCustomBatteryKwh(inp.customBatteryKwh !== undefined ? inp.customBatteryKwh : '');
    setIsBatteryOverridden(inp.isBatteryOverridden !== undefined ? inp.isBatteryOverridden : false);
    setHugeBill(inp.hugeBill);
    setPrimaryUse(inp.primaryUse);
    setIndustryConnection(inp.industryConnection);
    setIndustryFuelCompBand(inp.industryFuelCompBand);
    setPanelTier(inp.panelTier);
    setPeakSunHours(inp.peakSunHours);
    setPowerSupplyType(inp.powerSupplyType ?? (inp.hasGrid ? 'grid' : 'none'));
    if (typeof inp.generatorCostPerKwh === 'number') setGeneratorCostPerKwh(inp.generatorCostPerKwh);
    if (typeof inp.generatorShare === 'number') setGeneratorShare(inp.generatorShare);
    setSplitMeters(inp.splitMeters !== undefined ? inp.splitMeters : false);
    setMetersCount(inp.metersCount !== undefined ? inp.metersCount : 1);
    setClientCompany(inp.clientCompany || '');
    setClientContact(inp.clientContact || '');
    setClientPhone(inp.clientPhone || '');
    setClientEmail(inp.clientEmail || '');
    runCalculation(inp, true);
  };

  const handleRemoveHistory = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  useEffect(() => {
    let validInput = false;
    if (calcMethod === 'consumption') {
      validInput = (typeof monthlyKWh === 'number' && monthlyKWh > 0) || (typeof monthlyBill === 'number' && monthlyBill > 0);
    } else if (calcMethod === 'systemSize') {
      validInput = typeof targetSystemKw === 'number' && targetSystemKw > 0;
    } else if (calcMethod === 'equipmentLoad') {
      validInput = typeof equipmentLoadKw === 'number' && equipmentLoadKw > 0 && typeof equipmentRunHours === 'number' && equipmentRunHours > 0;
    }
    if (!validInput) return;
    runCalculation({}, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calcMethod, targetSystemKw, equipmentLoadKw, equipmentRunHours, monthlyKWh, monthlyBill, availableArea, hasGrid, wantBackup, hugeBill, primaryUse, industryConnection, industryFuelCompBand, panelTier, peakSunHours, powerSupplyType, generatorCostPerKwh, generatorShare, connectionType, customBatteryKwh, isBatteryOverridden, splitMeters, metersCount, clientCompany, clientContact, clientPhone, clientEmail]);

  useEffect(() => {
    let validInput = false;
    if (calcMethod === 'consumption') {
      validInput = (typeof monthlyKWh === 'number' && monthlyKWh > 0) || (typeof monthlyBill === 'number' && monthlyBill > 0);
    } else if (calcMethod === 'systemSize') {
      validInput = typeof targetSystemKw === 'number' && targetSystemKw > 0;
    } else if (calcMethod === 'equipmentLoad') {
      validInput = typeof equipmentLoadKw === 'number' && equipmentLoadKw > 0 && typeof equipmentRunHours === 'number' && equipmentRunHours > 0;
    }
    if (!validInput) return;
    runCalculation({}, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calcMethod, targetSystemKw, equipmentLoadKw, equipmentRunHours, monthlyKWh, monthlyBill, i18n.language]);

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


                    <div className='col-12 mb-4'>
                      <label className="form-label fw-bold d-flex align-items-center mb-3">
                        <FontAwesomeIcon icon={faTachometerAlt} className='text-primary me-2' />
                        {t('solarCalc.calcMethod', 'Calculation Method')}
                      </label>
                      <div className='card p-3 border-primary bg-primary-subtle bg-opacity-10 rounded-4'>
                        <div className='row justify-content-center flex-row g-3'>
                          <div className='col-md-4'>
                            <input
                              type="radio"
                              className="btn-check"
                              name="calcMethod"
                              id="btn-check-consumption"
                              value="consumption"
                              autoComplete="off"
                              onChange={e => setCalcMethod(e.target.value as any)}
                              checked={calcMethod === 'consumption'}
                            />
                            <label
                              className="btn btn-outline-primary d-flex align-items-center flex-column h-100 justify-content-center py-3"
                              htmlFor="btn-check-consumption"
                            >
                              <FontAwesomeIcon icon={faTachometerAlt} className="fa-2x mb-2" />
                              <span className="fw-semibold text-center">{t('solarCalc.methodConsumption', 'Calculate by Monthly Consumption / Bill')}</span>
                            </label>
                          </div>

                          <div className='col-md-4'>
                            <input
                              type="radio"
                              className="btn-check"
                              name="calcMethod"
                              id="btn-check-systemSize"
                              value="systemSize"
                              autoComplete="off"
                              onChange={e => setCalcMethod(e.target.value as any)}
                              checked={calcMethod === 'systemSize'}
                            />
                            <label
                              className="btn btn-outline-primary d-flex align-items-center flex-column h-100 justify-content-center py-3"
                              htmlFor="btn-check-systemSize"
                            >
                              <FontAwesomeIcon icon={faSolarPanel} className="fa-2x mb-2" />
                              <span className="fw-semibold text-center">{t('solarCalc.methodSystemSize', 'Calculate by Target System Size (kW)')}</span>
                            </label>
                          </div>

                          <div className='col-md-4'>
                            <input
                              type="radio"
                              className="btn-check"
                              name="calcMethod"
                              id="btn-check-equipmentLoad"
                              value="equipmentLoad"
                              autoComplete="off"
                              onChange={e => setCalcMethod(e.target.value as any)}
                              checked={calcMethod === 'equipmentLoad'}
                            />
                            <label
                              className="btn btn-outline-primary d-flex align-items-center flex-column h-100 justify-content-center py-3"
                              htmlFor="btn-check-equipmentLoad"
                            >
                              <FontAwesomeIcon icon={faBolt} className="fa-2x mb-2" />
                              <span className="fw-semibold text-center">{t('solarCalc.methodEquipmentLoad', 'Calculate by Equipment Load (kW) & Run Hours')}</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='col-12 d-flex flex-wrap justify-content-between mb-3'>
                      <div className='row w-100 m-0'>

                        {calcMethod === 'consumption' && (
                          <>
                            <div className="col-md-6 col-lg mb-3 px-1">
                              <div className='card p-2 input-card h-100'>

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
                                <small className="form-text text-muted helper-text mt-auto">
                                  {t('solarCalc.monthlyKwhHelper')}
                                </small>
                              </div>

                            </div>

                            <div className="col-md-6 col-lg mb-3 px-1">
                              <div className='card p-2 input-card h-100'>

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

                                <small className="form-text text-muted helper-text mt-auto">
                                  {t('solarCalc.monthlyBillHelper')}
                                </small>
                              </div>
                            </div>
                          </>
                        )}

                        {calcMethod === 'systemSize' && (
                          <div className="col-md-6 col-lg mb-3 px-1">
                            <div className='card p-2 input-card h-100'>
                              <label className="form-label d-flex align-items-center flex-column">
                                <FontAwesomeIcon icon={faSolarPanel} className='fa-2x text-primary me-1' />
                                <small className='text-center'>{t('solarCalc.targetSystemSize', 'Target System Size (kW)')}</small>
                              </label>
                              <input type="number" className="form-control text-center" value={targetSystemKw} onChange={e => setTargetSystemKw(e.target.value === '' ? '' : Number(e.target.value))} min={0} step={0.5} placeholder="e.g. 10" />
                              <small className="form-text text-muted helper-text mt-auto text-center pt-2">
                                {t('solarCalc.targetSystemSizeHelper', 'Enter the desired solar system capacity')}
                              </small>
                            </div>
                          </div>
                        )}

                        {calcMethod === 'equipmentLoad' && (
                          <>
                            <div className="col-md-6 col-lg mb-3 px-1">
                              <div className='card p-2 input-card h-100'>
                                <label className="form-label d-flex align-items-center flex-column">
                                  <FontAwesomeIcon icon={faBolt} className='fa-2x text-primary me-1' />
                                  <small className='text-center'>{t('solarCalc.equipmentLoad', 'Equipment Load (kW)')}</small>
                                </label>
                                <select 
                                  className="form-select mb-2 text-center" 
                                  onChange={e => {
                                    const val = e.target.value;
                                    if (val !== '') setEquipmentLoadKw(Number(val));
                                  }}
                                >
                                  <option value="">{t('solarCalc.selectAppliance', 'Select recommendation...')}</option>
                                  <option value="1.8">{t('solarCalc.applianceAC15', 'Air Conditioner (1.5 Ton) - 1.8 kW')}</option>
                                  <option value="2.4">{t('solarCalc.applianceAC20', 'Air Conditioner (2.0 Ton) - 2.4 kW')}</option>
                                  <option value="0.75">{t('solarCalc.applianceWaterPump1', 'Water Pump (1 HP) - 0.75 kW')}</option>
                                  <option value="1.5">{t('solarCalc.applianceWaterPump2', 'Water Pump (2 HP) - 1.5 kW')}</option>
                                  <option value="0.4">{t('solarCalc.applianceFridge', 'Refrigerator - 0.4 kW')}</option>
                                </select>
                                <input type="number" className="form-control text-center" value={equipmentLoadKw} onChange={e => setEquipmentLoadKw(e.target.value === '' ? '' : Number(e.target.value))} min={0} step={0.1} placeholder={t('solarCalc.customLoad', 'Custom Load (kW)')} />
                              </div>
                            </div>
                            <div className="col-md-6 col-lg mb-3 px-1">
                              <div className='card p-2 input-card h-100'>
                                <label className="form-label d-flex align-items-center flex-column">
                                  <FontAwesomeIcon icon={faTachometerAlt} className='fa-2x text-primary me-1' />
                                  <small className='text-center'>{t('solarCalc.runHours', 'Daily Run Time (Hours)')}</small>
                                </label>
                                <input
                                  type="number"
                                  className="form-control text-center"
                                  value={equipmentRunHours}
                                  onChange={e => {
                                    const val = e.target.value === '' ? '' : Number(e.target.value);
                                    if (val === '') {
                                      setEquipmentRunHours('');
                                    } else {
                                      setEquipmentRunHours(Math.min(24, Math.max(0, val)));
                                    }
                                  }}
                                  min={0}
                                  max={24}
                                  step={0.5}
                                  placeholder="e.g. 8"
                                />
                                <small className="form-text text-muted helper-text mt-auto text-center pt-2">
                                  {t('solarCalc.runHoursHelper', 'How many hours daily the load runs')}
                                </small>
                              </div>
                            </div>
                          </>
                        )}

                        <div className="col-md-6 col-lg mb-3 px-1">
                          <div className='card p-2 input-card h-100'>
                            <label className="form-label d-flex align-items-center flex-column">
                              <FontAwesomeIcon icon={faRulerCombined} className='fa-2x text-primary me-1' />
                              <small className='text-center'>{t('solarCalc.area')}</small>
                            </label>
                            <input type="number" className="form-control text-center" value={availableArea as any} onChange={e => setAvailableArea(e.target.value === '' ? '' : Number(e.target.value))} min={0} />
                            <small className="form-text text-muted helper-text mt-auto pt-2">
                              {t('solarCalc.areaHelper')}
                            </small>
                          </div>
                        </div>

                        {showAdvanced && (
                          <div className="col-md-6 col-lg mb-3 px-1">
                            <div className='card p-2 input-card h-100'>
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
                              <small className="form-text text-muted helper-text mt-auto pt-2">
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

                      {/* Client Info Card for Quotation Generation */}
                      <div className="col-md-12 mb-3">
                        <h3 className="display-1 fs-4">
                          <FontAwesomeIcon icon={faSave} className="text-primary me-2" />
                          {lang === 'ar' ? 'بيانات العميل (لإعداد عرض السعر)' : 'Client Information (For Quotation)'}
                        </h3>
                        <div className="card p-3">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label small fw-semibold">
                                {lang === 'ar' ? 'اسم العميل / الشركة' : 'Company / Client Name'}
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={clientCompany}
                                onChange={e => setClientCompany(e.target.value)}
                                placeholder={lang === 'ar' ? 'مثال: شركة أعمال المقاولات' : 'e.g. Acme Contracting Corp'}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-semibold">
                                {lang === 'ar' ? 'الشخص المسؤول' : 'Contact Person'}
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={clientContact}
                                onChange={e => setClientContact(e.target.value)}
                                placeholder={lang === 'ar' ? 'مثال: محمد بن علوان' : 'e.g. John Doe'}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-semibold">
                                {lang === 'ar' ? 'رقم الجوال' : 'Phone / Mobile'}
                              </label>
                              <input
                                type="tel"
                                className="form-control"
                                value={clientPhone}
                                onChange={e => setClientPhone(e.target.value)}
                                placeholder={lang === 'ar' ? 'مثال: 050XXXXXXX' : 'e.g. +966500000000'}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-semibold">
                                {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                              </label>
                              <input
                                type="email"
                                className="form-control"
                                value={clientEmail}
                                onChange={e => setClientEmail(e.target.value)}
                                placeholder={lang === 'ar' ? 'مثال: info@client.com' : 'e.g. contact@client.com'}
                              />
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

                        <div className="mb-4 mt-3">
                          <label className="form-label fw-bold d-flex align-items-center mb-2">
                            <FontAwesomeIcon icon={faNetworkWired} className="text-primary me-2" />
                            {t('solarCalc.systemConnectionType', 'System Connection Type')}
                          </label>
                          <div className="card p-2 bg-light border-0 rounded-3">
                            <div className="row g-2">
                              {primaryUse === 'agricultural' ? (
                                <>
                                  <div className="col-6 col-md-3">
                                    <input
                                      type="radio"
                                      className="btn-check"
                                      name="connectionType"
                                      id="conn-ongrid"
                                      value="onGrid"
                                      checked={connectionType === 'onGrid'}
                                      onChange={() => setConnectionType('onGrid')}
                                    />
                                    <label className="btn btn-outline-primary d-flex align-items-center flex-column py-2 px-1 h-100 justify-content-center" htmlFor="conn-ongrid">
                                      <FontAwesomeIcon icon={faTachometerAlt} className="mb-1" />
                                      <span className="small text-center" style={{ fontSize: '0.8rem' }}>{t('solarCalc.connectionOnGrid', 'On-Grid')}</span>
                                    </label>
                                  </div>
                                  <div className="col-6 col-md-3">
                                    <input
                                      type="radio"
                                      className="btn-check"
                                      name="connectionType"
                                      id="conn-offgrid"
                                      value="offGrid"
                                      checked={connectionType === 'offGrid'}
                                      onChange={() => setConnectionType('offGrid')}
                                    />
                                    <label className="btn btn-outline-primary d-flex align-items-center flex-column py-2 px-1 h-100 justify-content-center" htmlFor="conn-offgrid">
                                      <FontAwesomeIcon icon={faCarBattery} className="mb-1" />
                                      <span className="small text-center" style={{ fontSize: '0.8rem' }}>{t('solarCalc.connectionOffGrid', 'Off-Grid')}</span>
                                    </label>
                                  </div>
                                  <div className="col-6 col-md-3">
                                    <input
                                      type="radio"
                                      className="btn-check"
                                      name="connectionType"
                                      id="conn-hybrid"
                                      value="hybrid"
                                      checked={connectionType === 'hybrid'}
                                      onChange={() => setConnectionType('hybrid')}
                                    />
                                    <label className="btn btn-outline-primary d-flex align-items-center flex-column py-2 px-1 h-100 justify-content-center" htmlFor="conn-hybrid">
                                      <FontAwesomeIcon icon={faSolarPanel} className="mb-1" />
                                      <span className="small text-center" style={{ fontSize: '0.8rem' }}>{t('solarCalc.connectionHybrid', 'Hybrid')}</span>
                                    </label>
                                  </div>
                                  <div className="col-6 col-md-3">
                                    <input
                                      type="radio"
                                      className="btn-check"
                                      name="connectionType"
                                      id="conn-pumping"
                                      value="pumping"
                                      checked={connectionType === 'pumping'}
                                      onChange={() => setConnectionType('pumping')}
                                    />
                                    <label className="btn btn-outline-primary d-flex align-items-center flex-column py-2 px-1 h-100 justify-content-center" htmlFor="conn-pumping">
                                      <FontAwesomeIcon icon={faTractor} className="mb-1" />
                                      <span className="small text-center" style={{ fontSize: '0.8rem' }}>{t('solarCalc.connectionPumping', 'Solar Pumping')}</span>
                                    </label>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="col-4">
                                    <input
                                      type="radio"
                                      className="btn-check"
                                      name="connectionType"
                                      id="conn-ongrid"
                                      value="onGrid"
                                      checked={connectionType === 'onGrid'}
                                      onChange={() => setConnectionType('onGrid')}
                                    />
                                    <label className="btn btn-outline-primary d-flex align-items-center flex-column py-2 px-1 h-100 justify-content-center" htmlFor="conn-ongrid">
                                      <FontAwesomeIcon icon={faTachometerAlt} className="mb-1" />
                                      <span className="small text-center" style={{ fontSize: '0.8rem' }}>{t('solarCalc.connectionOnGrid', 'On-Grid')}</span>
                                    </label>
                                  </div>
                                  <div className="col-4">
                                    <input
                                      type="radio"
                                      className="btn-check"
                                      name="connectionType"
                                      id="conn-offgrid"
                                      value="offGrid"
                                      checked={connectionType === 'offGrid'}
                                      onChange={() => setConnectionType('offGrid')}
                                    />
                                    <label className="btn btn-outline-primary d-flex align-items-center flex-column py-2 px-1 h-100 justify-content-center" htmlFor="conn-offgrid">
                                      <FontAwesomeIcon icon={faCarBattery} className="mb-1" />
                                      <span className="small text-center" style={{ fontSize: '0.8rem' }}>{t('solarCalc.connectionOffGrid', 'Off-Grid')}</span>
                                    </label>
                                  </div>
                                  <div className="col-4">
                                    <input
                                      type="radio"
                                      className="btn-check"
                                      name="connectionType"
                                      id="conn-hybrid"
                                      value="hybrid"
                                      checked={connectionType === 'hybrid'}
                                      onChange={() => setConnectionType('hybrid')}
                                    />
                                    <label className="btn btn-outline-primary d-flex align-items-center flex-column py-2 px-1 h-100 justify-content-center" htmlFor="conn-hybrid">
                                      <FontAwesomeIcon icon={faSolarPanel} className="mb-1" />
                                      <span className="small text-center" style={{ fontSize: '0.8rem' }}>{t('solarCalc.connectionHybrid', 'Hybrid')}</span>
                                    </label>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {connectionType !== 'onGrid' && connectionType !== 'pumping' && (
                          <div className="mb-4">
                            <label className="form-label fw-bold d-flex align-items-center mb-2">
                              <FontAwesomeIcon icon={faCarBattery} className="text-primary me-2" />
                              {t('solarCalc.batteryConfiguration', 'Battery Storage Sizing')}
                            </label>
                            <div className="card p-3 bg-light border-0 rounded-3">
                              <div className="form-check form-switch mb-3">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id="overrideBattery"
                                  checked={isBatteryOverridden}
                                  onChange={e => setIsBatteryOverridden(e.target.checked)}
                                />
                                <label className="form-check-label small" htmlFor="overrideBattery">
                                  {t('solarCalc.customBatterySize', 'Enter custom battery capacity (kWh)')}
                                </label>
                              </div>

                              {isBatteryOverridden ? (
                                <div className="mb-2">
                                  <div className="input-group">
                                    <input
                                      type="number"
                                      className="form-control text-center"
                                      value={customBatteryKwh}
                                      onChange={e => setCustomBatteryKwh(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                                      min={0}
                                      placeholder="e.g. 15"
                                    />
                                    <span className="input-group-text">kWh</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="mb-2">
                                  <span className="small text-muted">
                                    {t('solarCalc.recommendedBatterySize', 'Recommended capacity')}: <strong className="text-success">
                                      {calculatedData ? `${formatNumber(calculatedData.batteryKwhNeeded, 1)} kWh` : '—'}
                                    </strong>
                                  </span>
                                </div>
                              )}

                              {calculatedData && (calculatedData as any).autonomyHours > 0 && (
                                <div className="mt-2 text-success small fw-semibold">
                                  <span>ℹ️ </span>
                                  {isRtl 
                                    ? `سعة البطارية الحالية تغطي تشغيل الأحمال لمدة ${formatNumber((calculatedData as any).autonomyHours, 1)} ساعة تقريباً`
                                    : `This battery capacity provides approx. ${formatNumber((calculatedData as any).autonomyHours, 1)} hours of backup runtime`
                                  }
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="form-check form-switch mb-2">
                          <input className="form-check-input" type="checkbox" role="switch" id="hugeBill" checked={hugeBill} onChange={e => setHugeBill(e.target.checked)} />
                          <label className="form-check-label" htmlFor="hugeBill">
                            <FontAwesomeIcon icon={faHandHoldingUsd} className='text-warning' />
                            {t('solarCalc.highBillQuestion')}</label>
                        </div>




                      </div>
                    </div>



                    {showAdvanced && (
                      <>
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

                        <div className='col-md-6'>
                          <div className="mb-3">
                            <label className="form-label fw-bold d-flex align-items-center mb-2">
                              <FontAwesomeIcon icon={faNetworkWired} className='text-primary me-2' />
                              {lang === 'ar' ? 'خيارات تقسيم العدادات الكهربائية' : 'Split Electric Meters Options'}
                            </label>
                            <div className="card p-3 bg-light border-0 rounded-3">
                              <div className="form-check form-switch mb-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  id="splitMeters"
                                  checked={splitMeters}
                                  onChange={(e) => {
                                    setSplitMeters(e.target.checked);
                                    if (!e.target.checked) setMetersCount(1);
                                    else if (metersCount <= 1) setMetersCount(2);
                                  }}
                                />
                                <label className="form-check-label fw-semibold small" htmlFor="splitMeters">
                                  {lang === 'ar' ? 'تقسيم النظام على عدة عدادات؟' : 'Split system across multiple meters?'}
                                </label>
                              </div>

                              {splitMeters && (
                                <div className="mt-3">
                                  <label className="form-label small text-muted mb-1">
                                    {lang === 'ar' ? 'عدد العدادات الكهربائية المستهدفة' : 'Number of target electric meters'}
                                  </label>
                                  <div className="input-group input-group-sm mb-2" style={{ maxWidth: '160px' }}>
                                    <input
                                      type="number"
                                      className="form-control text-center"
                                      value={metersCount}
                                      onChange={(e) => setMetersCount(Math.min(10, Math.max(2, Number(e.target.value) || 2)))}
                                      min={2}
                                      max={10}
                                    />
                                    <span className="input-group-text">{lang === 'ar' ? 'عدادات' : 'Meters'}</span>
                                  </div>
                                  <div className="form-text small text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
                                    {lang === 'ar'
                                      ? 'ملاحظة: سيتم توزيع الألواح وتخصيص محول (عاكس) وتوصيلات مستقلة لكل عداد.'
                                      : 'Note: Panels will be split, with a dedicated inverter and cabling for each meter.'}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
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
                    {!result && (
                      <h4 className='display-6 text-center mb-4'>
                        <FontAwesomeIcon icon={faHandHoldingUsd} className='text-primary me-2' />
                        {t('solarCalc.recommendation')}
                      </h4>
                    )}
                    {result && (
                      <>
                        {/* Quotation Header Banner */}
                        <div className="quotation-print-header mb-4">
                          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pb-3 mb-3 border-bottom border-secondary border-opacity-25">
                            <div className="d-flex align-items-center gap-3">
                              <div className="d-flex align-items-center gap-2">
                                <img src="/src/assets/solar/solar-logo-icon.png" alt="AQTRACO Logo" style={{ height: '42px', width: 'auto' }} onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }} />
                                <img src="/src/assets/solar/solar-logo-txt.png" alt="AQTRACO Text" style={{ height: '32px', width: 'auto' }} onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }} />
                              </div>
                              <div className="border-start ps-3" style={{ borderColor: '#dee2e6' }}>
                                <h5 className="fw-bold mb-0 text-success" style={{ fontSize: '1.15rem', lineHeight: '1.2' }}>
                                  {lang === 'ar' ? 'مؤسسة أكترا للتجارة والمقاولات' : 'AQTRA Contracting & Trading'}
                                </h5>
                                <span className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                                  {lang === 'ar' ? 'سجل تجاري: ١٠١٠٦٢٩٦٦٨ | الرياض، المملكة العربية السعودية' : 'C.R. 1010629668 | Riyadh, Saudi Arabia'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-end">
                              <h4 className="fw-bold text-primary mb-1" style={{ fontSize: '1.25rem' }}>
                                {lang === 'ar' ? 'عرض سعر ومواصفات فنية' : 'TECHNICAL PRICE QUOTATION'}
                              </h4>
                              <div className="small text-muted" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                                <div><strong>{lang === 'ar' ? 'المرجع:' : 'Ref:'}</strong> <span className="font-monospace text-dark fw-semibold">{quoteRef}</span></div>
                                <div><strong>{lang === 'ar' ? 'التاريخ:' : 'Date:'}</strong> {quoteDate}</div>
                                <div><strong>{lang === 'ar' ? 'صلاحية العرض:' : 'Validity:'}</strong> {quoteValidUntil}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Client Info & Technical Parameters side-by-side cards */}
                        <div className="row g-3 mb-4 quotation-client-details">
                          <div className="col-md-6 col-sm-12">
                            <div className="card h-100 border border-success-subtle bg-success bg-opacity-10 p-3 rounded-3 shadow-xs">
                              <h6 className="fw-bold text-success border-bottom pb-1 mb-2" style={{ fontSize: '0.9rem' }}>
                                {lang === 'ar' ? 'بيانات العميل' : 'Client Information'}
                              </h6>
                              <div className="small text-dark" style={{ lineHeight: '1.6', fontSize: '0.8rem' }}>
                                <div><strong>{lang === 'ar' ? 'العميل / الشركة:' : 'Client / Company:'}</strong> {clientCompany || (lang === 'ar' ? 'غير محدد' : 'Not Specified')}</div>
                                <div><strong>{lang === 'ar' ? 'الشخص المسؤول:' : 'Contact Person:'}</strong> {clientContact || '—'}</div>
                                <div><strong>{lang === 'ar' ? 'رقم الجوال:' : 'Phone / Mobile:'}</strong> {clientPhone || '—'}</div>
                                <div><strong>{lang === 'ar' ? 'البريد الإلكتروني:' : 'Email Address:'}</strong> {clientEmail || '—'}</div>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6 col-sm-12">
                            <div className="card h-100 border border-primary-subtle bg-primary bg-opacity-10 p-3 rounded-3 shadow-xs">
                              <h6 className="fw-bold text-primary border-bottom pb-1 mb-2" style={{ fontSize: '0.9rem' }}>
                                {lang === 'ar' ? 'محددات التصميم الفني' : 'Technical Design Parameters'}
                              </h6>
                              <div className="small text-dark" style={{ lineHeight: '1.6', fontSize: '0.8rem' }}>
                                <div>
                                  <strong>{lang === 'ar' ? 'طريقة الحساب:' : 'Sizing Basis:'}</strong>{' '}
                                  {calcMethod === 'consumption'
                                    ? (lang === 'ar' ? 'الاستهلاك الشهري / الفاتورة' : 'Monthly Consumption / Bill')
                                    : calcMethod === 'systemSize'
                                    ? (lang === 'ar' ? 'حجم نظام مستهدف' : 'Target System Size')
                                    : (lang === 'ar' ? 'أحمال الأجهزة وساعات التشغيل' : 'Equipment Load & Runtime')}
                                </div>
                                <div><strong>{lang === 'ar' ? 'نوع الموقع:' : 'Site Type:'}</strong> {formatPrimaryUseLabel(primaryUse)}</div>
                                <div><strong>{lang === 'ar' ? 'نوع الاتصال الموصى به:' : 'Recommended Connection:'}</strong> {formatSystemType(connectionType)}</div>
                                {calculatedData && (
                                  <div>
                                    <strong>{lang === 'ar' ? 'سعة النظام المقدرة:' : 'Estimated System Size:'}</strong>{' '}
                                    {formatNumber(calculatedData.systemKw, 1)} kW ({calculatedData.panels} {lang === 'ar' ? 'لوح' : 'panels'})
                                  </div>
                                )}
                                {splitMeters && metersCount > 1 && (
                                  <div className="text-warning-emphasis fw-semibold">
                                    ⚠️ {lang === 'ar' ? `مقسم على: ${metersCount} عدادات كهربائية` : `Split across: ${metersCount} electric meters`}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Sanity Anomalies warning section */}
                        {(() => {
                          const anomalies = checkDataAnomalies();
                          if (anomalies.length === 0) return null;
                          return (
                            <div className="card border-warning bg-warning bg-opacity-10 text-warning-emphasis p-3 rounded-3 shadow-sm mb-4">
                              <h6 className="fw-bold mb-2 d-flex align-items-center text-warning-emphasis" style={{ fontSize: '0.9rem' }}>
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning me-2" />
                                {lang === 'ar' ? 'تنبيهات مراجعة المنطق وصحة البيانات:' : 'Sanity & Input Validation Alerts:'}
                              </h6>
                              <ul className="mb-0 ps-3" style={{ fontSize: '0.78rem' }}>
                                {anomalies.map((a, idx) => (
                                  <li key={idx} className="mb-1">
                                    <strong>[{a.type === 'danger' ? (lang === 'ar' ? 'حرِج' : 'CRITICAL') : a.type === 'warning' ? (lang === 'ar' ? 'تنبيه' : 'WARNING') : (lang === 'ar' ? 'إرشاد' : 'ADVISORY')}]:</strong>{' '}
                                    {lang === 'ar' ? a.messageAr : a.messageEn}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })()}

                        <div className='container' style={{ whiteSpace: 'pre-wrap' }}>
                          {result}
                        </div>
                        <p className="mt-3 text-muted">
                          {t('solarCalc.approxNotice')}
                        </p>
                        
                        {/* System Type Comparison Cards at the Bottom */}
                        <div className="row g-2 mt-4 print-system-cards">
                          {[
                            {
                              id: 'onGrid',
                              icon: faTachometerAlt,
                              titleEn: 'On-Grid (No Batteries)',
                              titleAr: 'شبكي (بدون بطاريات)',
                              descEn: 'Connected to the utility grid. Lowest initial cost, simple layout, enables exporting excess power to the grid. No power during utility outages.',
                              descAr: 'متصل بشبكة الكهرباء العامة. أقل تكلفة تأسيسية، تصميم بسيط، ويتيح تصدير الفائض للشبكة. ينقطع التيار عند انقصاص الشبكة.'
                            },
                            {
                              id: 'offGrid',
                              icon: faCarBattery,
                              titleEn: 'Off-Grid (With Batteries)',
                              titleAr: 'منفصل (مع بطاريات)',
                              descEn: '100% independent from the grid. Perfect for remote sites. Requires battery storage and backup generator for continuous availability.',
                              descAr: 'مستقل بنسبة 100% عن الشبكة العامة. مثالي للمناطق النائية. يتطلب بطاريات تخزين ومولد احتياطي لضمان توفر الطاقة المستمر.'
                            },
                            {
                              id: 'hybrid',
                              icon: faSolarPanel,
                              titleEn: 'Hybrid (With Batteries)',
                              titleAr: 'هجين (مع بطاريات)',
                              descEn: 'The best of both worlds. Remains connected to the grid but features battery backup. Keeps critical loads running during utility blackouts.',
                              descAr: 'يجمع بين أفضل الميزات. يبقى متصلاً بالشبكة مع بطاريات تخزين احتياطية. يشغل الأحمال الأساسية عند انقطاع كهرباء الشبكة.'
                            },
                            {
                              id: 'pumping',
                              icon: faTractor,
                              titleEn: 'Solar Pumping',
                              titleAr: 'ضخ زراعي (بدون بطاريات)',
                              descEn: 'Direct-coupled solar water pumping without battery storage or grid dependency. Ideal for daytime agricultural irrigation and deep wells.',
                              descAr: 'تشغيل مباشر لمضخات المياه بالطاقة الشمسية بدون بطاريات أو حاجة للشبكة العامة. مثالي للري الزراعي النهاري والآبار العميقة.'
                            }
                          ].map(sys => {
                            const isSelected = connectionType === sys.id;
                            return (
                              <div className="col-6 col-md-3" key={sys.id}>
                                <div className={`card system-compare-card ${isSelected ? 'selected' : ''}`}>
                                  <div className="card-body p-2 d-flex flex-column align-items-center text-center">
                                    <div className="system-icon-wrapper">
                                      <FontAwesomeIcon icon={sys.icon} />
                                    </div>
                                    <h6 className="card-title mb-1">
                                      {lang === 'ar' ? sys.titleAr : sys.titleEn}
                                    </h6>
                                    {isSelected ? (
                                      <span className="badge-selected">
                                        {lang === 'ar' ? 'النظام المختار' : 'Selected System'}
                                      </span>
                                    ) : (
                                      <span className="badge-details">
                                        {lang === 'ar' ? 'تفاصيل بديلة' : 'Alternative Option'}
                                      </span>
                                    )}
                                    <p className="card-text text-muted mb-0" style={{ fontSize: '0.7rem', lineHeight: '1.3' }}>
                                      {lang === 'ar' ? sys.descAr : sys.descEn}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={handlePrintRecommendation}
                          className="btn btn-outline-secondary w-100 mt-3 no-print"
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
