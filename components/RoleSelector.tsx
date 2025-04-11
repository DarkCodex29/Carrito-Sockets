import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import authService, { UserRole } from '../services/authService';

interface RoleSelectorProps {
  onRoleChange?: (role: UserRole) => void;
  initialRole?: UserRole;
}

export function RoleSelector({ onRoleChange, initialRole }: RoleSelectorProps) {
  const [currentRole, setCurrentRole] = useState<UserRole>(initialRole || UserRole.CUSTOMER);
  
  useEffect(() => {
    // Si se proporciona un initialRole, usarlo
    if (initialRole) {
      setCurrentRole(initialRole);
      return;
    }
    
    // Si no, obtener el rol actual al montar el componente
    const getCurrentRole = async () => {
      try {
        const role = await authService.getCurrentUserRole();
        setCurrentRole(role);
      } catch (error) {
        console.error('Error al obtener rol actual:', error);
      }
    };
    
    getCurrentRole();
  }, [initialRole]);
  
  const handleRoleChange = async (role: UserRole) => {
    try {
      // Solo cambiar si es diferente al rol actual
      if (role !== currentRole) {
        await authService.switchRole(role);
        setCurrentRole(role);
        
        if (onRoleChange) {
          onRoleChange(role);
        }
      }
    } catch (error) {
      console.error('Error al cambiar rol:', error);
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