import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Order, OrderStatus } from '../types/order';
import { UserRole } from '../services/authService';
import socketService from '../services/socketService';
import notificationService from '../services/notificationService';

interface OrderHistoryProps {
  role: UserRole;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ role }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [role]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Aquí cargaríamos los pedidos según el rol
      const mockOrders: Order[] = [
        {
          id: 'ORD-001',
          items: [
            { id: '1', name: 'Hamburguesa Clásica', quantity: 2, price: 15.90 },
            { id: '3', name: 'Refresco', quantity: 2, price: 4.90 }
          ],
          total: 42.60,
          status: OrderStatus.PENDING,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          customerId: 'CUST-001',
          businessId: 'BUS-001',
          location: 'Chiclayo, Perú'
        }
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await socketService.updateOrderStatus(orderId, newStatus);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const handleRequestDelivery = async (orderId: string, location: string) => {
    try {
      await socketService.requestDelivery(orderId, location);
      await notificationService.showNotification(
        'Entrega Solicitada',
        `Se ha solicitado un repartidor para el pedido #${orderId}`
      );
    } catch (error) {
      console.error('Error solicitando entrega:', error);
    }
  };

  const renderOrderActions = (order: Order) => {
    switch (role) {
      case UserRole.BUSINESS:
        if (order.status === OrderStatus.PENDING) {
          return (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleStatusChange(order.id, OrderStatus.PREPARING)}
            >
              <Text style={styles.actionButtonText}>Iniciar preparación</Text>
            </TouchableOpacity>
          );
        }
        if (order.status === OrderStatus.PREPARING) {
          return (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleStatusChange(order.id, OrderStatus.ON_THE_WAY)}
            >
              <Text style={styles.actionButtonText}>Marcar para Entrega</Text>
            </TouchableOpacity>
          );
        }
        break;
      case UserRole.DELIVERY:
        if (order.status === OrderStatus.ON_THE_WAY) {
          return (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleStatusChange(order.id, OrderStatus.DELIVERED)}
            >
              <Text style={styles.actionButtonText}>Marcar como entregado</Text>
            </TouchableOpacity>
          );
        }
        break;
      case UserRole.CUSTOMER:
        if (order.status === OrderStatus.PREPARING) {
          return (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleRequestDelivery(order.id, order.location)}
            >
              <Text style={styles.actionButtonText}>Solicitar entrega</Text>
            </TouchableOpacity>
          );
        }
        break;
    }
    return null;
  };

  const renderOrderItem = ({ item: order }: { item: Order }) => {
    const isExpanded = selectedOrder === order.id;
    
    return (
      <View style={styles.orderCard}>
        <TouchableOpacity
          style={styles.orderHeader}
          onPress={() => setSelectedOrder(isExpanded ? null : order.id)}
        >
          <View>
            <Text style={styles.orderId}>Pedido #{order.id}</Text>
            <Text style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderTotal}>S/ {order.total.toFixed(2)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.orderDetails}>
            <Text style={styles.detailsTitle}>Detalles del pedido:</Text>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>
                  S/ {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
            {renderOrderActions(order)}
          </View>
        )}
      </View>
    );
  };

  const getStatusColor = (status: OrderStatus): string => {
    const colors: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: '#FF9500',
      [OrderStatus.PREPARING]: '#007AFF',
      [OrderStatus.ON_THE_WAY]: '#5856D6',
      [OrderStatus.DELIVERED]: '#34C759',
      [OrderStatus.CANCELLED]: '#FF3B30'
    };
    return colors[status];
  };

  const getStatusText = (status: OrderStatus): string => {
    const texts: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Pendiente',
      [OrderStatus.PREPARING]: 'En preparación',
      [OrderStatus.ON_THE_WAY]: 'En camino',
      [OrderStatus.DELIVERED]: 'Entregado',
      [OrderStatus.CANCELLED]: 'Cancelado'
    };
    return texts[status];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Pedidos</Text>
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="shopping-bag" size={48} color="#8E8E93" />
          <Text style={styles.emptyText}>No hay pedidos disponibles</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  orderInfo: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderDetails: {
    padding: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  itemQuantity: {
    width: 30,
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
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
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
    textAlign: 'center',
  },
}); 