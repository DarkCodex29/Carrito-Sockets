import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OrderStatus } from '../services/socketService';

interface OrderStatusProps {
  status: OrderStatus;
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return '#FFA500';
    case OrderStatus.PREPARING:
      return '#4169E1';
    case OrderStatus.ON_THE_WAY:
      return '#32CD32';
    case OrderStatus.DELIVERED:
      return '#008000';
    default:
      return '#808080';
  }
};

const getStatusText = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'Pendiente';
    case OrderStatus.PREPARING:
      return 'En preparación';
    case OrderStatus.ON_THE_WAY:
      return 'En camino';
    case OrderStatus.DELIVERED:
      return 'Entregado';
    default:
      return 'Desconocido';
  }
};

export const OrderStatusComponent: React.FC<OrderStatusProps> = ({ status }) => {
  return (
    <View style={[styles.container, { backgroundColor: getStatusColor(status) }]}>
      <Text style={styles.text}>{getStatusText(status)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
}); 