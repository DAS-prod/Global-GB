const BoxContext = createContext<BoxContextValue | null>(null);

const noop = () => {};

const SSR_BOX_FALLBACK: BoxContextValue = {
  lines: [],

  selectedBoxKg: 10,

  countryCode: "US",

  giftMode: false,

  drawerOpen: false,

  toastMessage: "",

  totalProductWeight: 0,

  packagingWeight: 0,

  totalWeight: 0,

  totalInr: 0,

  transportUsd: 0,

  itemCount: 0,

  minimumReached: false,

  remainingToMinimum: 5,

  selectedCountry:
    countries.find((country) => country.code === "US") ||
    countries[0],

  setSelectedBoxKg: noop,

  setCountryCode: noop,

  setGiftMode: noop,

  setDrawerOpen: noop,

  addBundle: noop,

  removeBundle: noop,

  decrementBundle: noop,

  clearBox: noop,

  replaceBox: noop,

  getBundle: () => undefined,

  getQuantity: () => 0,
};

const STORAGE_KEY = "gb-abroad-builder-v1";
