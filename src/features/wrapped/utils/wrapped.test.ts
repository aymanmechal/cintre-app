import { describe, expect, it } from 'vitest';
import { WrappedPeriod } from '../constants/wrapped';
import { buildWrapped, hasWornAnything, toPeriodPrefix } from './wrapped';
import { buildWrappedHighlights } from './wrappedHighlights';
import { PieceType } from '../../../shared/pieces/constants/categories';
import { PieceColor } from '../../../shared/pieces/constants/colors';
import { makeOutfit, makeWardrobeItem } from '../../../test/factories';

const TODAY = new Date(2026, 2, 15, 12, 0);
const ITEMS = [
  makeWardrobeItem({
    id: 1,
    title: 'Pull',
    color: PieceColor.Red,
    boughtOn: '2026-03-02',
    price: 60,
  }),
  makeWardrobeItem({
    id: 2,
    title: 'Jean',
    color: PieceColor.Blue,
    boughtOn: '2025-11-02',
    price: 80,
  }),
  makeWardrobeItem({ id: 3, title: 'Veste', color: PieceColor.Black }),
];
const OUTFITS = [
  makeOutfit({ id: 'a', name: 'Cosy', pieceIds: [1, 2] }),
  makeOutfit({ id: 'b', name: 'Sobre', pieceIds: [2] }),
];
const ENTRIES = [
  { id: '1', date: '2026-03-10', outfitId: 'a' },
  { id: '2', date: '2026-03-11', outfitId: 'a' },
  { id: '3', date: '2026-02-20', outfitId: 'b' },
  { id: '4', date: '2026-03-30', outfitId: 'b' },
];

describe('buildWrapped', () => {
  it('résume le mois en cours', () => {
    const wrapped = buildWrapped(ITEMS, OUTFITS, ENTRIES, WrappedPeriod.Month, TODAY);
    expect(wrapped.wornDayCount).toBe(2);
    expect(wrapped.topOutfit).toMatchObject({ outfit: { name: 'Cosy' }, wearCount: 2 });
    expect(wrapped.topClothing?.wearCount).toBe(2);
    expect(wrapped.forgottenCount).toBe(1);
    expect(wrapped.purchaseCount).toBe(1);
    expect(wrapped.spent).toBe(60);
  });

  it('résume l’année entière sans le futur', () => {
    const wrapped = buildWrapped(ITEMS, OUTFITS, ENTRIES, WrappedPeriod.Year, TODAY);
    expect(wrapped.wornDayCount).toBe(3);
    expect(wrapped.topClothing?.item.piece.title).toBe('Jean');
    expect(wrapped.topClothing?.wearCount).toBe(3);
    expect(wrapped.topColor).toBe(PieceColor.Blue);
  });

  it('ne trouve rien quand rien n’est porté', () => {
    const wrapped = buildWrapped(ITEMS, OUTFITS, [], WrappedPeriod.Month, TODAY);
    expect(hasWornAnything(wrapped)).toBe(false);
    expect(wrapped.topClothing).toBeNull();
    expect(wrapped.topPair).toBeNull();
    expect(wrapped.topColor).toBeNull();
    expect(wrapped.forgottenCount).toBe(3);
  });

  it('isole le vêtement et la paire les plus portés', () => {
    const items = [
      makeWardrobeItem({ id: 1, title: 'Baskets', pieceType: PieceType.Shoes }),
      makeWardrobeItem({ id: 2, title: 'Tee-shirt', pieceType: PieceType.Tops }),
      makeWardrobeItem({ id: 3, title: 'Jean', pieceType: PieceType.Bottoms }),
      makeWardrobeItem({ id: 4, title: 'Sac', pieceType: PieceType.Bags }),
    ];
    const outfits = [
      makeOutfit({ id: 'a', pieceIds: [1, 2, 4] }),
      makeOutfit({ id: 'b', pieceIds: [1, 2, 3, 4] }),
      makeOutfit({ id: 'c', pieceIds: [1, 3, 4] }),
      makeOutfit({ id: 'd', pieceIds: [1, 2] }),
    ];
    const entries = outfits.map((outfit, index) => ({
      id: String(index),
      date: `2026-03-0${index + 1}`,
      outfitId: outfit.id,
    }));
    const wrapped = buildWrapped(items, outfits, entries, WrappedPeriod.Month, TODAY);
    expect(wrapped.topPair).toMatchObject({
      item: { piece: { title: 'Baskets' } },
      wearCount: 4,
    });
    expect(wrapped.topClothing).toMatchObject({
      item: { piece: { title: 'Tee-shirt' } },
      wearCount: 3,
    });
  });

  it('ne trouve aucun vêtement quand seuls les accessoires sont portés', () => {
    const items = [makeWardrobeItem({ id: 1, title: 'Montre', pieceType: PieceType.Watches })];
    const outfits = [makeOutfit({ id: 'a', pieceIds: [1] })];
    const entries = [{ id: '1', date: '2026-03-10', outfitId: 'a' }];
    const wrapped = buildWrapped(items, outfits, entries, WrappedPeriod.Month, TODAY);
    expect(wrapped.topPair).toBeNull();
    expect(wrapped.topClothing).toBeNull();
  });

  it('donne le préfixe de la période', () => {
    expect(toPeriodPrefix(WrappedPeriod.Month, TODAY)).toBe('2026-03');
    expect(toPeriodPrefix(WrappedPeriod.Year, TODAY)).toBe('2026');
  });
});

describe('buildWrappedHighlights', () => {
  it('prépare les cartes à afficher', () => {
    const wrapped = buildWrapped(ITEMS, OUTFITS, ENTRIES, WrappedPeriod.Month, TODAY);
    const values = buildWrappedHighlights(wrapped).map((highlight) => highlight.value);
    expect(values).toEqual(['2', '—', 'PULL', 'Cosy', 'Rouge', '1', '1']);
  });
});
