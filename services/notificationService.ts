/**
 * Servicio de notificaciones simulado
 */
import { Alert, Platform } from 'react-native';
import { OrderStatus } from './socketService';

interface NotificationMessage {
  title: string;
  body: string;
  data?: {
    [key: string]: string;
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
  
  private constructor() {
    console.log('Notification Service inicializado en modo simulado');
    
    // Generar un token simulado
    this.deviceToken = `mock-token-${Platform.OS}-${Date.now()}`;
  }
  
  static getInstance(): NotificationService {
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
  sendLocalNotification(notification: NotificationMessage): void {
    console.log('Notificación local enviada:', notification);
    
    // Simular recepción de notificación
    this.messageCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error en callback de notificación:', error);
      }
    });
    
    // En desarrollo también mostramos un Alert
    Alert.alert(notification.title, notification.body);
  }
  
  // Enviar notificación según el estado de la orden
  sendOrderStatusNotification(orderId: string, status: OrderStatus): void {
    const statusMessages: Record<OrderStatus, {title: string, body: string}> = {
      [OrderStatus.PENDING]: {
        title: 'Pedido Recibido',
        body: `Tu pedido #${orderId} ha sido recibido y está pendiente.`
      },
      [OrderStatus.PREPARING]: {
        title: 'Pedido en Preparación',
        body: `Tu pedido #${orderId} está siendo preparado.`
      },
      [OrderStatus.ON_THE_WAY]: {
        title: 'Pedido en Camino',
        body: `¡Tu pedido #${orderId} está en camino!`
      },
      [OrderStatus.DELIVERED]: {
        title: 'Pedido Entregado',
        body: `Tu pedido #${orderId} ha sido entregado. ¡Buen provecho!`
      }
    };
    
    const messageData = statusMessages[status];
    
    this.sendLocalNotification({
      title: messageData.title,
      body: messageData.body,
      data: {
        orderId,
        status
      }
    });
  }
}

export default NotificationService.getInstance();