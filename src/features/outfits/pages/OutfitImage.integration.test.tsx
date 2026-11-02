import { screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeOutfit, makeWardrobeItem } from '../../../test/factories';
import { openMyOutfitsTab, openOutfitMenu } from '../../../test/outfitsNavigation';
import { renderApp } from '../../../test/renderApp';

const WARDROBE = [makeWardrobeItem({ id: 1 }), makeWardrobeItem({ id: 2, title: 'Jean' })];
const OUTFITS = [makeOutfit({ id: 'a', name: 'Cosy', pieceIds: [1, 2] })];

class BrokenImage {
  onerror: (() => void) | null = null;
  set src(_source: string) {
    queueMicrotask(() => this.onerror?.());
  }
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Tenue en image', () => {
  it('prévient quand l’image ne peut pas être créée', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const { user } = renderApp('/tenues', { wardrobe: WARDROBE, outfits: OUTFITS });
    await openMyOutfitsTab(user);
    await openOutfitMenu(user, 'Cosy');
    await user.click(screen.getByRole('button', { name: 'Enregistrer la tenue Cosy en image' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Impossible de créer l’image');
  });

  it('télécharge l’image png de la tenue', async () => {
    vi.stubGlobal('Image', BrokenImage);
    const context = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      roundRect: vi.fn(),
      clip: vi.fn(),
      fillRect: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
      drawImage: vi.fn(),
      measureText: vi.fn((text: string) => ({ width: text.length * 10 })),
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) =>
      callback(new Blob(['png'], { type: 'image/png' })),
    );
    URL.createObjectURL = vi.fn(() => 'blob:test');
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const { user } = renderApp('/tenues', { wardrobe: WARDROBE, outfits: OUTFITS });
    await openMyOutfitsTab(user);
    await openOutfitMenu(user, 'Cosy');
    await user.click(screen.getByRole('button', { name: 'Enregistrer la tenue Cosy en image' }));

    await waitFor(() => expect(click).toHaveBeenCalled());
    expect(context.fillText).toHaveBeenCalledWith(
      'Cosy',
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
    );
  });
});
