/** Demo customers for Admin and Merchant (Mubarak) Customers tabs. */

export type DemoCustomer = {
  name: string;
  phone: string;
  city: string;
  orderCount: number;
  lastOrder?: string;
  email?: string;
};

const DEMO_CUSTOMERS_BASE: DemoCustomer[] = [
  { name: "Adebayo Okonkwo", phone: "+234 801 234 5678", city: "Lagos", orderCount: 12, lastOrder: "15 Feb 2026", email: "adebayo@example.com" },
  { name: "Chioma Nwosu", phone: "+234 802 345 6789", city: "Abuja", orderCount: 8, lastOrder: "14 Feb 2026", email: "chioma@example.com" },
  { name: "Ibrahim Musa", phone: "+234 803 456 7890", city: "Kano", orderCount: 24, lastOrder: "14 Feb 2026", email: "ibrahim@example.com" },
  { name: "Funke Adeyemi", phone: "+234 804 567 8901", city: "Port Harcourt", orderCount: 5, lastOrder: "13 Feb 2026", email: "funke@example.com" },
  { name: "Emeka Okafor", phone: "+234 805 678 9012", city: "Enugu", orderCount: 31, lastOrder: "12 Feb 2026", email: "emeka@example.com" },
  { name: "Ngozi Eze", phone: "+234 806 789 0123", city: "Lagos", orderCount: 19, lastOrder: "11 Feb 2026", email: "ngozi@example.com" },
  { name: "Tunde Bakare", phone: "+234 807 890 1234", city: "Ibadan", orderCount: 7, lastOrder: "10 Feb 2026", email: "tunde@example.com" },
  { name: "Amaka Nnamdi", phone: "+234 808 901 2345", city: "Abuja", orderCount: 14, lastOrder: "9 Feb 2026", email: "amaka@example.com" },
  { name: "Chukwuemeka Obi", phone: "+234 809 012 3456", city: "Onitsha", orderCount: 22, lastOrder: "8 Feb 2026", email: "chukwu@example.com" },
  { name: "Folake Adebisi", phone: "+234 810 123 4567", city: "Lagos", orderCount: 11, lastOrder: "7 Feb 2026", email: "folake@example.com" },
  { name: "Yusuf Bello", phone: "+234 811 234 5678", city: "Kano", orderCount: 16, lastOrder: "6 Feb 2026", email: "yusuf@example.com" },
  { name: "Amina Sani", phone: "+234 812 345 6789", city: "Kaduna", orderCount: 9, lastOrder: "5 Feb 2026", email: "amina@example.com" },
  { name: "Oluwaseun Adeyinka", phone: "+234 813 456 7890", city: "Lagos", orderCount: 28, lastOrder: "4 Feb 2026", email: "seun@example.com" },
  { name: "Ifeanyi Nwankwo", phone: "+234 814 567 8901", city: "Enugu", orderCount: 13, lastOrder: "3 Feb 2026", email: "ifeanyi@example.com" },
  { name: "Zainab Mohammed", phone: "+234 815 678 9012", city: "Abuja", orderCount: 17, lastOrder: "2 Feb 2026", email: "zainab@example.com" },
];

/** 10 customers (Admin Customers tab). */
export const DEMO_CUSTOMERS_10: DemoCustomer[] = DEMO_CUSTOMERS_BASE.slice(0, 10);

/** 15 regular customers for Merchant (Mubarak) Customers tab. */
export const MERCHANT_DEMO_CUSTOMERS_15: DemoCustomer[] = DEMO_CUSTOMERS_BASE;
