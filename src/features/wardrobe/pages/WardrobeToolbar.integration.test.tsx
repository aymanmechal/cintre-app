import { screen, within } from '@testing-library/react';
import { SHOW_AVAILABILITY } from '../constants/wardrobe';
import { describe, expect, it } from 'vitest';
import { PieceType } from '../../../shared/pieces/constants/categories';
import { PieceColor } from '../../../shared/pieces/constants/colors';
import { Season } from '../../../shared/pieces/constants/seasons';
import { makeWardrobeItem } from '../../../test/factories';
import { readStoredWardrobe, renderApp } from '../../../test/renderApp';
import { OwnershipStatus } from '../constants/wardrobe';

const RED_SCARF = makeWardrobeItem({
  id: 1,
  title: 'Écharpe',
  thumbnail: '',
  pieceType: PieceType.Tops,
  color: PieceColor.Red,
  season: Season.Winter,
  tags: ['noel'],
});
const BLUE_TEE = makeWardrobeItem({
  id: 2,
  title: 'T-shirt',
  thumbnail: '',
  pieceType: PieceType.Tops,
  color: PieceColor.Blue,
  season: Season.Summer,
});
const GREEN_SNEAKERS = makeWardrobeItem({
  id: 3,
  title: 'Baskets',
  thumbnail: '',
  pieceType: PieceType.Shoes,
  color: PieceColor.Green,
});
const BLACK_BAG = makeWardrobeItem({
  id: 4,
  title: 'Cabas',
  thumbnail: '',
  pieceType: PieceType.Bags,
  color: PieceColor.Black,
});
const WISH_WATCH = makeWardrobeItem(
  { id: 5, title: 'Montre dorée', thumbnail: '', pieceType: PieceType.Watches },
  { status: OwnershipStatus.Wanted },
);
const WISH_RING = makeWardrobeItem(
  { id: 6, title: 'Bague argent', thumbnail: '', pieceType: PieceType.Jewellery },
  { status: OwnershipStatus.Wanted },
);
const WARDROBE = [RED_SCARF, BLUE_TEE, GREEN_SNEAKERS, BLACK_BAG];

function isShown(title: string): boolean {
  return screen.queryByRole('heading', { name: title }) !== null;
}

function typeChips(): HTMLElement {
  return screen.getByRole('group', { name: 'Type de pièce' });
}

function typeChip(label: string): HTMLElement {
  return within(typeChips()).getByRole('button', { name: label });
}

function filtersSummary(): HTMLElement {
  const summaries = Array.from(document.querySelectorAll('summary'));
  const summary = summaries.find((candidate) =>
    candidate.textContent?.trim().startsWith('Filtres'),
  );
  if (!summary) throw new Error('Résumé « Filtres » introuvable');
  return summary;
}

function filtersPanel(): HTMLDetailsElement {
  return filtersSummary().closest('details') as HTMLDetailsElement;
}

function summaryText(): string {
  return (filtersSummary().textContent ?? '').replace(/\s+/g, ' ').trim();
}

function colorGroup(): HTMLElement {
  return screen.getByRole('group', { name: 'Couleur' });
}

function optionLabels(select: HTMLElement): string[] {
  return within(select)
    .getAllByRole('option')
    .map((option) => option.textContent ?? '');
}

describe('Barre d’outils : pastilles de type', () => {
  it('propose « Tous » puis une pastille par type, « Tous » étant active au départ', () => {
    renderApp('/garde-robe', { wardrobe: WARDROBE });
    expect(typeChip('Tous')).toHaveAttribute('aria-pressed', 'true');
    expect(typeChip('Chaussures')).toHaveAttribute('aria-pressed', 'false');
    expect(typeChip('Sacs')).toHaveAttribute('aria-pressed', 'false');
    expect(within(typeChips()).getAllByRole('button')).toHaveLength(11);
  });

  it('filtre sur un seul type et désactive « Tous »', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.click(typeChip('Chaussures'));
    expect(typeChip('Chaussures')).toHaveAttribute('aria-pressed', 'true');
    expect(typeChip('Tous')).toHaveAttribute('aria-pressed', 'false');
    expect(isShown('Baskets')).toBe(true);
    expect(isShown('Écharpe')).toBe(false);
    expect(isShown('Cabas')).toBe(false);
  });

  it('cumule plusieurs types (multi-sélection)', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.click(typeChip('Chaussures'));
    await user.click(typeChip('Sacs'));
    expect(isShown('Baskets')).toBe(true);
    expect(isShown('Cabas')).toBe(true);
    expect(isShown('Écharpe')).toBe(false);
    expect(isShown('T-shirt')).toBe(false);
  });

  it('décoche un type, et « Tous » redevient actif quand plus aucun n’est coché', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.click(typeChip('Chaussures'));
    await user.click(typeChip('Chaussures'));
    expect(typeChip('Tous')).toHaveAttribute('aria-pressed', 'true');
    expect(isShown('Écharpe')).toBe(true);
    expect(isShown('Baskets')).toBe(true);
  });

  it('« Tous » décoche tous les types', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.click(typeChip('Chaussures'));
    await user.click(typeChip('Sacs'));
    await user.click(typeChip('Tous'));
    expect(typeChip('Tous')).toHaveAttribute('aria-pressed', 'true');
    expect(typeChip('Chaussures')).toHaveAttribute('aria-pressed', 'false');
    expect(typeChip('Sacs')).toHaveAttribute('aria-pressed', 'false');
    expect(isShown('Écharpe')).toBe(true);
    expect(isShown('Cabas')).toBe(true);
  });

  it('ne compte pas les types dans la pastille numérique « Filtres »', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.click(typeChip('Chaussures'));
    expect(summaryText()).toBe('Filtres');
  });

  it('l’ancien sélecteur « Type » n’existe plus', () => {
    renderApp('/garde-robe', { wardrobe: WARDROBE });
    expect(screen.queryByLabelText('Type')).not.toBeInTheDocument();
  });
});

describe('Barre d’outils : panneau « Filtres »', () => {
  it('est replié par défaut puis s’ouvre au clic', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    expect(filtersPanel().open).toBe(false);
    await user.click(filtersSummary());
    expect(filtersPanel().open).toBe(true);
  });

  it.skipIf(!SHOW_AVAILABILITY)(
    'contient couleurs, saison, tag, favoris, disponibles, tri, regroupement',
    () => {
      renderApp('/garde-robe', { wardrobe: WARDROBE });
      const panel = within(filtersPanel());
      expect(panel.getByRole('group', { name: 'Couleur' })).toBeInTheDocument();
      expect(panel.getByLabelText('Saison')).toBeInTheDocument();
      expect(panel.getByLabelText('Tag')).toBeInTheDocument();
      expect(panel.getByLabelText('Mes favoris seulement')).toBeInTheDocument();
      expect(panel.getByLabelText('Disponibles seulement')).toBeInTheDocument();
      expect(panel.getByLabelText('Trier par')).toBeInTheDocument();
      expect(panel.getByLabelText('Regrouper')).toBeInTheDocument();
    },
  );

  it('propose une pastille de couleur pour chaque couleur', () => {
    renderApp('/garde-robe', { wardrobe: WARDROBE });
    const group = within(colorGroup());
    expect(group.getByText('Bleu')).toBeInTheDocument();
    expect(group.getByText('Rouge')).toBeInTheDocument();
    expect(group.getByText('Bordeaux')).toBeInTheDocument();
    expect(group.getByText('Bleu marine')).toBeInTheDocument();
    expect(group.queryByText('Multicolore')).not.toBeInTheDocument();
  });

  it('affiche les pièces des deux couleurs cochées (OU entre couleurs)', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.click(filtersSummary());
    await user.click(within(colorGroup()).getByText('Bleu'));
    expect(isShown('T-shirt')).toBe(true);
    expect(isShown('Écharpe')).toBe(false);

    await user.click(within(colorGroup()).getByText('Rouge'));
    expect(isShown('T-shirt')).toBe(true);
    expect(isShown('Écharpe')).toBe(true);
    expect(isShown('Baskets')).toBe(false);
    expect(isShown('Cabas')).toBe(false);
  });

  it('décocher une couleur la retire du filtre', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.click(filtersSummary());
    await user.click(within(colorGroup()).getByText('Bleu'));
    await user.click(within(colorGroup()).getByText('Rouge'));
    await user.click(within(colorGroup()).getByText('Bleu'));
    expect(isShown('T-shirt')).toBe(false);
    expect(isShown('Écharpe')).toBe(true);
  });

  it('croise types cochés ET couleurs cochées', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.click(typeChip('Hauts'));
    await user.click(typeChip('Chaussures'));
    await user.click(filtersSummary());
    await user.click(within(colorGroup()).getByText('Bleu'));
    await user.click(within(colorGroup()).getByText('Vert'));
    expect(isShown('T-shirt')).toBe(true);
    expect(isShown('Baskets')).toBe(true);
    expect(isShown('Écharpe')).toBe(false);
    expect(isShown('Cabas')).toBe(false);
  });

  it('filtre par saison et par tag', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.selectOptions(screen.getByLabelText('Saison'), 'Hiver');
    expect(isShown('Écharpe')).toBe(true);
    expect(isShown('T-shirt')).toBe(false);

    await user.selectOptions(screen.getByLabelText('Saison'), 'Été');
    expect(isShown('T-shirt')).toBe(true);
    expect(isShown('Écharpe')).toBe(false);
  });

  it('filtre par tag', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.selectOptions(screen.getByLabelText('Tag'), 'noel');
    expect(isShown('Écharpe')).toBe(true);
    expect(isShown('T-shirt')).toBe(false);
  });

  it('ne propose pas de select « Tag » quand aucune pièce n’a de tag', () => {
    renderApp('/garde-robe', { wardrobe: [BLUE_TEE, GREEN_SNEAKERS] });
    expect(screen.queryByLabelText('Tag')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Saison')).toBeInTheDocument();
  });

  it('n’affiche aucune pastille numérique sans filtre', () => {
    renderApp('/garde-robe', { wardrobe: WARDROBE });
    expect(summaryText()).toBe('Filtres');
  });

  it.skipIf(!SHOW_AVAILABILITY)(
    'affiche le nombre de filtres actifs sur « Filtres » (couleurs = 1)',
    async () => {
      const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
      await user.click(filtersSummary());
      await user.click(within(colorGroup()).getByText('Bleu'));
      expect(summaryText()).toBe('Filtres 1');

      await user.click(within(colorGroup()).getByText('Rouge'));
      expect(summaryText()).toBe('Filtres 1');

      await user.selectOptions(screen.getByLabelText('Saison'), 'Hiver');
      expect(summaryText()).toBe('Filtres 2');

      await user.click(screen.getByLabelText('Mes favoris seulement'));
      expect(summaryText()).toBe('Filtres 3');

      await user.click(screen.getByLabelText('Disponibles seulement'));
      expect(summaryText()).toBe('Filtres 4');

      await user.selectOptions(screen.getByLabelText('Tag'), 'noel');
      expect(summaryText()).toBe('Filtres 5');
    },
  );

  it('ne compte pas la recherche dans la pastille numérique', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.type(screen.getByLabelText('Rechercher'), 'cabas');
    expect(summaryText()).toBe('Filtres');
  });

  it('expose le nombre de filtres dans le nom accessible du résumé', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.click(filtersSummary());
    await user.click(screen.getByLabelText('Mes favoris seulement'));
    expect(filtersSummary()).toHaveTextContent(/Filtres\s*1/);
  });

  it('n’affiche « Effacer les filtres » que lorsqu’un filtre est actif', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    expect(screen.queryByRole('button', { name: 'Effacer les filtres' })).not.toBeInTheDocument();
    await user.click(filtersSummary());
    await user.click(within(colorGroup()).getByText('Bleu'));
    expect(screen.getByRole('button', { name: 'Effacer les filtres' })).toBeInTheDocument();
  });

  it('« Effacer les filtres » remet tout à zéro', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.click(typeChip('Chaussures'));
    await user.click(filtersSummary());
    await user.click(within(colorGroup()).getByText('Vert'));
    await user.click(within(colorGroup()).getByText('Bleu'));
    await user.selectOptions(screen.getByLabelText('Saison'), 'Été');
    await user.click(screen.getByLabelText('Mes favoris seulement'));
    expect(screen.getByText('Aucune pièce trouvée')).toBeInTheDocument();

    const [clear] = screen.getAllByRole('button', { name: 'Effacer les filtres' });
    await user.click(clear);

    expect(summaryText()).toBe('Filtres');
    expect(typeChip('Tous')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Saison')).toHaveValue('');
    expect(screen.getByLabelText('Mes favoris seulement')).not.toBeChecked();
    expect(isShown('Écharpe')).toBe(true);
    expect(isShown('Baskets')).toBe(true);
    expect(screen.queryByRole('button', { name: 'Effacer les filtres' })).not.toBeInTheDocument();
  });
});

describe('Barre d’outils : tri et regroupement', () => {
  it('regroupe par type par défaut, sans regroupement par rangement', () => {
    renderApp('/garde-robe', { wardrobe: WARDROBE });
    expect(screen.getByLabelText('Regrouper')).toHaveValue('type');
    expect(screen.getByRole('heading', { name: 'Chaussures' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sacs' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Armoire' })).not.toBeInTheDocument();
    expect(screen.queryByText('Par rangement')).not.toBeInTheDocument();
  });

  it('propose seulement « Par type » et « Sans regroupement »', () => {
    renderApp('/garde-robe', { wardrobe: WARDROBE });
    expect(optionLabels(screen.getByLabelText('Regrouper'))).toEqual([
      'Par type',
      'Sans regroupement',
    ]);
  });

  it('supprime les titres de groupe avec « Sans regroupement »', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.selectOptions(screen.getByLabelText('Regrouper'), 'Sans regroupement');
    expect(screen.queryByRole('heading', { name: 'Chaussures' })).not.toBeInTheDocument();
    expect(isShown('Baskets')).toBe(true);
  });

  it('limite les regroupements des envies à « Par type » et « Sans regroupement »', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: [...WARDROBE, WISH_WATCH, WISH_RING] });
    await user.click(screen.getByRole('button', { name: /Mes envies/ }));
    expect(optionLabels(screen.getByLabelText('Regrouper'))).toEqual([
      'Par type',
      'Sans regroupement',
    ]);
    expect(isShown('Montre dorée')).toBe(true);
    expect(isShown('Écharpe')).toBe(false);
  });

  it('trie les pièces avec « Trier par »', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.selectOptions(screen.getByLabelText('Regrouper'), 'Sans regroupement');
    await user.selectOptions(screen.getByLabelText('Trier par'), 'Nom (A → Z)');
    const titles = screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);
    expect(titles).toEqual(['Baskets', 'Cabas', 'Écharpe', 'T-shirt']);
  });
});

describe('Barre d’outils : recherche façon Vinted', () => {
  it('affiche le placeholder et la loupe', () => {
    renderApp('/garde-robe', { wardrobe: WARDROBE });
    expect(screen.getByLabelText('Rechercher')).toHaveAttribute(
      'placeholder',
      'Rechercher un article, une marque, une couleur…',
    );
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('trouve une pièce par le nom de sa couleur', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.type(screen.getByLabelText('Rechercher'), 'bleu');
    expect(isShown('T-shirt')).toBe(true);
    expect(isShown('Écharpe')).toBe(false);
    expect(isShown('Baskets')).toBe(false);
  });

  it('trouve une pièce par le nom de son type, accents et casse ignorés', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.type(screen.getByLabelText('Rechercher'), 'CHAUSSURES');
    expect(isShown('Baskets')).toBe(true);
    expect(isShown('Cabas')).toBe(false);
  });

  it('cache « Effacer la recherche » tant que le champ est vide', () => {
    renderApp('/garde-robe', { wardrobe: WARDROBE });
    expect(screen.queryByRole('button', { name: 'Effacer la recherche' })).not.toBeInTheDocument();
  });

  it('affiche « Effacer la recherche » dès qu’il y a du texte, puis vide le champ', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.type(screen.getByLabelText('Rechercher'), 'bleu');
    expect(isShown('Écharpe')).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Effacer la recherche' }));
    expect(screen.getByLabelText('Rechercher')).toHaveValue('');
    expect(isShown('Écharpe')).toBe(true);
    expect(screen.queryByRole('button', { name: 'Effacer la recherche' })).not.toBeInTheDocument();
  });
});

describe('Barre d’outils : mode « Sélectionner » unique', () => {
  it('n’a plus de bouton « Modifier » mais un bouton « Sélectionner »', () => {
    renderApp('/garde-robe', { wardrobe: WARDROBE });
    expect(screen.queryByRole('button', { name: 'Modifier' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sélectionner' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('bascule « Sélectionner » en « Terminer »', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.click(screen.getByRole('button', { name: 'Sélectionner' }));
    const finish = screen.getByRole('button', { name: 'Terminer' });
    expect(finish).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Sélectionner Écharpe')).toBeInTheDocument();

    await user.click(finish);
    expect(screen.queryByLabelText('Sélectionner Écharpe')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sélectionner' })).toBeInTheDocument();
  });

  it('les cartes n’ont plus d’outils de modification ni de retrait', () => {
    renderApp('/garde-robe', { wardrobe: WARDROBE });
    expect(screen.queryByRole('link', { name: 'Modifier Écharpe' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Retirer Écharpe de ma garde-robe' }),
    ).not.toBeInTheDocument();
  });

  it('ouvre toujours la fiche en cliquant sur le titre de la carte', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.click(screen.getByRole('link', { name: 'Écharpe' }));
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Écharpe')).toBeInTheDocument();
  });

  it('propose l’action « Statut » avec « Choisir… » en première option', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: WARDROBE });
    await user.click(screen.getByRole('button', { name: 'Sélectionner' }));
    expect(screen.queryByLabelText('Statut')).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('Sélectionner Écharpe'));

    const labels = optionLabels(screen.getByLabelText('Statut'));
    expect(labels[0]).toBe('Choisir…');
    expect(labels).toContain("Je l'ai");
    expect(labels).toContain('Envie');
  });

  it('passe une envie en « Je l’ai » pour toute la sélection', async () => {
    const { user } = renderApp('/garde-robe', {
      wardrobe: [RED_SCARF, WISH_WATCH, WISH_RING],
    });
    await user.click(screen.getByRole('button', { name: /Mes envies/ }));
    await user.click(screen.getByRole('button', { name: 'Sélectionner' }));
    await user.click(screen.getByLabelText('Sélectionner Montre dorée'));
    await user.click(screen.getByLabelText('Sélectionner Bague argent'));
    await user.selectOptions(screen.getByLabelText('Statut'), OwnershipStatus.Owned);

    expect(readStoredWardrobe().map((item) => item.status)).toEqual([
      OwnershipStatus.Owned,
      OwnershipStatus.Owned,
      OwnershipStatus.Owned,
    ]);
    expect(isShown('Montre dorée')).toBe(false);
    expect(isShown('Bague argent')).toBe(false);
  });

  it('ne change que les pièces sélectionnées', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: [WISH_WATCH, WISH_RING] });
    await user.click(screen.getByRole('button', { name: /Mes envies/ }));
    await user.click(screen.getByRole('button', { name: 'Sélectionner' }));
    await user.click(screen.getByLabelText('Sélectionner Montre dorée'));
    await user.selectOptions(screen.getByLabelText('Statut'), OwnershipStatus.Owned);

    expect(readStoredWardrobe().map((item) => item.status)).toEqual([
      OwnershipStatus.Owned,
      OwnershipStatus.Wanted,
    ]);
  });

  it('ne modifie rien tant que « Choisir… » est sélectionné', async () => {
    const { user } = renderApp('/garde-robe', { wardrobe: [WISH_WATCH] });
    await user.click(screen.getByRole('button', { name: /Mes envies/ }));
    await user.click(screen.getByRole('button', { name: 'Sélectionner' }));
    await user.click(screen.getByLabelText('Sélectionner Montre dorée'));
    expect(screen.getByLabelText('Statut')).toHaveValue('');
    expect(readStoredWardrobe()[0].status).toBe(OwnershipStatus.Wanted);
  });
});

describe('Barre d’outils : disposition', () => {
  it('place onglets, recherche, pastilles puis « Filtres » et « Sélectionner » dans cet ordre', () => {
    renderApp('/garde-robe', { wardrobe: WARDROBE });
    const tabs = screen.getByRole('button', { name: /Mes pièces/ });
    const search = screen.getByLabelText('Rechercher');
    const chips = typeChips();
    const filters = filtersSummary();
    const select = screen.getByRole('button', { name: 'Sélectionner' });
    const inDocumentOrder = [tabs, search, chips, filters, select];

    inDocumentOrder.slice(1).forEach((element, index) => {
      const previous = inDocumentOrder[index];
      expect(previous.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });
  });
});
