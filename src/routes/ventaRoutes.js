import express from 'express';
import {
    crearVenta,
    obtenerVentas,
    obtenerVentaPorId,
    actualizarVenta,
    eliminarVenta,
    obtenerEstadisticas
} from '../controllers/ventaController.js';

const router = express.Router();

// Rutas CRUD
router.post('/', crearVenta);
router.get('/', obtenerVentas);
router.get('/estadisticas', obtenerEstadisticas);
router.get('/:id', obtenerVentaPorId);
router.put('/:id', actualizarVenta);
router.delete('/:id', eliminarVenta);

export default router;
