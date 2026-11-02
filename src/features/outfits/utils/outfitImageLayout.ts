import {
  OUTFIT_IMAGE_CAPTION_HEIGHT,
  OUTFIT_IMAGE_COLUMNS,
  OUTFIT_IMAGE_FOOTER_HEIGHT,
  OUTFIT_IMAGE_GAP,
  OUTFIT_IMAGE_HEADER_HEIGHT,
  OUTFIT_IMAGE_PADDING,
  OUTFIT_IMAGE_TILE_SIZE,
} from '../constants/outfitImage';

export interface ImageTile {
  x: number;
  y: number;
}

export interface OutfitImageLayout {
  width: number;
  height: number;
  tiles: ImageTile[];
}

export interface ImageRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function buildOutfitImageLayout(pieceCount: number): OutfitImageLayout {
  const columns = Math.min(Math.max(pieceCount, 1), OUTFIT_IMAGE_COLUMNS);
  const rows = Math.ceil(pieceCount / OUTFIT_IMAGE_COLUMNS);
  const rowHeight = OUTFIT_IMAGE_TILE_SIZE + OUTFIT_IMAGE_CAPTION_HEIGHT + OUTFIT_IMAGE_GAP;
  const tiles = Array.from({ length: pieceCount }, (_, index) => ({
    x:
      OUTFIT_IMAGE_PADDING +
      (index % OUTFIT_IMAGE_COLUMNS) * (OUTFIT_IMAGE_TILE_SIZE + OUTFIT_IMAGE_GAP),
    y: OUTFIT_IMAGE_HEADER_HEIGHT + Math.floor(index / OUTFIT_IMAGE_COLUMNS) * rowHeight,
  }));

  return {
    width:
      2 * OUTFIT_IMAGE_PADDING +
      columns * OUTFIT_IMAGE_TILE_SIZE +
      (columns - 1) * OUTFIT_IMAGE_GAP,
    height: OUTFIT_IMAGE_HEADER_HEIGHT + rows * rowHeight + OUTFIT_IMAGE_FOOTER_HEIGHT,
    tiles,
  };
}

// Affiche la photo en entier (sans rogner) et la centre dans la case.
export function fitContain(imageWidth: number, imageHeight: number, size: number): ImageRect {
  const scale = Math.min(size / imageWidth, size / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return { x: (size - width) / 2, y: (size - height) / 2, width, height };
}

export function buildOutfitImageFileName(outfitName: string): string {
  const slug = outfitName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'tenue'}.png`;
}
