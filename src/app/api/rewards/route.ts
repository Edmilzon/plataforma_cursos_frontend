// src/app/api/rewards/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = Number(url.searchParams.get('userId'));
    if (!userId) return NextResponse.json({ success: false, message: 'Falta userId' });

    // Conexión a la base de datos
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'rootCONALE47347',
      database: 'polimathia',
    });

    // Consultamos todas las recompensas
    const [rows] = await connection.execute(
      'SELECT id_recompensa, nombre, descripcion, puntos_requeridos, cantidad_disponible FROM recompensa'
    );

    // Consultamos qué recompensas ya canjeó el usuario
    const [redeemedRows] = await connection.execute(
      'SELECT id_recompensa FROM canje_recompensa WHERE id_usuario = ?',
      [userId]
    );
    const redeemedIds = (redeemedRows as any[]).map(r => r.id_recompensa);

    // Consultamos los puntos del usuario
    const [userRows] = await connection.execute(
      'SELECT saldo_punto FROM usuario WHERE id_usuario = ?',
      [userId]
    );
    const userPoints = (userRows as any)[0]?.saldo_punto || 0;

    // Preparamos la respuesta
    const rewards = (rows as any[]).map(r => ({
      id_recompensa: r.id_recompensa,
      nombre_recompensa: r.nombre,
      descripcion: r.descripcion,
      costo_puntos: r.puntos_requeridos,
      stock: r.cantidad_disponible,
      canjeada: redeemedIds.includes(r.id_recompensa),
    }));

    await connection.end();

    return NextResponse.json({ success: true, rewards, userPoints });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Error al cargar las recompensas' });
  }
}
