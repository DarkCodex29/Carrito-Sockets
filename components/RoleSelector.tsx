import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import authService, { UserRole } from '../services/authService';

interface RoleSelectorProps {
  onRoleChange?: (role: UserRole) => void;
}

export function RoleSelector({ onRoleChange }: RoleSelectorProps) {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.CUSTOMER);
  
  useEffect(() => {
    // Obtener el rol actual al montar el componente
    const getCurrentRole = async () => {
      try {
        const role = await authService.getCurrentUserRole();
        setCurrentRole(role);
      } catch (error) {
        console.error('Error al obtener rol actual:', error);
      }
    };
    
    getCurrentRole();
  }, []);
  
  const handleRoleChange = async (role: UserRole) => {
    try {
      await authService.switchRole(role);
      setCurrentRole(role);
      
      if (onRoleChange) {
        onRoleChange(role);
      }
      
      // Mostrar mensaje de confirmación
      Alert.alert('Rol Cambiado', `Ahora estás usando la aplicación como: ${getRoleName(role)}`);
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      Alert.alert('Error', 'No se pudo cambiar el rol');
    }
  };
  
  const getRoleName = (role: UserRole): string => {
    switch (role) {
      case UserRole.BUSINESS:
        return 'Negocio';
      case UserRole.DELIVERY:
        return 'Repartidor';
      case UserRole.CUSTOMER:
      default:
        return 'Cliente';
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cambiar Rol:</Text>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            currentRole === UserRole.CUSTOMER && styles.activeButton
          ]}
          onPress={() => handleRoleChange(UserRole.CUSTOMER)}
        >
          <Text style={[
            styles.roleButtonText,
            currentRole === UserRole.CUSTOMER && styles.activeButtonText
          ]}>
            Cliente
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.roleButton,
            currentRole === UserRole.BUSINESS && styles.activeButton
          ]}
          onPress={() => handleRoleChange(UserRole.BUSINESS)}
        >
          <Text style={[
            styles.roleButtonText,
            currentRole === UserRole.BUSINESS && styles.activeButtonText
          ]}>
            Negocio
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.roleButton,
            currentRole === UserRole.DELIVERY && styles.activeButton
          ]}
          onPress={() => handleRoleChange(UserRole.DELIVERY)}
        >
          <Text style={[
            styles.roleButtonText,
            currentRole === UserRole.DELIVERY && styles.activeButtonText
          ]}>
            Repartidor
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    padding: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#0066cc',
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  activeButtonText: {
    color: 'white',
  }
}); 