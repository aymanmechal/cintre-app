import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PieceType } from '../../../shared/pieces/constants/categories';
import { makeOutfit, makeWardrobeItem } from '../../../test/factories';
import { openMyOutfitsTab } from '../../../test/outfitsNavigation';
import { readStoredOutfits, renderApp } from '../../../test/renderApp';
import { Availability } from '../../wardrobe/constants/wardrobe';

const SHIRT = makeWardrobeItem({ id: 1, title: 'Chemise lin', thumbnail: '' });
const JEANS = makeWardrobeItem({
  id: 2,
  title: 'Jean brut',
  pieceType: PieceType.Bottoms,
  thumbnail: '',
});
const CHINO = makeWardrobeItem({
  id: 3,
  title: 'Chino beige',
  pieceType: PieceType.Bottoms,
  thumbnail: '',
});
const WARDROBE = [SHIRT, JEANS, CHINO];

function ideaCards(): HTMLElement[] {
  return screen.getAllByRole('article', { name: /^Idée/ });
}

describe('Idées de tenues autour d’une pièce', () => {
  it('propose une tenue avec chaque bas disponible', () => {
    renderApp('/tenues/idees/1', { wardrobe: WARDROBE });
    expect(screen.getByText('Autour de « CHEMISE LIN »')).toBeInTheDocument();
    expect(ideaCards()).toHaveLength(2);
  });

  it('ne propose pas une pièce au lavage', () => {
    const washingChino = { ...CHINO, availability: Availability.Washing };
    renderApp('/tenues/idees/1', { wardrobe: [SHIRT, JEANS, washingChino] });
    expect(ideaCards()).toHaveLength(1);
    expect(within(ideaCards()[0]).getByText('Jean brut')).toBeInTheDocument();
  });

  it('garde une idée comme nouvelle tenue', async () => {
    const { user } = renderApp('/tenues/idees/1', { wardrobe: WARDROBE });
    await user.click(within(ideaCards()[0]).getByRole('button', { name: 'Garder cette tenue' }));

    expect(screen.getByRole('status')).toHaveTextContent('« Tenue n°1 » est dans tes tenues');
    expect(readStoredOutfits()).toMatchObject([{ name: 'Tenue n°1', pieceIds: [1, 2] }]);
    expect(ideaCards()).toHaveLength(1);
  });

  it('invite à ajouter des pièces quand il n’y a plus d’idée', () => {
    renderApp('/tenues/idees/1', { wardrobe: [SHIRT] });
    expect(screen.getByText("Plus d'idée pour l'instant")).toBeInTheDocument();
  });

  it('prévient quand la pièce n’existe pas', () => {
    renderApp('/tenues/idees/99', { wardrobe: WARDROBE });
    expect(screen.getByText('Pièce introuvable')).toBeInTheDocument();
  });
});

describe('Pièces sans tenue', () => {
  it('liste les pièces absentes de toutes les tenues avec un lien vers leurs idées', async () => {
    const outfit = makeOutfit({ pieceIds: [1, 2] });
    const { user } = renderApp('/tenues', { wardrobe: WARDROBE, outfits: [outfit] });
    await openMyOutfitsTab(user);
    await user.click(screen.getByText('Pièces sans tenue (1)'));
    await user.click(screen.getByRole('link', { name: /Chino beige/ }));
    expect(screen.getByText('Autour de « CHINO BEIGE »')).toBeInTheDocument();
  });
});

describe('Fiche pièce : tenues et idées', () => {
  it('compte les tenues et les idées possibles', () => {
    const outfit = makeOutfit({ pieceIds: [1, 2] });
    renderApp('/garde-robe/1/modifier', { wardrobe: WARDROBE, outfits: [outfit] });
    expect(screen.getByText('Dans 1 tenue. Encore 1 idée avec ce que tu as.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '✨ Voir les idées' })).toHaveAttribute(
      'href',
      '/tenues/idees/1',
    );
  });

  it('prévient avant de supprimer une pièce utilisée dans des tenues', async () => {
    const outfits = [
      makeOutfit({ id: 'a', pieceIds: [1, 2] }),
      makeOutfit({ id: 'b', pieceIds: [1, 3] }),
    ];
    const { user } = renderApp('/garde-robe/1/modifier', { wardrobe: WARDROBE, outfits });
    await user.click(screen.getByRole('button', { name: 'Supprimer' }));
    expect(
      within(screen.getByRole('dialog')).getByText(/Attention : elle est dans 2 tenues\./),
    ).toBeInTheDocument();
  });
});
