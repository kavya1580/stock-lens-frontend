import type { ScoreTone } from '../types/stock';

export const currency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export const percent = (value?: number | null) => {
  if (value === undefined || value === null) return 'N/A';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const getScoreTone = (score: number): ScoreTone => {
  if (score >= 80) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 45) return 'watch';
  return 'risk';
};

export const toneColor = (tone: ScoreTone) => {
  const colors = {
    excellent: '#16a34a',
    good: '#d4a017',
    watch: '#ea580c',
    risk: '#dc2626',
  };

  return colors[tone];
};
