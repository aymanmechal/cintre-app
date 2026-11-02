import { screen } from '@testing-library/react';
import { SHOW_AVAILABILITY } from '../constants/wardrobe';
import { describe, expect, it } from 'vitest';
import { makeWardrobeItem } from '../../../test/factories';
import { readStoredWardrobe, renderApp } from '../../../test/renderApp';
import { Availability } from '../constants/wardrobe';

const CLEAN = makeWardrobeItem({ id: 1, title: 'Jean propre', thumbnail: '' });
const DIRTY = makeWardrobeItem(
  { id: 2, title: 'Pull sale', thumbnail: '' },
  { availability: Availability.Dirty },
);

describe('Garde-robe : disponibilité', () => {
  it('signale une pièce indisponible sur sa carte', () => {
    renderApp('/garde-robe', { wardrobe: [CLEAN, DIRTY] });
    expect(screen.getAllByText('À laver')).toHaveLength(1);
  });

  it.skipIf(!SHOW_AVAILABILITY)('ne garde que les pièces disponibles à la demande', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: [CLEAN, DIRTY] });
    await user.click(screen.getByLabelText('Disponibles seulement'));
    expect(screen.queryByRole('heading', { name: 'Pull sale' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Jean propre' })).toBeInTheDocument();
  });

  it.skipIf(!SHOW_AVAILABILITY)(
    'change la disponibilité et la matière depuis la fiche',
    async () => {
      const { user } = renderApp('/garde-robe/1/modifier', { wardrobe: [CLEAN] });
      await user.selectOptions(screen.getByLabelText('Disponibilité'), 'au-lavage');
      await user.click(screen.getByText('Plus de détails (facultatif)'));
      await user.type(screen.getByLabelText('Matière'), 'coton');
      await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

      await screen.findByText('Modifications enregistrées');
      const [item] = readStoredWardrobe();
      expect(item.availability).toBe(Availability.Washing);
      expect(item.piece.material).toBe('coton');
    },
  );
});
