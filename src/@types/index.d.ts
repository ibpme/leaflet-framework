type AllowedGeometry = GeoJSON.Feature<
  | GeoJSON.Point
  | GeoJSON.LineString
  | GeoJSON.Polygon
  | GeoJSON.MultiPoint
  | GeoJSON.MultiLineString
  | GeoJSON.MultiPolygon
>;

interface ExtendedFeature extends GeoJSON.Feature {
  metadata?: GeoJSON.GeoJsonProperties;
  polylabel?: [number, number];
}

interface ExtendedFeatureCollection extends GeoJSON.FeatureCollection {
  metadata?: GeoJSON.GeoJsonProperties;
  polylabel?: [number, number];
}

interface LegendItem {
  color: string;
  label: string;
  value: number;
}

interface Legend {
  title: string;
  type: string;
  items: LegendItem[];
  bins?: number[];
}

interface ObjData<T extends string | number> {
  id: T;
  data: { [key: string]: any }[];
}

type ObjDataHM<T> = Map<T, { [key: string]: any }>;

/*
 * Sets how the geometry of the overlay is displayed.
 */

enum DisplayConfigType {
  Marker,
  Text,
  Shape,
  Buffer,
}

interface DisplayOverlayConfig {
  type: DisplayConfigType;
}

/*
 * Represents an overlay for a specific key on data
 * id : unique identifier for the overlay
 * key : key of the data that the overlay is applied to
 * keyLabel : The key of the label for the display data key
 */
interface DisplayOverlay {
  id: string;
  key: string;
  labelKey?: string;
  config: DisplayOverlayConfig;
}
