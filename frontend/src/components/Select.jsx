/**
 * Select Component
 * Componente reutilizable de select/dropdown
 * 
 * @param {string} label - Etiqueta del select
 * @param {array} options - Array de opciones [{value, label}]
 * @param {string} value - Valor seleccionado
 * @param {function} onChange - Función al cambiar valor
 * @param {string} placeholder - Placeholder por defecto
 * @param {string} error - Mensaje de error
 * @param {boolean} required - Campo requerido
 */
export default function Select({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar...',
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

      <select
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className={`select select-bordered w-full ${
          error ? 'select-error' : ''
        }`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}
