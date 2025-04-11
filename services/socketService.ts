/**
 * Servicio de simulación de sockets
 * Esta versión no utiliza socket.io-client para evitar errores de addEventListener
 */

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  ON_THE_WAY = 'ON_THE_WAY',
  DELIVERED = 'DELIVERED'
}

interface Order {
  id: string;
  status: OrderStatus;
  items: any[];
  total: number;
}

type StatusUpdateCallback = (data: { orderId: string; status: OrderStatus }) => void;
type OrderCallback = (order: Order) => void;

class SocketService {
  private static instance: SocketService;
  private listeners: Record<string, Array<Function>> = {};
  private userId: string | null = null;
  private connected: boolean = false;

  private constructor() {
    this.listeners = {};
  }

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(userId: string): void {
    this.userId = userId;
    this.connected = true;
    console.log(`[Socket Simulado] Conectado como: ${userId}`);
    
    // Simular evento de conexión exitosa
    setTimeout(() => {
      this.triggerEvent('connect', {});
    }, 100);
  }

  disconnect(): void {
    if (!this.connected) return;
    
    this.connected = false;
    this.userId = null;
    console.log('[Socket Simulado] Desconectado');
    
    // Limpiar todos los listeners
    this.listeners = {};
    
    // Simular evento de desconexión
    this.triggerEvent('disconnect', {});
  }

  // Registrar un listener para cualquier evento
  on(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Disparar un evento manualmente
  private triggerEvent(event: string, data: any): void {
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error en listener de evento "${event}":`, error);
      }
    });
  }

  // Suscribirse a actualizaciones de estado
  subscribeToStatusUpdates(callback: StatusUpdateCallback): void {
    this.on('status:update', callback);
    console.log('[Socket Simulado] Suscrito a actualizaciones de estado');
  }

  // Suscribirse a actualizaciones de un pedido específico
  subscribeToOrderUpdates(orderId: string, callback: OrderCallback): void {
    const eventName = `order:${orderId}`;
    this.on(eventName, callback);
    console.log(`[Socket Simulado] Suscrito a actualizaciones del pedido: ${orderId}`);
  }

  // Emitir actualización de estado
  emitStatusUpdate(orderId: string, status: OrderStatus): void {
    if (!this.connected) {
      console.warn('[Socket Simulado] No conectado. No se puede emitir actualización.');
      return;
    }
    
    const updateData = { orderId, status };
    console.log('[Socket Simulado] Emitiendo actualización de estado:', updateData);
    
    // Simular latencia de red
    setTimeout(() => {
      this.triggerEvent('status:update', updateData);
    }, 200);
  }

  // Emitir nuevo pedido
  emitNewOrder(order: Order): void {
    if (!this.connected) {
      console.warn('[Socket Simulado] No conectado. No se puede emitir nuevo pedido.');
      return;
    }
    
    console.log('[Socket Simulado] Emitiendo nuevo pedido:', order);
    
    // Simular latencia de red
    setTimeout(() => {
      this.triggerEvent('order:new', order);
      this.triggerEvent(`order:${order.id}`, order);
    }, 200);
  }
}

export default SocketService.getInstance();