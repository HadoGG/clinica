/**
 * Table Component
 * Componente reutilizable de tabla con ordenamiento y paginación
 * 
 * @param {array} columns - Definición de columnas [{key, label, sortable}]
 * @param {array} data - Datos a mostrar
 * @param {function} onEdit - Función al editar fila
 * @param {function} onDelete - Función al eliminar fila
 * @param {boolean} loading - Estado de carga
 * @param {number} rowsPerPage - Filas por página
 */
export default function Table({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  onSort,
  loading = false,
  rowsPerPage = 10,
  className = '',
}) {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [sortConfig, setSortConfig] = React.useState({
    key: null,
    direction: 'asc',
  });

  // Paginación
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Manejo de ordenamiento
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    if (onSort) onSort(key, direction);
  };

  // Renderizar celda
  const renderCell = (item, column) => {
    const value = item[column.key];

    if (column.render) {
      return column.render(value, item);
    }

    if (column.type === 'currency') {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
      }).format(value);
    }

    if (column.type === 'date') {
      return new Date(value).toLocaleDateString('es-CL');
    }

    return value;
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="table table-compact w-full">
        {/* Header */}
        <thead>
          <tr className="bg-base-200">
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => column.sortable && handleSort(column.key)}
                className={column.sortable ? 'cursor-pointer hover:bg-base-300' : ''}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && sortConfig.key === column.key && (
                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            ))}
            {(onEdit || onDelete) && <th>Acciones</th>}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + 1} className="text-center py-8">
                <span className="loading loading-spinner"></span>
              </td>
            </tr>
          ) : paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="text-center py-8 text-base-content/50">
                No hay datos disponibles
              </td>
            </tr>
          ) : (
            paginatedData.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-base-100">
                {columns.map((column) => (
                  <td key={column.key}>{renderCell(item, column)}</td>
                ))}
                {(onEdit || onDelete) && (
                  <td>
                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="btn btn-sm btn-info btn-outline"
                        >
                          Editar
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="btn btn-sm btn-error btn-outline"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6 mb-4">
          <button
            onClick={() => setCurrentPage(0)}
            disabled={currentPage === 0}
            className="btn btn-sm"
          >
            Primera
          </button>
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="btn btn-sm"
          >
            Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`btn btn-sm ${
                currentPage === page ? 'btn-active' : ''
              }`}
            >
              {page + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="btn btn-sm"
          >
            Siguiente
          </button>
          <button
            onClick={() => setCurrentPage(totalPages - 1)}
            disabled={currentPage === totalPages - 1}
            className="btn btn-sm"
          >
            Última
          </button>
        </div>
      )}

      {/* Info */}
      <div className="text-sm text-base-content/50 text-center mt-2">
        Mostrando {startIndex + 1} a {Math.min(endIndex, data.length)} de{' '}
        {data.length} registros
      </div>
    </div>
  );
}

import React from 'react';
