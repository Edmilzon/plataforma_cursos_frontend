// src/app/api/generate-report/route.ts
import { reportGenerator } from '@/utils/reportGenerator';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { reportType, reportData } = await req.json();

    if (!reportType || !reportData) {
      return new NextResponse('Faltan parámetros: reportType o reportData', { status: 400 });
    }

    const pdfBuffer = await reportGenerator.generate(reportType, reportData);

    const headers = new Headers();
    headers.append('Content-Type', 'application/pdf');
    headers.append('Content-Disposition', `attachment; filename="Reporte_${reportType}.pdf"`);

    return new NextResponse(pdfBuffer, { headers });

  } catch (error) {
    console.error('❌ Error generando PDF en la API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return new NextResponse(`Error interno del servidor: ${errorMessage}`, { status: 500 });
  }
}