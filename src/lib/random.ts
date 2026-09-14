export function pickItem<T>(items: readonly T[], rng: () => number = Math.random): T {
  if (items.length === 0) {
    throw new Error("pickItem requires at least one item");
  }
  const index = Math.min(items.length - 1, Math.floor(rng() * items.length));
  return items[index]!;
}

export function pickFreshItem<T>(
  items: readonly T[],
  previous: T | null,
  rng: () => number = Math.random,
): T {
  const unique = items.filter((item) => item !== previous);
  return pickItem(unique.length ? unique : items, rng);
}
