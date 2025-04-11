/**
 * Servicio de notificaciones simulado
 */
import { Alert, Platform, Vibration } from 'react-native';
import { OrderStatus } from '../types/order';
import authService, { UserRole } from '../services/authService';

interface NotificationMessage {
  title: string;
  body: string;
  data?: {
    [key: string]: any;
  };
}

interface MessageCallback {
  (message: NotificationMessage): void;
}

class NotificationService {
  private static instance: NotificationService;
  private messageCallbacks: MessageCallback[] = [];
  private permissionsGranted: boolean = false;
  private deviceToken: string = '';
  private lastNotification: { title: string; message: string } | null = null;
  private notificationTimeout: ReturnType<typeof setTimeout> | null = null;
  
  private constructor() {
    console.log('Notification Service inicializado');
    
    // Generar un token simulado
    this.deviceToken = `mock-token-${Platform.OS}-${Date.now()}`;
  }
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  async requestPermissions(): Promise<boolean> {
    // Simulamos que el usuario acepta los permisos
    this.permissionsGranted = true;
    console.log('Permisos de notificación concedidos (simulado)');
    return true;
  }
  
  async getToken(): Promise<string> {
    if (!this.permissionsGranted) {
      await this.requestPermissions();
    }
    
    return this.deviceToken;
  }
  
  async registerUserToken(userId: string, token: string): Promise<void> {
    console.log(`Token registrado para usuario ${userId}: ${token}`);
  }
  
  subscribeToMessages(callback: MessageCallback): void {
    this.messageCallbacks.push(callback);
  }
  
  unsubscribeFromMessages(callback: MessageCallback): void {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }
  
  // Método para enviar notificaciones simuladas
  public async sendLocalNotification(title: string, body: string, force: boolean = false): Promise<void> {
    console.log('Enviando notificación local:', { title, body });
    
    // Verificar que el usuario actual debe recibir esta notificación
    const currentRole = await authService.getCurrentUserRole();
    
    // Si no se fuerza la notificación, verificar el rol adecuado para la notificación
    if (!force && !this.shouldShowNotificationForRole(title, currentRole)) {
      console.log(`Notificación suprimida para rol ${currentRole}:`, { title, body });
      return;
    }
    
    // Hacer vibrar el dispositivo para dar feedback táctil
    Vibration.vibrate(500);
    
    // Mostrar la alerta inmediatamente
    Alert.alert(
      title,
      body,
      [
        {
          text: 'OK',
          onPress: () => console.log('Notificación cerrada por el usuario')
        }
      ],
      { cancelable: false }
    );
  }
  
  // Determina si una notificación debe mostrarse para un rol específico
  private shouldShowNotificationForRole(title: string, role: UserRole): boolean {
    // Notificaciones para el Cliente
    if (role === UserRole.CUSTOMER) {
      return title.includes('Pedido Creado') || 
             title.includes('Pedido en Preparación') || 
             title.includes('Pedido en Camino') ||
             title.includes('¡Pedido Entregado!');
    }
    
    // Notificaciones para el Negocio
    if (role === UserRole.BUSINESS) {
      return title.includes('Nuevo Pedido');
    }
    
    // Notificaciones para el Repartidor
    if (role === UserRole.DELIVERY) {
      return title.includes('Pedido Listo para Entrega') || 
             title.includes('Nueva Entrega');
    }
    
    return true; // Por defecto, mostrar la notificación
  }
  
  async showNotification(title: string, message: string) {
    // Evitar notificaciones duplicadas
    if (
      this.lastNotification?.title === title &&
      this.lastNotification?.message === message
    ) {
      console.log('Notificación duplicada suprimida:', { title, message });
      return;
    }

    // Limpiar el timeout anterior si existe
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    // Guardar la última notificación
    this.lastNotification = { title, message };

    // Mostrar la alerta
    Alert.alert(title, message);

    // Limpiar la última notificación después de 3 segundos
    this.notificationTimeout = setTimeout(() => {
      this.lastNotification = null;
    }, 3000);
  }
  
  // Enviar notificación según el estado de la orden
  async sendOrderStatusNotification(orderId: string, status: OrderStatus): Promise<void> {
    const messages: Record<OrderStatus, { title: string; message: string }> = {
      [OrderStatus.PENDING]: {
        title: 'Pedido pendiente',
        message: `Tu pedido #${orderId} está pendiente de confirmación`
      },
      [OrderStatus.PREPARING]: {
        title: 'Pedido en preparación',
        message: `Tu pedido #${orderId} está siendo preparado`
      },
      [OrderStatus.ON_THE_WAY]: {
        title: 'Pedido en camino',
        message: `Tu pedido #${orderId} está en camino`
      },
      [OrderStatus.DELIVERED]: {
        title: 'Pedido entregado',
        message: `Tu pedido #${orderId} ha sido entregado`
      },
      [OrderStatus.CANCELLED]: {
        title: 'Pedido cancelado',
        message: `Tu pedido #${orderId} ha sido cancelado`
      }
    };

    const notification = messages[status];
    if (notification) {
      await this.showNotification(notification.title, notification.message);
    }
  }
  
  // Nuevos métodos para simular el flujo de notificaciones
  async notifyNewOrder(orderId: string, items: any[], total: number): Promise<void> {
    await this.showNotification(
      'Nuevo Pedido',
      `Has recibido un nuevo pedido #${orderId} por S/ ${total.toFixed(2)}`
    );
  }
  
  notifyOrderPreparing(orderId: string): void {
    this.sendLocalNotification('Pedido en preparación', `El pedido #${orderId} está siendo preparado`);
  }
  
  notifyOrderReady(orderId: string): void {
    this.sendLocalNotification('Pedido listo para entrega', `El pedido #${orderId} está listo para ser entregado`);
  }
  
  notifyOrderOnTheWay(orderId: string): void {
    this.sendLocalNotification('Pedido en camino', `El pedido #${orderId} está en camino a tu ubicación`);
  }
  
  notifyOrderDelivered(orderId: string): void {
    this.sendLocalNotification('¡Pedido entregado!', `El pedido #${orderId} ha sido entregado`);
  }
}

export default NotificationService.getInstance();