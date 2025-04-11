import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setOrders, updateOrderStatus } from '../../store/orderSlice';
import { OrderStatusComponent } from '../../components/OrderStatus';
import apiService from '../../services/apiService';
import socketService, { OrderStatus } from '../../services/socketService';
import authService, { UserRole } from '../../services/authService';

function BusinessScreenComponent() {
  const dispatch = useDispatch();
  const orders = useSelector((state: RootState) => state.orders.orders);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkBusinessRole = async () => {
      try {
        const isBusiness = await authService.hasRole(UserRole.BUSINESS);
        if (!isBusiness) {
          Alert.alert(
            'Acceso restringido',
            'Esta pantalla es solo para negocios',
            [{ text: 'Entendido' }]
          );
        }
      } catch (error) {
        console.error('Error al verificar rol:', error);
      }
    };

    checkBusinessRole();
    loadPendingOrders();
  }, []);

  const loadPendingOrders = async () => {
    try {
      setLoading(true);
      const pendingOrders = await apiService.getPendingOrders(); 
      dispatch(setOrders(pendingOrders));
    } catch (error) {
      console.error('Error al cargar pedidos pendientes:', error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      
      socketService.emitStatusUpdate(orderId, newStatus);
      
      dispatch(updateOrderStatus({ orderId, status: newStatus }));
      
      Alert.alert('Éxito', 'Estado del pedido actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado del pedido');
    }
  };

  const renderOrder = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderId}>Pedido #{item.id}</Text>
      <Text style={styles.orderTotal}>Total: ${item.total}</Text>
      
      <View style={styles.itemsList}>
        {item.items.map((orderItem: any, index: number) => (
          <Text key={`item-${item.id}-${orderItem.id || index}`} style={styles.itemText}>
            {orderItem.quantity}x {orderItem.name}
          </Text>
        ))}
      </View>

      <OrderStatusComponent status={item.status} />

      {item.status === OrderStatus.PENDING && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleStatusUpdate(item.id, OrderStatus.PREPARING)}
        >
          <Text style={styles.actionButtonText}>Comenzar Preparación</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedidos Pendientes</Text>
      
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
        refreshing={loading}
        onRefresh={loadPendingOrders}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

export default BusinessScreenComponent;

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
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
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
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});