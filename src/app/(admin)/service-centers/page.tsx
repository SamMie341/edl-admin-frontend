import type { Metadata } from 'next';
import { ServiceCentersView } from '@/modules/service-centers/presentation/service-centers-view';

export const metadata: Metadata = {
  title: 'ສູນບໍລິການລູກຄ້າ (Service Centers) | EDL Admin',
  description: 'ລະບົບບໍລິຫານຈັດການຂໍ້ມູນສູນບໍລິການລູກຄ້າ ຟຟລ ທົ່ວປະເທດ',
};

export default function ServiceCentersPage() {
  return <ServiceCentersView />;
}
