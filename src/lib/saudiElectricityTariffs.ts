export const VAT_RATE = 0.15;

// All rates are in halalas per kWh (1 SAR = 100 halalas)
export const SAUDI_ELECTRICITY_TARIFFS_HALALAS = {
  tiered: {
    residential: { tier1: 18, tier2: 30, tier1LimitKwh: 6000 },
    commercial: { tier1: 22, tier2: 32, tier1LimitKwh: 6000 },
    agricultural: { tier1: 18, tier2: 22, tier1LimitKwh: 6000 },
    charities: { tier1: 16, tier2: 20, tier1LimitKwh: 6000 },
  },
  flat: {
    governmental: 32,
    healthEducationMosques: 18,
    desalination: 6.5,
    cloudComputing: 18,
  },
  // High-consumption / industrial tariffs
  industrial: {
    // Industrial (صناعي): Grid-connected → 20
    standardGrid: 20,
    // Sectors with fuel-cost compensation ≤20%
    fuelCompLte20: {
      grid: 18,
      powerPlant: 12,
    },
    // Sectors with fuel-cost compensation >20%
    fuelCompGt20: {
      grid: 24,
      powerPlant: 18,
    },
  },
} as const;

export type TieredTariff = {
  type: 'tiered';
  tier1LimitKwh: number;
  tier1HalalasPerKwh: number;
  tier2HalalasPerKwh: number;
};

export type FlatTariff = {
  type: 'flat';
  halalasPerKwh: number;
};

export type Tariff = TieredTariff | FlatTariff;

export type IndustryConnection = 'grid' | 'powerPlant';
export type IndustryFuelCompBand = 'standard' | 'lte20' | 'gt20';

export type IndustryOptions = {
  connection: IndustryConnection;
  fuelCompBand: IndustryFuelCompBand;
};

function halalasToSar(halalasPerKwh: number) {
  return halalasPerKwh / 100;
}

export function tariffForPrimaryUse(primaryUse: string, industry?: IndustryOptions): Tariff {
  switch (primaryUse) {
    case 'home':
      return {
        type: 'tiered',
        tier1LimitKwh: SAUDI_ELECTRICITY_TARIFFS_HALALAS.tiered.residential.tier1LimitKwh,
        tier1HalalasPerKwh: SAUDI_ELECTRICITY_TARIFFS_HALALAS.tiered.residential.tier1,
        tier2HalalasPerKwh: SAUDI_ELECTRICITY_TARIFFS_HALALAS.tiered.residential.tier2,
      };

    case 'bank':
    case 'commercial':
      return {
        type: 'tiered',
        tier1LimitKwh: SAUDI_ELECTRICITY_TARIFFS_HALALAS.tiered.commercial.tier1LimitKwh,
        tier1HalalasPerKwh: SAUDI_ELECTRICITY_TARIFFS_HALALAS.tiered.commercial.tier1,
        tier2HalalasPerKwh: SAUDI_ELECTRICITY_TARIFFS_HALALAS.tiered.commercial.tier2,
      };

    case 'agricultural':
      return {
        type: 'tiered',
        tier1LimitKwh: SAUDI_ELECTRICITY_TARIFFS_HALALAS.tiered.agricultural.tier1LimitKwh,
        tier1HalalasPerKwh: SAUDI_ELECTRICITY_TARIFFS_HALALAS.tiered.agricultural.tier1,
        tier2HalalasPerKwh: SAUDI_ELECTRICITY_TARIFFS_HALALAS.tiered.agricultural.tier2,
      };

    case 'hospital':
    case 'school':
    case 'mosque':
      return {
        type: 'flat',
        halalasPerKwh: SAUDI_ELECTRICITY_TARIFFS_HALALAS.flat.healthEducationMosques,
      };

    case 'government':
      return {
        type: 'flat',
        halalasPerKwh: SAUDI_ELECTRICITY_TARIFFS_HALALAS.flat.governmental,
      };

    case 'industry': {
      const opts: IndustryOptions = industry ?? { connection: 'grid', fuelCompBand: 'standard' };

      if (opts.fuelCompBand === 'standard') {
        // Spec only defines standard industrial as grid-connected @ 20
        return { type: 'flat', halalasPerKwh: SAUDI_ELECTRICITY_TARIFFS_HALALAS.industrial.standardGrid };
      }

      if (opts.fuelCompBand === 'lte20') {
        const rate =
          opts.connection === 'powerPlant'
            ? SAUDI_ELECTRICITY_TARIFFS_HALALAS.industrial.fuelCompLte20.powerPlant
            : SAUDI_ELECTRICITY_TARIFFS_HALALAS.industrial.fuelCompLte20.grid;
        return { type: 'flat', halalasPerKwh: rate };
      }

      const rate =
        opts.connection === 'powerPlant'
          ? SAUDI_ELECTRICITY_TARIFFS_HALALAS.industrial.fuelCompGt20.powerPlant
          : SAUDI_ELECTRICITY_TARIFFS_HALALAS.industrial.fuelCompGt20.grid;
      return { type: 'flat', halalasPerKwh: rate };
    }

    default:
      // Safe default: residential
      return {
        type: 'tiered',
        tier1LimitKwh: SAUDI_ELECTRICITY_TARIFFS_HALALAS.tiered.residential.tier1LimitKwh,
        tier1HalalasPerKwh: SAUDI_ELECTRICITY_TARIFFS_HALALAS.tiered.residential.tier1,
        tier2HalalasPerKwh: SAUDI_ELECTRICITY_TARIFFS_HALALAS.tiered.residential.tier2,
      };
  }
}

export function billFromMonthlyKwh(monthlyKwh: number, tariff: Tariff, vatRate = VAT_RATE) {
  const kwh = Math.max(0, monthlyKwh);
  if (!kwh) {
    return {
      subtotalSar: 0,
      vatSar: 0,
      totalSar: 0,
      avgSarPerKwh: 0,
    };
  }

  let subtotalSar = 0;

  if (tariff.type === 'flat') {
    subtotalSar = kwh * halalasToSar(tariff.halalasPerKwh);
  } else {
    const tier1Kwh = Math.min(kwh, tariff.tier1LimitKwh);
    const tier2Kwh = Math.max(kwh - tariff.tier1LimitKwh, 0);
    subtotalSar =
      tier1Kwh * halalasToSar(tariff.tier1HalalasPerKwh) + tier2Kwh * halalasToSar(tariff.tier2HalalasPerKwh);
  }

  const vatSar = subtotalSar * vatRate;
  const totalSar = subtotalSar + vatSar;
  const avgSarPerKwh = totalSar / kwh;

  return { subtotalSar, vatSar, totalSar, avgSarPerKwh };
}

export function monthlyKwhFromBill(totalBillSar: number, tariff: Tariff, vatRate = VAT_RATE) {
  const total = Math.max(0, totalBillSar);
  if (!total) return 0;

  const subtotalSar = total / (1 + vatRate);

  if (tariff.type === 'flat') {
    const rateSar = halalasToSar(tariff.halalasPerKwh);
    return Math.round(subtotalSar / rateSar);
  }

  const tier1RateSar = halalasToSar(tariff.tier1HalalasPerKwh);
  const tier2RateSar = halalasToSar(tariff.tier2HalalasPerKwh);
  const tier1BillLimitSar = tariff.tier1LimitKwh * tier1RateSar;

  if (subtotalSar <= tier1BillLimitSar) {
    return Math.round(subtotalSar / tier1RateSar);
  }

  const tier2BillSar = subtotalSar - tier1BillLimitSar;
  const tier2Kwh = tier2BillSar / tier2RateSar;
  return Math.round(tariff.tier1LimitKwh + tier2Kwh);
}

export function effectivePriceForMonthlyKwh(monthlyKwh: number, primaryUse: string, industryOptions?: IndustryOptions) {
  const tariff = tariffForPrimaryUse(primaryUse, industryOptions);
  const { avgSarPerKwh } = billFromMonthlyKwh(monthlyKwh, tariff);
  return avgSarPerKwh;
}

// ---- Solar sizing & costing helpers ----

export type PanelTierKey = 'economy' | 'standard' | 'premium';
export type SystemType = 'onGrid' | 'hybrid' | 'offGrid';

export const PANEL_PRICING: Record<PanelTierKey, { label: string; areaPerPanelM2: number; costPerPanel: number; efficiency: number; wattage: number; note: string; firstYearDrop: number; degradationRate: number }> = {
  economy: { label: 'Economy', areaPerPanelM2: 4.2, costPerPanel: 450, efficiency: 0.8, wattage: 490, note: 'Lower cost, shorter lifespan', firstYearDrop: 0.025, degradationRate: 0.0065 },
  standard: { label: 'Standard', areaPerPanelM2: 4, costPerPanel: 550, efficiency: 1.0, wattage: 590, note: 'Balanced price/performance', firstYearDrop: 0.015, degradationRate: 0.0050 },
  premium: { label: 'Premium', areaPerPanelM2: 3.8, costPerPanel: 650, efficiency: 1.2, wattage: 635, note: 'Higher efficiency, longer lifespan', firstYearDrop: 0.010, degradationRate: 0.0040 },
};

const SIZE_PRICING_TIERS: Record<number, number> = {
  // Per-kW rate is capped at ~3,500 SAR for small systems and floors at ~2,800 SAR for large systems up to 500 kW.
  10: 35073 * 1.2,   // 3,500 SAR/kW
  15: 45073 * 1.2,   // 3,600 SAR/kW
  20: 55073 * 1.2,   // 3,500 SAR/kW
  30: 85073 * 1.2,  // 3,500 SAR/kW
  50: 145073 * 1.2,  // 3,000 SAR/kW
  100: 290073 * 1.2, // 2,900 SAR/kW
  200: 575073 * 1.2, // 2,875 SAR/kW
  300: 859573 * 1.2, // 2,865 SAR/kW
  500: 1430073 * 1.2, // 2,860 SAR/kW
  1000: 2860073 * 1.2, // 2,860 SAR/kW
  2000: 5720073 * 1.2, // 2,860 SAR/kW
  5000: 14300073 * 1.2, // 2,860 SAR/kW
  10000: 27650073 * 1.2, // 2,765 SAR/kW
};

const LOSSES = 0.85; // design losses accounted when sizing kW
const DERATE = 0.8; // production derate for soiling/temp
const SYSTEM_LIFETIME_YEARS = 25;
const INSTALL_MARKUP = 0.35; // inverter + installation as % of panels cost
const AREA_PER_PANEL_M2 = 2.19; // average footprint per module including spacing (m²)
const BATTERY_DOD = 0.8; // usable depth of discharge
const BATTERY_COST_PER_KWH: Record<SystemType, number> = {
  onGrid: 0,
  hybrid: 1400, // SAR/kWh (representative market ballpark, Dec 2025)
  offGrid: 1700, // SAR/kWh, higher spec for off-grid
};
const INVERTER_UPGRADE_FACTOR: Record<SystemType, number> = {
  onGrid: 0, // no upgrade needed
  hybrid: 0.4, // +40% of base inverter/install for hybrid ATS + larger inverter
  offGrid: 0.7, // +70% for off-grid capable inverter/controls
};

export type SolarEstimateInput = {
  monthlyKWh?: number;
  monthlyBill?: number;
  primaryUse: string;
  industryOptions?: IndustryOptions;
  peakSunHours: number;
  panelTier: PanelTierKey;
  hasGrid: boolean;
  wantBackup: boolean;
  availableArea?: number;
  overrideEffectiveKwhPrice?: number;
  firstYearDrop?: number;
  degradationRate?: number;
  fullDayCoverage?: boolean;
};

export type SolarEstimateResult =
  | { ok: true; message: string; data: SolarEstimateData }
  | { ok: false; message: string };

export type SolarEstimateData = {
  monthly: number;
  monthlyBillComputed: number;
  effectiveKwhPrice: number;
  systemKw: number;
  panels: number;
  areaNeeded: number;
  annualProdKwh: number;
  annualSavingsSar: number;
  paybackYears: number | typeof Infinity;
  lifetimeGrossSavings: number;
  lifetimeNetSavings: number;
  packagePriceSar: number;
  panelsCost: number;
  inverterInstallBase: number;
  inverterUpgradeAdder: number;
  batteryCost: number;
  batteryKwhNeeded: number;
  totalSystemCost: number;
  systemType: SystemType;
  selectedPanel: (typeof PANEL_PRICING)[PanelTierKey];
  firstYearDrop: number;
  degradationRate: number;
  fullDayCoverage: boolean;
};

function round(val: number, decimals = 1) {
  const m = Math.pow(10, decimals);
  return Math.round(val * m) / m;
}

function getTierPrice(kw: number) {
  const tiers = Object.keys(SIZE_PRICING_TIERS)
    .map(Number)
    .sort((a, b) => a - b);
  let lowerTier = tiers[0];

  if (kw <= lowerTier) return SIZE_PRICING_TIERS[lowerTier];

  for (let i = 1; i < tiers.length; i++) {
    const upperTier = tiers[i];
    if (kw <= upperTier) {
      // Linearly interpolate between lower and upper tier to avoid big price jumps for mid-size systems.
      const lowerPrice = SIZE_PRICING_TIERS[lowerTier];
      const upperPrice = SIZE_PRICING_TIERS[upperTier];
      const ratio = (kw - lowerTier) / (upperTier - lowerTier);
      return Math.round(lowerPrice + ratio * (upperPrice - lowerPrice));
    }
    lowerTier = upperTier;
  }

  const lastKw = tiers[tiers.length - 1];
  const lastPrice = SIZE_PRICING_TIERS[lastKw];
  const perKw = lastPrice / lastKw;
  return Math.round(kw * perKw);
}

function systemTypeFromFlags(hasGrid: boolean, wantBackup: boolean): SystemType {
  if (!hasGrid) return 'offGrid';
  if (wantBackup) return 'hybrid';
  return 'onGrid';
}

export function computeSolarEstimate(input: SolarEstimateInput): SolarEstimateResult {
  const tariff = tariffForPrimaryUse(input.primaryUse, input.industryOptions);

  const monthlyBase = typeof input.monthlyKWh === 'number' && input.monthlyKWh > 0
    ? input.monthlyKWh
    : typeof input.monthlyBill === 'number' && input.monthlyBill > 0
      ? monthlyKwhFromBill(input.monthlyBill, tariff)
      : 0;

  if (!monthlyBase) {
    return { ok: false, message: 'Please provide a valid average monthly energy consumption or monthly bill amount.' };
  }

  const selectedPanel = PANEL_PRICING[input.panelTier];

  const fullDayCoverage = input.fullDayCoverage ?? true;
  let dailyKWh = monthlyBase / 30;

  // If daylight-only coverage is selected, we size the system for direct daylight usage (~35% of 24h load),
  // EXCEPT for agricultural pumping systems (pumping connection type) which run entirely on daylight.
  const isAgriculturalPumping = input.primaryUse === 'agricultural' && !input.hasGrid;
  if (!fullDayCoverage && !isAgriculturalPumping) {
    dailyKWh = dailyKWh * 0.35;
  }

  const requiredKw = dailyKWh / input.peakSunHours;
  const systemKw = requiredKw / LOSSES;
  const adjustedPanelWatt = selectedPanel.wattage * selectedPanel.efficiency;
  const panels = Math.ceil((systemKw * 1000) / adjustedPanelWatt);
  const areaNeeded = round(panels * (selectedPanel.areaPerPanelM2 || AREA_PER_PANEL_M2));

  const { totalSar: monthlyBillComputedTariff, avgSarPerKwh: effectiveKwhPriceTariff } = billFromMonthlyKwh(monthlyBase, tariff);
  const effectiveKwhPrice = input.overrideEffectiveKwhPrice ?? effectiveKwhPriceTariff;
  const monthlyBillComputed = input.overrideEffectiveKwhPrice ? monthlyBase * input.overrideEffectiveKwhPrice : monthlyBillComputedTariff;

  const annualProdKwh = systemKw * input.peakSunHours * 365 * DERATE * selectedPanel.efficiency;
  const annualLoadKwh = monthlyBase * 12;
  const annualOffset = Math.min(annualProdKwh, annualLoadKwh);
  const annualSavingsSar = annualOffset * effectiveKwhPrice;

  const panelsCost = panels * selectedPanel.costPerPanel;
  const inverterInstallBase = panelsCost * INSTALL_MARKUP;

  const packagePriceSar = getTierPrice(round(systemKw, 1));

  const systemType = systemTypeFromFlags(input.hasGrid, input.wantBackup);
  let batteryKwhNeeded = 0;
  let batteryCost = 0;
  let inverterUpgradeAdder = 0;

  if (systemType !== 'onGrid') {
    const autonomyHours = systemType === 'offGrid' ? 16 : 6; // design target hours of autonomy
    batteryKwhNeeded = (dailyKWh * (autonomyHours / 24)) / BATTERY_DOD;
    batteryCost = Math.max(0, batteryKwhNeeded * BATTERY_COST_PER_KWH[systemType]);
    inverterUpgradeAdder = inverterInstallBase * INVERTER_UPGRADE_FACTOR[systemType];
  }

  const totalSystemCost = packagePriceSar + batteryCost + inverterUpgradeAdder;

  const firstYearDrop = input.firstYearDrop ?? selectedPanel.firstYearDrop;
  const degradationRate = input.degradationRate ?? selectedPanel.degradationRate;

  const paybackYears = annualSavingsSar > 0 ? totalSystemCost / annualSavingsSar : Infinity;

  let lifetimeGrossSavings = 0;
  for (let year = 1; year <= SYSTEM_LIFETIME_YEARS; year++) {
    const factor = (1 - firstYearDrop) * Math.pow(1 - degradationRate, year - 1);
    const annualProdKwhYear = annualProdKwh * factor;
    const annualOffsetYear = Math.min(annualProdKwhYear, annualLoadKwh);
    lifetimeGrossSavings += annualOffsetYear * effectiveKwhPrice;
  }

  const lifetimeNetSavings = lifetimeGrossSavings - totalSystemCost;

  return {
    ok: true,
    message: 'Solar estimate computed successfully.',
    data: {
      monthly: monthlyBase,
      monthlyBillComputed,
      effectiveKwhPrice,
      systemKw,
      panels,
      areaNeeded,
      annualProdKwh,
      annualSavingsSar,
      paybackYears,
      lifetimeGrossSavings,
      lifetimeNetSavings,
      packagePriceSar,
      panelsCost,
      inverterInstallBase,
      inverterUpgradeAdder,
      batteryCost,
      batteryKwhNeeded,
      totalSystemCost,
      systemType,
      selectedPanel,
      firstYearDrop,
      degradationRate,
      fullDayCoverage,
    },
  };
}
