import { SubmitStatus } from '../../constants/pieceForm';
import { useDeletePiece } from '../../hooks/useDeletePiece';
import type { Piece } from '../../../../shared/pieces/types/piece';
import { Button, ButtonVariant } from '../../../../shared/ui/Button/Button';
import { ConfirmDialog } from '../../../../shared/ui/ConfirmDialog/ConfirmDialog';
import { formatOutfitCount } from '../../../outfits/utils/outfits';
import { TRASH_RETENTION_DAYS } from '../../../wardrobe/constants/wardrobe';
import { formatPieceName } from '../../../../shared/utils/format';
import styles from './DeletePieceSection.module.css';

const DELETE_ERROR_MESSAGE = 'Impossible de supprimer la pièce. Réessaie dans un instant.';

function buildDeleteMessage(piece: Piece, outfitCount: number): string {
  const message = `« ${formatPieceName(piece.title)} » ira dans la corbeille. Tu pourras la restaurer pendant ${TRASH_RETENTION_DAYS} jours.`;
  if (outfitCount === 0) return message;
  return `${message} Attention : elle est dans ${formatOutfitCount(outfitCount)}.`;
}

interface DeletePieceSectionProps {
  piece: Piece;
}

export function DeletePieceSection({ piece }: DeletePieceSectionProps) {
  const { isDialogOpen, deleteStatus, outfitCount, openDialog, closeDialog, confirmDelete } =
    useDeletePiece(piece);
  const isDeleting = deleteStatus === SubmitStatus.Submitting;

  return (
    <section className={styles.section} aria-labelledby="delete-piece-title">
      <h2 id="delete-piece-title" className={styles.title}>
        Supprimer la pièce
      </h2>
      <p className={styles.message}>Elle ira dans la corbeille, où tu pourras la restaurer.</p>
      <Button variant={ButtonVariant.Danger} onClick={openDialog}>
        Supprimer
      </Button>
      <ConfirmDialog
        isOpen={isDialogOpen}
        title="Supprimer ?"
        message={buildDeleteMessage(piece, outfitCount)}
        confirmLabel={isDeleting ? 'Suppression…' : 'Supprimer'}
        isConfirming={isDeleting}
        errorMessage={deleteStatus === SubmitStatus.Error ? DELETE_ERROR_MESSAGE : undefined}
        onConfirm={confirmDelete}
        onCancel={closeDialog}
      />
    </section>
  );
}
