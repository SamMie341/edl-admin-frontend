import type { Metadata } from 'next';
import { ElectricalKnowledgeView } from '@/modules/electrical-knowledge/presentation/electrical-knowledge-view';

export const metadata: Metadata = {
  title: 'ຄວາມຮູ້ດ້ານໄຟຟ້າ (Electrical Knowledge) | EDL Admin',
  description:
    'ລະບົບຄຸ້ມຄອງບົດຄວາມຄວາມຮູ້ດ້ານໄຟຟ້າ, ຄວາມປອດໄພ ແລະ ຄລິບວິດີໂອສຶກສາ ລັດວິສາຫະກິດໄຟຟ້າລາວ',
};

export default function ElectricalKnowledgePage() {
  return <ElectricalKnowledgeView />;
}
