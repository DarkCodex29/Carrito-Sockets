/**
 * Servicio que simula un backend completo para la aplicación
 * Incluye almacenamiento local y simulación de API REST
 */

import { OrderStatus } from './socketService';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  userId: string;
  status: OrderStatus;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Productos predefinidos
const demoProducts: Product[] = [
  {
    id: 'product-01',
    name: 'Hamburguesa Clásica',
    description: 'Hamburguesa con carne, lechuga, tomate y queso',
    price: 20,
    image: require('../assets/images/hamburguesa.jpg')
  },
  {
    id: 'product-02',
    name: 'Papas Fritas',
    description: 'Papas fritas crujientes',
    price: 8,
    image: require('../assets/images/papas fritas.jpg')
  },
  {
    id: 'product-03',
    name: 'Refresco',
    description: 'Refresco de cola',
    price: 5,
    image: require('../assets/images/refresco.jpg')
  },
  {
    id: 'product-04',
    name: 'Ensalada',
    description: 'Ensalada fresca con vegetales',
    price: 12,
    image: require('../assets/images/ensalada.jpg')
  }
];

class MockBackendService {
  private static instance: MockBackendService;
  private orders: Order[] = [];
  private products: Product[] = demoProducts;
  private users: User[] = [
    { id: 'customer-123', name: 'Cliente Demo', email: 'cliente@example.com', role: 'CUSTOMER' },
    { id: 'business-123', name: 'Negocio Demo', email: 'negocio@example.com', role: 'BUSINESS' },
    { id: 'delivery-123', name: 'Repartidor Demo', email: 'repartidor@example.com', role: 'DELIVERY' }
  ];
  
  private constructor() {
    console.log('Mock Backend Service inicializado');
  }
  
  static getInstance(): MockBackendService {
    if (!MockBackendService.instance) {
      MockBackendService.instance = new MockBackendService();
    }
    return MockBackendService.instance;
  }
  
  // Simular latencia de red
  private async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // API Products
  async getProducts(): Promise<Product[]> {
    await this.delay();
    return [...this.products];
  }
  
  // API Orders
  async createOrder(orderData: { items: OrderItem[], total: number, userId: string }): Promise<Order> {
    await this.delay();
    
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      items: orderData.items,
      total: orderData.total,
      userId: orderData.userId,
      status: OrderStatus.PENDING,
      createdAt: new Date()
    };
    
    this.orders.push(newOrder);
    return newOrder;
  }
  
  async getOrder(orderId: string): Promise<Order | null> {
    await this.delay();
    const order = this.orders.find(o => o.id === orderId);
    return order || null;
  }
  
  async getUserOrders(userId: string): Promise<Order[]> {
    await this.delay();
    return this.orders.filter(order => order.userId === userId);
  }
  
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    await this.delay();
    
    const orderIndex = this.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return null;
    
    this.orders[orderIndex] = {
      ...this.orders[orderIndex],
      status
    };
    
    return this.orders[orderIndex];
  }
  
  async getPendingOrders(): Promise<Order[]> {
    await this.delay();
    return this.orders.filter(order => order.status === OrderStatus.PENDING);
  }
  
  async getPreparingOrders(): Promise<Order[]> {
    await this.delay();
    return this.orders.filter(order => order.status === OrderStatus.PREPARING);
  }
  
  // Auth API
  async getCurrentUser(): Promise<User | null> {
    // Simulamos un usuario autenticado (cliente por defecto)
    return this.users[0];
  }
  
  async getUserById(userId: string): Promise<User | null> {
    const user = this.users.find(u => u.id === userId);
    return user || null;
  }
  
  // Para debug
  getDatabase() {
    return {
      orders: this.orders,
      products: this.products,
      users: this.users
    };
  }
}

export default MockBackendService.getInstance(); 