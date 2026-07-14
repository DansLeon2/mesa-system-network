import { useEffect, useState } from 'react';
import { Ban, Check, Save } from 'lucide-react';
import Panel from '../components/Panel.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ScheduleMatrix from '../components/ScheduleMatrix.jsx';
import { api, apiMessage } from '../services/api';

const blank = {
  id_cliente: '',
  id_mesa: '',
  fecha: new Date().toISOString().slice(0, 10),
  hora_inicio: '19:00',
  hora_fin: '21:00',
  num_personas: 2,
  estado: 'pendiente',
  observaciones: ''
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [clients, setClients] = useState([]);
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ fecha: '', estado: '' });

  const load = () => api.get('/reservations', { params: filters }).then((res) => setReservations(res.data));
  useEffect(() => {
    load();
    api.get('/clients').then((res) => setClients(res.data));
    api.get('/tables').then((res) => setTables(res.data));
  }, []);

  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);


  const filteredClients = clients.filter(c => 
    `${c.nombres} ${c.apellidos}`.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const handleSelectClient = (client) => {
    updateForm({ id_cliente: client.id });
    setClientSearch(`${client.nombres} ${client.apellidos}`);
    setShowClientDropdown(false);
  };

  useEffect(() => {
    if (!form.id_mesa || !form.fecha) {
      setSchedule(null);
      return;
    }
    api.get(`/tables/${form.id_mesa}/schedule`, { params: { fecha: form.fecha } })
      .then((res) => setSchedule(res.data))
      .catch(() => setSchedule(null));
  }, [form.id_mesa, form.fecha]);

  function updateForm(patch) {
    setForm((current) => ({ ...current, ...patch }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        id_cliente: Number(form.id_cliente),
        id_mesa: Number(form.id_mesa),
        num_personas: Number(form.num_personas)
      };
      editing ? await api.put(`/reservations/${editing}`, payload) : await api.post('/reservations', payload);
      setForm(blank);
      setEditing(null);
      setClientSearch('');
      await load();
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  async function setStatus(id, estado) {
    await api.patch(`/reservations/${id}/status`, { estado });
    await load();
  }

  async function cancel(id) {
    await api.patch(`/reservations/${id}/cancel`);
    await load();
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10 md:mt-8 text-on-surface font-body-md">
      
      <header className="mb-8">
        <p className="font-label-sm text-[12px] text-secondary uppercase tracking-widest mb-1">Libro de Registro</p>
        <h1 className="font-headline-xl text-[40px] text-primary leading-tight">Reservaciones</h1>
      </header>

      <Panel title={editing ? 'Modificar reserva' : 'Crear nueva reserva'}>
        <form onSubmit={submit} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6 mb-8">
            
            <div className="relative pt-4">
  <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">
    Cliente
  </label>
  
  <input 
    type="text"
    value={clientSearch}
    placeholder="Buscar huésped por nombre..."
    className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary placeholder:text-outline-variant transition-colors"
    required={!form.id_cliente} 
    onChange={(e) => {
      setClientSearch(e.target.value);
      setShowClientDropdown(true);
      if (e.target.value === '') updateForm({ id_cliente: '' }); 
    }}
    onFocus={() => setShowClientDropdown(true)}
    onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)} 
  />

  
  {showClientDropdown && filteredClients.length > 0 && (
    <ul className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto bg-surface-container-lowest border border-secondary/20 shadow-xl rounded-md hide-scrollbar">
      {filteredClients.map((c) => (
        <li 
          key={c.id} 
          onMouseDown={() => handleSelectClient(c)} 
          className="px-4 py-3 hover:bg-surface-container-low cursor-pointer font-body-md text-primary border-b border-secondary/10 last:border-0 transition-colors"
        >
          <span className="block">{c.nombres} {c.apellidos}</span>
          {c.email && <span className="block text-[12px] text-on-surface-variant italic">{c.email}</span>}
        </li>
      ))}
    </ul>
  )}
</div>

            <div className="relative pt-4">
              <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Mesa</label>
              <select value={form.id_mesa} onChange={(e) => updateForm({ id_mesa: e.target.value })} required className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary cursor-pointer">
                <option value="">Seleccionar mesa...</option>
                {tables.map((t) => <option key={t.id} value={t.id}>T-{t.numero} ({t.capacidad} pax)</option>)}
              </select>
            </div>

            <div className="relative pt-4">
              <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Fecha</label>
              <input type="date" value={form.fecha} onChange={(e) => updateForm({ fecha: e.target.value })} className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary" />
            </div>

            <div className="relative pt-4">
              <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Personas</label>
              <input type="number" min="1" value={form.num_personas} onChange={(e) => updateForm({ num_personas: e.target.value })} className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary" />
            </div>

            <div className="relative pt-4">
              <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Inicio</label>
              <input type="time" value={form.hora_inicio} onChange={(e) => updateForm({ hora_inicio: e.target.value })} className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary" />
            </div>

            <div className="relative pt-4">
              <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Fin</label>
              <input type="time" value={form.hora_fin} onChange={(e) => updateForm({ hora_fin: e.target.value })} className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary" />
            </div>

            <div className="relative pt-4">
              <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Estado</label>
              <select value={form.estado} onChange={(e) => updateForm({ estado: e.target.value })} className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary cursor-pointer capitalize">
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
                <option value="finalizada">Finalizada</option>
                <option value="no_asistio">No Asistió</option>
              </select>
            </div>

            <div className="relative pt-4">
              <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Notas</label>
              <input value={form.observaciones || ''} onChange={(e) => updateForm({ observaciones: e.target.value })} placeholder="Alergias, VIP, etc." className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary placeholder:text-outline-variant" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button type="submit" className="bg-primary text-[#C5A059] hover:bg-primary-container px-6 py-2 rounded font-label-md text-[14px] transition-colors shadow-sm flex items-center gap-2 tracking-wide">
              <Save size={18} /> Guardar Registro
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setForm(blank); }} className="text-secondary hover:text-primary font-label-md transition-colors">
                Cancelar
              </button>
            )}
            {error && <p className="text-error text-sm ml-auto">{error}</p>}
          </div>
        </form>

        <div className="border-t border-secondary/20 pt-6">
          <p className="font-label-sm text-[12px] text-secondary uppercase tracking-widest mb-4">Agenda de la Mesa Seleccionada</p>
          <ScheduleMatrix
            schedule={schedule}
            compact
            onSelectSlot={(slot) => updateForm({ hora_inicio: slot.hora_inicio, hora_fin: slot.hora_fin })}
          />
        </div>
      </Panel>

      <Panel title="Directorio de Reservas Activas" kicker="FILTRAR Y GESTIONAR">
        <div className="flex flex-wrap gap-6 mb-6">
          <div className="relative pt-4 w-full md:w-48">
            <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Fecha</label>
            <input type="date" value={filters.fecha} onChange={(e) => setFilters({ ...filters, fecha: e.target.value })} className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-1 font-body-md text-primary" />
          </div>
          <div className="relative pt-4 w-full md:w-48">
            <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Estado</label>
            <select value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value })} className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-1 font-body-md text-primary cursor-pointer capitalize">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
              <option value="finalizada">Finalizada</option>
              <option value="no_asistio">No Asistió</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="button" onClick={load} className="text-secondary hover:text-primary border-b border-secondary font-label-md py-1 transition-colors">
              Aplicar Filtros
            </button>
          </div>
        </div>

        {reservations.length ? (
          <div className="overflow-x-auto -mx-6 md:mx-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-secondary/30">
                  <th className="py-3 px-4 font-label-sm text-[11px] text-secondary uppercase tracking-wider">Huésped</th>
                  <th className="py-3 px-4 font-label-sm text-[11px] text-secondary uppercase tracking-wider text-center">Mesa</th>
                  <th className="py-3 px-4 font-label-sm text-[11px] text-secondary uppercase tracking-wider">Fecha / Horario</th>
                  <th className="py-3 px-4 font-label-sm text-[11px] text-secondary uppercase tracking-wider text-center">Estado</th>
                  <th className="py-3 px-4 font-label-sm text-[11px] text-secondary uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-on-surface">
                {reservations.map((r) => (
                  <tr key={r.id} className="border-b border-secondary/10 hover:bg-surface-container-low/30 transition-colors group">
                    <td className="py-3 px-4 font-headline-md text-[18px] text-primary">{r.nombres} {r.apellidos}</td>
                    <td className="py-3 px-4 text-center text-on-surface-variant font-medium">#{r.numero_mesa}</td>
                    <td className="py-3 px-4 text-on-surface-variant">
                      {String(r.fecha).slice(0, 10)} <span className="text-secondary mx-1">•</span> {r.hora_inicio.slice(0,5)} - {r.hora_fin.slice(0,5)}
                    </td>
                    <td className="py-3 px-4 text-center"><StatusBadge value={r.estado} /></td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-secondary hover:text-primary rounded-full hover:bg-surface-container transition-colors" title="Editar" onClick={() => { setEditing(r.id); setForm({ ...r, fecha: String(r.fecha).slice(0, 10) }); }}>
                          <Save size={16} />
                        </button>
                        <button className="p-2 text-[#78a96d] hover:text-[#23501e] rounded-full hover:bg-tertiary-fixed/30 transition-colors" title="Confirmar" onClick={() => setStatus(r.id, 'confirmada')}>
                          <Check size={16} />
                        </button>
                        <button className="p-2 text-error/70 hover:text-error rounded-full hover:bg-error-container/30 transition-colors" title="Cancelar Reserva" onClick={() => cancel(r.id)}>
                          <Ban size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState text="No se encontraron reservas con los filtros actuales." />}
      </Panel>
    </div>
  );
}