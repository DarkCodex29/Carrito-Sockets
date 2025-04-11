/**
 * Servicio de autenticación simulado
 */
import mockBackendService, { User } from './mockBackendService';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  BUSINESS = 'BUSINESS',
  DELIVERY = 'DELIVERY'
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User = { 
    id: 'customer-123', 
    name: 'Cliente Demo', 
    email: 'cliente@example.com', 
    role: UserRole.CUSTOMER 
  };
  private currentRole: UserRole = UserRole.CUSTOMER;
  private initialized: boolean = true; // Inicializado por defecto
  
  private constructor() {
    console.log('Auth Service inicializado con valores simulados');
  }
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  async getCurrentUser(): Promise<User> {
    return this.currentUser;
  }
  
  async getCurrentUserRole(): Promise<UserRole> {
    return this.currentRole;
  }
  
  async isAuthenticated(): Promise<boolean> {
    return true; // Siempre autenticado en modo simulación
  }
  
  async hasRole(role: UserRole): Promise<boolean> {
    return this.currentRole === role;
  }
  
  // Método para cambiar de rol simulando diferentes usuarios
  async switchRole(role: UserRole): Promise<void> {
    // Si ya estamos en este rol, no hacer nada
    if (this.currentRole === role) {
      return;
    }
    
    let userId;
    switch (role) {
      case UserRole.BUSINESS:
        userId = 'business-123';
        break;
      case UserRole.DELIVERY:
        userId = 'delivery-123';
        break;
      default:
        userId = 'customer-123';
        break;
    }
    
    try {
      const user = await mockBackendService.getUserById(userId);
      if (user) {
        this.currentUser = user;
        this.currentRole = role;
        console.log(`Rol cambiado a: ${role}, usuario: ${userId}`);
      }
    } catch (error) {
      console.error('Error al cambiar rol:', error);
    }
  }
  
  // Simula login de usuarios según su rol
  async loginWithRole(role: UserRole): Promise<User> {
    let userId;
    switch (role) {
      case UserRole.BUSINESS:
        userId = 'business-123';
        break;
      case UserRole.DELIVERY:
        userId = 'delivery-123';
        break;
      case UserRole.CUSTOMER:
      default:
        userId = 'customer-123';
        break;
    }
    
    try {
      const user = await mockBackendService.getUserById(userId);
      if (user) {
        this.currentUser = user;
        this.currentRole = role;
        return user;
      }
      throw new Error(`Usuario con rol ${role} no encontrado`);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }
  
  async logout(): Promise<void> {
    // No eliminamos el usuario, solo cambiamos al rol por defecto
    await this.switchRole(UserRole.CUSTOMER);
    console.log('Sesión cerrada');
  }
}

export default AuthService.getInstance();