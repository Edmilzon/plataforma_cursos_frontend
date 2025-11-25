import { NextResponse } from 'next/server';
import { db } from '@/services/db'; // tu conexión a la DB


export async function GET() {
  try {
    const [rewards] = await db.query('SELECT * FROM recompensa');

    return Response.json({ success: true, rewards });
  } catch (err) {
    console.error('Error cargando recompensas:', err);
    return Response.json({ success: false, message: 'No se pudieron cargar las recompensas' });
  }
}
