/**
 * Servicio API que utiliza el backend simulado en lugar de Firebase
 */
import mockBackendService, { Order, OrderItem, Product } from './mockBackendService';
import { OrderStatus } from './socketService';

class ApiService {
  private static instance: ApiService;
  
  private constructor() {
    console.log('API Service inicializado con backend simulado');
  }
  
  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }
  
  // Productos
  async getProducts(): Promise<Product[]> {
    try {
      return await mockBackendService.getProducts();
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  }
  
  // Pedidos
  async createOrder(orderData: { items: OrderItem[], total: number, userId: string }): Promise<Order> {
    try {
      return await mockBackendService.createOrder(orderData);
    } catch (error) {
      console.error('Error al crear pedido:', error);
      throw error;
    }
  }
  
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      return await mockBackendService.getOrder(orderId);
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      throw error;
    }
  }
  
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      return await mockBackendService.getUserOrders(userId);
    } catch (error) {
      console.error('Error al obtener pedidos del usuario:', error);
      throw error;
    }
  }
  
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    try {
      return await mockBackendService.updateOrderStatus(orderId, status);
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      throw error;
    }
  }
  
  async getPendingOrders(): Promise<Order[]> {
    try {
      return await mockBackendService.getPendingOrders();
    } catch (error) {
      console.error('Error al obtener pedidos pendientes:', error);
      throw error;
    }
  }
  
  async getPreparingOrders(): Promise<Order[]> {
    try {
      return await mockBackendService.getPreparingOrders();
    } catch (error) {
      console.error('Error al obtener pedidos en preparación:', error);
      throw error;
    }
  }
}

export default ApiService.getInstance();