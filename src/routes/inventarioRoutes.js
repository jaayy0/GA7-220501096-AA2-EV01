import express from 'express';
import {
    crearProducto,
    obtenerProductos,
    obtenerProductoPorId,
    actualizarProducto,
    eliminarProducto,
    obtenerProductosBajoStock
} from '../controllers/inventarioController.js';

const router = express.Router();

// Rutas CRUD
router.post('/', crearProducto);
router.get('/', obtenerProductos);
router.get('/bajo-stock', obtenerProductosBajoStock);
router.get('/:id', obtenerProductoPorId);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

export default router;
