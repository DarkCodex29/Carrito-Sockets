/**
 * Servicio de simulación de sockets
 * Esta versión no utiliza socket.io-client para evitar errores de addEventListener
 */

import { io, Socket } from 'socket.io-client';
import { OrderStatus } from '../types/order';
import authService, { UserRole } from './authService';
import notificationService from './notificationService';

interface Order {
  id: string;
  status: OrderStatus;
  items: any[];
  total: number;
}

type StatusUpdateCallback = (data: { orderId: string; status: OrderStatus }) => void;
type OrderCallback = (order: Order) => void;

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Simulamos conexión con el servidor
      this.socket = io('http://localhost:3000', {
        autoConnect: false
      });

      // Simulamos eventos de socket
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('Socket service initialized');
      
      // Ya no simulamos eventos automáticos para seguir el flujo controlado
    } catch (error) {
      console.error('Error initializing socket service:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Eventos para Cliente
    this.socket.on('orderStatusChanged', async (data: { orderId: string; status: OrderStatus }) => {
      const currentRole = await authService.getCurrentUserRole();
      if (currentRole === UserRole.CUSTOMER) {
        const message = this.getStatusMessage(data.status);
        await notificationService.showNotification('Actualización de Pedido', message);
      }
    });

    // Eventos para Negocio
    this.socket.on('newOrder', async (data: { orderId: string }) => {
      const currentRole = await authService.getCurrentUserRole();
      if (currentRole === UserRole.BUSINESS) {
        await notificationService.showNotification(
          'Nuevo Pedido',
          `Has recibido un nuevo pedido #${data.orderId}`
        );
      }
    });

    // Eventos para Repartidor
    this.socket.on('deliveryRequest', async (data: { orderId: string; location: string }) => {
      const currentRole = await authService.getCurrentUserRole();
      if (currentRole === UserRole.DELIVERY) {
        await notificationService.showNotification(
          'Nueva Entrega',
          `Nuevo pedido #${data.orderId} para entregar en ${data.location}`
        );
      }
    });
  }

  private getStatusMessage(status: OrderStatus): string {
    const messages: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Tu pedido está pendiente de confirmación',
      [OrderStatus.PREPARING]: 'Tu pedido está siendo preparado',
      [OrderStatus.ON_THE_WAY]: 'Tu pedido está en camino',
      [OrderStatus.DELIVERED]: 'Tu pedido ha sido entregado',
      [OrderStatus.CANCELLED]: 'Tu pedido ha sido cancelado'
    };
    return messages[status] || 'Estado actualizado';
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Simulamos la actualización
      console.log(`Actualizando estado del pedido ${orderId} a ${status}`);
      
      // Emitir el evento a todos los callbacks registrados directamente
      if (this._orderStatusChangedCallbacks && this._orderStatusChangedCallbacks.length > 0) {
        const eventData = { orderId, status };
        console.log(`Emitiendo evento directo: orderStatusChanged`, eventData);
        this._orderStatusChangedCallbacks.forEach(callback => {
          callback(eventData);
        });
      }
      
      // Simulamos el evento de cambio de estado vía socket
      if (this.socket) {
        this.socket.emit('orderStatusUpdate', { orderId, status });
      }

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  async requestDelivery(orderId: string, location: string) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Simulamos la solicitud de entrega
      console.log(`Solicitando entrega para pedido ${orderId} en ${location}`);
      
      // Simulamos el evento de solicitud de entrega
      if (this.socket) {
        this.socket.emit('deliveryRequest', { orderId, location });
      }

      return true;
    } catch (error) {
      console.error('Error requesting delivery:', error);
      return false;
    }
  }

  async completeOrder(orderId: string) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Simulamos la finalización del pedido
      console.log(`Finalizando pedido ${orderId}`);
      
      // Simulamos el evento de finalización
      if (this.socket) {
        this.socket.emit('orderCompleted', { orderId });
      }

      return true;
    } catch (error) {
      console.error('Error completing order:', error);
      return false;
    }
  }

  // Lista de callbacks registrados
  private _orderStatusChangedCallbacks: StatusUpdateCallback[] = [];

  // Métodos públicos para manejar eventos
  onOrderStatusChanged(callback: StatusUpdateCallback) {
    if (!this.socket) return;
    this.socket.on('orderStatusChanged', callback);
    
    // También registramos el callback en nuestra lista interna
    this._orderStatusChangedCallbacks.push(callback);
    console.log(`Callback para orderStatusChanged registrado. Total: ${this._orderStatusChangedCallbacks.length}`);
  }

  offOrderStatusChanged(callback: StatusUpdateCallback) {
    if (!this.socket) return;
    this.socket.off('orderStatusChanged', callback);
    
    // También lo eliminamos de nuestra lista interna
    this._orderStatusChangedCallbacks = this._orderStatusChangedCallbacks.filter(cb => cb !== callback);
    console.log(`Callback para orderStatusChanged eliminado. Quedan: ${this._orderStatusChangedCallbacks.length}`);
  }

  // Método para suscribirse a actualizaciones de pedidos
  subscribeToOrderUpdates(callback: (orderId: string, status: OrderStatus) => void) {
    if (!this.isInitialized) {
      this.initialize();
    }

    // Registrar el callback
    const wrappedCallback = (data: { orderId: string; status: OrderStatus }) => {
      callback(data.orderId, data.status);
    };

    this.onOrderStatusChanged(wrappedCallback);

    // Retornar función para desuscribirse
    return () => {
      this.offOrderStatusChanged(wrappedCallback);
    };
  }
}

export default SocketService.getInstance();