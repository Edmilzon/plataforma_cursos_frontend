// src/utils/reportGenerator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration } from 'chart.js';
import { StudentReportData, CourseReportData, TeacherReportData, GeneralStats } from './reportDataService';

interface ReportData {
  students?: StudentReportData[];
  courses?: CourseReportData[];
  teachers?: TeacherReportData[];
  general?: GeneralStats;
  startDate?: string;
  endDate?: string;
}

type ReportType = 'students' | 'courses' | 'teachers' | 'general';

const generateChartImage = async (config: ChartConfiguration): Promise<Buffer> => {
  const width = 800; // px
  const height = 400; // px
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: '#ffffff' });
  return await chartJSNodeCanvas.renderToBuffer(config);
};

const addChartsToPDF = async (pdf: jsPDF, data: GeneralStats, startY: number): Promise<number> => {
  let currentY = startY;
  const pageHeight = pdf.internal.pageSize.getHeight();
  const bottomMargin = 25; // Espacio para el pie de página
  const chartHeight = 90; // Altura de la imagen del gráfico en mm
  const spaceForChart = chartHeight + 10; // Gráfico + un poco de espacio

  // Función para verificar si se necesita una nueva página
  const checkAndAddPage = () => {
    if (currentY + spaceForChart > pageHeight - bottomMargin) {
      pdf.addPage();
      currentY = 20; // Reiniciar Y en la parte superior de la nueva página
    }
  };

  if (data.registros_por_mes && data.registros_por_mes.length > 0) {
    checkAndAddPage();
    const registrationConfig: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.registros_por_mes.map(d => d.mes),
        datasets: [{
          label: 'Registros por Mes',
          data: data.registros_por_mes.map(d => d.count),
          backgroundColor: '#3B82F6',
        }],
      },
    };
    const registrationImage = await generateChartImage(registrationConfig);
    pdf.addImage(registrationImage, 'PNG', 15, currentY, 180, chartHeight);
    currentY += spaceForChart;
  }

  if (data.distribucion_edades && data.distribucion_edades.length > 0) {
    checkAndAddPage();
    const ageConfig: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: data.distribucion_edades.map(d => d.rango),
        datasets: [{
          label: 'Distribución de Edades',
          data: data.distribucion_edades.map(d => d.count),
          backgroundColor: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
        }],
      },
    };
    const ageImage = await generateChartImage(ageConfig);
    pdf.addImage(ageImage, 'PNG', 15, currentY, 180, chartHeight);
    currentY += spaceForChart;
  }

  return currentY;
};

const addHeader = (pdf: jsPDF, title: string, startDate?: string, endDate?: string) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor('#2c3e50');
  pdf.text(title, pageWidth / 2, 20, { align: 'center' });

  if (startDate && endDate) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor('#34495e');
    const dateRangeText = `Periodo: ${new Date(startDate).toLocaleDateString('es-ES')} - ${new Date(endDate).toLocaleDateString('es-ES')}`;
    pdf.text(dateRangeText, pageWidth / 2, 28, { align: 'center' });
  }

  pdf.setDrawColor('#3498db');
  pdf.line(15, 35, pageWidth - 15, 35);
};

const addFooter = (pdf: jsPDF) => {
  const pageCount = (pdf as any).internal.getNumberOfPages();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setTextColor('#7f8c8d');
    const text = `Página ${i} de ${pageCount} | Reporte generado el ${new Date().toLocaleDateString('es-ES')}`;
    pdf.text(text, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }
};

const addStudentTable = (pdf: jsPDF, data: StudentReportData[], startY: number) => {
  const head = [['ID', 'Nombre Completo', 'Email', 'Puntos', 'Cursos', 'Registro']];
  const body = data.map(s => [
    s.id,
    `${s.nombre} ${s.apellido}`,
    s.correo,
    s.saldo_punto,
    s.cursos_inscritos,
    new Date(s.fecha_registro).toLocaleDateString('es-ES'),
  ]);

  autoTable(pdf, {
    startY,
    head,
    body,
    theme: 'grid',
    headStyles: { fillColor: '#3498db', textColor: '#ffffff' },
    styles: { fontSize: 8 },
  });
};

const addCourseTable = (pdf: jsPDF, data: CourseReportData[], startY: number) => {
  const head = [['ID', 'Título', 'Docente', 'Inscritos', 'Precio', 'Modalidad', 'Inicio']];
  const body = data.map(c => [
    c.id,
    c.titulo,
    c.docente,
    c.inscritos,
    c.precio > 0 ? `S/. ${c.precio.toFixed(2)}` : 'Gratis',
    c.modalidad,
    new Date(c.fecha_inicio).toLocaleDateString('es-ES'),
  ]);

  autoTable(pdf, {
    startY,
    head,
    body,
    theme: 'grid',
    headStyles: { fillColor: '#2ecc71', textColor: '#ffffff' },
    styles: { fontSize: 8 },
  });
};

const addTeacherTable = (pdf: jsPDF, data: TeacherReportData[], startY: number) => {
  const head = [['ID', 'Nombre Completo', 'Email', 'Cursos Asignados', 'Estudiantes Totales', 'Registro']];
  const body = data.map(t => [
    t.id,
    `${t.nombre} ${t.apellido}`,
    t.correo,
    t.cursos_count,
    t.estudiantes_totales,
    new Date(t.fecha_registro).toLocaleDateString('es-ES'),
  ]);

  autoTable(pdf, {
    startY,
    head,
    body,
    theme: 'grid',
    headStyles: { fillColor: '#9b59b6', textColor: '#ffffff' },
    styles: { fontSize: 8 },
  });
};

const addGeneralSummary = (pdf: jsPDF, data: GeneralStats, startY: number) => {
  const summaryData = [
    ['Total de Usuarios', data.total_usuarios],
    ['Total de Cursos', data.total_cursos],
    ['Total de Inscripciones', data.total_inscripciones],
  ];

  autoTable(pdf, {
    startY,
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 3 },
  });

  const lastY = (pdf as any).lastAutoTable.finalY || startY + 30;

  // Cursos Populares
  if (data.cursos_populares && data.cursos_populares.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🏆 Cursos Más Populares', 15, lastY + 15);

    autoTable(pdf, {
      startY: lastY + 20,
      head: [['Curso', 'Inscritos']],
      body: data.cursos_populares.map(c => [c.titulo, c.inscritos]),
      theme: 'striped',
      headStyles: { fillColor: '#f39c12' },
    });
  }
};

export const reportGenerator = {
  async generate(reportType: ReportType, reportData: ReportData): Promise<Buffer> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    let yPos = 45;

    const titles = {
      students: 'Reporte de Estudiantes',
      courses: 'Reporte de Cursos',
      teachers: 'Reporte de Docentes',
      general: 'Reporte General de la Plataforma',
    };

    addHeader(pdf, titles[reportType], reportData.startDate, reportData.endDate);

    switch (reportType) {
      case 'students':
        if (reportData.students && reportData.students.length > 0) {
          addStudentTable(pdf, reportData.students, yPos);
        } else {
          pdf.text('No hay datos de estudiantes para mostrar en este periodo.', 15, yPos);
        }
        break;
      case 'courses':
        if (reportData.courses && reportData.courses.length > 0) {
          addCourseTable(pdf, reportData.courses, yPos);
        } else {
          pdf.text('No hay datos de cursos para mostrar en este periodo.', 15, yPos);
        }
        break;
      case 'teachers':
        if (reportData.teachers && reportData.teachers.length > 0) {
          addTeacherTable(pdf, reportData.teachers, yPos);
        } else {
          pdf.text('No hay datos de docentes para mostrar en este periodo.', 15, yPos);
        }
        break;
      case 'general':
        addGeneralSummary(pdf, reportData as GeneralStats, yPos);
        break;
    }

    // Añadir gráficos a todos los tipos de reportes si los datos existen
    if (reportData) {
      const lastY = (pdf as any).lastAutoTable?.finalY || yPos;
      await addChartsToPDF(pdf, reportData as GeneralStats, lastY + 10);
    }

    addFooter(pdf);

    // Devolver el PDF como un Buffer en lugar de guardarlo
    return Buffer.from(pdf.output('arraybuffer'));
  },
};