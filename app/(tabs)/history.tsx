import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { OrderHistory } from '../../components/OrderHistory';
import { RoleSelector } from '../../components/RoleSelector';
import authService, { UserRole } from '../../services/authService';

export default function HistoryScreen() {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.CUSTOMER);

  useEffect(() => {
    loadCurrentRole();
  }, []);

  const loadCurrentRole = async () => {
    const role = await authService.getCurrentUserRole();
    setCurrentRole(role);
  };

  const handleRoleChange = async (role: UserRole) => {
    await authService.switchRole(role);
    setCurrentRole(role);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <RoleSelector onRoleChange={handleRoleChange} initialRole={currentRole} />
      </View>
      
      <OrderHistory role={currentRole} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
}); 