/**
 * Servicio API que utiliza el backend simulado en lugar de Firebase
 */
import mockBackendService, { Order, Product } from './mockBackendService';
import { OrderStatus } from '../types/order';
import socketService from './socketService';
import notificationService from './notificationService';
import authService, { UserRole } from './authService';

export class ApiService {
  private static instance: ApiService;
  private mockData: {
    products: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      image: any;
      ubication: string;
    }>;
  };
  
  private constructor() {
    console.log('API Service inicializado con backend simulado');
    this.mockData = {
      products: [
        {
          id: '1',
          name: 'Hamburguesa Clásica',
          description: 'Deliciosa hamburguesa con lechuga, tomate y queso',
          price: 15.90,
          image: require('../assets/images/hamburguesa.jpg'),
          ubication: 'Chiclayo, Perú'
        },
        {
          id: '2',
          name: 'Papas Fritas',
          description: 'Crujientes papas fritas con sal',
          price: 8.90,
          image: require('../assets/images/papas fritas.jpg'),
          ubication: 'Chiclayo, Perú'
        },
        {
          id: '3',
          name: 'Refresco',
          description: 'Bebida gaseosa 500ml',
          price: 4.90,
          image: require('../assets/images/refresco.jpg'),
          ubication: 'Chiclayo, Perú'
        },
        {
          id: '4',
          name: 'Ensalada',
          description: 'Ensalada fresca con aderezo',
          price: 12.90,
          image: require('../assets/images/ensalada.jpg'),
          ubication: 'Chiclayo, Perú'
        }
      ]
    };
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
  async createOrder(items: any[], total: number): Promise<any> {
    try {
      const orderData = {
        items,
        total,
        userId: 'customer-123' // Usuario por defecto para la simulación
      };
      
      const order = await mockBackendService.createOrder(orderData);
      
      // Emitir evento de socket
      await socketService.updateOrderStatus(order.id, OrderStatus.PENDING);
      
      // Notificar al negocio
      notificationService.notifyNewOrder(order.id, items, total);
      
      // Notificar al cliente que su pedido ha sido creado
      notificationService.sendLocalNotification(
        '¡Pedido Creado!', 
        `Tu pedido #${order.id} ha sido creado con éxito. Ahora está pendiente de confirmación.`
      );
      
      return order;
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
  
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      await mockBackendService.updateOrderStatus(orderId, status);
      
      // Emitir evento de socket
      await socketService.updateOrderStatus(orderId, status);
      
      // Notificar según el estado y el rol actual
      const currentRole = await authService.getCurrentUserRole();
      
      // Solo notificar si no es el repartidor actualizando el estado
      if (currentRole !== UserRole.DELIVERY) {
        switch (status) {
          case OrderStatus.PREPARING:
            notificationService.notifyOrderPreparing(orderId);
            break;
            
          case OrderStatus.ON_THE_WAY:
            notificationService.notifyOrderOnTheWay(orderId);
            break;
            
          case OrderStatus.DELIVERED:
            notificationService.notifyOrderDelivered(orderId);
            break;
        }
      }
      
      // Si el negocio termina de preparar el pedido, notificar al repartidor
      if (status === OrderStatus.PREPARING && currentRole === UserRole.BUSINESS) {
        notificationService.notifyOrderReady(orderId);
      }
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

  async getOrdersInWay(): Promise<Order[]> {
    try {
      return await mockBackendService.getOrdersInWay();
    } catch (error) {
      console.error('Error al obtener pedidos en camino:', error);
      throw error;
    }
  }
}

export default ApiService.getInstance();