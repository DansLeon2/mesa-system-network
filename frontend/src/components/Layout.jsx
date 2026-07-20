import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, CalendarCheck, Gauge, LogOut, Radar, Table2, Users, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Dashboard', icon: Gauge },
  { to: '/reservations', label: 'Reservas', icon: CalendarCheck },
  { to: '/availability', label: 'Disponibilidad', icon: Radar },
  { to: '/tables', label: 'Mesas', icon: Table2 },
  { to: '/clients', label: 'Clientes', icon: Users },
  { to: '/reports', label: 'Reportes', icon: BarChart3 }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function endSession() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md texture-bg relative">
     
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-background/95 border-b border-secondary/30 shadow-sm backdrop-blur-sm">
        <Link className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity" to="/">
          <Utensils size={24} />
          <span className="font-headline-lg text-[24px] italic leading-none">Le Classique</span>
        </Link>
        
    
        <nav className="hidden lg:flex gap-6 items-center">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink 
              key={to} 
              to={to} 
              end={to === '/'}
              className={({ isActive }) => 
                `font-label-md text-[13px] uppercase tracking-wider flex items-center gap-2 transition-all pb-1 border-b-2 ${isActive ? 'text-primary border-primary font-bold' : 'text-on-surface-variant border-transparent hover:text-primary hover:border-secondary/50'}`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

  
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <span className="font-label-md text-[14px] text-primary block leading-tight">{user?.nombre}</span>
            <small className="font-label-sm text-[10px] text-secondary uppercase tracking-widest">{user?.rol}</small>
          </div>
          <button className="text-secondary hover:text-error transition-colors p-2 rounded-full hover:bg-surface-container" onClick={endSession} title="Cerrar sesión">
            <LogOut size={20} />
          </button>
        </div>
      </header>

   
      <main className="pt-20 pb-24 lg:pb-8">
        <Outlet />
      </main>

  
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-safe h-20 bg-surface-container-low border-t border-secondary/20 shadow-[0_-2px_10px_rgba(74,44,42,0.08)]">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink 
            key={to} 
            to={to} 
            end={to === '/'}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center px-2 py-1 w-full transition-colors ${isActive ? 'text-on-secondary-container' : 'text-on-surface-variant hover:text-primary'}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`flex items-center justify-center w-12 h-8 rounded-full mb-1 transition-colors ${isActive ? 'bg-secondary-container' : 'bg-transparent'}`}>
                  <Icon size={20} />
                </div>
                <span className="font-label-sm text-[10px] truncate max-w-full">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}