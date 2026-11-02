import { describe, expect, it } from 'vitest';
import { UNKNOWN_BRAND_LABEL } from '../pieces/constants/brand';
import {
  formatBrand,
  formatPageTitle,
  formatPieceCount,
  formatPieceName,
  formatPrice,
} from './format';

function normalizeSpaces(text: string): string {
  return text.replace(/[\u00a0\u202f]/g, ' ');
}

describe('format', () => {
  it('formate un prix en euros avec la virgule', () => {
    expect(normalizeSpaces(formatPrice(12.5))).toBe('12,50 €');
  });

  it('affiche un libellé quand la marque est inconnue', () => {
    expect(formatBrand(null)).toBe(UNKNOWN_BRAND_LABEL);
  });

  it('affiche la marque quand elle existe', () => {
    expect(formatBrand('Nike')).toBe('Nike');
  });

  it('accorde le nombre de pièces', () => {
    expect(formatPieceCount(1)).toBe('1 pièce');
    expect(formatPieceCount(2)).toBe('2 pièces');
  });

  it('met le nom de la pièce en majuscules, accents compris', () => {
    expect(formatPieceName('Veste en jean délavé')).toBe('VESTE EN JEAN DÉLAVÉ');
  });

  it('ajoute le nom du site au titre de la page', () => {
    expect(formatPageTitle('Accueil')).toContain('Accueil');
    expect(formatPageTitle('Accueil')).toContain('Cintré');
  });
});
