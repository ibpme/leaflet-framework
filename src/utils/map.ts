import L from "leaflet";

type BaseMap = {
  title: string;
  url: string;
  options: L.TileLayerOptions;
};
type BaseMaps = {
  [key: string]: L.TileLayer;
};

const MapUtils = {
  toLeafletTileControl(...args: BaseMap[]): BaseMaps {
    return args.reduce((bm, obj) => {
      return {
        ...bm,
        [obj.title]: L.tileLayer(obj.url, obj.options),
      };
    }, {});
  },
  toLeafletLayer(map: BaseMap) {
    return L.tileLayer(map.url, map.options);
  },
};

export default MapUtils;
