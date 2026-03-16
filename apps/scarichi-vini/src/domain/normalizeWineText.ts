const IT_LOCALE = 'it-IT';

function compactSpaces(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizeUppercaseText(value: string) {
  return compactSpaces(value).toLocaleUpperCase(IT_LOCALE);
}

export function normalizeInitialUppercaseText(value: string) {
  const compact = compactSpaces(value).toLocaleLowerCase(IT_LOCALE);
  if (!compact) return '';

  return compact.replace(/(^|[\s'’`-])(\p{L})/gu, (_, prefix: string, letter: string) => {
    return `${prefix}${letter.toLocaleUpperCase(IT_LOCALE)}`;
  });
}

export function normalizeWineCategory(value: string) {
  return normalizeUppercaseText(value);
}

export function normalizeWineName(value: string) {
  return normalizeUppercaseText(value);
}

export function normalizeWineProducer(value: string) {
  return normalizeInitialUppercaseText(value);
}

export function normalizeWineSupplier(value: string) {
  return normalizeInitialUppercaseText(value);
}
