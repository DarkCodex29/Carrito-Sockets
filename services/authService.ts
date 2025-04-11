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
  private initialized: boolean = false;
  
  private constructor() {
    console.log('Auth Service inicializado con valores simulados');
    // Cargar usuario por defecto inmediatamente
    this.loadInitialUser();
  }
  
  private async loadInitialUser() {
    try {
      const user = await mockBackendService.getCurrentUser();
      if (user) {
        this.currentUser = user;
        this.currentRole = user.role as UserRole;
      }
      this.initialized = true;
      console.log(`Usuario inicial cargado: ${this.currentUser.id}`);
    } catch (error) {
      console.error('Error al cargar usuario inicial:', error);
      // Mantenemos el usuario por defecto
      this.initialized = true;
    }
  }
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  // Aseguramos que el servicio está inicializado antes de devolver datos
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await new Promise<void>(resolve => {
        const checkInterval = setInterval(() => {
          if (this.initialized) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 50);
      });
    }
  }
  
  async isAuthenticated(): Promise<boolean> {
    await this.ensureInitialized();
    return true; // Siempre autenticado en modo simulación
  }
  
  async getCurrentUser(): Promise<User> {
    await this.ensureInitialized();
    return this.currentUser;
  }
  
  async getCurrentUserRole(): Promise<UserRole> {
    await this.ensureInitialized();
    return this.currentRole;
  }
  
  async hasRole(role: UserRole): Promise<boolean> {
    await this.ensureInitialized();
    return this.currentRole === role;
  }
  
  // Método para cambiar de rol simulando diferentes usuarios
  async switchRole(role: UserRole): Promise<void> {
    await this.ensureInitialized();
    
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
    
    const user = await mockBackendService.getUserById(userId);
    if (user) {
      this.currentUser = user;
      this.currentRole = role;
      console.log(`Rol cambiado a: ${role}, usuario: ${userId}`);
    }
  }
  
  // Simula login de usuarios según su rol
  async loginWithRole(role: UserRole): Promise<User> {
    await this.ensureInitialized();
    
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