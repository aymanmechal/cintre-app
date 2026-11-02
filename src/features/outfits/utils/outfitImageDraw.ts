import {
  OUTFIT_IMAGE_BACKGROUND,
  OUTFIT_IMAGE_BRAND_COLOR,
  OUTFIT_IMAGE_CAPTION_HEIGHT,
  OUTFIT_IMAGE_CARD_COLOR,
  OUTFIT_IMAGE_CARD_RADIUS,
  OUTFIT_IMAGE_FONT,
  OUTFIT_IMAGE_INK,
  OUTFIT_IMAGE_MUTED_INK,
  OUTFIT_IMAGE_PADDING,
  OUTFIT_IMAGE_PHOTO_PADDING,
  OUTFIT_IMAGE_SHADOW_COLOR,
  OUTFIT_IMAGE_TILE_SIZE,
} from '../constants/outfitImage';
import type { Outfit } from '../types/outfit';
import { buildOutfitImageLayout, fitContain } from './outfitImageLayout';
import { formatPieceCount, formatPieceName } from '../../../shared/utils/format';
import type { WardrobeItem } from '../../wardrobe/types/wardrobe';
import { loadPhoto } from '../../../shared/photos/utils/photoStore';
import type { Piece } from '../../../shared/pieces/types/piece';

const TITLE_FONT_SIZE = 72;
const SUBTITLE_FONT_SIZE = 30;
const CAPTION_FONT_SIZE = 28;
const BRAND_FONT_SIZE = 46;

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

// Raccourcit le texte avec « … » plutôt que de le couper au milieu d'un mot illisible.
function fitText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (context.measureText(text).width <= maxWidth) return text;
  let shortened = text;
  while (shortened.length > 1 && context.measureText(`${shortened}…`).width > maxWidth) {
    shortened = shortened.slice(0, -1);
  }
  return `${shortened.trimEnd()}…`;
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
  context.shadowColor = OUTFIT_IMAGE_SHADOW_COLOR;
  context.shadowBlur = 28;
  context.shadowOffsetY = 10;
  context.fillStyle = OUTFIT_IMAGE_CARD_COLOR;
  context.beginPath();
  context.roundRect(x, y, size, size, OUTFIT_IMAGE_CARD_RADIUS);
  context.fill();
  context.restore();

  if (image !== null) {
    const area = size - 2 * OUTFIT_IMAGE_PHOTO_PADDING;
    const rect = fitContain(image.naturalWidth, image.naturalHeight, area);
    context.drawImage(
      image,
      x + OUTFIT_IMAGE_PHOTO_PADDING + rect.x,
      y + OUTFIT_IMAGE_PHOTO_PADDING + rect.y,
      rect.width,
      rect.height,
    );
  }

  context.fillStyle = OUTFIT_IMAGE_INK;
  context.font = `600 ${CAPTION_FONT_SIZE}px ${OUTFIT_IMAGE_FONT}`;
  context.fillText(
    fitText(context, formatPieceName(item.piece.title), size),
    x,
    y + size + OUTFIT_IMAGE_CAPTION_HEIGHT * 0.6,
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
  const contentWidth = layout.width - 2 * OUTFIT_IMAGE_PADDING;

  context.fillStyle = OUTFIT_IMAGE_BACKGROUND;
  context.fillRect(0, 0, layout.width, layout.height);

  context.fillStyle = OUTFIT_IMAGE_INK;
  context.font = `800 ${TITLE_FONT_SIZE}px ${OUTFIT_IMAGE_FONT}`;
  context.fillText(
    fitText(context, outfit.name, contentWidth),
    OUTFIT_IMAGE_PADDING,
    110,
    contentWidth,
  );
  context.fillStyle = OUTFIT_IMAGE_MUTED_INK;
  context.font = `500 ${SUBTITLE_FONT_SIZE}px ${OUTFIT_IMAGE_FONT}`;
  context.fillText(formatPieceCount(items.length), OUTFIT_IMAGE_PADDING, 164);

  items.forEach((item, index) =>
    drawTile(context, item, images[index], layout.tiles[index].x, layout.tiles[index].y),
  );

  context.fillStyle = OUTFIT_IMAGE_BRAND_COLOR;
  context.font = `800 ${BRAND_FONT_SIZE}px ${OUTFIT_IMAGE_FONT}`;
  context.fillText('Cintré', OUTFIT_IMAGE_PADDING, layout.height - 52);
}
