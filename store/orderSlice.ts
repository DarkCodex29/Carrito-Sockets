import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OrderStatus } from '../types/order';

interface Order {
  id: string;
  status: OrderStatus;
  items: any[];
  total: number;
  userId: string;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: OrderStatus }>) => {
      const { orderId, status } = action.payload;
      state.orders = state.orders.map(order =>
        order.id === orderId ? { ...order, status } : order
      );
      if (state.currentOrder?.id === orderId) {
        state.currentOrder = { ...state.currentOrder, status };
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.push(action.payload);
    },
    clearOrders: (state) => {
      state.orders = [];
      state.currentOrder = null;
    },
  },
});

export const {
  setOrders,
  setCurrentOrder,
  updateOrderStatus,
  setLoading,
  setError,
  addOrder,
  clearOrders,
} = orderSlice.actions;

export default orderSlice.reducer; 