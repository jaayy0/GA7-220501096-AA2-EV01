import Inventario from '../models/Inventario.js';

// Crear nuevo producto
export const crearProducto = async (req, res) => {
    try {
        const { codigo, nombre, unidadMedida, existencias, precio, proveedor } = req.body;

        // Verificar si el código ya existe
        const productoExistente = await Inventario.findOne({ codigo: codigo.toUpperCase() });
        if (productoExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un producto con ese código'
            });
        }

        const nuevoProducto = new Inventario({
            codigo,
            nombre,
            unidadMedida,
            existencias,
            precio,
            proveedor
        });

        await nuevoProducto.save();

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: nuevoProducto
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear el producto',
            error: error.message
        });
    }
};

// Obtener todos los productos
export const obtenerProductos = async (req, res) => {
    try {
        const { buscar, ordenar = '-createdAt' } = req.query;

        let filtro = {};

        // Búsqueda por nombre o código
        if (buscar) {
            filtro = {
                $or: [
                    { nombre: { $regex: buscar, $options: 'i' } },
                    { codigo: { $regex: buscar, $options: 'i' } }
                ]
            };
        }

        const productos = await Inventario.find(filtro).sort(ordenar);

        res.status(200).json({
            success: true,
            count: productos.length,
            data: productos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los productos',
            error: error.message
        });
    }
};

// Obtener producto por ID
export const obtenerProductoPorId = async (req, res) => {
    try {
        const producto = await Inventario.findById(req.params.id);

        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: producto
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el producto',
            error: error.message
        });
    }
};

// Actualizar producto
export const actualizarProducto = async (req, res) => {
    try {
        const { codigo, nombre, unidadMedida, existencias, precio, proveedor } = req.body;

        // Si se está actualizando el código, verificar que no exista
        if (codigo) {
            const productoExistente = await Inventario.findOne({
                codigo: codigo.toUpperCase(),
                _id: { $ne: req.params.id }
            });

            if (productoExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otro producto con ese código'
                });
            }
        }

        const productoActualizado = await Inventario.findByIdAndUpdate(
            req.params.id,
            { codigo, nombre, unidadMedida, existencias, precio, proveedor },
            { new: true, runValidators: true }
        );

        if (!productoActualizado) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: productoActualizado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el producto',
            error: error.message
        });
    }
};

// Eliminar producto
export const eliminarProducto = async (req, res) => {
    try {
        const producto = await Inventario.findByIdAndDelete(req.params.id);

        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Producto eliminado exitosamente',
            data: producto
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el producto',
            error: error.message
        });
    }
};

// Obtener productos con bajo stock (opcional - útil para alertas)
export const obtenerProductosBajoStock = async (req, res) => {
    try {
        const { minimo = 10 } = req.query;

        const productos = await Inventario.find({
            existencias: { $lte: parseInt(minimo) }
        }).sort('existencias');

        res.status(200).json({
            success: true,
            count: productos.length,
            data: productos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos con bajo stock',
            error: error.message
        });
    }
};
