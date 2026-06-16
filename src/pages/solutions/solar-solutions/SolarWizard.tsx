import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderBanner from '@/components/HeaderBanner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBolt,
  faNetworkWired,
  faCarBattery,
  faSolarPanel,
  faBuilding,
  faEnvelope,
  faPhone,
  faUser,
  faMapMarkerAlt,
  faScaleUnbalanced,
  faDownload,
  faCheckCircle,
  faArrowRight,
  faArrowLeft,
  faExclamationTriangle,
  faCoins,
  faWrench,
  faFilePdf,
} from '@fortawesome/free-solid-svg-icons';
import {
  computeSolarEstimate,
  PANEL_PRICING,
  SAUDI_ELECTRICITY_TARIFFS_HALALAS,
  VAT_RATE,
} from '@/lib/saudiElectricityTariffs';

import './SolarWizard.css';

// Localized wizard content to ensure perfect English & Arabic support without side-effects.
const WIZARD_TRANSLATIONS = {
  ar: {
    title: 'مساعد اختيار النظام الشمسي الذكي',
    subtitle: 'أجب عن بضع أسئلة للوصول إلى النظام الأنسب لك واستلام عرض سعر مبدئي فوري.',
    stepBasis: 'أساس الحساب',
    stepCons: 'تفاصيل الاستهلاك',
    stepSys: 'الربط والبطاريات',
    stepArea: 'الألواح والمساحة',
    stepQuote: 'عرض السعر والتحميل',

    basisQ: 'كيف ترغب في حساب مقاس نظامك الشمسي؟',
    basisOptProd: 'حساب بناءً على الاستهلاك أو قيمة الفاتورة الشهرية',
    basisOptProdDesc: 'مناسب لتقدير النظام الأمثل لتغطية أحمالك وتوفير التكلفة.',
    basisOptSize: 'تحديد سعة النظام مباشرة بالكيلوواط (kWp)',
    basisOptSizeDesc: 'إذا كنت تعرف السعة المطلوبة بالفعل وترغب في حساب التكلفة والمكونات مباشرة.',

    sysKwLabel: 'سعة النظام المطلوبة (كيلوواط ذروة - kWp)',
    sysKwPlaceholder: 'مثال: 15',

    consQ: 'كيف تفضل إدخال بيانات استهلاكك للكهرباء؟',
    consOptKwh: 'الاستهلاك الشهري التقديري (كيلوواط ساعة - kWh)',
    consOptBill: 'قيمة الفاتورة الكهربائية الشهرية (ريال سعودي)',

    kwhLabel: 'الاستهلاك الشهري (kWh)',
    billLabel: 'الفاتورة الشهرية (ريال)',

    tariffQ: 'اختر الشريحة أو نوع التعرفة الكهربائية للموقع:',
    tariffResidential: 'سكني (18 / 30 هللة)',
    tariffCommercial: 'تجاري (22 / 32 هللة)',
    tariffAgricultural: 'زراعي (18 / 22 هللة)',
    tariffIndustrial: 'صناعي (20 هللة)',
    tariffCustom: 'سعر مخصص لكل كيلوواط ساعة (كتابة يدوي)',
    tariffCustomPriceLabel: 'سعر الكيلوواط ساعة المخصص (ريال)',

    currentTariffDetails: 'تفاصيل التعرفة المحددة:',
    tariffTier1: 'شريحة 1 (حتى 6000 ك.و.س): {{rate}} ريال/ك.و.س',
    tariffTier2: 'شريحة 2 (ما فوق 6000 ك.و.س): {{rate}} ريال/ك.و.س',
    tariffFlat: 'سعر ثابت: {{rate}} ريال/ك.و.س',

    connectionQ: 'هل ترغب في ربط النظام بالشبكة الكهربائية أم مع بطاريات؟',
    connOptOnGrid: 'نظام مرتبط بالشبكة فقط (On-Grid)',
    connOptOnGridDesc: 'الأقل تكلفة والأعلى توفيراً. يفصل تلقائياً أثناء انقطاع الشبكة لسلامة الفنيين.',
    connOptHybrid: 'نظام مع بطاريات احتياطية (Hybrid / Off-Grid)',
    connOptHybridDesc: 'يغذي أحمالك ويشحن البطاريات، ويوفر طاقة احتياطية عند انقطاع الكهرباء.',

    batterySuggestTitle: 'سعة البطاريات المقترحة لحملك التقديري:',
    batterySizeLabel: 'سعة بنك البطاريات (كيلوواط ساعة - kWh)',
    batteryCostNotice: 'تكلفة البطاريات التقديرية: +{{cost}} ريال (شاملة عواكس متطورة وبطاريات ليثيوم LiFePO4).',

    panelsQ: 'حساب عدد الألواح الشمسية والمساحة المطلوبة:',
    panelCountLabel: 'عدد الألواح المطلوبة',
    panelRecalculated: 'تم تعديل عدد الألواح بناءً على إدخالك المخصص.',
    availableAreaLabel: 'مساحة الأرض أو السطح المتوفرة لديك (متر مربع - م²)',
    panelAreaLabel: 'المساحة المطلوبة لكل لوح (م² - حسب زاوية التركيب والتباعد)',
    panelAreaHelper: 'تتضمن المساحة الممرات والتباعد لمنع التظليل. القيمة القياسية هي 5 م² للوح.',

    premiumRecTitle: '⚠️ المساحة المتاحة صغيرة بالنسبة للألواح القياسية!',
    premiumRecBody: 'مساحة السطح المتوفرة ({{avail}} م²) لا تتسع للألواح القياسية المطلوبة (المساحة اللازمة {{needed}} م²). لقد قمنا بترشيح الألواح عالية الكفاءة (Premium - 635 واط) وإعادة الحساب لتناسب المساحة المتاحة.',
    premiumFitSuccess: '✅ تم بنجاح ملاءمة النظام لمساحة السطح باستخدام الألواح عالية الكفاءة بمساحة إجمالية {{needed}} م².',
    premiumStillBig: '⚠️ حتى مع الألواح عالية الكفاءة، المساحة المتاحة غير كافية بالكامل. يُنصح بتقليص سعة النظام أو استخدام مساحات أرضية إضافية.',

    quoteTitle: 'عرض السعر المبدئي والمكونات المقترحة',
    quoteCompanyTitle: 'بيانات الشركة والعميل لتصدير العرض الرسمي:',
    clientCompany: 'اسم الشركة / المؤسسة',
    clientName: 'اسم مسؤول التواصل *',
    clientPhone: 'رقم الهاتف / الجوال *',
    clientEmail: 'البريد الإلكتروني *',

    generatePdf: 'إصدار وتحميل عرض السعر (PDF)',
    whatsappConsult: 'استشارة فورية عبر واتساب',

    quoteHeader: 'عرض سعر مبدئي لنظام طاقة شمسية',
    quoteRef: 'مرجع العرض',
    quoteDate: 'التاريخ',
    techDetails: 'التفاصيل الفنية للنظام المقترح',
    boqTitle: 'جدول الكميات والمكونات الرئيسية (BOQ)',

    itemPanels: 'ألواح شمسية كهروضوئية عالية الكفاءة (A-Grade Monocrystalline)',
    itemInverter: 'عاكس شمسي متطور ذكي مع لوحة التحكم والحماية والربط الذكي',
    itemBattery: 'بنك بطاريات ليثيوم (LiFePO4) مع نظام إدارة البطارية الذكي BMS',
    itemStructure: 'هياكل تثبيت معدنية مجلفنة ومقاومة للرياح وعوامل الرطوبة',
    itemCables: 'كابلات تيار مستمر ومتناوب مقاومة لأشعة الشمس والظروف الخارجية والملحقات الكهربائية',
    itemInstall: 'الأعمال الهندسية، التركيب، البرمجة، التشغيل، واعتمادات شركة الكهرباء',

    boqColItem: 'البند والمكونات',
    boqColSpecs: 'المواصفات الفنية المقترحة',
    boqColQty: 'الكمية',

    commercialTitle: 'التكلفة المالية الإجمالية',
    packagePrice: 'سعر باقة النظام الشمسي الأساسي:',
    batteryCost: 'تكلفة بنك البطاريات والترقيات:',
    subtotal: 'الإجمالي الفرعي الخاضع للضريبة:',
    vat: 'ضريبة القيمة المضافة (15%):',
    netTotal: 'الإجمالي النهائي للطلب (ريال سعودي):',

    warrantyTerms: 'الضمان والجودة:',
    warrantyText: 'يوجد ضمان على القطع والتركيب يتم الإعلان عنه عند اختيار المنتجات مع العرض النهائي.',

    requiredField: 'هذا الحقل مطلوب',
    fillRequired: 'يرجى ملء الحقول المطلوبة لإصدار عرض السعر بالاسم.',
    back: 'السابق',
    next: 'التالي',

    // Sidebar translations
    sidebarTitle: 'ملخص النظام والنتائج الحية',
    sidebarSectionInputs: 'المدخلات الحالية',
    sidebarSectionResults: 'النتائج والتقديرات',
    sidebarMethod: 'طريقة التصميم',
    sidebarTariff: 'التعرفة المحددة',
    sidebarStorage: 'سعة البطارية',
    sidebarArea: 'المساحة المطلوبة',
    sidebarSystemKw: 'قدرة المحطة الكلية',
    sidebarPanels: 'عدد الألواح',
    sidebarCost: 'التكلفة شاملة الضريبة',
    sidebarPayback: 'فترة الاسترداد',
    sidebarSavings: 'التوفير السنوي',
    sidebarNoData: 'أكمل إدخال البيانات لعرض الحسابات الحية هنا.',
  },
  en: {
    title: 'Smart Solar Sizing Assistant',
    subtitle: 'Answer a few simple questions to find the best solar system and receive an instant preliminary quote.',
    stepBasis: 'Sizing Basis',
    stepCons: 'Consumption Info',
    stepSys: 'Grid & Backup',
    stepArea: 'Panels & Space',
    stepQuote: 'Quotation & Download',

    basisQ: 'How would you like to estimate your solar system size?',
    basisOptProd: 'Calculate based on monthly consumption or electricity bill',
    basisOptProdDesc: 'Recommended to design the optimal system to cover your load and maximize savings.',
    basisOptSize: 'Specify system capacity directly in kilowatts (kWp)',
    basisOptSizeDesc: 'If you already know the required DC solar capacity and want to compute cost and components.',

    sysKwLabel: 'Target System Capacity (kWp)',
    sysKwPlaceholder: 'Example: 15',

    consQ: 'How would you like to enter your electricity usage?',
    consOptKwh: 'Monthly consumption estimate (kWh)',
    consOptBill: 'Monthly electricity bill value (SAR)',

    kwhLabel: 'Monthly Consumption (kWh)',
    billLabel: 'Monthly Bill (SAR)',

    tariffQ: 'Select your site electricity tariff tier:',
    tariffResidential: 'Residential (18 / 30 Halalas)',
    tariffCommercial: 'Commercial (22 / 32 Halalas)',
    tariffAgricultural: 'Agricultural (18 / 22 Halalas)',
    tariffIndustrial: 'Industrial (20 Halalas)',
    tariffCustom: 'Custom price per kWh (Manual input)',
    tariffCustomPriceLabel: 'Custom price per kWh (SAR)',

    currentTariffDetails: 'Selected Tariff Details:',
    tariffTier1: 'Tier 1 (Up to 6000 kWh): {{rate}} SAR/kWh',
    tariffTier2: 'Tier 2 (Above 6000 kWh): {{rate}} SAR/kWh',
    tariffFlat: 'Flat Rate: {{rate}} SAR/kWh',

    connectionQ: 'Do you want the solar system connected to the grid or with batteries?',
    connOptOnGrid: 'On-Grid System (Grid connected only)',
    connOptOnGridDesc: 'Lowest capital cost and fastest payback. Shuts off automatically during grid failures for safety.',
    connOptHybrid: 'Hybrid / Off-Grid System (With battery storage)',
    connOptHybridDesc: 'Supplies your loads and charges batteries, providing backup power during blackouts.',

    batterySuggestTitle: 'Suggested battery bank capacity for your load:',
    batterySizeLabel: 'Battery Bank Capacity (kWh)',
    batteryCostNotice: 'Estimated battery cost: +{{cost}} SAR (includes hybrid inverters and LiFePO4 chemistry).',

    panelsQ: 'Calculate required solar panels and area:',
    panelCountLabel: 'Number of Panels Required',
    panelRecalculated: 'Panel count updated based on custom entry.',
    availableAreaLabel: 'Available land or roof area (Square meters - m²)',
    panelAreaLabel: 'Required footprint area per panel (m² - including tilt spacing)',
    panelAreaHelper: 'Includes maintenance walkways and tilt shading clearances. Default is 5 m² per panel.',

    premiumRecTitle: '⚠️ Available roof space is small for standard panels!',
    premiumRecBody: 'Your available space ({{avail}} m²) is less than standard panels requirement ({{needed}} m²). We have recommended high-efficiency panels (Premium - 635W) and recalculated to fit.',
    premiumFitSuccess: '✅ System successfully optimized to fit your space using high-efficiency panels. Total area: {{needed}} m².',
    premiumStillBig: '⚠️ Even with premium high-efficiency panels, the available area is insufficient. Consider reducing kW capacity or utilizing ground mounts.',

    quoteTitle: 'Preliminary Price Quote & Proposed BOQ',
    quoteCompanyTitle: 'Enter Company & Client Details to Export Official PDF Offer:',
    clientCompany: 'Company / Organization Name',
    clientName: 'Contact Person Name *',
    clientPhone: 'Phone / Mobile Number *',
    clientEmail: 'Email Address *',

    generatePdf: 'Generate & Save Quote (PDF)',
    whatsappConsult: 'Direct WhatsApp Consultation',

    quoteHeader: 'Solar Photovoltaic System Preliminary Quotation',
    quoteRef: 'Quote Ref',
    quoteDate: 'Date',
    techDetails: 'Technical Sizing Details',
    boqTitle: 'Bill of Quantities & Key Components (BOQ)',

    itemPanels: 'High-Efficiency Tier-1 Monocrystalline A-Grade Solar Panels',
    itemInverter: 'Sleek Smart Solar Inverter with Integrated ATS, Monitoring, and Safety Boxes',
    itemBattery: 'Lithium Iron Phosphate (LiFePO4) Battery Bank with Intelligent BMS',
    itemStructure: 'High-Durability Anodized Aluminum Mounting Structure (Wind Resistant)',
    itemCables: 'Sunlight-Resistant Solar DC Cables, AC Cables, Trays, and Connectors',
    itemInstall: 'Engineering Drawings, Civil works, Electrical Wiring, Testing & Commissioning',

    boqColItem: 'Item Description',
    boqColSpecs: 'Technical Specifications',
    boqColQty: 'Qty',

    commercialTitle: 'Commercial Terms & Summary',
    packagePrice: 'Base Solar System Package Price:',
    batteryCost: 'Battery Bank & Hybrid Inverter Upgrade:',
    subtotal: 'Taxable Subtotal:',
    vat: 'Value Added Tax (15% VAT):',
    netTotal: 'Total Proposal Price (SAR):',

    warrantyTerms: 'Guarantees & Warranties:',
    warrantyText: 'There is a warranty on parts and installation, which will be announced upon selecting the products with the final quotation.',

    requiredField: 'This field is required',
    fillRequired: 'Please complete all required fields to print your personalized quotation.',
    back: 'Back',
    next: 'Next',

    // Sidebar translations
    sidebarTitle: 'Live System Summary',
    sidebarSectionInputs: 'Current Inputs',
    sidebarSectionResults: 'Live Estimates',
    sidebarMethod: 'Design Method',
    sidebarTariff: 'Tariff Selected',
    sidebarStorage: 'Battery Storage',
    sidebarArea: 'Required Space',
    sidebarSystemKw: 'Total Capacity',
    sidebarPanels: 'Panels Count',
    sidebarCost: 'Cost (incl. VAT)',
    sidebarPayback: 'Payback Period',
    sidebarSavings: 'Annual Savings',
    sidebarNoData: 'Complete step inputs to view live estimates here.',
  }
};

const SolarWizard: React.FC = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const lang = i18n.language === 'ar' ? 'ar' : 'en';

  const tW = (key: keyof typeof WIZARD_TRANSLATIONS['ar'], replacements?: Record<string, string | number>) => {
    let text = WIZARD_TRANSLATIONS[lang][key] || WIZARD_TRANSLATIONS['ar'][key] || '';
    if (replacements) {
      Object.keys(replacements).forEach((rKey) => {
        text = text.replace(`{{${rKey}}}`, String(replacements[rKey]));
      });
    }
    return text;
  };

  // State Management
  const [currentStep, setCurrentStep] = useState(1);
  const [sizingBasis, setSizingBasis] = useState<'energy' | 'capacity'>('energy');
  const [directKw, setDirectKw] = useState<number | ''>('');

  // Step 2
  const [inputType, setInputType] = useState<'kwh' | 'bill'>('kwh');
  const [monthlyKwhInput, setMonthlyKwhInput] = useState<number | ''>('');
  const [monthlyBillInput, setMonthlyBillInput] = useState<number | ''>('');
  const [tariffType, setTariffType] = useState<'residential' | 'commercial' | 'agricultural' | 'industrial' | 'custom'>('residential');
  const [customTariffPrice, setCustomTariffPrice] = useState<number | ''>('');

  // Step 3
  const [connectionType, setConnectionType] = useState<'onGrid' | 'hybrid'>('onGrid');
  const [customBatteryKwh, setCustomBatteryKwh] = useState<number | ''>('');
  const [isBatteryOverridden, setIsBatteryOverridden] = useState(false);

  // Step 4
  const [customPanelCount, setCustomPanelCount] = useState<number | ''>('');
  const [isPanelOverridden, setIsPanelOverridden] = useState(false);
  const [availableArea, setAvailableArea] = useState<number | ''>('');
  const [panelAreaM2, setPanelAreaM2] = useState<number>(5.0); // Default standard panel footprint including spacing
  const [inverterCount, setInverterCount] = useState<number>(1);

  // Step 5 - Contact Info
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Sizing Calculations Helper
  const [calculatedData, setCalculatedData] = useState<any>(null);

  useEffect(() => {
    document.body.classList.add('solar-wizard-page');
    return () => {
      document.body.classList.remove('solar-wizard-page');
    };
  }, []);

  // Restore saved choices from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('solar_wizard_saved_choices');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config.sizingBasis) setSizingBasis(config.sizingBasis);
        if (config.directKw !== undefined) setDirectKw(config.directKw);
        if (config.inputType) setInputType(config.inputType);
        if (config.monthlyKwhInput !== undefined) setMonthlyKwhInput(config.monthlyKwhInput);
        if (config.monthlyBillInput !== undefined) setMonthlyBillInput(config.monthlyBillInput);
        if (config.tariffType) setTariffType(config.tariffType);
        if (config.customTariffPrice !== undefined) setCustomTariffPrice(config.customTariffPrice);
        if (config.connectionType) setConnectionType(config.connectionType);
        if (config.customBatteryKwh !== undefined) setCustomBatteryKwh(config.customBatteryKwh);
        if (config.isBatteryOverridden !== undefined) setIsBatteryOverridden(config.isBatteryOverridden);
        if (config.customPanelCount !== undefined) setCustomPanelCount(config.customPanelCount);
        if (config.isPanelOverridden !== undefined) setIsPanelOverridden(config.isPanelOverridden);
        if (config.availableArea !== undefined) setAvailableArea(config.availableArea);
        if (config.panelAreaM2 !== undefined) setPanelAreaM2(config.panelAreaM2);
        if (config.inverterCount !== undefined) setInverterCount(config.inverterCount);
        if (config.companyName !== undefined) setCompanyName(config.companyName);
        if (config.contactName !== undefined) setContactName(config.contactName);
        if (config.phone !== undefined) setPhone(config.phone);
        if (config.email !== undefined) setEmail(config.email);
        if (config.currentStep) setCurrentStep(config.currentStep);
      } catch (e) {
        console.error('Failed to parse saved solar wizard config', e);
      }
    }
  }, []);

  // Dynamic calculations based on state change
  useEffect(() => {
    // 1. Establish monthly kWh
    let resolvedMonthlyKwh = 0;
    let effectiveKwhPrice = 0.18; // default residential tier 1

    const tariffObj = {
      type: (tariffType === 'residential' || tariffType === 'commercial' || tariffType === 'agricultural') ? 'tiered' : 'flat',
      tier1LimitKwh: 6000,
      tier1HalalasPerKwh: 18,
      tier2HalalasPerKwh: 30,
      halalasPerKwh: 18,
    } as any;

    if (tariffType === 'residential') {
      tariffObj.tier1HalalasPerKwh = SAUDI_ELECTRICITY_TARIFFS_HALALAS.tiered.residential.tier1;
      tariffObj.tier2HalalasPerKwh = SAUDI_ELECTRICITY_TARIFFS_HALALAS.tiered.residential.tier2;
    } else if (tariffType === 'commercial') {
      tariffObj.tier1HalalasPerKwh = SAUDI_ELECTRICITY_TARIFFS_HALALAS.tiered.commercial.tier1;
      tariffObj.tier2HalalasPerKwh = SAUDI_ELECTRICITY_TARIFFS_HALALAS.tiered.commercial.tier2;
    } else if (tariffType === 'agricultural') {
      tariffObj.tier1HalalasPerKwh = SAUDI_ELECTRICITY_TARIFFS_HALALAS.tiered.agricultural.tier1;
      tariffObj.tier2HalalasPerKwh = SAUDI_ELECTRICITY_TARIFFS_HALALAS.tiered.agricultural.tier2;
    } else if (tariffType === 'industrial') {
      tariffObj.type = 'flat';
      tariffObj.halalasPerKwh = SAUDI_ELECTRICITY_TARIFFS_HALALAS.industrial.standardGrid;
    }

    if (sizingBasis === 'energy') {
      if (inputType === 'kwh' && typeof monthlyKwhInput === 'number' && monthlyKwhInput > 0) {
        resolvedMonthlyKwh = monthlyKwhInput;
        if (tariffType === 'custom' && typeof customTariffPrice === 'number') {
          effectiveKwhPrice = customTariffPrice;
        } else {
          // Calculate average tariff price
          const billDetails = billFromMonthlyKwhLocal(resolvedMonthlyKwh, tariffObj);
          effectiveKwhPrice = billDetails.avgSarPerKwh;
        }
      } else if (inputType === 'bill' && typeof monthlyBillInput === 'number' && monthlyBillInput > 0) {
        if (tariffType === 'custom' && typeof customTariffPrice === 'number' && customTariffPrice > 0) {
          effectiveKwhPrice = customTariffPrice;
          resolvedMonthlyKwh = Math.round(monthlyBillInput / customTariffPrice);
        } else {
          resolvedMonthlyKwh = monthlyKwhFromBillLocal(monthlyBillInput, tariffObj);
          const billDetails = billFromMonthlyKwhLocal(resolvedMonthlyKwh, tariffObj);
          effectiveKwhPrice = billDetails.avgSarPerKwh;
        }
      }
    } else {
      // Direct capacity input
      if (typeof directKw === 'number' && directKw > 0) {
        // Estimate average monthly energy: kW * peakSunHours (5) * 30 days * losses (0.85)
        resolvedMonthlyKwh = Math.round(directKw * 5 * 30 * 0.85);
        if (tariffType === 'custom' && typeof customTariffPrice === 'number') {
          effectiveKwhPrice = customTariffPrice;
        } else {
          const billDetails = billFromMonthlyKwhLocal(resolvedMonthlyKwh, tariffObj);
          effectiveKwhPrice = billDetails.avgSarPerKwh;
        }
      }
    }

    if (resolvedMonthlyKwh <= 0 && sizingBasis === 'energy') {
      setCalculatedData(null);
      return;
    }

    // 2. Sizing and pricing variables
    const peakSunHours = 5;
    const losses = 0.85;
    const derate = 0.8;
    const systemLifetimeYears = 25;

    let systemKw = 0;
    if (sizingBasis === 'energy') {
      const dailyKwh = resolvedMonthlyKwh / 30;
      const requiredKw = dailyKwh / peakSunHours;
      systemKw = requiredKw / losses;
    } else {
      systemKw = typeof directKw === 'number' ? directKw : 0;
    }

    // Determine panel selection and constraints
    let panelTier: 'standard' | 'premium' = 'standard';
    let selectedPanel = PANEL_PRICING[panelTier];
    let panelWatt = selectedPanel.wattage * selectedPanel.efficiency;
    let initialPanels = Math.ceil((systemKw * 1000) / panelWatt);
    let initialAreaNeeded = initialPanels * panelAreaM2;

    let showPremiumRecommendation = false;
    let premiumStillTooBig = false;
    let premiumFitSuccess = false;

    // Check if space is constrained
    if (typeof availableArea === 'number' && availableArea > 0 && initialAreaNeeded > availableArea) {
      // Switch to premium high efficiency panel
      panelTier = 'premium';
      selectedPanel = PANEL_PRICING[panelTier];
      panelWatt = selectedPanel.wattage * selectedPanel.efficiency;
      const premiumPanels = Math.ceil((systemKw * 1000) / panelWatt);
      const premiumAreaNeeded = premiumPanels * panelAreaM2;

      showPremiumRecommendation = true;
      if (premiumAreaNeeded <= availableArea) {
        premiumFitSuccess = true;
        initialPanels = premiumPanels;
        initialAreaNeeded = premiumAreaNeeded;
      } else {
        premiumStillTooBig = true;
        // Keep the premium panel as it is still the best attempt to minimize area
        initialPanels = premiumPanels;
        initialAreaNeeded = premiumAreaNeeded;
      }
    }

    const panels = isPanelOverridden && typeof customPanelCount === 'number' && customPanelCount > 0
      ? customPanelCount
      : initialPanels;

    const areaNeeded = panels * panelAreaM2;

    // Recalculate system capacity based on active panel count * wattage
    const actualSystemKw = (panels * panelWatt) / 1000;

    // Battery calculations
    let recommendedBatteryKwh = 0;
    if (connectionType === 'hybrid') {
      const dailyKwh = resolvedMonthlyKwh / 30;
      // Recommend batteries for ~8 hours (8/24 = 0.33) at 80% DOD
      recommendedBatteryKwh = Math.round((dailyKwh * 0.33) / 0.8);
      if (recommendedBatteryKwh < 5) recommendedBatteryKwh = 5; // minimum standard lithium pack size
    }

    const batteryKwh = isBatteryOverridden && typeof customBatteryKwh === 'number' && customBatteryKwh >= 0
      ? customBatteryKwh
      : recommendedBatteryKwh;

    // Cost estimation
    const basePackagePrice = getTierPriceLocal(actualSystemKw);
    const panelsCost = panels * selectedPanel.costPerPanel;

    // Panel cost difference from standard package
    const standardCostPerPanel = PANEL_PRICING.standard.costPerPanel;
    const panelPriceDiff = panels * (selectedPanel.costPerPanel - standardCostPerPanel);

    let batteryCost = 0;
    let inverterUpgradeCost = 0;
    if (connectionType === 'hybrid') {
      batteryCost = batteryKwh * 1400; // 1400 SAR per kWh
      // Inverter upgrade markup (around 40% of installation value or standard inverter size)
      inverterUpgradeCost = Math.round((panelsCost * 0.35) * 0.4);
    }

    // Base package price represents standard on-grid system. We add premium panels difference, batteries, and hybrid inverter upsell.
    const rawTotalSystemCost = basePackagePrice + panelPriceDiff + batteryCost + inverterUpgradeCost;
    const totalSystemCost = Math.round(rawTotalSystemCost);

    // Savings
    const annualProdKwh = actualSystemKw * peakSunHours * 365 * derate * selectedPanel.efficiency;
    const annualLoadKwh = resolvedMonthlyKwh * 12;
    const annualOffset = Math.min(annualProdKwh, annualLoadKwh);
    const annualSavingsSar = Math.round(annualOffset * effectiveKwhPrice);

    const paybackYears = annualSavingsSar > 0 ? Number((totalSystemCost / annualSavingsSar).toFixed(1)) : Infinity;
    const lifetimeGrossSavings = annualSavingsSar * systemLifetimeYears;
    const lifetimeNetSavings = lifetimeGrossSavings - totalSystemCost;

    // Inverter split calculations
    const kwPerInverter = actualSystemKw / inverterCount;
    const panelsPerInverter = Math.ceil(panels / inverterCount);

    // Set panel and battery states to keep inputs clean if they are not overridden
    if (!isBatteryOverridden) {
      setCustomBatteryKwh(recommendedBatteryKwh || '');
    }
    if (!isPanelOverridden) {
      setCustomPanelCount(initialPanels || '');
    }

    setCalculatedData({
      monthlyKwh: resolvedMonthlyKwh,
      monthlyBill: Math.round(resolvedMonthlyKwh * effectiveKwhPrice),
      effectiveKwhPrice,
      systemKw: actualSystemKw,
      panels,
      selectedPanel,
      areaNeeded,
      batteryKwh,
      batteryCost,
      totalSystemCost,
      annualSavingsSar,
      paybackYears,
      lifetimeGrossSavings,
      lifetimeNetSavings,
      showPremiumRecommendation,
      premiumFitSuccess,
      premiumStillTooBig,
      inverterUpgradeCost,
      basePackagePrice,
      panelPriceDiff,
      inverterCount,
      kwPerInverter,
      panelsPerInverter,
    });

  }, [
    sizingBasis,
    directKw,
    inputType,
    monthlyKwhInput,
    monthlyBillInput,
    tariffType,
    customTariffPrice,
    connectionType,
    customBatteryKwh,
    isBatteryOverridden,
    customPanelCount,
    isPanelOverridden,
    availableArea,
    panelAreaM2,
    inverterCount,
  ]);

  // Sizing navigation handlers
  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const handlePrintQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    if (!contactName || !phone || !email) {
      return;
    }
    window.print();
  };

  const handleSaveConfiguration = () => {
    const config = {
      sizingBasis,
      directKw,
      inputType,
      monthlyKwhInput,
      monthlyBillInput,
      tariffType,
      customTariffPrice,
      connectionType,
      customBatteryKwh,
      isBatteryOverridden,
      customPanelCount,
      isPanelOverridden,
      availableArea,
      panelAreaM2,
      inverterCount,
      companyName,
      contactName,
      phone,
      email,
      currentStep,
    };
    localStorage.setItem('solar_wizard_saved_choices', JSON.stringify(config));
    alert(lang === 'ar' ? '✅ تم حفظ الخيارات بنجاح! يمكنك الآن الرجوع وتعديلها أو طباعتها في أي وقت.' : '✅ Choices saved successfully! You can reload, edit, or reprint them at any time.');
  };

  const handleClearConfiguration = () => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من مسح جميع الخيارات والمدخلات والبدء من جديد؟' : 'Are you sure you want to clear all choices and start fresh?')) {
      localStorage.removeItem('solar_wizard_saved_choices');
      setCurrentStep(1);
      setSizingBasis('energy');
      setDirectKw('');
      setInputType('kwh');
      setMonthlyKwhInput('');
      setMonthlyBillInput('');
      setTariffType('residential');
      setCustomTariffPrice('');
      setConnectionType('onGrid');
      setCustomBatteryKwh('');
      setIsBatteryOverridden(false);
      setCustomPanelCount('');
      setIsPanelOverridden(false);
      setAvailableArea('');
      setPanelAreaM2(5.0);
      setInverterCount(1);
      setCompanyName('');
      setContactName('');
      setPhone('');
      setEmail('');
      setFormSubmitted(false);
    }
  };

  // Local calculation formulas that don't depend on DOM window
  function billFromMonthlyKwhLocal(kwh: number, tariff: any) {
    const vatRate = VAT_RATE;
    let subtotalSar = 0;

    if (tariff.type === 'flat') {
      subtotalSar = kwh * (tariff.halalasPerKwh / 100);
    } else {
      const tier1Kwh = Math.min(kwh, tariff.tier1LimitKwh);
      const tier2Kwh = Math.max(kwh - tariff.tier1LimitKwh, 0);
      subtotalSar =
        tier1Kwh * (tariff.tier1HalalasPerKwh / 100) + tier2Kwh * (tariff.tier2HalalasPerKwh / 100);
    }

    const vatSar = subtotalSar * vatRate;
    const totalSar = subtotalSar + vatSar;
    const avgSarPerKwh = totalSar / kwh;

    return { subtotalSar, vatSar, totalSar, avgSarPerKwh };
  }

  function monthlyKwhFromBillLocal(totalBillSar: number, tariff: any) {
    const vatRate = VAT_RATE;
    const subtotalSar = totalBillSar / (1 + vatRate);

    if (tariff.type === 'flat') {
      const rateSar = tariff.halalasPerKwh / 100;
      return Math.round(subtotalSar / rateSar);
    }

    const tier1RateSar = tariff.tier1HalalasPerKwh / 100;
    const tier2RateSar = tariff.tier2HalalasPerKwh / 100;
    const tier1BillLimitSar = tariff.tier1LimitKwh * tier1RateSar;

    if (subtotalSar <= tier1BillLimitSar) {
      return Math.round(subtotalSar / tier1RateSar);
    }

    const tier2BillSar = subtotalSar - tier1BillLimitSar;
    const tier2Kwh = tier2BillSar / tier2RateSar;
    return Math.round(tariff.tier1LimitKwh + tier2Kwh);
  }

  const SIZE_PRICING_TIERS_LOCAL: Record<number, number> = {
    10: 35073 * 1.2,
    15: 50073 * 1.2,
    20: 60073 * 1.2,
    30: 85073 * 1.2,
    50: 145073 * 1.2,
    100: 290073 * 1.2,
    200: 575073 * 1.2,
    300: 859573 * 1.2,
    500: 1430073 * 1.2,
    1000: 2860073 * 1.2,
  };

  function getTierPriceLocal(kw: number) {
    const tiers = Object.keys(SIZE_PRICING_TIERS_LOCAL)
      .map(Number)
      .sort((a, b) => a - b);
    let lowerTier = tiers[0];

    if (kw <= lowerTier) return SIZE_PRICING_TIERS_LOCAL[lowerTier];

    for (let i = 1; i < tiers.length; i++) {
      const upperTier = tiers[i];
      if (kw <= upperTier) {
        const lowerPrice = SIZE_PRICING_TIERS_LOCAL[lowerTier];
        const upperPrice = SIZE_PRICING_TIERS_LOCAL[upperTier];
        const ratio = (kw - lowerTier) / (upperTier - lowerTier);
        return Math.round(lowerPrice + ratio * (upperPrice - lowerPrice));
      }
      lowerTier = upperTier;
    }

    const lastKw = tiers[tiers.length - 1];
    const lastPrice = SIZE_PRICING_TIERS_LOCAL[lastKw];
    const perKw = lastPrice / lastKw;
    return Math.round(kw * perKw);
  }

  // Generate dynamic unique quote ID
  const quoteRefNo = `AQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const quoteDateStr = new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US');

  return (
    <>
      <HeaderBanner
        title={tW('title')}
        subtitle={tW('subtitle')}
        backgroundImage="/src/assets/hero-bg-2.jpg"
      />

      <section className={`container-fluid py-5 ${lang === 'ar' ? 'rtl' : ''}`}>
        <div className="solar-wizard-container">

          {/* Step indicator */}
          <div className="solar-wizard-progress-container">
            <div className="solar-wizard-progress-bar">
              <div
                className="solar-wizard-progress-fill"
                style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
              />
            </div>
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`solar-wizard-step-node ${step === currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
              >
                {step < currentStep ? '✓' : step}
              </div>
            ))}
          </div>

          {/* 2-Column Responsive Layout */}
          <div className="row g-4">

            {/* Left Column: Wizard Cards containing steps */}
            <div className="col-lg-8 col-md-7">
              <div className="solar-wizard-card">

                {/* STEP 1: Sizing Basis */}
                {currentStep === 1 && (
                  <div className="fade-step-enter-active">
                    <h4 className="fw-bold mb-4 text-center">
                      <FontAwesomeIcon icon={faScaleUnbalanced} className="text-success me-2" />
                      {tW('basisQ')}
                    </h4>

                    <div className="row g-4 mt-2">
                      <div className="col-md-6">
                        <div
                          className={`solar-option-card ${sizingBasis === 'energy' ? 'selected' : ''}`}
                          onClick={() => setSizingBasis('energy')}
                        >
                          <div className="solar-option-icon">⚡</div>
                          <h5 className="fw-bold">{tW('basisOptProd')}</h5>
                          <p className="text-muted small mt-2">{tW('basisOptProdDesc')}</p>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div
                          className={`solar-option-card ${sizingBasis === 'capacity' ? 'selected' : ''}`}
                          onClick={() => setSizingBasis('capacity')}
                        >
                          <div className="solar-option-icon">⚙️</div>
                          <h5 className="fw-bold">{tW('basisOptSize')}</h5>
                          <p className="text-muted small mt-2">{tW('basisOptSizeDesc')}</p>
                        </div>
                      </div>
                    </div>

                    {sizingBasis === 'capacity' && (
                      <div className="mt-5 max-w-md mx-auto text-center">
                        <label className="form-label fw-semibold mb-2">{tW('sysKwLabel')}</label>
                        <input
                          type="number"
                          className="form-control solar-form-input text-center"
                          placeholder={tW('sysKwPlaceholder')}
                          value={directKw}
                          onChange={(e) => setDirectKw(e.target.value === '' ? '' : Number(e.target.value))}
                          min={1}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: Consumption Details */}
                {currentStep === 2 && (
                  <div className="fade-step-enter-active">
                    {sizingBasis === 'energy' ? (
                      <>
                        <h4 className="fw-bold mb-4 text-center">{tW('consQ')}</h4>

                        <div className="row g-4 justify-content-center mb-5">
                          <div className="col-md-5">
                            <div
                              className={`solar-option-card p-3 ${inputType === 'kwh' ? 'selected' : ''}`}
                              onClick={() => setInputType('kwh')}
                            >
                              <h6 className="fw-bold mb-0">{tW('consOptKwh')}</h6>
                            </div>
                          </div>
                          <div className="col-md-5">
                            <div
                              className={`solar-option-card p-3 ${inputType === 'bill' ? 'selected' : ''}`}
                              onClick={() => setInputType('bill')}
                            >
                              <h6 className="fw-bold mb-0">{tW('consOptBill')}</h6>
                            </div>
                          </div>
                        </div>

                        <div className="row justify-content-center">
                          <div className="col-md-8">
                            <div className="mb-4">
                              <label className="form-label fw-semibold">
                                {inputType === 'kwh' ? tW('kwhLabel') : tW('billLabel')}
                              </label>
                              <input
                                type="number"
                                className="form-control solar-form-input"
                                value={inputType === 'kwh' ? monthlyKwhInput : monthlyBillInput}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? '' : Number(e.target.value);
                                  if (inputType === 'kwh') {
                                    setMonthlyKwhInput(val);
                                  } else {
                                    setMonthlyBillInput(val);
                                  }
                                }}
                                min={1}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <h5 className="fw-semibold text-success mb-3">
                          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                          {sizingBasis === 'capacity' ? `سعة النظام المحددة: ${directKw} كيلوواط` : ''}
                        </h5>
                      </div>
                    )}

                    {/* Tariff selections */}
                    <div className="row justify-content-center mt-3">
                      <div className="col-md-8">
                        <div className="mb-4">
                          <label className="form-label fw-semibold">{tW('tariffQ')}</label>
                          <select
                            className="form-select solar-select-tariff"
                            value={tariffType}
                            onChange={(e: any) => setTariffType(e.target.value)}
                          >
                            <option value="residential">{tW('tariffResidential')}</option>
                            <option value="commercial">{tW('tariffCommercial')}</option>
                            <option value="agricultural">{tW('tariffAgricultural')}</option>
                            <option value="industrial">{tW('tariffIndustrial')}</option>
                            <option value="custom">{tW('tariffCustom')}</option>
                          </select>
                        </div>

                        {tariffType === 'custom' && (
                          <div className="mb-4">
                            <label className="form-label fw-semibold">{tW('tariffCustomPriceLabel')}</label>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control solar-form-input"
                              value={customTariffPrice}
                              onChange={(e) => setCustomTariffPrice(e.target.value === '' ? '' : Number(e.target.value))}
                              min={0.01}
                            />
                          </div>
                        )}

                        {/* Tariff visual helper */}
                        <div className="card bg-light border-0 rounded-4 p-3 mt-3">
                          <h6 className="fw-bold mb-2 text-dark">{tW('currentTariffDetails')}</h6>
                          <ul className="mb-0 small text-muted ps-3">
                            {tariffType === 'residential' && (
                              <>
                                <li>{tW('tariffTier1', { rate: '0.18' })}</li>
                                <li>{tW('tariffTier2', { rate: '0.30' })}</li>
                              </>
                            )}
                            {tariffType === 'commercial' && (
                              <>
                                <li>{tW('tariffTier1', { rate: '0.22' })}</li>
                                <li>{tW('tariffTier2', { rate: '0.32' })}</li>
                              </>
                            )}
                            {tariffType === 'agricultural' && (
                              <>
                                <li>{tW('tariffTier1', { rate: '0.18' })}</li>
                                <li>{tW('tariffTier2', { rate: '0.22' })}</li>
                              </>
                            )}
                            {tariffType === 'industrial' && (
                              <li>{tW('tariffFlat', { rate: '0.20' })}</li>
                            )}
                            {tariffType === 'custom' && (
                              <li>{tW('tariffFlat', { rate: customTariffPrice || '—' })}</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Connection & Batteries */}
                {currentStep === 3 && (
                  <div className="fade-step-enter-active">
                    <h4 className="fw-bold mb-4 text-center">
                      <FontAwesomeIcon icon={faNetworkWired} className="text-success me-2" />
                      {tW('connectionQ')}
                    </h4>

                    <div className="row g-4 mt-2">
                      <div className="col-md-6">
                        <div
                          className={`solar-option-card ${connectionType === 'onGrid' ? 'selected' : ''}`}
                          onClick={() => setConnectionType('onGrid')}
                        >
                          <div className="solar-option-icon">🌐</div>
                          <h5 className="fw-bold">{tW('connOptOnGrid')}</h5>
                          <p className="text-muted small mt-2">{tW('connOptOnGridDesc')}</p>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div
                          className={`solar-option-card ${connectionType === 'hybrid' ? 'selected' : ''}`}
                          onClick={() => setConnectionType('hybrid')}
                        >
                          <div className="solar-option-icon">🔋</div>
                          <h5 className="fw-bold">{tW('connOptHybrid')}</h5>
                          <p className="text-muted small mt-2">{tW('connOptHybridDesc')}</p>
                        </div>
                      </div>
                    </div>

                    {connectionType === 'hybrid' && calculatedData && (
                      <div className="mt-5 card bg-light border-0 rounded-4 p-4 max-w-md mx-auto">
                        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                          <FontAwesomeIcon icon={faCarBattery} className="text-success" />
                          {tW('batterySuggestTitle')}
                        </h6>

                        <div className="mb-3">
                          <label className="form-label small text-muted">{tW('batterySizeLabel')}</label>
                          <input
                            type="number"
                            className="form-control solar-form-input text-center"
                            value={customBatteryKwh}
                            onChange={(e) => {
                              setIsBatteryOverridden(true);
                              setCustomBatteryKwh(e.target.value === '' ? '' : Number(e.target.value));
                            }}
                            min={0}
                          />
                        </div>

                        <div className="text-muted small">
                          {tW('batteryCostNotice', { cost: calculatedData.batteryCost.toLocaleString() })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 4: Panels & Area constraints */}
                {currentStep === 4 && calculatedData && (
                  <div className="fade-step-enter-active">
                    <h4 className="fw-bold mb-4 text-center">
                      <FontAwesomeIcon icon={faSolarPanel} className="text-success me-2" />
                      {tW('panelsQ')}
                    </h4>

                    <div className="row justify-content-center g-4">
                      <div className="col-md-6">
                        <div className="mb-4">
                          <label className="form-label fw-semibold">{tW('panelCountLabel')}</label>
                          <input
                            type="number"
                            className="form-control solar-form-input text-center"
                            value={customPanelCount}
                            onChange={(e) => {
                              setIsPanelOverridden(true);
                              setCustomPanelCount(e.target.value === '' ? '' : Number(e.target.value));
                            }}
                            min={1}
                          />
                          {isPanelOverridden && (
                            <div className="text-success small mt-1 text-center">{tW('panelRecalculated')}</div>
                          )}
                        </div>

                        <div className="mb-4">
                          <label className="form-label fw-semibold">{tW('availableAreaLabel')}</label>
                          <input
                            type="number"
                            className="form-control solar-form-input text-center"
                            value={availableArea}
                            onChange={(e) => setAvailableArea(e.target.value === '' ? '' : Number(e.target.value))}
                            min={1}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-4">
                          <label className="form-label fw-semibold">{tW('panelAreaLabel')}</label>
                          <input
                            type="number"
                            step="0.1"
                            className="form-control solar-form-input text-center"
                            value={panelAreaM2}
                            onChange={(e) => setPanelAreaM2(e.target.value === '' ? 5 : Number(e.target.value))}
                            min={1}
                          />
                          <small className="form-text text-muted d-block mt-1 text-center">
                            {tW('panelAreaHelper')}
                          </small>
                        </div>

                        {/* Inverter splitting section */}
                        <div className="mb-4">
                          <label className="form-label fw-semibold">{lang === 'ar' ? 'تقسيم النظام (عدد المحولات / العواكس):' : 'Split System (Number of Inverters):'}</label>
                          <select 
                            className="form-select solar-select-tariff text-center"
                            value={inverterCount}
                            onChange={(e) => setInverterCount(Number(e.target.value))}
                          >
                            {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                              <option key={num} value={num}>
                                {num === 1 
                                  ? (lang === 'ar' ? 'محول واحد (نظام مركزي)' : '1 Inverter (Centralized)') 
                                  : (lang === 'ar' ? `${num} محولات (توزيع الأحمال)` : `${num} Inverters (Load Distribution)`)
                                }
                              </option>
                            ))}
                          </select>
                          <small className="form-text text-muted d-block mt-1 text-center">
                            {lang === 'ar' 
                              ? 'تقسيم النظام على عدة محولات لزيادة الموثوقية وتسهيل توزيع الألواح.' 
                              : 'Splitting across multiple inverters improves redundancy and panel distribution.'
                            }
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Display space constraint tips */}
                    {calculatedData.showPremiumRecommendation && (
                      <div className="area-alert-banner">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning fs-3 mt-1" />
                        <div>
                          <h6 className="fw-bold mb-1">{tW('premiumRecTitle')}</h6>
                          <p className="small mb-2 text-muted">
                            {tW('premiumRecBody', {
                              avail: availableArea,
                              needed: Math.round(calculatedData.panels * 5.0)
                            })}
                          </p>
                          {calculatedData.premiumFitSuccess && (
                            <div className="text-success fw-bold small">
                              {tW('premiumFitSuccess', { needed: Math.round(calculatedData.areaNeeded) })}
                            </div>
                          )}
                          {calculatedData.premiumStillBig && (
                            <div className="text-danger fw-bold small">
                              {tW('premiumStillBig')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 5: Final Quotation & PDF Print */}
                {currentStep === 5 && calculatedData && (
                  <div className="fade-step-enter-active">
                    <h4 className="fw-bold mb-4 text-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-success me-2" />
                      {tW('quoteTitle')}
                    </h4>

                    <div className="row g-4 mb-5">
                      <div className="col-md-6">
                        <div className="card h-100 border-0 bg-light p-4 rounded-4">
                          <h6 className="fw-bold mb-3 text-dark">
                            <FontAwesomeIcon icon={faUser} className="text-primary me-2" />
                            {tW('quoteCompanyTitle')}
                          </h6>

                          <div className="mb-3">
                            <input
                              type="text"
                              className="form-control solar-form-input"
                              placeholder={tW('clientCompany')}
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                            />
                          </div>

                          <div className="mb-3">
                            <input
                              type="text"
                              className={`form-control solar-form-input ${formSubmitted && !contactName ? 'border-danger' : ''}`}
                              placeholder={tW('clientName')}
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              required
                            />
                            {formSubmitted && !contactName && <div className="text-danger small mt-1">{tW('requiredField')}</div>}
                          </div>

                          <div className="mb-3">
                            <input
                              type="tel"
                              className={`form-control solar-form-input ${formSubmitted && !phone ? 'border-danger' : ''}`}
                              placeholder={tW('clientPhone')}
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              required
                            />
                            {formSubmitted && !phone && <div className="text-danger small mt-1">{tW('requiredField')}</div>}
                          </div>

                          <div className="mb-3">
                            <input
                              type="email"
                              className={`form-control solar-form-input ${formSubmitted && !email ? 'border-danger' : ''}`}
                              placeholder={tW('clientEmail')}
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                            />
                            {formSubmitted && !email && <div className="text-danger small mt-1">{tW('requiredField')}</div>}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="card h-100 border-0 solar-dark-card text-white p-4 rounded-4 justify-content-between">
                          <div>
                            <h6 className="fw-bold text-success mb-3">
                              <FontAwesomeIcon icon={faCoins} className="me-2" />
                              {tW('commercialTitle')}
                            </h6>
                            <div className="d-flex justify-content-between mb-2">
                              <span className="text-muted">{tW('packagePrice')}</span>
                              <span>{calculatedData.basePackagePrice.toLocaleString()} SAR</span>
                            </div>
                            {calculatedData.batteryCost > 0 && (
                              <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">{tW('batteryCost')}</span>
                                <span>+{(calculatedData.batteryCost + calculatedData.inverterUpgradeCost).toLocaleString()} SAR</span>
                              </div>
                            )}
                            {calculatedData.panelPriceDiff > 0 && (
                              <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">ترقية خلايا ممتازة عالية الكفاءة:</span>
                                <span>+{calculatedData.panelPriceDiff.toLocaleString()} SAR</span>
                              </div>
                            )}
                            <hr className="border-secondary" />
                            <div className="d-flex justify-content-between mb-2 fs-5">
                              <span>{tW('subtotal')}</span>
                              <span>{calculatedData.totalSystemCost.toLocaleString()} SAR</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2 text-muted small">
                              <span>{tW('vat')}</span>
                              <span>{Math.round(calculatedData.totalSystemCost * 0.15).toLocaleString()} SAR</span>
                            </div>
                          </div>

                          <div>
                            <div className="d-flex justify-content-between fs-4 fw-bold text-success mt-3 border-top border-secondary pt-3">
                              <span>{tW('netTotal')}</span>
                              <span>{Math.round(calculatedData.totalSystemCost * 1.15).toLocaleString()} SAR</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Technical Preview & BOQ on Screen */}
                    <div className="card border-0 bg-light rounded-4 p-4 mb-4">
                      <h5 className="fw-bold mb-3 text-dark text-center">{tW('quoteHeader')}</h5>

                      <div className="row mb-4">
                        <div className="col-6">
                          <div className="small text-muted">{tW('quoteRef')}: {quoteRefNo}</div>
                        </div>
                        <div className="col-6 text-end">
                          <div className="small text-muted">{tW('quoteDate')}: {quoteDateStr}</div>
                        </div>
                      </div>

                      <h6 className="fw-bold border-bottom pb-2 mb-3 text-dark">{tW('techDetails')}</h6>
                      <div className="row g-3 text-center mb-4">
                        <div className="col-4 col-md-2">
                          <div className="bg-white p-2 rounded-3 shadow-sm">
                            <div className="small text-muted">سعة النظام</div>
                            <div className="fw-bold text-success">{calculatedData.systemKw.toFixed(1)} kWp</div>
                          </div>
                        </div>
                        <div className="col-4 col-md-2">
                          <div className="bg-white p-2 rounded-3 shadow-sm">
                            <div className="small text-muted">عدد الألواح</div>
                            <div className="fw-bold text-success">{calculatedData.panels}</div>
                          </div>
                        </div>
                        <div className="col-4 col-md-2">
                          <div className="bg-white p-2 rounded-3 shadow-sm">
                            <div className="small text-muted">نوع الألواح</div>
                            <div className="fw-bold text-success">{calculatedData.selectedPanel.label}</div>
                          </div>
                        </div>
                        <div className="col-4 col-md-2">
                          <div className="bg-white p-2 rounded-3 shadow-sm">
                            <div className="small text-muted">مساحة التركيب</div>
                            <div className="fw-bold text-success">{Math.round(calculatedData.areaNeeded)} م²</div>
                          </div>
                        </div>
                        <div className="col-4 col-md-2">
                          <div className="bg-white p-2 rounded-3 shadow-sm">
                            <div className="small text-muted">نوع الربط</div>
                            <div className="fw-bold text-success">{connectionType === 'hybrid' ? 'هجين' : 'شبكي'}</div>
                          </div>
                        </div>
                        <div className="col-4 col-md-2">
                          <div className="bg-white p-2 rounded-3 shadow-sm">
                            <div className="small text-muted">البطاريات</div>
                            <div className="fw-bold text-success">{calculatedData.batteryKwh} kWh</div>
                          </div>
                        </div>
                      </div>

                      <h6 className="fw-bold border-bottom pb-2 mb-3 text-dark">{tW('boqTitle')}</h6>
                      <div className="table-responsive">
                        <table className="table bg-white table-bordered rounded-3 overflow-hidden">
                          <thead className="bg-success text-white">
                            <tr>
                              <th>{tW('boqColItem')}</th>
                              <th>{tW('boqColSpecs')}</th>
                              <th className="text-center">{tW('boqColQty')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="fw-semibold">{tW('itemPanels')}</td>
                              <td>
                                {calculatedData.inverterCount > 1 
                                  ? `Tier-1 Mono ${calculatedData.selectedPanel.wattage}W PV Module (${lang === 'ar' ? `موزعة: ~${calculatedData.panelsPerInverter} لوح لكل عاكس` : `Distributed: ~${calculatedData.panelsPerInverter} panels per inverter`})`
                                  : `Tier-1 Mono ${calculatedData.selectedPanel.wattage}W PV Module`
                                }
                              </td>
                              <td className="text-center">{calculatedData.panels}</td>
                            </tr>
                            <tr>
                              <td className="fw-semibold">{tW('itemInverter')}</td>
                              <td>
                                {calculatedData.inverterCount > 1
                                  ? (connectionType === 'hybrid'
                                    ? `Smart Hybrid Inverter ${calculatedData.kwPerInverter.toFixed(1)}kW [Qty: ${calculatedData.inverterCount}, Total: ${Math.ceil(calculatedData.systemKw)}kW] with integrated ATS`
                                    : `Smart Grid-Tied Inverter ${calculatedData.kwPerInverter.toFixed(1)}kW [Qty: ${calculatedData.inverterCount}, Total: ${Math.ceil(calculatedData.systemKw)}kW]`
                                  )
                                  : (connectionType === 'hybrid'
                                    ? `Smart Hybrid Inverter ${Math.ceil(calculatedData.systemKw)}kW with integrated ATS`
                                    : `Smart Grid-Tied Inverter ${Math.ceil(calculatedData.systemKw)}kW`
                                  )
                                }
                              </td>
                              <td className="text-center">{calculatedData.inverterCount}</td>
                            </tr>
                            {calculatedData.batteryKwh > 0 && (
                              <tr>
                                <td className="fw-semibold">{tW('itemBattery')}</td>
                                <td>Lithium Iron Phosphate (LiFePO4) Battery Pack {calculatedData.batteryKwh} kWh</td>
                                <td className="text-center">1 Set</td>
                              </tr>
                            )}
                            <tr>
                              <td className="fw-semibold">{tW('itemStructure')}</td>
                              <td>Anodized Aluminum structures designed for high wind load structures</td>
                              <td className="text-center">1 Set</td>
                            </tr>
                            <tr>
                              <td className="fw-semibold">{tW('itemCables')}</td>
                              <td>Solar DC Cables (4/6 mm² XLPE), AC Outflow cables, PV combiners</td>
                              <td className="text-center">1 Lot</td>
                            </tr>
                            <tr>
                              <td className="fw-semibold">{tW('itemInstall')}</td>
                              <td>Complete civil, mechanical, engineering installation & utility grid interface approvals</td>
                              <td className="text-center">1 Job</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
                      <button
                        className="btn btn-success btn-wizard-nav d-flex align-items-center gap-2 px-4 py-3 fw-bold text-white"
                        onClick={handlePrintQuote}
                      >
                        <FontAwesomeIcon icon={faFilePdf} />
                        {tW('generatePdf')}
                      </button>

                      <a
                        href={`https://wa.me/966565210897?text=${encodeURIComponent(
                          `مرحباً أكترا، لقد قمت بحساب نظام شمسي بمساحة ${Math.round(calculatedData.areaNeeded)} م² وقدرة ${calculatedData.systemKw.toFixed(1)} ك.و.س. أرغب في الحصول على استشارة هندسية مخصصة للشركة: ${companyName || '—'}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-success btn-wizard-nav d-flex align-items-center gap-2 px-4 py-3 fw-bold"
                      >
                        <FontAwesomeIcon icon={faArrowRight} />
                        {tW('whatsappConsult')}
                      </a>
                    </div>

                    {formSubmitted && (!contactName || !phone || !email) && (
                      <div className="alert alert-danger mt-3 text-center rounded-4">
                        {tW('fillRequired')}
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="d-flex justify-content-between mt-5 border-top pt-4">
                  {currentStep > 1 ? (
                    <button className="btn btn-wizard-prev btn-wizard-nav" onClick={handlePrevStep}>
                      <FontAwesomeIcon icon={lang === 'ar' ? faArrowRight : faArrowLeft} className="me-2" />
                      {tW('back')}
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 5 && (
                    <button
                      className="btn btn-wizard-next btn-wizard-nav"
                      onClick={handleNextStep}
                      disabled={
                        currentStep === 1 && sizingBasis === 'capacity' && !directKw
                      }
                    >
                      {tW('next')}
                      <FontAwesomeIcon icon={lang === 'ar' ? faArrowLeft : faArrowRight} className="ms-2" />
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Right Column: Live Summary Sidebar Card */}
            <div className="col-lg-4 col-md-5">
              <div className="solar-sidebar-card">
                <h5 className="fw-bold sidebar-summary-header d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faSolarPanel} className="text-success" />
                  {tW('sidebarTitle')}
                </h5>

                {calculatedData ? (
                  <div>
                    {/* Section 1: Inputs */}
                    <div className="mb-4">
                      <h6 className="fw-bold text-muted small text-uppercase mb-3">{tW('sidebarSectionInputs')}</h6>

                      <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                        <span className="text-muted small">{tW('sidebarMethod')}</span>
                        <span className="fw-semibold small">
                          {sizingBasis === 'energy' ? (lang === 'ar' ? 'الاستهلاك/الفاتورة' : 'Energy/Bill') : (lang === 'ar' ? 'سعة مباشرة' : 'Direct kW')}
                        </span>
                      </div>

                      {sizingBasis === 'energy' && (
                        <>
                          <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                            <span className="text-muted small">{tW('sidebarTariff')}</span>
                            <span className="fw-semibold small">
                              {tariffType === 'residential' && (lang === 'ar' ? 'سكني' : 'Residential')}
                              {tariffType === 'commercial' && (lang === 'ar' ? 'تجاري' : 'Commercial')}
                              {tariffType === 'agricultural' && (lang === 'ar' ? 'زراعي' : 'Agricultural')}
                              {tariffType === 'industrial' && (lang === 'ar' ? 'صناعي' : 'Industrial')}
                              {tariffType === 'custom' && (lang === 'ar' ? 'سعر مخصص' : 'Custom Price')}
                            </span>
                          </div>
                          {inputType === 'kwh' && monthlyKwhInput && (
                            <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                              <span className="text-muted small">الاستهلاك المدخل</span>
                              <span className="fw-semibold small">{monthlyKwhInput} kWh</span>
                            </div>
                          )}
                          {inputType === 'bill' && monthlyBillInput && (
                            <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                              <span className="text-muted small">الفاتورة المدخلة</span>
                              <span className="fw-semibold small">{monthlyBillInput} SAR</span>
                            </div>
                          )}
                        </>
                      )}

                      {sizingBasis === 'capacity' && directKw && (
                        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                          <span className="text-muted small">السعة المدخلة</span>
                          <span className="fw-semibold small">{directKw} kWp</span>
                        </div>
                      )}

                      <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                        <span className="text-muted small">نوع الربط</span>
                        <span className="fw-semibold small">
                          {connectionType === 'hybrid' ? (lang === 'ar' ? 'هجين مع بطارية' : 'Hybrid') : (lang === 'ar' ? 'شبكي' : 'On-Grid')}
                        </span>
                      </div>

                      {connectionType === 'hybrid' && calculatedData.batteryKwh > 0 && (
                        <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                          <span className="text-muted small">{tW('sidebarStorage')}</span>
                          <span className="fw-semibold small text-success">{calculatedData.batteryKwh} kWh</span>
                        </div>
                      )}
                    </div>

                    {/* Section 2: Results */}
                    <div>
                      <h6 className="fw-bold text-muted small text-uppercase mb-3">{tW('sidebarSectionResults')}</h6>

                      <div className="sidebar-data-section">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted small">{tW('sidebarSystemKw')}</span>
                          <span className="fw-bold text-success">{calculatedData.systemKw.toFixed(1)} kWp</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted small">{tW('sidebarPanels')}</span>
                          <span className="fw-bold text-success">{calculatedData.panels}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted small">{tW('sidebarArea')}</span>
                          <span className="fw-bold text-success">~{Math.round(calculatedData.areaNeeded)} م²</span>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                        <span className="text-muted small">{tW('sidebarSavings')}</span>
                        <span className="fw-semibold text-success">{calculatedData.annualSavingsSar.toLocaleString()} SAR</span>
                      </div>

                      <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                        <span className="text-muted small">{tW('sidebarPayback')}</span>
                        <span className="fw-semibold text-success">
                          {calculatedData.paybackYears === Infinity ? '—' : `${calculatedData.paybackYears} ${lang === 'ar' ? 'سنة' : 'years'}`}
                        </span>
                      </div>

                      <div className="d-flex justify-content-between pt-2">
                        <span className="fw-bold text-dark">{tW('sidebarCost')}</span>
                        <span className="fw-bold text-success fs-5">{Math.round(calculatedData.totalSystemCost * 1.15).toLocaleString()} SAR</span>
                      </div>
                      <hr className="my-3 border-secondary" style={{ opacity: 0.15 }} />
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm btn-success flex-grow-1 d-flex align-items-center justify-content-center gap-1 text-white py-2"
                          onClick={handleSaveConfiguration}
                          type="button"
                          style={{ fontSize: '0.9rem', borderRadius: '8px' }}
                        >
                          <span>💾</span>
                          <span>{lang === 'ar' ? 'حفظ الخيارات' : 'Save Choices'}</span>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                          onClick={handleClearConfiguration}
                          type="button"
                          title={lang === 'ar' ? 'مسح المدخلات' : 'Reset Inputs'}
                          style={{ borderRadius: '8px', padding: '0 10px' }}
                        >
                          <span>🗑️</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted small">
                    <FontAwesomeIcon icon={faBolt} className="fs-3 mb-2 opacity-50" />
                    <p>{tW('sidebarNoData')}</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* HIDDEN PRINT-ONLY SECTION (FOR EXACT A4 SIZE PDF GENERATION) */}
      <div id="print-section" className="container-fluid py-3 px-0" style={{ color: '#000', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        <div className="d-flex justify-content-between align-items-center border-bottom pb-4 mb-4">
          <div>
            <h3 className="fw-bold text-primary mb-1">مؤسسة أكترا للتجارة والمقاولات</h3>
            <h5 className="text-muted mb-0">AQTRA Contracting & Trading</h5>
            <small className="text-muted d-block mt-1">الرياض، المملكة العربية السعودية | الهاتف: 966565210897+</small>
            <small className="text-muted d-block">www.aqtraco.com | info@aqtraco.com</small>
          </div>
          <div className="text-end">
            <img src="/src/assets/logo-icon.png" style={{ width: '55px', height: 'auto', objectFit: 'contain' }} alt="AQTRA" className="mb-2" />
            <h5 className="fw-bold text-dark mb-0">عرض سعر طاقة شمسية مبدئي</h5>
            <div className="small text-muted mt-1">{tW('quoteRef')}: {quoteRefNo}</div>
            <div className="small text-muted">{tW('quoteDate')}: {quoteDateStr}</div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-6">
            <div className="print-card h-100">
              <div className="print-card-header">
                {lang === 'ar' ? 'معلومات العميل والشركة:' : 'Client & Company Information:'}
              </div>
              <div className="print-card-body">
                <div className="print-info-row">
                  <span className="print-info-label">{lang === 'ar' ? 'الشركة / العميل:' : 'Company / Client:'}</span>
                  <span className="print-info-value">{companyName || contactName}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">{lang === 'ar' ? 'مسؤول التواصل:' : 'Contact Person:'}</span>
                  <span className="print-info-value">{contactName}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">{lang === 'ar' ? 'رقم الجوال:' : 'Phone / Mobile:'}</span>
                  <span className="print-info-value" style={{ direction: 'ltr' }}>{phone}</span>
                </div>
                <div className="print-info-row">
                  <span className="print-info-label">{lang === 'ar' ? 'البريد الإلكتروني:' : 'Email Address:'}</span>
                  <span className="print-info-value">{email}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="print-card h-100">
              <div className="print-card-header">
                {lang === 'ar' ? 'المواصفات الفنية للنظام:' : 'Technical System Specifications:'}
              </div>
              <div className="print-card-body">
                {calculatedData && (
                  <>
                    <div className="print-info-row">
                      <span className="print-info-label">{lang === 'ar' ? 'سعة المحطة الإجمالية:' : 'Total Plant Capacity:'}</span>
                      <span className="print-info-value">{calculatedData.systemKw.toFixed(2)} kWp ({lang === 'ar' ? 'كيلوواط ذروة' : 'kW Peak'})</span>
                    </div>
                    <div className="print-info-row">
                      <span className="print-info-label">{lang === 'ar' ? 'إجمالي عدد الألواح:' : 'Total Panels Count:'}</span>
                      <span className="print-info-value">{calculatedData.panels} {lang === 'ar' ? 'لوح شمسي' : 'PV Panels'}</span>
                    </div>
                    <div className="print-info-row">
                      <span className="print-info-label">{lang === 'ar' ? 'مواصفات اللوح المقترح:' : 'Proposed Panel Specs:'}</span>
                      <span className="print-info-value">{calculatedData.selectedPanel.label} ({calculatedData.selectedPanel.wattage}W Mono)</span>
                    </div>
                    <div className="print-info-row">
                      <span className="print-info-label">{lang === 'ar' ? 'مساحة التركيب اللازمة:' : 'Required Setup Footprint:'}</span>
                      <span className="print-info-value">~{Math.round(calculatedData.areaNeeded)} م² ({lang === 'ar' ? 'متر مربع' : 'sqm'})</span>
                    </div>
                    <div className="print-info-row">
                      <span className="print-info-label">{lang === 'ar' ? 'نوع المحول والربط:' : 'Inverter & Connection Type:'}</span>
                      <span className="print-info-value">
                        {connectionType === 'hybrid' 
                          ? (lang === 'ar' ? 'عواكس هجينة مع بطاريات' : 'Hybrid with Batteries')
                          : (lang === 'ar' ? 'عواكس متصلة بالشبكة (On-Grid)' : 'On-Grid Connected')
                        }
                      </span>
                    </div>
                    {calculatedData.batteryKwh > 0 && (
                      <div className="print-info-row">
                        <span className="print-info-label">{lang === 'ar' ? 'سعة تخزين البطارية:' : 'Battery Storage Capacity:'}</span>
                        <span className="print-info-value">{calculatedData.batteryKwh} kWh ({lang === 'ar' ? 'كيلوواط ساعة' : 'kWh'})</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {calculatedData && (
          <>
            <h6 className="fw-bold border-bottom pb-1 mb-3">تفاصيل بنود العرض والكميات (BOQ):</h6>
            <table className="table table-bordered table-sm small mb-4">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '5%' }} className="text-center">#</th>
                  <th style={{ width: '40%' }}>مكونات النظام</th>
                  <th style={{ width: '45%' }}>المواصفات الفنية القياسية</th>
                  <th style={{ width: '10%' }} className="text-center">الكمية</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-center">1</td>
                  <td className="fw-bold">{tW('itemPanels')}</td>
                  <td>
                    {calculatedData.inverterCount > 1
                      ? `Tier-1 High-Efficiency Monocrystalline A-Grade PV Modules (${calculatedData.selectedPanel.wattage}W) [${lang === 'ar' ? `موزعة: ~${calculatedData.panelsPerInverter} لوح لكل عاكس` : `Distributed: ~${calculatedData.panelsPerInverter} panels per inverter`}]`
                      : `Tier-1 High-Efficiency Monocrystalline A-Grade PV Modules (${calculatedData.selectedPanel.wattage}W)`
                    }
                  </td>
                  <td className="text-center">{calculatedData.panels}</td>
                </tr>
                <tr>
                  <td className="text-center">2</td>
                  <td className="fw-bold">{tW('itemInverter')}</td>
                  <td>
                    {calculatedData.inverterCount > 1
                      ? `Smart Solar Inverter ${calculatedData.kwPerInverter.toFixed(1)}kW [Qty: ${calculatedData.inverterCount}, Total: ${Math.ceil(calculatedData.systemKw)}kW] ${connectionType === 'hybrid' ? 'Hybrid with ATS & Smart Energy controller' : 'On-Grid utility grade'}`
                      : `Smart Solar Inverter ${Math.ceil(calculatedData.systemKw)}kW ${connectionType === 'hybrid' ? 'Hybrid with ATS & Smart Energy controller' : 'On-Grid utility grade'}`
                    }
                  </td>
                  <td className="text-center">{calculatedData.inverterCount > 1 ? `${calculatedData.inverterCount} Sets` : '1 Set'}</td>
                </tr>
                {calculatedData.batteryKwh > 0 && (
                  <tr>
                    <td className="text-center">3</td>
                    <td className="fw-bold">{tW('itemBattery')}</td>
                    <td>Lithium Iron Phosphate (LiFePO4) Battery storage system {calculatedData.batteryKwh} kWh</td>
                    <td className="text-center">1 Set</td>
                  </tr>
                )}
                <tr>
                  <td className="text-center">{calculatedData.batteryKwh > 0 ? 4 : 3}</td>
                  <td className="fw-bold">{tW('itemStructure')}</td>
                  <td>High-Grade Anodized Aluminum frame structures designed for extreme wind loads</td>
                  <td className="text-center">1 Set</td>
                </tr>
                <tr>
                  <td className="text-center">{calculatedData.batteryKwh > 0 ? 5 : 4}</td>
                  <td className="fw-bold">{tW('itemCables')}</td>
                  <td>DC Solar Cables 4/6mm², AC output cables, combiner protection boxes, Surge Protection, grounding kits</td>
                  <td className="text-center">1 Lot</td>
                </tr>
                <tr>
                  <td className="text-center">{calculatedData.batteryKwh > 0 ? 6 : 5}</td>
                  <td className="fw-bold">{tW('itemInstall')}</td>
                  <td>Full engineering calculations, electrical schematics, civil works, site execution, grid connection, test and SEC approval</td>
                  <td className="text-center">1 Job</td>
                </tr>
              </tbody>
            </table>

            <div className="row mb-4">
              <div className="col-12">
                <div className="print-card">
                  <div className="print-card-header" style={{ backgroundColor: 'var(--solar-primary)', color: '#fff' }}>
                    {lang === 'ar' ? 'التقديرات المالية وعرض السعر:' : 'Financial Estimations & Quotation Summary:'}
                  </div>
                  <div className="print-card-body">
                    <div className="print-info-row">
                      <span className="print-info-label">{lang === 'ar' ? 'سعر باقة النظام الشمسي والتثبيت:' : 'Solar Package & Installation Cost:'}</span>
                      <span className="print-info-value">{(calculatedData.basePackagePrice + calculatedData.panelPriceDiff).toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                    </div>
                    {calculatedData.batteryCost > 0 && (
                      <div className="print-info-row">
                        <span className="print-info-label">{lang === 'ar' ? 'سعر بطاريات التخزين وعاكس هجين:' : 'Hybrid Inverter & Storage Batteries:'}</span>
                        <span className="print-info-value">{(calculatedData.batteryCost + calculatedData.inverterUpgradeCost).toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                      </div>
                    )}
                    <div className="print-info-row">
                      <span className="print-info-label">{lang === 'ar' ? 'الإجمالي الفرعي الخاضع للضريبة:' : 'Taxable Subtotal:'}</span>
                      <span className="print-info-value">{calculatedData.totalSystemCost.toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                    </div>
                    <div className="print-info-row">
                      <span className="print-info-label">{lang === 'ar' ? 'ضريبة القيمة المضافة (15%):' : 'Value Added Tax (15% VAT):'}</span>
                      <span className="print-info-value">{Math.round(calculatedData.totalSystemCost * 0.15).toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                    </div>
                    <div className="print-info-row print-total-row">
                      <span className="print-info-label fw-bold">{lang === 'ar' ? 'صافي قيمة العرض المالي شامل الضريبة:' : 'Total Quotation Net Price (incl. VAT):'}</span>
                      <span className="print-info-value fw-bold text-success fs-6">{Math.round(calculatedData.totalSystemCost * 1.15).toLocaleString()} {lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded p-3 bg-light small mb-4">
              <h6 className="fw-bold mb-2">{tW('warrantyTerms')}</h6>
              <p className="mb-2 small">{tW('warrantyText')}</p>
              <p className="mb-0 text-muted small">{lang === 'ar' ? 'ملاحظة: هذا العرض مبدئي ويخضع للمعاينة الهندسية للموقع وتصميم الأحمال الفعلي للتأكيد.' : 'Note: This quote is preliminary and subject to site engineering inspection and actual load design for confirmation.'}</p>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SolarWizard;
