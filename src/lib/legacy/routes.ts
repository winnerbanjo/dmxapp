export interface LegacyRouteGroup {
  basePath: string;
  description: string;
  methods: string[];
  notes?: string;
}

export const LEGACY_ROUTE_GROUPS: LegacyRouteGroup[] = [
  {
    basePath: "/admins",
    description: "Admin accounts, admin profile upload, and old admin login.",
    methods: ["GET", "POST", "PATCH"],
  },
  {
    basePath: "/users",
    description: "Customer accounts, auth, wallet top-up by admin, and password flows.",
    methods: ["GET", "POST", "PUT", "PATCH"],
  },
  {
    basePath: "/shipments",
    description: "Core shipment CRUD, rate checks, DHL booking, status updates, rider assignment, imports.",
    methods: ["GET", "POST", "PUT", "PATCH"],
    notes: "DHL remains backed by the old service through the compatibility proxy until native port is complete.",
  },
  {
    basePath: "/wallet",
    description: "Wallet transactions, Paystack top-up init, and top-up validation.",
    methods: ["GET", "POST"],
  },
  {
    basePath: "/hooks",
    description: "Paystack webhook receiver.",
    methods: ["POST"],
  },
  {
    basePath: "/riders",
    description: "Rider accounts, rider auth, status, payout, verification, and reset flows.",
    methods: ["GET", "POST", "PATCH"],
  },
  {
    basePath: "/branches",
    description: "Branch records used by shipment operations.",
    methods: ["GET", "POST", "PUT"],
  },
  {
    basePath: "/carriers",
    description: "Carrier records including DHL, GIG, and Aramex metadata.",
    methods: ["GET"],
  },
  {
    basePath: "/countries",
    description: "Country and DHL zone lookup data.",
    methods: ["GET"],
  },
  {
    basePath: "/currencies",
    description: "Currency lookup data.",
    methods: ["GET"],
  },
  {
    basePath: "/charges",
    description: "Shipment charge rules.",
    methods: ["GET"],
  },
  {
    basePath: "/contacts",
    description: "Shipment contact address book records.",
    methods: ["GET"],
  },
  {
    basePath: "/cargos",
    description: "Cargo lookup records.",
    methods: ["GET"],
  },
  {
    basePath: "/packaging-types",
    description: "Packaging lookup records.",
    methods: ["GET"],
  },
  {
    basePath: "/invoice-types",
    description: "DHL invoice type lookup records.",
    methods: ["GET"],
  },
  {
    basePath: "/shipping-terms",
    description: "DHL incoterm/shipping term lookup records.",
    methods: ["GET"],
  },
  {
    basePath: "/export-reasons",
    description: "DHL export reason lookup records.",
    methods: ["GET"],
  },
  {
    basePath: "/invoice",
    description: "Legacy invoice records.",
    methods: ["GET"],
  },
  {
    basePath: "/auth",
    description: "Expired-token/logout compatibility endpoint.",
    methods: ["GET", "DELETE"],
  },
];

export const LEGACY_PROXY_PREFIX = "/api/legacy/proxy";

