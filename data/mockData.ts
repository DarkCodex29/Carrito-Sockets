import { OrderStatus } from '../types/order';

// Interfaces
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
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
  userId: string;
  status: OrderStatus;
  createdAt: string;
}

// Datos simulados
export const mockProducts: Product[] = [
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

export const mockCartItems: CartItem[] = [
  {
    id: 'product-01',
    name: 'Hamburguesa clásica',
    price: 20,
    quantity: 2
  },
  {
    id: 'product-02',
    name: 'Papas fritas',
    price: 8,
    quantity: 1
  }
];

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    items: [
      {
        id: 'product-01',
        name: 'Hamburguesa clásica',
        price: 20,
        quantity: 2
      },
      {
        id: 'product-02',
        name: 'Papas fritas',
        price: 8,
        quantity: 1
      }
    ],
    total: 48,
    userId: 'customer-123',
    status: OrderStatus.PENDING,
    createdAt: new Date().toISOString()
  },
  {
    id: 'order-2',
    items: [
      {
        id: 'product-03',
        name: 'Refresco',
        price: 5,
        quantity: 2
      },
      {
        id: 'product-04',
        name: 'Ensalada',
        price: 12,
        quantity: 1
      }
    ],
    total: 22,
    userId: 'customer-456',
    status: OrderStatus.PREPARING,
    createdAt: new Date().toISOString()
  }
];