export const tenantsMockData = [
  { 
    id: 1, 
    name: "Tech Corp", 
    email: "admin@techcorp.com", 
    joined: "2025-03-15", 
    status: "Active", 
    plan: "Classic", 
    expiry: "30/07/2025" 
  },
  { 
    id: 2, 
    name: "Startup XYZ", 
    email: "contact@startupxyz.com", 
    joined: "2025-04-10", 
    status: "Suspended", 
    plan: "Pro", 
    expiry: "30/07/2025" 
  },
  { 
    id: 3, 
    name: "Cloud Nine", 
    email: "info@cloudnine.io", 
    joined: "2025-01-20", 
    status: "Expired", 
    plan: "Classic", 
    expiry: "30/07/2025" 
  },
  { 
    id: 4, 
    name: "Data Flow", 
    email: "admin@dataflow.com", 
    joined: "2025-02-15", 
    status: "Active", 
    plan: "Pro", 
    expiry: "30/07/2025" 
  },
  { 
    id: 5, 
    name: "Cyber Shield", 
    email: "security@cybershield.net", 
    joined: "2025-05-05", 
    status: "Active", 
    plan: "Classic", 
    expiry: "30/07/2025" 
  },
  { 
    id: 6, 
    name: "Infinite Dev", 
    email: "hello@infinitedev.com", 
    joined: "2025-03-01", 
    status: "Suspended", 
    plan: "Pro", 
    expiry: "30/07/2025" 
  },
  
];

export const billingHistoryMock = {
  1: [
    { date: "2026-02-01", plan: "Classic", invoice: "INV-001245", amount: "$599", status: "Paid" },
    { date: "2026-01-01", plan: "Classic", invoice: "INV-001245", amount: "$599", status: "Paid" },
    { date: "2025-12-01", plan: "Classic", invoice: "INV-001245", amount: "$599", status: "Paid" },
    { date: "2025-11-01", plan: "Classic", invoice: "INV-001245", amount: "$599", status: "Paid" },
  ],
  2: [
    { date: "2026-01-01", plan: "Pro", invoice: "INV-002345", amount: "$999", status: "Paid" },
    { date: "2025-12-01", plan: "Pro", invoice: "INV-002345", amount: "$999", status: "Paid" },
  ],
  3: [
    { date: "2025-05-01", plan: "Classic", invoice: "INV-003456", amount: "$599", status: "Paid" },
  ],
  4: [
    { date: "2026-02-15", plan: "Pro", invoice: "INV-004567", amount: "$999", status: "Paid" },
  ],
  5: [
    { date: "2026-02-05", plan: "Classic", invoice: "INV-005678", amount: "$599", status: "Paid" },
  ],
  6: [
    { date: "2026-02-01", plan: "Pro", invoice: "INV-006789", amount: "$999", status: "Paid" },
  ]
};
