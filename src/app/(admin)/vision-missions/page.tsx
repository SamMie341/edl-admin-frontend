import type { Metadata } from 'next';
import { VisionMissionsView } from '@/modules/vision-missions/presentation/vision-missions-view';

export const metadata: Metadata = {
  title: 'ວິໄສທັດ ແລະ ພາລະກິດ | EDL Admin',
  description: 'ຄຸ້ມຄອງວິໄສທັດ, ພາລະກິດ, ຄ່ານິຍົມ ແລະ ຄຳຂວັນ ໄຟຟ້າລາວ (EDL)',
};

export default function VisionMissionsPage() {
  return <VisionMissionsView />;
}
