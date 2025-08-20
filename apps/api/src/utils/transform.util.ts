export function toNumber(value: unknown): number {
  const returnValue = toNumberOptional(value);
  if (returnValue === null) {
    return -1;
  }

  return returnValue;
}

export function toNumberOptional(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  switch (typeof value) {
    case 'number':
      return value;
    case 'string':
      return Number(value);
    case 'bigint':
      // 인트 최대 값 초과 시 오버플로우 발생
      if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
        return null;
      }

      return Number(value);
    default:
      throw new Error(`Invalid value: ${typeof value}`);
  }
}
