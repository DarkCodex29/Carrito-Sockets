import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setOrders, updateOrderStatus } from '../../store/orderSlice';
import { OrderStatusComponent } from '../../components/OrderStatus';
import apiService from '../../services/apiService';
import socketService, { OrderStatus } from '../../services/socketService';
import authService, { UserRole } from '../../services/authService';
import { OrderTrackingMap } from '../../components/OrderTrackingMap';

function DeliveryScreenComponent() {
  const dispatch = useDispatch();
  const orders = useSelector((state: RootState) => state.orders.orders);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    const checkDeliveryRole = async () => {
      try {
        const isDelivery = await authService.hasRole(UserRole.DELIVERY);
        if (!isDelivery) {
          Alert.alert(
            'Acceso restringido',
            'Esta pantalla es solo para repartidores',
            [{ text: 'Entendido' }]
          );
        }
      } catch (error) {
        console.error('Error al verificar rol:', error);
      }
    };

    checkDeliveryRole();
    loadPreparingOrders();
  }, []);

  const loadPreparingOrders = async () => {
    try {
      setLoading(true);
      const preparingOrders = await apiService.getPreparingOrders();
      dispatch(setOrders(preparingOrders));
    } catch (error) {
      console.error('Error al cargar pedidos en preparación:', error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos en preparación');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      socketService.emitStatusUpdate(orderId, newStatus);
      dispatch(updateOrderStatus({ orderId, status: newStatus }));
      if (newStatus === OrderStatus.DELIVERED) {
        setSelectedOrder(null);
      }
      Alert.alert('Éxito', 'Estado del pedido actualizado correctamente');
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
        <Text style={styles.orderTotal}>Total: ${item.total}</Text>
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
          <Text style={styles.actionButtonText}>Marcar como Entregado</Text>
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
      <Text style={styles.title}>Pedidos para Entrega</Text>
      
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
        refreshing={loading}
        onRefresh={loadPreparingOrders}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

export default DeliveryScreenComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 16,
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
});