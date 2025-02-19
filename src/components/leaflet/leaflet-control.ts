"use strict";
import L from "leaflet";
import { html } from "../../utils/dom";

export class ButtonControl extends L.Control {
  private _div: HTMLDivElement;
  private _className: string;
  private _content: string;

  constructor(options?: L.ControlOptions) {
    super(options);
    this._div = L.DomUtil.create("div", "info legend hidden");
    this._className = "";
    this._content = "";
  }

  onAdd(): HTMLDivElement {
    return this._div;
  }

  public setBtnClassname(className: string): this {
    if (className !== "") {
      this._className = className;
    }
    return this;
  }

  public setBtnContent(content: string): this {
    if (content !== "") {
      this._content = content;
    }
    return this;
  }

  public build(): void {
    if (this._div.hasChildNodes()) {
      while (this._div.firstChild) {
        this._div.removeChild(this._div.firstChild);
      }
    }
    const button = L.DomUtil.create("button", this._className);
    button.innerText = this._content;
    this._div.appendChild(button);
  }

  public show(): void {
    this._div.classList.remove("hidden");
  }

  public hide(): void {
    this._div.classList.add("hidden");
  }
}

interface ChildNodes {
  title: HTMLElement | null;
  info: HTMLElement | null;
  content: HTMLElement | null;
  items: HTMLElement[];
}

interface LegendItem {
  color: string;
  label: string;
}

export class LegendColorControl extends L.Control {
  private _div: HTMLDivElement;
  private _childNodesEl: ChildNodes;

  constructor(options?: L.ControlOptions) {
    super(options);
    this._div = L.DomUtil.create("div", "info legend hidden");
    // Stop propagation to prevent map click
    L.DomEvent.disableClickPropagation(this._div);
    this._childNodesEl = {
      title: null,
      info: null,
      content: null,
      items: [],
    };
  }

  onAdd(): HTMLDivElement {
    return this._div;
  }

  public setTitle(title: string): this {
    const titleHTML = L.DomUtil.create("h1", "text-lg font-bold");
    titleHTML.innerText = title;
    this._childNodesEl.title = titleHTML;
    return this;
  }

  public setInfo(info: { [key: string]: string }): this {
    const infoList = L.DomUtil.create("ul");
    Object.keys(info).forEach((key: string) => {
      const li = L.DomUtil.create("li");
      li.innerHTML += `<b>${key}</b>: ${info[key]}`;
      infoList.appendChild(li);
    });
    this._childNodesEl.info = infoList;
    return this;
  }

  public setContent(content: string): this {
    const contentHTML = L.DomUtil.create("p");
    contentHTML.innerHTML = content;
    this._childNodesEl.content = contentHTML;
    return this;
  }

  public setLegend(items: LegendItem[] | Map<string, string>): this {
    let _items: LegendItem[] =
      items instanceof Map
        ? Array.from(items.keys()).map((key) => ({
            color: items.get(key) || "",
            label: key,
          }))
        : items;

    this._childNodesEl.items = _items.map(({ color, label }) => {
      const legendItem = L.DomUtil.create("div", "flex gap-2");
      const item = L.DomUtil.create("i", "rounded-lg");
      item.setAttribute("style", `background:${color}`);
      const labelEl = L.DomUtil.create("span", "text-medium");
      labelEl.innerText = label;
      legendItem.append(item, labelEl);
      return legendItem;
    });
    return this;
  }

  public build(): void {
    if (this._div.hasChildNodes()) {
      while (this._div.firstChild) {
        this._div.removeChild(this._div.firstChild);
      }
    }

    const { title, info, content, items } = this._childNodesEl;
    [title, info, content, items].forEach((el) => {
      if (Array.isArray(el)) {
        this._div.append(...items);
      } else if (el !== null) {
        this._div.appendChild(el);
      }
    });
  }

  public show(): void {
    this._div.classList.remove("hidden");
  }

  public hide(): void {
    this._div.classList.add("hidden");
  }
}

interface LegendSizeOptions extends L.ControlOptions {
  title: string;
  minValue: number;
  maxValue: number;
}

class LegendSizeControl extends L.Control {
  options: LegendSizeOptions;

  constructor(options: LegendSizeOptions) {
    super(options);
    this.options = {
      position: "bottomright",
      ...options,
    };
  }

  onAdd(): HTMLElement {
    const div = L.DomUtil.create("div", "info legend");

    const content = html`
      <h1 class="text-lg font-bold mb-1">${this.options.title}</h1>
      <div
        class="flex justify-between items-end mt-1 px-2"
        style="height: 24px;"
      >
        <div
          style="width: 6px; height: 6px; border-radius: 50%; border: 1px solid #FFA500;background: #FFA500"
        ></div>
        <div
          style="width: 12px; height: 12px; border-radius: 50%; border: 1px solid #FFA500;background: #FFA500"
        ></div>
        <div
          style="width: 18px; height: 18px; border-radius: 50%; border: 1px solid #FFA500;background: #FFA500"
        ></div>
        <div
          style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid #FFA500;background: #FFA500"
        ></div>
      </div>
      <div style="border-top: 2px solid #ccc; margin-top: 5px;"></div>
      <div
        style="display: flex; justify-content: space-between; margin-top: 5px;"
      >
        <span>${this.options.minValue}</span>
        <span>${this.options.maxValue}</span>
      </div>
    `;

    div.innerHTML = content;
    return div;
  }
}

interface LegendItem {
  color: string;
  label: string;
}

interface LegendOptions extends L.ControlOptions {
  items: LegendItem[];
  title?: string;
}

export class LegendControl extends L.Control {
  public options: LegendOptions;
  private container: HTMLElement | null = null;

  constructor(options: LegendOptions) {
    // Merge default options with provided options
    super({
      position: options.position || "bottomleft",
    });

    this.options = {
      title: "Legend",
      ...options,
    };
  }

  public onAdd(): HTMLElement {
    // Create main container
    this.container = L.DomUtil.create(
      "div",
      "bg-white p-4 rounded-lg shadow-md max-h-96"
    );
    this.container.style.overflowY = "auto";

    // Prevent click and scroll events from passing through to the map
    L.DomEvent.disableClickPropagation(this.container);
    L.DomEvent.disableScrollPropagation(this.container);

    // Add title
    const titleElement = L.DomUtil.create(
      "h3",
      "font-medium mb-2",
      this.container
    );
    titleElement.textContent = this.options.title || "Legend";

    // Create items container
    const itemsContainer = L.DomUtil.create("div", "space-y-2", this.container);

    // Add legend items
    this.options.items.forEach(({ color, label }) => {
      const itemDiv = L.DomUtil.create(
        "div",
        "flex items-center",
        itemsContainer
      );

      // Color box
      const colorBox = L.DomUtil.create("div", "w-4 h-4 mr-2", itemDiv);
      colorBox.style.backgroundColor = color;

      // Label
      const labelSpan = L.DomUtil.create("span", "", itemDiv);
      labelSpan.textContent = label;
    });

    return this.container;
  }
}

export interface SearchItem {
  name: string;
  coordinates?: L.LatLngExpression;
  value: string | null;
}

interface SearchControlOptions extends L.ControlOptions {
  locations: SearchItem[];
  placeholder?: string;
  defaultSearch?: string;
  notFoundMessage?: string;
  icon?: string;
  onLocationSelect?: (location: SearchItem) => void;
}

class SearchControl extends L.Control {
  private searchContainer: HTMLDivElement;
  private dropdownContainer: HTMLDivElement;
  private searchInput: HTMLInputElement;
  private locationList: SearchItem[] = [];
  private onLocationSelect: (location: SearchItem) => void = () => {};
  private defaultSearch: string;
  private notFoundMessage: string;
  private searchIcon: string;

  constructor(options?: SearchControlOptions) {
    super({
      position: options?.position || "topleft",
    });
    options && (this.locationList = options.locations);
    options?.onLocationSelect &&
      (this.onLocationSelect = options.onLocationSelect);
    this.searchContainer = this.createSearchContainer();
    this.dropdownContainer = this.createDropdownContainer();
    this.searchInput = this.createSearchInput(options?.placeholder);
    this.defaultSearch = options?.defaultSearch || "All";
    this.notFoundMessage = options?.notFoundMessage || "No results found";
    this.searchIcon = options?.icon || "";
  }

  public getDefaultSelection(): SearchItem {
    return {
      name: this.defaultSearch,
      coordinates: [0, 0],
      value: null,
    };
  }

  private createSearchContainer(): HTMLDivElement {
    const container = document.createElement("div");
    container.classList.add(
      "leaflet-control",
      "leaflet-bar",
      "bg-white",
      "rounded-lg",
      "shadow-lg",
      "mb-2"
    );
    return container;
  }

  private createSearchInput(placeholder?: string): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = placeholder || "Search";
    input.classList.add(
      "w-full",
      "bg-transparent",
      "outline-none",
      "text-gray-700",
      "placeholder-gray-400",
      "text-sm",
      "px-2"
    );
    return input;
  }

  private createDropdownContainer(): HTMLDivElement {
    const dropdown = document.createElement("div");
    dropdown.classList.add(
      "leaflet-control",
      // "leaflet-bar",
      "bg-white",
      "rounded-lg",
      "shadow-lg",
      "hidden",
      "min-w-[300px]",
      "mt-2",
      "max-h-[300px]", // Set maximum height
      "overflow-y-auto" // Enable vertical scrolling
    );
    return dropdown;
  }

  onAdd(): HTMLElement {
    const controlContainer = document.createElement("div");

    // Search Container Setup
    const searchWrapper = L.DomUtil.create(
      "div",
      "flex items-center gap-2 p-2",
      this.searchContainer
    );
    searchWrapper.style.minWidth = "300px";

    // Location Icon
    const searchIcon = L.DomUtil.create("span", "", searchWrapper);
    searchIcon.innerHTML = this.searchIcon;

    // Add search input to wrapper
    searchWrapper.appendChild(this.searchInput);

    // Add both containers to the control container
    controlContainer.appendChild(this.searchContainer);
    controlContainer.appendChild(this.dropdownContainer);

    // Event Listeners
    L.DomEvent.disableClickPropagation(controlContainer);
    L.DomEvent.disableScrollPropagation(controlContainer);

    this.searchInput.addEventListener("focus", () => this.showDropdown());
    this.searchInput.addEventListener("input", (e) => this.handleSearch(e));
    document.addEventListener("click", (e) => this.handleClickOutside(e));

    return controlContainer;
  }

  // Set Selection publicly
  public setSelection(
    selectedLocation: SearchItem | null,
    cb: () => void = () => {}
  ) {
    cb();
    if (selectedLocation === null) {
      this.searchInput.value = "";
      this.handleSelection(this.getDefaultSelection(), false);
      return;
    }
    this.handleSelection(selectedLocation, false);
  }
  public setOnLocationSelect(cb: (location: SearchItem) => void) {
    this.onLocationSelect = cb;
  }

  private showDropdown(): void {
    this.dropdownContainer.classList.remove("hidden");
    this.renderDropdown(this.locationList);
  }

  private hideDropdown(): void {
    this.dropdownContainer.classList.add("hidden");
  }

  private handleSearch(e: Event): void {
    const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
    const filteredList = this.locationList.filter((location) =>
      location.name.toLowerCase().includes(searchTerm)
    );
    this.renderDropdown(filteredList);
    // this.showDropdown();
  }

  private handleClickOutside(e: MouseEvent): void {
    if (
      !this.searchContainer.contains(e.target as Node) &&
      !this.dropdownContainer.contains(e.target as Node)
    ) {
      this.hideDropdown();
    }
  }

  private renderDropdown(items: SearchItem[]): void {
    this.dropdownContainer.innerHTML = "";

    if (items.length === 0) {
      const noResults = L.DomUtil.create(
        "div",
        "p-2 text-gray-500 text-sm",
        this.dropdownContainer
      );
      noResults.textContent = this.notFoundMessage;
      return;
    }

    // Section header for Default Search
    const allSection = L.DomUtil.create(
      "div",
      "sticky top-0 bg-white z-10",
      this.dropdownContainer
    );

    // "SEMUA" option
    const defaultOption = L.DomUtil.create("div", "", allSection);
    defaultOption.textContent = this.defaultSearch;
    defaultOption.classList.add(
      "p-2",
      "mx-2",
      "hover:bg-gray-100",
      "cursor-pointer",
      "text-gray-700",
      "text-sm",
      // "rounded",
      "border-b" // Add border to separate from scrollable list
    );
    defaultOption.addEventListener("click", () =>
      this.handleSelection(this.getDefaultSelection())
    );

    // Render items options
    items.forEach((item) => {
      const option = L.DomUtil.create("div", "", this.dropdownContainer);
      option.textContent = item.name;
      option.classList.add(
        "p-2",
        "mx-2",
        "hover:bg-gray-100",
        "cursor-pointer",
        "text-gray-700",
        "text-sm",
        "rounded"
      );
      option.addEventListener("click", () => this.handleSelection(item));
    });
  }

  private handleSelection(
    selectedLocation: SearchItem,
    fromInput: boolean = true
  ): void {
    this.searchInput.value = selectedLocation.name;
    this.hideDropdown();
    if (fromInput) this.onLocationSelect(selectedLocation);
    // Add your selection handling logic here
  }

  public resetSearch(): void {
    this.handleSelection(this.getDefaultSelection());
  }
}

const LeafletExtendedControls = {
  ButtonControl,
  LegendSizeControl,
  LegendColorControl,
  LegendControl,
  SearchControl,
};
export default LeafletExtendedControls;
