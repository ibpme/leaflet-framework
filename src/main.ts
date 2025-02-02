import "leaflet/dist/leaflet.css";
import L from "leaflet";

function toObjDataMap<T extends string | number>(
  mapData: ObjData<T>
): ObjDataHM<T> {
  return new Map(
    mapData.data.filter((d) => d != null).map((d) => [d[mapData.id], d])
  );
}
