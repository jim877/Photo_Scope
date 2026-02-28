import type { PrimaryReason } from './db';

export const PRIMARY_REASONS: { value: PrimaryReason; label: string }[] = [
  { value: 'Pick Up (PU)', label: 'Pick Up (PU)' },
  { value: 'In Home', label: 'In Home' },
  { value: 'Total Loss (TLI)', label: 'Total Loss (TLI)' },
  { value: 'Not Affected', label: 'Not Affected' },
  { value: 'Customer Cleaning', label: 'Customer Cleaning' },
];

export const SUB_REASONS_BY_PRIMARY: Record<string, string[]> = {
  'Pick Up (PU)': ['Window Treats', 'Rugs', 'Bedding', 'Exposed', 'Clothes', 'Drape', 'Closets', 'Drawers'],
  'In Home': ['Upholstery', 'Drapes', 'Rugs', 'Electronics'],
  'Total Loss (TLI)': ['We are writing'],
  'Not Affected': [],
  'Customer Cleaning': [],
  Other: [
    'Cash out estimate',
    'Storage Only',
    'Not Worth Cleaning',
    'Customer Throwing Out',
    'Dispose',
    'Donate',
    'Undecided',
    'Do not touch',
  ],
};
