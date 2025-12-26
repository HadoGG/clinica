/**
 * Button Component
 * Componente reutilizable de botón con múltiples variantes
 * 
 * @param {string} variant - 'primary', 'secondary', 'danger', 'success'
 * @param {string} size - 'small', 'medium', 'large'
 * @param {boolean} disabled - Estado deshabilitado
 * @param {boolean} loading - Mostrar estado de carga
 * @param {function} onClick - Función al hacer click
 * @param {React.ReactNode} children - Contenido del botón
 * @param {string} className - Clases adicionales
 */
export default function Button({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  children,
  className = '',
  type = 'button',
  ...props
}) {
  // Variantes de estilo
  const variantStyles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-error',
    success: 'btn-success',
    warning: 'btn-warning',
    info: 'btn-info',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
  };

  // Tamaños
  const sizeStyles = {
    small: 'btn-sm',
    medium: 'btn-md',
    large: 'btn-lg',
  };

  // Clases combinadas
  const baseClasses = `btn ${variantStyles[variant] || 'btn-primary'} ${
    sizeStyles[size] || 'btn-md'
  } ${disabled ? 'btn-disabled' : ''} ${loading ? 'loading' : ''} ${className}`;

  return (
    <button
      type={type}
      className={baseClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? <span className="loading loading-spinner"></span> : null}
      {!loading && children}
    </button>
  );
}
