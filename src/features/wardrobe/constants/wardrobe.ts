export enum OwnershipStatus {
  Owned = 'owned',
  Wanted = 'wanted',
}

export const OWNERSHIP_STATUS_LABELS: Record<OwnershipStatus, string> = {
  [OwnershipStatus.Owned]: "Je l'ai",
  [OwnershipStatus.Wanted]: 'Envie',
};

export const OWNERSHIP_STATUS_ICONS: Record<OwnershipStatus, string> = {
  [OwnershipStatus.Owned]: '✓',
  [OwnershipStatus.Wanted]: '♡',
};

export const OWNERSHIP_SECTION_TITLES: Record<OwnershipStatus, string> = {
  [OwnershipStatus.Owned]: 'Mes pièces',
  [OwnershipStatus.Wanted]: 'Mes envies',
};

export const OWNERSHIP_STATUSES = Object.values(OwnershipStatus);

export enum Availability {
  Available = 'disponible',
  Dirty = 'sale',
  Washing = 'au-lavage',
  Lent = 'pretee',
  Repair = 'en-reparation',
}

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  [Availability.Available]: 'Disponible',
  [Availability.Dirty]: 'À laver',
  [Availability.Washing]: 'Au lavage',
  [Availability.Lent]: 'Prêtée',
  [Availability.Repair]: 'En réparation',
};

export const AVAILABILITIES = Object.values(Availability);

// Disponibilité masquée pour l'instant : les données restent, seul l'affichage est coupé.
export const SHOW_AVAILABILITY = false;

export enum ArchiveReason {
  Sold = 'vendue',
  Given = 'donnee',
}

export const ARCHIVE_REASON_LABELS: Record<ArchiveReason, string> = {
  [ArchiveReason.Sold]: 'Vendue',
  [ArchiveReason.Given]: 'Donnée',
};

export const ARCHIVE_REASONS = Object.values(ArchiveReason);

export const FORGOTTEN_AFTER_DAYS = 30;

export const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export const WARDROBE_STORAGE_KEY = 'cintre.wardrobe';

export const ARCHIVE_STORAGE_KEY = 'cintre.archive';

export const TRASH_STORAGE_KEY = 'cintre.trash';

export const TRASH_RETENTION_DAYS = 30;
