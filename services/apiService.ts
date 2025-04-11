import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  Timestamp, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { OrderStatus } from './socketService';
import { Order, CartItem, Product, mockProducts, mockOrders } from '../data/mockData';

/**
 * Servicio principal de API que trabaja directamente con Firebase Firestore.
 */
class ApiService {
  private static instance: ApiService;

  private constructor() {
    console.log('API Service inicializado con Firebase Firestore');
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async getProducts(): Promise<Product[]> {
    try {
      const productsCollection = collection(db, 'products');
      const productsSnapshot = await getDocs(productsCollection);
      return productsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        price: doc.data().price,
        description: doc.data().description,
        image: doc.data().image || 'https://via.placeholder.com/150'
      }));
    } catch (error) {
      console.error('Error al obtener productos:', error);
      return mockProducts;
    }
  }

  async createOrder(orderData: {
    items: CartItem[];
    total: number;
    userId: string;
  }): Promise<Order> {
    try {
      const newOrder = {
        ...orderData,
        status: OrderStatus.PENDING,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'orders'), newOrder);
      
      const orderSnapshot = await getDoc(docRef);
      
      return {
        id: docRef.id,
        ...orderSnapshot.data(),
        createdAt: new Date().toISOString()
      } as Order;
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { 
        status,
        updatedAt: serverTimestamp() 
      });

      const orderSnapshot = await getDoc(orderRef);
      
      if (!orderSnapshot.exists()) {
        throw new Error(`Orden con ID ${orderId} no encontrada`);
      }
      
      const data = orderSnapshot.data();
      return {
        id: orderId,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate()?.toISOString() || new Date().toISOString()
      } as Order;
    } catch (error) {
      console.error('Error al actualizar el estado del pedido:', error);
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnapshot = await getDoc(orderRef);
      
      if (!orderSnapshot.exists()) {
        return null;
      }
      
      const data = orderSnapshot.data();
      return {
        id: orderId,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate()?.toISOString() || new Date().toISOString()
      } as Order;
    } catch (error) {
      console.error('Error al obtener el pedido:', error);
      throw error;
    }
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate()?.toISOString() || new Date().toISOString()
        } as Order;
      });
    } catch (error) {
      console.error('Error al obtener los pedidos del usuario:', error);
      throw error;
    }
  }

  async getPendingOrders(): Promise<Order[]> {
    try {
      const q = query(collection(db, 'orders'), where('status', '==', OrderStatus.PENDING));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate()?.toISOString() || new Date().toISOString()
        } as Order;
      });
    } catch (error) {
      console.error('Error al obtener los pedidos pendientes:', error);
      return mockOrders.filter(order => order.status === OrderStatus.PENDING);
    }
  }

  async getPreparingOrders(): Promise<Order[]> {
    try {
      const q = query(
        collection(db, 'orders'), 
        where('status', 'in', [OrderStatus.PREPARING, OrderStatus.ON_THE_WAY])
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as Timestamp)?.toDate()?.toISOString() || new Date().toISOString()
        } as Order;
      });
    } catch (error) {
      console.error('Error al obtener los pedidos en preparación:', error);
      return mockOrders.filter(order => 
        order.status === OrderStatus.PREPARING || order.status === OrderStatus.ON_THE_WAY
      );
    }
  }
}

export default ApiService.getInstance();