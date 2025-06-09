import { api } from '../api';
import type { 
  InventoryItem, 
  WasteAnalytics, 
  ExpiringItem, 
  Product, 
  Unit, 
  Category, 
  WasteCategory, 
  Supplier 
} from '../../types/waste';

export const wasteManagementAPI = {
  // Inventory
  getInventoryStatus: (branchId: string) =>
    api.get<{ inventory: InventoryItem[] }>(`/waste-management/inventory/${branchId}`),

  getExpiringItems: (branchId: string, days: number = 7) =>
    api.get<{ expiringItems: ExpiringItem[] }>(`/waste-management/inventory/${branchId}/expiring?days=${days}`),

  createInventoryPurchase: (purchaseData: any) =>
    api.post('/waste-management/inventory/purchases', purchaseData),

  // Waste Records
  createWasteRecord: (wasteData: any) =>
    api.post('/waste-management/waste-records', wasteData),

  getWasteAnalytics: (branchId: string, startDate: string, endDate: string) =>
    api.get<WasteAnalytics>(`/waste-management/analytics/${branchId}?startDate=${startDate}&endDate=${endDate}`),

  // Master Data
  getProducts: (tenantId?: string) => {
    const params = tenantId ? `?tenantId=${tenantId}` : '';
    return api.get<{ products: Product[] }>(`/waste-management/products${params}`);
  },

  createProduct: (productData: any) =>
    api.post('/waste-management/products', productData),

  getUnits: () =>
    api.get<{ units: Unit[] }>('/waste-management/units'),

  getCategories: (tenantId?: string) => {
    const params = tenantId ? `?tenantId=${tenantId}` : '';
    return api.get<{ categories: Category[] }>(`/waste-management/categories${params}`);
  },

  getWasteCategories: (tenantId?: string) => {
    const params = tenantId ? `?tenantId=${tenantId}` : '';
    return api.get<{ wasteCategories: WasteCategory[] }>(`/waste-management/waste-categories${params}`);
  },

  getSuppliers: (tenantId?: string) => {
    const params = tenantId ? `?tenantId=${tenantId}` : '';
    return api.get<{ suppliers: Supplier[] }>(`/waste-management/suppliers${params}`);
  },
};