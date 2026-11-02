import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PieceColor } from '../../../shared/pieces/constants/colors';
import { PieceType } from '../../../shared/pieces/constants/categories';
import { makeWardrobeItem } from '../../../test/factories';
import { renderApp } from '../../../test/renderApp';
import { OwnershipStatus } from '../../wardrobe/constants/wardrobe';

describe('Avant d’acheter', () => {
  it('montre les tenues possibles et les pièces similaires d’une envie', async () => {
    renderApp('/garde-robe/9/modifier', {
      wardrobe: [
        makeWardrobeItem(
          { id: 9, title: 'Pull noir', pieceType: PieceType.Tops, color: PieceColor.Black },
          { status: OwnershipStatus.Wanted },
        ),
        makeWardrobeItem({
          id: 1,
          title: 'Tee noir',
          pieceType: PieceType.Tops,
          color: PieceColor.Black,
        }),
        makeWardrobeItem({ id: 2, title: 'Jean', pieceType: PieceType.Bottoms }),
      ],
    });
    expect(await screen.findByRole('heading', { name: /Avant d’acheter/ })).toBeInTheDocument();
    expect(screen.getByText(/elle donnerait 1 tenue/)).toBeInTheDocument();
    expect(screen.getByText(/quelque chose de proche : TEE NOIR/)).toBeInTheDocument();
  });
});
