import type { Metadata } from 'next';
import { LocationsView } from '@/modules/locations/presentation/locations-view';

export const metadata: Metadata = {
  title: 'ຂໍ້ມູນແຂວງ / ເມືອງ / ບ້ານ (Locations) | EDL Admin',
  description:
    'ລະບົບບໍລິຫານຈັດການ ແລະ ຊິ້ງຂໍ້ມູນພູມສາດ ແຂວງ, ເມືອງ, ບ້ານ ລັດວິສາຫະກິດໄຟຟ້າລາວ',
};

export default function LocationsPage() {
  return <LocationsView />;
}
