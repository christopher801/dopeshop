'use client';

import { useEffect, useState } from 'react';
import Field from '@/components/ui/Field';
import { useToast } from '@/context/ToastContext';
import { useAdminData } from '@/hooks/useAdminData';
import { apiFetch } from '@/lib/utils/api';
import { DataState } from './ui';

export default function SettingsForm({ section }) {
  const { data, error, loading, reload } = useAdminData('/api/admin/settings');
  const { toast } = useToast();
  const [s, setS] = useState(null);
  const [lines, setLines] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (data?.item) {
      setS(data.item);
      setLines((data.item.announcement?.messages || []).join('\n'));
    }
  }, [data]);

  const set = (k) => (e) => setS((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setSocial = (k) => (e) => setS((x) => ({ ...x, social: { ...x.social, [k]: e.target.value } }));
  const err = (k) => errors[k]?.[0];

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const body = {
        ...s,
        whatsapp: String(s.whatsapp || '').replace(/\D/g, ''),
        deliveryFee: Number(s.deliveryFee) || 0,
        freeDeliveryThreshold: Number(s.freeDeliveryThreshold) || 0,
        announcement: { enabled: Boolean(s.announcement?.enabled), messages: lines.split('\n').map((l) => l.trim()).filter(Boolean) },
      };
      delete body.id; delete body.updatedAt;
      await apiFetch('/api/admin/settings', { method: 'PUT', body, auth: true });
      toast('Ajustes guardados.');
      reload();
    } catch (er) {
      setErrors(er.details || {});
      toast(er.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <DataState loading={loading || !s} error={error} reload={reload}>
      {s && (
        <form onSubmit={save} noValidate className="space-y-6">
          {section === 'store' && (
            <>
              <section className="card space-y-4 p-5">
                <h2 className="text-lg">Información de la tienda</h2>
                <Field id="storeName" label="Nombre de la tienda" error={err('storeName')} required><input id="storeName" className="input" value={s.storeName} onChange={set('storeName')} /></Field>
                <Field id="description" label="Descripción" error={err('description')}><textarea id="description" rows={2} className="input" value={s.description} onChange={set('description')} /></Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field id="whatsapp" label="WhatsApp de la tienda" error={err('whatsapp')} hint="Solo dígitos con código de país. Ej.: 1809XXXXXXX"><input id="whatsapp" inputMode="numeric" className="input" value={s.whatsapp} onChange={set('whatsapp')} /></Field>
                  <Field id="email" label="Correo de contacto" error={err('email')}><input id="email" type="email" className="input" value={s.email} onChange={set('email')} /></Field>
                  <Field id="phone" label="Teléfono"><input id="phone" className="input" value={s.phone} onChange={set('phone')} /></Field>
                  <Field id="hours" label="Horario"><input id="hours" className="input" value={s.hours} onChange={set('hours')} /></Field>
                </div>
                <Field id="address" label="Dirección"><input id="address" className="input" value={s.address} onChange={set('address')} /></Field>
              </section>
              <section className="card space-y-4 p-5">
                <h2 className="text-lg">Entrega y moneda</h2>
                <p className="text-sm text-muted">Moneda: peso dominicano (DOP, RD$).</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field id="deliveryFee" label="Costo de entrega a domicilio (RD$)" hint="0 = se confirma por WhatsApp."><input id="deliveryFee" inputMode="decimal" className="input" value={s.deliveryFee} onChange={set('deliveryFee')} /></Field>
                  <Field id="freeDeliveryThreshold" label="Entrega gratis desde (RD$)" hint="0 = desactivado."><input id="freeDeliveryThreshold" inputMode="decimal" className="input" value={s.freeDeliveryThreshold} onChange={set('freeDeliveryThreshold')} /></Field>
                </div>
                <Field id="deliveryNote" label="Nota de entrega"><input id="deliveryNote" className="input" value={s.deliveryNote} onChange={set('deliveryNote')} /></Field>
              </section>
              <section className="card space-y-4 p-5">
                <h2 className="text-lg">Redes sociales</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {['instagram', 'facebook', 'tiktok'].map((k) => <Field key={k} id={k} label={k[0].toUpperCase() + k.slice(1)} hint="URL completa"><input id={k} type="url" className="input" value={s.social?.[k] || ''} onChange={setSocial(k)} /></Field>)}
                </div>
              </section>
              <section className="card space-y-4 p-5">
                <h2 className="text-lg">Barra de anuncios</h2>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-ink" checked={Boolean(s.announcement?.enabled)} onChange={(e) => setS((x) => ({ ...x, announcement: { ...x.announcement, enabled: e.target.checked } }))} /> Mostrar barra de anuncios</label>
                <Field id="messages" label="Mensajes (uno por línea, máx. 6)"><textarea id="messages" rows={3} className="input" value={lines} onChange={(e) => setLines(e.target.value)} /></Field>
              </section>
            </>
          )}
          {section === 'seo' && (
            <section className="card space-y-4 p-5">
              <h2 className="text-lg">SEO por defecto</h2>
              <Field id="seoTitle" label="Título SEO" error={err('seoTitle')} hint={`${(s.seoTitle || '').length}/70`}><input id="seoTitle" maxLength={70} className="input" value={s.seoTitle} onChange={set('seoTitle')} /></Field>
              <Field id="seoDescription" label="Descripción SEO" error={err('seoDescription')} hint={`${(s.seoDescription || '').length}/170`}><textarea id="seoDescription" maxLength={170} rows={3} className="input" value={s.seoDescription} onChange={set('seoDescription')} /></Field>
              <p className="text-xs text-muted">La verificación de Google/Bing y el ID de Analytics se configuran con variables de entorno (ver documentation/SEO_GUIDE.md).</p>
            </section>
          )}
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar ajustes'}</button>
        </form>
      )}
    </DataState>
  );
}
