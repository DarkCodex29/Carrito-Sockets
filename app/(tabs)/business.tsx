import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setOrders, updateOrderStatus } from '../../store/orderSlice';
import { OrderStatusComponent } from '../../components/OrderStatus';
import apiService from '../../services/apiService';
import socketService, { OrderStatus } from '../../services/socketService';
import authService, { UserRole } from '../../services/authService';
import { RoleSelector } from '../../components/RoleSelector';

function BusinessScreenComponent() {
  const dispatch = useDispatch();
  const orders = useSelector((state: RootState) => state.orders.orders);
  const [loading, setLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.BUSINESS);

  useEffect(() => {
    loadPendingOrders();
  }, []);

  const handleRoleChange = async (role: UserRole) => {
    setCurrentRole(role);
    // Si es el rol de negocio, cargar pedidos
    if (role === UserRole.BUSINESS) {
      loadPendingOrders();
    }
  };

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
      <Text style={styles.orderTotal}>Total: S/ {item.total}</Text>
      
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <RoleSelector onRoleChange={handleRoleChange} />
        
        <Text style={styles.title}>Pedidos Pendientes</Text>
        
        {currentRole !== UserRole.BUSINESS && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Para acceder a las funciones de negocio, cambia tu rol a "Negocio" en el selector superior.
            </Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.listContainer}>
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={item => item.id}
          refreshing={loading}
          onRefresh={loadPendingOrders}
          contentContainerStyle={orders.length === 0 ? styles.emptyListContainer : undefined}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay pedidos pendientes</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

export default BusinessScreenComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: 16,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
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
  }
});