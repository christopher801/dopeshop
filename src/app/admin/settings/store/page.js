import SettingsForm from '@/components/admin/SettingsForm';
import { PageHeader } from '@/components/admin/ui';

export const metadata = { title: 'Ajustes de la tienda' };

export default function Page() {
  return (<><PageHeader title="Ajustes de la tienda" /><SettingsForm section="store" /></>);
}
