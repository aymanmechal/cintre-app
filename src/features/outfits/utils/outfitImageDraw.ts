import {
  OUTFIT_IMAGE_BACKGROUND,
  OUTFIT_IMAGE_BRAND_COLOR,
  OUTFIT_IMAGE_CAPTION_HEIGHT,
  OUTFIT_IMAGE_FONT,
  OUTFIT_IMAGE_INK,
  OUTFIT_IMAGE_PADDING,
  OUTFIT_IMAGE_TILE_COLORS,
  OUTFIT_IMAGE_TILE_SIZE,
} from '../constants/outfitImage';
import type { Outfit } from '../types/outfit';
import { buildOutfitImageLayout, fitCover } from './outfitImageLayout';
import { formatPieceName } from '../../../shared/utils/format';
import type { WardrobeItem } from '../../wardrobe/types/wardrobe';
import { loadPhoto } from '../../../shared/photos/utils/photoStore';
import type { Piece } from '../../../shared/pieces/types/piece';

const CAPTION_FONT_SIZE = 26;

async function findImageSource(piece: Piece): Promise<string> {
  const photo = piece.photoId === null ? undefined : await loadPhoto(piece.photoId);
  return photo ?? piece.thumbnail;
}

function loadImage(source: string): Promise<HTMLImageElement | null> {
  if (source === '') return Promise.resolve(null);
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

async function loadPieceImage(piece: Piece): Promise<HTMLImageElement | null> {
  return loadImage(await findImageSource(piece));
}

function drawTile(
  context: CanvasRenderingContext2D,
  item: WardrobeItem,
  image: HTMLImageElement | null,
  x: number,
  y: number,
) {
  const size = OUTFIT_IMAGE_TILE_SIZE;
  context.save();
  context.beginPath();
  context.roundRect(x, y, size, size, 36);
  context.clip();
  context.fillStyle = OUTFIT_IMAGE_TILE_COLORS[item.piece.pieceType];
  context.fillRect(x, y, size, size);
  if (image !== null) {
    const rect = fitCover(image.naturalWidth, image.naturalHeight, size);
    context.drawImage(image, x + rect.x, y + rect.y, rect.width, rect.height);
  }
  context.restore();
  context.fillStyle = OUTFIT_IMAGE_INK;
  context.font = `600 ${CAPTION_FONT_SIZE}px ${OUTFIT_IMAGE_FONT}`;
  context.fillText(
    formatPieceName(item.piece.title),
    x,
    y + size + OUTFIT_IMAGE_CAPTION_HEIGHT * 0.65,
    size,
  );
}

export async function drawOutfitImage(
  canvas: HTMLCanvasElement,
  outfit: Outfit,
  items: readonly WardrobeItem[],
): Promise<void> {
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('Canvas indisponible');
  const layout = buildOutfitImageLayout(items.length);
  const images = await Promise.all(items.map((item) => loadPieceImage(item.piece)));
  canvas.width = layout.width;
  canvas.height = layout.height;

  context.fillStyle = OUTFIT_IMAGE_BACKGROUND;
  context.fillRect(0, 0, layout.width, layout.height);
  context.fillStyle = OUTFIT_IMAGE_INK;
  context.font = `800 64px ${OUTFIT_IMAGE_FONT}`;
  context.fillText(outfit.name, OUTFIT_IMAGE_PADDING, 88, layout.width - 2 * OUTFIT_IMAGE_PADDING);
  items.forEach((item, index) =>
    drawTile(context, item, images[index], layout.tiles[index].x, layout.tiles[index].y),
  );
  context.fillStyle = OUTFIT_IMAGE_BRAND_COLOR;
  context.font = `800 44px ${OUTFIT_IMAGE_FONT}`;
  context.fillText('Cintré', OUTFIT_IMAGE_PADDING, layout.height - 32);
}
