import { useEffect, useState } from 'react';
import { CalendarDays, Save, Edit2 } from 'lucide-react';
import Panel from '../components/Panel.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import ScheduleMatrix from '../components/ScheduleMatrix.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, apiMessage } from '../services/api';

const blank = { numero: '', capacidad: '', ubicacion: 'interior', estado: 'disponible', activo: true };

export default function TablesPage() {
  const { isAdmin } = useAuth();
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');
  
  const load = () => api.get('/tables').then((res) => setTables(res.data.sort((a, b) => a.numero - b.numero)));
  useEffect(() => { load(); }, []);

  const [searchNumber, setSearchNumber] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterCapacidad, setFilterCapacidad] = useState('');
  const [filterUbicacion, setFilterUbicacion] = useState('');
  const [filterActivo, setFilterActivo] = useState('');

  const filteredTables = tables.filter(t => {
    const matchNumber = searchNumber === '' || String(t.numero).includes(searchNumber);
    const matchEstado = filterEstado === '' || t.estado === filterEstado;
    const matchCapacidad = filterCapacidad === '' || String(t.capacidad) === filterCapacidad;
    const matchUbicacion = filterUbicacion === '' || t.ubicacion === filterUbicacion;
    const matchActivo = filterActivo === '' || String(t.activo) === filterActivo;
    
    return matchNumber && matchEstado && matchCapacidad && matchUbicacion && matchActivo;
  });

  async function openSchedule(table, date = scheduleDate) {
    setSelected(table);
    const res = await api.get(`/tables/${table.id}/schedule`, { params: { fecha: date } });
    setSchedule(res.data);
  }

  async function changeScheduleDate(date) {
    setScheduleDate(date);
    if (selected) await openSchedule(selected, date);
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, numero: Number(form.numero), capacidad: Number(form.capacidad), activo: Boolean(form.activo) };
      editing ? await api.put(`/tables/${editing}`, payload) : await api.post('/tables', payload);
      setForm(blank);
      setEditing(null);
      await load();
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10 md:mt-8 text-on-surface font-body-md">
      
      <header className="mb-8">
        <p className="font-label-sm text-[12px] text-secondary uppercase tracking-widest mb-1">Plano y Topología</p>
        <h1 className="font-headline-xl text-[40px] text-primary leading-tight">Gestión de Mesas</h1>
      </header>

      {isAdmin && (
        <Panel title={editing ? 'Actualizar mesa' : 'Registrar nueva mesa'}>
          <form onSubmit={submit}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
              <div className="relative pt-4">
                <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Número</label>
                <input type="number" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} required className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary" />
              </div>
              <div className="relative pt-4">
                <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Capacidad</label>
                <input type="number" value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: e.target.value })} required className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary" />
              </div>
              <div className="relative pt-4">
                <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Ubicación</label>
                <select value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary capitalize cursor-pointer">
                  <option value="interior">Interior</option>
                  <option value="terraza">Terraza</option>
                  <option value="ventana">Ventana</option>
                  <option value="salon_privado">Salón Privado</option>
                  <option value="barra">Barra</option>
                </select>
              </div>
              <div className="relative pt-4">
                <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Estado</label>
                <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })} className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary capitalize cursor-pointer">
                  <option value="disponible">Disponible</option>
                  <option value="ocupada">Ocupada</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="inactiva">Inactiva</option>
                </select>
              </div>
              <div className="relative pt-4">
                <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Activa</label>
                <select value={String(form.activo)} onChange={(e) => setForm({ ...form, activo: e.target.value === 'true' })} className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary cursor-pointer">
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button type="submit" className="bg-primary text-[#C5A059] hover:bg-primary-container px-6 py-2 rounded font-label-md text-[14px] transition-colors shadow-sm flex items-center gap-2">
                <Save size={18} /> {editing ? 'Actualizar' : 'Guardar'}
              </button>
              {editing && (
                <button type="button" onClick={() => {setEditing(null); setForm(blank);}} className="text-secondary hover:text-primary font-label-md transition-colors">
                  Cancelar
                </button>
              )}
              {error && <p className="text-error text-sm ml-auto">{error}</p>}
            </div>
          </form>
        </Panel>
      )}

      {selected && (
        <Modal
          title={`Agenda: Mesa T-${selected.numero}`}
          kicker="VISTA DE HORARIO"
          actions={
            <button className="flex items-center gap-2 text-secondary hover:text-primary transition-colors font-label-md bg-transparent border-none" type="button" onClick={() => openSchedule(selected)}>
              <CalendarDays size={16} /> Refrescar
            </button>
          }
          onClose={() => { setSelected(null); setSchedule(null); }}
        >
          <div className="mb-6 pb-6 border-b border-secondary/20">
            <div className="relative pt-4 w-full md:w-64">
              <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Fecha de Consulta</label>
              <input type="date" value={scheduleDate} onChange={(e) => changeScheduleDate(e.target.value)} className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary" />
            </div>
          </div>
          <ScheduleMatrix schedule={schedule} />
        </Modal>
      )}

      <div className="mb-6 p-5 bg-surface-container-lowest border border-secondary/20 shadow-[inset_0_0_10px_rgba(119,90,25,0.02)] rounded-xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="relative">
            <label className="text-[10px] text-secondary uppercase tracking-widest block mb-1">Buscar Número</label>
            <input type="text" placeholder="Ej. 12" value={searchNumber} onChange={(e) => setSearchNumber(e.target.value)} className="w-full bg-transparent border-b border-secondary/40 focus:border-primary focus:ring-0 py-1 font-body-md text-primary placeholder:text-outline-variant" />
          </div>
          <div className="relative">
            <label className="text-[10px] text-secondary uppercase tracking-widest block mb-1">Estado</label>
            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className="w-full bg-transparent border-b border-secondary/40 focus:border-primary focus:ring-0 py-1 font-body-md text-primary capitalize cursor-pointer">
              <option value="">Todos</option>
              <option value="disponible">Disponible</option>
              <option value="ocupada">Ocupada</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="inactiva">Inactiva</option>
            </select>
          </div>
          <div className="relative">
            <label className="text-[10px] text-secondary uppercase tracking-widest block mb-1">Capacidad</label>
            <input type="number" placeholder="Ej. 4" value={filterCapacidad} onChange={(e) => setFilterCapacidad(e.target.value)} className="w-full bg-transparent border-b border-secondary/40 focus:border-primary focus:ring-0 py-1 font-body-md text-primary placeholder:text-outline-variant" />
          </div>
          <div className="relative">
            <label className="text-[10px] text-secondary uppercase tracking-widest block mb-1">Ubicación</label>
            <select value={filterUbicacion} onChange={(e) => setFilterUbicacion(e.target.value)} className="w-full bg-transparent border-b border-secondary/40 focus:border-primary focus:ring-0 py-1 font-body-md text-primary capitalize cursor-pointer">
              <option value="">Todas</option>
              <option value="interior">Interior</option>
              <option value="terraza">Terraza</option>
              <option value="ventana">Ventana</option>
              <option value="salon_privado">Sal. Privado</option>
              <option value="barra">Barra</option>
            </select>
          </div>
          <div className="relative">
            <label className="text-[10px] text-secondary uppercase tracking-widest block mb-1">Activa</label>
            <select value={filterActivo} onChange={(e) => setFilterActivo(e.target.value)} className="w-full bg-transparent border-b border-secondary/40 focus:border-primary focus:ring-0 py-1 font-body-md text-primary cursor-pointer">
              <option value="">Todas</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredTables.length > 0 ? filteredTables.map((t) => {
          
          let cardStyle = "bg-surface-container-lowest border-secondary/20 border-b-[3px] border-b-[#e9c176] hover:bg-surface-container-low";
          let titleColor = "text-secondary";
          let dotColor = "bg-[#bcf0ae] border border-[#78a96d]"; // Verde pastel para disponible

          if (t.estado === 'ocupada') {
            cardStyle = "bg-primary/5 border-primary/20 border-b-[3px] border-b-primary";
            titleColor = "text-primary";
            dotColor = "bg-primary";
          } else if (t.estado === 'mantenimiento' || !t.activo) {
            cardStyle = "bg-surface-variant opacity-70 border-outline-variant/30";
            titleColor = "text-on-surface-variant";
            dotColor = "bg-outline";
          }

          return (
            <div key={t.id} onClick={() => openSchedule(t)} className={`relative p-6 flex flex-col justify-between aspect-square border shadow-[inset_0px_1px_3px_rgba(74,44,42,0.05)] cursor-pointer transition-colors group ${cardStyle}`}>
              <div className="flex justify-between items-start z-10">
                <h3 className={`font-headline-md text-[32px] leading-none ${titleColor}`}>T-{t.numero}</h3>
                <div className={`w-3 h-3 rounded-full ${dotColor}`}></div>
              </div>
              
              <div className="z-10 mt-auto">
                <p className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-wider mb-1">
                  {t.capacidad} Personas
                </p>
                <p className="font-body-md text-[16px] text-on-surface italic capitalize">
                  {t.ubicacion.replace('_', ' ')}
                  {!t.activo && <span className="text-error ml-2 not-italic text-sm">(Inactiva)</span>}
                </p>
              </div>

              {isAdmin && (
  <button 
    onClick={(e) => { 
      e.preventDefault();
      e.stopPropagation(); 
      setEditing(t.id); 
      setForm(t);
      
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }}
    className="absolute bottom-5 right-5 text-secondary hover:text-primary p-2 rounded-full hover:bg-surface-container-high transition-all opacity-0 group-hover:opacity-100 z-10"
    title="Editar Mesa"
  >
    <Edit2 size={18} />
  </button>
)}
            </div>
          );
        }) : <EmptyState text="No hay mesas registradas en el sistema." />}
      </div>
    </div>
  );
}