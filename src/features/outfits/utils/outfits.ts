import {
  MIN_PIECES_PER_OUTFIT,
  OUTFIT_SLOT_BY_PIECE_TYPE,
  OUTFIT_SLOT_CAPACITY,
  OUTFIT_SLOTS,
  OutfitReadiness,
  OutfitSlot,
} from '../constants/outfits';
import { OwnershipStatus } from '../../wardrobe/constants/wardrobe';
import type { Outfit, OutfitSelection } from '../types/outfit';
import type { WardrobeItem } from '../../wardrobe/types/wardrobe';
import { isWearable } from './combinations';
import { findWardrobeItem } from '../../wardrobe/utils/wardrobe';
import { formatPieceName } from '../../../shared/utils/format';

export function createEmptySelection(): OutfitSelection {
  return {
    [OutfitSlot.Jacket]: [],
    [OutfitSlot.Top]: [],
    [OutfitSlot.Bottom]: [],
    [OutfitSlot.Shoes]: [],
    [OutfitSlot.Accessory]: [],
  };
}

export function selectItemsForSlot(
  items: readonly WardrobeItem[],
  slot: OutfitSlot,
): WardrobeItem[] {
  return items.filter((item) => OUTFIT_SLOT_BY_PIECE_TYPE[item.piece.pieceType] === slot);
}

export function toPieceIds(selection: OutfitSelection): number[] {
  return OUTFIT_SLOTS.flatMap((slot) => selection[slot]);
}

export function formatPieceCount(count: number): string {
  return `${count} pièce${count > 1 ? 's' : ''}`;
}

export function formatOutfitCount(count: number): string {
  return `${count} tenue${count > 1 ? 's' : ''}`;
}

export function formatIdeaCount(count: number): string {
  return `${count} idée${count > 1 ? 's' : ''}`;
}

export function countMissingPieces(selection: OutfitSelection): number {
  return Math.max(MIN_PIECES_PER_OUTFIT - toPieceIds(selection).length, 0);
}

export function buildMissingPiecesHint(missingPieceCount: number): string {
  return `Choisis encore ${formatPieceCount(missingPieceCount)} pour créer la tenue.`;
}

export function findNextEmptySlot(selection: OutfitSelection, currentSlot: OutfitSlot): OutfitSlot {
  const currentIndex = OUTFIT_SLOTS.indexOf(currentSlot);
  const slotsAfterCurrent = [
    ...OUTFIT_SLOTS.slice(currentIndex + 1),
    ...OUTFIT_SLOTS.slice(0, currentIndex),
  ];
  return slotsAfterCurrent.find((slot) => selection[slot].length === 0) ?? currentSlot;
}

function isWardrobeItem(item: WardrobeItem | undefined): item is WardrobeItem {
  return item !== undefined;
}

function resolvePieceIds(
  pieceIds: readonly number[],
  items: readonly WardrobeItem[],
): WardrobeItem[] {
  return pieceIds.map((pieceId) => findWardrobeItem(items, pieceId)).filter(isWardrobeItem);
}

export function resolveOutfitItems(outfit: Outfit, items: readonly WardrobeItem[]): WardrobeItem[] {
  return resolvePieceIds(outfit.pieceIds, items);
}

export function resolveSelectedItems(
  selection: OutfitSelection,
  items: readonly WardrobeItem[],
): WardrobeItem[] {
  return resolvePieceIds(toPieceIds(selection), items);
}

export function selectSlotItems(
  selection: OutfitSelection,
  slot: OutfitSlot,
  items: readonly WardrobeItem[],
): WardrobeItem[] {
  return resolvePieceIds(selection[slot], items);
}

export function isSingleSlot(slot: OutfitSlot): boolean {
  return OUTFIT_SLOT_CAPACITY[slot] === 1;
}

export function canAddAnotherPiece(selection: OutfitSelection, slot: OutfitSlot): boolean {
  const pieceCount = selection[slot].length;
  return pieceCount > 0 && pieceCount < OUTFIT_SLOT_CAPACITY[slot];
}

export function togglePieceInSlot(
  selection: OutfitSelection,
  slot: OutfitSlot,
  pieceId: number,
): OutfitSelection {
  const current = selection[slot];
  if (current.includes(pieceId)) {
    return { ...selection, [slot]: current.filter((id) => id !== pieceId) };
  }
  if (isSingleSlot(slot)) return { ...selection, [slot]: [pieceId] };
  if (current.length >= OUTFIT_SLOT_CAPACITY[slot]) return selection;
  return { ...selection, [slot]: [...current, pieceId] };
}

export function removePieceFromSlot(
  selection: OutfitSelection,
  slot: OutfitSlot,
  pieceId: number,
): OutfitSelection {
  return { ...selection, [slot]: selection[slot].filter((id) => id !== pieceId) };
}

function compareOwnedFirst(first: WardrobeItem, second: WardrobeItem): number {
  const isFirstWanted = Number(first.status === OwnershipStatus.Wanted);
  const isSecondWanted = Number(second.status === OwnershipStatus.Wanted);
  return isFirstWanted - isSecondWanted;
}

export function selectShelfItems(items: readonly WardrobeItem[], slot: OutfitSlot): WardrobeItem[] {
  return selectItemsForSlot(items, slot).sort(compareOwnedFirst);
}

export function selectMissingItems(outfitItems: readonly WardrobeItem[]): WardrobeItem[] {
  return outfitItems.filter((item) => item.status === OwnershipStatus.Wanted);
}

export function getOutfitReadiness(outfitItems: readonly WardrobeItem[]): OutfitReadiness {
  return selectMissingItems(outfitItems).length > 0 ? OutfitReadiness.Goal : OutfitReadiness.Ready;
}

export function sumPrices(outfitItems: readonly WardrobeItem[]): number {
  return outfitItems.reduce((total, item) => total + item.piece.price, 0);
}

export function hasSamePieces(
  outfits: readonly Outfit[],
  pieceIds: readonly number[],
  ignoredOutfitId?: string,
): boolean {
  const key = toPiecesKey(pieceIds);
  return outfits.some(
    (outfit) => outfit.id !== ignoredOutfitId && toPiecesKey(outfit.pieceIds) === key,
  );
}

function toPiecesKey(pieceIds: readonly number[]): string {
  return [...pieceIds].sort((first, second) => first - second).join(',');
}

export function selectionFromItems(items: readonly WardrobeItem[]): OutfitSelection {
  return items.reduce(
    (selection, item) =>
      togglePieceInSlot(selection, OUTFIT_SLOT_BY_PIECE_TYPE[item.piece.pieceType], item.piece.id),
    createEmptySelection(),
  );
}

export function findReplacementPiece(
  outfit: Outfit,
  pieceId: number,
  items: readonly WardrobeItem[],
): WardrobeItem | undefined {
  const current = findWardrobeItem(items, pieceId);
  if (!current) return undefined;
  const slot = OUTFIT_SLOT_BY_PIECE_TYPE[current.piece.pieceType];
  const sameSlotItems = selectItemsForSlot(items, slot);
  const currentIndex = sameSlotItems.indexOf(current);
  const others = [
    ...sameSlotItems.slice(currentIndex + 1),
    ...sameSlotItems.slice(0, currentIndex),
  ];
  return others.find((item) => isWearable(item) && !outfit.pieceIds.includes(item.piece.id));
}

export function replacePieceInOutfit(outfit: Outfit, pieceId: number, newPieceId: number): Outfit {
  const pieceIds = outfit.pieceIds.map((id) => (id === pieceId ? newPieceId : id));
  return { ...outfit, pieceIds };
}

export function createOutfitId(): string {
  return crypto.randomUUID();
}

export function buildDefaultOutfitName(outfitCount: number): string {
  return `Tenue n°${outfitCount + 1}`;
}

export function formatAnchorTitles(anchors: readonly WardrobeItem[]): string {
  return anchors.map((anchor) => `« ${formatPieceName(anchor.piece.title)} »`).join(' + ');
}
