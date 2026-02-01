-- Fix: Tropa color should be blue, not green (green is only for Rutas)
UPDATE secciones SET color_principal = '#1E88E5' WHERE nombre = 'Tropa';
