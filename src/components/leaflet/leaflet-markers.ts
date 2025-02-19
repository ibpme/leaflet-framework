import L from "leaflet";
import { html } from "../../utils/dom";

const TextIcon = L.Icon.extend({
  initialize: function (text: string, options: L.IconOptions) {
    this._text = text;
    // @ts-ignore
    L.Icon.prototype.initialize.apply(this, [options]);
  },

  createIcon: function () {
    const el = document.createElement("div");
    el.appendChild(document.createTextNode(this._text));
    this._setIconStyles(el, "icon");
    el.style.textShadow = "2px 2px 2px #fff";
    return el;
  },

  createShadow: function () {
    return null;
  },
});

const TextMarker = L.Marker.extend({
  initialize: function (
    latlng: L.LatLng,
    text: string,
    options: L.MarkerOptions
  ) {
    // @ts-ignore
    L.Marker.prototype.initialize.apply(this, [latlng, options]);
    // @ts-ignore
    this._fakeicon = new TextIcon(text);
  },

  _initIcon: function () {
    // @ts-ignore
    L.Marker.prototype._initIcon.apply(this);

    const i = this._icon,
      s = this._shadow,
      obj = this.options.icon;
    this._icon = this._shadow = null;

    this.options.icon = this._fakeicon;
    // @ts-ignore
    L.Marker.prototype._initIcon.apply(this);
    this.options.icon = obj;

    if (s) {
      s.parentNode.removeChild(s);
      this._icon.appendChild(s);
    }

    i.parentNode.removeChild(i);
    this._icon.appendChild(i);

    const w = this._icon.clientWidth,
      h = this._icon.clientHeight;
    this._icon.style.marginLeft = -w / 2 + "px";
    //this._icon.style.backgroundColor = "red";
    const off = new L.Point(w / 2, 0);
    if (L.Browser.webkit) off.y = -h;
    L.DomUtil.setPosition(i, off);
    if (s) L.DomUtil.setPosition(s, off);
  },
});

interface FollowerMarkerOptions extends L.DivIconOptions {
  count: number;
}

// Create custom div icon class
class FollowerIcon extends L.DivIcon {
  constructor(options: FollowerMarkerOptions) {
    const count = options.count || 0;

    super({
      className: "bg-transparent",
      html: html`
        <div
          class="bg-blue-800 w-10 p-0.5 py-1 border-white border rounded-md custom-marker-icon"
        >
          <div class="flex justify-center">
            <svg
              width="20"
              height="15"
              viewBox="0 0 20 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="10" cy="4" r="4" fill="white" />
              <path
                d="M15 13C15 11.6739 14.4732 10.4021 13.5355 9.46447C12.5979 8.52678 11.3261 8 10 8C8.67392 8 7.40215 8.52678 6.46447 9.46447C5.52678 10.4021 5 11.6739 5 13L15 13Z"
                fill="white"
              />
            </svg>
            <span class=" text-center text-white">${count}</span>
          </div>
        </div>
      `,
    });
  }
}

const LeafletExtendedMarkers = { TextIcon, TextMarker, FollowerIcon };
export default LeafletExtendedMarkers;
