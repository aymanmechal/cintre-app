import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PieceType } from '../../../shared/pieces/constants/categories';
import { PieceColor } from '../../../shared/pieces/constants/colors';
import { makeOutfit, makeWardrobeItem } from '../../../test/factories';
import { openMyOutfitsTab, openOutfitMenu } from '../../../test/outfitsNavigation';
import { renderApp } from '../../../test/renderApp';

const SHIRT = makeWardrobeItem({ id: 1, title: 'Chemise lin', color: PieceColor.Blue, price: 40 });
const JEANS = makeWardrobeItem({
  id: 2,
  title: 'Jean brut',
  pieceType: PieceType.Bottoms,
  color: PieceColor.Black,
  price: 80,
});
const SHORTS = makeWardrobeItem({
  id: 3,
  title: 'Short beige',
  pieceType: PieceType.Bottoms,
  color: PieceColor.Beige,
  price: 30,
});
const SNEAKERS = makeWardrobeItem({
  id: 4,
  title: 'Baskets',
  pieceType: PieceType.Shoes,
  color: PieceColor.White,
  price: 100,
});
const WARDROBE = [SHIRT, JEANS, SHORTS, SNEAKERS];
const OUTFITS = [
  makeOutfit({ id: 'a', name: 'Ville', pieceIds: [1, 2], score: 4 }),
  makeOutfit({ id: 'b', name: 'Plage', pieceIds: [1, 3] }),
  makeOutfit({ id: 'c', name: 'Sport', pieceIds: [3, 4] }),
  makeOutfit({ id: 'd', name: 'Soir', pieceIds: [2, 4] }),
];

function list(): HTMLElement {
  return screen.getByRole('region', { name: /^Mes tenues/ });
}

describe('Tenues : harmonie des couleurs expliquée', () => {
  it('explique les couleurs sur chaque tenue', async () => {
    const { user } = renderApp('/tenues', { wardrobe: WARDROBE, outfits: [OUTFITS[0]] });
    await openMyOutfitsTab(user);
    expect(within(list()).getByText('Une touche de couleur')).toBeInTheDocument();
    expect(within(list()).getByText(/Une seule couleur vive \(bleu\)/)).toBeInTheDocument();
  });

  it('explique les couleurs de la tenue en cours de création', async () => {
    const { user } = renderApp('/tenues', { wardrobe: WARDROBE });
    const shelf = screen.getByRole('region', { name: 'Choisis ton haut' });
    await user.click(within(shelf).getByRole('button', { name: /Chemise lin/ }));
    await user.click(
      within(screen.getByRole('region', { name: 'Choisis ton bas' })).getByRole('button', {
        name: /Jean brut/,
      }),
    );
    const preview = screen.getByRole('complementary');
    expect(within(preview).getByText(/Une seule couleur vive \(bleu\)/)).toBeInTheDocument();
  });
});

describe('Tenues : je garde ces pièces', () => {
  it('ouvre des idées autour de toutes les pièces choisies', async () => {
    const { user } = renderApp('/tenues', { wardrobe: WARDROBE });
    const shelf = screen.getByRole('region', { name: 'Choisis ton haut' });
    await user.click(within(shelf).getByRole('button', { name: /Chemise lin/ }));
    await user.click(
      within(screen.getByRole('region', { name: 'Choisis ton bas' })).getByRole('button', {
        name: /Jean brut/,
      }),
    );
    await user.click(screen.getByRole('link', { name: /Je garde 2 pièces/ }));

    expect(screen.getByText(/Autour de « CHEMISE LIN » \+ « JEAN BRUT »/)).toBeInTheDocument();
    expect(screen.getAllByRole('article', { name: /^Idée/ })).toHaveLength(1);
  });

  it('ne propose pas le lien quand rien n’est choisi', () => {
    renderApp('/tenues', { wardrobe: WARDROBE });
    expect(screen.queryByRole('link', { name: /Je garde/ })).not.toBeInTheDocument();
  });

  it('accepte plusieurs pièces dans l’adresse', () => {
    renderApp('/tenues/idees/1,4', { wardrobe: WARDROBE });
    expect(screen.getAllByRole('article', { name: /^Idée/ })).toHaveLength(2);
  });

  it('prévient quand une des pièces n’existe pas', () => {
    renderApp('/tenues/idees/1,99', { wardrobe: WARDROBE });
    expect(screen.getByText('Pièce introuvable')).toBeInTheDocument();
  });

  it('prévient quand les pièces ne vont pas ensemble', () => {
    renderApp('/tenues/idees/2,3', { wardrobe: WARDROBE });
    expect(screen.getByText("Plus d'idée pour l'instant")).toBeInTheDocument();
  });
});

describe('Tenues : comparer', () => {
  it('compare deux tenues côte à côte', async () => {
    const { user } = renderApp('/tenues', { wardrobe: WARDROBE, outfits: OUTFITS });
    await openMyOutfitsTab(user);
    await openOutfitMenu(user, 'Ville');
    await user.click(screen.getByLabelText('Comparer Ville'));
    expect(screen.queryByRole('region', { name: 'Comparer mes tenues' })).not.toBeInTheDocument();
    await openOutfitMenu(user, 'Plage');
    await user.click(screen.getByLabelText('Comparer Plage'));

    const comparison = screen.getByRole('region', { name: 'Comparer mes tenues' });
    const ville = within(comparison).getByRole('article', { name: 'Comparaison : Ville' });
    expect(within(ville).getByText('120,00 €', { exact: false })).toBeInTheDocument();
    expect(within(ville).getByText('4/5')).toBeInTheDocument();
    const plage = within(comparison).getByRole('article', { name: 'Comparaison : Plage' });
    expect(within(plage).getByText('Pas encore notée')).toBeInTheDocument();
  });

  it('limite la comparaison à trois tenues', async () => {
    const { user } = renderApp('/tenues', { wardrobe: WARDROBE, outfits: OUTFITS });
    await openMyOutfitsTab(user);
    await openOutfitMenu(user, 'Ville');
    await user.click(screen.getByLabelText('Comparer Ville'));
    await openOutfitMenu(user, 'Plage');
    await user.click(screen.getByLabelText('Comparer Plage'));
    await openOutfitMenu(user, 'Sport');
    await user.click(screen.getByLabelText('Comparer Sport'));

    await openOutfitMenu(user, 'Soir');
    expect(screen.getByLabelText('Comparer Soir')).toBeDisabled();
    expect(screen.getByLabelText('Comparer Sport')).toBeEnabled();
  });

  it('ferme la comparaison', async () => {
    const { user } = renderApp('/tenues', { wardrobe: WARDROBE, outfits: OUTFITS });
    await openMyOutfitsTab(user);
    await openOutfitMenu(user, 'Ville');
    await user.click(screen.getByLabelText('Comparer Ville'));
    await openOutfitMenu(user, 'Plage');
    await user.click(screen.getByLabelText('Comparer Plage'));
    await user.click(screen.getByRole('button', { name: 'Fermer la comparaison' }));

    expect(screen.queryByRole('region', { name: 'Comparer mes tenues' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Comparer Ville')).not.toBeChecked();
  });
});
