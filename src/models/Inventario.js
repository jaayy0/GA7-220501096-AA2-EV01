import mongoose from 'mongoose';

const inventarioSchema = new mongoose.Schema({
    codigo: {
        type: String,
        required: [true, 'El código es obligatorio'],
        unique: true,
        trim: true,
        uppercase: true
    },
    nombre: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio'],
        trim: true
    },
    unidadMedida: {
        type: String,
        required: [true, 'La unidad de medida es obligatoria'],
        enum: ['Unidad', 'Kilogramo', 'Litro', 'Metro', 'Caja', 'Paquete'],
        default: 'Unidad'
    },
    existencias: {
        type: Number,
        required: [true, 'Las existencias son obligatorias'],
        min: [0, 'Las existencias no pueden ser negativas'],
        default: 0
    },
    precio: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    proveedor: {
        type: String,
        required: [true, 'El proveedor es obligatorio'],
        trim: true
    }
}, {
    timestamps: true,
    versionKey: false
});

// Índice para búsquedas rápidas por código
inventarioSchema.index({ codigo: 1 });

// Método para verificar disponibilidad
inventarioSchema.methods.tieneStock = function (cantidad) {
    return this.existencias >= cantidad;
};

// Método para reducir stock
inventarioSchema.methods.reducirStock = function (cantidad) {
    if (this.tieneStock(cantidad)) {
        this.existencias -= cantidad;
        return true;
    }
    return false;
};

const Inventario = mongoose.model('Inventario', inventarioSchema);

export default Inventario;
