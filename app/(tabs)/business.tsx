import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setOrders, updateOrderStatus } from '../../store/orderSlice';
import { OrderStatusComponent } from '../../components/OrderStatus';
import apiService from '../../services/apiService';
import socketService from '../../services/socketService';
import { OrderStatus } from '../../types/order';
import authService, { UserRole } from '../../services/authService';
import { RoleSelector } from '../../components/RoleSelector';

function BusinessScreenComponent() {
  const dispatch = useDispatch();
  const orders = useSelector((state: RootState) => state.orders.orders);
  const [loading, setLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.BUSINESS);
  const [filter, setFilter] = useState<'pending' | 'preparing'>('pending');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const handleRoleChange = async (role: UserRole) => {
    setCurrentRole(role);
    // Si es el rol de negocio, cargar pedidos
    if (role === UserRole.BUSINESS) {
      loadOrders();
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      if (filter === 'pending') {
        const pendingOrders = await apiService.getPendingOrders();
        dispatch(setOrders(pendingOrders));
      } else {
        const preparingOrders = await apiService.getPreparingOrders();
        dispatch(setOrders(preparingOrders));
      }
    } catch (error) {
      console.error(`Error al cargar pedidos ${filter}:`, error);
      Alert.alert('Error', `No se pudieron cargar los pedidos ${filter}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      console.log(`Actualizando estado del pedido ${orderId} a ${newStatus}`);
      
      await apiService.updateOrderStatus(orderId, newStatus);
      
      // Recargar los pedidos después de actualizar el estado
      loadOrders();
      
      // Mostrar mensaje breve de confirmación
      Alert.alert('Estado Actualizado', `Pedido #${orderId} ${getStatusText(newStatus)}`);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado del pedido');
    }
  };

  // Obtiene un texto descriptivo para cada estado
  const getStatusText = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.PREPARING:
        return 'en preparación';
      case OrderStatus.ON_THE_WAY:
        return 'listo para entrega';
      default:
        return status;
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
          <Text style={styles.actionButtonText}>Comenzar preparación</Text>
        </TouchableOpacity>
      )}

      {item.status === OrderStatus.PREPARING && (
        <TouchableOpacity
          style={[styles.actionButton, styles.readyButton]}
          onPress={() => handleStatusUpdate(item.id, OrderStatus.ON_THE_WAY)}
        >
          <Text style={styles.actionButtonText}>Marcar como listo</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <RoleSelector onRoleChange={handleRoleChange} initialRole={UserRole.BUSINESS} />
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, filter === 'pending' && styles.activeTab]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.tabText, filter === 'pending' && styles.activeTabText]}>
              Pedidos pendientes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, filter === 'preparing' && styles.activeTab]}
            onPress={() => setFilter('preparing')}
          >
            <Text style={[styles.tabText, filter === 'preparing' && styles.activeTabText]}>
              En preparación
            </Text>
          </TouchableOpacity>
        </View>
        
        {currentRole !== UserRole.BUSINESS && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Para acceder a las funciones de negocio, cambia tu rol a "Negocio" en el selector superior.
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {filter === 'pending' 
                  ? 'No hay pedidos pendientes' 
                  : 'No hay pedidos en preparación'}
              </Text>
            </View>
          }
        />
      )}
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
  readyButton: {
    backgroundColor: '#34C759', // Color verde para acciones de completado
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
  },
  ordersList: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  ordersListContent: {
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  activeTab: {
    borderColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#007AFF',
  },
});