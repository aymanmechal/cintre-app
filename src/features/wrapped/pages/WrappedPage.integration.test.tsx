import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { makeOutfit, makeWardrobeItem } from '../../../test/factories';
import { renderApp } from '../../../test/renderApp';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 2, 15, 12, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Mon bilan', () => {
  it('affiche le bilan du mois puis celui de l’année', async () => {
    const wardrobe = [makeWardrobeItem({ id: 1, title: 'Pull rouge' })];
    const outfits = [makeOutfit({ id: 'a', name: 'Cosy', pieceIds: [1] })];
    const wornLog = [
      { id: '1', date: '2026-03-10', outfitId: 'a' },
      { id: '2', date: '2026-01-10', outfitId: 'a' },
    ];
    const { user } = renderApp('/bilan', { wardrobe, outfits, wornLog });

    expect(screen.getByText('Cosy')).toBeInTheDocument();
    expect(screen.getByText('jours avec une tenue notée').previousElementSibling).toHaveTextContent(
      '1',
    );

    await user.click(screen.getByRole('button', { name: 'Cette année' }));
    expect(screen.getByText('jours avec une tenue notée').previousElementSibling).toHaveTextContent(
      '2',
    );
  });

  it('ouvre la fiche du vêtement le plus porté en touchant sa carte', async () => {
    const wardrobe = [makeWardrobeItem({ id: 1, title: 'Pull rouge' })];
    const outfits = [makeOutfit({ id: 'a', name: 'Cosy', pieceIds: [1] })];
    const wornLog = [{ id: '1', date: '2026-03-10', outfitId: 'a' }];
    const { user } = renderApp('/bilan', { wardrobe, outfits, wornLog });

    await user.click(screen.getByRole('link', { name: 'PULL ROUGE' }));
    expect(screen.getByDisplayValue('Pull rouge')).toBeInTheDocument();
  });

  it('invite à noter des tenues quand rien n’est porté', () => {
    renderApp('/bilan', { wardrobe: [makeWardrobeItem({ id: 1 })] });
    expect(screen.getByText(/Rien de noté sur cette période/)).toBeInTheDocument();
  });

  it('est accessible depuis la page Moi', async () => {
    const { user } = renderApp('/moi', { wardrobe: [makeWardrobeItem({ id: 1 })] });
    await user.click(screen.getByRole('link', { name: /Mon bilan/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'Mon bilan' })).toBeInTheDocument();
  });
});
