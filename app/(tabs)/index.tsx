import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Cart, CartItem } from '../../components/Cart';
import { OrderStatusComponent } from '../../components/OrderStatus';
import { RootState } from '../../store';
import { setCurrentOrder, updateOrderStatus } from '../../store/orderSlice';
import { OrderStatus } from '../../types/order';
import socketService from '../../services/socketService';
import apiService from '../../services/apiService';
import firebaseNotificationService from '../../services/firebaseNotificationService';
import authService, { UserRole } from '../../services/authService';
import { ProductList, Product } from '../../components/ProductList';
import { OrderTrackingMap } from '../../components/OrderTrackingMap';
import { mockProducts } from '../../data/mockData';
import { RoleSelector } from '../../components/RoleSelector';

// Componente simple para mostrar estrellas de calificación
const RatingStars = ({ maxRating = 5, rating, onRatingChange }: { maxRating?: number, rating: number, onRatingChange: (rating: number) => void }) => {
  return (
    <View style={styles.ratingContainer}>
      {[...Array(maxRating)].map((_, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => onRatingChange(i + 1)}
          style={styles.starButton}
        >
          <Text style={[styles.starIcon, i < rating ? styles.starFilled : styles.starEmpty]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

function UserScreenComponent() {
  const dispatch = useDispatch();
  const currentOrder = useSelector((state: RootState) => state.orders.currentOrder);
  const [products, setProducts] = useState(mockProducts);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [showRating, setShowRating] = useState<boolean>(false);

  const handleOrderStatusChange = async (data: { orderId: string; status: OrderStatus }) => {
    dispatch(updateOrderStatus({ orderId: data.orderId, status: data.status }));
    
    const statusMessages: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Tu pedido está pendiente',
      [OrderStatus.PREPARING]: 'Tu pedido está siendo preparado',
      [OrderStatus.ON_THE_WAY]: 'Tu pedido está en camino',
      [OrderStatus.DELIVERED]: 'Tu pedido ha sido entregado',
      [OrderStatus.CANCELLED]: 'Tu pedido ha sido cancelado'
    };
    
    if (statusMessages[data.status]) {
      Alert.alert('Actualización de pedido', statusMessages[data.status]);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setUserId(user.id);
          
          const userRole = await authService.getCurrentUserRole();
          if (userRole !== UserRole.CUSTOMER) {
            Alert.alert('Acceso restringido', 'Esta pantalla es solo para clientes');
          }
          
          return user.id;
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
        
        await socketService.initialize();
        
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
        
        // Suscribirse a actualizaciones de estado
        socketService.onOrderStatusChanged(handleOrderStatusChange);
        
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
      // Limpiar listeners al desmontar
      socketService.offOrderStatusChanged(handleOrderStatusChange);
    };
  }, [dispatch]);

  useEffect(() => {
    if (currentOrder) {
      console.log('Estado actual del pedido:', currentOrder.status);
      console.log('Debe mostrar mapa:', currentOrder.status === OrderStatus.ON_THE_WAY);
    }
  }, [currentOrder]);

  useEffect(() => {
    console.log('Products state:', products);
  }, [products]);

  const handleAddToCart = (product: Product) => {
    console.log(`Producto ${product.name} añadido al carrito`);
    
    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Si ya existe, incrementar la cantidad
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1
      };
      setCartItems(updatedItems);
    } else {
      // Si no existe, añadirlo al carrito
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const handleCheckout = async (items: CartItem[], total: number) => {
    try {
      
      const order = await apiService.createOrder(items, total);
      
      dispatch(setCurrentOrder(order));

      setCartItems([]);
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar tu pedido. Por favor, intenta nuevamente.');
    }
  };

  const handleRoleChange = async (role: UserRole) => {
    setCurrentRole(role);
  };

  const handleRateOrder = async (orderRating: number) => {
    try {
      console.log(`Calificando pedido ${currentOrder?.id} con ${orderRating} estrellas`);
      
      // Aquí implementaríamos la llamada real a la API de calificación
      // Por ahora solo simulamos la operación
      
      // Limpiar el estado actual después de calificar
      setRating(0);
      setShowRating(false);
      dispatch(setCurrentOrder(null));
      
      Alert.alert(
        'Gracias por tu calificación',
        `Has calificado el pedido con ${orderRating} estrellas.`
      );
    } catch (error) {
      console.error('Error al calificar pedido:', error);
    }
  };

  if (isLoading) {
    console.log('Mostrando pantalla de carga...');
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  console.log('Renderizando pantalla de usuario...');
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <RoleSelector onRoleChange={handleRoleChange} initialRole={UserRole.CUSTOMER} />
      </View>
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <ProductList products={products as Product[]} onAddToCart={handleAddToCart} />
          
          {currentOrder && (
            <>
              <View style={styles.orderStatus}>
                <Text style={styles.orderTitle}>Tu pedido #{currentOrder.id}</Text>
                <OrderStatusComponent status={currentOrder.status} />
              </View>
            
              {currentOrder.status === OrderStatus.ON_THE_WAY && (
                <View style={styles.mapContainer}>
                  <Text style={styles.mapTitle}>Seguimiento de tu pedido</Text>
                  <OrderTrackingMap 
                    orderId={currentOrder.id} 
                    status={currentOrder.status}
                    key={`map-${currentOrder.id}-${currentOrder.status}`}
                  />
                </View>
              )}
            </>
          )}
          
          {currentOrder && currentOrder.status === OrderStatus.DELIVERED && !showRating && (
            <TouchableOpacity 
              style={styles.rateButton}
              onPress={() => setShowRating(true)}
            >
              <Text style={styles.rateButtonText}>Calificar Pedido</Text>
            </TouchableOpacity>
          )}
          
          {currentOrder && showRating && (
            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>¿Cómo calificarías tu pedido?</Text>
              <RatingStars rating={rating} onRatingChange={setRating} />
              
              <TouchableOpacity 
                style={[styles.submitRatingButton, rating === 0 && styles.disabledButton]}
                disabled={rating === 0}
                onPress={() => handleRateOrder(rating)}
              >
                <Text style={styles.submitRatingText}>Enviar Calificación</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <Cart items={cartItems} onCheckout={handleCheckout} />
        </ScrollView>
      )}
    </View>
  );
}

export default UserScreenComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  orderStatus: {
    marginTop: 16,
    alignItems: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginVertical: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  contentList: {
    flex: 1,
  },
  contentListContent: {
    padding: 16,
  },
  mapContainer: {
    height: 300,
    marginVertical: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  starButton: {
    padding: 8,
  },
  starIcon: {
    fontSize: 40,
  },
  starEmpty: {
    color: '#ccc',
  },
  starFilled: {
    color: '#FFD700',
  },
  ratingSection: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  submitRatingButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    width: '80%',
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  submitRatingText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rateButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 16,
  },
  rateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
