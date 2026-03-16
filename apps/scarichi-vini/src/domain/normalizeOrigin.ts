import { normalizeUppercaseText } from '@/domain/normalizeWineText';

export function normalizeOrigin(value: string) {
  return normalizeUppercaseText(value);
}
