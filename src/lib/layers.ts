import { DisplayConfigType, StyleDefaults } from "../constants";
import L from "leaflet";
import { CreateColorHashMap } from "./overlay";
import { createBehaviorHandler } from "./events";
import { enforcePoints } from "../utils/polylabel";

const resetLayer = (parentLayer: L.GeoJSON, state: LayerState) => {
  state.filteredLayers.addTo(parentLayer);
  state.filteredLayers = L.layerGroup();
  parentLayer.resetStyle();
};

export function createMapLayer<T, V>(
  featCollection: ExtendedFeatureCollection,
  data: Map<T, Record<string, V>>,
  config: OverlayConfig,
  state: LayerState = {
    isLayerClicked: false,
    isLayerDbClicked: false,
    lockedOnId: null,
    filteredLayers: L.layerGroup(),
  },
  viewCb: (data: Record<string, V>) => void = () => {},
  drilldownCb: (drillDownKey: V) => void = () => {}
) {
  // Display Config Setup
  const lockedOn = config.displayConfig.lockedOn || {
    click: true,
    dbclick: false,
  };
  const preventHoverOn = config.displayConfig.preventHoverOn || {
    click: false,
    dbclick: false,
  };
  const popupFunction =
    config.popupFunction || (() => L.popup({ content: "Default Popup" }));
  const iconFunction =
    config.displayConfig.iconFunction || (() => new L.Icon.Default());
  const radiusFunction = config.displayConfig.radiusFunction || (() => 10);
  const filterFunction = config.displayConfig.filterFunction || (() => true);
  const filterKey = config.displayConfig.filterKey || config.key;
  const displayType = config.displayConfig.type;
  const events = config.eventsConfig || {
    click: [
      {
        key: "id",
        type: "popup",
      },
      {
        key: "distinct",
        type: "highlight",
      },
    ],
    dbclick: [],
    hover: [],
  };
  console.log(events);

  if (
    [
      DisplayConfigType.Marker,
      DisplayConfigType.Text,
      DisplayConfigType.Buffer,
    ].includes(displayType)
  ) {
    // Infer layer as Point type
    const pointFeatures = featCollection.features
      .map(enforcePoints)
      .filter((f) => f.geometry !== null)
      .filter((f) => f.geometry.coordinates !== undefined);
    featCollection = {
      ...featCollection,
      features: pointFeatures,
    };
  }
  const behaviorHandler = createBehaviorHandler(data, config.key, state, {
    styleHighlight: StyleDefaults.Choropleth.Highlight,
    styleSemiHighlight: StyleDefaults.Choropleth.SemiHighlight,
    // TODO : Outside state functionality
    viewCb,
    drilldownCb,
  });
  const colorMap = CreateColorHashMap(data, "distinct", "group");

  const layerGroup = L.geoJSON(featCollection, {
    pointToLayer: (feature, latlng) => {
      const key = feature.properties[config.key];
      if (!feature || !latlng) return L.marker(latlng);
      if (
        displayType === DisplayConfigType.Marker ||
        displayType === DisplayConfigType.Text
      ) {
        return L.marker(latlng, {
          icon: iconFunction(feature, data.get(key)),
        });
      }
      if (displayType === DisplayConfigType.Buffer) {
        return L.circleMarker(latlng, {
          radius: radiusFunction(feature, data.get(key)),
        });
      }
      return L.marker(latlng);
    },
    filter: (feature) => {
      if (!feature.properties) return true;
      const key = feature.properties[config.key];
      const value = data.get(key);
      if (!value) return true;
      return filterFunction(value[filterKey]);
    },
    style: (feature) => {
      if (!feature) return {};
      const key = feature.properties[config.key];
      const value = colorMap.get(key);
      if (value) {
        return { ...StyleDefaults.Choropleth.Default, fillColor: value };
      }
      return StyleDefaults.Choropleth.Default;
    },
    onEachFeature: (feature, layer) => {
      if (!feature || !layer) return;
      const key = feature.properties[config.key];

      // TODO : Create separate function for popup setup
      // Setup popup for all layers
      const popup = popupFunction(feature, data.get(key));
      popup && layer.bindPopup(popup);

      // Reset layer event listeners
      layer.off("click");
      layer.off("dblclick");
      layer.off("mouseover");
      layer.off("mouseout");

      // Setup layer events
      layer.on({
        click: (e) => {
          resetLayer(layerGroup, state);
          events.click
            .map(behaviorHandler)
            .forEach((handler) => handler(feature, layer, layerGroup));
          // Isolate click event to current layer only and prevent propagation to map
          L.DomEvent.stopPropagation(e);
          state.isLayerClicked = true;
          state.lockedOnId = lockedOn.click ? key : null;
        },
        dblclick: (e) => {
          resetLayer(layerGroup, state);
          // handleLayerEvent(feature, layer, layerGroup);
          // Isolate dbclick event to current layer only and prevent propagation to map
          L.DomEvent.stopPropagation(e);
          state.isLayerDbClicked = true;
          state.lockedOnId = lockedOn.dbclick ? key : null;
        },
        mouseover: () => {
          const preventHover =
            (state.isLayerClicked && preventHoverOn.click) ||
            (state.isLayerDbClicked && preventHoverOn.dbclick) ||
            state.lockedOnId !== null;
          if (preventHover) {
            return;
          }
          // handleLayerEvent(feature, layer, layerGroup);
        },
        mouseout: () => {
          const preventHover =
            (state.isLayerClicked && preventHoverOn.click) ||
            (state.isLayerDbClicked && preventHoverOn.dbclick) ||
            state.lockedOnId !== null;
          if (preventHover) {
            return;
          }
          resetLayer(layerGroup, state);
        },
      });
    },
  });

  return layerGroup;
}
