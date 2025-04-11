import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';
import { OrderStatus } from '../services/socketService';

interface Location {
  latitude: number;
  longitude: number;
}

interface OrderTrackingMapProps {
  orderId: string;
  status: OrderStatus;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

export const OrderTrackingMap: React.FC<OrderTrackingMapProps> = ({
  orderId,
  status,
  initialRegion = {
    latitude: 19.4326,
    longitude: -99.1332,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
}) => {
  const [deliveryLocation, setDeliveryLocation] = useState<Location | null>(null);
  const [businessLocation] = useState<Location>({
    latitude: 19.4326,
    longitude: -99.1332,
  });
  const [customerLocation] = useState<Location>({
    latitude: 19.4361,
    longitude: -99.1362,
  });

  useEffect(() => {
    if (status !== OrderStatus.ON_THE_WAY) {
      setDeliveryLocation(null);
      return;
    }

    setDeliveryLocation(businessLocation);

    const timer = setInterval(() => {
      setDeliveryLocation(prev => {
        if (!prev) return businessLocation;
        
        const targetLat = customerLocation.latitude;
        const targetLng = customerLocation.longitude;
        
        const newLat = prev.latitude + (targetLat - prev.latitude) * 0.1;
        const newLng = prev.longitude + (targetLng - prev.longitude) * 0.1;
        
        if (
          Math.abs(newLat - targetLat) < 0.0001 &&
          Math.abs(newLng - targetLng) < 0.0001
        ) {
          clearInterval(timer);
          return {
            latitude: targetLat,
            longitude: targetLng,
          };
        }
        
        return {
          latitude: newLat,
          longitude: newLng,
        };
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [status, businessLocation, customerLocation]);

  const getMarkerColor = (markerType: 'business' | 'customer' | 'delivery') => {
    switch (markerType) {
      case 'business':
        return 'blue';
      case 'customer':
        return 'green';
      case 'delivery':
        return 'red';
      default:
        return 'red';
    }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} provider={PROVIDER_GOOGLE} initialRegion={initialRegion}>
        {/* Marcador del negocio */}
        <Marker
          coordinate={businessLocation}
          title="Negocio"
          description="Ubicación del negocio"
          pinColor={getMarkerColor('business')}
        >
          <FontAwesome name="shopping-bag" size={24} color="blue" />
        </Marker>

        {/* Marcador del cliente */}
        <Marker
          coordinate={customerLocation}
          title="Cliente"
          description="Tu ubicación"
          pinColor={getMarkerColor('customer')}
        >
          <FontAwesome name="user" size={24} color="green" />
        </Marker>

        {/* Marcador del repartidor (solo visible cuando está en camino) */}
        {deliveryLocation && (
          <Marker
            coordinate={deliveryLocation}
            title="Repartidor"
            description="Ubicación del repartidor"
            pinColor={getMarkerColor('delivery')}
          >
            <FontAwesome name="truck" size={24} color="red" />
          </Marker>
        )}
      </MapView>

      {status === OrderStatus.ON_THE_WAY && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Tu pedido está en camino</Text>
          <Text style={styles.estimatedTime}>Tiempo estimado: 15 min</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  infoBox: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  estimatedTime: {
    fontSize: 14,
    color: '#666',
  },
}); 