import type { Metadata } from 'next';
import { OrgStructuresView } from '@/modules/organization-structures/presentation/org-structures-view';

export const metadata: Metadata = {
  title: 'ໂຄງຮ່າງການຈັດຕັ້ງ | EDL Admin',
  description: 'ຄຸ້ມຄອງແຜນຜັງໂຄງຮ່າງການຈັດຕັ້ງ ໄຟຟ້າລາວ (EDL)',
};

export default function OrgStructuresPage() {
  return <OrgStructuresView />;
}
