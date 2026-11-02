import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PieceType } from '../../../shared/pieces/constants/categories';
import { makeWardrobeItem } from '../../../test/factories';
import { renderApp } from '../../../test/renderApp';

const WARDROBE = [
  makeWardrobeItem({ id: 1, title: 'Tee blanc', pieceType: PieceType.Tops }),
  makeWardrobeItem({ id: 2, title: 'Chemise', pieceType: PieceType.Shirts }),
  makeWardrobeItem({ id: 3, title: 'Jean', pieceType: PieceType.Bottoms }),
  makeWardrobeItem({ id: 4, title: 'Baskets', pieceType: PieceType.Shoes }),
];

describe('Mes associations', () => {
  it('classe les pièces indispensables', () => {
    renderApp('/associations', { wardrobe: WARDROBE });
    const firstRow = screen.getAllByRole('button', { pressed: true })[0];
    expect(firstRow).toHaveTextContent('Jean');
    expect(firstRow).toHaveTextContent('2 tenues possibles');
  });

  it('montre avec quoi va une pièce choisie', async () => {
    const { user } = renderApp('/associations', { wardrobe: WARDROBE });
    await user.click(screen.getByRole('button', { name: /Tee blanc/ }));
    expect(screen.getByText(/TEE BLANC va avec 2 pièces/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voir les idées de tenues' })).toHaveAttribute(
      'href',
      '/tenues/idees/1',
    );
  });

  it('change de pièce avec la liste', async () => {
    const { user } = renderApp('/associations', { wardrobe: WARDROBE });
    await user.selectOptions(screen.getByLabelText('Pièce'), 'CHEMISE');
    expect(screen.getByText(/CHEMISE va avec 2 pièces/)).toBeInTheDocument();
  });

  it('signale les pièces isolées', () => {
    const wardrobe = [
      makeWardrobeItem({ id: 3, title: 'Jean', pieceType: PieceType.Bottoms }),
      makeWardrobeItem({ id: 4, title: 'Baskets', pieceType: PieceType.Shoes }),
    ];
    renderApp('/associations', { wardrobe });
    expect(screen.getByRole('link', { name: 'Jean' })).toHaveAttribute(
      'href',
      '/garde-robe/3/modifier',
    );
    expect(screen.queryByText('Tes pièces indispensables')).not.toBeInTheDocument();
  });

  it('invite à ajouter des pièces quand la garde-robe est vide', () => {
    renderApp('/associations');
    expect(screen.getByText(/Ajoute des hauts, des bas et des chaussures/)).toBeInTheDocument();
  });

  it('est accessible depuis la page Moi', async () => {
    const { user } = renderApp('/moi', { wardrobe: WARDROBE });
    await user.click(screen.getByRole('link', { name: /Mes associations/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'Mes associations' })).toBeInTheDocument();
  });
});
