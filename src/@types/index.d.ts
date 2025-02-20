type AllowedGeometry = GeoJSON.Feature<
  | GeoJSON.Point
  | GeoJSON.LineString
  | GeoJSON.Polygon
  | GeoJSON.MultiPoint
  | GeoJSON.MultiLineString
  | GeoJSON.MultiPolygon
>;

interface ExtendedFeature extends GeoJSON.Feature {
  metadata?: Record;
  polylabel?: [number, number] | number[];
  centroid?: [number, number] | number[];
}

interface ExtendedFeatureCollection extends GeoJSON.FeatureCollection {
  metadata?: Record;
  polylabel?: [number, number] | number[];
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

interface RecordObj<T extends string | number> {
  id: T;
  data: Record<T, any>;
}

/*
 * Sets how the geometry of the overlay is displayed.
 */

enum DisplayConfigType {
  Marker = "marker",
  Text = "text",
  Shape = "shape",
  Buffer = "buffer",
}

interface DisplayOverlayConfig {
  type: DisplayConfigType;
  filterKey?: string;
  iconFunction?: (feature: ExtendedFeature, data?: Record<string, T>) => L.Icon;
  radiusFunction?: (
    feature: ExtendedFeature,
    data?: Record<string, T>
  ) => number;
  filterFunction?: (compValue: any) => boolean;
  lockedOn?: {
    click: boolean;
    dbclick: boolean;
  };
  preventHoverOn?: {
    click: boolean;
    dbclick: boolean;
  };
}

/*
 * Style : Change style/color of the layer
 * View : Show/Hide the layer data details
 * Popup : Show a popup with some specified details of the layer
 * Drilldown : Drilldown to a specific layer
 * Filter : Filter the layer in the map data given some conditions
 */
type BehaviorType =
  | "highlight"
  | "style"
  | "view"
  | "popup"
  | "drilldown"
  | "filter";

interface EventBehavior {
  type: BehaviorType;
  key?: string;
}

interface EventOverlayConfig {
  click: EventBehavior[];
  dbclick: EventBehavior[];
  hover: EventBehavior[];
}

/*
 * Represents an overlay for a specific key on data
 * id : unique identifier for the overlay
 * key : key of the data that the overlay is applied to
 */
interface OverlayConfig {
  id: string;
  key: string;
  displayConfig: DisplayOverlayConfig;
  eventsConfig?: EventOverlayConfig;
  popupFunction?: PopupFunction;
}

interface LayerState {
  isLayerClicked: boolean;
  isLayerDbClicked: boolean;
  lockedOnId: string | number | null;
  filteredLayers: L.LayerGroup;
}

// TODO : As seperate factory
type PopupFunction = (data?: Record<string, V>) => L.Popup | undefined;
type PopupFunctionFactory<V> = (options: L.PopupOptions) => PopupFunction;
type ViewCallback<V> = (data: Record<string, V>) => void;
type DrilldownCallback<V> = (drillDownKey: V) => void;
type ViewCallbackFactory<V> = () => ViewCallback;
type DrilldownCallbackFactory<V> = () => DrilldownCallback;
type IconFunctionGenerator<T> = (
  feature: ExtendedFeature,
  data?: Record<string, T>
) => L.Icon;
type RadiusFunctionGenerator<T> = (
  feature: ExtendedFeature,
  data?: Record<string, T>
) => number;
type FilterFunctionGenerator<T> = (masterValue: T) => (compValue: T) => boolean;
