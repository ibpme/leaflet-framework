import { DEFAULT_BINS, DEFAULT_PALETTE } from "../constants";
import ColorUtils from "../utils/color";

export function CreateColorHashMap<T, V>(
  data: Map<T, Record<string, V>>,
  colorKey: string,
  logic: "group" | "scale",
  options: { bins?: number[]; pallete?: string } = {}
): Map<T, string> {
  const bins = options.bins || DEFAULT_BINS; // Example default bins
  const pallete = options.pallete || DEFAULT_PALETTE;
  const ColorMap = new Map<T, string>();

  // Get color generator (assumed external function)
  const colorGenerator = new ColorUtils.ColorGenerator(pallete);

  if (logic === "group") {
    // Create a map of unique values to track assigned colors
    const uniqueValues = new Map<any, string>();

    // First pass: collect all unique values
    for (const [_, obj] of data) {
      const value = obj[colorKey];
      if (!uniqueValues.has(value)) {
        uniqueValues.set(value, colorGenerator.next());
      }
    }
    // Second pass: assign colors based on unique values
    for (const [id, obj] of data) {
      const value = obj[colorKey];
      ColorMap.set(id, uniqueValues.get(value)!);
    }
  } else if (logic === "scale") {
    // First pass: find min and max values
    let minValue = Infinity;
    let maxValue = -Infinity;

    for (const [_, obj] of data) {
      const value = Number(obj[colorKey]);
      if (!isNaN(value)) {
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      }
    }

    // Create a mapping of bin ranges to colors
    const binColors = new Map<number, string>();
    bins.forEach((_, index) => {
      if (index < bins.length - 1) {
        binColors.set(bins[index], colorGenerator.next());
      }
    });

    // Function to find appropriate bin for a value
    const findBin = (value: number): number => {
      for (let i = 0; i < bins.length - 1; i++) {
        if (value >= bins[i] && value <= bins[i + 1]) {
          return bins[i];
        }
      }
      return bins[0];
    };

    // Second pass: assign colors based on bins
    for (const [id, obj] of data) {
      const value = Number(obj[colorKey]);
      if (!isNaN(value)) {
        // Normalize value to bin range if necessary
        const normalizedValue = value;
        const bin = findBin(normalizedValue);
        ColorMap.set(id, binColors.get(bin)!);
      }
    }
  }

  return ColorMap;
}
type ColorBinPair = [string, number]; // [color, binEdge]
type ExclusiveType = "left" | "right";

class ColorBinEdgeGenerator {
  private colorBinPairs: ColorBinPair[];
  private exclusive: ExclusiveType;
  // private currentIndex: number;

  constructor(
    colorBinPairs: ColorBinPair[],
    exclusive: ExclusiveType = "right"
  ) {
    if (colorBinPairs.length < 2) {
      throw new Error("At least 2 color-bin pairs are required");
    }

    // Sort pairs by bin edge
    this.colorBinPairs = [...colorBinPairs].sort((a, b) => a[1] - b[1]);
    this.exclusive = exclusive;
    // this.currentIndex = 0;
  }

  getColorForValue(value: number): string {
    const pairs = this.colorBinPairs;

    // Handle values outside the range based on exclusivity
    if (this.exclusive === "left") {
      if (value <= pairs[0][1]) return pairs[0][0];
      if (value > pairs[pairs.length - 1][1]) return pairs[pairs.length - 1][0];
    } else {
      // right exclusive
      if (value < pairs[0][1]) return pairs[0][0];
      if (value >= pairs[pairs.length - 1][1])
        return pairs[pairs.length - 1][0];
    }

    // Binary search to find the appropriate color
    let left = 0;
    let right = pairs.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midEdge = pairs[mid][1];
      const nextEdge = mid < pairs.length - 1 ? pairs[mid + 1][1] : Infinity;

      if (this.exclusive === "left") {
        if (value > midEdge && value <= nextEdge) {
          return pairs[mid + 1][0];
        }
      } else {
        // right exclusive
        if (value >= midEdge && value < nextEdge) {
          return pairs[mid][0];
        }
      }

      if (value < midEdge) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    // Fallback (shouldn't reach here if implementation is correct)
    return pairs[0][0];
  }

  // Get the bin edges
  getBinEdges(): number[] {
    return this.colorBinPairs.map((pair) => pair[1]);
  }

  // Get the colors
  getColors(): string[] {
    return this.colorBinPairs.map((pair) => pair[0]);
  }
}

export function CreateColorBinPairHashMap<T, V>(
  data: Map<T, Record<string, V>>,
  colorKey: string,
  logic: "group" | "scale",
  options: {
    colorBinPairs: ColorBinPair[];
    exclusive?: ExclusiveType;
  }
): Map<T, string> {
  if (data.size === 0) return new Map<T, string>();

  const { colorBinPairs, exclusive = "right" } = options;

  // Validate colorBinPairs
  if (colorBinPairs.length < 2) {
    throw new Error("At least 2 color-bin pairs are required");
  }

  // Helper function to safely get numeric value
  const getNumericValue = (obj: Record<string, any>): number | null => {
    const value = obj[colorKey];
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  if (logic === "group") {
    // For distinct logic, we'll use just the colors from the pairs
    const colors = colorBinPairs.map((pair) => pair[0]);
    const uniqueValues = new Set<any>();
    const valueColorMap = new Map<any, string>();
    const result = new Map<T, string>();
    let colorIndex = 0;

    // Pre-compute colors for unique values
    for (const [_, obj] of data) {
      const value = obj[colorKey];
      if (!uniqueValues.has(value)) {
        uniqueValues.add(value);
        valueColorMap.set(value, colors[colorIndex % colors.length]);
        colorIndex++;
      }
    }

    // Map IDs to colors
    for (const [id, obj] of data) {
      const value = obj[colorKey];
      result.set(id, valueColorMap.get(value)!);
    }

    return result;
  } else {
    // scale logic
    const colorGenerator = new ColorBinEdgeGenerator(colorBinPairs, exclusive);
    const result = new Map<T, string>();
    const validData = new Map<T, number>();

    // Collect valid numeric data
    for (const [id, obj] of data) {
      const value = getNumericValue(obj);
      if (value !== null) {
        validData.set(id, value);
      }
    }

    // Handle edge case where all values are the same
    if (validData.size > 0) {
      const values = Array.from(validData.values());
      const allSame = values.every((v) => v === values[0]);
      if (allSame) {
        const color = colorGenerator.getColorForValue(values[0]);
        return new Map([...validData.keys()].map((id) => [id, color]));
      }
    }

    // Map values to colors
    for (const [id, value] of validData) {
      result.set(id, colorGenerator.getColorForValue(value));
    }

    return result;
  }
}
