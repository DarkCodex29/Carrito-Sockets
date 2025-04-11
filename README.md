# Carrito-Sockets - Aplicación de Seguimiento de Pedidos en Tiempo Real

[![React Native](https://img.shields.io/badge/React%20Native-Expo-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8.1-brightgreen.svg)](https://socket.io/)
[![GitHub](https://img.shields.io/badge/GitHub-DarkCodex29-lightgrey.svg)](https://github.com/DarkCodex29/Carrito-Sockets)

Aplicación móvil para seguimiento de pedidos en tiempo real que permite la comunicación entre clientes, negocios y repartidores a través de sockets.

<div align="center">
  <img src="https://reactnative.dev/img/header_logo.svg" alt="React Native Logo" width="120"/>
</div>

## 📱 Descripción

Carrito-Sockets es una aplicación de entrega de comida que simula el proceso completo de pedidos: desde la selección de productos, la preparación por parte del negocio, hasta el seguimiento en tiempo real del repartidor a través de un mapa interactivo. La aplicación utiliza comunicación en tiempo real con sockets para actualizar el estado de los pedidos y notificar a los usuarios.

## ✨ Características principales

- **Roles múltiples**: Cliente, Negocio y Repartidor, cada uno con su propia interfaz y funcionalidades
- **Carrito de compras**: Añadir productos, modificar cantidades, finalizar compra
- **Seguimiento en tiempo real**: Visualización del pedido en un mapa interactivo
- **Notificaciones**: Alertas con vibración en momentos clave del proceso
- **Comunicación en tiempo real**: Actualización instantánea del estado de los pedidos
- **Calificación de pedidos**: Sistema de valoración al finalizar una entrega

## 🛠️ Tecnologías utilizadas

- **React Native / Expo**: Framework para desarrollo móvil
- **TypeScript**: Tipado estático para JavaScript
- **Redux**: Gestión del estado global de la aplicación
- **Socket.io**: Comunicación bidireccional en tiempo real
- **React Native Maps**: Visualización y seguimiento de ubicaciones
- **React Navigation**: Navegación entre pantallas

## 🚀 Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/DarkCodex29/Carrito-Sockets.git
   cd carrito-sockets
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar la aplicación**:
   ```bash
   npx expo start
   ```

4. **Ejecutar en dispositivo o emulador**:
   - Presiona `a` para Android
   - Presiona `i` para iOS (solo macOS)
   - Escanea el código QR con la app Expo Go en tu dispositivo

## 📁 Estructura del proyecto

```
carrito-sockets/
├── app/             # Archivos de navegación y pantallas principales
│   └── (tabs)/      # Pestañas principales (usuario, negocio, repartidor)
├── components/      # Componentes reutilizables
├── services/        # Servicios (API, sockets, notificaciones)
├── store/           # Estado global con Redux
├── types/           # Definiciones de tipos TypeScript
├── constants/       # Constantes y configuración
└── assets/          # Recursos estáticos (imágenes, fuentes)
```

## 🔍 Solución de problemas comunes

### El mapa no se muestra

1. Asegúrate de tener los permisos de ubicación habilitados en el dispositivo
2. Comprueba la conexión a internet
3. Reinicia la aplicación si el mapa no se carga correctamente

### No se reciben notificaciones o vibraciones

1. Verifica que el permiso de vibración esté habilitado
2. El dispositivo puede tener activado el modo "No molestar"
3. Reinicia la aplicación para restablecer la cola de notificaciones

## 👥 Desarrollo

Proyecto desarrollado como prueba técnica.

## 📧 Contacto

**Desarrollador**: DarkCodex29
**GitHub**: [https://github.com/DarkCodex29](https://github.com/DarkCodex29/Carrito-Sockets)
