import L from "leaflet";

export function createBehaviorHandler<T, V>(
  data: Map<T, Record<string, V>>,
  layerKey: string,
  state: LayerState = {
    isLayerClicked: false,
    isLayerDbClicked: false,
    lockedOnId: null,
    filteredLayers: L.layerGroup(),
  },
  options: {
    styleHighlight?: L.PathOptions;
    styleSemiHighlight?: L.PathOptions;
    styleDefault?: L.PathOptions;
    style?: L.PathOptions;
    isolatePopup?: boolean;
    viewCb?: (data: Record<string, V>) => void;
    drilldownCb?: (drillDownKey: V) => void;
  }
) {
  return (events: EventBehavior) => {
    return mapEventHandler(
      data,
      layerKey,
      events.key || layerKey,
      events.type,
      state,
      options
    );
  };
}

function mapEventHandler<T, V>(
  data: Map<T, Record<string, V>>,
  layerKey: string,
  behaviorKey: string | number,
  behavior: BehaviorType,
  state: LayerState = {
    isLayerClicked: false,
    isLayerDbClicked: false,
    lockedOnId: null,
    filteredLayers: L.layerGroup(),
  },
  options: {
    styleHighlight?: L.PathOptions;
    styleSemiHighlight?: L.PathOptions;
    styleDefault?: L.PathOptions;
    style?: L.PathOptions;
    isolatePopup?: boolean;
    viewCb?: (data: Record<string, V>) => void;
    drilldownCb?: (drillDownKey: V) => void;
  }
) {
  const styleHighlight = options.styleHighlight || {};
  const styleSemiHighlight = options.styleSemiHighlight || {};
  const styleDefault = options.styleDefault || {};
  const styleCustom = options.style || {};
  const isolatePopup = options.isolatePopup || true;
  return (feature: ExtendedFeature, layer: L.Layer, parentLayer: L.GeoJSON) => {
    const properties = feature.properties
      ? data.get(feature.properties[layerKey])
      : null;
    switch (behavior) {
      // Highlight the layer based on properties from the behavior key
      case "highlight":
        if (!behaviorKey) return;
        parentLayer.setStyle((f): L.PathOptions => {
          const targetProperties = data.get(f?.properties[layerKey]);
          if (!(properties && targetProperties)) return styleDefault;
          /* For a locked in layer highlight the locked in layer
           * Semi-highlight the other layer
           */
          const isLockedOn = state.lockedOnId !== null;
          if (f?.properties[layerKey] === state.lockedOnId)
            return styleHighlight;
          if (targetProperties[behaviorKey] === properties[behaviorKey])
            return isLockedOn ? styleSemiHighlight : styleHighlight;
          return styleDefault;
        });
        return;
      case "style":
        parentLayer.setStyle((f): L.PathOptions => {
          const targetProperties = data.get(f?.properties[layerKey]);
          if (!(properties && targetProperties)) return styleDefault;
          /* For a locked in layer highlight the locked in layer
           * Semi-highlight the other layer
           */
          if (targetProperties[behaviorKey] === properties[behaviorKey])
            return styleCustom;
          return styleDefault;
        });
        return;
      case "view":
        if (options.viewCb && properties) options.viewCb(properties);
        return;
      case "popup":
        isolatePopup &&
          parentLayer
            .getLayers()
            .filter(
              (l) => parentLayer.getLayerId(l) !== parentLayer.getLayerId(layer)
            )
            .forEach((layer) => layer.closePopup());
        layer.openPopup();
        return;
      case "drilldown":
        if (options.drilldownCb && properties)
          options.drilldownCb(properties[layerKey]);
        return;
      case "filter":
        // Iterate over all feature and filter based on the behavior key
        if (!properties || !behaviorKey) return;
        parentLayer
          .getLayers()
          .filter((layer) => {
            const targetProperties = data.get(
              // @ts-ignore : Hack to get the feature properties from layer object
              layer.feature?.properties[layerKey]
            );
            if (!targetProperties) return true;
            if (properties[behaviorKey] === targetProperties[behaviorKey])
              return false;
            return true;
          })
          .forEach((layer) =>
            state.filteredLayers.addLayer(parentLayer.removeLayer(layer))
          );
        return;
      default:
        return;
    }
  };
}
