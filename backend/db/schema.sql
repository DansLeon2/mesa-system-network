  DROP TABLE IF EXISTS auditoria;
  DROP TABLE IF EXISTS reservaciones;
  DROP TABLE IF EXISTS mesas;
  DROP TABLE IF EXISTS clientes;
  DROP TABLE IF EXISTS usuarios;

  CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'recepcionista'
      CHECK (rol IN ('administrador', 'recepcionista')),
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100) UNIQUE,
    num_id VARCHAR(30),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE mesas (
    id SERIAL PRIMARY KEY,
    numero INTEGER NOT NULL UNIQUE,
    capacidad INTEGER NOT NULL CHECK (capacidad > 0),
    ubicacion VARCHAR(50) DEFAULT 'interior'
      CHECK (ubicacion IN ('interior', 'terraza', 'ventana', 'salon_privado', 'barra')),
    estado VARCHAR(20) DEFAULT 'disponible'
      CHECK (estado IN ('disponible', 'ocupada', 'mantenimiento', 'inactiva')),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE reservaciones (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    id_mesa INTEGER NOT NULL REFERENCES mesas(id) ON DELETE RESTRICT,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id),
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    num_personas INTEGER NOT NULL CHECK (num_personas > 0),
    estado VARCHAR(20) DEFAULT 'pendiente'
      CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'finalizada', 'no_asistio')),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by INTEGER REFERENCES usuarios(id),
    CHECK (hora_fin > hora_inicio)
  );

  CREATE TABLE auditoria (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER REFERENCES usuarios(id),
    tabla_afectada VARCHAR(50) NOT NULL,
    operacion VARCHAR(20) NOT NULL CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
    registro_id INTEGER,
    descripcion TEXT,
    fecha_hora TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX idx_res_fecha ON reservaciones(fecha);
  CREATE INDEX idx_res_mesa ON reservaciones(id_mesa);
  CREATE INDEX idx_res_cliente ON reservaciones(id_cliente);
  CREATE INDEX idx_res_estado ON reservaciones(estado);
  CREATE INDEX idx_res_mesa_fecha ON reservaciones(id_mesa, fecha);
  CREATE INDEX idx_clientes_email ON clientes(email);
  CREATE INDEX idx_clientes_telefono ON clientes(telefono);
  CREATE INDEX idx_clientes_num_id ON clientes(num_id);

  INSERT INTO mesas (numero, capacidad, ubicacion) VALUES
  (1, 2, 'ventana'),
  (2, 2, 'ventana'),
  (3, 4, 'interior'),
  (4, 4, 'interior'),
  (5, 4, 'terraza'),
  (6, 6, 'terraza'),
  (7, 8, 'salon_privado'),
  (8, 10, 'salon_privado');
