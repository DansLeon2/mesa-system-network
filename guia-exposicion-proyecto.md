# Guia de exposicion: Sistema de Reservas de Mesas

> Proyecto: **MESA//SYSTEM Neural Reservation Network**  
> Tipo de arquitectura: **Monolitica modular**  
> Stack principal: **Node.js + Express + PostgreSQL**  
> Interfaz: **React + Vite compilado y servido desde Express**  
> Objetivo: gestionar clientes, mesas, reservas, disponibilidad, usuarios y reportes para un restaurante.

---

## 1. Resumen del proyecto

Este proyecto es un sistema de reservas de mesas para restaurante. Permite registrar clientes, administrar mesas, consultar disponibilidad, crear reservas, modificar reservas, cancelar reservas, cambiar estados y consultar reportes.

La aplicacion esta organizada como un **monolito modular**: todo corre dentro de una sola aplicacion backend de Express, pero internamente el codigo esta separado por modulos funcionales como `auth`, `clients`, `tables`, `reservations`, `reports` y `users`.

La base de datos usada es **PostgreSQL**. Las tablas principales son:

- `usuarios`
- `clientes`
- `mesas`
- `reservaciones`
- `auditoria`

La interfaz web ya esta compilada dentro de `backend/public`, por lo que Express sirve tanto la API REST como la aplicacion visual desde el mismo servidor.

---

## 2. Requerimientos funcionales

Los requerimientos funcionales describen **que debe hacer el sistema**.

| Codigo | Requerimiento | Explicacion |
|---|---|---|
| RF01 | Iniciar sesion | El usuario entra al sistema con `username` y `password`. El backend valida las credenciales y devuelve un token JWT. |
| RF02 | Cerrar sesion | El sistema permite cerrar sesion desde la interfaz. En backend existe la ruta protegida `/api/auth/logout`. |
| RF03 | Consultar usuario actual | El sistema permite consultar la informacion del usuario autenticado mediante `/api/auth/me`. |
| RF04 | Gestionar usuarios | Un administrador puede listar y crear usuarios del sistema. Los usuarios tienen rol `administrador` o `recepcionista`. |
| RF05 | Registrar clientes | El sistema permite crear clientes con nombres, apellidos, telefono, email y numero de identificacion opcional. |
| RF06 | Consultar clientes | Permite buscar clientes por nombre, apellido, telefono, email o identificacion. |
| RF07 | Actualizar clientes | Permite modificar los datos de un cliente existente. |
| RF08 | Listar mesas | Permite consultar las mesas registradas, incluyendo su capacidad, ubicacion, estado y estado visual. |
| RF09 | Administrar mesas | El administrador puede crear y actualizar mesas. |
| RF10 | Consultar horario de una mesa | Permite ver la agenda de una mesa para una fecha especifica, con bloques disponibles o reservados. |
| RF11 | Consultar disponibilidad | El sistema busca mesas disponibles segun fecha, hora de inicio, hora de fin y numero de personas. |
| RF12 | Crear reserva | Permite crear una reserva asociando cliente, mesa, usuario, fecha, horario, numero de personas, estado y observaciones. |
| RF13 | Validar conflictos de horario | Antes de crear o actualizar una reserva, el sistema verifica que la mesa no tenga otra reserva solapada. |
| RF14 | Modificar reserva | Permite cambiar cliente, mesa, fecha, hora, cantidad de personas, estado y observaciones. |
| RF15 | Cancelar reserva | Cambia el estado de una reserva a `cancelada` y registra quien hizo la accion. |
| RF16 | Cambiar estado de reserva | Permite cambiar una reserva a estados como `pendiente`, `confirmada`, `cancelada`, `finalizada` o `no_asistio`. |
| RF17 | Consultar reservas | Permite listar reservas filtrando por fecha, cliente, mesa o estado. |
| RF18 | Generar dashboard | El sistema muestra indicadores como reservas del dia, confirmadas, total de clientes y mesas activas. |
| RF19 | Generar reportes administrativos | El administrador puede consultar reservas por dia, mesas mas reservadas, clientes frecuentes, horarios pico y reservas canceladas. |
| RF20 | Registrar auditoria | Cuando se crea, modifica, cancela o cambia estado de una reserva, se registra una entrada en la tabla `auditoria`. |

---

## 3. Requerimientos no funcionales

Los requerimientos no funcionales describen **como debe comportarse el sistema**.

| Codigo | Requerimiento | Aplicacion en el proyecto |
|---|---|---|
| RNF01 | Seguridad | Usa JWT para proteger rutas privadas. El middleware `authMiddleware.js` valida el token. |
| RNF02 | Control de roles | Usa `roleMiddleware.js` para restringir acciones administrativas a usuarios con rol `administrador`. |
| RNF03 | Integridad de datos | La base de datos usa llaves primarias, llaves foraneas, `CHECK` constraints y relaciones entre clientes, mesas, usuarios y reservas. |
| RNF04 | Evitar reservas duplicadas | El servicio de reservas valida solapamientos de horarios con `OVERLAPS` antes de crear o actualizar una reserva. |
| RNF05 | Mantenibilidad | El codigo esta separado por modulos: cada modulo tiene rutas, controlador y servicio. |
| RNF06 | Escalabilidad basica | Al estar modularizado, se pueden agregar nuevos modulos como pagos, notificaciones o reservas online sin reescribir todo. |
| RNF07 | Rendimiento | La base de datos define indices para busquedas frecuentes por fecha, mesa, cliente, estado, email, telefono e identificacion. |
| RNF08 | Usabilidad | La interfaz incluye pantallas para login, dashboard, reservas, disponibilidad, clientes, mesas y reportes. |
| RNF09 | Confiabilidad | Las operaciones importantes de reserva usan transacciones `BEGIN`, `COMMIT` y `ROLLBACK`. |
| RNF10 | Trazabilidad | La tabla `auditoria` permite saber que usuario realizo acciones sobre las reservas. |
| RNF11 | Manejo de errores | El middleware `errorHandler.js` centraliza respuestas de error con codigo HTTP y mensaje. |
| RNF12 | Portabilidad | La aplicacion puede ejecutarse con Node.js y PostgreSQL configurando variables de entorno. |

---

## 4. Arquitectura monolitica modular

### Que significa que sea monolitica

Una arquitectura monolitica significa que la aplicacion se despliega como **una sola unidad**. En este proyecto, el archivo principal es:

```text
backend/src/app.js
```

Ese archivo levanta Express, registra middlewares, conecta las rutas de los modulos y sirve tambien la interfaz compilada desde:

```text
backend/public/
```

Por eso, API y frontend se ejecutan desde el mismo servidor, normalmente en el puerto `3001`.

### Que significa que sea modular

Aunque todo se despliega junto, el codigo no esta mezclado. Esta separado por dominios funcionales:

```text
backend/src/modules/
  auth/
  users/
  clients/
  tables/
  reservations/
  reports/
```

Cada modulo tiene responsabilidades claras:

- `Routes`: define las rutas HTTP.
- `Controller`: recibe `req`, llama al servicio y responde con JSON.
- `Service`: contiene la logica de negocio y las consultas a PostgreSQL.

Ejemplo del modulo de reservas:

```text
reservations/
  reservationRoutes.js
  reservationController.js
  reservationService.js
```

### Idea clave para explicar

> "El sistema es monolitico porque se despliega como una sola aplicacion Express, pero es modular porque internamente cada funcionalidad esta separada en carpetas independientes con rutas, controladores y servicios."

---

## 5. Estructura del proyecto

Estructura real del repositorio:

```text
JodasaReserveishon/
  readme.md
  sistema-reservas-mesas.md
  guia-exposicion-proyecto.md
  package-lock.json

  backend/
    package.json
    package-lock.json

    db/
      schema.sql

    scripts/
      seed.js

    public/
      index.html
      assets/
        index-Dba8gnmV.js
        index-BqTDD_UF.css

    src/
      app.js

      config/
        db.js

      middlewares/
        authMiddleware.js
        roleMiddleware.js
        errorHandler.js

      modules/
        auth/
          authRoutes.js
          authController.js
          authService.js

        users/
          userRoutes.js
          userController.js
          userService.js

        clients/
          clientRoutes.js
          clientController.js
          clientService.js

        tables/
          tableRoutes.js
          tableController.js
          tableService.js

        reservations/
          reservationRoutes.js
          reservationController.js
          reservationService.js

        reports/
          reportRoutes.js
          reportController.js
          reportService.js

  stitch/
    html/
      login.html
      dashboard.html
      reservations.html
      availability.html
      clients.html
      tables.html
      reports.html

    screenshots/
      login.png
      dashboard.png
      reservations.png
      availability.png
      clients.png
      tables.png
      reports.png
```

### Explicacion de carpetas

| Carpeta / archivo | Funcion |
|---|---|
| `backend/src/app.js` | Punto de entrada del servidor Express. Registra rutas, middlewares y sirve el frontend. |
| `backend/src/config/db.js` | Configura la conexion a PostgreSQL usando `pg` y `DATABASE_URL`. |
| `backend/src/middlewares/` | Contiene seguridad, control de roles y manejo centralizado de errores. |
| `backend/src/modules/` | Contiene los modulos principales del sistema. |
| `backend/db/schema.sql` | Define tablas, restricciones, indices y datos iniciales de mesas. |
| `backend/scripts/seed.js` | Inserta datos iniciales, como usuario administrador y clientes demo. |
| `backend/public/` | Contiene la interfaz React ya compilada. |
| `stitch/` | Contiene prototipos HTML y capturas de pantallas de referencia visual. |

---

## 6. Capas logicas

Aunque el proyecto es un monolito, se puede explicar por capas logicas:

### 6.1 Capa de presentacion

Es la interfaz que usa el usuario final. En el proyecto esta compilada dentro de:

```text
backend/public/
```

Y hay referencias visuales en:

```text
stitch/html/
stitch/screenshots/
```

Pantallas principales:

- Login
- Dashboard
- Reservas
- Disponibilidad
- Clientes
- Mesas
- Reportes

### 6.2 Capa de rutas

Define los endpoints HTTP. Ejemplos:

```text
/api/auth
/api/users
/api/clients
/api/tables
/api/reservations
/api/reports
```

Cada archivo `*Routes.js` decide que controlador atiende cada ruta.

### 6.3 Capa de controladores

Los controladores reciben la solicitud HTTP, leen parametros del `req`, llaman al servicio y devuelven una respuesta JSON.

Ejemplo:

```text
reservationController.js
```

Contiene funciones como:

- `list`
- `availability`
- `create`
- `update`
- `cancel`
- `status`

### 6.4 Capa de servicios

Es la capa mas importante para la logica de negocio. Aqui se validan reglas como:

- si una mesa esta disponible;
- si una reserva se solapa con otra;
- si se debe registrar auditoria;
- si una reserva puede cancelarse.

Ejemplo:

```text
reservationService.js
```

### 6.5 Capa de acceso a datos

El proyecto usa el paquete `pg` para ejecutar SQL directamente contra PostgreSQL.

La conexion esta en:

```text
backend/src/config/db.js
```

Los servicios hacen consultas como `SELECT`, `INSERT`, `UPDATE` y transacciones.

### 6.6 Capa de persistencia

La persistencia esta en PostgreSQL. El modelo se define en:

```text
backend/db/schema.sql
```

Tablas principales:

- `usuarios`: datos de acceso y roles.
- `clientes`: informacion de los clientes.
- `mesas`: numero, capacidad, ubicacion y estado.
- `reservaciones`: fecha, hora, mesa, cliente, estado y observaciones.
- `auditoria`: registro historico de acciones.

### 6.7 Capa transversal de seguridad y errores

Esta capa aplica a varios modulos:

- `authMiddleware.js`: valida token JWT.
- `roleMiddleware.js`: valida roles.
- `errorHandler.js`: responde errores de forma centralizada.

---

## 7. Flujo de una reserva

Este es el flujo principal del sistema:

### Paso 1: Inicio de sesion

El usuario entra con sus credenciales.

Ruta:

```text
POST /api/auth/login
```

El sistema:

1. Busca el usuario en la tabla `usuarios`.
2. Verifica la contrasena con `bcryptjs`.
3. Genera un token JWT valido por 8 horas.
4. Devuelve el token y los datos del usuario.

### Paso 2: Consulta o registro del cliente

Antes de reservar, el sistema necesita un cliente.

Rutas:

```text
GET /api/clients?search=texto
POST /api/clients
PUT /api/clients/:id
```

El usuario puede buscar un cliente existente o registrar uno nuevo.

### Paso 3: Consulta de disponibilidad

El sistema consulta que mesas cumplen:

- estan activas;
- tienen estado `disponible`;
- tienen capacidad suficiente;
- no tienen reservas solapadas en ese horario.

Ruta:

```text
GET /api/reservations/availability?fecha=2026-06-16&hora_inicio=19:00&hora_fin=21:00&num_personas=4
```

La logica esta en:

```text
reservationService.js -> getAvailability()
```

### Paso 4: Creacion de la reserva

Cuando el usuario selecciona cliente, mesa, fecha y horario, se crea la reserva.

Ruta:

```text
POST /api/reservations
```

Datos principales:

```json
{
  "id_cliente": 1,
  "id_mesa": 3,
  "fecha": "2026-06-16",
  "hora_inicio": "19:00",
  "hora_fin": "21:00",
  "num_personas": 4,
  "estado": "pendiente",
  "observaciones": "Mesa cerca de ventana"
}
```

### Paso 5: Validacion contra conflictos

Antes de insertar la reserva, el sistema llama a:

```text
assertAvailable()
```

Esta funcion revisa si existe una reserva activa para la misma mesa, fecha y horario.

Usa esta idea:

```sql
(hora_inicio, hora_fin) OVERLAPS ($3::time, $4::time)
```

Eso significa que PostgreSQL detecta si dos rangos de tiempo se cruzan.

Estados que no bloquean disponibilidad:

- `cancelada`
- `finalizada`
- `no_asistio`

Estados que si bloquean disponibilidad:

- `pendiente`
- `confirmada`

### Paso 6: Transaccion de base de datos

La reserva se crea dentro de una transaccion:

```text
BEGIN
INSERT reservacion
INSERT auditoria
COMMIT
```

Si algo falla:

```text
ROLLBACK
```

Esto evita que quede una reserva creada sin auditoria, o una auditoria sin reserva.

### Paso 7: Auditoria

Despues de crear, modificar, cancelar o cambiar estado, se inserta un registro en:

```text
auditoria
```

Esto permite saber:

- que usuario hizo la accion;
- sobre que tabla;
- que operacion realizo;
- sobre que registro;
- en que fecha y hora.

### Paso 8: Consulta, cambio de estado o cancelacion

Luego la reserva puede:

- listarse con filtros;
- modificarse;
- cancelarse;
- cambiar de estado.

Rutas:

```text
GET /api/reservations
PUT /api/reservations/:id
PATCH /api/reservations/:id/cancel
PATCH /api/reservations/:id/status
```

---

## 8. Modulos principales

### 8.1 Modulo de autenticacion: `auth`

Ubicacion:

```text
backend/src/modules/auth/
```

Responsabilidad:

- iniciar sesion;
- cerrar sesion;
- consultar usuario actual;
- generar token JWT.

Archivos:

- `authRoutes.js`
- `authController.js`
- `authService.js`

Rutas principales:

```text
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

Tecnologias usadas:

- `bcryptjs` para validar contrasenas.
- `jsonwebtoken` para generar y validar tokens.

---

### 8.2 Modulo de usuarios: `users`

Ubicacion:

```text
backend/src/modules/users/
```

Responsabilidad:

- listar usuarios;
- crear usuarios;
- asignar roles.

Rutas:

```text
GET /api/users
POST /api/users
```

Restriccion:

- Solo el rol `administrador` puede acceder.

Tabla relacionada:

```text
usuarios
```

---

### 8.3 Modulo de clientes: `clients`

Ubicacion:

```text
backend/src/modules/clients/
```

Responsabilidad:

- registrar clientes;
- buscar clientes;
- actualizar clientes.

Rutas:

```text
GET /api/clients
POST /api/clients
PUT /api/clients/:id
```

Tabla relacionada:

```text
clientes
```

Campos principales:

- `nombres`
- `apellidos`
- `telefono`
- `email`
- `num_id`

---

### 8.4 Modulo de mesas: `tables`

Ubicacion:

```text
backend/src/modules/tables/
```

Responsabilidad:

- listar mesas;
- consultar horario de una mesa;
- crear mesas;
- actualizar mesas.

Rutas:

```text
GET /api/tables
GET /api/tables/:id/schedule
POST /api/tables
PUT /api/tables/:id
```

Restriccion:

- Crear y actualizar mesas requiere rol `administrador`.

Tabla relacionada:

```text
mesas
```

Campos principales:

- `numero`
- `capacidad`
- `ubicacion`
- `estado`
- `activo`

---

### 8.5 Modulo de reservas: `reservations`

Ubicacion:

```text
backend/src/modules/reservations/
```

Responsabilidad:

- consultar disponibilidad;
- crear reservas;
- listar reservas;
- modificar reservas;
- cancelar reservas;
- cambiar estados;
- registrar auditoria.

Rutas:

```text
GET /api/reservations/availability
GET /api/reservations
POST /api/reservations
PUT /api/reservations/:id
PATCH /api/reservations/:id/cancel
PATCH /api/reservations/:id/status
```

Tablas relacionadas:

```text
reservaciones
clientes
mesas
usuarios
auditoria
```

Este es el modulo central del proyecto porque conecta clientes, mesas, usuarios y disponibilidad.

---

### 8.6 Modulo de reportes: `reports`

Ubicacion:

```text
backend/src/modules/reports/
```

Responsabilidad:

- mostrar resumen del dashboard;
- consultar reservas por dia;
- consultar mesas mas reservadas;
- consultar clientes frecuentes;
- consultar horarios pico;
- consultar reservas canceladas.

Rutas:

```text
GET /api/reports/dashboard
GET /api/reports/by-day
GET /api/reports/top-tables
GET /api/reports/frequent-clients
GET /api/reports/peak-hours
GET /api/reports/cancelled
```

Restriccion:

- El dashboard esta disponible para usuarios autenticados.
- Los reportes administrativos requieren rol `administrador`.

---

### 8.7 Middlewares

Ubicacion:

```text
backend/src/middlewares/
```

Archivos:

- `authMiddleware.js`
- `roleMiddleware.js`
- `errorHandler.js`

Responsabilidad:

- proteger rutas privadas;
- validar roles;
- centralizar errores.

---

## 9. Endpoints principales

| Metodo | Ruta | Funcion | Seguridad |
|---|---|---|---|
| GET | `/api/health` | Verifica que el servidor este online. | Publica |
| POST | `/api/auth/login` | Inicia sesion. | Publica |
| POST | `/api/auth/logout` | Cierra sesion. | JWT |
| GET | `/api/auth/me` | Devuelve usuario actual. | JWT |
| GET | `/api/users` | Lista usuarios. | JWT + administrador |
| POST | `/api/users` | Crea usuario. | JWT + administrador |
| GET | `/api/clients` | Lista/busca clientes. | JWT |
| POST | `/api/clients` | Crea cliente. | JWT |
| PUT | `/api/clients/:id` | Actualiza cliente. | JWT |
| GET | `/api/tables` | Lista mesas. | JWT |
| GET | `/api/tables/:id/schedule` | Agenda de una mesa. | JWT |
| POST | `/api/tables` | Crea mesa. | JWT + administrador |
| PUT | `/api/tables/:id` | Actualiza mesa. | JWT + administrador |
| GET | `/api/reservations/availability` | Consulta disponibilidad. | JWT |
| GET | `/api/reservations` | Lista reservas con filtros. | JWT |
| POST | `/api/reservations` | Crea reserva. | JWT |
| PUT | `/api/reservations/:id` | Modifica reserva. | JWT |
| PATCH | `/api/reservations/:id/cancel` | Cancela reserva. | JWT |
| PATCH | `/api/reservations/:id/status` | Cambia estado. | JWT |
| GET | `/api/reports/dashboard` | Indicadores principales. | JWT |
| GET | `/api/reports/by-day` | Reservas por dia. | JWT + administrador |
| GET | `/api/reports/top-tables` | Mesas mas reservadas. | JWT + administrador |
| GET | `/api/reports/frequent-clients` | Clientes frecuentes. | JWT + administrador |
| GET | `/api/reports/peak-hours` | Horarios pico. | JWT + administrador |
| GET | `/api/reports/cancelled` | Reservas canceladas. | JWT + administrador |

---

## 10. Base de datos

### Tabla `usuarios`

Guarda las cuentas del sistema.

Campos importantes:

- `id`
- `username`
- `password`
- `rol`
- `nombre`
- `activo`

Roles permitidos:

- `administrador`
- `recepcionista`

### Tabla `clientes`

Guarda la informacion de las personas que hacen reservas.

Campos importantes:

- `nombres`
- `apellidos`
- `telefono`
- `email`
- `num_id`

### Tabla `mesas`

Guarda la configuracion de mesas del restaurante.

Campos importantes:

- `numero`
- `capacidad`
- `ubicacion`
- `estado`
- `activo`

Ubicaciones permitidas:

- `interior`
- `terraza`
- `ventana`
- `salon_privado`
- `barra`

Estados permitidos:

- `disponible`
- `ocupada`
- `mantenimiento`
- `inactiva`

### Tabla `reservaciones`

Es la tabla central del sistema.

Relaciona:

- un cliente;
- una mesa;
- un usuario que creo la reserva;
- una fecha;
- un rango horario;
- un estado.

Estados permitidos:

- `pendiente`
- `confirmada`
- `cancelada`
- `finalizada`
- `no_asistio`

### Tabla `auditoria`

Guarda trazabilidad de operaciones.

Campos importantes:

- `id_usuario`
- `tabla_afectada`
- `operacion`
- `registro_id`
- `descripcion`
- `fecha_hora`

---

## 11. Diagrama simple de arquitectura

```text
Usuario
  |
  v
Interfaz web React compilada
  |
  v
Express app.js
  |
  +--> Middlewares
  |      +--> authMiddleware
  |      +--> roleMiddleware
  |      +--> errorHandler
  |
  +--> Modulo Auth
  +--> Modulo Users
  +--> Modulo Clients
  +--> Modulo Tables
  +--> Modulo Reservations
  +--> Modulo Reports
  |
  v
PostgreSQL
  |
  +--> usuarios
  +--> clientes
  +--> mesas
  +--> reservaciones
  +--> auditoria
```

---

## 12. Guion corto para exponer

### Introduccion

"Mi proyecto es un sistema de reservas de mesas para restaurante. Permite manejar clientes, mesas, disponibilidad, reservas, usuarios y reportes. Esta construido con Node.js, Express y PostgreSQL, y la interfaz web esta compilada y servida desde el mismo backend."

### Requerimientos

"Los requerimientos funcionales son las acciones que el sistema permite realizar: iniciar sesion, registrar clientes, administrar mesas, consultar disponibilidad, crear reservas, modificarlas, cancelarlas, cambiar su estado y generar reportes. Tambien registra auditoria para saber que usuario hizo cambios importantes."

"Los requerimientos no funcionales se enfocan en calidad: seguridad con JWT, control de roles, integridad de datos con llaves foraneas y restricciones, rendimiento con indices, mantenibilidad por modulos y confiabilidad mediante transacciones."

### Arquitectura

"La arquitectura es monolitica modular. Es monolitica porque todo se ejecuta en una sola aplicacion Express y se despliega como una unidad. Pero es modular porque internamente separa responsabilidades en carpetas: autenticacion, usuarios, clientes, mesas, reservas y reportes."

### Capas

"Logicamente se divide en presentacion, rutas, controladores, servicios, acceso a datos, persistencia y seguridad. Las rutas reciben peticiones HTTP, los controladores coordinan la respuesta, los servicios contienen la logica de negocio y PostgreSQL guarda la informacion."

### Flujo de reserva

"El flujo principal empieza con el login. Luego se busca o registra un cliente. Despues se consulta disponibilidad indicando fecha, hora y cantidad de personas. El sistema revisa mesas activas, disponibles, con capacidad suficiente y sin reservas solapadas. Si todo esta correcto, crea la reserva dentro de una transaccion y registra auditoria."

### Cierre

"La parte mas importante del proyecto es el modulo de reservas porque une clientes, mesas, usuarios, disponibilidad y auditoria. Gracias a la estructura modular, el sistema sigue siendo facil de mantener aunque sea un monolito."

---

## 13. Frases clave para memorizar

- "Es monolitico porque se despliega como una sola aplicacion."
- "Es modular porque el codigo esta separado por dominios funcionales."
- "Las rutas reciben la peticion, los controladores coordinan y los servicios aplican la logica de negocio."
- "La disponibilidad se valida comparando fecha, mesa y rango horario con `OVERLAPS`."
- "Las operaciones importantes de reserva usan transacciones para mantener consistencia."
- "JWT protege las rutas y el middleware de roles limita funciones administrativas."
- "La tabla `auditoria` permite trazabilidad de cambios."
- "El modulo central es `reservations` porque conecta clientes, mesas, usuarios y reportes."

---

## 14. Preguntas probables y respuestas rapidas

### Por que no es microservicios?

Porque no hay servicios independientes desplegados por separado. Todo corre en una sola aplicacion Express. La separacion es interna, por carpetas y modulos.

### Cual es la ventaja del monolito en este proyecto?

Es mas simple de desplegar, probar y entender. Para un sistema academico o un restaurante pequeno, reduce complejidad operativa.

### Donde esta la logica mas importante?

En `backend/src/modules/reservations/reservationService.js`, porque ahi se valida disponibilidad, se crean reservas, se modifican, se cancelan y se registra auditoria.

### Como se evita que dos reservas usen la misma mesa al mismo tiempo?

Antes de crear o actualizar una reserva, el sistema consulta si existe otra reserva activa para la misma mesa y fecha con horario solapado. Si existe, devuelve error `409`.

### Que roles maneja?

Maneja `administrador` y `recepcionista`. Algunas acciones como crear usuarios, administrar mesas y ver reportes administrativos requieren `administrador`.

### Que pasa si falla la creacion de una reserva?

Como se usa una transaccion, si algo falla se ejecuta `ROLLBACK` y no quedan datos incompletos.

### Para que sirve la auditoria?

Sirve para registrar acciones importantes, por ejemplo crear, modificar, cancelar o cambiar el estado de una reserva.

### Cual es la base de datos?

PostgreSQL, definida en `backend/db/schema.sql`.

