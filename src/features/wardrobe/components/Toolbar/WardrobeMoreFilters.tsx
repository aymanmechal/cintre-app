import { SEASON_OPTIONS } from '../../../../shared/pieces/constants/seasonOptions';
import { toSeason } from '../../../../shared/pieces/utils/seasons';
import { Button, ButtonVariant } from '../../../../shared/ui/Button/Button';
import { CheckboxField } from '../../../../shared/ui/Form/CheckboxField';
import { SelectField } from '../../../../shared/ui/Form/SelectField';
import type { SelectOption } from '../../../../shared/ui/Form/selectOption';
import type { WardrobeViewState } from '../../hooks/useWardrobeView';
import { SHOW_AVAILABILITY } from '../../constants/wardrobe';
import { countActiveFilters, hasActiveFilters } from '../../utils/wardrobeView';
import { WardrobeColorFilter } from '../ColorFilter/WardrobeColorFilter';
import { WardrobeGroupingSelect } from './WardrobeGroupingSelect';
import { WardrobeSortSelect } from './WardrobeSortSelect';
import styles from './WardrobeMoreFilters.module.css';

const ALL = '';

const SEASON_FILTER_OPTIONS: readonly SelectOption[] = [
  { value: ALL, label: 'Toutes les saisons' },
  ...SEASON_OPTIONS.filter((option) => option.value !== ALL),
];

interface WardrobeMoreFiltersProps {
  viewState: WardrobeViewState;
}

export function WardrobeMoreFilters({ viewState }: WardrobeMoreFiltersProps) {
  const { view, tags } = viewState;
  const activeFilterCount = countActiveFilters(view);
  const tagOptions: SelectOption[] = [
    { value: ALL, label: 'Tous les tags' },
    ...tags.map((tag) => ({ value: tag, label: `#${tag}` })),
  ];

  return (
    <details className={styles.details}>
      <summary className={styles.summary}>
        Filtres {activeFilterCount > 0 && <span className={styles.badge}>{activeFilterCount}</span>}
      </summary>
      <div className={styles.fields}>
        <WardrobeColorFilter selectedColors={view.colors} onToggle={viewState.toggleColor} />
        <SelectField
          id="wardrobe-season"
          label="Saison"
          value={view.season ?? ALL}
          options={SEASON_FILTER_OPTIONS}
          onChange={(value) => viewState.changeSeason(toSeason(value))}
        />
        {tags.length > 0 && (
          <SelectField
            id="wardrobe-tag"
            label="Tag"
            value={view.tag ?? ALL}
            options={tagOptions}
            onChange={(value) => viewState.changeTag(value === ALL ? null : value)}
          />
        )}
        <CheckboxField
          id="wardrobe-only-favorites"
          label="Mes favoris seulement"
          isChecked={view.onlyFavorites}
          onChange={viewState.toggleOnlyFavorites}
        />
        {SHOW_AVAILABILITY && (
          <CheckboxField
            id="wardrobe-only-available"
            label="Disponibles seulement"
            isChecked={view.onlyAvailable}
            onChange={viewState.toggleOnlyAvailable}
          />
        )}
        <WardrobeSortSelect value={view.sortOrder} onChange={viewState.changeSortOrder} />
        <WardrobeGroupingSelect
          status={view.status}
          value={view.grouping}
          onChange={viewState.changeGrouping}
        />
        {hasActiveFilters(view) && (
          <Button variant={ButtonVariant.Ghost} onClick={viewState.resetFilters}>
            Effacer les filtres
          </Button>
        )}
      </div>
    </details>
  );
}
