import Venta from '../models/Venta.js';
import Inventario from '../models/Inventario.js';

// Crear nueva venta
export const crearVenta = async (req, res) => {
    try {
        const { fecha, vendedor, productos, comprador, estado, generarFactura } = req.body;

        // Validar que haya al menos un producto
        if (!productos || productos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe incluir al menos un producto en la venta'
            });
        }

        // Validar y preparar productos
        const productosValidados = [];

        for (const item of productos) {
            // Buscar el producto en inventario
            const producto = await Inventario.findById(item.productoId);

            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: `Producto con ID ${item.productoId} no encontrado`
                });
            }

            // Verificar stock disponible
            if (!producto.tieneStock(item.cantidad)) {
                return res.status(400).json({
                    success: false,
                    message: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.existencias}, Solicitado: ${item.cantidad}`
                });
            }

            // Reducir stock
            producto.reducirStock(item.cantidad);
            await producto.save();

            // Agregar producto validado
            productosValidados.push({
                productoId: producto._id,
                nombreProducto: producto.nombre,
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario || producto.precio
            });
        }

        // Crear la venta
        const nuevaVenta = new Venta({
            fecha,
            vendedor,
            productos: productosValidados,
            comprador,
            estado: estado || 'Pendiente',
            generarFactura: generarFactura || false
        });

        await nuevaVenta.save();

        res.status(201).json({
            success: true,
            message: 'Venta creada exitosamente',
            data: nuevaVenta
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear la venta',
            error: error.message
        });
    }
};

// Obtener todas las ventas
export const obtenerVentas = async (req, res) => {
    try {
        const { estado, fechaInicio, fechaFin, ordenar = '-fecha' } = req.query;

        let filtro = {};

        // Filtrar por estado
        if (estado) {
            filtro.estado = estado;
        }

        // Filtrar por rango de fechas
        if (fechaInicio || fechaFin) {
            filtro.fecha = {};
            if (fechaInicio) filtro.fecha.$gte = new Date(fechaInicio);
            if (fechaFin) filtro.fecha.$lte = new Date(fechaFin);
        }

        const ventas = await Venta.find(filtro)
            .populate('productos.productoId', 'codigo nombre')
            .sort(ordenar);

        res.status(200).json({
            success: true,
            count: ventas.length,
            data: ventas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las ventas',
            error: error.message
        });
    }
};

// Obtener venta por ID
export const obtenerVentaPorId = async (req, res) => {
    try {
        const venta = await Venta.findById(req.params.id)
            .populate('productos.productoId', 'codigo nombre unidadMedida');

        if (!venta) {
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: venta
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la venta',
            error: error.message
        });
    }
};

// Actualizar venta
export const actualizarVenta = async (req, res) => {
    try {
        const { estado, vendedor, comprador, generarFactura } = req.body;

        // Solo permitir actualizar ciertos campos (no productos ni total)
        const ventaActualizada = await Venta.findByIdAndUpdate(
            req.params.id,
            { estado, vendedor, comprador, generarFactura },
            { new: true, runValidators: true }
        ).populate('productos.productoId', 'codigo nombre');

        if (!ventaActualizada) {
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Venta actualizada exitosamente',
            data: ventaActualizada
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la venta',
            error: error.message
        });
    }
};

// Eliminar venta (y restaurar stock)
export const eliminarVenta = async (req, res) => {
    try {
        const venta = await Venta.findById(req.params.id);

        if (!venta) {
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            });
        }

        // Restaurar stock de los productos
        for (const item of venta.productos) {
            const producto = await Inventario.findById(item.productoId);
            if (producto) {
                producto.existencias += item.cantidad;
                await producto.save();
            }
        }

        await venta.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Venta eliminada exitosamente y stock restaurado',
            data: venta
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la venta',
            error: error.message
        });
    }
};

// Obtener estadísticas de ventas (opcional - útil para dashboard)
export const obtenerEstadisticas = async (req, res) => {
    try {
        const totalVentas = await Venta.countDocuments();
        const ventasPendientes = await Venta.countDocuments({ estado: 'Pendiente' });
        const ventasCompletadas = await Venta.countDocuments({ estado: 'Completada' });

        const totalIngresos = await Venta.aggregate([
            { $match: { estado: 'Completada' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalVentas,
                ventasPendientes,
                ventasCompletadas,
                totalIngresos: totalIngresos[0]?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};
