/**
 * Adaptador del servicio de notificaciones para usar notificaciones locales
 * Este servicio sirve como compatibilidad para aplicaciones que esperan FCM
 */

import { Platform } from 'react-native';
import notificationService from './notificationService';

class FirebaseNotificationService {
  private static instance: FirebaseNotificationService;
  private isAvailable: boolean = false;
  
  private constructor() {
    console.log('FCM no disponible en Expo Go - usando notificaciones locales');
  }
  
  static getInstance(): FirebaseNotificationService {
    if (!FirebaseNotificationService.instance) {
      FirebaseNotificationService.instance = new FirebaseNotificationService();
    }
    return FirebaseNotificationService.instance;
  }
  
  async requestPermissions(): Promise<boolean> {
    return await notificationService.requestPermissions();
  }
  
  async getToken(): Promise<string> {
    console.log('FCM no disponible en Expo Go - usando identificador simulado');
    return await notificationService.getToken();
  }
  
  async registerUserToken(userId: string, token: string): Promise<void> {
    try {
      console.log(`Registrando token para usuario ${userId}`);
      await notificationService.registerUserToken(userId, token);
    } catch (error) {
      console.error('Error al registrar el token del usuario:', error);
      throw error;
    }
  }
  
  subscribeToMessages(callback: (message: any) => void): void {
    notificationService.subscribeToMessages(callback);
  }
  
  unsubscribeFromMessages(callback: (message: any) => void): void {
    notificationService.unsubscribeFromMessages(callback);
  }
  
  async sendNotification(token: string, notification: { title: string, body: string, data?: any }): Promise<void> {
    console.log('Enviando notificación simulada:', notification);
    notificationService.sendLocalNotification(notification.title, notification.body);
  }
}

export default FirebaseNotificationService.getInstance();