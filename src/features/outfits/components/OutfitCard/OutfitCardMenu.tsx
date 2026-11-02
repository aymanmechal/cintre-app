import type { Outfit } from '../../types/outfit';
import type { WardrobeItem } from '../../../wardrobe/types/wardrobe';
import { ShareOutfitsButton } from '../../../sharing/components/ShareOutfitsButton/ShareOutfitsButton';
import { useCanShare } from '../../../sharing/hooks/useCanShare';
import { CompareOutfitToggle } from './CompareOutfitToggle';
import { DeleteOutfitButton } from './DeleteOutfitButton';
import { OutfitImageButton } from './OutfitImageButton';
import { OutfitNotes } from './OutfitNotes';
import { OutfitOccasionField } from './OutfitOccasionField';
import styles from './OutfitCardMenu.module.css';

interface OutfitCardMenuProps {
  outfit: Outfit;
  outfitItems: readonly WardrobeItem[];
  isCompared: boolean;
  canCompare: boolean;
  onToggleCompare: () => void;
}

export function OutfitCardMenu({
  outfit,
  outfitItems,
  isCompared,
  canCompare,
  onToggleCompare,
}: OutfitCardMenuProps) {
  const canShare = useCanShare();

  return (
    <details className={styles.menu}>
      <summary
        className={styles.summary}
        aria-label={`Plus d’actions pour la tenue ${outfit.name}`}
      >
        ⋯
      </summary>
      <div className={styles.content}>
        <OutfitOccasionField outfit={outfit} />
        <OutfitNotes outfit={outfit} />
        <div className={styles.exports}>
          <OutfitImageButton
            outfit={outfit}
            outfitItems={outfitItems}
            className={styles.exportButton}
          />
          {canShare && (
            <ShareOutfitsButton
              entries={[{ outfit, items: outfitItems }]}
              label="Partager"
              accessibleLabel={`Partager la tenue ${outfit.name}`}
              className={styles.exportButton}
            />
          )}
        </div>
        <div className={styles.actions}>
          <CompareOutfitToggle
            outfit={outfit}
            isCompared={isCompared}
            canCompare={canCompare}
            onToggle={onToggleCompare}
          />
          <DeleteOutfitButton outfitId={outfit.id} outfitName={outfit.name} />
        </div>
      </div>
    </details>
  );
}
