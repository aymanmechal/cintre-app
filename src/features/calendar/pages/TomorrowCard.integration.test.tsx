import { screen } from '@testing-library/react';
import { SHOW_AVAILABILITY } from '../../wardrobe/constants/wardrobe';
import { describe, expect, it } from 'vitest';
import { makeOutfit, makeWardrobeItem } from '../../../test/factories';
import { renderApp } from '../../../test/renderApp';
import { Availability } from '../../wardrobe/constants/wardrobe';
import { toIsoDate } from '../../wardrobe/utils/wornDates';
import { addDays } from '../../suitcase/utils/tripDates';

const tomorrow = addDays(toIsoDate(new Date()), 1);

describe('Préparer demain', () => {
  it('propose de choisir une tenue quand rien n’est prévu', async () => {
    renderApp('/calendrier', { outfits: [makeOutfit()] });
    expect(await screen.findByText('Rien de prévu demain.')).toBeInTheDocument();
  });

  it.skipIf(!SHOW_AVAILABILITY)(
    'liste les pièces à préparer et prévient pour celles à laver',
    async () => {
      renderApp('/calendrier', {
        wardrobe: [
          makeWardrobeItem({ id: 1, title: 'Pull gris' }),
          makeWardrobeItem({ id: 2, title: 'Jean' }, { availability: Availability.Dirty }),
        ],
        outfits: [makeOutfit({ id: 'o', name: 'Cosy', pieceIds: [1, 2] })],
        wornLog: [{ id: 'w', date: tomorrow, outfitId: 'o' }],
      });
      expect(await screen.findByRole('checkbox', { name: 'Pull gris' })).toBeInTheDocument();
      expect(screen.getByText(/JEAN : À laver/)).toBeInTheDocument();
    },
  );
});
