-- ============================================================

-- 1. USUARIOS 

-- ============================================================

INSERT INTO usuarios (username, password, rol, nombre) VALUES

('admin', 'temporal', 'administrador', 'Administrador Principal'),

('recepcion1', 'temporal', 'recepcionista', 'Recepcionista Mañana'),

('recepcion2', 'temporal', 'recepcionista', 'Recepcionista Noche');



-- ============================================================

-- 2. CLIENTES

-- ============================================================

INSERT INTO clientes (nombres, apellidos, telefono, email, num_id) VALUES

('Mateo', 'Rios', '0991002003', 'mateo.rios@correo.com', '0102030405'),

('Valeria', 'Mora', '0984443311', 'valeria.mora@correo.com', '0103040506'),

('Carlos', 'Andrade', '0971234567', 'candrade@correo.com', '0104050607'),

('Sofia', 'Salazar', '0999876543', 'ssalazar@correo.com', '0105060708'),

('Diego', 'Torres', '0987654321', 'dtorres@correo.com', '0106070809'),

('Camila', 'Vargas', '0991122334', 'camila.v@correo.com', '0107080910'),

('Andres', 'Crespo', '0982233445', 'acrespo@correo.com', '0108091011'),

('Lucia', 'Mendoza', '0973344556', 'lmendoza@correo.com', '0109101112'),

('Javier', 'Perez', '0994455667', 'jperez@correo.com', '0101112131'),

('Martina', 'Castro', '0985566778', 'mcastro@correo.com', '0101213141');



-- ============================================================

-- 3. RESERVACIONES (Mezcla de estados y fechas)

-- ============================================================



INSERT INTO reservaciones (id_cliente, id_mesa, id_usuario, fecha, hora_inicio, hora_fin, num_personas, estado, observaciones) VALUES

(1, 3, 1, CURRENT_DATE - INTERVAL '1 day', '19:00', '21:00', 4, 'finalizada', 'Cumpleaños, dejaron buena propina'),

(2, 1, 2, CURRENT_DATE - INTERVAL '1 day', '20:00', '21:30', 2, 'finalizada', 'Mesa romántica'),

(3, 5, 2, CURRENT_DATE - INTERVAL '1 day', '13:00', '15:00', 4, 'no_asistio', 'Llamaron pero no llegaron');





INSERT INTO reservaciones (id_cliente, id_mesa, id_usuario, fecha, hora_inicio, hora_fin, num_personas, estado, observaciones) VALUES

(4, 7, 1, CURRENT_DATE, '19:30', '22:00', 8, 'confirmada', 'Reunión de negocios'),

(5, 2, 3, CURRENT_DATE, '18:00', '19:30', 2, 'pendiente', 'Quieren vista a la calle'),

(6, 4, 3, CURRENT_DATE, '20:00', '21:30', 4, 'cancelada', 'Canceló por lluvia'),

(7, 8, 2, CURRENT_DATE, '21:00', '23:30', 10, 'confirmada', 'Cena familiar grande'),

(8, 5, 2, CURRENT_DATE, '14:00', '15:30', 3, 'finalizada', 'Almuerzo rápido');





INSERT INTO reservaciones (id_cliente, id_mesa, id_usuario, fecha, hora_inicio, hora_fin, num_personas, estado, observaciones) VALUES

(9, 6, 1, CURRENT_DATE + INTERVAL '1 day', '20:00', '22:00', 6, 'pendiente', 'Avisar si la mesa sale de mantenimiento'),

(10, 3, 3, CURRENT_DATE + INTERVAL '1 day', '19:00', '21:00', 4, 'confirmada', 'Sin cebolla en la comida, alérgicos'),

(1, 1, 1, CURRENT_DATE + INTERVAL '2 days', '21:00', '22:30', 2, 'pendiente', 'Aniversario');



-- ============================================================

-- 4. AUDITORÍA

-- ============================================================

INSERT INTO auditoria (id_usuario, tabla_afectada, operacion, registro_id, descripcion, fecha_hora) VALUES

(1, 'reservaciones', 'INSERT', 1, 'Reserva creada manualmente', CURRENT_DATE - INTERVAL '2 days'),

(2, 'reservaciones', 'UPDATE', 1, 'Cambio de estado a finalizada', CURRENT_DATE - INTERVAL '1 day'),

(3, 'reservaciones', 'UPDATE', 3, 'Cliente no se presentó', CURRENT_DATE - INTERVAL '1 day'),

(1, 'reservaciones', 'INSERT', 4, 'Reserva VIP para 8 personas', CURRENT_DATE),

(3, 'reservaciones', 'UPDATE', 6, 'Cliente llamó para cancelar', CURRENT_DATE);