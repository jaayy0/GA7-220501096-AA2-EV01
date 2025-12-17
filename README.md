# API Backend - Ventas e Inventario

Backend RESTful API desarrollado con Node.js, Express y MongoDB para gestionar ventas e inventario.

##  Características

-  CRUD completo para Inventario
-  CRUD completo para Ventas con múltiples productos
-  Gestión automática de stock
-  Cálculo automático de totales
-  Validaciones de datos
-  Filtros y búsquedas
-  Estadísticas de ventas

##  Requisitos Previos

- Node.js (v16 o superior)
- MongoDB (local o MongoDB Atlas)
- npm o yarn

##  Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**

Edita el archivo `.env` con tu configuración:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ventas_inventario
```

Para MongoDB Atlas, usa:
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/ventas_inventario
```

3. **Iniciar el servidor:**

Modo desarrollo (con auto-reload):
```bash
npm run dev
```

Modo producción:
```bash
npm start
```

##  Endpoints de la API

### Inventario

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/inventario` | Obtener todos los productos |
| GET | `/api/inventario/:id` | Obtener producto por ID |
| GET | `/api/inventario/bajo-stock` | Productos con bajo stock |
| POST | `/api/inventario` | Crear nuevo producto |
| PUT | `/api/inventario/:id` | Actualizar producto |
| DELETE | `/api/inventario/:id` | Eliminar producto |

### Ventas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/ventas` | Obtener todas las ventas |
| GET | `/api/ventas/:id` | Obtener venta por ID |
| GET | `/api/ventas/estadisticas` | Estadísticas de ventas |
| POST | `/api/ventas` | Crear nueva venta |
| PUT | `/api/ventas/:id` | Actualizar venta |
| DELETE | `/api/ventas/:id` | Eliminar venta (restaura stock) |

##  Ejemplos de Uso

### Crear un Producto

```bash
POST http://localhost:3000/api/inventario
Content-Type: application/json

{
  "codigo": "PRD-001",
  "nombre": "Teclado inalámbrico",
  "unidadMedida": "Unidad",
  "existencias": 50,
  "precio": 45000,
  "proveedor": "Proveedor principal"
}
```

### Crear una Venta (con múltiples productos)

```bash
POST http://localhost:3000/api/ventas
Content-Type: application/json

{
  "fecha": "2025-03-11",
  "vendedor": "Juan Pérez",
  "productos": [
    {
      "productoId": "65f1a2b3c4d5e6f7g8h9i0j1",
      "cantidad": 2,
      "precioUnitario": 45000
    },
    {
      "productoId": "65f1a2b3c4d5e6f7g8h9i0j2",
      "cantidad": 1,
      "precioUnitario": 30000
    }
  ],
  "comprador": "Empresa ABC",
  "estado": "Pendiente",
  "generarFactura": true
}
```

**Nota:** El `productoId` debe ser el ID real del producto en tu base de datos.

### Obtener Productos con Filtros

```bash
# Buscar productos
GET http://localhost:3000/api/inventario?buscar=teclado

# Productos con bajo stock (menos de 20 unidades)
GET http://localhost:3000/api/inventario/bajo-stock?minimo=20
```

### Obtener Ventas con Filtros

```bash
# Ventas por estado
GET http://localhost:3000/api/ventas?estado=Pendiente

# Ventas por rango de fechas
GET http://localhost:3000/api/ventas?fechaInicio=2025-01-01&fechaFin=2025-12-31
```

##  Estructura del Proyecto

```
backend/
├── config/
│   └── database.js          # Configuración de MongoDB
├── controllers/
│   ├── inventarioController.js  # Lógica de inventario
│   └── ventaController.js       # Lógica de ventas
├── models/
│   ├── Inventario.js        # Schema de productos
│   └── Venta.js             # Schema de ventas
├── routes/
│   ├── inventarioRoutes.js  # Rutas de inventario
│   └── ventaRoutes.js       # Rutas de ventas
├── .env                     # Variables de entorno
├── .gitignore
├── package.json
└── server.js                # Punto de entrada
```

##  Modelos de Datos

### Inventario
```javascript
{
  codigo: String (único),
  nombre: String,
  unidadMedida: String,
  existencias: Number,
  precio: Number,
  proveedor: String
}
```

### Venta
```javascript
{
  fecha: Date,
  vendedor: String,
  productos: [{
    productoId: ObjectId,
    nombreProducto: String,
    cantidad: Number,
    precioUnitario: Number,
    subtotal: Number (calculado)
  }],
  comprador: String,
  estado: String,
  generarFactura: Boolean,
  total: Number (calculado automáticamente)
}
```

##  Funcionalidades Especiales

### Gestión Automática de Stock
- Al crear una venta, el stock se reduce automáticamente
- Al eliminar una venta, el stock se restaura
- Validación de stock disponible antes de crear ventas

### Cálculos Automáticos
- El subtotal de cada producto se calcula automáticamente
- El total de la venta se calcula sumando todos los subtotales

### Validaciones
- Códigos únicos para productos
- Stock no puede ser negativo
- Precios no pueden ser negativos
- Validación de productos existentes al crear ventas

##  Herramientas Recomendadas para Probar

- [Postman](https://www.postman.com/)
- [Thunder Client](https://www.thunderclient.com/) (extensión de VS Code)
- [Insomnia](https://insomnia.rest/)

##  Soporte

Si tienes problemas con la conexión a MongoDB:
1. Verifica que MongoDB esté corriendo (si es local)
2. Revisa las credenciales en el archivo `.env`
3. Asegúrate de que la URI de conexión sea correcta

##  Próximos Pasos

- Conectar con tu frontend
- Agregar autenticación de usuarios
- Implementar más filtros y reportes
- Agregar paginación para grandes volúmenes de datos
