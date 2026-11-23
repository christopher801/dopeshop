import SettingsForm from '@/components/admin/SettingsForm';
import { PageHeader } from '@/components/admin/ui';

export const metadata = { title: 'Ajustes SEO' };

export default function Page() {
  return (<><PageHeader title="Ajustes SEO" /><SettingsForm section="seo" /></>);
}
