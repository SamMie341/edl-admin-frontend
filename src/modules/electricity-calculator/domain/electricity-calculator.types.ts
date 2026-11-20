export type CommonStatus = 'ACTIVE' | 'INACTIVE';
export type EffortLevel = 'EASY' | 'LOW_COST' | 'INVESTMENT';
export type SavingRuleType = 'FIXED_FRACTION' | 'REDUCE_HOURS' | 'REPLACE_WATTAGE';

// ============================================================================
// 1. Entities
// ============================================================================

export interface ApplianceCategory {
  id: number;
  nameLa: string;
  nameEn?: string | null;
  orderIndex: number;
  status: CommonStatus;
  createdAt: string;
  updatedAt: string;
  presets?: AppliancePreset[];
  actionTemplates?: SavingActionTemplate[];
  _count?: {
    presets?: number;
    actionTemplates?: number;
  };
}

export interface AppliancePreset {
  id: number;
  categoryId: number;
  nameLa: string;
  nameEn?: string | null;
  defaultWatt: number;
  defaultQuantity: number;
  defaultHoursPerDay: number;
  defaultDaysPerMonth: number;
  isSampleDefault: boolean;
  orderIndex: number;
  status: CommonStatus;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    nameLa: string;
    nameEn?: string | null;
  };
}

export interface SavingActionTemplate {
  id: number;
  categoryId: number;
  titleLa: string;
  titleEn?: string | null;
  descriptionLa: string;
  descriptionEn?: string | null;
  effortLevel: EffortLevel;
  ruleType: SavingRuleType;
  fixedFraction?: number | null;
  reduceHoursBy?: number | null;
  targetWattLow?: number | null;
  targetWattHigh?: number | null;
  defaultSelected: boolean;
  orderIndex: number;
  status: CommonStatus;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    nameLa: string;
    nameEn?: string | null;
  };
}

export interface TariffCategory {
  id: number;
  nameLa: string;
  nameEn?: string | null;
  categoryGroup?: 'RESIDENTIAL' | 'NON_RESIDENTIAL' | string | null;
  voltageLevel?: '0.4 kV' | '22 kV' | '115 kV' | string | null;
  description?: string | null;
  orderIndex: number;
  status: CommonStatus;
  createdAt: string;
  updatedAt: string;
  schedules?: TariffSchedule[];
  _count?: {
    schedules?: number;
  };
}

export interface TariffTier {
  id: number;
  scheduleId: number;
  tierOrder: number;
  label: string;
  minKwh: number;
  maxKwh?: number | null;
  rateKipPerKwh: number;
  createdAt: string;
  updatedAt: string;
}

export interface TariffSchedule {
  id: number;
  noticeId: number;
  categoryId?: number;
  year: number;
  month: number;
  isHotSeason: boolean;
  maintenanceFeeKip?: number | null;
  createdAt: string;
  updatedAt: string;
  notice?: TariffNotice;
  category?: TariffCategory;
  tiers?: TariffTier[];
}

export interface TariffNotice {
  id: number;
  noticeNumber: string;
  title: string;
  issuedDate: string;
  effectiveFrom: string;
  effectiveTo: string;
  vatRate: number;
  hotSeasonDiscountCapKwh: number;
  maintenanceFeeKip: number;
  status: CommonStatus;
  createdAt: string;
  updatedAt: string;
  schedules?: TariffSchedule[];
  _count?: {
    schedules?: number;
  };
}

// ============================================================================
// 2. Payloads (Create / Update)
// ============================================================================

export interface CreateApplianceCategoryPayload {
  nameLa: string;
  nameEn?: string;
  orderIndex?: number;
  status?: CommonStatus;
}

export interface UpdateApplianceCategoryPayload {
  nameLa?: string;
  nameEn?: string;
  orderIndex?: number;
  status?: CommonStatus;
}

export interface CreateAppliancePresetPayload {
  categoryId: number;
  nameLa: string;
  nameEn?: string;
  defaultWatt: number;
  defaultQuantity?: number;
  defaultHoursPerDay?: number;
  defaultDaysPerMonth?: number;
  isSampleDefault?: boolean;
  orderIndex?: number;
  status?: CommonStatus;
}

export interface UpdateAppliancePresetPayload {
  categoryId?: number;
  nameLa?: string;
  nameEn?: string;
  defaultWatt?: number;
  defaultQuantity?: number;
  defaultHoursPerDay?: number;
  defaultDaysPerMonth?: number;
  isSampleDefault?: boolean;
  orderIndex?: number;
  status?: CommonStatus;
}

export interface CreateSavingActionTemplatePayload {
  categoryId: number;
  titleLa: string;
  titleEn?: string;
  descriptionLa: string;
  descriptionEn?: string;
  effortLevel?: EffortLevel;
  ruleType: SavingRuleType;
  fixedFraction?: number | null;
  reduceHoursBy?: number | null;
  targetWattLow?: number | null;
  targetWattHigh?: number | null;
  defaultSelected?: boolean;
  orderIndex?: number;
  status?: CommonStatus;
}

export interface UpdateSavingActionTemplatePayload {
  categoryId?: number;
  titleLa?: string;
  titleEn?: string;
  descriptionLa?: string;
  descriptionEn?: string;
  effortLevel?: EffortLevel;
  ruleType?: SavingRuleType;
  fixedFraction?: number | null;
  reduceHoursBy?: number | null;
  targetWattLow?: number | null;
  targetWattHigh?: number | null;
  defaultSelected?: boolean;
  orderIndex?: number;
  status?: CommonStatus;
}

export interface CreateTariffCategoryPayload {
  nameLa: string;
  nameEn?: string;
  categoryGroup?: 'RESIDENTIAL' | 'NON_RESIDENTIAL' | string;
  voltageLevel?: '0.4 kV' | '22 kV' | '115 kV' | string;
  description?: string;
  orderIndex?: number;
  status?: CommonStatus;
}

export interface UpdateTariffCategoryPayload {
  nameLa?: string;
  nameEn?: string;
  categoryGroup?: 'RESIDENTIAL' | 'NON_RESIDENTIAL' | string;
  voltageLevel?: '0.4 kV' | '22 kV' | '115 kV' | string;
  description?: string;
  orderIndex?: number;
  status?: CommonStatus;
}

export interface CreateTariffNoticePayload {
  noticeNumber: string;
  title: string;
  issuedDate: string;
  effectiveFrom: string;
  effectiveTo: string;
  vatRate?: number;
  hotSeasonDiscountCapKwh?: number;
  maintenanceFeeKip?: number;
  status?: CommonStatus;
}

export interface UpdateTariffNoticePayload {
  noticeNumber?: string;
  title?: string;
  issuedDate?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  vatRate?: number;
  hotSeasonDiscountCapKwh?: number;
  maintenanceFeeKip?: number;
  status?: CommonStatus;
}

export interface TariffTierInput {
  tierOrder: number;
  label: string;
  minKwh: number;
  maxKwh?: number | null;
  rateKipPerKwh: number;
}

export interface UpsertTariffSchedulePayload {
  noticeId: number;
  categoryId?: number;
  year: number;
  month: number;
  isHotSeason?: boolean;
  maintenanceFeeKip?: number | null;
  tiers: TariffTierInput[];
}

// ============================================================================
// 3. Calculator Calculation & Simulation Types
// ============================================================================

export interface ApplianceCalculationInput {
  categoryId?: number;
  presetId?: number;
  customName?: string;
  watt: number;
  quantity: number;
  hoursPerDay: number;
  daysPerMonth?: number;
}

export interface CalculateElectricityPayload {
  year?: number;
  month?: number;
  categoryId?: number;
  directMonthlyKwh?: number;
  maintenanceFeeKip?: number;
  appliances?: ApplianceCalculationInput[];
  selectedActionIds?: number[];
}

export interface TierBreakdownItem {
  tierOrder: number;
  label: string;
  minKwh: number;
  maxKwh: number | null;
  tierKwh: number;
  rateKipPerKwh: number;
  costKip: number;
}

export interface TariffBillResult {
  totalKwh: number;
  highestTierOrder: number;
  baseCostKip: number;
  hotSeasonDiscountKip: number;
  netBaseCostKip: number;
  maintenanceFeeKip: number;
  subtotalBeforeVatKip: number;
  vatCostKip: number;
  totalCostKip: number;
  tierBreakdown: TierBreakdownItem[];
}

export interface SavingRecommendationItem {
  templateId: number;
  templateCode?: string;
  titleLa: string;
  titleEn?: string | null;
  descriptionLa: string;
  descriptionEn?: string | null;
  effortLevel: EffortLevel | string;
  appliedApplianceCount: number;
  savedKwhPerMonth: number;
  savedKipPerMonth: number;
  isDefaultSelected: boolean;
}

export interface YearlyOutlookItem {
  year: number;
  month: number;
  beforeTotalCostKip: number;
  afterTotalCostKip: number;
  monthlySavedKip: number;
  yearlySavedKip: number;
}

export interface CalculateBillResponse {
  selectedPeriod: {
    scheduleId: number;
    categoryId: number;
    categoryNameLa?: string;
    categoryNameEn?: string | null;
    categoryGroup?: string | null;
    voltageLevel?: string | null;
    year: number;
    month: number;
    isHotSeason: boolean;
    noticeNumber: string;
    vatRate: number;
    maintenanceFeeKip: number;
  };
  summary: {
    totalMonthlyKwh: number;
    afterPlanKwh: number;
    totalSavedKwh: number;
    currentTierOrder: number;
    afterTierOrder: number;
    baseCostKip: number;
    hotSeasonDiscountKip: number;
    netBaseCostKip: number;
    maintenanceFeeKip: number;
    subtotalBeforeVatKip: number;
    vatCostKip: number;
    totalCostKip: number;
    afterPlanCostKip: number;
    monthlySavedKip: number;
    yearlySavedKip: number;
  };
  currentBill: TariffBillResult;
  afterPlanBill: TariffBillResult;
  appliances: Array<{
    index: number;
    categoryId?: number | null;
    presetId?: number | null;
    customName: string;
    watt: number;
    quantity: number;
    hoursPerDay: number;
    daysPerMonth: number;
    monthlyKwh: number;
    sharePercent: number;
  }>;
  savingRecommendations: SavingRecommendationItem[];
  yearlyOutlook: YearlyOutlookItem[];
}

export interface CalculatorConfigResponse {
  categories: Array<{
    id: number;
    nameLa: string;
    nameEn?: string | null;
    orderIndex: number;
    presets: Array<{
      id: number;
      nameLa: string;
      nameEn?: string | null;
      defaultWatt: number;
      defaultQuantity: number;
      defaultHoursPerDay: number;
      defaultDaysPerMonth: number;
      isSampleDefault: boolean;
    }>;
    actionTemplates: Array<{
      id: number;
      titleLa: string;
      titleEn?: string | null;
      descriptionLa: string;
      descriptionEn?: string | null;
      effortLevel: EffortLevel;
      ruleType: SavingRuleType;
      fixedFraction?: number | null;
      reduceHoursBy?: number | null;
      targetWattLow?: number | null;
      targetWattHigh?: number | null;
      defaultSelected: boolean;
    }>;
  }>;
  tariffCategories?: Array<{
    id: number;
    nameLa: string;
    nameEn?: string | null;
    categoryGroup?: string | null;
    voltageLevel?: string | null;
    description?: string | null;
    orderIndex: number;
  }>;
  availableSchedules: Array<{
    id: number;
    categoryId?: number;
    year: number;
    month: number;
    isHotSeason: boolean;
    maintenanceFeeKip?: number;
    noticeNumber: string;
  }>;
  defaultSchedule?: TariffSchedule | null;
  sampleAppliances: ApplianceCalculationInput[];
}
