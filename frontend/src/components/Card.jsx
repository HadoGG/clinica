/**
 * Card Component
 * Componente reutilizable de tarjeta contenedora
 * 
 * @param {string} title - Título de la tarjeta
 * @param {string} subtitle - Subtítulo
 * @param {React.ReactNode} children - Contenido
 * @param {React.ReactNode} footer - Pie de la tarjeta
 * @param {string} className - Clases adicionales
 */
export default function Card({
  title,
  subtitle,
  children,
  footer,
  className = '',
  actions,
}) {
  return (
    <div className={`card bg-base-100 shadow-md border border-base-300 ${className}`}>
      {(title || actions) && (
        <div className="card-title p-6 pb-4 flex justify-between items-center border-b border-base-300">
          <div>
            {title && <h2 className="text-xl font-bold">{title}</h2>}
            {subtitle && <p className="text-sm text-base-content/70">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}

      <div className="card-body p-6">
        {children}
      </div>

      {footer && (
        <div className="card-footer p-6 pt-4 border-t border-base-300 bg-base-50 text-sm text-base-content/70">
          {footer}
        </div>
      )}
    </div>
  );
}
