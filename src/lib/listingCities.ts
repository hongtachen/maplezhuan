type WithCity = {
  city?: string;
  locationData?: { city?: string };
};

/** Collect unique cities from a single listing group. */
export function extractUniqueCities(...groups: WithCity[][]): string[] {
  const cities = new Set<string>();
  for (const group of groups) {
    for (const item of group) {
      const city = item.city?.trim() || item.locationData?.city?.trim();
      if (city) cities.add(city);
    }
  }
  return Array.from(cities).sort((a, b) => a.localeCompare(b, "zh-CN"));
}

export function buildLocationOptions(cities: string[]): string[] {
  return ["全部城市", ...cities];
}
