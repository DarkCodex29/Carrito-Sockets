const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAbVzDy59-P7kR05jgbPFN0UJ4nyNDAe7Y",
  authDomain: "carrito-sockets.firebaseapp.com",
  projectId: "carrito-sockets",
  storageBucket: "carrito-sockets.firebasestorage.app",
  messagingSenderId: "584327968734",
  appId: "1:584327968734:android:d1af293bcb577143360f4f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeProducts() {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    if (!snapshot.empty) {
      console.log(`Ya existen ${snapshot.size} productos en Firestore. Omitiendo inicialización.`);
      return;
    }
    
    console.log('Inicializando productos en Firestore...');
    
    const results = await Promise.all(
      sampleProducts.map(product => addDoc(collection(db, 'products'), product))
    );
    
    console.log(`${results.length} productos agregados correctamente.`);
  } catch (error) {
    console.error('Error al inicializar productos:', error);
    process.exit(1);
  }
}

async function initializeUsers() {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    if (!snapshot.empty) {
      console.log(`Ya existen ${snapshot.size} usuarios en Firestore. Omitiendo inicialización.`);
      return;
    }
    
    const users = [
      { uid: 'customer-123', email: 'customer@example.com', name: 'Cliente Demo', role: 'CUSTOMER' },
      { uid: 'business-123', email: 'business@example.com', name: 'Negocio Demo', role: 'BUSINESS' },
      { uid: 'delivery-123', email: 'delivery@example.com', name: 'Repartidor Demo', role: 'DELIVERY' },
    ];
    
    console.log('Inicializando usuarios en Firestore...');
    
    const results = await Promise.all(
      users.map(user => addDoc(collection(db, 'users'), user))
    );
    
    console.log(`${results.length} usuarios agregados correctamente.`);
  } catch (error) {
    console.error('Error al inicializar usuarios:', error);
  }
}

async function initialize() {
  await initializeProducts();
  await initializeUsers();
  console.log('Inicialización completada');
}

initialize();
