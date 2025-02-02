import type { StyleFunction, PathOptions } from "leaflet";

function CreateStyleFunction<T extends string | number, V extends string>(
  displayOverlay: DisplayOverlay,
  data: ObjDataHM<T, V>
): StyleFunction | PathOptions {
  if (displayOverlay.config.type === DisplayConfigType.Text) {
    return {};
  }
  const styleFunction: StyleFunction = (feature) => {
    return {};
  };
  return styleFunction;
}

function CreateColorHashMap<T extends string | number, V>(
  data: ObjDataHM<T>,
  colorKey: string,
  logic: "distinct" | "higherBetter" | "lowerBetter",
  options: { bins?: number[]; pallete?: string }
) {
  // Default bins
  const bins = options.bins || [0, 1, 2, 3, 4, 5];
  // Default pallete
  const pallete = options.pallete || "viridis";
  const ColorMap = new Map<T, string>();
  // Get the values of the color key
  const values = Array.from(data.values()).map((d) => d[colorKey]);

  return ColorMap;
}
