import { useWardrobe } from '../../wardrobe/context/useWardrobe';
import type { WardrobeItem } from '../../wardrobe/types/wardrobe';
import { countOutfitsWithWanted, findSimilarOwned } from '../utils/beforeBuying';
import { formatPieceName } from '../../../shared/utils/format';

export interface BeforeBuying {
  similarTitles: string[];
  outfitCount: number;
}

export function useBeforeBuying(wanted: WardrobeItem): BeforeBuying {
  const { items } = useWardrobe();
  return {
    similarTitles: findSimilarOwned(items, wanted).map((item) => formatPieceName(item.piece.title)),
    outfitCount: countOutfitsWithWanted(items, wanted),
  };
}
