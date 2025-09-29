import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Inicializar Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nwkopngnziocsczqkjra.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validar entrada
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email y contraseña son requeridos'
        },
        { status: 400 }
      );
    }

    // Buscar usuario en Supabase
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !usuario) {
      return NextResponse.json(
        {
          success: false,
          message: 'Usuario no encontrado'
        },
        { status: 404 }
      );
    }

    // Verificar contraseña (columna 'contraseña' en la BD)
    const validPassword = await bcrypt.compare(password, usuario.contraseña || usuario.password);

    if (!validPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Contraseña incorrecta'
        },
        { status: 401 }
      );
    }

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return NextResponse.json(
        {
          success: false,
          message: 'El usuario está desactivado'
        },
        { status: 403 }
      );
    }

    // Actualizar último acceso
    await supabase
      .from('usuarios')
      .update({ ultimo_acceso: new Date().toISOString() })
      .eq('id', usuario.id);

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      },
      process.env.JWT_SECRET || 'osyrisScoutGroup2024SecretKey',
      { expiresIn: '24h' }
    );

    // Responder con éxito
    return NextResponse.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          rol: usuario.rol,
          foto_perfil: usuario.foto_perfil
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al iniciar sesión',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}