import { useEffect, useState } from 'react';
import { Save, Search, Edit2 } from 'lucide-react';
import { api, apiMessage } from '../services/api';

const blank = { nombres: '', apellidos: '', telefono: '', email: '', num_id: '' };

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = () => api.get('/clients', { params: { search } }).then((res) => setClients(res.data));
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      editing ? await api.put(`/clients/${editing}`, form) : await api.post('/clients', form);
      setForm(blank);
      setEditing(null);
      await load();
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  // Helper para generar iniciales
  const getInitials = (nombres, apellidos) => {
    return `${nombres?.charAt(0) || ''}${apellidos?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10 md:mt-8 text-on-surface font-body-md">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="font-headline-xl text-headline-xl text-primary mb-2">Clientes</h2>
          <p className="font-body-md text-on-surface-variant italic">
            Gestión de perfiles y registro del restaurante.
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-0 bottom-2 text-outline/60" size={20} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
              className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 pl-8 pr-4 py-2 font-body-md text-on-surface placeholder:text-outline-variant transition-colors"
              placeholder="Buscar cliente..."
            />
          </div>
          <button onClick={load} className="text-secondary hover:text-primary px-4 py-2 font-label-md transition-colors hidden md:block">
            Buscar
          </button>
        </div>
      </div>

      {/* Formulario (Vintage Style) */}
      <div className="mb-10 p-6 bg-surface-container-lowest border border-secondary/20 shadow-[inset_0_0_20px_rgba(119,90,25,0.02)] rounded-xl relative">
        <h3 className="font-headline-md text-[24px] text-primary mb-6 border-b border-secondary/20 pb-2">
          {editing ? 'Actualizar información del huésped' : 'Registrar nuevo huésped'}
        </h3>
        
        <form onSubmit={submit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 mb-8">
            {['nombres', 'apellidos', 'telefono', 'email', 'num_id'].map((key) => (
              <div key={key} className="relative pt-4">
                <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">
                  {key === 'num_id' ? 'Identificación' : key}
                </label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required={key === 'nombres' || key === 'apellidos'}
                  className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary placeholder:text-outline-variant transition-colors focus:outline-none"
                />
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <button type="submit" className="bg-primary text-[#C5A059] hover:bg-primary-container px-6 py-2 rounded font-label-md text-[14px] transition-colors shadow-sm flex items-center gap-2 tracking-wide">
              <Save size={18} /> {editing ? 'Actualizar' : 'Guardar'}
            </button>
            {editing && (
              <button type="button" onClick={() => {setEditing(null); setForm(blank);}} className="text-secondary hover:text-primary font-label-md text-[14px] transition-colors">
                Cancelar
              </button>
            )}
            {error && <p className="text-error text-sm ml-auto">{error}</p>}
          </div>
        </form>
      </div>

      {/* Directorio de Clientes (Ledger View) */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[inset_0_0_0_1px_rgba(74,44,42,0.08),0_4px_24px_-8px_rgba(74,44,42,0.05)] overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-secondary/30">
                <th className="py-4 px-6 font-label-sm text-[12px] text-secondary uppercase tracking-wider">Huésped</th>
                <th className="py-4 px-6 font-label-sm text-[12px] text-secondary uppercase tracking-wider">Teléfono</th>
                <th className="py-4 px-6 font-label-sm text-[12px] text-secondary uppercase tracking-wider hidden sm:table-cell">Correo</th>
                <th className="py-4 px-6 font-label-sm text-[12px] text-secondary uppercase tracking-wider text-right">Identificación</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-on-surface">
              {clients.length > 0 ? (
                clients.map((c) => (
                  <tr key={c.id} className="border-b border-secondary/10 hover:bg-surface-container-low/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-primary font-headline-md text-[18px] shrink-0 border border-outline-variant/30">
                          {getInitials(c.nombres, c.apellidos)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-headline-md text-[20px] leading-tight text-primary">
                            {c.nombres} {c.apellidos}
                          </span>
                          {/* El botón de editar se muestra al pasar el mouse por encima de la fila */}
                          <button 
                            type="button" 
                            onClick={() => { setEditing(c.id); setForm(c); }} 
                            className="p-1.5 text-secondary hover:text-primary rounded-full hover:bg-surface-container transition-all opacity-0 group-hover:opacity-100" 
                            title="Editar Perfil"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">{c.telefono || '—'}</td>
                    <td className="py-4 px-6 text-on-surface-variant hidden sm:table-cell">{c.email || '—'}</td>
                    <td className="py-4 px-6 text-on-surface-variant text-right">{c.num_id || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-on-surface-variant italic">
                    No se encontraron registros en el directorio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}