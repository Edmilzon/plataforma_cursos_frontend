// src/app/api/rewards/redeem/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, rewardId } = body;

    if (!userId || !rewardId) {
      return NextResponse.json({ success: false, message: 'Faltan datos' });
    }

    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'rootCONALE47347',
      database: 'polimathia',
    });

    // Obtener puntos del usuario y stock de la recompensa
    const [userRows] = await connection.execute(
      'SELECT saldo_punto FROM usuario WHERE id_usuario = ?',
      [userId]
    );
    const userPoints = (userRows as any)[0]?.saldo_punto || 0;

    const [rewardRows] = await connection.execute(
      'SELECT puntos_requeridos, cantidad_disponible FROM recompensa WHERE id_recompensa = ?',
      [rewardId]
    );
    const reward = (rewardRows as any)[0];
    if (!reward) {
      await connection.end();
      return NextResponse.json({ success: false, message: 'Recompensa no encontrada' });
    }

    if (reward.cantidad_disponible <= 0) {
      await connection.end();
      return NextResponse.json({ success: false, message: 'Recompensa agotada' });
    }

    if (userPoints < reward.puntos_requeridos) {
      await connection.end();
      return NextResponse.json({ success: false, message: 'No tienes suficientes puntos' });
    }

    // Registrar el canje
    await connection.execute(
      'INSERT INTO canje_recompensa (id_usuario, id_recompensa, fecha_canje, puntos_utilizados) VALUES (?, ?, NOW(), ?)',
      [userId, rewardId, reward.puntos_requeridos]
    );

    // Actualizar puntos del usuario
    await connection.execute(
      'UPDATE usuario SET saldo_punto = saldo_punto - ? WHERE id_usuario = ?',
      [reward.puntos_requeridos, userId]
    );

    // Reducir stock de la recompensa
    await connection.execute(
      'UPDATE recompensa SET cantidad_disponible = cantidad_disponible - 1 WHERE id_recompensa = ?',
      [rewardId]
    );

    await connection.end();

    return NextResponse.json({ success: true, message: 'Recompensa canjeada correctamente' });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Error al canjear la recompensa' });
  }
}
