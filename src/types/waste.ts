export interface Product {
  id: string;
  name: string;
  description?: string;
  categoryName?: string;
  unitName: string;
  unitSymbol: string;
  perishable: boolean;
  shelfLifeDays?: number;
  minimumStock: number;
  averageCostPerUnit: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  categoryName?: string;
  unitName: string;
  unitSymbol: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minimumStock: number;
  earliestExpiry?: string;
  expiringSoonBatches: number;
  avgCostPerUnit: number;
  isLowStock: boolean;
  hasExpiringItems: boolean;
}

export interface WasteRecord {
  id: string;
  productName: string;
  wasteCategory: string;
  wasteStage: 'raw' | 'preparation' | 'cooking' | 'serving' | 'expired';
  quantity: number;
  totalCost: number;
  wasteDate: string;
  reason?: string;
  notes?: string;
  unitSymbol: string;
}

export interface WasteAnalytics {
  details: Array<{
    productName: string;
    wasteCategory: string;
    wasteStage: string;
    totalQuantity: number;
    totalCost: number;
    incidentCount: number;
    avgQuantityPerIncident: number;
    unitSymbol: string;
  }>;
  summary: {
    totalWasteCost: number;
    totalWasteQuantity: number;
    productsWasted: number;
    totalIncidents: number;
    avgCostPerIncident: number;
  };
}

export interface ExpiringItem {
  stockId: string;
  productName: string;
  currentQuantity: number;
  expiryDate: string;
  batchNumber?: string;
  unitSymbol: string;
  averageCostPerUnit: number;
  estimatedLoss: number;
  daysToExpiry: number;
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  type: 'weight' | 'volume' | 'count' | 'portion';
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface WasteCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}