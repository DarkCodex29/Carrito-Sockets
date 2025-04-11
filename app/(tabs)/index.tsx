import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Cart } from '../../components/Cart';
import { OrderStatusComponent } from '../../components/OrderStatus';
import { RootState } from '../../store';
import { setCurrentOrder, updateOrderStatus } from '../../store/orderSlice';
import socketService, { OrderStatus } from '../../services/socketService';
import apiService from '../../services/apiService';
import firebaseNotificationService from '../../services/firebaseNotificationService';
import authService, { UserRole } from '../../services/authService';
import { ProductList } from '../../components/ProductList';
import { OrderTrackingMap } from '../../components/OrderTrackingMap';
import { mockProducts } from '../../data/mockData';

function UserScreenComponent() {
  const dispatch = useDispatch();
  const currentOrder = useSelector((state: RootState) => state.orders.currentOrder);
  const [products, setProducts] = useState(mockProducts);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = authService.getCurrentUser();
        if (user) {
          setUserId(user.uid);
          
          const userRole = await authService.getCurrentUserRole();
          if (userRole !== UserRole.CUSTOMER) {
            Alert.alert('Acceso restringido', 'Esta pantalla es solo para clientes');
          }
          
          return user.uid;
        } else {
          setUserId('customer-123');
          return 'customer-123';
        }
      } catch (error) {
        console.error('Error al verificar usuario:', error);
        setUserId('customer-123');
        return 'customer-123';
      }
    };
    
    const initializeApp = async () => {
      setIsLoading(true); 
      
      try {
        const uid = await checkUser();
        
        socketService.connect(uid);
        
        try {
          await firebaseNotificationService.requestPermissions();
          
          const token = await firebaseNotificationService.getToken();
          if (token) {
            await firebaseNotificationService.registerUserToken(uid, token);
          }
          
          firebaseNotificationService.subscribeToMessages((message) => {
            console.log('Mensaje FCM recibido:', message);
          });
        } catch (notificationError) {
          console.warn('No se pudieron configurar las notificaciones:', notificationError);
        }
        
        socketService.subscribeToStatusUpdates(({ orderId, status }) => {
          dispatch(updateOrderStatus({ orderId, status }));
          
          const statusMessages: Record<OrderStatus, string> = {
            [OrderStatus.PENDING]: 'Tu pedido está pendiente',
            [OrderStatus.PREPARING]: 'Tu pedido está siendo preparado',
            [OrderStatus.ON_THE_WAY]: 'Tu pedido está en camino',
            [OrderStatus.DELIVERED]: 'Tu pedido ha sido entregado',
          };
          
          if (statusMessages[status]) {
            Alert.alert('Actualización de pedido', statusMessages[status]);
          }
        });
        
        try {
          const fetchedProducts = await apiService.getProducts();
          if (fetchedProducts && fetchedProducts.length > 0) {
            setProducts(fetchedProducts);
          }
        } catch (productsError) {
          console.error('Error al cargar productos:', productsError);
        }
      } catch (error) {
        console.error('Error al inicializar la app:', error);
      } finally {
        setIsLoading(false); 
      }
    };
    
    initializeApp();
    
    return () => {
      socketService.disconnect();
    };
  }, [dispatch]);

  const handleCheckout = async (items: any[], total: number) => {
    if (!userId) {
      Alert.alert('Error', 'No se pudo identificar al usuario');
      return;
    }
    
    try {
      const order = await apiService.createOrder({
        items,
        total,
        userId,
      });

      dispatch(setCurrentOrder(order));

      socketService.emitNewOrder(order);

      Alert.alert('Éxito', 'Pedido realizado correctamente');
    } catch (error) {
      console.error('Error al crear el pedido:', error);
      Alert.alert('Error', 'No se pudo realizar el pedido');
    }
  };

  const handleAddToCart = (product: any) => {
    Alert.alert('Producto agregado', `${product.name} ha sido agregado al carrito`);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ProductList products={products} onAddToCart={handleAddToCart} />
        
        <Cart onCheckout={handleCheckout} />
        
        {currentOrder && (
          <>
            <View style={styles.orderStatus}>
              <OrderStatusComponent status={currentOrder.status} />
            </View>
            
            {currentOrder.status === OrderStatus.ON_THE_WAY && (
              <OrderTrackingMap 
                orderId={currentOrder.id} 
                status={currentOrder.status} 
              />
            )}
          </>
        )}
      </View>
    </View>
  );
}

export default UserScreenComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  orderStatus: {
    marginTop: 16,
    alignItems: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});
