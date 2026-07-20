import { useEffect, useState } from 'react';
import { CalendarClock, CheckCircle2, Table2, Users } from 'lucide-react';
import Panel from '../components/Panel.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { api } from '../services/api';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({});
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    api.get('/reports/dashboard').then((res) => setMetrics(res.data));
    api.get('/reservations').then((res) => setReservations(res.data.slice(0, 6)));
  }, []);

  const cards = [
    { label: 'Reservas Hoy', value: metrics.reservas_hoy || 0, Icon: CalendarClock },
    { label: 'Confirmadas', value: metrics.confirmadas || 0, Icon: CheckCircle2 },
    { label: 'Total Clientes', value: metrics.clientes || 0, Icon: Users },
    { label: 'Mesas Activas', value: metrics.mesas_activas || 0, Icon: Table2 }
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10 md:mt-8 text-on-surface font-body-md">
      
     
      <div className="mb-8">
        <p className="font-label-sm text-[12px] text-secondary uppercase tracking-widest mb-1">Resumen Diario</p>
        <h1 className="font-headline-xl text-[40px] text-primary leading-tight">Dashboard</h1>
      </div>

    
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {cards.map(({ label, value, Icon }) => (
          <div key={label} className="bg-surface-container-low border border-secondary/10 shadow-[0_4px_12px_rgba(74,44,42,0.03)] rounded-xl p-6 flex flex-col justify-between h-36 border-b-[3px] border-b-secondary-container">
            <div className="flex justify-between items-start">
              <Icon className="text-secondary opacity-80" size={24} />
            </div>
            <div>
              <p className="font-headline-xl text-[32px] text-primary leading-none">{value}</p>
              <p className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest mt-2">{label}</p>
            </div>
          </div>
        ))}
      </div>

      
      <Panel title="Últimas Reservaciones" kicker="BITÁCORA EN VIVO">
        {reservations.length ? (
          <div className="overflow-x-auto -mx-6 md:mx-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-secondary/30">
                  <th className="py-4 px-6 font-label-sm text-[11px] text-secondary uppercase tracking-wider">Huésped</th>
                  <th className="py-4 px-6 font-label-sm text-[11px] text-secondary uppercase tracking-wider text-center">Mesa</th>
                  <th className="py-4 px-6 font-label-sm text-[11px] text-secondary uppercase tracking-wider">Fecha</th>
                  <th className="py-4 px-6 font-label-sm text-[11px] text-secondary uppercase tracking-wider">Hora</th>
                  <th className="py-4 px-6 font-label-sm text-[11px] text-secondary uppercase tracking-wider text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-on-surface">
                {reservations.map((r) => (
                  <tr key={r.id} className="border-b border-secondary/10 hover:bg-surface-container-low/30 transition-colors">
                    <td className="py-4 px-6 font-headline-md text-[18px] text-primary">{r.nombres} {r.apellidos}</td>
                    <td className="py-4 px-6 text-center text-on-surface-variant">#{r.numero_mesa}</td>
                    <td className="py-4 px-6 text-on-surface-variant">{String(r.fecha).slice(0, 10)}</td>
                    <td className="py-4 px-6 text-on-surface-variant">{r.hora_inicio.slice(0, 5)}</td>
                    <td className="py-4 px-6 text-right"><StatusBadge value={r.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState text="No hay reservaciones registradas recientemente." />}
      </Panel>
    </div>
  );
}