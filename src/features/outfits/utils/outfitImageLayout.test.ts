import { describe, expect, it } from 'vitest';
import {
  OUTFIT_IMAGE_COLUMNS,
  OUTFIT_IMAGE_PADDING,
  OUTFIT_IMAGE_TILE_SIZE,
} from '../constants/outfitImage';
import { buildOutfitImageFileName, buildOutfitImageLayout, fitContain } from './outfitImageLayout';

describe('buildOutfitImageLayout', () => {
  it('place les pièces sur deux colonnes', () => {
    const layout = buildOutfitImageLayout(3);
    expect(layout.tiles).toHaveLength(3);
    expect(layout.tiles[0].y).toBe(layout.tiles[1].y);
    expect(layout.tiles[2].y).toBeGreaterThan(layout.tiles[0].y);
    expect(layout.tiles[2].x).toBe(OUTFIT_IMAGE_PADDING);
    expect(OUTFIT_IMAGE_COLUMNS).toBe(2);
  });

  it('rétrécit l’image pour une seule pièce', () => {
    const single = buildOutfitImageLayout(1);
    expect(single.width).toBe(2 * OUTFIT_IMAGE_PADDING + OUTFIT_IMAGE_TILE_SIZE);
    expect(single.width).toBeLessThan(buildOutfitImageLayout(2).width);
  });

  it('grandit avec chaque ligne', () => {
    expect(buildOutfitImageLayout(4).height).toBeGreaterThan(buildOutfitImageLayout(2).height);
    expect(buildOutfitImageLayout(4).height).toBe(buildOutfitImageLayout(3).height);
  });
});

describe('fitContain', () => {
  it('garde la photo entière, sans rogner, centrée dans la case', () => {
    expect(fitContain(200, 100, 100)).toEqual({ x: 0, y: 25, width: 100, height: 50 });
    expect(fitContain(100, 200, 100)).toEqual({ x: 25, y: 0, width: 50, height: 100 });
  });
});

describe('buildOutfitImageFileName', () => {
  it('fabrique un nom de fichier propre', () => {
    expect(buildOutfitImageFileName('Soirée d’été !')).toBe('soiree-d-ete.png');
    expect(buildOutfitImageFileName('???')).toBe('tenue.png');
  });
});
