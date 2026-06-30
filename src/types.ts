export interface TechDiagnostics {
  batteryHealth: number; // e.g. 96
  screenStatus: string; // e.g. "Perfecto" or "Excelente"
  storageStatus: string; // e.g. "SSD 512GB (Salud 100%)"
  cpuStatus: string; // e.g. "Intel Core i7 / Apple Silicon"
  certifiedDate: string; // e.g. "2026-06-20"
  serialNumber: string; // e.g. "EC-LT-9482"
  co2SavedProduction: number; // Extra production-level CO2 saved in kg (e.g. 250kg for laptops)
  modelYear: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  impact: string;
  co2Saved: number; // in kg
  rating: number;
  stock: number;
  isEcoTech?: boolean;
  diagnostics?: TechDiagnostics;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  participants: number;
  category: string;
  duration: string;
}

export interface Habit {
  id: string;
  name: string;
  category: "Transporte" | "Residuos" | "Alimentación" | "Energía";
  pointsValue: number;
  completedDays: string[]; // dates of completion (e.g., "2026-06-25")
  streak: number;
  icon: string;
}

export interface RecyclingPoint {
  id: string;
  name: string;
  address: string;
  zone: string;
  materials: string[];
  pointsPerKg: number;
  hours: string;
  lat: number; // Relative position on the simplified map (0-100)
  lng: number; // Relative position on the simplified map (0-100)
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export interface FootprintData {
  transportation: {
    type: "car" | "public" | "active";
    fuel?: "gasoline" | "diesel_hybrid";
    distance: number; // monthly km
  };
  energy: {
    kwh: number; // monthly electricity
    gas: number; // gas cylinders per month
  };
  diet: "heavy-meat" | "moderate-meat" | "vegetarian" | "vegan";
  waste: {
    recycle: boolean;
    compost: boolean;
  };
}

export interface FootprintResult {
  feedback: string;
  criticalArea: string;
  actionPlan: string[];
  estimatedSavings: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  trackingNumber?: string;
  hasAccount?: boolean;
  password?: string;
  ecoPoints?: number;
  createdAt: string;
}

export interface UserSubmittedProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  suggestedPrice: number;
  co2Saved: number;
  specs: {
    batteryHealth?: string;
    screenStatus?: string;
    storageStatus?: string;
    cpuStatus?: string;
  };
  customerEmail: string;
  customerName: string;
  status: "pending_review" | "approved" | "rejected";
  daysRemaining: number;
  createdAt: string;
}

