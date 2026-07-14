export default function Panel({ title, kicker, actions, children, className = '' }) {
  return (
    <section className={`bg-surface-container-lowest border border-secondary/20 shadow-[inset_0_0_20px_rgba(119,90,25,0.02)] rounded-xl p-6 mb-8 ${className}`}>
      {(title || actions || kicker) && (
        <div className="flex justify-between items-start md:items-end mb-6 border-b border-secondary/20 pb-4">
          <div>
            {kicker && <p className="font-label-sm text-[12px] text-secondary uppercase tracking-widest mb-1">{kicker}</p>}
            {title && <h2 className="font-headline-md text-[24px] text-primary leading-tight">{title}</h2>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}