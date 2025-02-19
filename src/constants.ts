export const MapDefaults = {
  Geo: {
    Indonesia: {
      center: [-2.4833826, 117.8902853],
      zoom: 5,
    },
  },
  BaseMaps: {
    Satellite: {
      title: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      options: {
        maxZoom: 19,
        attribution:
          'Map data: <a href="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer">ArcGIS</a>',
      },
    },
    SatelliteHybrid: {
      title: "Satellite Hybrid",
      url: "https://api.maptiler.com/maps/hybrid/256/{z}/{x}/{y}.jpg?key=XZQFi46Z73eOnjVbyy8F",
      options: {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
    CartoLightAll: {
      title: "Carto Light All",
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      options: {
        maxZoom: 19,
        attribution:
          "Map data: <a href='https://carto.com/attribution'>CARTO</a>",
      },
    },
    CartoDarkAll: {
      title: "Carto Dark All",
      url: "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png",
      options: {
        maxZoom: 19,
        attribution:
          "Map data: <a href='https://carto.com/attribution'>CARTO</a>",
      },
    },
    Voyager: {
      title: "Voyager",
      url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
      options: {
        maxZoom: 19,
        attribution:
          "Map data: <a href='https://carto.com/attribution'>CARTO</a>",
      },
    },

    OpenStreetMap: {
      title: "Open Street Map",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      options: {
        maxZoom: 19,
        attribution:
          'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
      },
    },
    OpenTopoMap: {
      title: "Open Topo Map",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      options: {
        maxZoom: 17,
        attribution:
          'Map data: <a href="https://opentopomap.org">OpenTopoMap</a>',
      },
    },
    OpenCycleMap: {
      title: "Open Cycle Map",
      url: "https://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
      options: {
        maxZoom: 17,
        attribution:
          'Map data: <a href="https://opencyclemap.org">OpenCycleMap</a>',
      },
    },
    OpenSeaMap: {
      title: "Open Sea Map",
      url: "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png",
      options: {
        maxZoom: 18,
        attribution:
          'Map data: <a href="https://openseamap.org">OpenSeaMap</a>',
      },
    },
    OpenFireMap: {
      title: "Open Fire Map",
      url: "https://openfiremap.org/hytiles/{z}/{x}/{y}.png",
      options: {
        maxZoom: 19,
        attribution:
          'Map data: <a href="https://openfiremap.org">OpenFireMap</a>',
      },
    },
  },
};

export const StyleDefaults = {
  Choropleth: {
    Default: {
      color: "#000000",
      weight: 0.9,
      fillOpacity: 0.5,
    } as L.PathOptions,
    Highlight: {
      color: "#1C3FAA",
      fillOpacity: 0.9,
      opacity: 0.9,
      weight: 4,
    } as L.PathOptions,
    SemiHighlight: {
      color: "#1C3FAA",
      fillOpacity: 0.9,
      opacity: 1,
      weight: 2,
    } as L.PathOptions,
  },
};

export enum DisplayConfigType {
  Marker = "marker",
  Text = "text",
  Shape = "shape",
  Buffer = "buffer",
}

export const DEFAULT_BINS = [0, 1, 2, 3, 4, 5];
export const DEFAULT_PALETTE = "viridis";
