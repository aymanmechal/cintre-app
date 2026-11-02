import { AVAILABILITY_OPTIONS } from '../../../wardrobe/constants/selectOptions';
import { OwnershipStatus, SHOW_AVAILABILITY } from '../../../wardrobe/constants/wardrobe';
import { toAvailability } from '../../../wardrobe/utils/wardrobe';
import { SEASON_OPTIONS, NO_SEASON } from '../../../../shared/pieces/constants/seasonOptions';
import { toSeason } from '../../../../shared/pieces/utils/seasons';
import type { ChangePieceFormField, PieceFormErrors, PieceFormValues } from '../../types/pieceForm';
import { Disclosure } from '../../../../shared/ui/Disclosure/Disclosure';
import { FieldLayout } from '../../../../shared/ui/Form/fieldLayout';
import { SelectField } from '../../../../shared/ui/Form/SelectField';
import { TextField } from '../../../../shared/ui/Form/TextField';
import { TextFieldType } from '../../../../shared/ui/Form/textFieldType';
import { ExtraPhotosField } from '../ExtraPhotosField/ExtraPhotosField';
import styles from './PieceDetailsFields.module.css';

interface PieceDetailsFieldsProps {
  values: PieceFormValues;
  errors: PieceFormErrors;
  onChange: ChangePieceFormField;
}

export function PieceDetailsFields({ values, errors, onChange }: PieceDetailsFieldsProps) {
  return (
    <Disclosure summary="Plus de détails (facultatif)" className={styles.details}>
      <div className={styles.fields}>
        {SHOW_AVAILABILITY && values.status === OwnershipStatus.Owned && (
          <SelectField
            id="piece-availability"
            label="Disponibilité"
            layout={FieldLayout.Stacked}
            value={values.availability}
            options={AVAILABILITY_OPTIONS}
            onChange={(value) => onChange('availability', toAvailability(value))}
          />
        )}
        <ExtraPhotosField values={values} onChange={onChange} />
        <SelectField
          id="piece-season"
          label="Saison"
          layout={FieldLayout.Stacked}
          value={values.season ?? NO_SEASON}
          options={SEASON_OPTIONS}
          onChange={(value) => onChange('season', toSeason(value))}
        />
        <TextField
          id="piece-size"
          label="Taille"
          placeholder="Ex. M, 38, 42"
          value={values.size}
          onChange={(value) => onChange('size', value)}
        />
        <TextField
          id="piece-material"
          label="Matière"
          placeholder="Ex. coton, laine"
          value={values.material}
          onChange={(value) => onChange('material', value)}
        />
        <TextField
          id="piece-bought-on"
          label="Date d’achat"
          type={TextFieldType.Date}
          value={values.boughtOn}
          onChange={(value) => onChange('boughtOn', value)}
        />
        <TextField
          id="piece-tags"
          label="Tags"
          placeholder="Ex. soirée, vacances"
          value={values.tags}
          onChange={(value) => onChange('tags', value)}
        />
        <TextField
          id="piece-product-url"
          label="Lien de l’article"
          type={TextFieldType.Url}
          placeholder="https://www.zara.com/…"
          value={values.productUrl}
          error={errors.productUrl}
          onChange={(value) => onChange('productUrl', value)}
        />
      </div>
    </Disclosure>
  );
}
