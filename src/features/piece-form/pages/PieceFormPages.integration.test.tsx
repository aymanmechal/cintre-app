import { screen, waitFor, within } from '@testing-library/react';
import { SHOW_AVAILABILITY } from '../../wardrobe/constants/wardrobe';
import { describe, expect, it } from 'vitest';
import { makeWardrobeItem } from '../../../test/factories';
import { readStoredWardrobe, renderApp } from '../../../test/renderApp';

const MORE_ACTIONS = /^Plus d.actions$/;

function sidebar(): HTMLElement {
  return screen.getByRole('complementary', { name: 'Aperçu et résultat' });
}

function nameField(): HTMLElement {
  return screen.getByLabelText(/^Nom/);
}

describe('Ajouter une pièce : formulaire', () => {
  it("affiche l'aperçu en direct pendant la saisie", async () => {
    const { user } = renderApp('/ajouter');
    expect(within(sidebar()).getByText('Nom de ta pièce')).toBeInTheDocument();
    await user.type(nameField(), 'Veste en jean');
    await user.type(screen.getByLabelText('Marque'), 'Levi');
    await user.type(screen.getByLabelText(/^Prix/), '89.9');
    expect(within(sidebar()).getByText('Veste en jean')).toBeInTheDocument();
    expect(within(sidebar()).getByText('Levi')).toBeInTheDocument();
    expect(within(sidebar()).getByText(/89,90/)).toBeInTheDocument();
  });

  it("change la couleur de l'aperçu avec le type (attribut de catégorie)", async () => {
    const { user } = renderApp('/ajouter');
    await user.selectOptions(screen.getByLabelText('Type'), 'chaussures');
    expect(sidebar().querySelector('[data-piece-type="chaussures"]')).not.toBeNull();
  });

  it('refuse un nom vide, sans rien enregistrer', async () => {
    const { user } = renderApp('/ajouter');
    await user.click(screen.getByRole('button', { name: 'Ajouter la pièce' }));
    expect(screen.getByText(/Le nom doit faire au moins 2/)).toBeInTheDocument();
    expect(readStoredWardrobe()).toEqual([]);
  });

  it('refuse un prix négatif et un lien de photo invalide', async () => {
    const { user } = renderApp('/ajouter');
    await user.type(nameField(), 'Veste');
    await user.type(screen.getByLabelText(/^Prix/), '-5');
    await user.type(screen.getByLabelText('Ou lien d’une photo'), 'pas un lien');
    await user.click(screen.getByRole('button', { name: 'Ajouter la pièce' }));
    expect(screen.getByText(/Le prix doit être un nombre/)).toBeInTheDocument();
    expect(screen.getByText(/doit commencer par http/)).toBeInTheDocument();
  });

  it.skipIf(!SHOW_AVAILABILITY)("masque la disponibilité quand c'est une envie", async () => {
    const { user } = renderApp('/ajouter');
    expect(screen.getByLabelText('Disponibilité')).toBeInTheDocument();
    await user.click(
      within(screen.getByRole('group', { name: 'Statut' })).getByRole('button', {
        name: /^J.en ai envie$/,
      }),
    );
    expect(screen.queryByLabelText('Disponibilité')).not.toBeInTheDocument();
  });
});

describe('Ajouter une pièce : enregistrement', () => {
  it('range la pièce en local et affiche la confirmation à droite', async () => {
    const { user } = renderApp('/ajouter');
    await user.type(nameField(), 'Veste en jean');
    await user.type(screen.getByLabelText('Marque'), 'Levi');
    await user.click(screen.getByRole('button', { name: 'Ajouter la pièce' }));

    expect(await within(sidebar()).findByText('Pièce ajoutée')).toBeInTheDocument();
    const [item] = readStoredWardrobe();
    expect(item.piece.title).toBe('Veste en jean');
    expect(item.piece.brand).toBe('Levi');
    expect(item.piece.id).toBeLessThan(0);
  });

  it('vide le formulaire après un ajout réussi', async () => {
    const { user } = renderApp('/ajouter');
    await user.type(nameField(), 'Veste en jean');
    await user.click(screen.getByRole('button', { name: 'Ajouter la pièce' }));
    await within(sidebar()).findByText('Pièce ajoutée');
    expect(nameField()).toHaveValue('');
  });

  it("propose le lien vers la garde-robe après l'ajout", async () => {
    const { user } = renderApp('/ajouter');
    await user.type(nameField(), 'Veste en jean');
    await user.click(screen.getByRole('button', { name: 'Ajouter la pièce' }));
    expect(
      await within(sidebar()).findByRole('link', { name: 'Voir ma garde-robe' }),
    ).toBeInTheDocument();
  });
});

describe('Modifier une pièce', () => {
  const CUSTOM = makeWardrobeItem({ id: -5, title: 'Veste perso', thumbnail: '' });

  it('pré-remplit le formulaire avec la pièce', () => {
    renderApp('/garde-robe/-5/modifier', { wardrobe: [CUSTOM] });
    expect(nameField()).toHaveValue('Veste perso');
  });

  it('dit « introuvable » pour une pièce absente de la garde-robe', () => {
    renderApp('/garde-robe/999/modifier', { wardrobe: [CUSTOM] });
    expect(screen.getByText('Pièce introuvable')).toBeInTheDocument();
  });

  it('enregistre les modifications en local', async () => {
    const { user } = renderApp('/garde-robe/-5/modifier', { wardrobe: [CUSTOM] });
    await user.clear(nameField());
    await user.type(nameField(), 'Veste rénovée');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await within(sidebar()).findByText('Modifications enregistrées')).toBeInTheDocument();
    expect(readStoredWardrobe()[0].piece.title).toBe('Veste rénovée');
  });

  it('conserve la date de dernier port après une modification', async () => {
    const worn = makeWardrobeItem(
      { id: -5, title: 'Veste perso', thumbnail: '' },
      { lastWornOn: '2026-01-02' },
    );
    const { user } = renderApp('/garde-robe/-5/modifier', { wardrobe: [worn] });
    await user.type(nameField(), ' bis');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
    await within(sidebar()).findByText('Modifications enregistrées');
    expect(readStoredWardrobe()[0].lastWornOn).toBe('2026-01-02');
  });
});

describe('Supprimer une pièce', () => {
  const CATALOG = makeWardrobeItem({ id: 7, title: 'Chemise 7', thumbnail: '' });

  it('demande confirmation et peut être annulé', async () => {
    const { user } = renderApp('/garde-robe/7/modifier', { wardrobe: [CATALOG] });
    await user.click(screen.getByText(MORE_ACTIONS));
    await user.click(screen.getByRole('button', { name: 'Supprimer' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Supprimer ?')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Annuler' }));
    expect(readStoredWardrobe()).toHaveLength(1);
  });

  it('supprime la pièce de la garde-robe, puis revient à la garde-robe', async () => {
    const { user } = renderApp('/garde-robe/7/modifier', { wardrobe: [CATALOG] });
    await user.click(screen.getByText(MORE_ACTIONS));
    await user.click(screen.getByRole('button', { name: 'Supprimer' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Supprimer' }));

    await waitFor(() => expect(readStoredWardrobe()).toEqual([]));
    expect(await screen.findByText('Ta garde-robe est vide')).toBeInTheDocument();
  });
});
