import { EDIT_PIECE_FORM_LABELS } from '../../constants/pieceForm';
import { useEditPiece } from '../../hooks/useEditPiece';
import { OwnershipStatus } from '../../../wardrobe/constants/wardrobe';
import type { WardrobeItem } from '../../../wardrobe/types/wardrobe';
import { toPieceFormValues } from '../../utils/pieceFormValues';
import { Disclosure } from '../../../../shared/ui/Disclosure/Disclosure';
import { PageHeader } from '../../../../shared/ui/PageHeader/PageHeader';
import { formatPieceName } from '../../../../shared/utils/format';
import { BeforeBuyingSection } from '../BeforeBuying/BeforeBuyingSection';
import { ArchivePieceSection } from '../ArchivePiece/ArchivePieceSection';
import { DeletePieceSection } from '../DeletePiece/DeletePieceSection';
import { PieceWearCostSection } from '../PieceWearCost/PieceWearCostSection';
import { PieceOutfitsSection } from '../PieceOutfits/PieceOutfitsSection';
import { PieceFormWorkspace } from '../PieceFormWorkspace/PieceFormWorkspace';
import styles from './EditPieceContent.module.css';

interface EditPieceContentProps {
  item: WardrobeItem;
}

export function EditPieceContent({ item }: EditPieceContentProps) {
  const savePiece = useEditPiece(item);

  return (
    <>
      <PageHeader title="Modifier la pièce" subtitle={formatPieceName(item.piece.title)} />
      <PieceFormWorkspace
        initialValues={toPieceFormValues(item)}
        labels={EDIT_PIECE_FORM_LABELS}
        onSave={savePiece}
        shouldResetOnSuccess={false}
      />
      <section className={styles.infos} aria-labelledby="piece-infos-title">
        <h2 id="piece-infos-title" className={styles.infosTitle}>
          Infos
        </h2>
        {item.status === OwnershipStatus.Owned && <PieceWearCostSection piece={item.piece} />}
        {item.status === OwnershipStatus.Wanted && <BeforeBuyingSection item={item} />}
        <PieceOutfitsSection item={item} />
      </section>
      <Disclosure summary="Plus d’actions" className={styles.moreActions}>
        {item.status === OwnershipStatus.Owned && <ArchivePieceSection piece={item.piece} />}
        <DeletePieceSection piece={item.piece} />
      </Disclosure>
    </>
  );
}
