import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { SHOW_AVAILABILITY } from '../../wardrobe/constants/wardrobe';
import { describe, expect, it, vi } from 'vitest';
import { makeWardrobeItem } from '../../../test/factories';
import { readStoredArchive, readStoredWardrobe, renderApp } from '../../../test/renderApp';
import { PieceColor } from '../../../shared/pieces/constants/colors';
import { OwnershipStatus } from '../../wardrobe/constants/wardrobe';

const PHOTO = vi.hoisted(() => 'data:image/jpeg;base64,cGhvdG8=');

vi.mock('../../../shared/photos/utils/resizePhoto', () => ({
  resizePhoto: async () => PHOTO,
}));

const ADD_SECONDARY = /Ajouter une couleur secondaire/;
const REMOVE_SECONDARY = 'Retirer la couleur secondaire';
const MORE_DETAILS = 'Plus de détails (facultatif)';
const MORE_ACTIONS = /^Plus d.actions$/;
const OWNED_BUTTON = /^Je l.ai$/;
const WANTED_BUTTON = /^J.en ai envie$/;
const ADD_BUTTON = { name: 'Ajouter la pièce' };

function sidebar(): HTMLElement {
  return screen.getByRole('complementary', { name: 'Aperçu et résultat' });
}

function primaryColors(): HTMLElement {
  return screen.getByRole('group', { name: 'Couleur' });
}

function secondaryColors(): HTMLElement {
  return screen.getByRole('group', { name: 'Couleur secondaire' });
}

function statusGroup(): HTMLElement {
  return screen.getByRole('group', { name: 'Statut' });
}

function colorButton(group: HTMLElement, label: string): HTMLElement {
  return within(group).getByRole('button', { name: label });
}

function detailsOf(element: HTMLElement): HTMLDetailsElement | null {
  return element.closest('details');
}

function summaryOf(details: HTMLDetailsElement): string {
  return (details.querySelector('summary')?.textContent ?? '').trim();
}

function isBefore(first: HTMLElement, second: HTMLElement): boolean {
  return Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);
}

function moreActionsSummary(): HTMLElement {
  const summaries = Array.from(document.querySelectorAll('summary'));
  const summary = summaries.find((candidate) =>
    MORE_ACTIONS.test(candidate.textContent?.trim() ?? ''),
  );
  if (!summary) throw new Error('Résumé « Plus d’actions » introuvable');
  return summary;
}

function countStored(piece: Record<string, unknown>, color: PieceColor): number {
  return [piece.color, piece.secondaryColor].filter((stored) => stored === color).length;
}

describe('Fiche pièce : ordre et contenu du formulaire (ajout)', () => {
  it('range Photo, Nom, Type, Couleur, Marque, Prix puis Statut dans cet ordre', () => {
    renderApp('/ajouter');
    const ordered = [
      screen.getByTestId('piece-photo'),
      screen.getByLabelText(/^Nom/),
      screen.getByLabelText('Type'),
      primaryColors(),
      screen.getByLabelText('Marque'),
      screen.getByLabelText(/^Prix/),
      statusGroup(),
    ];
    for (let index = 0; index < ordered.length - 1; index += 1) {
      expect(isBefore(ordered[index], ordered[index + 1])).toBe(true);
    }
  });

  it('garde les champs principaux hors de « Plus de détails »', () => {
    renderApp('/ajouter');
    const visibleFields = [
      screen.getByTestId('piece-photo'),
      screen.getByLabelText(/^Nom/),
      screen.getByLabelText('Type'),
      primaryColors(),
      screen.getByLabelText('Marque'),
      screen.getByLabelText(/^Prix/),
      statusGroup(),
    ];
    for (const field of visibleFields) expect(detailsOf(field)).toBeNull();
  });

  it('ne garde pas le titre de section « Dans ma garde-robe »', () => {
    renderApp('/ajouter');
    expect(screen.queryByText('Dans ma garde-robe')).not.toBeInTheDocument();
  });

  it('ne propose plus de champ « Rangée »', async () => {
    const { user } = renderApp('/ajouter');
    await user.click(screen.getByText(MORE_DETAILS));
    expect(screen.queryByLabelText('Rangée')).not.toBeInTheDocument();
    expect(screen.queryByText('Rangée')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: WANTED_BUTTON }));
    expect(screen.queryByLabelText('Rangée')).not.toBeInTheDocument();
  });

  it('ne propose plus de select « Statut »', () => {
    renderApp('/ajouter');
    expect(screen.queryByRole('combobox', { name: 'Statut' })).not.toBeInTheDocument();
  });

  it.skipIf(!SHOW_AVAILABILITY)(
    'range les autres champs dans « Plus de détails (facultatif) »',
    () => {
      renderApp('/ajouter');
      const hiddenFields = [
        screen.getByLabelText('Disponibilité'),
        screen.getByTestId('piece-extra-photo'),
        screen.getByLabelText('Saison'),
        screen.getByLabelText('Taille'),
        screen.getByLabelText('Matière'),
        screen.getByLabelText('Date d’achat'),
        screen.getByLabelText('Tags'),
        screen.getByLabelText('Lien de l’article'),
      ];
      for (const field of hiddenFields) {
        const details = detailsOf(field);
        expect(details).not.toBeNull();
        expect(summaryOf(details as HTMLDetailsElement)).toBe(MORE_DETAILS);
      }
    },
  );

  it('replie « Plus de détails » au départ', () => {
    renderApp('/ajouter');
    const details = detailsOf(screen.getByLabelText('Saison')) as HTMLDetailsElement;
    expect(details.open).toBe(false);
  });
});

describe('Fiche pièce : statut en deux gros boutons', () => {
  it('propose « Je l’ai » (actif au départ) et « J’en ai envie »', () => {
    renderApp('/ajouter');
    const buttons = within(statusGroup()).getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(within(statusGroup()).getByRole('button', { name: OWNED_BUTTON })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(statusGroup()).getByRole('button', { name: WANTED_BUTTON })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('bascule le bouton actif', async () => {
    const { user } = renderApp('/ajouter');
    await user.click(within(statusGroup()).getByRole('button', { name: WANTED_BUTTON }));
    expect(within(statusGroup()).getByRole('button', { name: WANTED_BUTTON })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(statusGroup()).getByRole('button', { name: OWNED_BUTTON })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await user.click(within(statusGroup()).getByRole('button', { name: OWNED_BUTTON }));
    expect(within(statusGroup()).getByRole('button', { name: OWNED_BUTTON })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it.skipIf(!SHOW_AVAILABILITY)(
    'montre « Disponibilité » seulement pour « Je l’ai », dans « Plus de détails »',
    async () => {
      const { user } = renderApp('/ajouter');
      const availability = screen.getByLabelText('Disponibilité');
      expect(summaryOf(detailsOf(availability) as HTMLDetailsElement)).toBe(MORE_DETAILS);

      await user.click(within(statusGroup()).getByRole('button', { name: WANTED_BUTTON }));
      expect(screen.queryByLabelText('Disponibilité')).not.toBeInTheDocument();

      await user.click(within(statusGroup()).getByRole('button', { name: OWNED_BUTTON }));
      expect(screen.getByLabelText('Disponibilité')).toBeInTheDocument();
    },
  );

  it('enregistre une envie avec le statut « wanted »', async () => {
    const { user } = renderApp('/ajouter');
    await user.type(screen.getByLabelText(/^Nom/), 'Manteau rêvé');
    await user.click(within(statusGroup()).getByRole('button', { name: WANTED_BUTTON }));
    await user.click(screen.getByRole('button', ADD_BUTTON));

    await within(sidebar()).findByText('Pièce ajoutée');
    expect(readStoredWardrobe()[0].status).toBe(OwnershipStatus.Wanted);
  });

  it.skipIf(!SHOW_AVAILABILITY)(
    'enregistre la pièce possédée avec sa disponibilité choisie',
    async () => {
      const { user } = renderApp('/ajouter');
      await user.type(screen.getByLabelText(/^Nom/), 'Jean');
      await user.click(screen.getByText(MORE_DETAILS));
      await user.selectOptions(screen.getByLabelText('Disponibilité'), 'sale');
      await user.click(screen.getByRole('button', ADD_BUTTON));

      await within(sidebar()).findByText('Pièce ajoutée');
      const [item] = readStoredWardrobe();
      expect(item).toMatchObject({ status: OwnershipStatus.Owned, availability: 'sale' });
    },
  );
});

describe('Fiche pièce : couleur principale', () => {
  it('affiche la couleur sans ouvrir « Plus de détails »', () => {
    renderApp('/ajouter');
    expect(primaryColors()).toBeVisible();
    expect(colorButton(primaryColors(), 'Bleu')).toBeVisible();
    expect(detailsOf(primaryColors())).toBeNull();
  });

  it('affiche le nom de chaque couleur en texte visible', () => {
    renderApp('/ajouter');
    expect(within(primaryColors()).getByText('Bleu marine')).toBeVisible();
    expect(within(primaryColors()).getByText('Vert foncé')).toBeVisible();
    expect(within(primaryColors()).getByText('Crème')).toBeVisible();
    expect(within(primaryColors()).getByText('Doré')).toBeVisible();
  });

  it('propose les 24 couleurs, sans multicolore', () => {
    renderApp('/ajouter');
    expect(within(primaryColors()).getAllByRole('button')).toHaveLength(24);
    expect(within(primaryColors()).queryByText('Multicolore')).not.toBeInTheDocument();
  });

  it('marque la couleur choisie avec aria-pressed et la décoche au second clic', async () => {
    const { user } = renderApp('/ajouter');
    const blue = colorButton(primaryColors(), 'Bleu');
    expect(blue).toHaveAttribute('aria-pressed', 'false');
    await user.click(blue);
    expect(blue).toHaveAttribute('aria-pressed', 'true');
    expect(colorButton(primaryColors(), 'Bleu marine')).toHaveAttribute('aria-pressed', 'false');
    await user.click(blue);
    expect(blue).toHaveAttribute('aria-pressed', 'false');
  });

  it('enregistre la couleur principale sans couleur secondaire', async () => {
    const { user } = renderApp('/ajouter');
    await user.type(screen.getByLabelText(/^Nom/), 'Pull marin');
    await user.click(colorButton(primaryColors(), 'Bleu marine'));
    await user.click(screen.getByRole('button', ADD_BUTTON));

    await within(sidebar()).findByText('Pièce ajoutée');
    expect(readStoredWardrobe()[0].piece).toMatchObject({
      color: 'bleu-marine',
      secondaryColor: null,
    });
  });

  it('enregistre aucune couleur quand rien n’est choisi', async () => {
    const { user } = renderApp('/ajouter');
    await user.type(screen.getByLabelText(/^Nom/), 'Pull neutre');
    await user.click(screen.getByRole('button', ADD_BUTTON));

    await within(sidebar()).findByText('Pièce ajoutée');
    expect(readStoredWardrobe()[0].piece).toMatchObject({ color: null, secondaryColor: null });
  });
});

describe('Fiche pièce : couleur secondaire', () => {
  it('cache la couleur secondaire tant qu’on ne l’a pas demandée', () => {
    renderApp('/ajouter');
    expect(screen.queryByRole('group', { name: 'Couleur secondaire' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: REMOVE_SECONDARY })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADD_SECONDARY })).toBeVisible();
  });

  it('révèle le second groupe de couleurs avec le même nombre de pastilles', async () => {
    const { user } = renderApp('/ajouter');
    await user.click(screen.getByRole('button', { name: ADD_SECONDARY }));
    expect(secondaryColors()).toBeVisible();
    expect(within(secondaryColors()).getAllByRole('button')).toHaveLength(24);
    expect(within(secondaryColors()).getByText('Bordeaux')).toBeVisible();
    expect(screen.getByRole('button', { name: REMOVE_SECONDARY })).toBeVisible();
    expect(screen.queryByRole('button', { name: ADD_SECONDARY })).not.toBeInTheDocument();
  });

  it('enregistre la couleur principale ET la couleur secondaire', async () => {
    const { user } = renderApp('/ajouter');
    await user.type(screen.getByLabelText(/^Nom/), 'Pull rayé');
    await user.click(colorButton(primaryColors(), 'Bleu'));
    await user.click(screen.getByRole('button', { name: ADD_SECONDARY }));
    await user.click(colorButton(secondaryColors(), 'Beige'));
    expect(colorButton(secondaryColors(), 'Beige')).toHaveAttribute('aria-pressed', 'true');
    expect(colorButton(primaryColors(), 'Beige')).toHaveAttribute('aria-pressed', 'false');
    await user.click(screen.getByRole('button', ADD_BUTTON));

    await within(sidebar()).findByText('Pièce ajoutée');
    expect(readStoredWardrobe()[0].piece).toMatchObject({ color: 'bleu', secondaryColor: 'beige' });
  });

  it('retire la couleur secondaire : groupe masqué et valeur effacée', async () => {
    const { user } = renderApp('/ajouter');
    await user.type(screen.getByLabelText(/^Nom/), 'Pull rayé');
    await user.click(colorButton(primaryColors(), 'Bleu'));
    await user.click(screen.getByRole('button', { name: ADD_SECONDARY }));
    await user.click(colorButton(secondaryColors(), 'Beige'));
    await user.click(screen.getByRole('button', { name: REMOVE_SECONDARY }));

    expect(screen.queryByRole('group', { name: 'Couleur secondaire' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: ADD_SECONDARY })).toBeVisible();
    await user.click(screen.getByRole('button', ADD_BUTTON));
    await within(sidebar()).findByText('Pièce ajoutée');
    expect(readStoredWardrobe()[0].piece).toMatchObject({ color: 'bleu', secondaryColor: null });
  });

  it('n’enregistre pas de doublon quand la secondaire est la même que la principale', async () => {
    const { user } = renderApp('/ajouter');
    await user.type(screen.getByLabelText(/^Nom/), 'Pull uni');
    await user.click(colorButton(primaryColors(), 'Bleu'));
    await user.click(screen.getByRole('button', { name: ADD_SECONDARY }));
    await user.click(colorButton(secondaryColors(), 'Bleu'));
    await user.click(screen.getByRole('button', ADD_BUTTON));

    await within(sidebar()).findByText('Pièce ajoutée');
    const { piece } = readStoredWardrobe()[0];
    expect(countStored(piece as never, PieceColor.Blue)).toBe(1);
  });

  it('n’enregistre pas de doublon quand on choisit la principale égale à la secondaire', async () => {
    const { user } = renderApp('/ajouter');
    await user.type(screen.getByLabelText(/^Nom/), 'Pull uni');
    await user.click(colorButton(primaryColors(), 'Bleu'));
    await user.click(screen.getByRole('button', { name: ADD_SECONDARY }));
    await user.click(colorButton(secondaryColors(), 'Beige'));
    await user.click(colorButton(primaryColors(), 'Beige'));
    await user.click(screen.getByRole('button', ADD_BUTTON));

    await within(sidebar()).findByText('Pièce ajoutée');
    const { piece } = readStoredWardrobe()[0];
    expect(countStored(piece as never, PieceColor.Beige)).toBe(1);
  });

  it('ne montre jamais la même couleur cochée dans les deux groupes', async () => {
    const { user } = renderApp('/ajouter');
    await user.click(colorButton(primaryColors(), 'Rouge'));
    await user.click(screen.getByRole('button', { name: ADD_SECONDARY }));
    await user.click(colorButton(secondaryColors(), 'Rouge'));
    const pressedInPrimary = colorButton(primaryColors(), 'Rouge').getAttribute('aria-pressed');
    const pressedInSecondary = colorButton(secondaryColors(), 'Rouge').getAttribute('aria-pressed');
    expect(pressedInPrimary === 'true' && pressedInSecondary === 'true').toBe(false);
  });

  it('remet « + Ajouter une couleur secondaire » après le retrait', async () => {
    const { user } = renderApp('/ajouter');
    await user.click(screen.getByRole('button', { name: ADD_SECONDARY }));
    await user.click(screen.getByRole('button', { name: REMOVE_SECONDARY }));
    await user.click(screen.getByRole('button', { name: ADD_SECONDARY }));
    expect(secondaryColors()).toBeVisible();
  });
});

describe('Modifier une pièce : couleurs enregistrées', () => {
  it('pré-remplit les couleurs principale et secondaire et affiche le groupe secondaire', () => {
    const striped = makeWardrobeItem({
      id: 9,
      title: 'Rayé',
      thumbnail: '',
      color: PieceColor.Navy,
      secondaryColor: PieceColor.Cream,
    });
    renderApp('/garde-robe/9/modifier', { wardrobe: [striped] });
    expect(colorButton(primaryColors(), 'Bleu marine')).toHaveAttribute('aria-pressed', 'true');
    expect(colorButton(secondaryColors(), 'Crème')).toHaveAttribute('aria-pressed', 'true');
  });

  it('modifie la couleur secondaire et l’enregistre', async () => {
    const striped = makeWardrobeItem({
      id: 9,
      title: 'Rayé',
      thumbnail: '',
      color: PieceColor.Navy,
      secondaryColor: PieceColor.Cream,
    });
    const { user } = renderApp('/garde-robe/9/modifier', { wardrobe: [striped] });
    await user.click(colorButton(secondaryColors(), 'Doré'));
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await within(sidebar()).findByText('Modifications enregistrées');
    expect(readStoredWardrobe()[0].piece).toMatchObject({
      color: 'bleu-marine',
      secondaryColor: 'dore',
    });
  });

  it('retire la couleur secondaire d’une pièce existante', async () => {
    const striped = makeWardrobeItem({
      id: 9,
      title: 'Rayé',
      thumbnail: '',
      color: PieceColor.Navy,
      secondaryColor: PieceColor.Cream,
    });
    const { user } = renderApp('/garde-robe/9/modifier', { wardrobe: [striped] });
    await user.click(screen.getByRole('button', { name: REMOVE_SECONDARY }));
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await within(sidebar()).findByText('Modifications enregistrées');
    expect(readStoredWardrobe()[0].piece).toMatchObject({
      color: 'bleu-marine',
      secondaryColor: null,
    });
  });

  it('n’écrit plus le champ location à l’enregistrement', async () => {
    const withLocation = {
      ...makeWardrobeItem({ id: 9, title: 'Ancienne', thumbnail: '' }),
      location: 'tiroir',
    };
    const { user } = renderApp('/garde-robe/9/modifier', { wardrobe: [withLocation as never] });
    await user.type(screen.getByLabelText(/^Nom/), ' bis');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await within(sidebar()).findByText('Modifications enregistrées');
    const [stored] = readStoredWardrobe();
    expect(stored.piece.title).toBe('Ancienne bis');
    expect(stored).not.toHaveProperty('location');
  });
});

describe('Modifier une pièce : anciennes données', () => {
  it('ouvre sans crash une pièce avec location et couleur multicolore', () => {
    const old = {
      ...makeWardrobeItem({ id: 9, title: 'Vieille veste', thumbnail: '' }),
      location: 'chez-mes-parents',
    };
    const oldPiece = { ...old.piece, color: 'multicolore' };
    renderApp('/garde-robe/9/modifier', { wardrobe: [{ ...old, piece: oldPiece } as never] });

    expect(screen.getByLabelText(/^Nom/)).toHaveValue('Vieille veste');
    for (const button of within(primaryColors()).getAllByRole('button')) {
      expect(button).toHaveAttribute('aria-pressed', 'false');
    }
    expect(screen.queryByLabelText('Rangée')).not.toBeInTheDocument();
  });

  it('affiche une pièce multicolore de la garde-robe sans couleur', () => {
    const oldPiece = {
      ...makeWardrobeItem({ id: 9, title: 'Vieille veste', thumbnail: '' }).piece,
      color: 'multicolore',
    };
    const old = { ...makeWardrobeItem({ id: 9 }), piece: oldPiece, location: 'armoire' };
    renderApp('/garde-robe', { wardrobe: [old as never] });
    expect(screen.getByRole('heading', { name: 'Vieille veste' })).toBeInTheDocument();
  });

  it('enregistre une pièce multicolore ancienne avec color null', async () => {
    const oldPiece = {
      ...makeWardrobeItem({ id: 9, title: 'Vieille veste', thumbnail: '' }).piece,
      color: 'multicolore',
    };
    const old = { ...makeWardrobeItem({ id: 9 }), piece: oldPiece, location: 'armoire' };
    const { user } = renderApp('/garde-robe/9/modifier', { wardrobe: [old as never] });
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await within(sidebar()).findByText('Modifications enregistrées');
    expect(readStoredWardrobe()[0].piece).toMatchObject({ color: null, secondaryColor: null });
  });
});

describe('Modifier une pièce : bloc « Infos » et « Plus d’actions »', () => {
  const OWNED = makeWardrobeItem({ id: 7, title: 'Chemise 7', thumbnail: '' });
  const WISH = makeWardrobeItem(
    { id: 8, title: 'Veste rêvée', thumbnail: '' },
    { status: OwnershipStatus.Wanted },
  );

  function infosBlock(): HTMLElement {
    const heading = screen.getByRole('heading', { name: 'Infos' });
    const block = heading.closest('section, details, div');
    if (!block) throw new Error('Bloc « Infos » introuvable');
    return block as HTMLElement;
  }

  it('regroupe coût par port et tenues dans un seul bloc « Infos » (Je l’ai)', () => {
    renderApp('/garde-robe/7/modifier', { wardrobe: [OWNED] });
    const infos = within(infosBlock());
    expect(infos.getByRole('heading', { name: 'Coût par port' })).toBeInTheDocument();
    expect(infos.getByRole('heading', { name: 'Tes tenues avec cette pièce' })).toBeInTheDocument();
    expect(infos.queryByRole('heading', { name: /Avant d.acheter/ })).not.toBeInTheDocument();
  });

  it('regroupe « Avant d’acheter » et les tenues dans « Infos » (envie)', () => {
    renderApp('/garde-robe/8/modifier', { wardrobe: [WISH] });
    const infos = within(infosBlock());
    expect(infos.getByRole('heading', { name: /Avant d.acheter/ })).toBeInTheDocument();
    expect(infos.getByRole('heading', { name: 'Tes tenues avec cette pièce' })).toBeInTheDocument();
    expect(infos.queryByRole('heading', { name: 'Coût par port' })).not.toBeInTheDocument();
  });

  it('place le bloc « Infos » après le formulaire', () => {
    renderApp('/garde-robe/7/modifier', { wardrobe: [OWNED] });
    expect(isBefore(screen.getByRole('button', { name: 'Enregistrer' }), infosBlock())).toBe(true);
  });

  it('replie « Plus d’actions » au départ avec archivage et suppression dedans', () => {
    renderApp('/garde-robe/7/modifier', { wardrobe: [OWNED] });
    const details = moreActionsSummary().closest('details') as HTMLDetailsElement;
    expect(details.open).toBe(false);
    expect(within(details).getByRole('button', { name: 'Supprimer' })).toBeInTheDocument();
    expect(within(details).getByRole('button', { name: 'Vendue' })).toBeInTheDocument();
    expect(within(details).getByRole('button', { name: 'Donnée' })).toBeInTheDocument();
  });

  it('place « Plus d’actions » après le bloc « Infos »', () => {
    renderApp('/garde-robe/7/modifier', { wardrobe: [OWNED] });
    expect(isBefore(infosBlock(), moreActionsSummary())).toBe(true);
  });

  it('n’archive pas une envie : seulement « Supprimer » dans « Plus d’actions »', () => {
    renderApp('/garde-robe/8/modifier', { wardrobe: [WISH] });
    const details = moreActionsSummary().closest('details') as HTMLDetailsElement;
    expect(within(details).getByRole('button', { name: 'Supprimer' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Vendue' })).not.toBeInTheDocument();
  });

  it('supprime la pièce après ouverture de « Plus d’actions » et confirmation', async () => {
    const { user } = renderApp('/garde-robe/7/modifier', { wardrobe: [OWNED] });
    await user.click(moreActionsSummary());
    await user.click(screen.getByRole('button', { name: 'Supprimer' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Supprimer ?')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Supprimer' }));

    await waitFor(() => expect(readStoredWardrobe()).toEqual([]));
    expect(await screen.findByText('Ta garde-robe est vide')).toBeInTheDocument();
  });

  it('annule la suppression sans rien retirer', async () => {
    const { user } = renderApp('/garde-robe/7/modifier', { wardrobe: [OWNED] });
    await user.click(moreActionsSummary());
    await user.click(screen.getByRole('button', { name: 'Supprimer' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Annuler' }));
    expect(readStoredWardrobe()).toHaveLength(1);
  });

  it('archive la pièce comme vendue depuis « Plus d’actions »', async () => {
    const { user } = renderApp('/garde-robe/7/modifier', { wardrobe: [OWNED] });
    await user.click(moreActionsSummary());
    await user.click(screen.getByRole('button', { name: 'Vendue' }));

    await waitFor(() => expect(readStoredArchive()).toHaveLength(1));
    expect(readStoredArchive()[0].reason).toBe('vendue');
    expect(readStoredWardrobe()).toEqual([]);
  });

  it('garde le statut et la fiche cohérents sur la page d’une envie', () => {
    renderApp('/garde-robe/8/modifier', { wardrobe: [WISH] });
    expect(within(statusGroup()).getByRole('button', { name: WANTED_BUTTON })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryByLabelText('Disponibilité')).not.toBeInTheDocument();
  });
});

describe('Fiche pièce : photo en tête', () => {
  it('affiche les outils de photo avant le nom', async () => {
    const { user } = renderApp('/ajouter');
    const photo = new File(['photo'], 'pull.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByTestId('piece-photo'), photo);
    const remove = await screen.findByRole('button', { name: 'Retirer la photo' });
    expect(isBefore(remove, screen.getByLabelText(/^Nom/))).toBe(true);
    fireEvent.click(remove);
  });
});
