import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setOrders, updateOrderStatus } from '../../store/orderSlice';
import { OrderStatusComponent } from '../../components/OrderStatus';
import apiService from '../../services/apiService';
import socketService from '../../services/socketService';
import { OrderStatus } from '../../types/order';
import authService, { UserRole } from '../../services/authService';
import { OrderTrackingMap } from '../../components/OrderTrackingMap';
import { RoleSelector } from '../../components/RoleSelector';

function DeliveryScreenComponent() {
  const dispatch = useDispatch();
  const orders = useSelector((state: RootState) => state.orders.orders);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.DELIVERY);

  useEffect(() => {
    loadPreparingOrders();
    
    // Suscribirse a los cambios de estado de los pedidos
    const unsubscribe = socketService.subscribeToOrderUpdates((orderId, status) => {
      console.log(`Actualización de pedido recibida: ${orderId} - ${status}`);
      loadPreparingOrders();
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const handleRoleChange = async (role: UserRole) => {
    setCurrentRole(role);
    // Si es el rol de repartidor, cargar pedidos
    if (role === UserRole.DELIVERY) {
      loadPreparingOrders();
    }
  };

  const loadPreparingOrders = async () => {
    try {
      setLoading(true);
      const ordersInWay = await apiService.getOrdersInWay();
      dispatch(setOrders(ordersInWay));
    } catch (error) {
      console.error('Error al cargar pedidos en camino:', error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos en camino');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      console.log(`Actualizando estado del pedido ${orderId} a ${newStatus}`);
      
      await apiService.updateOrderStatus(orderId, newStatus);
      
      // Si el pedido fue entregado, deseleccionarlo
      if (newStatus === OrderStatus.DELIVERED) {
        setSelectedOrder(null);
      }
      
      // Recargar los pedidos después de actualizar el estado
      loadPreparingOrders();
      
      // Mostrar mensaje de éxito
      Alert.alert(
        'Estado Actualizado',
        `El pedido #${orderId} ha sido actualizado a "${newStatus}"`
      );
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado del pedido');
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrder(selectedOrder === orderId ? null : orderId);
  };

  const renderOrder = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <TouchableOpacity 
        style={styles.orderHeader}
        onPress={() => toggleOrderSelection(item.id)}
      >
        <Text style={styles.orderId}>Pedido #{item.id}</Text>
        <Text style={styles.orderTotal}>Total: S/ {item.total}</Text>
      </TouchableOpacity>
      
      <View style={styles.itemsList}>
        {item.items.map((orderItem: any, index: number) => (
          <Text key={`item-${item.id}-${orderItem.id || index}`} style={styles.itemText}>
            {orderItem.quantity}x {orderItem.name}
          </Text>
        ))}
      </View>

      <OrderStatusComponent status={item.status} />

      {item.status === OrderStatus.PREPARING && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleStatusUpdate(item.id, OrderStatus.ON_THE_WAY)}
        >
          <Text style={styles.actionButtonText}>Iniciar Entrega</Text>
        </TouchableOpacity>
      )}

      {item.status === OrderStatus.ON_THE_WAY && (
        <TouchableOpacity
          style={[styles.actionButton, styles.deliveredButton]}
          onPress={() => handleStatusUpdate(item.id, OrderStatus.DELIVERED)}
        >
          <Text style={styles.actionButtonText}>Marcar como entregado</Text>
        </TouchableOpacity>
      )}

      {selectedOrder === item.id && item.status === OrderStatus.ON_THE_WAY && (
        <OrderTrackingMap 
          orderId={item.id} 
          status={item.status} 
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <RoleSelector onRoleChange={handleRoleChange} initialRole={UserRole.DELIVERY} />
        
        <Text style={styles.title}>Pedidos en Camino</Text>
        
        {currentRole !== UserRole.DELIVERY && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Para acceder a las funciones de repartidor, cambia tu rol a "Repartidor" en el selector superior.
            </Text>
          </View>
        )}
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          style={styles.ordersList}
          contentContainerStyle={styles.ordersListContent}
        />
      )}
      
      {selectedOrder && (
        <View style={styles.mapContainer}>
          <OrderTrackingMap 
            orderId={selectedOrder} 
            status={OrderStatus.ON_THE_WAY}
          />
        </View>
      )}
    </View>
  );
}

export default DeliveryScreenComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#f1f9ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#cce5ff',
  },
  infoText: {
    fontSize: 14,
    color: '#0066cc',
    textAlign: 'center',
  },
  ordersList: {
    flex: 1,
  },
  ordersListContent: {
    padding: 16,
  },
  mapContainer: {
    height: 300,
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  orderCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderTotal: {
    fontSize: 16,
    color: '#666',
  },
  itemsList: {
    marginBottom: 16,
  },
  itemText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  deliveredButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});