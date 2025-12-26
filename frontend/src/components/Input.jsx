/**
 * Input Component
 * Componente reutilizable de input con validación
 * 
 * @param {string} type - Tipo de input (text, email, password, number, etc)
 * @param {string} label - Etiqueta del input
 * @param {string} placeholder - Placeholder
 * @param {string} value - Valor actual
 * @param {function} onChange - Función al cambiar valor
 * @param {string} error - Mensaje de error
 * @param {boolean} required - Campo requerido
 * @param {string} className - Clases adicionales
 */
export default function Input({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label">
          <span className="label-text font-semibold">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`input input-bordered w-full ${
          error ? 'input-error' : ''
        }`}
        {...props}
      />

      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}
