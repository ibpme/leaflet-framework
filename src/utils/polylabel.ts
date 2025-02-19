import polylabel from "polylabel";
import { ExtendedFeatureSchema, PointSchema } from "../schemas/geojson";

export function imputePolylabel(geojson: ExtendedFeature): ExtendedFeature;
export function imputePolylabel(
  geojson: ExtendedFeatureCollection
): ExtendedFeatureCollection;

export function imputePolylabel<
  T extends ExtendedFeature | ExtendedFeatureCollection
>(geojson: T): T {
  if (geojson.type === "Feature") {
    return {
      ...geojson,
      polylabel:
        geojson.geometry.type !== "GeometryCollection"
          ? polylabel((geojson.geometry as any).coordinates, 0.001)
          : undefined,
    };
  }
  if (geojson.type === "FeatureCollection") {
    return {
      ...geojson,
      features: geojson.features.map((f) => {
        return imputePolylabel(f);
      }),
    };
  }
  return geojson;
}

export function enforcePoints(f: ExtendedFeature) {
  const parsedGeom = PointSchema.safeParse(f.geometry);
  if (parsedGeom.success)
    return {
      ...f,
      geometry: parsedGeom.data,
    };
  console.warn(
    "Warning: Geometry must be of type Point attempting to convert by PolyLabel"
  );
  const parsedFeature = ExtendedFeatureSchema.safeParse(f);
  if (parsedFeature.success) {
    return {
      ...f,
      geometry: {
        type: "Point" as const,
        coordinates: [
          parsedFeature.data.polylabel![0],
          parsedFeature.data.polylabel![1],
        ],
      },
    };
  }
  console.error("Error: Could not enforce feature geometry to Points");
  return {
    ...f,
    geometry: null,
  };
}
