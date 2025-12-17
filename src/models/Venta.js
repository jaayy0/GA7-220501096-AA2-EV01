import mongoose from 'mongoose';

const ventaSchema = new mongoose.Schema({
    fecha: {
        type: Date,
        required: [true, 'La fecha es obligatoria'],
        default: Date.now
    },
    vendedor: {
        type: String,
        required: [true, 'El nombre del vendedor es obligatorio'],
        trim: true
    },
    productos: [{
        productoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Inventario',
            required: true
        },
        nombreProducto: {
            type: String,
            required: true
        },
        cantidad: {
            type: Number,
            required: [true, 'La cantidad es obligatoria'],
            min: [1, 'La cantidad debe ser al menos 1']
        },
        precioUnitario: {
            type: Number,
            required: [true, 'El precio unitario es obligatorio'],
            min: [0, 'El precio unitario no puede ser negativo']
        },
        subtotal: {
            type: Number,
            required: false
        }
    }],
    comprador: {
        type: String,
        required: [true, 'El comprador es obligatorio'],
        trim: true
    },
    estado: {
        type: String,
        required: true,
        enum: ['Pendiente', 'Completada', 'Cancelada'],
        default: 'Pendiente'
    },
    generarFactura: {
        type: Boolean,
        default: false
    },
    total: {
        type: Number,
        required: false,
        min: 0
    }
}, {
    timestamps: true,
    versionKey: false
});

// Middleware para calcular subtotales y total antes de guardar
ventaSchema.pre('save', function (next) {
    // Calcular subtotal de cada producto
    this.productos.forEach(producto => {
        producto.subtotal = producto.cantidad * producto.precioUnitario;
    });

    // Calcular total de la venta
    this.total = this.productos.reduce((sum, producto) => sum + producto.subtotal, 0);

    next();
});

// Índices para búsquedas rápidas
ventaSchema.index({ fecha: -1 });
ventaSchema.index({ estado: 1 });
ventaSchema.index({ vendedor: 1 });

const Venta = mongoose.model('Venta', ventaSchema);

export default Venta;
