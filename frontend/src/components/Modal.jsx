/**
 * Modal Component
 * Componente reutilizable de modal/diálogo
 * 
 * @param {boolean} isOpen - Mostrar/ocultar modal
 * @param {string} title - Título del modal
 * @param {React.ReactNode} children - Contenido
 * @param {function} onClose - Función al cerrar
 * @param {function} onConfirm - Función al confirmar
 * @param {string} confirmText - Texto botón confirmar
 * @param {string} cancelText - Texto botón cancelar
 * @param {string} confirmVariant - Variante del botón confirmar
 */
export default function Modal({
  isOpen,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'primary',
  showFooter = true,
  size = 'md',
}) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'modal-box w-11/12 max-w-sm',
    md: 'modal-box w-11/12 max-w-md',
    lg: 'modal-box w-11/12 max-w-lg',
    xl: 'modal-box w-11/12 max-w-xl',
  };

  return (
    <div className="modal modal-open">
      <div className={sizeClasses[size] || sizeClasses.md}>
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-base-300">
          {title && <h3 className="font-bold text-lg">{title}</h3>}
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="py-4">
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="flex justify-end gap-3 pt-4 border-t border-base-300">
            <button
              onClick={onClose}
              className="btn btn-ghost"
            >
              {cancelText}
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                className={`btn btn-${confirmVariant}`}
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
