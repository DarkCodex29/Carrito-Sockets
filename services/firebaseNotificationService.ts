import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Servicio unificado de notificaciones que usa principalmente notificaciones locales de Expo
 * Ya que Firebase Messaging no está disponible en Expo Go
 */
class NotificationService {
  private static instance: NotificationService;

  private constructor() {
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Método que podemos llamar después de crear la instancia
  async configureLocalNotifications() {
    return Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  // Inicializar - Método simplificado pues no usaremos FCM en Expo Go
  async init(): Promise<void> {
    console.log('Servicio de notificaciones inicializado (modo local)');
    return;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      // Solicitar permisos para las notificaciones de Expo
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('No se pudo obtener el permiso para las notificaciones');
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (error) {
      console.error('Error al solicitar permisos de notificación:', error);
      return false;
    }
  }

  // Métodos de Firebase adaptados para funcionar localmente
  async getToken(): Promise<string | null> {
    console.log('FCM no disponible en Expo Go - usando identificador simulado');
    return 'expo-go-sim-token';
  }

  async registerUserToken(userId: string, token: string) {
    try {
      if (!token) {
        console.log('No hay token para registrar');
        return;
      }

      // Guardamos datos mínimos para simular
      await setDoc(doc(db, 'userTokens', userId), {
        token,
        platform: Platform.OS,
        updatedAt: Timestamp.now(),
        isSimulated: true
      });
      console.log('Token simulado de usuario registrado');
    } catch (error) {
      console.error('Error al registrar el token del usuario:', error);
    }
  }

  // Enviar notificación local (cuando la app está en primer plano)
  async sendLocalNotification(title: string, body: string, data = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // null significa inmediato
    });
  }

  // Suscribirse a mensajes FCM - ahora simula con eventos locales
  subscribeToMessages(callback: (message: any) => void) {
    console.log('FCM no disponible en Expo Go - usando notificaciones locales');
    // Devolver un "cleanup" ficticio
    return () => {};
  }

  // Estos métodos de Expo Notifications siguen funcionando igual
  addNotificationReceivedListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  addNotificationResponseReceivedListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

const instance = NotificationService.getInstance();
// Inicializar
instance.configureLocalNotifications().catch(err => console.error('Error configurando notificaciones:', err));

export default instance;