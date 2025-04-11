import { OrderStatus } from '../services/socketService';
export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  userId: string;
  createdAt: string;
}

export { OrderStatus };

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Hamburguesa Clásica',
    price: 80,
    image: 'https://via.placeholder.com/150',
    description: 'Deliciosa hamburguesa con carne, lechuga, tomate y queso'
  },
  {
    id: '2',
    name: 'Pizza Margherita',
    price: 120,
    image: 'https://via.placeholder.com/150',
    description: 'Pizza tradicional italiana con tomate, mozzarella y albahaca'
  },
  {
    id: '3',
    name: 'Tacos al Pastor',
    price: 60,
    image: 'https://via.placeholder.com/150',
    description: 'Tres tacos de cerdo marinado con piña, cebolla y cilantro'
  },
  {
    id: '4',
    name: 'Ensalada César',
    price: 70,
    image: 'https://via.placeholder.com/150',
    description: 'Clásica ensalada con pollo, crutones, queso parmesano y aderezo César'
  },
  {
    id: '5',
    name: 'Refresco',
    price: 25,
    image: 'https://via.placeholder.com/150',
    description: 'Refresco de cola, 500ml'
  }
];

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    items: [
      { id: '1', name: 'Hamburguesa Clásica', price: 80, quantity: 2 },
      { id: '5', name: 'Refresco', price: 25, quantity: 2 }
    ],
    total: 210,
    status: OrderStatus.PENDING,
    userId: 'user-123',
    createdAt: new Date().toISOString()
  },
  {
    id: 'order-2',
    items: [
      { id: '2', name: 'Pizza Margherita', price: 120, quantity: 1 },
      { id: '5', name: 'Refresco', price: 25, quantity: 1 }
    ],
    total: 145,
    status: OrderStatus.PREPARING,
    userId: 'user-456',
    createdAt: new Date().toISOString()
  }
];