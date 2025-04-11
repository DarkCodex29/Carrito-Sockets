import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartProps {
  onCheckout: (items: CartItem[], total: number) => void;
}

export function Cart({ onCheckout }: CartProps) {
  // Estado local para el carrito
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Para depuración
  React.useEffect(() => {
    console.log('Cart items:', items);
  }, [items]);

  // Agregamos datos de ejemplo para simular
  React.useEffect(() => {
    if (items.length === 0) {
      setItems([
        { id: 'product-01', name: 'Hamburguesa Clásica', price: 20, quantity: 1 },
        { id: 'product-02', name: 'Papas Fritas', price: 8, quantity: 1 }
      ]);
    }
  }, []);

  // Calcula el total del pedido
  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Incrementa la cantidad de un producto
  const incrementQuantity = (id: string) => {
    setItems(
      items.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Decrementa la cantidad de un producto
  const decrementQuantity = (id: string) => {
    setItems(
      items.map(item =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ).filter(item => !(item.id === id && item.quantity <= 1))
    );
  };

  // Elimina un producto del carrito
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Renderiza un elemento del carrito
  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemPrice}>S/ {item.price}</Text>
      
      <View style={styles.quantityControl}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => decrementQuantity(item.id)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        
        <Text style={styles.quantity}>{item.quantity}</Text>
        
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => incrementQuantity(item.id)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Si el carrito está vacío, mostrar un mensaje
  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Tu Carrito</Text>
        <Text style={styles.emptyText}>El carrito está vacío</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu Carrito</Text>
      
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.cartItems}
      />
      
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total:</Text>
        <Text style={styles.totalAmount}>S/ {calculateTotal()}</Text>
      </View>
      
      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={() => onCheckout(items, calculateTotal())}
      >
        <Text style={styles.checkoutButtonText}>Realizar Pedido</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cartItems: {
    marginBottom: 10,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemName: {
    flex: 2,
    fontSize: 14,
  },
  itemPrice: {
    flex: 1,
    fontSize: 14,
    color: '#0066cc',
    textAlign: 'center',
  },
  quantityControl: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  quantityButton: {
    width: 24,
    height: 24,
    backgroundColor: '#0066cc',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    marginHorizontal: 8,
    fontSize: 14,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  checkoutButton: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 14,
    color: '#666',
  }
});