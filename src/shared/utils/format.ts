import { UNKNOWN_BRAND_LABEL } from '../pieces/constants/brand';

const euroFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

export function formatPrice(price: number): string {
  return euroFormatter.format(price);
}

export function formatBrand(brand: string | null): string {
  return brand ?? UNKNOWN_BRAND_LABEL;
}

export function formatPieceName(title: string): string {
  return title.toLocaleUpperCase('fr-FR');
}

export function formatPieceCount(count: number): string {
  return count > 1 ? `${count} pièces` : `${count} pièce`;
}

export function formatPageTitle(pageName: string): string {
  return `${pageName} — Cintré`;
}
