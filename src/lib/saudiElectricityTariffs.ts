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
