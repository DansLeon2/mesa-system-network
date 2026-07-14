import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Panel from '../components/Panel.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api';

export default function ReportsPage() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState({ byDay: [], topTables: [], frequent: [], peak: [], cancelled: [] });

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      api.get('/reports/by-day'),
      api.get('/reports/top-tables'),
      api.get('/reports/frequent-clients'),
      api.get('/reports/peak-hours'),
      api.get('/reports/cancelled')
    ]).then(([byDay, topTables, frequent, peak, cancelled]) => {
      setData({
        byDay: byDay.data,
        topTables: topTables.data,
        frequent: frequent.data,
        peak: peak.data,
        cancelled: cancelled.data
      });
    });
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-[1100px] mx-auto px-6 py-10 md:mt-8">
        <div className="mb-8">
          <p className="font-label-sm text-[12px] text-error uppercase tracking-widest mb-1">Acceso Restringido</p>
          <h1 className="font-headline-xl text-[40px] text-primary">Reportes</h1>
        </div>
        <Panel><EmptyState text="Se requieren privilegios de Administrador para visualizar estas analíticas." /></Panel>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10 md:mt-8 text-on-surface font-body-md">
      
      <div className="mb-8">
        <p className="font-label-sm text-[12px] text-secondary uppercase tracking-widest mb-1">Centro de Analíticas</p>
        <h1 className="font-headline-xl text-[40px] text-primary leading-tight">Reportes</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ChartPanel title="Reservas por Estado" data={data.byDay} xKey="estado" yKey="total" />
        <ChartPanel title="Mesas más Reservadas" data={data.topTables} xKey="numero" yKey="total_reservas" />
        <ChartPanel title="Horarios Pico" data={data.peak} xKey="hora_inicio" yKey="total" />
        
        <Panel title="Clientes Frecuentes">
          {data.frequent.length ? (
            <div className="overflow-x-auto -mx-6 md:mx-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50 border-b border-secondary/30">
                    <th className="py-3 px-4 font-label-sm text-[11px] text-secondary uppercase tracking-wider">Cliente</th>
                    <th className="py-3 px-4 font-label-sm text-[11px] text-secondary uppercase tracking-wider">Email</th>
                    <th className="py-3 px-4 font-label-sm text-[11px] text-secondary uppercase tracking-wider text-center">Visitas</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-on-surface">
                  {data.frequent.map((c) => (
                    <tr key={`${c.email}-${c.nombres}`} className="border-b border-secondary/10 hover:bg-surface-container-low/30">
                      <td className="py-3 px-4 font-headline-md text-primary">{c.nombres} {c.apellidos}</td>
                      <td className="py-3 px-4 text-sm text-on-surface-variant">{c.email}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#f0e6d2] text-primary font-label-md border border-[#C5A059]/30">
                          {c.total_reservas}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <EmptyState text="No hay información suficiente." />}
        </Panel>
      </div>

      <Panel title="Cancelaciones Recientes" kicker="HISTORIAL">
        {data.cancelled.length ? (
          <div className="overflow-x-auto -mx-6 md:mx-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50 border-b border-secondary/30">
                  <th className="py-3 px-6 font-label-sm text-[11px] text-secondary uppercase tracking-wider">Cliente</th>
                  <th className="py-3 px-6 font-label-sm text-[11px] text-secondary uppercase tracking-wider text-center">Mesa</th>
                  <th className="py-3 px-6 font-label-sm text-[11px] text-secondary uppercase tracking-wider">Fecha</th>
                  <th className="py-3 px-6 font-label-sm text-[11px] text-secondary uppercase tracking-wider">Hora</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-on-surface">
                {data.cancelled.map((r) => (
                  <tr key={r.id} className="border-b border-secondary/10 hover:bg-surface-container-low/30 text-on-surface-variant opacity-80">
                    <td className="py-3 px-6 font-headline-md text-primary">{r.nombres} {r.apellidos}</td>
                    <td className="py-3 px-6 text-center">#{r.mesa}</td>
                    <td className="py-3 px-6">{String(r.fecha).slice(0, 10)}</td>
                    <td className="py-3 px-6">{r.hora_inicio.slice(0, 5)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState text="No hay cancelaciones recientes registradas." />}
      </Panel>
    </div>
  );
}

function ChartPanel({ title, data, xKey, yKey }) {
  return (
    <Panel title={title} className="h-full">
      {data.length ? (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(119,90,25,0.15)" vertical={false} />
              <XAxis dataKey={xKey} stroke="#827472" tick={{ fill: '#504443', fontSize: 12, fontFamily: 'Libre Franklin' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#827472" tick={{ fill: '#504443', fontSize: 12, fontFamily: 'Libre Franklin' }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(119,90,25,0.05)' }}
                contentStyle={{ background: '#ffffff', border: '1px solid #d4c3c1', borderRadius: '8px', color: '#321716', boxShadow: '0 4px 12px rgba(74,44,42,0.05)' }} 
                itemStyle={{ color: '#775a19', fontWeight: 600 }}
              />
              {/* Barras color dorado/marrón */}
              <Bar dataKey={yKey} fill="#775a19" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <EmptyState text="Datos insuficientes para generar gráfico." />}
    </Panel>
  );
}