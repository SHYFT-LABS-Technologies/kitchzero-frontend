import ApiClient from '../client';
import type { AxiosInstance } from 'axios';

export interface CreateWasteRecordData {
  tenantId?: string;
  branchId: string;
  productId: string;
  wasteCategoryId?: string;
  stockId?: string;
  wasteDate: string;
  quantity: number;
  costPerUnit?: number;
  reason?: string;
  wasteStage: 'raw' | 'preparation' | 'cooking' | 'serving' | 'expired';
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  categoryName?: string;
  unitSymbol: string;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  minimumStock: number;
  isLowStock: boolean;
  hasExpiringItems: boolean;
  perishable: boolean;
  averageCostPerUnit: number;
  statusLevel: 'good' | 'attention' | 'warning' | 'critical';
}

export interface ExpiringItem {
  stockId: string;
  productId: string;
  productName: string;
  unitSymbol: string;
  currentQuantity: number;
  expiryDate: string;
  daysToExpiry: number;
  batchNumber?: string;
  estimatedLoss: number;
}

export interface WasteAnalytics {
  summary: {
    totalWasteCost: number;
    totalIncidents: number;
    productsWasted: number;
    avgCostPerIncident: number;
  };
  details: Array<{
    productName: string;
    categoryName?: string;
    wasteCategory?: string;
    wasteStage: string;
    totalQuantity: number;
    totalCost: number;
    incidentCount: number;
    unitSymbol: string;
  }>;
  categoryBreakdown?: Array<{
    categoryName: string;
    categoryCost: number;
    categoryQuantity: number;
    productsInCategory: number;
  }>;
  timePatterns?: Array<{
    dayOfWeek: number;
    dayName: string;
    dailyWasteCost: number;
    daysRecorded: number;
  }>;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WasteCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  type: 'weight' | 'volume' | 'count' | 'portion';
  baseUnit?: string;
  conversionFactor: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  unitId: string;
  unitSymbol: string;
  perishable: boolean;
  shelfLifeDays?: number;
  minimumStock: number;
  averageCostPerUnit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSettings {
  default_currency: string;
  currency_symbol: string;
  supported_currencies: string[];
  waste_alert_threshold: number;
  inventory_low_stock_threshold: number;
  fifo_enforcement: boolean;
  country_code?: string;
  locale?: string;
}

class WasteManagementAPI {
  private client: AxiosInstance;

  constructor() {
    // Use the existing ApiClient singleton
    this.client = ApiClient.getInstance().client;
  }

  // ==========================================
  // INVENTORY MANAGEMENT
  // ==========================================

  /**
   * Get inventory status for a branch
   */
  async getInventoryStatus(branchId: string): Promise<{ data: { inventory: InventoryItem[] } }> {
    const response = await this.client.get(`/waste-management/inventory/${branchId}`);
    return response.data;
  }

  /**
   * Get enhanced inventory status with FIFO logic
   */
  async getInventoryStatusEnhanced(branchId: string): Promise<{ data: { inventory: InventoryItem[] } }> {
    const response = await this.client.get(`/waste-management/inventory/${branchId}/enhanced`);
    return response.data;
  }

  /**
   * Get expiring items for a branch
   */
  async getExpiringItems(branchId: string, days: number = 7): Promise<{ data: { expiringItems: ExpiringItem[] } }> {
    const response = await this.client.get(`/waste-management/inventory/${branchId}/expiring?days=${days}`);
    return response.data;
  }

  /**
   * Get FIFO recommendations for inventory usage
   */
  async getFIFORecommendations(branchId: string, productId?: string): Promise<{ data: any[] }> {
    const params = productId ? `?productId=${productId}` : '';
    const response = await this.client.get(`/waste-management/inventory/${branchId}/fifo-recommendations${params}`);
    return response.data;
  }

  // ==========================================
  // WASTE MANAGEMENT
  // ==========================================

  /**
   * Get waste analytics for a branch and date range
   */
  async getWasteAnalytics(branchId: string, startDate: string, endDate: string): Promise<{ data: WasteAnalytics }> {
    const response = await this.client.get(
      `/waste-management/analytics/${branchId}?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  /**
   * Get enhanced waste analytics with detailed breakdown
   */
  async getEnhancedWasteAnalytics(branchId: string, startDate: string, endDate: string): Promise<{ data: WasteAnalytics }> {
    const response = await this.client.get(
      `/waste-management/analytics/${branchId}/enhanced?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  /**
   * Create a new waste record
   */
  async createWasteRecord(wasteData: CreateWasteRecordData): Promise<{ data: { wasteRecord: any } }> {
    const response = await this.client.post('/waste-management/waste-records', wasteData);
    return response.data;
  }

  /**
   * Create smart waste record with automatic FIFO enforcement
   */
  async createSmartWasteRecord(wasteData: CreateWasteRecordData): Promise<{ data: { wasteRecord: any } }> {
    const response = await this.client.post('/waste-management/waste-records/smart', wasteData);
    return response.data;
  }

  /**
   * Get waste records for a branch
   */
  async getWasteRecords(branchId: string, params?: {
    startDate?: string;
    endDate?: string;
    productId?: string;
    wasteCategoryId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: { wasteRecords: any[], total: number } }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await this.client.get(
      `/waste-management/waste-records/${branchId}?${queryParams.toString()}`
    );
    return response.data;
  }

  // ==========================================
  // MASTER DATA - CATEGORIES
  // ==========================================

  /**
   * Get all categories for a tenant
   */
  async getCategories(tenantId?: string): Promise<{ data: { categories: Category[] } }> {
    const params = tenantId ? `?tenantId=${tenantId}` : '';
    const response = await this.client.get(`/waste-management/categories${params}`);
    return response.data;
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: {
    tenantId?: string;
    name: string;
    description?: string;
  }): Promise<{ data: { category: Category } }> {
    const response = await this.client.post('/waste-management/categories', categoryData);
    return response.data;
  }

  /**
   * Update a category
   */
  async updateCategory(categoryId: string, updateData: {
    name?: string;
    description?: string;
  }): Promise<{ data: { category: Category } }> {
    const response = await this.client.put(`/waste-management/categories/${categoryId}`, updateData);
    return response.data;
  }

  /**
   * Delete a category
   */
  async deleteCategory(categoryId: string): Promise<{ data: any }> {
    const response = await this.client.delete(`/waste-management/categories/${categoryId}`);
    return response.data;
  }

  // ==========================================
  // MASTER DATA - WASTE CATEGORIES
  // ==========================================

  /**
   * Get all waste categories for a tenant
   */
  async getWasteCategories(tenantId?: string): Promise<{ data: { wasteCategories: WasteCategory[] } }> {
    const params = tenantId ? `?tenantId=${tenantId}` : '';
    const response = await this.client.get(`/waste-management/waste-categories${params}`);
    return response.data;
  }

  /**
   * Create a new waste category
   */
  async createWasteCategory(wasteCategoryData: {
    tenantId?: string;
    name: string;
    description?: string;
    color?: string;
  }): Promise<{ data: { wasteCategory: WasteCategory } }> {
    const response = await this.client.post('/waste-management/waste-categories', wasteCategoryData);
    return response.data;
  }

  /**
   * Update a waste category
   */
  async updateWasteCategory(wasteCategoryId: string, updateData: {
    name?: string;
    description?: string;
    color?: string;
  }): Promise<{ data: { wasteCategory: WasteCategory } }> {
    const response = await this.client.put(`/waste-management/waste-categories/${wasteCategoryId}`, updateData);
    return response.data;
  }

  /**
   * Delete a waste category
   */
  async deleteWasteCategory(wasteCategoryId: string): Promise<{ data: any }> {
    const response = await this.client.delete(`/waste-management/waste-categories/${wasteCategoryId}`);
    return response.data;
  }

  // ==========================================
  // MASTER DATA - UNITS
  // ==========================================

  /**
   * Get all units of measurement
   */
  async getUnits(): Promise<{ data: { units: Unit[] } }> {
    const response = await this.client.get('/waste-management/units');
    return response.data;
  }

  // ==========================================
  // MASTER DATA - PRODUCTS
  // ==========================================

  /**
   * Get all products for a tenant
   */
  async getProducts(tenantId?: string): Promise<{ data: { products: Product[] } }> {
    const params = tenantId ? `?tenantId=${tenantId}` : '';
    const response = await this.client.get(`/waste-management/products${params}`);
    return response.data;
  }

  /**
   * Create a new product
   */
  async createProduct(productData: {
    tenantId?: string;
    name: string;
    description?: string;
    categoryId?: string;
    unitId: string;
    perishable?: boolean;
    shelfLifeDays?: number;
    minimumStock?: number;
    averageCostPerUnit?: number;
  }): Promise<{ data: { product: Product } }> {
    const response = await this.client.post('/waste-management/products', productData);
    return response.data;
  }

  /**
   * Update a product
   */
  async updateProduct(productId: string, updateData: {
    name?: string;
    description?: string;
    categoryId?: string;
    unitId?: string;
    perishable?: boolean;
    shelfLifeDays?: number;
    minimumStock?: number;
    averageCostPerUnit?: number;
  }): Promise<{ data: { product: Product } }> {
    const response = await this.client.put(`/waste-management/products/${productId}`, updateData);
    return response.data;
  }

  /**
   * Delete a product
   */
  async deleteProduct(productId: string): Promise<{ data: any }> {
    const response = await this.client.delete(`/waste-management/products/${productId}`);
    return response.data;
  }

  // ==========================================
  // MASTER DATA - SUPPLIERS
  // ==========================================

  /**
   * Get all suppliers for a tenant
   */
  async getSuppliers(tenantId?: string): Promise<{ data: { suppliers: Supplier[] } }> {
    const params = tenantId ? `?tenantId=${tenantId}` : '';
    const response = await this.client.get(`/waste-management/suppliers${params}`);
    return response.data;
  }

  /**
   * Create a new supplier
   */
  async createSupplier(supplierData: {
    tenantId?: string;
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
  }): Promise<{ data: { supplier: Supplier } }> {
    const response = await this.client.post('/waste-management/suppliers', supplierData);
    return response.data;
  }

  /**
   * Update a supplier
   */
  async updateSupplier(supplierId: string, updateData: {
    name?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
  }): Promise<{ data: { supplier: Supplier } }> {
    const response = await this.client.put(`/waste-management/suppliers/${supplierId}`, updateData);
    return response.data;
  }

  /**
   * Delete a supplier
   */
  async deleteSupplier(supplierId: string): Promise<{ data: any }> {
    const response = await this.client.delete(`/waste-management/suppliers/${supplierId}`);
    return response.data;
  }

  // ==========================================
  // SYSTEM SETTINGS
  // ==========================================

  /**
   * Get system settings
   */
  async getSystemSettings(): Promise<{ data: SystemSettings }> {
    const response = await this.client.get('/waste-management/settings');
    return response.data;
  }

  /**
   * Update system settings (super admin only)
   */
  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<{ data: SystemSettings }> {
    const response = await this.client.put('/waste-management/settings', settings);
    return response.data;
  }

  // ==========================================
  // PURCHASE MANAGEMENT
  // ==========================================

  /**
   * Get purchase records for a branch
   */
  async getPurchases(branchId: string, params?: {
    startDate?: string;
    endDate?: string;
    supplierId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: { purchases: any[], total: number } }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await this.client.get(
      `/waste-management/purchases/${branchId}?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Create a new purchase record
   */
  async createPurchase(purchaseData: {
    tenantId?: string;
    branchId: string;
    supplierId?: string;
    purchaseDate: string;
    invoiceNumber?: string;
    totalAmount?: number;
    currency?: string;
    items: Array<{
      productId: string;
      quantity: number;
      unitCost: number;
      totalCost: number;
      expiryDate?: string;
      batchNumber?: string;
      receivedDate: string;
    }>;
  }): Promise<{ data: { purchase: any } }> {
    const response = await this.client.post('/waste-management/purchases', purchaseData);
    return response.data;
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Health check for waste management API
   */
  async healthCheck(): Promise<{ data: { status: string; timestamp: string } }> {
    const response = await this.client.get('/waste-management/health');
    return response.data;
  }

  /**
   * Get dashboard summary for waste management
   */
  async getDashboardSummary(branchId: string): Promise<{ data: any }> {
    const response = await this.client.get(`/waste-management/dashboard/${branchId}`);
    return response.data;
  }
}

// Export singleton instance
export const wasteManagementAPI = new WasteManagementAPI();
export default wasteManagementAPI;