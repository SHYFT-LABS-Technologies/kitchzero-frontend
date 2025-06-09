import ApiClient from '../client';
import type { 
  InventoryItem, 
  WasteAnalytics, 
  ExpiringItem, 
  Product, 
  Unit, 
  Category, 
  WasteCategory, 
  Supplier 
} from '../../../types/waste';

export class WasteManagementAPI {
  private client = ApiClient.getInstance().client;

  // Inventory
  async getInventoryStatus(branchId: string): Promise<{ data: { inventory: InventoryItem[] } }> {
    const response = await this.client.get(`/waste-management/inventory/${branchId}`);
    return response.data;
  }

  async getExpiringItems(branchId: string, days: number = 7): Promise<{ data: { expiringItems: ExpiringItem[] } }> {
    const response = await this.client.get(`/waste-management/inventory/${branchId}/expiring?days=${days}`);
    return response.data;
  }

  async createInventoryPurchase(purchaseData: any): Promise<{ data: any }> {
    const response = await this.client.post('/waste-management/inventory/purchases', purchaseData);
    return response.data;
  }

  // Waste Records
  async createWasteRecord(wasteData: any): Promise<{ data: any }> {
    const response = await this.client.post('/waste-management/waste-records', wasteData);
    return response.data;
  }

  async getWasteAnalytics(branchId: string, startDate: string, endDate: string): Promise<{ data: WasteAnalytics }> {
    const response = await this.client.get(`/waste-management/analytics/${branchId}?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }

  // Master Data
  async getProducts(tenantId?: string): Promise<{ data: { products: Product[] } }> {
    const params = tenantId ? `?tenantId=${tenantId}` : '';
    const response = await this.client.get(`/waste-management/products${params}`);
    return response.data;
  }

  async createProduct(productData: any): Promise<{ data: any }> {
    const response = await this.client.post('/waste-management/products', productData);
    return response.data;
  }

  async getUnits(): Promise<{ data: { units: Unit[] } }> {
    const response = await this.client.get('/waste-management/units');
    return response.data;
  }

  async getCategories(tenantId?: string): Promise<{ data: { categories: Category[] } }> {
    const params = tenantId ? `?tenantId=${tenantId}` : '';
    const response = await this.client.get(`/waste-management/categories${params}`);
    return response.data;
  }

  async getWasteCategories(tenantId?: string): Promise<{ data: { wasteCategories: WasteCategory[] } }> {
    const params = tenantId ? `?tenantId=${tenantId}` : '';
    const response = await this.client.get(`/waste-management/waste-categories${params}`);
    return response.data;
  }

  async getSuppliers(tenantId?: string): Promise<{ data: { suppliers: Supplier[] } }> {
    const params = tenantId ? `?tenantId=${tenantId}` : '';
    const response = await this.client.get(`/waste-management/suppliers${params}`);
    return response.data;
  }
}

export const wasteManagementAPI = new WasteManagementAPI();