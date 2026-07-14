import { X } from 'lucide-react';

export default function Modal({ title, kicker, children, onClose, actions }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm" role="presentation" onMouseDown={onClose}>
      <section 
        className="bg-surface-container-lowest border border-secondary/20 shadow-2xl rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" 
        role="dialog" 
        aria-modal="true" 
        aria-label={title} 
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface-container-lowest/95 backdrop-blur z-10 flex justify-between items-start border-b border-secondary/20 p-6">
          <div>
            {kicker && <p className="font-label-sm text-[12px] text-secondary uppercase tracking-widest mb-1">{kicker}</p>}
            <h2 className="font-headline-md text-[24px] text-primary">{title}</h2>
          </div>
          <div className="flex items-center gap-4">
            {actions}
            <button 
              className="text-secondary hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container" 
              type="button" 
              title="Cerrar" 
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-6">
          {children}
        </div>
      </section>
    </div>
  );
}