import { collection, doc, onSnapshot, updateDoc, addDoc, Timestamp } from 'firebase/firestore'; // Eliminada la importación de setDoc
import { db } from './firebaseConfig';
import { Order } from '../data/mockData';
import { OrderStatus } from '../services/socketService'; // Importando OrderStatus del lugar correcto


class FirebaseRealtimeService {
  private static instance: FirebaseRealtimeService;
  private listeners: { [key: string]: () => void } = {};
  private userId: string | null = null;

  private constructor() {
    console.log('Firebase Realtime Service inicializado');
  }

  static getInstance(): FirebaseRealtimeService {
    if (!FirebaseRealtimeService.instance) {
      FirebaseRealtimeService.instance = new FirebaseRealtimeService();
    }
    return FirebaseRealtimeService.instance;
  }

  setUserId(userId: string) {
    this.userId = userId;
    console.log(`Usuario configurado: ${userId}`);
  }

  cleanup() {
    Object.values(this.listeners).forEach(unsubscribe => unsubscribe());
    this.listeners = {};
    console.log('Limpieza de listeners realizada');
  }

  listenToOrderUpdates(orderId: string, callback: (order: Order) => void): () => void {
    const unsubscribe = onSnapshot(doc(db, 'orders', orderId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const order = {
          id: snapshot.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate()?.toISOString() || new Date().toISOString()
        } as Order;
        callback(order);
      }
    }, (error) => {
      console.error('Error al escuchar actualizaciones del pedido:', error);
    });
    
    this.listeners[`order:${orderId}`] = unsubscribe;
    return unsubscribe;
  }

  listenToStatusUpdates(callback: (data: { orderId: string; status: OrderStatus }) => void): () => void {
    const queryRef = collection(db, 'orders');
    
    const unsubscribe = onSnapshot(queryRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const data = change.doc.data();
          const orderId = change.doc.id;
          const status = data.status;
          
          if (status) {
            callback({ orderId, status });
          }
        }
      });
    }, (error) => {
      console.error('Error al escuchar actualizaciones de estado:', error);
    });
    
    this.listeners['status:updates'] = unsubscribe;
    return unsubscribe;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { 
        status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      throw error;
    }
  }

  async createNewOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    try {
      const orderData = {
        ...order,
        createdAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      return {
        id: docRef.id,
        ...orderData,
        createdAt: new Date().toISOString()
      } as Order;
    } catch (error) {
      console.error('Error al crear nuevo pedido:', error);
      throw error;
    }
  }
}

export default FirebaseRealtimeService.getInstance();
