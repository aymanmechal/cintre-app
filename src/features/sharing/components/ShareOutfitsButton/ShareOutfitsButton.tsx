import { Button, ButtonVariant } from '../../../../shared/ui/Button/Button';
import { SHARE_STATUS_MESSAGES, ShareStatus } from '../../constants/sharing';
import { useShareOutfits } from '../../hooks/useShareOutfits';
import type { ShareEntry } from '../../types/sharing';
import styles from './ShareOutfitsButton.module.css';

interface ShareOutfitsButtonProps {
  entries: readonly ShareEntry[];
  label: string;
  accessibleLabel: string;
  className?: string;
}

export function ShareOutfitsButton({
  entries,
  label,
  accessibleLabel,
  className,
}: ShareOutfitsButtonProps) {
  const { status, share } = useShareOutfits(entries);

  return (
    <span className={styles.share}>
      <Button
        variant={ButtonVariant.Ghost}
        className={className}
        disabled={status === ShareStatus.Sharing}
        aria-label={accessibleLabel}
        onClick={share}
      >
        {label}
      </Button>
      <span role="status" className={styles.message}>
        {SHARE_STATUS_MESSAGES[status]}
      </span>
    </span>
  );
}
