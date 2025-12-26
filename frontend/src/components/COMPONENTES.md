# 📦 Componentes Reutilizables — OdontAll

Documentación de componentes React creados para OdontAll.

---

## 📋 Índice

1. [Button](#button)
2. [Input](#input)
3. [Select](#select)
4. [Card](#card)
5. [Alert](#alert)
6. [Modal](#modal)
7. [Table](#table)

---

## Button

Botón reutilizable con múltiples variantes y estados.

### Props

```javascript
<Button
  variant="primary"      // 'primary', 'secondary', 'danger', 'success', 'warning', 'info', 'ghost', 'outline'
  size="medium"          // 'small', 'medium', 'large'
  disabled={false}       // Deshabilitado
  loading={false}        // Mostrar spinner de carga
  onClick={handleClick}  // Función click
  type="button"          // 'button', 'submit', 'reset'
  className=""           // Clases Tailwind adicionales
>
  Guardar
</Button>
```

### Ejemplos

```jsx
import { Button } from '@/components';

// Botón primario
<Button variant="primary">Guardar</Button>

// Botón cargando
<Button loading>Procesando...</Button>

// Botón peligro
<Button variant="danger" onClick={() => deleteItem()}>Eliminar</Button>

// Botón pequeño
<Button size="small">Aceptar</Button>
```

---

## Input

Input de texto con validación y mensajes de error.

### Props

```javascript
<Input
  type="text"              // 'text', 'email', 'password', 'number', 'date', etc
  label="Nombre"           // Etiqueta
  placeholder="Ej: Juan"   // Placeholder
  value={name}             // Valor actual
  onChange={e => setName(e.target.value)}  // Función cambio
  error={errors.name}      // Mensaje error
  required={true}          // Campo requerido (*)
  disabled={false}         // Deshabilitado
  className=""             // Clases adicionales
/>
```

### Ejemplos

```jsx
import { Input } from '@/components';

const [email, setEmail] = useState('');
const [error, setError] = useState('');

<Input
  type="email"
  label="Email"
  placeholder="correo@ejemplo.com"
  value={email}
  onChange={e => setEmail(e.target.value)}
  error={error}
  required
/>
```

---

## Select

Dropdown/select reutilizable.

### Props

```javascript
<Select
  label="Profesional"            // Etiqueta
  options={[                     // Opciones
    { value: 1, label: 'Felipe' },
    { value: 2, label: 'María' }
  ]}
  value={selectedId}             // Valor seleccionado
  onChange={e => setSelectedId(e.target.value)}  // Función cambio
  placeholder="Seleccionar..."   // Texto por defecto
  error={errors.professional}    // Mensaje error
  required={true}                // Requerido
  disabled={false}               // Deshabilitado
/>
```

### Ejemplos

```jsx
import { Select } from '@/components';

const [professional, setProfessional] = useState('');

const professionals = [
  { value: 'prof-1', label: 'Felipe García' },
  { value: 'prof-2', label: 'María López' }
];

<Select
  label="Selecciona profesional"
  options={professionals}
  value={professional}
  onChange={e => setProfessional(e.target.value)}
  required
/>
```

---

## Card

Tarjeta contenedora con opciones de título, footer y acciones.

### Props

```javascript
<Card
  title="Resumen"              // Título
  subtitle="Noviembre 2025"    // Subtítulo
  footer="Actualizado: hoy"    // Pie de página
  actions={<Button>Ver</Button>}  // Botones de acción
  className=""                 // Clases adicionales
>
  {/* Contenido */}
</Card>
```

### Ejemplos

```jsx
import { Card, Button } from '@/components';

<Card
  title="Liquidación Mensual"
  subtitle="Noviembre 2025"
  actions={
    <>
      <Button variant="primary" size="small">Exportar PDF</Button>
      <Button variant="ghost" size="small">Descargar</Button>
    </>
  }
  footer="Actualizado: 25/11/2025 14:30"
>
  <div className="text-3xl font-bold">$225,000</div>
  <p className="text-sm text-gray-500">Monto neto a pagar</p>
</Card>
```

---

## Alert

Alerta/notificación con diferentes tipos.

### Props

```javascript
<Alert
  type="success"           // 'success', 'error', 'warning', 'info'
  title="Éxito"            // Título (opcional)
  message="Guardado"       // Mensaje
  closeable={true}         // Mostrar botón cerrar
  onClose={() => {}}       // Función al cerrar
  className=""             // Clases adicionales
/>
```

### Ejemplos

```jsx
import { Alert } from '@/components';

const [alert, setAlert] = useState(null);

// Mostrar alerta de éxito
setAlert({
  type: 'success',
  title: '¡Éxito!',
  message: 'Atención registrada correctamente'
});

// Usar en JSX
{alert && (
  <Alert
    type={alert.type}
    title={alert.title}
    message={alert.message}
    onClose={() => setAlert(null)}
  />
)}

// Diferentes tipos
<Alert type="error" message="Error al guardar" />
<Alert type="warning" message="Verificar datos" />
<Alert type="info" message="Información importante" />
```

---

## Modal

Modal/diálogo reutilizable.

### Props

```javascript
<Modal
  isOpen={true}                    // Visible
  title="Confirmar eliminación"    // Título
  onClose={() => {}}               // Función cerrar
  onConfirm={() => {}}             // Función confirmar
  confirmText="Eliminar"           // Texto botón confirmar
  cancelText="Cancelar"            // Texto botón cancelar
  confirmVariant="danger"          // Variante botón confirmar
  size="md"                        // 'sm', 'md', 'lg', 'xl'
  showFooter={true}                // Mostrar botones
>
  {/* Contenido del modal */}
</Modal>
```

### Ejemplos

```jsx
import { Modal, Button } from '@/components';

const [showModal, setShowModal] = useState(false);

<Button onClick={() => setShowModal(true)}>
  Eliminar
</Button>

<Modal
  isOpen={showModal}
  title="Eliminar atención"
  onClose={() => setShowModal(false)}
  onConfirm={() => {
    deleteAttention();
    setShowModal(false);
  }}
  confirmText="Eliminar"
  confirmVariant="danger"
>
  <p>¿Está seguro que desea eliminar esta atención?</p>
  <p className="text-sm text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
</Modal>
```

---

## Table

Tabla con paginación, ordenamiento y acciones.

### Props

```javascript
<Table
  columns={[                           // Definición columnas
    { key: 'date', label: 'Fecha', sortable: true },
    { key: 'patient', label: 'Paciente' },
    { key: 'amount', label: 'Monto', type: 'currency' },
    { key: 'status', label: 'Estado' }
  ]}
  data={attentions}                    // Array de datos
  onEdit={item => editItem(item)}      // Función editar
  onDelete={item => deleteItem(item)}  // Función eliminar
  onSort={(key, dir) => {}}            // Función ordenar
  loading={false}                      // Cargando
  rowsPerPage={10}                     // Filas por página
/>
```

### Ejemplos

```jsx
import { Table } from '@/components';

const [attentions, setAttentions] = useState([]);

const columns = [
  { key: 'attention_date', label: 'Fecha', sortable: true, type: 'date' },
  { key: 'patient_name', label: 'Paciente' },
  { key: 'service_name', label: 'Servicio' },
  { key: 'amount', label: 'Monto', type: 'currency' },
  { key: 'status', label: 'Estado' }
];

const handleEdit = (attention) => {
  // Editar atención
};

const handleDelete = (attention) => {
  // Eliminar atención
};

<Table
  columns={columns}
  data={attentions}
  onEdit={handleEdit}
  onDelete={handleDelete}
  rowsPerPage={15}
/>
```

### Tipos de columnas soportados

```javascript
// Texto simple (defecto)
{ key: 'name', label: 'Nombre' }

// Moneda
{ key: 'amount', label: 'Monto', type: 'currency' }
// Muestra: $50,000

// Fecha
{ key: 'date', label: 'Fecha', type: 'date' }
// Muestra: 25/11/2025

// Custom render
{ 
  key: 'status', 
  label: 'Estado',
  render: (value) => (
    <span className={`badge badge-${value === 'active' ? 'success' : 'ghost'}`}>
      {value}
    </span>
  )
}
```

---

## 🚀 Uso rápido

### Importar componentes

```jsx
// Importar individual
import Button from '@/components/Button';
import { Input, Select } from '@/components';

// Importar todos
import { Button, Input, Select, Card, Alert, Modal, Table } from '@/components';
```

### Ejemplo completo de formulario

```jsx
import { useState } from 'react';
import { Button, Input, Select, Card, Alert } from '@/components';

export default function AttentionForm() {
  const [data, setData] = useState({
    patient: '',
    professional: '',
    service: '',
    amount: ''
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const professionals = [
    { value: 1, label: 'Felipe García' },
    { value: 2, label: 'María López' }
  ];

  const services = [
    { value: 1, label: 'Limpieza' },
    { value: 2, label: 'Endodoncia' }
  ];

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    // Validar
    if (!data.patient || !data.professional || !data.service || !data.amount) {
      setErrors({ form: 'Todos los campos son requeridos' });
      return;
    }

    // Enviar
    try {
      // await api.post('/attentions', data);
      setAlert({ type: 'success', message: 'Atención registrada' });
      setData({ patient: '', professional: '', service: '', amount: '' });
    } catch (err) {
      setAlert({ type: 'error', message: 'Error al guardar' });
    }
  };

  return (
    <Card title="Registrar Nueva Atención">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="space-y-4">
        <Input
          label="Paciente"
          placeholder="Nombre del paciente"
          value={data.patient}
          onChange={e => handleChange('patient', e.target.value)}
          error={errors.patient}
          required
        />

        <Select
          label="Profesional"
          options={professionals}
          value={data.professional}
          onChange={e => handleChange('professional', e.target.value)}
          error={errors.professional}
          required
        />

        <Select
          label="Servicio"
          options={services}
          value={data.service}
          onChange={e => handleChange('service', e.target.value)}
          error={errors.service}
          required
        />

        <Input
          type="number"
          label="Monto ($)"
          placeholder="50000"
          value={data.amount}
          onChange={e => handleChange('amount', e.target.value)}
          error={errors.amount}
          required
        />

        <div className="flex gap-2">
          <Button variant="primary" onClick={handleSubmit}>
            Guardar
          </Button>
          <Button variant="ghost">Cancelar</Button>
        </div>
      </div>
    </Card>
  );
}
```

---

## 🎨 Variantes DaisyUI disponibles

Los componentes utilizan clases de DaisyUI. Aquí están las variantes disponibles:

### Button variants
- `primary` - Verde principal
- `secondary` - Gris
- `danger` / `error` - Rojo
- `success` - Verde éxito
- `warning` - Naranja
- `info` - Azul
- `ghost` - Sin fondo
- `outline` - Solo borde

### Alert types
- `success` - Verde
- `error` - Rojo
- `warning` - Naranja
- `info` - Azul

### Modal sizes
- `sm` - Pequeño (384px)
- `md` - Mediano (448px) - defecto
- `lg` - Grande (512px)
- `xl` - Extra grande (576px)

---

## 📝 Notas

- Todos los componentes están optimizados para mobile
- Usan Tailwind CSS + DaisyUI
- Completamente personalizables vía `className`
- Sin dependencias externas adicionales
- Accesibles (WCAG)

---

Generado: 25 de Noviembre 2025
