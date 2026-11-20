export type ElectricityTariffType = 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL';
export type ElectricityTariffStatus = 'ACTIVE' | 'INACTIVE' | 'HISTORICAL';

export const TARIFF_TYPE_CONFIG: Record<
  ElectricityTariffType,
  { label: string; badgeClass: string }
> = {
  RESIDENTIAL: {
    label: 'ທີ່ຢູ່ອາໄສ (Residential)',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/80',
  },
  COMMERCIAL: {
    label: 'ທຸລະກິດ / ການຄ້າ (Commercial)',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
  },
  INDUSTRIAL: {
    label: 'ອຸດສາຫະກຳ (Industrial)',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  },
};

export const TARIFF_STATUS_LABELS: Record<ElectricityTariffStatus, string> = {
  ACTIVE: 'ມີຜົນບັງຄັບໃຊ້ (Active)',
  INACTIVE: 'ປິດການນຳໃຊ້ (Inactive)',
  HISTORICAL: 'ອັດຕາເກົ່າ / ປະຫວັດ (Historical)',
};

export interface ElectricityTariffItem {
  id: number;
  title: string;
  tariffType: ElectricityTariffType;
  imageUrl?: string | null;
  pdfUrl?: string | null;
  effectiveDate: string;
  status: ElectricityTariffStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateElectricityTariffPayload {
  title: string;
  tariffType: ElectricityTariffType;
  imageUrl?: string;
  pdfUrl?: string;
  effectiveDate: string;
  status?: ElectricityTariffStatus;
}

export type UpdateElectricityTariffPayload =
  Partial<CreateElectricityTariffPayload>;

export interface ElectricityTariffQueryParams {
  search?: string;
  tariffType?: ElectricityTariffType;
  status?: ElectricityTariffStatus;
  page?: number;
  limit?: number;
}
