// Geojson Exchange Format and Conversion

export function propertiesToMapRecords<
  T extends string | number,
  V extends string | number,
  U
>(geojson: ExtendedFeatureCollection, key: T): Map<V, Record<V, U>> {
  const mapData = new Map<V, Record<V, U>>(
    geojson.features
      .filter((f) => f.properties && f.properties[key] !== null)
      .map((f) => [f.properties![key], f.properties! as Record<V, U>])
  );
  return mapData;
}

export function imputeMapRecordsToProperties(
  mapData: Map<string, Record<string, any>>,
  geojson: ExtendedFeatureCollection,
  key: string
): ExtendedFeatureCollection {
  const features = geojson.features.map((f) => {
    const properties = f.properties || {};
    const data = mapData.get(properties[key]);
    return {
      ...f,
      properties: {
        ...properties,
        ...data,
      },
    };
  });
  return {
    ...geojson,
    features,
  };
}
