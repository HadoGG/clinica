/**
 * Alert Component
 * Componente reutilizable de alerta/notificación
 * 
 * @param {string} type - 'success', 'error', 'warning', 'info'
 * @param {string} message - Mensaje a mostrar
 * @param {boolean} closeable - Mostrar botón cerrar
 * @param {function} onClose - Función al cerrar
 * @param {string} title - Título de la alerta
 */
export default function Alert({
  type = 'info',
  message,
  title,
  closeable = true,
  onClose,
  className = '',
}) {
  // Estilos por tipo
  const typeStyles = {
    success: 'alert-success',
    error: 'alert-error',
    warning: 'alert-warning',
    info: 'alert-info',
  };

  const icons = {
    success: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    error: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2"
        />
      </svg>
    ),
    warning: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v2m0 4v2m0-10a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    info: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <div className={`alert ${typeStyles[type] || 'alert-info'} ${className}`}>
      <div className="flex gap-3 flex-1">
        {icons[type]}
        <div className="flex-1">
          {title && <h3 className="font-bold">{title}</h3>}
          <div className="text-sm">{message}</div>
        </div>
      </div>

      {closeable && (
        <button
          onClick={onClose}
          className="btn btn-sm btn-ghost"
        >
          ✕
        </button>
      )}
    </div>
  );
}
