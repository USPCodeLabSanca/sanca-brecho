'use client';

import React from 'react';

interface PriceInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
}

// Função auxiliar para formatar o valor numérico para o padrão de moeda BRL
const formatToBRL = (value?: number): string => {
  if (value === undefined || value === null) return '';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const PriceInput: React.FC<PriceInputProps> = ({ value, onValueChange, ...props }) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (digits === '') {
      onValueChange(0);
      return;
    }
    const numericValue = Number(digits) / 100;
    onValueChange(numericValue);
  };

  return (
    <input
      {...props}
      maxLength={14}
      value={formatToBRL(value)}
      onChange={handleChange}
      placeholder="R$ 0,00"
      inputMode="decimal"
    />
  );
};

export default PriceInput;