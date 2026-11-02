import type { CompatibilityNode } from '../../types/compatibility';
import { formatPossibleOutfits, groupPartnersBySlot } from '../../utils/compatibility';
import { OUTFIT_SLOT_LABELS } from '../../../outfits/constants/outfits';
import { OutfitPieceThumbnail } from '../../../outfits/components/OutfitCard/OutfitPieceThumbnail';
import { buildOutfitIdeasUrl } from '../../../../shared/routes';
import { ButtonLink } from '../../../../shared/ui/Button/ButtonLink';
import { SelectField } from '../../../../shared/ui/Form/SelectField';
import { formatPieceCount, formatPieceName } from '../../../../shared/utils/format';
import styles from './PieceLinks.module.css';

interface PieceLinksProps {
  nodes: readonly CompatibilityNode[];
  chosenNode: CompatibilityNode;
  onChoose: (pieceId: number) => void;
}

export function PieceLinks({ nodes, chosenNode, onChoose }: PieceLinksProps) {
  const { piece } = chosenNode.item;
  const options = nodes.map((node) => ({
    value: String(node.item.piece.id),
    label: formatPieceName(node.item.piece.title),
  }));

  return (
    <section className={styles.section} aria-labelledby="piece-links-title">
      <h2 id="piece-links-title" className={styles.title}>
        Avec quoi ça va ?
      </h2>
      <SelectField
        id="compatibility-piece"
        label="Pièce"
        value={String(piece.id)}
        options={options}
        onChange={(value) => onChoose(Number(value))}
      />
      <p className={styles.summary} aria-live="polite">
        {formatPieceName(piece.title)} va avec {formatPieceCount(chosenNode.partners.length)} :{' '}
        {formatPossibleOutfits(chosenNode.outfitCount).toLowerCase()}.
      </p>
      {groupPartnersBySlot(chosenNode).map((group) => (
        <div key={group.slot} className={styles.group}>
          <h3 className={styles.slot}>{OUTFIT_SLOT_LABELS[group.slot]}</h3>
          <ul className={styles.partners}>
            {group.items.map((item) => (
              <li key={item.piece.id}>
                <OutfitPieceThumbnail item={item} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      {chosenNode.outfitCount > 0 && (
        <ButtonLink className={styles.ideas} to={buildOutfitIdeasUrl(piece.id)}>
          Voir les idées de tenues
        </ButtonLink>
      )}
    </section>
  );
}
