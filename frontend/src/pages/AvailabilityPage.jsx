import { useState } from 'react';
import { Radar } from 'lucide-react';
import Panel from '../components/Panel.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { api, apiMessage } from '../services/api';

export default function AvailabilityPage() {
  const [form, setForm] = useState({ fecha: new Date().toISOString().slice(0, 10), hora_inicio: '19:00', hora_fin: '21:00', num_personas: 2 });
  const [tables, setTables] = useState([]);
  const [error, setError] = useState('');

  async function search(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.get('/reservations/availability', { params: form });
      setTables(res.data);
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10 md:mt-8 text-on-surface font-body-md">
      
      <div className="mb-8">
        <p className="font-label-sm text-[12px] text-secondary uppercase tracking-widest mb-1">Escáner de Salón</p>
        <h1 className="font-headline-xl text-[40px] text-primary leading-tight">Disponibilidad</h1>
      </div>

      <Panel title="Criterios de Búsqueda">
        <form onSubmit={search}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="relative pt-4">
              <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Fecha</label>
              <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary" />
            </div>
            <div className="relative pt-4">
              <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Inicio</label>
              <input type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary" />
            </div>
            <div className="relative pt-4">
              <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Fin</label>
              <input type="time" value={form.hora_fin} onChange={(e) => setForm({ ...form, hora_fin: e.target.value })} className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary" />
            </div>
            <div className="relative pt-4">
              <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Personas</label>
              <input type="number" min="1" value={form.num_personas} onChange={(e) => setForm({ ...form, num_personas: e.target.value })} className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button type="submit" className="bg-primary text-[#C5A059] hover:bg-primary-container px-6 py-2 rounded font-label-md transition-colors shadow-sm flex items-center gap-2">
              <Radar size={18} /> Escanear Mesas
            </button>
            {error && <p className="text-error text-sm">{error}</p>}
          </div>
        </form>
      </Panel>

      {/* Resultados de Mesas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {tables.length ? tables.map((t) => (
          <div key={t.id} className="bg-surface-container-lowest border border-secondary-fixed-dim/40 border-b-[3px] border-b-[#e9c176] shadow-sm p-6 flex flex-col justify-between aspect-square rounded-xl">
            <div className="flex justify-between items-start">
              <h2 className="font-headline-md text-[32px] text-secondary leading-none">T-{t.numero}</h2>
              <div className="w-3 h-3 rounded-full border border-[#78a96d] bg-[#bcf0ae]"></div>
            </div>
            <div className="mt-auto">
              <p className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-wider mb-1">{t.capacidad} Personas</p>
              <p className="font-body-md text-[16px] text-on-surface italic capitalize">{t.ubicacion.replace('_', ' ')}</p>
            </div>
          </div>
        )) : (
          <div className="col-span-full">
            <EmptyState text="Esperando parámetros de búsqueda. Ejecuta un escaneo para ver mesas." />
          </div>
        )}
      </div>
    </div>
  );
}