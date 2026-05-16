'use client';

import { ToggleRow } from './toggle-row';
import { updateProfileToggle } from '@/app/(app)/settings/actions';

type Field =
  | 'show_on_leaderboard'
  | 'notifications_drop'
  | 'notifications_reveal'
  | 'notifications_social';

interface Props {
  field: Field;
  label: string;
  description?: string;
  initial: boolean;
}

export function ProfileToggle({ field, label, description, initial }: Props) {
  return (
    <ToggleRow
      label={label}
      description={description}
      initial={initial}
      onChange={(value) => updateProfileToggle(field, value)}
    />
  );
}
