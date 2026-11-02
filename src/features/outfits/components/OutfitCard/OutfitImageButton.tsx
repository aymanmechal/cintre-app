import { useOutfitImageExport } from '../../hooks/useOutfitImageExport';
import type { Outfit } from '../../types/outfit';
import type { WardrobeItem } from '../../../wardrobe/types/wardrobe';
import { Button, ButtonVariant } from '../../../../shared/ui/Button/Button';

interface OutfitImageButtonProps {
  outfit: Outfit;
  outfitItems: readonly WardrobeItem[];
  className?: string;
}

export function OutfitImageButton({ outfit, outfitItems, className }: OutfitImageButtonProps) {
  const { isExporting, errorMessage, exportImage } = useOutfitImageExport(outfit, outfitItems);

  return (
    <>
      <Button
        variant={ButtonVariant.Action}
        className={className}
        disabled={isExporting}
        aria-label={`Enregistrer la tenue ${outfit.name} en image`}
        onClick={exportImage}
      >
        {isExporting ? 'Création…' : 'En image'}
      </Button>
      {errorMessage !== null && <span role="alert">{errorMessage}</span>}
    </>
  );
}
