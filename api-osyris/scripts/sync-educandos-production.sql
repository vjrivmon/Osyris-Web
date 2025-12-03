-- Script de sincronización de educandos para producción
-- Generado: 2025-12-03
-- Fuente: asociadas-21-11-2025-12-39-15.xlsx

BEGIN;

-- =====================================================
-- PASO 1: Eliminar educandos que no están en el Excel
-- =====================================================
DELETE FROM educandos WHERE nombre = 'Toni' AND apellidos = 'Brezuica';
DELETE FROM educandos WHERE nombre = 'Jadiel' AND apellidos = 'Contento Gualán';
DELETE FROM educandos WHERE nombre = 'Marc' AND apellidos = 'Elvers-Molina';
DELETE FROM educandos WHERE nombre = 'Raúl' AND apellidos = 'Encinas Castilla';
DELETE FROM educandos WHERE nombre = 'Jana' AND apellidos = 'Faustino García';
DELETE FROM educandos WHERE nombre = 'Adriana' AND apellidos = 'Joelle Lizarraga';
DELETE FROM educandos WHERE nombre = 'Manuel' AND apellidos = 'Ramirez de la Dueña';

-- =====================================================
-- PASO 2: Insertar educandos nuevos del Excel
-- =====================================================
-- Nuevos educandos que faltan en producción

-- Castores (seccion_id = 1)
INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Alejandro', 'Alarcon García', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Alejandro' AND apellidos='Alarcon García');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Pau', 'Badía Maestre', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Pau' AND apellidos='Badía Maestre');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Luis', 'Barry', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Luis' AND apellidos='Barry');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Rubén', 'Barry', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Rubén' AND apellidos='Barry');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Clara', 'Boronat Pastor', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Clara' AND apellidos='Boronat Pastor');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Gael', 'Chalmeta Martínez', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Gael' AND apellidos='Chalmeta Martínez');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Marc', 'Díaz García', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Marc' AND apellidos='Díaz García');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Vera', 'Gil Montaner', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Vera' AND apellidos='Gil Montaner');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Luca', 'Gil-Terrón Córcoles', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Luca' AND apellidos='Gil-Terrón Córcoles');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Ada', 'López Rubio', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Ada' AND apellidos='López Rubio');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Lola', 'Marín Estellés', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Lola' AND apellidos='Marín Estellés');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Theo', 'Miró Martinschledde', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Theo' AND apellidos='Miró Martinschledde');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Àngela', 'Moliner Mases', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Àngela' AND apellidos='Moliner Mases');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Jaime', 'Pastor Quintana', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Jaime' AND apellidos='Pastor Quintana');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Nilo', 'Pozo Redondo', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Nilo' AND apellidos='Pozo Redondo');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Arianna', 'Sánchez Boffi', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Arianna' AND apellidos='Sánchez Boffi');

-- Lobatos (seccion_id = 2)
INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Aitana', 'Acosta Hernández', 2, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Aitana' AND apellidos='Acosta Hernández');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Ariadna', 'López Bort', 2, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Ariadna' AND apellidos='López Bort');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Guillem', 'Marín Estellés', 2, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Guillem' AND apellidos='Marín Estellés');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Isabel', 'Tornel Castaldo', 2, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Isabel' AND apellidos='Tornel Castaldo');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Inés', 'Povo Álvarez', 2, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Inés' AND apellidos='Povo Álvarez');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Adriana Joelle', 'Lizarraga Cstellón', 2, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Adriana Joelle' AND apellidos='Lizarraga Cstellón');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Alexandra', 'Piá Gascón', 2, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Alexandra' AND apellidos='Piá Gascón');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Paula', 'Pla Gimeno', 2, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Paula' AND apellidos='Pla Gimeno');

-- Tropa (seccion_id = 3)
INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Irene', 'Caballero García', 3, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Irene' AND apellidos='Caballero García');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Clara', 'Tornel Castaldo', 3, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Clara' AND apellidos='Tornel Castaldo');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Mireia', 'Povo Álvarez', 3, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Mireia' AND apellidos='Povo Álvarez');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Leo', 'Gallardo Albiñana', 3, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Leo' AND apellidos='Gallardo Albiñana');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Carla', 'Gimeno Pérez', 3, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Carla' AND apellidos='Gimeno Pérez');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Paula', 'García Carbonell', 3, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Paula' AND apellidos='García Carbonell');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Guillermo', 'Íñiguez Macarós', 3, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Guillermo' AND apellidos='Íñiguez Macarós');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Mateo', 'García Burillo', 3, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Mateo' AND apellidos='García Burillo');

INSERT INTO educandos (nombre, apellidos, seccion_id, activo, fecha_alta)
SELECT 'Luisa', 'Campos Alves', 3, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM educandos WHERE nombre='Luisa' AND apellidos='Campos Alves');

-- =====================================================
-- PASO 3: Actualizar secciones según Excel
-- =====================================================
-- Mapeo: Colònia=1, Estol=2, Unitat=3, Expedició=4, Ruta=5

-- Actualizar a Castores (1) - Colònia
UPDATE educandos SET seccion_id = 1 WHERE nombre = 'Marcos' AND apellidos = 'López Tormo';
UPDATE educandos SET seccion_id = 1 WHERE nombre = 'Pau' AND apellidos = 'Alvarez Pelicer';

-- Actualizar a Lobatos (2) - Estol
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Aitana' AND apellidos = 'Acosta Hernández';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Pau' AND apellidos = 'Alcocer Beleña';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Joan' AND apellidos = 'Bárzena Bresó';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Lluc' AND apellidos = 'Bárzena Bresó';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Brais' AND apellidos = 'Carrilero Fernández Villamil';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Izan' AND apellidos = 'Carrilero Fernández Villamil';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Nayara' AND apellidos = 'Carrilero Fernández-Villamil';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Kilian' AND apellidos = 'Chirivella Trapero';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Gabriel' AND apellidos = 'Denis Fernández-Villamil';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Mario' AND apellidos = 'Fito Silvar';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Eva' AND apellidos = 'Gimeno Pérez';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Artur' AND apellidos = 'Lechovic';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Martí' AND apellidos = 'Litago Almela';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Leonardo Fee' AND apellidos = 'Lizarraga Castellón';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Javier' AND apellidos = 'Maiques Hermenegildo';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Ana' AND apellidos = 'Marcu Rodríguez';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Miguel' AND apellidos = 'Martin Tormos';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Daniel' AND apellidos = 'Martín Fernández';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Deva' AND apellidos = 'Meliá Gómez';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Paula' AND apellidos = 'Parrillas Segura';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Andrés' AND apellidos = 'Pastor Quitana';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Alexander' AND apellidos = 'Speranskii';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Bruno' AND apellidos = 'Torrella Romero';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Marcel' AND apellidos = 'Villacorta Ruiz';
UPDATE educandos SET seccion_id = 2 WHERE nombre = 'Martín' AND apellidos = 'Yunta Gonzalez';

-- Actualizar a Tropa (3) - Unitat
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Natalia' AND apellidos = 'Alborch Lluna';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Nela' AND apellidos = 'Chirivella Trapero';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Blessing' AND apellidos = 'Dere Álvarez';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Lia' AND apellidos = 'Fito Silvar';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Valentina' AND apellidos = 'Gallego de Oliveira';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Alonso' AND apellidos = 'García Hidalgo';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Maximilian' AND apellidos = 'García Martínez';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Ana' AND apellidos = 'Gimeno Ruiz';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Darío' AND apellidos = 'Granados Garrido';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Rumaisa' AND apellidos = 'Heloub Karmoune';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Andrea' AND apellidos = 'Iranzo Andrés';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Carlos' AND apellidos = 'Maiques Hermenegildo';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Marta' AND apellidos = 'Marco Buigues';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Nicolás' AND apellidos = 'Marcu Rodríguez';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Álvaro' AND apellidos = 'Martín Fernández';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Daniel' AND apellidos = 'Navarro Borja';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Alba' AND apellidos = 'Parrillas Segura';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'César' AND apellidos = 'Ponz Andreu';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Andrea' AND apellidos = 'Regidor Fernández';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Candela' AND apellidos = 'Rojas Bayo';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Martín' AND apellidos = 'Romero';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Cloe' AND apellidos = 'de la Dueña Hoyas';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Elsa' AND apellidos = 'de la Dueña Hoyas';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Marc' AND apellidos = 'Álvarez Pellicer';
UPDATE educandos SET seccion_id = 3 WHERE nombre = 'Júlia' AND apellidos = 'Litago Almela';

-- Actualizar a Pioneros (4) - Expedició
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Oriana' AND apellidos = 'Taléns González';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Marcos' AND apellidos = 'Sanchis Vidal';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Aya' AND apellidos = 'Heloub Karmoune';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Matías' AND apellidos = 'Vico Coello';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Naomi Ainhoa' AND apellidos = 'Padilla Casas';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Naia Valentina' AND apellidos = 'Padilla Casas';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Luena' AND apellidos = 'Chirivella Trapero';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Irene' AND apellidos = 'Vico';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Gabriela' AND apellidos = 'Garcia Martinez';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Ángel' AND apellidos = 'Jiménez Soriano';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Ariana' AND apellidos = 'García Carbonell';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Nora' AND apellidos = 'Ponz Andreu';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Andrés Imanol' AND apellidos = 'Acosta Hernández';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Nicolas' AND apellidos = 'Cogollos Botija';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Laia' AND apellidos = 'Álvarez Pellicer';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Alejandro' AND apellidos = 'Arjona Azara';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Arturo' AND apellidos = 'De Oliveira';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Lleonard' AND apellidos = 'Oliver Gómez';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Mar' AND apellidos = 'Miravet Buigues';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Martina' AND apellidos = 'Flors Recubenis';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Alejandra' AND apellidos = 'Pechene Loza';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Claudia' AND apellidos = 'Flors Recubenis';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Diego' AND apellidos = 'Martín Tormes';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Marc' AND apellidos = 'Navarro Borja';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Sara' AND apellidos = 'Encinas Moliner';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'María Amparo' AND apellidos = 'Rivas Monferrer';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Belén' AND apellidos = 'Regidor Fernández';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Álex' AND apellidos = 'García Martínez';
UPDATE educandos SET seccion_id = 4 WHERE nombre = 'Elena' AND apellidos = 'García Giménez';

-- Actualizar a Rutas (5) - Ruta
UPDATE educandos SET seccion_id = 5 WHERE nombre = 'Ainhoa' AND apellidos = 'Andrés López';
UPDATE educandos SET seccion_id = 5 WHERE nombre = 'Hania' AND apellidos = 'Raza';
UPDATE educandos SET seccion_id = 5 WHERE nombre = 'Guillermo' AND apellidos = 'Cogollos Botija';
UPDATE educandos SET seccion_id = 5 WHERE nombre = 'Javier' AND apellidos = 'Miravet Buigues';
UPDATE educandos SET seccion_id = 5 WHERE nombre = 'Anna' AND apellidos = 'Navarro Gonzalez';
UPDATE educandos SET seccion_id = 5 WHERE nombre = 'Nicolás' AND apellidos = 'Faustino García';
UPDATE educandos SET seccion_id = 5 WHERE nombre = 'Sara' AND apellidos = 'García Giménez';
UPDATE educandos SET seccion_id = 5 WHERE nombre = 'Carla' AND apellidos = 'Valls Gracia';
UPDATE educandos SET seccion_id = 5 WHERE nombre = 'Pau' AND apellidos = 'Encinas Moliner';
UPDATE educandos SET seccion_id = 5 WHERE nombre = 'Leire' AND apellidos = 'Encinas Moliner';
UPDATE educandos SET seccion_id = 5 WHERE nombre = 'Lola' AND apellidos = 'Bouharaoui Ruiz';
UPDATE educandos SET seccion_id = 5 WHERE nombre = 'Iván' AND apellidos = 'Del Arco Fuster';
UPDATE educandos SET seccion_id = 5 WHERE nombre = 'Iván' AND apellidos = 'Latorre Ráez';

COMMIT;

-- Verificar resultado
SELECT s.nombre as seccion, COUNT(*) as cantidad
FROM educandos e
JOIN secciones s ON e.seccion_id = s.id
WHERE e.activo = true
GROUP BY s.nombre, s.id
ORDER BY s.id;
