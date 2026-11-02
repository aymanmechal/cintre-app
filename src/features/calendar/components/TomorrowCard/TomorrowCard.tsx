import { AVAILABILITY_LABELS } from '../../../wardrobe/constants/wardrobe';
import { Button, ButtonVariant } from '../../../../shared/ui/Button/Button';
import type { CalendarState } from '../../hooks/useCalendar';
import { useTomorrowPlan } from '../../hooks/useTomorrowPlan';
import { formatPieceName } from '../../../../shared/utils/format';
import styles from './TomorrowCard.module.css';

interface TomorrowCardProps {
  calendar: CalendarState;
}

export function TomorrowCard({ calendar }: TomorrowCardProps) {
  const { tomorrow, plan, isChecked, toggle } = useTomorrowPlan(calendar.today);

  return (
    <section className={styles.card} aria-labelledby="tomorrow-title">
      <h3 id="tomorrow-title" className={styles.title}>
        🌙 Préparer demain
      </h3>
      {plan === null ? (
        <>
          <p>Rien de prévu demain.</p>
          <Button variant={ButtonVariant.Action} onClick={() => calendar.selectDate(tomorrow)}>
            Choisir une tenue
          </Button>
        </>
      ) : (
        <>
          <p className={styles.outfit}>{plan.outfitName}</p>
          <ul className={styles.checklist}>
            {plan.items.map((item) => (
              <li key={item.piece.id}>
                <label className={styles.piece}>
                  <input
                    type="checkbox"
                    checked={isChecked(item.piece.id)}
                    onChange={() => toggle(item.piece.id)}
                  />
                  {item.piece.title}
                </label>
              </li>
            ))}
          </ul>
          {plan.unavailableItems.map((item) => (
            <p key={item.piece.id} className={styles.warning}>
              ⚠️ {formatPieceName(item.piece.title)} : {AVAILABILITY_LABELS[item.availability]}
            </p>
          ))}
        </>
      )}
    </section>
  );
}
