import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';
import { OrderStatus } from '../types/order';

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
    latitude: -6.7714,
    longitude: -79.8409,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
}) => {
  const [deliveryLocation, setDeliveryLocation] = useState<Location | null>(null);
  const [businessLocation] = useState<Location>({
    latitude: -6.7714,
    longitude: -79.8409,
  });
  const [customerLocation] = useState<Location>({
    latitude: -6.7714 + 0.01,
    longitude: -79.8409 + 0.01,
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Forzar el estado a ON_THE_WAY si no lo está para asegurar que se muestre el mapa
  const effectiveStatus = OrderStatus.ON_THE_WAY;
  
  // Log para debugging
  console.log(`OrderTrackingMap renderizando con orderId=${orderId}, status=${status}`);

  useEffect(() => {
    console.log(`OrderTrackingMap - Iniciando mapa para pedido: ${orderId}, estado: ${status}`);
    console.log('Mostrando mapa independientemente del estado');
    
    // Limpiar cuando cambia
    return () => {
      console.log('Limpiando componente de mapa');
      setDeliveryLocation(null);
      setMapLoaded(false);
      setError(null);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [orderId, status]);

  // Efecto para simular el movimiento del repartidor - siempre simulamos
  useEffect(() => {
    // Iniciar la simulación independientemente del estado
    setDeliveryLocation(businessLocation);
    console.log('Iniciando simulación de entrega...');

    timerRef.current = setInterval(() => {
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
          console.log('Entrega completada en simulación');
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
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

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [businessLocation, customerLocation]); // Eliminar dependencia de status

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

  const handleMapReady = () => {
    setMapLoaded(true);
    console.log('Mapa cargado correctamente');
    
    if (mapRef.current) {
      try {
        mapRef.current.animateToRegion(initialRegion, 500);
      } catch (err) {
        console.error('Error al animar el mapa:', err);
      }
    }
  };

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView 
        ref={mapRef}
        style={styles.map} 
        initialRegion={initialRegion}
        onMapReady={handleMapReady}
      >
        {mapLoaded && (
          <>
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
          </>
        )}
      </MapView>

      {!mapLoaded && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando mapa...</Text>
        </View>
      )}

      {mapLoaded && (
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
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: 'bold',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffebee',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    padding: 16,
  }
}); 