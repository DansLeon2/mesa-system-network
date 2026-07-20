import EmptyState from './EmptyState.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function ScheduleMatrix({ schedule, onSelectSlot, compact = false }) {
  if (!schedule) return <EmptyState text="Seleccione una mesa y fecha para escanear disponibilidad." />;

  return (
    <div className={compact ? 'max-h-[300px] overflow-y-auto pr-2 hide-scrollbar' : ''}>
 
      {schedule.reservas?.length ? (
        <div className="bg-surface-container-low/30 rounded-lg border border-secondary/20 overflow-hidden mb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-secondary/30 bg-surface-container-low/50">
                <th className="py-3 px-4 font-label-sm text-[11px] text-secondary uppercase tracking-wider">Horario</th>
                <th className="py-3 px-4 font-label-sm text-[11px] text-secondary uppercase tracking-wider">Cliente</th>
                <th className="py-3 px-4 font-label-sm text-[11px] text-secondary uppercase tracking-wider text-center">Personas</th>
                <th className="py-3 px-4 font-label-sm text-[11px] text-secondary uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-on-surface">
              {schedule.reservas.map((r) => (
                <tr key={r.id} className="border-b border-secondary/10 last:border-0 hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-4 text-primary font-medium">{r.hora_inicio.slice(0, 5)} - {r.hora_fin.slice(0, 5)}</td>
                  <td className="py-3 px-4">{r.nombres} {r.apellidos}</td>
                  <td className="py-3 px-4 text-center">{r.num_personas}</td>
                  <td className="py-3 px-4"><StatusBadge value={r.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState text="Sin reservas registradas. Todo el día disponible." />}

    
      <div className={`grid gap-3 ${compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
        {schedule.slots?.map((slot) => {
          const available = slot.estado === 'disponible';
          const Component = onSelectSlot && available ? 'button' : 'div';
          
          const baseClass = "p-3 rounded-lg border text-left transition-all duration-200 flex flex-col gap-1";
          const availableClass = "bg-surface-container-lowest border-secondary-fixed-dim/50 hover:border-secondary hover:shadow-md cursor-pointer";
          const occupiedClass = "bg-surface-variant border-outline-variant/30 opacity-70 cursor-not-allowed";

          return (
            <Component
              key={slot.hora_inicio}
              className={`${baseClass} ${available ? availableClass : occupiedClass}`}
              type={Component === 'button' ? 'button' : undefined}
              onClick={available && onSelectSlot ? () => onSelectSlot(slot) : undefined}
              title={available && onSelectSlot ? 'Usar este horario' : undefined}
            >
              <strong className={`font-label-md text-[14px] tracking-wide ${available ? 'text-primary' : 'text-on-surface-variant'}`}>
                {slot.hora_inicio.slice(0, 5)} - {slot.hora_fin.slice(0, 5)}
              </strong>
              <span className={`font-body-md text-[12px] italic ${available ? 'text-secondary' : 'text-on-surface-variant'}`}>
                {available ? 'Disponible' : `Ocupada: ${slot.reserva.nombres}`}
              </span>
            </Component>
          );
        })}
      </div>
      
    </div>
  );
}