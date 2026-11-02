import { DEPENDENCE_EMOJIS, DEPENDENCE_MESSAGES } from '../../constants/dependence';
import { useDependence } from '../../hooks/useDependence';
import { formatPieceName } from '../../../../shared/utils/format';
import styles from './DependenceCard.module.css';

export function DependenceCard() {
  const dependence = useDependence();
  if (dependence === null) return null;

  return (
    <section className={styles.card} aria-labelledby="dependence-title">
      <h2 id="dependence-title" className={styles.title}>
        Toujours les mêmes ?
      </h2>
      <p className={styles.message}>
        <span aria-hidden="true">{DEPENDENCE_EMOJIS[dependence.level]} </span>
        {DEPENDENCE_MESSAGES[dependence.level]}
      </p>
      <p className={styles.detail}>
        Tes 3 pièces préférées font {dependence.topShare} % de tes ports :{' '}
        {dependence.topPieces.map((stat) => formatPieceName(stat.item.piece.title)).join(', ')}.
      </p>
    </section>
  );
}
