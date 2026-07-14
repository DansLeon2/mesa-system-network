import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LockKeyhole, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiMessage } from '../services/api';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' });
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  return (
    <div className="min-h-screen bg-background texture-bg flex items-center justify-center p-6">
      <div className="bg-surface-container-lowest border border-secondary/20 shadow-2xl rounded-xl w-full max-w-md overflow-hidden relative">
        {/* Decoración superior */}
        <div className="h-2 w-full bg-primary absolute top-0 left-0"></div>
        
        <div className="p-8 md:p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-container-low border border-secondary/20 mb-4 text-primary">
              <Utensils size={32} />
            </div>
            <p className="font-label-sm text-[12px] text-secondary uppercase tracking-widest mb-1">Portal de Acceso</p>
            <h1 className="font-headline-xl text-[36px] text-primary italic leading-none">Le Classique</h1>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-6">
            <div className="relative pt-4">
              <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Usuario</label>
              <input 
                value={form.username} 
                onChange={(e) => setForm({ ...form, username: e.target.value })} 
                className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary transition-colors focus:outline-none"
              />
            </div>
            
            <div className="relative pt-4">
              <label className="absolute top-0 left-0 font-label-sm text-[12px] text-secondary uppercase tracking-widest">Contraseña</label>
              <input 
                type="password" 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                className="w-full bg-transparent border-0 border-b border-secondary/40 focus:border-primary focus:ring-0 py-2 font-body-md text-primary transition-colors focus:outline-none"
              />
            </div>

            {error && <p className="text-error text-sm font-label-md text-center bg-error-container/30 py-2 rounded">{error}</p>}
            
            <button type="submit" className="mt-4 w-full flex justify-center items-center gap-2 bg-primary text-[#C5A059] hover:bg-primary-container px-6 py-3 rounded font-label-md transition-colors shadow-sm tracking-widest uppercase">
              <LockKeyhole size={18} /> Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}