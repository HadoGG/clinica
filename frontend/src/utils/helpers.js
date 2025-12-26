import React from 'react';
import { toast } from 'react-toastify';

const formActionMap = {
    profession: [
        { value: 'general', label: 'Odontólogo General' },
        { value: 'ortho', label: 'Ortodoncista' },
        { value: 'pedo', label: 'Odontólogo Pediátrico' },
        { value: 'perio', label: 'Periodoncista' },
        { value: 'prosth', label: 'Prostodoncista' },
        { value: 'endo', label: 'Endodoncista' },
    ],
    status: [
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
        { value: 'suspended', label: 'Suspendido' },
    ],
    discountType: [
        { value: 'percentage', label: 'Porcentaje (%)' },
        { value: 'fixed', label: 'Monto Fijo ($)' },
    ],
    discountCategory: [
        { value: 'discount', label: 'Descuento' },
        { value: 'retention', label: 'Retención' },
        { value: 'deduction', label: 'Deducción' },
    ],
    settlementStatus: [
        { value: 'draft', label: 'Borrador' },
        { value: 'calculated', label: 'Calculada' },
        { value: 'approved', label: 'Aprobada' },
        { value: 'paid', label: 'Pagada' },
        { value: 'cancelled', label: 'Cancelada' },
    ],
};

export const getOptionLabel = (type, value) => {
    const options = formActionMap[type];
    return options?.find(opt => opt.value === value)?.label || value;
};

export const showNotification = (message, type = 'success') => {
    const notifyFn = type === 'error' ? toast.error : type === 'warning' ? toast.warning : toast.success;
    notifyFn(message);
};

export const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

export const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date(date));
};

export const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateTime));
};

export const downloadPDF = (data, filename) => {
    const element = document.createElement('a');
    const file = new Blob([data], { type: 'application/pdf' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

export const downloadExcel = (data, filename) => {
    const csv = data;
    const element = document.createElement('a');
    const file = new Blob([csv], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

export const calculateSettlementTotal = (lineItems, discounts) => {
    const totalCommission = lineItems.reduce((sum, item) => sum + item.commission_amount, 0);
    const totalDeductions = discounts.reduce((sum, disc) => sum + disc.discount_amount, 0);
    return totalCommission - totalDeductions;
};
