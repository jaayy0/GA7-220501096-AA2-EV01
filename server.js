import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/database.js';
import inventarioRoutes from './src/routes/inventarioRoutes.js';
import ventaRoutes from './src/routes/ventaRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// Middlewares
app.use(cors()); // Permitir peticiones desde el frontend
app.use(express.json()); // Parsear JSON
app.use(express.urlencoded({ extended: true })); // Parsear datos de formularios

// Conectar a la base de datos
connectDB();

// Rutas
app.use('/api/inventario', inventarioRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/auth', authRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({
        message: '🚀 API de Ventas e Inventario',
        version: '1.0.0',
        endpoints: {
            inventario: '/api/inventario',
            ventas: '/api/ventas'
        }
    });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(` URL: http://localhost:${PORT}`);
});

export default app;
