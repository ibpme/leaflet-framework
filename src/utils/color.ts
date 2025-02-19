type ColorPaletteV2 = {
  colors: string[];
  type: "discrete" | "continuous";
};

// Predefined color palettes
const PALETTES: Record<string, ColorPaletteV2> = {
  default: {
    colors: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"],
    type: "discrete",
  },
  superrandom: {
    colors: [
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FF00FF",
      "#FFA500",
      "#800080",
      "#FFFF00",
      "#A52A2A",
      "#FFC0CB",
      "#808080",
      "#00FFFF",
      "#008000",
      "#000080",
      "#800000",
      "#FFD700",
      "#808000",
      "#4682B4",
      "#D2691E",
      "#FF4500",
      "#DA70D6",
      "#ADFF2F",
      "#87CEEB",
    ],
    type: "discrete",
  },

  blues: {
    colors: ["#deebf7", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c"],
    type: "continuous",
  },
  reds: {
    colors: ["#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#a50f15", "#67000d"],
    type: "continuous",
  },
  greens: {
    colors: ["#e5f5e0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c"],
    type: "continuous",
  },
  rog: {
    colors: [
      "#FF0000", // Bright Red
      "#FF3300", // Red-Orange
      "#FF6600", // Orange
      "#FF9900", // Deep Orange
      "#FFCC00", // Golden Yellow
      "#8B8000", // Dark Yellow
      // "#FFFF00", // Bright Yellow
      // "#CCFF33", // Lime Green
      // "#99FF33", // Light Lime
      "#00CC00", // Deep Green
      "#00FF00", // Bright Green
    ],
    type: "continuous",
  },
  redgreen: {
    colors: [
      "#FF0000",
      "#FF4500",
      "#FF8C00",
      "#FFA500",
      "#FFD700",
      "#ADFF2F",
      "#7FFF00",
      "#32CD32",
      "#228B22",
      "#008000",
    ],
    type: "continuous",
  },
  redwhite: {
    colors: [
      "#FFEDA0",
      "#FED976",
      "#FEB24C",
      "#FD8D3C",
      "#FC4E2A",
      "#FF0000",
      "#E31A1C",
    ],
    type: "continuous",
  },
};

class ColorGenerator {
  private palette: ColorPaletteV2;
  private currentIndex: number;
  private interpolator: ((t: number) => string) | null;

  constructor(paletteName: string = "default") {
    this.palette = PALETTES[paletteName] || PALETTES.default;
    this.currentIndex = 0;
    this.interpolator = null;

    if (this.palette.type === "continuous") {
      this.setupInterpolator();
    }
  }

  private setupInterpolator() {
    // Simple linear interpolation between colors
    this.interpolator = (t: number) => {
      const colors = this.palette.colors;
      const n = colors.length - 1;
      const i = Math.min(Math.floor(t * n), n - 1);
      const ratio = t * n - i;

      return this.interpolateHex(colors[i], colors[i + 1], ratio);
    };
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      throw new Error("Invalid hex color");
    }
    return [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
    ];
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return (
      "#" +
      [r, g, b]
        .map((x) => Math.round(x))
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")
    );
  }

  private interpolateHex(
    color1: string,
    color2: string,
    ratio: number
  ): string {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    const r = rgb1[0] * (1 - ratio) + rgb2[0] * ratio;
    const g = rgb1[1] * (1 - ratio) + rgb2[1] * ratio;
    const b = rgb1[2] * (1 - ratio) + rgb2[2] * ratio;

    return this.rgbToHex(r, g, b);
  }

  next(): string {
    if (this.palette.type === "discrete") {
      const color = this.palette.colors[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.palette.colors.length;
      return color;
    }

    if (!this.interpolator) {
      throw new Error("Interpolator not set up for continuous palette");
    }

    return this.interpolator(
      this.currentIndex++ / (this.palette.colors.length - 1)
    );
  }

  // Get a specific color at a position (0-1) in the palette
  getAt(position: number): string {
    if (this.palette.type === "discrete") {
      const index = Math.floor(position * this.palette.colors.length);
      return this.palette.colors[
        Math.min(index, this.palette.colors.length - 1)
      ];
    }

    if (!this.interpolator) {
      throw new Error("Interpolator not set up for continuous palette");
    }

    return this.interpolator(Math.max(0, Math.min(1, position)));
  }

  // Reset the generator
  reset(): void {
    this.currentIndex = 0;
  }
}
const ColorUtils = { ColorGenerator };
export default ColorUtils;
