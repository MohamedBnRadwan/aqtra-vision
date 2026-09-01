import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderBanner from '@/components/HeaderBanner';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBolt,
  faBank,
  faTractor,
  faIndustry,
  faHome,
  faSolarPanel,
  faSave,
  faHospital,
  faHandHolding,
  faRulerCombined,
  faTachometerAlt,
  faCarBattery,
  faExclamationTriangle,
  faSun,
  faTrash,
  faPrint,
  faNetworkWired,
  faCheckCircle,
  faCalendarAlt,
  faShareAlt,
  faChartLine,
  faFileInvoiceDollar,
  faBuilding,
  faUser,
  faPhone,
  faEnvelope,
  faShieldAlt,
  faInfoCircle,
  faCoins,
  faHourglassHalf,
  faFileContract
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
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

import aqtraLogo from '@/assets/logo-horizontal.png';
import vision2030Logo from '@/assets/Saudi_Vision_2030_logo.svg';

import './SolarApplicationForm.css';

export type SolarCalcHistoryEntry = {
  id: string;
  timestamp: number;
  input: {
    calcMethod?: 'consumption' | 'systemSize' | 'equipmentLoad';
    targetSystemKw?: number;
    equipmentLoadKw?: number;
    equipmentRunHours?: number;
    consumptionPeriod?: 'monthly' | 'daily';
    monthlyKWh?: number;
    dailyKWh?: number;
    coveragePercent?: 100 | 75 | 50;
    billingDays?: number;
    meterFee?: number;
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

const SolarApplicationForm: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const lang = i18n.language === 'ar' ? 'ar' : 'en';

  // Primary form state
  const [calcMethod, setCalcMethod] = useState<'consumption' | 'systemSize' | 'equipmentLoad'>('consumption');
  const [targetSystemKw, setTargetSystemKw] = useState<number | ''>('');
  const [equipmentLoadKw, setEquipmentLoadKw] = useState<number | ''>('');
  const [equipmentRunHours, setEquipmentRunHours] = useState<number | ''>('');
  const [consumptionPeriod, setConsumptionPeriod] = useState<'monthly' | 'daily'>('monthly');
  const [monthlyKWh, setMonthlyKWh] = useState<number | ''>('');
  const [dailyKWh, setDailyKWh] = useState<number | ''>('');
  const [billingDays, setBillingDays] = useState<number>(30);
  const [meterFee, setMeterFee] = useState<number>(15);
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
  const [economyFirstYearDrop, setEconomyFirstYearDrop] = useState<number>(PANEL_PRICING.economy.firstYearDrop * 100);
  const [economyDegradation, setEconomyDegradation] = useState<number>(PANEL_PRICING.economy.degradationRate * 100);
  const [standardFirstYearDrop, setStandardFirstYearDrop] = useState<number>(PANEL_PRICING.standard.firstYearDrop * 100);
  const [standardDegradation, setStandardDegradation] = useState<number>(PANEL_PRICING.standard.degradationRate * 100);
  const [premiumFirstYearDrop, setPremiumFirstYearDrop] = useState<number>(PANEL_PRICING.premium.firstYearDrop * 100);
  const [premiumDegradation, setPremiumDegradation] = useState<number>(PANEL_PRICING.premium.degradationRate * 100);
  const [fullDayCoverage, setFullDayCoverage] = useState<boolean>(true);
  const [coveragePercent, setCoveragePercent] = useState<100 | 75 | 50>(100);

  const [result, setResult] = useState<React.ReactNode>(null);
  const [peakSunHours, setPeakSunHours] = useState<number>(5);
  const [history, setHistory] = useState<SolarCalcHistoryEntry[]>([]);
  const [powerSupplyType, setPowerSupplyType] = useState<'grid' | 'generator' | 'mixed' | 'none'>('grid');
  const [generatorCostPerKwh, setGeneratorCostPerKwh] = useState<number>(0.8);
  const [generatorShare, setGeneratorShare] = useState<number>(50);
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
    if (type === 'grid') return t('solarCalc.powerSupplyLabelGrid', lang === 'ar' ? 'شبكة فقط' : 'Grid only');
    if (type === 'generator') return t('solarCalc.powerSupplyLabelGenerator', lang === 'ar' ? 'مولد فقط' : 'Generator only');
    if (type === 'none') return t('solarCalc.powerSupplyLabelNone', lang === 'ar' ? 'بدون شبكة' : 'No grid');
    const normalizedShare = Number.isFinite(share) ? Math.max(0, Math.min(100, share)) : 0;
    return t('solarCalc.powerSupplyLabelMixed', { share: formatNumber(normalizedShare, 0), defaultValue: lang === 'ar' ? `مشترك (${formatNumber(normalizedShare, 0)}٪ مولد)` : `Mixed (${formatNumber(normalizedShare, 0)}% gen)` });
  };

  const formatPrimaryUseLabel = (use: string) => {
    if (use === 'home') return t('solarCalc.siteHome', lang === 'ar' ? 'سكني' : 'Residential / Home');
    if (use === 'bank') return t('solarCalc.siteBank', lang === 'ar' ? 'بنك / تجاري' : 'Commercial / Bank');
    if (use === 'hospital') return t('solarCalc.siteHospital', lang === 'ar' ? 'مستشفى' : 'Hospital');
    if (use === 'agricultural') return t('solarCalc.siteAgricultural', lang === 'ar' ? 'زراعي' : 'Agricultural');
    if (use === 'industry') return t('solarCalc.siteIndustrial', lang === 'ar' ? 'صناعي' : 'Industrial');
    return use;
  };

  const formatSystemType = (type: string) => {
    if (connectionType === 'pumping') return t('solarCalc.recommendedType.pumping', lang === 'ar' ? 'نظام ضخ شمسي زراعي' : 'Solar Pumping System');
    if (type === 'onGrid') return t('solarCalc.recommendedType.onGrid', lang === 'ar' ? 'مرتبطة بالشبكة (On-Grid)' : 'On-Grid (Grid-Tied)');
    if (type === 'offGrid') return t('solarCalc.recommendedType.offGrid', lang === 'ar' ? 'منفصلة عن الشبكة (Off-Grid)' : 'Off-Grid (Standalone)');
    if (type === 'hybrid') return t('solarCalc.recommendedType.hybrid', lang === 'ar' ? 'هجينة مع بطاريات (Hybrid)' : 'Hybrid (With Battery Backup)');
    if (type === 'pumping') return t('solarCalc.recommendedType.pumping', lang === 'ar' ? 'نظام ضخ شمسي زراعي' : 'Solar Pumping System');
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
    if (typeof dailyKWh === 'number' && dailyKWh > 0) params.set('dkwh', String(dailyKWh));
    params.set('cper', consumptionPeriod);
    if (typeof monthlyBill === 'number' && monthlyBill > 0) params.set('mbill', String(monthlyBill));
    if (billingDays !== 30) params.set('bdays', String(billingDays));
    if (meterFee !== 15) params.set('mfee', String(meterFee));
    if (typeof availableArea === 'number' && availableArea > 0) params.set('area', String(availableArea));
    params.set('grid', String(hasGrid ? 1 : 0));
    params.set('backup', String(wantBackup ? 1 : 0));
    params.set('huge', String(hugeBill ? 1 : 0));
    params.set('use', primaryUse);
    params.set('conn', industryConnection);
    params.set('fuel', industryFuelCompBand);
    params.set('panel', panelTier);
    params.set('efyd', String(economyFirstYearDrop));
    params.set('edeg', String(economyDegradation));
    params.set('sfyd', String(standardFirstYearDrop));
    params.set('sdeg', String(standardDegradation));
    params.set('pfyd', String(premiumFirstYearDrop));
    params.set('pdeg', String(premiumDegradation));
    params.set('psh', String(peakSunHours));
    params.set('fdc', String(fullDayCoverage ? 1 : 0));
    params.set('cov', String(coveragePercent));
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

  function estimateBillFromKwh(
    kwh: number,
    use: string,
    options: { connection: IndustryConnection; fuelCompBand: IndustryFuelCompBand },
    days = 30,
    fee = 15
  ): number | undefined {
    if (!Number.isFinite(kwh) || kwh <= 0) return undefined;
    const effective = effectivePriceForMonthlyKwh(kwh, use, options, days, fee);
    if (effective === undefined) return undefined;
    return round(kwh * effective, 2);
  }

  function validateInputs(input: {
    monthlyKWh?: number;
    monthlyBill?: number;
  }): string | null {
    if (powerSupplyType === 'generator' || powerSupplyType === 'none') {
      return null;
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

    return null;
  }

  const HISTORY_KEY = 'solarCalcHistory';
  const SHOW_ADVANCED_KEY = 'solarShowAdvanced';

  // Restore history and options on mount
  useEffect(() => {
    document.body.classList.add('solar-calculator-page');
    return () => {
      document.body.classList.remove('solar-calculator-page');
    };
  }, []);

  useEffect(() => {
    // Generate quotation reference code and dates
    const now = new Date();
    const dateStr = now.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
    const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    setQuoteRef(`AQ-SOL-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${randomHex}`);
    setQuoteDate(dateStr);
    setQuoteValidUntil(validUntil);

    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse calculation history', err);
      }
    }
  }, [lang]);

  // URL search params sync
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const cmeth = params.get('cmeth');
    if (cmeth === 'systemSize' || cmeth === 'equipmentLoad' || cmeth === 'consumption') setCalcMethod(cmeth);
    const tskw = params.get('tskw');
    if (tskw) setTargetSystemKw(Number(tskw));
    const elkw = params.get('elkw');
    if (elkw) setEquipmentLoadKw(Number(elkw));
    const erh = params.get('erh');
    if (erh) setEquipmentRunHours(Number(erh));
    const cper = params.get('cper');
    if (cper === 'daily' || cper === 'monthly') setConsumptionPeriod(cper);
    const mkwh = params.get('mkwh');
    if (mkwh) setMonthlyKWh(Number(mkwh));
    const dkwh = params.get('dkwh');
    if (dkwh) setDailyKWh(Number(dkwh));
    const bdays = params.get('bdays');
    if (bdays) setBillingDays(Number(bdays));
    const mfee = params.get('mfee');
    if (mfee) setMeterFee(Number(mfee));
    const mbill = params.get('mbill');
    if (mbill) setMonthlyBill(Number(mbill));
    const area = params.get('area');
    if (area) setAvailableArea(Number(area));
    const grid = params.get('grid');
    if (grid !== null) setHasGrid(parseBool(grid));
    const backup = params.get('backup');
    if (backup !== null) setWantBackup(parseBool(backup));
    const huge = params.get('huge');
    if (huge !== null) setHugeBill(parseBool(huge));
    const use = params.get('use');
    if (use) setPrimaryUse(use);
    const conn = params.get('conn') as IndustryConnection | null;
    if (conn) setIndustryConnection(conn);
    const fuel = params.get('fuel') as IndustryFuelCompBand | null;
    if (fuel) setIndustryFuelCompBand(fuel);
    const panel = params.get('panel') as PanelTierKey | null;
    if (panel) setPanelTier(panel);
    const efyd = params.get('efyd');
    if (efyd) setEconomyFirstYearDrop(Number(efyd));
    const edeg = params.get('edeg');
    if (edeg) setEconomyDegradation(Number(edeg));
    const sfyd = params.get('sfyd');
    if (sfyd) setStandardFirstYearDrop(Number(sfyd));
    const sdeg = params.get('sdeg');
    if (sdeg) setStandardDegradation(Number(sdeg));
    const pfyd = params.get('pfyd');
    if (pfyd) setPremiumFirstYearDrop(Number(pfyd));
    const pdeg = params.get('pdeg');
    if (pdeg) setPremiumDegradation(Number(pdeg));
    const psh = params.get('psh');
    if (psh) setPeakSunHours(Number(psh));
    const fdc = params.get('fdc');
    if (fdc !== null) setFullDayCoverage(parseBool(fdc));
    const cov = params.get('cov');
    if (cov === '100' || cov === '75' || cov === '50') setCoveragePercent(Number(cov) as any);
    const supply = params.get('supply') as 'grid' | 'generator' | 'mixed' | 'none' | null;
    if (supply) setPowerSupplyType(supply);
    const gcost = params.get('gcost');
    if (gcost) setGeneratorCostPerKwh(Number(gcost));
    const gshare = params.get('gshare');
    if (gshare) setGeneratorShare(Number(gshare));
    const adv = params.get('adv');
    if (adv !== null) setShowAdvanced(parseBool(adv));
    const connType = params.get('connType') as 'onGrid' | 'offGrid' | 'hybrid' | 'pumping' | null;
    if (connType) setConnectionType(connType);
    const split = params.get('split');
    if (split !== null) setSplitMeters(parseBool(split));
    const mcount = params.get('mcount');
    if (mcount) setMetersCount(Number(mcount));
    const ccomp = params.get('ccomp');
    if (ccomp) setClientCompany(ccomp);
    const ccont = params.get('ccont');
    if (ccont) setClientContact(ccont);
    const cphone = params.get('cphone');
    if (cphone) setClientPhone(cphone);
    const cmail = params.get('cmail');
    if (cmail) setClientEmail(cmail);
  }, []);

  useEffect(() => {
    if (connectionType === 'onGrid') {
      setHasGrid(true);
      setWantBackup(false);
      setFullDayCoverage(true);
    } else if (connectionType === 'offGrid') {
      setHasGrid(false);
      setWantBackup(false);
      setFullDayCoverage(true);
    } else if (connectionType === 'hybrid') {
      setHasGrid(true);
      setWantBackup(true);
      setFullDayCoverage(true);
    } else if (connectionType === 'pumping') {
      setHasGrid(false);
      setWantBackup(false);
      setFullDayCoverage(false);
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
    setHasGrid(powerSupplyType === 'grid' || powerSupplyType === 'mixed');
  }, [powerSupplyType]);

  useEffect(() => {
    if (!syncBill) return;
    if (typeof monthlyKWh !== 'number' || monthlyKWh <= 0) return;
    const est = estimateBillFromKwh(
      monthlyKWh,
      primaryUse,
      { connection: industryConnection, fuelCompBand: industryFuelCompBand },
      billingDays,
      meterFee
    );
    if (est === undefined) return;
    if (typeof monthlyBill === 'number' && Math.abs(monthlyBill - est) < 0.5) return;
    setMonthlyBill(est);
  }, [syncBill, monthlyKWh, primaryUse, industryConnection, industryFuelCompBand, billingDays, meterFee]);

  useEffect(() => {
    if (!syncConsumption) return;
    if (typeof monthlyBill !== 'number' || monthlyBill <= 0) return;
    const tariff = tariffForPrimaryUse(primaryUse, { connection: industryConnection, fuelCompBand: industryFuelCompBand });
    const estKwh = monthlyKwhFromBill(monthlyBill, tariff, undefined, billingDays, meterFee);
    if (!Number.isFinite(estKwh)) return;
    if (typeof monthlyKWh === 'number' && Math.abs(monthlyKWh - estKwh) < 0.5) return;
    setMonthlyKWh(round(estKwh, 0));
    setDailyKWh(round(estKwh / 30, 2));
  }, [syncConsumption, monthlyBill, primaryUse, industryConnection, industryFuelCompBand, billingDays, meterFee]);

  // Sanity & input validation alerts
  const checkDataAnomalies = () => {
    const anomalies: { type: 'warning' | 'danger' | 'info'; messageAr: string; messageEn: string }[] = [];
    if (calcMethod === 'consumption' && typeof monthlyKWh === 'number' && typeof monthlyBill === 'number' && monthlyKWh > 0 && monthlyBill > 0) {
      const avgSar = monthlyBill / monthlyKWh;
      if (avgSar > 0.40) {
        anomalies.push({
          type: 'warning',
          messageAr: `متوسط سعر الكيلوواط المحسوب (${avgSar.toFixed(2)} ريال) مرتفع جداً مقارنة بالتعرفة الرسمية. يرجى التأكد من صحة الفاتورة أو الاستهلاك.`,
          messageEn: `Calculated average price per kWh (${avgSar.toFixed(2)} SAR) is higher than official utility tariffs. Please verify bill or kWh.`
        });
      }
    }
    if (availableArea && calculatedData && (availableArea + availableArea * 0.05) < calculatedData.areaNeeded) {
      anomalies.push({
        type: 'danger',
        messageAr: `المساحة المتوفرة (${availableArea} م²) أقل من المساحة المطلوبة لتركيب الألواح (${formatNumber(calculatedData.areaNeeded, 0)} م²).`,
        messageEn: `Available area (${availableArea} m²) is insufficient for required solar array (${formatNumber(calculatedData.areaNeeded, 0)} m²).`
      });
    }
    if (connectionType === 'pumping' && wantBackup) {
      anomalies.push({
        type: 'info',
        messageAr: 'نظام الضخ الزراعي يعمل نهاراً فقط بالري المباشر ولا يحتاج بطاريات تخزين.',
        messageEn: 'Direct solar pumping operates during daytime only and does not require battery storage.'
      });
    }
    return anomalies;
  };

  const buildWhatsAppMessage = (): string => {
    if (!calculatedData) {
      return lang === 'ar' ? 'مرحباً، أود الاستفسار عن تركيب منظومة طاقة شمسية.' : 'Hello, I would like to inquire about solar systems.';
    }
    const d = calculatedData;
    const lines = [
      lang === 'ar' ? 'طلب عرض سعر واستشارة طاقة شمسية:' : 'Solar System Quotation Inquiry:',
      `• ${lang === 'ar' ? 'العميل' : 'Client'}: ${clientCompany || clientContact || '—'}`,
      `• ${lang === 'ar' ? 'رقم العرض' : 'Quote Ref'}: ${quoteRef}`,
      `• ${lang === 'ar' ? 'نوع الموقع' : 'Site Type'}: ${formatPrimaryUseLabel(primaryUse)}`,
      `• ${lang === 'ar' ? 'حجم النظام' : 'System Size'}: ${formatNumber(d.systemKw, 1)} kW (${d.panels} ${lang === 'ar' ? 'لوح' : 'panels'})`,
      `• ${lang === 'ar' ? 'نوع الاتصال' : 'Connection'}: ${formatSystemType(d.systemType)}`,
      d.batteryKwhNeeded > 0 ? `• ${lang === 'ar' ? 'سعة البطارية' : 'Battery'}: ${formatNumber(d.batteryKwhNeeded, 1)} kWh` : '',
      `• ${lang === 'ar' ? 'التكلفة التقديرية' : 'Estimated Cost'}: ${formatNumber(d.totalSystemCost, 0)} SAR`,
      `• ${lang === 'ar' ? 'التوفير السنوي' : 'Annual Savings'}: ${formatNumber(d.annualSavingsSar, 0)} SAR / yr`,
    ].filter(Boolean).join('\n');
    return lines;
  };

  const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
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
      consumptionPeriod,
      monthlyKWh: typeof monthlyKWh === 'number' ? monthlyKWh : undefined,
      dailyKWh: typeof dailyKWh === 'number' ? dailyKWh : undefined,
      billingDays: payload?.billingDays !== undefined ? payload.billingDays : billingDays,
      meterFee: payload?.meterFee !== undefined ? payload.meterFee : meterFee,
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
      coveragePercent: payload?.coveragePercent !== undefined ? payload.coveragePercent : coveragePercent,
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
        const LOSSES = 0.85;
        derivedMonthlyKWh = targetSystemKw * LOSSES * peakSunHours * 30;
      }
    } else {
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

    let overrideEffectiveKwhPrice: number | undefined;
    if (nextInput.powerSupplyType === 'generator' || nextInput.powerSupplyType === 'none') {
      overrideEffectiveKwhPrice = nextInput.generatorCostPerKwh;
    } else if (nextInput.powerSupplyType === 'mixed') {
      const tariff = tariffForPrimaryUse(nextInput.primaryUse, { connection: nextInput.industryConnection, fuelCompBand: nextInput.industryFuelCompBand });
      const monthlyBase = typeof nextInput.monthlyKWh === 'number'
        ? nextInput.monthlyKWh
        : typeof nextInput.monthlyBill === 'number'
          ? monthlyKwhFromBill(nextInput.monthlyBill, tariff, undefined, nextInput.billingDays, nextInput.meterFee)
          : 0;
      const gridPrice = monthlyBase > 0 ? effectivePriceForMonthlyKwh(monthlyBase, nextInput.primaryUse, { connection: nextInput.industryConnection, fuelCompBand: nextInput.industryFuelCompBand }, nextInput.billingDays, nextInput.meterFee) : undefined;
      const share = typeof nextInput.generatorShare === 'number' ? Math.min(Math.max(nextInput.generatorShare, 0), 100) / 100 : 0.5;
      if (gridPrice !== undefined && typeof nextInput.generatorCostPerKwh === 'number') {
        overrideEffectiveKwhPrice = gridPrice * (1 - share) + nextInput.generatorCostPerKwh * share;
      }
    }

    const activeFirstYearDrop = nextInput.panelTier === 'economy' ? economyFirstYearDrop : nextInput.panelTier === 'standard' ? standardFirstYearDrop : premiumFirstYearDrop;
    const activeDegradation = nextInput.panelTier === 'economy' ? economyDegradation : nextInput.panelTier === 'standard' ? standardDegradation : premiumDegradation;

    const calc: SolarEstimateResult = computeSolarEstimate({
      monthlyKWh: nextInput.monthlyKWh,
      dailyKWh: nextInput.dailyKWh,
      monthlyBill: nextInput.monthlyBill,
      billingDays: nextInput.billingDays,
      meterFeeSar: nextInput.meterFee,
      primaryUse: nextInput.primaryUse,
      industryOptions: { connection: nextInput.industryConnection, fuelCompBand: nextInput.industryFuelCompBand },
      peakSunHours: nextInput.peakSunHours,
      panelTier: nextInput.panelTier,
      hasGrid: nextInput.hasGrid,
      wantBackup: nextInput.wantBackup,
      availableArea: nextInput.availableArea,
      overrideEffectiveKwhPrice,
      firstYearDrop: activeFirstYearDrop / 100,
      degradationRate: activeDegradation / 100,
      fullDayCoverage: connectionType === 'pumping' ? false : fullDayCoverage,
      coveragePercent: nextInput.coveragePercent,
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
    const splitMetersCost = nextInput.splitMeters && (nextInput.metersCount ?? 1) > 1 ? ((nextInput.metersCount ?? 1) - 1) * 800 : 0;

    data.batteryKwhNeeded = resolvedBatteryKwh;
    data.batteryCost = newBatteryCost;
    data.inverterUpgradeAdder = newInverterUpgradeAdder;
    data.totalSystemCost = data.packagePriceSar + newBatteryCost + newInverterUpgradeAdder + splitMetersCost;
    data.paybackYears = data.annualSavingsSar > 0 ? data.totalSystemCost / data.annualSavingsSar : Infinity;
    data.lifetimeNetSavings = data.lifetimeGrossSavings - data.totalSystemCost;
    (data as any).splitMetersCost = splitMetersCost;
    (data as any).metersCount = nextInput.metersCount;

    setCalculatedData(data);
    setResult(true);

    if (!skipHistory) {
      const entry: SolarCalcHistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        input: {
          ...nextInput,
          consumptionPeriod,
          dailyKWh: typeof dailyKWh === 'number' ? dailyKWh : undefined,
          coveragePercent,
          billingDays,
          meterFee,
          connectionType,
          customBatteryKwh,
          isBatteryOverridden,
          splitMeters,
          metersCount,
          clientCompany,
          clientContact,
          clientPhone,
          clientEmail,
        },
        result: calc,
      };
      setHistory(prev => [entry, ...prev.slice(0, 9)]);
    }
  };

  const handleSelectHistory = (entry: SolarCalcHistoryEntry) => {
    const inp = entry.input;
    if (inp.calcMethod) setCalcMethod(inp.calcMethod);
    setTargetSystemKw(inp.targetSystemKw ?? '');
    setEquipmentLoadKw(inp.equipmentLoadKw ?? '');
    setEquipmentRunHours(inp.equipmentRunHours ?? '');
    if (inp.consumptionPeriod) setConsumptionPeriod(inp.consumptionPeriod);
    setMonthlyKWh(inp.monthlyKWh ?? '');
    setDailyKWh(inp.dailyKWh ?? '');
    if (inp.coveragePercent) setCoveragePercent(inp.coveragePercent);
    if (inp.billingDays !== undefined) setBillingDays(inp.billingDays);
    if (inp.meterFee !== undefined) setMeterFee(inp.meterFee);
    setMonthlyBill(inp.monthlyBill ?? '');
    setAvailableArea(inp.availableArea ?? '');
    setHasGrid(inp.hasGrid);
    setWantBackup(inp.wantBackup);
    setHugeBill(inp.hugeBill);
    setPrimaryUse(inp.primaryUse);
    setIndustryConnection(inp.industryConnection);
    setIndustryFuelCompBand(inp.industryFuelCompBand);
    setPanelTier(inp.panelTier);
    setPeakSunHours(inp.peakSunHours);
    setPowerSupplyType(inp.powerSupplyType);
    if (inp.connectionType) setConnectionType(inp.connectionType);
    setCustomBatteryKwh(inp.customBatteryKwh ?? '');
    setIsBatteryOverridden(inp.isBatteryOverridden ?? false);
    if (inp.splitMeters !== undefined) setSplitMeters(inp.splitMeters);
    if (inp.metersCount !== undefined) setMetersCount(inp.metersCount);
    if (inp.clientCompany) setClientCompany(inp.clientCompany);
    if (inp.clientContact) setClientContact(inp.clientContact);
    if (inp.clientPhone) setClientPhone(inp.clientPhone);
    if (inp.clientEmail) setClientEmail(inp.clientEmail);
    runCalculation(inp, true);
  };

  const handleRemoveHistory = (id: string) => {
    setHistory(prev => prev.filter(entry => entry.id !== id));
  };

  // Recalculate live when primary parameters change
  useEffect(() => {
    runCalculation(undefined, true);
  }, [
    calcMethod,
    targetSystemKw,
    equipmentLoadKw,
    equipmentRunHours,
    consumptionPeriod,
    monthlyKWh,
    dailyKWh,
    coveragePercent,
    billingDays,
    meterFee,
    monthlyBill,
    availableArea,
    primaryUse,
    connectionType,
    customBatteryKwh,
    isBatteryOverridden,
    panelTier,
    peakSunHours,
    powerSupplyType,
    generatorCostPerKwh,
    generatorShare,
    splitMeters,
    metersCount,
    fullDayCoverage,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCalculation();
  };

  const anomalies = checkDataAnomalies();

  return (
    <>
      {/* =========================================================
          ON-SCREEN WEB INTERFACE (Hidden on Print)
          ========================================================= */}
      <div className="no-print">
        <HeaderBanner
          title={t('solarCalc.title', lang === 'ar' ? 'حاسبة وتصميم الطاقة الشمسية' : 'Solar PV System Calculator')}
          subtitle={t('solarCalc.subtitle', lang === 'ar' ? 'صمم نظامك الشمسي واحصل على عرض سعر رسمي فوري' : 'Design your solar PV system and generate an instant official quotation')}
        />

        <section className="container-fluid py-5">
          <div className="row justify-content-center">
            <div className="col-md-11">
              <div className="row g-4">

                {/* =========================================================
                  LEFT COLUMN: STREAMLINED & EASY INPUT FORM
                  ========================================================= */}
                <div className="col-md-7 no-print">
                  <div className="card card-form-holder p-4 mb-4">
                    <form onSubmit={handleSubmit}>

                      {/* Sizing Method Selector */}
                      <div className="mb-4">
                        <label className="form-label fw-bold d-flex align-items-center mb-2 text-dark">
                          <FontAwesomeIcon icon={faTachometerAlt} className="text-success me-2" />
                          {t('solarCalc.sizingMethod', 'Sizing Method')}
                        </label>
                        <div className="row g-2">
                          <div className="col-4">
                            <input
                              type="radio"
                              className="btn-check"
                              name="calcMethod"
                              id="cm-consumption"
                              checked={calcMethod === 'consumption'}
                              onChange={() => setCalcMethod('consumption')}
                            />
                            <label className="btn btn-outline-success w-100 py-2 d-flex flex-column align-items-center justify-content-center text-center" htmlFor="cm-consumption">
                              <FontAwesomeIcon icon={faFileInvoiceDollar} className="mb-1" />
                              <span className="small fw-semibold" style={{ fontSize: '0.8rem' }}>{t('solarCalc.byConsumption', lang === 'ar' ? 'حسب الاستهلاك / الفاتورة' : 'By Consumption / Bill')}</span>
                            </label>
                          </div>
                          <div className="col-4">
                            <input
                              type="radio"
                              className="btn-check"
                              name="calcMethod"
                              id="cm-systemSize"
                              checked={calcMethod === 'systemSize'}
                              onChange={() => setCalcMethod('systemSize')}
                            />
                            <label className="btn btn-outline-success w-100 py-2 d-flex flex-column align-items-center justify-content-center text-center" htmlFor="cm-systemSize">
                              <FontAwesomeIcon icon={faSolarPanel} className="mb-1" />
                              <span className="small fw-semibold" style={{ fontSize: '0.8rem' }}>{t('solarCalc.bySystemSize', lang === 'ar' ? 'حسب حجم النظام (kW)' : 'By System Size (kW)')}</span>
                            </label>
                          </div>
                          <div className="col-4">
                            <input
                              type="radio"
                              className="btn-check"
                              name="calcMethod"
                              id="cm-equipmentLoad"
                              checked={calcMethod === 'equipmentLoad'}
                              onChange={() => setCalcMethod('equipmentLoad')}
                            />
                            <label className="btn btn-outline-success w-100 py-2 d-flex flex-column align-items-center justify-content-center text-center" htmlFor="cm-equipmentLoad">
                              <FontAwesomeIcon icon={faBolt} className="mb-1" />
                              <span className="small fw-semibold" style={{ fontSize: '0.8rem' }}>{t('solarCalc.byEquipmentLoad', lang === 'ar' ? 'حسب أحمال الأجهزة' : 'By Equipment Load')}</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Sizing Input Values */}
                      {calcMethod === 'consumption' && (
                        <div className="card p-3 mb-4 bg-light-subtle border rounded-3">
                          <div className="row g-3">
                            {/* Energy Consumption Toggle & Input */}
                            <div className="col-md-6">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <label className="form-label small fw-bold mb-0">
                                  {consumptionPeriod === 'monthly'
                                    ? (lang === 'ar' ? 'الاستهلاك الشهري (ك.و.س)' : 'Monthly Consumption (kWh)')
                                    : (lang === 'ar' ? 'الاستهلاك اليومي (ك.و.س)' : 'Daily Consumption (kWh)')}
                                </label>
                                <div className="btn-group btn-group-sm" role="group">
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${consumptionPeriod === 'monthly' ? 'btn-success text-white' : 'btn-outline-secondary'}`}
                                    style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                                    onClick={() => setConsumptionPeriod('monthly')}
                                  >
                                    {lang === 'ar' ? 'شهري' : 'Monthly'}
                                  </button>
                                  <button
                                    type="button"
                                    className={`btn btn-sm ${consumptionPeriod === 'daily' ? 'btn-success text-white' : 'btn-outline-secondary'}`}
                                    style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                                    onClick={() => setConsumptionPeriod('daily')}
                                  >
                                    {lang === 'ar' ? 'يومي' : 'Daily'}
                                  </button>
                                </div>
                              </div>

                              {consumptionPeriod === 'monthly' ? (
                                <>
                                  <div className="input-group">
                                    <input
                                      type="number"
                                      className="form-control fw-bold"
                                      value={monthlyKWh}
                                      onChange={(e) => {
                                        const val = e.target.value === '' ? '' : Number(e.target.value);
                                        setMonthlyKWh(val);
                                        setDailyKWh(typeof val === 'number' ? Number((val / 30).toFixed(2)) : '');
                                      }}
                                      placeholder={lang === 'ar' ? 'مثال: 6000' : 'e.g. 6000'}
                                      min={1}
                                    />
                                    <span className="input-group-text">{lang === 'ar' ? 'ك.و.س' : 'kWh'}</span>
                                  </div>
                                  {typeof monthlyKWh === 'number' && monthlyKWh > 0 && (
                                    <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                                      <FontAwesomeIcon icon={faBolt} className="text-warning me-1" />
                                      {lang === 'ar' ? `المعادل اليومي: ~${(monthlyKWh / 30).toFixed(1)} ك.و.س / يوم` : `Daily equivalent: ~${(monthlyKWh / 30).toFixed(1)} kWh/day`}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div className="input-group">
                                    <input
                                      type="number"
                                      className="form-control fw-bold"
                                      value={dailyKWh}
                                      onChange={(e) => {
                                        const val = e.target.value === '' ? '' : Number(e.target.value);
                                        setDailyKWh(val);
                                        setMonthlyKWh(typeof val === 'number' ? Number((val * 30).toFixed(0)) : '');
                                      }}
                                      placeholder={lang === 'ar' ? 'مثال: 200' : 'e.g. 200'}
                                      min={0.1}
                                      step={0.1}
                                    />
                                    <span className="input-group-text">{lang === 'ar' ? 'ك.و.س' : 'kWh'}</span>
                                  </div>
                                  {typeof dailyKWh === 'number' && dailyKWh > 0 && (
                                    <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                                      <FontAwesomeIcon icon={faCalendarAlt} className="text-success me-1" />
                                      {lang === 'ar' ? `المعادل الشهري (30 يوم): ~${(dailyKWh * 30).toFixed(0)} ك.و.س / شهر` : `Monthly equivalent (30 days): ~${(dailyKWh * 30).toFixed(0)} kWh/month`}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Monthly Bill Input (Always Monthly) */}
                            <div className="col-md-6">
                              <label className="form-label small fw-bold mb-1">
                                {lang === 'ar' ? 'الفاتورة الشهرية (دائماً شهرياً)' : 'Monthly Electricity Bill (SAR)'}
                              </label>
                              <div className="input-group">
                                <input
                                  type="number"
                                  className="form-control fw-bold"
                                  value={monthlyBill}
                                  onChange={(e) => setMonthlyBill(e.target.value === '' ? '' : Number(e.target.value))}
                                  placeholder={lang === 'ar' ? 'مثال: 1200' : 'e.g. 1200'}
                                  min={1}
                                />
                                <span className="input-group-text">&#x20C1;</span>
                              </div>
                              <div className="form-check form-switch mt-1">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="syncInputs"
                                  checked={syncBill || syncConsumption}
                                  onChange={(e) => {
                                    setSyncBill(e.target.checked);
                                    setSyncConsumption(e.target.checked);
                                  }}
                                />
                                <label className="form-check-label small text-muted" htmlFor="syncInputs" style={{ fontSize: '0.75rem' }}>
                                  {lang === 'ar' ? 'مزامنة الفاتورة مع الاستهلاك تلقائياً' : 'Auto-sync bill with consumption'}
                                </label>
                              </div>
                            </div>

                            {/* Target Coverage Options: 100%, 75%, 50% */}
                            <div className="col-12 mt-2 pt-2 border-top">
                              <label className="form-label small fw-bold mb-2 text-dark d-flex align-items-center">
                                <FontAwesomeIcon icon={faSun} className="text-warning me-2" />
                                {lang === 'ar' ? 'نسبة تغطية الاستهلاك المستهدفة من الطاقة الشمسية:' : 'Target Solar Coverage Percentage:'}
                              </label>
                              <div className="row g-2">
                                <div className="col-4">
                                  <input
                                    type="radio"
                                    className="btn-check"
                                    name="coveragePercent"
                                    id="cov-100"
                                    checked={coveragePercent === 100}
                                    onChange={() => setCoveragePercent(100)}
                                  />
                                  <label className="btn btn-outline-success w-100 py-2 text-center d-flex flex-column align-items-center justify-content-center" htmlFor="cov-100">
                                    <span className="fw-bold" style={{ fontSize: '0.95rem' }}>100%</span>
                                    <span className="small" style={{ fontSize: '0.72rem' }}>{lang === 'ar' ? 'تغطية 100% (تصفير الفاتورة)' : '100% Cover (Net Zero)'}</span>
                                  </label>
                                </div>
                                <div className="col-4">
                                  <input
                                    type="radio"
                                    className="btn-check"
                                    name="coveragePercent"
                                    id="cov-75"
                                    checked={coveragePercent === 75}
                                    onChange={() => setCoveragePercent(75)}
                                  />
                                  <label className="btn btn-outline-success w-100 py-2 text-center d-flex flex-column align-items-center justify-content-center" htmlFor="cov-75">
                                    <span className="fw-bold" style={{ fontSize: '0.95rem' }}>75%</span>
                                    <span className="small" style={{ fontSize: '0.72rem' }}>{lang === 'ar' ? 'تغطية 75% (خفض كبير)' : '75% Cover (Major Offset)'}</span>
                                  </label>
                                </div>
                                <div className="col-4">
                                  <input
                                    type="radio"
                                    className="btn-check"
                                    name="coveragePercent"
                                    id="cov-50"
                                    checked={coveragePercent === 50}
                                    onChange={() => setCoveragePercent(50)}
                                  />
                                  <label className="btn btn-outline-success w-100 py-2 text-center d-flex flex-column align-items-center justify-content-center" htmlFor="cov-50">
                                    <span className="fw-bold" style={{ fontSize: '0.95rem' }}>50%</span>
                                    <span className="small" style={{ fontSize: '0.72rem' }}>{lang === 'ar' ? 'تغطية 50% (استهلاك نهاري)' : '50% Cover (Daytime Load)'}</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {calcMethod === 'systemSize' && (
                        <div className="card p-3 mb-4 bg-light-subtle border rounded-3">
                          <label className="form-label small fw-bold mb-1">{t('solarCalc.targetSystemKw', lang === 'ar' ? 'حجم النظام المستهدف (كيلوواط)' : 'Target System Size (kW)')}</label>
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control fw-bold"
                              value={targetSystemKw}
                              onChange={(e) => setTargetSystemKw(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder={lang === 'ar' ? 'مثال: 15' : 'e.g. 15'}
                              min={1}
                            />
                            <span className="input-group-text">kW</span>
                          </div>
                        </div>
                      )}

                      {calcMethod === 'equipmentLoad' && (
                        <div className="card p-3 mb-4 bg-light-subtle border rounded-3">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label small fw-bold mb-1">{t('solarCalc.equipmentLoadKw', lang === 'ar' ? 'إجمالي حمل الأجهزة (كيلوواط)' : 'Total Equipment Load (kW)')}</label>
                              <div className="input-group">
                                <input
                                  type="number"
                                  className="form-control fw-bold"
                                  value={equipmentLoadKw}
                                  onChange={(e) => setEquipmentLoadKw(e.target.value === '' ? '' : Number(e.target.value))}
                                  placeholder={lang === 'ar' ? 'مثال: 10' : 'e.g. 10'}
                                  min={0.5}
                                />
                                <span className="input-group-text">kW</span>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-bold mb-1">{t('solarCalc.equipmentRunHours', lang === 'ar' ? 'ساعات التشغيل اليومية (ساعة/يوم)' : 'Daily Operating Hours (hrs/day)')}</label>
                              <div className="input-group">
                                <input
                                  type="number"
                                  className="form-control fw-bold"
                                  value={equipmentRunHours}
                                  onChange={(e) => setEquipmentRunHours(e.target.value === '' ? '' : Number(e.target.value))}
                                  placeholder={lang === 'ar' ? 'مثال: 8' : 'e.g. 8'}
                                  min={1}
                                  max={24}
                                />
                                <span className="input-group-text">{lang === 'ar' ? 'ساعة / يوم' : 'hrs/day'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Site Type Selector */}
                      <div className="mb-4">
                        <label className="form-label fw-bold d-flex align-items-center mb-2 text-dark">
                          <FontAwesomeIcon icon={faBuilding} className="text-success me-2" />
                          {t('solarCalc.siteType', lang === 'ar' ? 'نوع الموقع / الاستخدام الأساسي' : 'Site Type / Primary Use')}
                        </label>
                        <div className="row g-2">
                          {[
                            { id: 'home', icon: faHome, label: t('solarCalc.siteHome', lang === 'ar' ? 'سكني' : 'Home') },
                            { id: 'bank', icon: faBank, label: t('solarCalc.siteBank', lang === 'ar' ? 'بنك / تجاري' : 'Commercial / Bank') },
                            { id: 'hospital', icon: faHospital, label: t('solarCalc.siteHospital', lang === 'ar' ? 'مستشفى' : 'Hospital') },
                            { id: 'agricultural', icon: faTractor, label: t('solarCalc.siteAgricultural', lang === 'ar' ? 'زراعي' : 'Agricultural') },
                            { id: 'industry', icon: faIndustry, label: t('solarCalc.siteIndustrial', lang === 'ar' ? 'صناعي' : 'Industrial') },
                          ].map((site) => (
                            <div className="col" key={site.id}>
                              <input
                                type="radio"
                                className="btn-check"
                                name="primaryUse"
                                id={`site-${site.id}`}
                                value={site.id}
                                checked={primaryUse === site.id}
                                onChange={() => setPrimaryUse(site.id)}
                              />
                              <label className="btn btn-outline-success w-100 py-2 d-flex flex-column align-items-center justify-content-center text-center h-100" htmlFor={`site-${site.id}`}>
                                <FontAwesomeIcon icon={site.icon} className="mb-1" />
                                <span style={{ fontSize: '0.75rem' }}>{site.label}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* System Connection Type */}
                      <div className="mb-4">
                        <label className="form-label fw-bold d-flex align-items-center mb-2 text-dark">
                          <FontAwesomeIcon icon={faNetworkWired} className="text-success me-2" />
                          {t('solarCalc.systemConnectionType', 'System Connection Mode')}
                        </label>
                        <div className="row g-2">
                          {primaryUse === 'agricultural' ? (
                            <>
                              <div className="col-3">
                                <input type="radio" className="btn-check" name="conn" id="c-ongrid" checked={connectionType === 'onGrid'} onChange={() => setConnectionType('onGrid')} />
                                <label className="btn btn-outline-success w-100 py-2 text-center" htmlFor="c-ongrid">
                                  <FontAwesomeIcon icon={faTachometerAlt} className="d-block mb-1" />
                                  <span className="small" style={{ fontSize: '0.75rem' }}>{t('solarCalc.connectionOnGrid', 'On-Grid')}</span>
                                </label>
                              </div>
                              <div className="col-3">
                                <input type="radio" className="btn-check" name="conn" id="c-offgrid" checked={connectionType === 'offGrid'} onChange={() => setConnectionType('offGrid')} />
                                <label className="btn btn-outline-success w-100 py-2 text-center" htmlFor="c-offgrid">
                                  <FontAwesomeIcon icon={faCarBattery} className="d-block mb-1" />
                                  <span className="small" style={{ fontSize: '0.75rem' }}>{t('solarCalc.connectionOffGrid', 'Off-Grid')}</span>
                                </label>
                              </div>
                              <div className="col-3">
                                <input type="radio" className="btn-check" name="conn" id="c-hybrid" checked={connectionType === 'hybrid'} onChange={() => setConnectionType('hybrid')} />
                                <label className="btn btn-outline-success w-100 py-2 text-center" htmlFor="c-hybrid">
                                  <FontAwesomeIcon icon={faSolarPanel} className="d-block mb-1" />
                                  <span className="small" style={{ fontSize: '0.75rem' }}>{t('solarCalc.connectionHybrid', 'Hybrid')}</span>
                                </label>
                              </div>
                              <div className="col-3">
                                <input type="radio" className="btn-check" name="conn" id="c-pumping" checked={connectionType === 'pumping'} onChange={() => setConnectionType('pumping')} />
                                <label className="btn btn-outline-success w-100 py-2 text-center" htmlFor="c-pumping">
                                  <FontAwesomeIcon icon={faTractor} className="d-block mb-1" />
                                  <span className="small" style={{ fontSize: '0.75rem' }}>{t('solarCalc.connectionPumping', 'Solar Pumping')}</span>
                                </label>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="col-4">
                                <input type="radio" className="btn-check" name="conn" id="c-ongrid" checked={connectionType === 'onGrid'} onChange={() => setConnectionType('onGrid')} />
                                <label className="btn btn-outline-success w-100 py-2 text-center" htmlFor="c-ongrid">
                                  <FontAwesomeIcon icon={faTachometerAlt} className="d-block mb-1" />
                                  <span className="small" style={{ fontSize: '0.75rem' }}>{t('solarCalc.connectionOnGrid', 'On-Grid')}</span>
                                </label>
                              </div>
                              <div className="col-4">
                                <input type="radio" className="btn-check" name="conn" id="c-offgrid" checked={connectionType === 'offGrid'} onChange={() => setConnectionType('offGrid')} />
                                <label className="btn btn-outline-success w-100 py-2 text-center" htmlFor="c-offgrid">
                                  <FontAwesomeIcon icon={faCarBattery} className="d-block mb-1" />
                                  <span className="small" style={{ fontSize: '0.75rem' }}>{t('solarCalc.connectionOffGrid', 'Off-Grid')}</span>
                                </label>
                              </div>
                              <div className="col-4">
                                <input type="radio" className="btn-check" name="conn" id="c-hybrid" checked={connectionType === 'hybrid'} onChange={() => setConnectionType('hybrid')} />
                                <label className="btn btn-outline-success w-100 py-2 text-center" htmlFor="c-hybrid">
                                  <FontAwesomeIcon icon={faSolarPanel} className="d-block mb-1" />
                                  <span className="small" style={{ fontSize: '0.75rem' }}>{t('solarCalc.connectionHybrid', 'Hybrid')}</span>
                                </label>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Battery Storage Override (if Hybrid or OffGrid) */}
                      {connectionType !== 'onGrid' && connectionType !== 'pumping' && (
                        <div className="card p-3 mb-4 bg-light-subtle border rounded-3">
                          <label className="form-label small fw-bold mb-1 d-flex align-items-center">
                            <FontAwesomeIcon icon={faCarBattery} className="text-success me-2" />
                            {lang === 'ar' ? 'سعة تخزين البطاريات (ك.و.س)' : 'Battery Storage Bank (kWh)'}
                          </label>
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control fw-bold"
                              value={customBatteryKwh}
                              onChange={(e) => {
                                setIsBatteryOverridden(true);
                                setCustomBatteryKwh(e.target.value === '' ? '' : Number(e.target.value));
                              }}
                              placeholder={calculatedData ? String(formatNumber(calculatedData.batteryKwhNeeded, 1)) : '15'}
                              min={1}
                            />
                            <span className="input-group-text">kWh</span>
                          </div>
                          {calculatedData && (
                            <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                              <FontAwesomeIcon icon={faHourglassHalf} className="me-1 text-info" />
                              {lang === 'ar'
                                ? `سعة البطارية المقترحة توفر تشغيلاً مستقلاً لـ ~${formatNumber((calculatedData as any).autonomyHours || 0, 1)} ساعة.`
                                : `Recommended battery bank yields ~${formatNumber((calculatedData as any).autonomyHours || 0, 1)} autonomous backup hours.`}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Available Area (Optional) */}
                      <div className="mb-4">
                        <label className="form-label small fw-bold mb-1 d-flex align-items-center">
                          <FontAwesomeIcon icon={faRulerCombined} className="text-success me-2" />
                          {lang === 'ar' ? 'المساحة المتوفرة للتركيب (اختياري - م²)' : 'Available Installation Area (m²)'}
                        </label>
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control"
                            value={availableArea}
                            onChange={(e) => setAvailableArea(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder={lang === 'ar' ? 'مثال: 150' : 'e.g. 150'}
                            min={1}
                          />
                          <span className="input-group-text">m²</span>
                        </div>
                      </div>

                      {/* Client Quotation Information Card */}
                      <div className="card p-3 mb-4 border rounded-3 bg-white shadow-xs">
                        <div className="fw-bold mb-2 text-dark d-flex align-items-center" style={{ fontSize: '0.9rem' }}>
                          <FontAwesomeIcon icon={faUser} className="text-success me-2" />
                          {lang === 'ar' ? 'بيانات العميل (لإعداد عرض السعر الرسمي)' : 'Client Quotation Information'}
                        </div>
                        <div className="row g-2">
                          <div className="col-md-6">
                            <label className="form-label small text-muted mb-0">{lang === 'ar' ? 'العميل / المنشأة' : 'Company / Client Name'}</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={clientCompany}
                              onChange={(e) => setClientCompany(e.target.value)}
                              placeholder={lang === 'ar' ? 'مثال: شركة الرواد للتجارة' : 'e.g. Acme Corp'}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted mb-0">{lang === 'ar' ? 'الشخص المسؤول' : 'Contact Person'}</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={clientContact}
                              onChange={(e) => setClientContact(e.target.value)}
                              placeholder={lang === 'ar' ? 'مثال: م. أحمد عبد الله' : 'e.g. Eng. Ahmed'}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted mb-0">{lang === 'ar' ? 'رقم الجوال' : 'Phone / Mobile'}</label>
                            <input
                              type="tel"
                              className="form-control form-control-sm"
                              value={clientPhone}
                              onChange={(e) => setClientPhone(e.target.value)}
                              placeholder={lang === 'ar' ? 'مثال: 0501234567' : 'e.g. +966 50 123 4567'}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small text-muted mb-0">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                            <input
                              type="email"
                              className="form-control form-control-sm"
                              value={clientEmail}
                              onChange={(e) => setClientEmail(e.target.value)}
                              placeholder={lang === 'ar' ? 'مثال: client@domain.com' : 'e.g. client@domain.com'}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Advanced Technical Options Switch */}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="form-check form-switch mb-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="advancedToggle"
                            checked={showAdvanced}
                            onChange={(e) => setShowAdvanced(e.target.checked)}
                          />
                          <label className="form-check-label fw-semibold small text-dark" htmlFor="advancedToggle">
                            <FontAwesomeIcon icon={faShieldAlt} className="text-success me-1" />
                            {lang === 'ar' ? 'خيارات هندسية وفنية متقدمة' : 'Advanced Technical & Tariff Options'}
                          </label>
                        </div>
                      </div>

                      {/* Collapsible Advanced Options Panel */}
                      {showAdvanced && (
                        <div className="card p-3 mb-4 bg-light border rounded-3">
                          {/* SEC Billing Parameters */}
                          <div className="fw-bold small text-success mb-2 d-flex align-items-center">
                            <FontAwesomeIcon icon={faBolt} className="me-1" />
                            {lang === 'ar' ? 'معايير فاتورة شركة الكهرباء (SEC):' : 'SEC Billing Parameters:'}
                          </div>
                          <div className="row g-2 mb-3">
                            <div className="col-6">
                              <label className="form-label small text-muted mb-1">{lang === 'ar' ? 'أيام دورة الفاتورة' : 'Billing Days'}</label>
                              <div className="input-group input-group-sm">
                                <input
                                  type="number"
                                  className="form-control"
                                  value={billingDays}
                                  onChange={(e) => setBillingDays(Math.max(1, Number(e.target.value) || 30))}
                                  min={1}
                                />
                                <span className="input-group-text">{lang === 'ar' ? 'يوم' : 'Days'}</span>
                              </div>
                            </div>
                            <div className="col-6">
                              <label className="form-label small text-muted mb-1">{lang === 'ar' ? 'رسوم خدمة العداد' : 'Meter Fee'}</label>
                              <div className="input-group input-group-sm">
                                <input
                                  type="number"
                                  className="form-control"
                                  value={meterFee}
                                  onChange={(e) => setMeterFee(Math.max(0, Number(e.target.value) || 0))}
                                  min={0}
                                />
                                <span className="input-group-text">&#x20C1;</span>
                              </div>
                            </div>
                          </div>

                          {/* Multi-Meter Split */}
                          <div className="form-check form-switch mb-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="splitMetersCheck"
                              checked={splitMeters}
                              onChange={(e) => {
                                setSplitMeters(e.target.checked);
                                if (!e.target.checked) setMetersCount(1);
                                else if (metersCount <= 1) setMetersCount(2);
                              }}
                            />
                            <label className="form-check-label small fw-semibold" htmlFor="splitMetersCheck">
                              {lang === 'ar' ? 'تقسيم النظام على عدة عدادات كهربائية مستقلة' : 'Split system across multiple electric meters'}
                            </label>
                          </div>
                          {splitMeters && (
                            <div className="mb-3 ps-3">
                              <label className="form-label small text-muted mb-1">{lang === 'ar' ? 'عدد العدادات المستهدفة' : 'Number of meters'}</label>
                              <div className="input-group input-group-sm" style={{ maxWidth: '160px' }}>
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
                            </div>
                          )}

                          {/* Panel Quality Tier */}
                          <div className="mb-2">
                            <label className="form-label small text-muted mb-1">{lang === 'ar' ? 'فئة الألواح الشمسية' : 'Panel Quality Tier'}</label>
                            <select
                              className="form-select form-select-sm"
                              value={panelTier}
                              onChange={(e) => setPanelTier(e.target.value as PanelTierKey)}
                            >
                              <option value="economy">{PANEL_PRICING.economy.label} (490W / 0.8 Efficiency)</option>
                              <option value="standard">{PANEL_PRICING.standard.label} (590W / 1.0 Efficiency)</option>
                              <option value="premium">{PANEL_PRICING.premium.label} (635W / 1.2 Efficiency)</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="d-flex gap-2 justify-content-end mt-4">
                        <button
                          type="button"
                          className="btn btn-outline-secondary d-flex align-items-center"
                          onClick={handleShareLink}
                        >
                          <FontAwesomeIcon icon={faShareAlt} className="me-1" />
                          {t('solarCalc.shareLink', 'Share')}
                        </button>
                        <button type="submit" className="btn btn-success px-4 py-2 fw-bold d-flex align-items-center">
                          <FontAwesomeIcon icon={faSave} className="me-2" />
                          {lang === 'ar' ? 'حفظ ومقارنة الحسبة' : 'Save Calculation'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* =========================================================
                  RIGHT COLUMN: SLEEK LIVE AUTO-PREVIEW DASHBOARD
                  ========================================================= */}
                <div className="col-md-5 no-print">
                  {calculatedData ? (
                    <div className="live-preview-card">
                      {/* Header Banner */}
                      <div className="live-preview-header">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div className="d-flex align-items-center gap-1">
                            <span className="badge bg-light text-success fw-bold px-2.5 py-1">
                              <FontAwesomeIcon icon={faSun} className="me-1" />
                              {formatSystemType(calculatedData.systemType)}
                            </span>
                            <span className="badge bg-warning text-dark fw-bold px-2 py-1">
                              {coveragePercent}% {lang === 'ar' ? 'تغطية' : 'Cover'}
                            </span>
                          </div>
                          <small className="text-white-50">{quoteRef}</small>
                        </div>
                        <h3 className="fw-black mb-0 text-white">
                          {formatNumber(calculatedData.systemKw, 1)} <span className="fs-5 fw-normal">kWp</span>
                        </h3>
                        <div className="text-white-50 small mt-1">
                          <FontAwesomeIcon icon={faSolarPanel} className="me-1" />
                          {calculatedData.panels} {lang === 'ar' ? 'لوح شمسي عالي الكفاءة' : 'High Efficiency Modules'}
                        </div>
                      </div>

                      {/* Key Metrics Grid */}
                      <div className="p-3">
                        <div className="row g-2 mb-3">
                          {/* Investment Cost */}
                          <div className="col-6">
                            <div className="live-metric-box highlight h-100">
                              <div className="metric-label">{lang === 'ar' ? 'التكلفة الاستثمارية' : 'Estimated Investment'}</div>
                              <div className="metric-value">{formatNumber(calculatedData.totalSystemCost, 0)} <span className="fs-6 fw-normal">&#x20C1;</span></div>
                            </div>
                          </div>

                          {/* Annual Savings */}
                          <div className="col-6">
                            <div className="live-metric-box highlight h-100">
                              <div className="metric-label">{lang === 'ar' ? 'التوفير السنوي' : 'Annual Savings'}</div>
                              <div className="metric-value">{formatNumber(calculatedData.annualSavingsSar, 0)} <span className="fs-6 fw-normal">&#x20C1;/yr</span></div>
                            </div>
                          </div>

                          {/* Payback Period */}
                          <div className="col-6">
                            <div className="live-metric-box h-100">
                              <div className="metric-label">{lang === 'ar' ? 'فترة الاسترداد' : 'Payback Period'}</div>
                              <div className="metric-value">
                                {calculatedData.paybackYears === Infinity
                                  ? '—'
                                  : `${formatNumber(calculatedData.paybackYears, 1)} ${lang === 'ar' ? 'سنوات' : 'yrs'}`}
                              </div>
                            </div>
                          </div>

                          {/* Area Needed */}
                          <div className="col-6">
                            <div className="live-metric-box h-100">
                              <div className="metric-label">{lang === 'ar' ? 'المساحة المطلوبة' : 'Area Needed'}</div>
                              <div className="metric-value">{formatNumber(calculatedData.areaNeeded, 0)} <span className="fs-6 fw-normal">m²</span></div>
                            </div>
                          </div>

                          {/* Annual Production */}
                          <div className="col-6">
                            <div className="live-metric-box h-100">
                              <div className="metric-label">{lang === 'ar' ? 'الإنتاج السنوي' : 'Annual Generation'}</div>
                              <div className="metric-value">{formatNumber(calculatedData.annualProdKwh, 0)} <span className="fs-6 fw-normal">kWh</span></div>
                            </div>
                          </div>

                          {/* Battery Capacity if present */}
                          {calculatedData.batteryKwhNeeded > 0 ? (
                            <div className="col-6">
                              <div className="live-metric-box h-100">
                                <div className="metric-label">{lang === 'ar' ? 'تخزين البطاريات' : 'Battery Storage'}</div>
                                <div className="metric-value">{formatNumber(calculatedData.batteryKwhNeeded, 1)} <span className="fs-6 fw-normal">kWh</span></div>
                              </div>
                            </div>
                          ) : (
                            <div className="col-6">
                              <div className="live-metric-box h-100">
                                <div className="metric-label">{lang === 'ar' ? 'صافي التوفير (25 سنة)' : '25-Year Net'}</div>
                                <div className="metric-value">{formatNumber(calculatedData.lifetimeNetSavings, 0)} <span className="fs-6 fw-normal">&#x20C1;</span></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* SEC Monthly Electricity Bill Breakdown */}
                        {calculatedData.billBreakdown && calculatedData.billBreakdown.tier1CostSar > 0 && (
                          <div className="card border-0 bg-light p-3 rounded-3 mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="fw-bold mb-0 text-success small">
                                <FontAwesomeIcon icon={faBolt} className="me-1" />
                                {lang === 'ar' ? 'تفكيك فاتورة الكهرباء (شركة SEC):' : 'SEC Tariff Breakdown:'}
                              </h6>
                              <span className="small text-muted">{formatNumber(calculatedData.effectiveKwhPrice, 3)} SAR/kWh</span>
                            </div>
                            <div className="small text-muted">
                              <div className="d-flex justify-content-between py-1 border-bottom">
                                <span>{lang === 'ar' ? `الشريحة 1 (${formatNumber(calculatedData.billBreakdown.tier1Kwh, 0)} ك.و.س):` : `Tier 1 (${formatNumber(calculatedData.billBreakdown.tier1Kwh, 0)} kWh):`}</span>
                                <strong className="text-dark">{formatNumber(calculatedData.billBreakdown.tier1CostSar, 2)} SAR</strong>
                              </div>
                              {calculatedData.billBreakdown.tier2Kwh > 0 && (
                                <div className="d-flex justify-content-between py-1 border-bottom">
                                  <span>{lang === 'ar' ? `الشريحة 2 (${formatNumber(calculatedData.billBreakdown.tier2Kwh, 0)} ك.و.س):` : `Tier 2 (${formatNumber(calculatedData.billBreakdown.tier2Kwh, 0)} kWh):`}</span>
                                  <strong className="text-dark">{formatNumber(calculatedData.billBreakdown.tier2CostSar, 2)} SAR</strong>
                                </div>
                              )}
                              <div className="d-flex justify-content-between py-1 border-bottom">
                                <span>{lang === 'ar' ? `خدمة العداد (${calculatedData.billingDays || 30} يوم):` : `Meter Fee (${calculatedData.billingDays || 30} days):`}</span>
                                <span>{formatNumber(calculatedData.billBreakdown.meterFeeSar, 2)} SAR</span>
                              </div>
                              <div className="d-flex justify-content-between py-1">
                                <span>{lang === 'ar' ? 'ضريبة القيمة المضافة (15%):' : 'VAT (15%):'}</span>
                                <span>{formatNumber(calculatedData.billBreakdown.vatSar, 2)} SAR</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Sanity Alerts if any */}
                        {anomalies.length > 0 && (
                          <div className="alert alert-warning p-2 small mb-3">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="me-1 text-warning" />
                            {anomalies[0][lang === 'ar' ? 'messageAr' : 'messageEn']}
                          </div>
                        )}

                        {/* Live Actions */}
                        <div className="d-grid gap-2 mt-3">
                          <button
                            type="button"
                            className="btn btn-outline-success btn-lg d-flex align-items-center justify-content-center fw-bold"
                            onClick={handlePrintRecommendation}
                          >
                            <FontAwesomeIcon icon={faPrint} className="me-2" />
                            {lang === 'ar' ? 'طباعة وتصدير عرض السعر الرسمي (A4)' : 'Print Official A4 Quotation'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-success btn-lg d-flex align-items-center justify-content-center fw-bold"
                            onClick={handleWhatsAppClick}
                          >
                            <FontAwesomeIcon icon={faWhatsapp} className="me-2 fs-5" />
                            {lang === 'ar' ? 'استشارة فورية عبر واتساب' : 'Direct WhatsApp Inquiry'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="card card-form-holder p-5 text-center text-muted">
                      <FontAwesomeIcon icon={faSolarPanel} className="fa-3x mb-3 text-secondary" />
                      <h5>{lang === 'ar' ? 'المعاينة المباشرة للنظام' : 'Live System Preview'}</h5>
                      <p className="small mb-0">{lang === 'ar' ? 'أدخل بيانات الاستهلاك لتوليد النتائج الفورية' : 'Enter consumption data to view immediate sizing & feasibility.'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Calculation History Table */}
              <div className="row justify-content-center mt-4">
                <div className="col-md-11">
                  <div className="card shadow-sm border-0">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="card-title mb-0">
                          <FontAwesomeIcon icon={faSave} className="text-success me-2" />
                          {t('solarCalc.savedCalcs')}
                        </h5>
                        <small className="text-muted">{t('solarCalc.savedCalcsHelp')}</small>
                      </div>
                      {history.length === 0 ? (
                        <div className="text-muted small">{t('solarCalc.noCalcs')}</div>
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
                                    <td><FontAwesomeIcon icon={useIcon} className="text-success" /></td>
                                    <td>{formatSystemType(data.systemType)}</td>
                                    <td>{formatNumber(data.systemKw, 1)} kW</td>
                                    <td>{formatNumber(data.panels, 0)}</td>
                                    <td>{formatNumber(data.totalSystemCost, 0)} SAR</td>
                                    <td>{data.batteryKwhNeeded ? `${formatNumber(data.batteryKwhNeeded, 1)} kWh` : '-'}</td>
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
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================
          DEDICATED A4 PRINTABLE QUOTATION (Visible ONLY on Print)
          ========================================================= */}
      {calculatedData && (
        <div id="printableQuotationA4" className="print-only a4-quotation-document">
          {/* Header: Company branding, CR, Quote info */}
          <div className="a4-header-box d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <img src={aqtraLogo} alt="AQTRA Logo" className="a4-brand-logo" />
              <div>
                <h4 className="fw-bold mb-0 text-success" style={{ fontSize: '1.05rem', lineHeight: '1.2' }}>
                  {lang === 'ar' ? 'مؤسسة أكترا للتجارة والمقاولات' : 'AQTRA Contracting & Trading'}
                </h4>
                <div className="text-muted" style={{ fontSize: '6.8pt', lineHeight: '1.2' }}>
                  {lang === 'ar'
                    ? 'سجل تجاري: ١٠١٠٦٢٩٦٦٨ | الرقم الضريبي: ٣٠٠٠١٢٣٤٥٦٠٠٠٠٣ | الرياض، المملكة العربية السعودية'
                    : 'CR: 1010629668 | VAT No: 300012345600003 | Riyadh, Kingdom of Saudi Arabia'}
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <img src={vision2030Logo} alt="Saudi Vision 2030" className="a4-vision-logo" />
              <div className="text-end">
                <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                  {lang === 'ar' ? 'عرض سعر ومواصفات فنية' : 'TECHNICAL PRICE QUOTATION'}
                </div>
                <div className="d-flex justify-content-end align-items-center gap-1 my-0.5">
                  <span className="a4-ref-badge font-monospace">{quoteRef}</span>
                </div>
                <div style={{ fontSize: '6.8pt', color: '#475569' }}>
                  <strong>{lang === 'ar' ? 'التاريخ:' : 'Date:'}</strong> {quoteDate} | <strong>{lang === 'ar' ? 'الصلاحية:' : 'Valid:'}</strong> {quoteValidUntil}
                </div>
              </div>
            </div>
          </div>

          {/* Client Info & Engineering Parameters */}
          <div className="row g-2 mb-1.5 a4-avoid-break">
            <div className="col-6">
              <div className="a4-info-card">
                <div className="fw-bold text-success border-bottom pb-0.5 mb-1" style={{ fontSize: '7.5pt' }}>
                  <FontAwesomeIcon icon={faUser} className="me-1" />
                  {lang === 'ar' ? 'بيانات العميل والمشروع' : 'Client & Project Details'}
                </div>
                <div><strong>{lang === 'ar' ? 'العميل / المنشأة:' : 'Client:'}</strong> {clientCompany || clientContact || (lang === 'ar' ? 'العميل المحترم' : 'Valued Client')}</div>
                <div><strong>{lang === 'ar' ? 'رقم التواصل:' : 'Phone:'}</strong> {clientPhone || '—'}</div>
                <div><strong>{lang === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</strong> {clientEmail || '—'}</div>
              </div>
            </div>
            <div className="col-6">
              <div className="a4-info-card">
                <div className="fw-bold text-success border-bottom pb-0.5 mb-1" style={{ fontSize: '7.5pt' }}>
                  <FontAwesomeIcon icon={faBuilding} className="me-1" />
                  {lang === 'ar' ? 'محددات التصميم الهندسي' : 'Engineering Design Parameters'}
                </div>
                <div><strong>{lang === 'ar' ? 'نوع المنشأة:' : 'Site Type:'}</strong> {formatPrimaryUseLabel(primaryUse)} | <strong>{lang === 'ar' ? 'النمط:' : 'Mode:'}</strong> {formatSystemType(calculatedData.systemType)}</div>
                <div><strong>{lang === 'ar' ? 'نسبة التغطية المستهدفة:' : 'Target Coverage:'}</strong> {coveragePercent}% ({coveragePercent === 100 ? (lang === 'ar' ? 'تصفير الفاتورة' : 'Net Zero') : coveragePercent === 75 ? (lang === 'ar' ? 'تغطية 75%' : '75% Offset') : (lang === 'ar' ? 'تغطية 50% نهارية' : '50% Daytime')})</div>
                <div><strong>{lang === 'ar' ? 'القدرة التصميمية:' : 'Rated Size:'}</strong> {formatNumber(calculatedData.systemKw, 1)} kWp ({calculatedData.panels} {lang === 'ar' ? 'لوح شمسي' : 'panels'})</div>
              </div>
            </div>
          </div>

          {/* BOQ Table (جدول الكميات والمواصفات الفنية) */}
          <div className="a4-avoid-break mb-1.5">
            <div className="fw-bold mb-0.5 text-dark" style={{ fontSize: '7.8pt' }}>
              <FontAwesomeIcon icon={faFileContract} className="me-1 text-success" />
              {lang === 'ar' ? 'جدول الكميات والمواصفات الفنية المعتمدة (BOQ):' : 'Approved Bill of Quantities & Technical Specifications (BOQ):'}
            </div>
            <table className="a4-table">
              <thead>
                <tr>
                  <th style={{ width: '4%', textAlign: 'center' }}>#</th>
                  <th style={{ width: '25%' }}>{lang === 'ar' ? 'بند النظام' : 'Component'}</th>
                  <th style={{ width: '59%' }}>{lang === 'ar' ? 'المواصفات الفنية المعتمدة' : 'Technical Specifications'}</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>{lang === 'ar' ? 'الكمية' : 'Qty'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'center' }}>1</td>
                  <td className="fw-bold">{lang === 'ar' ? 'الألواح الشمسية الضوئية' : 'PV Solar Modules'}</td>
                  <td>
                    {lang === 'ar'
                      ? `ألوح شمسية أحادية البلورة عالية الكفاءة (A-Grade Monocrystalline Tier 1) بقدرة ${calculatedData.selectedPanel.wattage} واط لكل لوح.`
                      : `High-efficiency Monocrystalline A-Grade PV Modules (${calculatedData.selectedPanel.label} tier, ${calculatedData.selectedPanel.wattage}W per module).`}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{calculatedData.panels} {lang === 'ar' ? 'لوح' : 'Pcs'}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>2</td>
                  <td className="fw-bold">{lang === 'ar' ? 'محولات الطاقة (العواكس)' : 'Smart Solar Inverters'}</td>
                  <td>
                    {splitMeters && metersCount > 1
                      ? (lang === 'ar' ? `عواكس طاقة شمسية ذكية بقدرة ${(calculatedData.systemKw / metersCount).toFixed(1)} ك.و لكل عداد مع لوحات التوزيع.` : `Smart Inverters rated at ${(calculatedData.systemKw / metersCount).toFixed(1)} kW per split meter.`)
                      : (lang === 'ar' ? `عاكس طاقة شمسية ذكي بقدرة ${Math.ceil(calculatedData.systemKw)} ك.و متوافق مع نظام الربط والتشغيل المعتمد.` : `Smart Solar Inverter rated at ${Math.ceil(calculatedData.systemKw)} kW matching grid integration standard.`)}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {splitMeters && metersCount > 1 ? `${metersCount} ${lang === 'ar' ? 'وحدات' : 'Sets'}` : `1 ${lang === 'ar' ? 'وحدة' : 'Set'}`}
                  </td>
                </tr>
                {calculatedData.batteryKwhNeeded > 0 && (
                  <tr>
                    <td style={{ textAlign: 'center' }}>3</td>
                    <td className="fw-bold">{lang === 'ar' ? 'بطاريات تخزين الليثيوم' : 'LiFePO4 Battery Storage'}</td>
                    <td>
                      {lang === 'ar'
                        ? `نظام بطاريات ليثيوم حديد فوسفات (LiFePO4) بسعة إجمالية ${formatNumber(calculatedData.batteryKwhNeeded, 1)} ك.و.س مع إدارة ذكية BMS.`
                        : `Lithium Iron Phosphate (LiFePO4) Battery System with total capacity of ${formatNumber(calculatedData.batteryKwhNeeded, 1)} kWh and smart BMS.`}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                      {splitMeters && metersCount > 1 ? `${metersCount} ${lang === 'ar' ? 'أنظمة' : 'Sets'}` : `1 ${lang === 'ar' ? 'نظام' : 'Set'}`}
                    </td>
                  </tr>
                )}
                <tr>
                  <td style={{ textAlign: 'center' }}>{calculatedData.batteryKwhNeeded > 0 ? 4 : 3}</td>
                  <td className="fw-bold">{lang === 'ar' ? 'الهياكل وحوامل الألواح' : 'Mounting Structures'}</td>
                  <td>
                    {lang === 'ar'
                      ? 'هياكل تثبيت من الألمنيوم المؤكسد والفولاذ المجلفن عالي المقاومة ومضاد للتآكل ومقاوم للرياح الشديدة.'
                      : 'Heavy-duty anodized aluminum & galvanized steel structures engineered for high wind load tolerance.'}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>1 {lang === 'ar' ? 'مجموعة' : 'Lot'}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>{calculatedData.batteryKwhNeeded > 0 ? 5 : 4}</td>
                  <td className="fw-bold">{lang === 'ar' ? 'الكابلات ولوحات الحماية' : 'DC/AC Cabling & Protection'}</td>
                  <td>
                    {lang === 'ar'
                      ? 'كابلات شمسية مخصصة ومقاومة للأشعة، لوحات DC/AC مع قواطع حماية وموانع صواعق SPD وتأريض متكامل.'
                      : 'UV-resistant DC solar cables, AC cabling, combiner protection boxes with surge protection devices (SPD), circuit breakers and grounding.'}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>1 {lang === 'ar' ? 'مجموعة' : 'Lot'}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center' }}>{calculatedData.batteryKwhNeeded > 0 ? 6 : 5}</td>
                  <td className="fw-bold">{lang === 'ar' ? 'الهندسة والتركيب والفحص' : 'EPC, Testing & Grid Connection'}</td>
                  <td>
                    {lang === 'ar'
                      ? 'المخططات الهندسية المعتمدة، التركيبات، الفحص والتشغيل والتنسيق لاعتماد شركة الكهرباء SEC.'
                      : 'Full engineering drawings, installation, commissioning, performance testing, and coordination for SEC utility approval.'}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>1 {lang === 'ar' ? 'عملية' : 'Job'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Summary & Feasibility Indicators (Side-by-side) */}
          <div className="row g-2 mb-1.5 a4-avoid-break">
            <div className="col-6">
              <div className="a4-financial-summary">
                <div className="fw-bold text-success border-bottom pb-0.5 mb-1" style={{ fontSize: '7.5pt' }}>
                  <FontAwesomeIcon icon={faCoins} className="me-1" />
                  {lang === 'ar' ? 'الجدول المالي والاستثماري' : 'Commercial & Financial Summary'}
                </div>
                <div className="d-flex justify-content-between py-0.5">
                  <span>{lang === 'ar' ? 'قيمة المنظومة الأساسية:' : 'Base Package Price:'}</span>
                  <span className="fw-semibold">{formatNumber(calculatedData.packagePriceSar, 2)} SAR</span>
                </div>
                {calculatedData.batteryCost > 0 && (
                  <div className="d-flex justify-content-between py-0.5">
                    <span>{lang === 'ar' ? 'إضافة بنك البطاريات:' : 'Battery Storage Bank:'}</span>
                    <span className="fw-semibold">{formatNumber(calculatedData.batteryCost, 2)} SAR</span>
                  </div>
                )}
                {splitMeters && metersCount > 1 && (
                  <div className="d-flex justify-content-between py-0.5">
                    <span>{lang === 'ar' ? `إضافة تقسيم ${metersCount} عدادات:` : `Multi-meter Adder (${metersCount}):`}</span>
                    <span className="fw-semibold">{formatNumber((calculatedData as any).splitMetersCost || 0, 2)} SAR</span>
                  </div>
                )}
                <div className="d-flex justify-content-between py-0.5 border-top fw-bold">
                  <span>{lang === 'ar' ? 'الإجمالي قبل الضريبة:' : 'Subtotal (Excl. VAT):'}</span>
                  <span>{formatNumber(calculatedData.totalSystemCost, 2)} SAR</span>
                </div>
                <div className="d-flex justify-content-between py-0.5 text-muted" style={{ fontSize: '7.2pt' }}>
                  <span>{lang === 'ar' ? 'ضريبة القيمة المضافة (15%):' : 'VAT (15%):'}</span>
                  <span>{formatNumber(calculatedData.totalSystemCost * 0.15, 2)} SAR</span>
                </div>
                <div className="d-flex justify-content-between align-items-center total-row mt-1">
                  <span>{lang === 'ar' ? 'الإجمالي شامل الضريبة:' : 'Total Investment (Incl. VAT):'}</span>
                  <span>{formatNumber(calculatedData.totalSystemCost * 1.15, 2)} SAR</span>
                </div>
              </div>
            </div>

            <div className="col-6">
              <div className="a4-roi-summary">
                <div className="fw-bold text-success border-bottom pb-0.5 mb-1" style={{ fontSize: '7.5pt' }}>
                  <FontAwesomeIcon icon={faChartLine} className="me-1" />
                  {lang === 'ar' ? 'مؤشرات الجدوى والعائد المالي' : 'Feasibility & ROI Indicators'}
                </div>
                <div className="d-flex justify-content-between py-0.5">
                  <span>{lang === 'ar' ? 'الإنتاج السنوي المتوقع:' : 'Annual Generation:'}</span>
                  <strong className="text-dark">{formatNumber(calculatedData.annualProdKwh, 0)} kWh</strong>
                </div>
                <div className="d-flex justify-content-between py-0.5">
                  <span>{lang === 'ar' ? 'التوفير السنوي المتوقع:' : 'Annual Savings:'}</span>
                  <strong className="text-success">{formatNumber(calculatedData.annualSavingsSar, 0)} SAR/yr</strong>
                </div>
                <div className="d-flex justify-content-between py-0.5">
                  <span>{lang === 'ar' ? 'فترة استرداد رأس المال:' : 'Payback Period:'}</span>
                  <strong className="text-primary">{calculatedData.paybackYears === Infinity ? '—' : `${formatNumber(calculatedData.paybackYears, 1)} ${lang === 'ar' ? 'سنوات' : 'Years'}`}</strong>
                </div>
                <div className="d-flex justify-content-between py-0.5">
                  <span>{lang === 'ar' ? 'صافي التوفير (25 سنة):' : '25-Yr Net Savings:'}</span>
                  <strong className="text-dark">{formatNumber(calculatedData.lifetimeNetSavings, 0)} SAR</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Warranties & Terms */}
          <div className="a4-avoid-break mb-1.5">
            <div className="a4-warranties-bar">
              <div className="fw-bold text-dark mb-0.5">
                <FontAwesomeIcon icon={faShieldAlt} className="me-1 text-success" />
                {lang === 'ar' ? 'الضمانات والشروط المعتمدة:' : 'Approved Warranties & Standards:'}
              </div>
              <div className="row g-1">
                <div className="col-6">• {lang === 'ar' ? 'ضمان أداء الألواح: 25 سنة ضمان خطي على كفاءة توليد الطاقة.' : 'Solar Panels: 25 years linear power performance warranty.'}</div>
                <div className="col-6">• {lang === 'ar' ? 'ضمان العواكس والبطاريات: 5 إلى 10 سنوات ضمان مصنعي معتمد.' : 'Inverters & Batteries: 5 to 10 years manufacturer warranty.'}</div>
                <div className="col-6">• {lang === 'ar' ? 'ضمان التركيب والأعمال: سنتان ضمان شامل على كافة التركيبات من مؤسسة أكترا.' : 'Workmanship: 2 years full comprehensive EPC installation warranty.'}</div>
                <div className="col-6">• {lang === 'ar' ? 'صلاحية عرض السعر: 30 يوماً من تاريخ الإصدار المحدد أعلاه.' : 'Offer Validity: 30 days from date of issuance.'}</div>
              </div>
            </div>
          </div>

          {/* Stamp & Signatures */}
          <div className="a4-avoid-break pt-1">
            <div className="row text-center" style={{ fontSize: '7.5pt' }}>
              <div className="col-6">
                <div className="a4-stamp-box">
                  <div className="fw-bold text-success mb-0.5">{lang === 'ar' ? 'الجهة المنفذة: مؤسسة أكترا للتجارة والمقاولات' : 'Contractor: AQTRA Trading & Contracting'}</div>
                  <div className="text-muted" style={{ fontSize: '6.8pt' }}>{lang === 'ar' ? 'الختم والتوقيع المعتمد' : 'Authorized Signature & Seal'}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="a4-stamp-box">
                  <div className="fw-bold text-dark mb-0.5">{lang === 'ar' ? 'موافقة واعتماد العميل' : 'Client Acceptance & Signature'}</div>
                  <div className="text-muted" style={{ fontSize: '6.8pt' }}>{lang === 'ar' ? 'التوقيع / الختم' : 'Signature / Stamp'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SolarApplicationForm;
