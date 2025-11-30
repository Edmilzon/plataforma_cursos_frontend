import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const pdfGeneratorText = {
  async generateReportPDF(data: any, reportType: string): Promise<boolean> {
    try {
      console.log('📄 Generando PDF con datos directos...');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;
      const margin = 15;
      const maxWidth = pageWidth - 2 * margin;

      // Header
      pdf.setFillColor(52, 152, 219);
      pdf.rect(0, 0, pageWidth, 25, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.text('Reporte - Plataforma Educativa', pageWidth / 2, 15, { align: 'center' });

      pdf.setTextColor(0, 0, 0);
      yPosition = 35;

      // Resumen General
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📊 Resumen General', margin, yPosition);
      yPosition += 10;

      // Datos del resumen
      const summaryData = [
        ['Total de Usuarios', data.total_usuarios?.toString() || '0'],
        ['Total de Cursos', data.total_cursos?.toString() || '0'],
        ['Total de Inscripciones', data.total_inscripciones?.toString() || '0'],
        ['Profesores', data.teachers_count?.toString() || '0']
      ];

      pdf.setFillColor(230, 240, 250);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');

      summaryData.forEach((row: string[], index: number) => {
        if (index > 0) {
          pdf.setFillColor(245, 245, 245);
        } else {
          pdf.setFillColor(230, 240, 250);
        }
        pdf.rect(margin, yPosition, maxWidth, 7, 'F');
        pdf.text(`${row[0]}:`, margin + 2, yPosition + 5);
        pdf.text(row[1], margin + maxWidth - 30, yPosition + 5);
        yPosition += 8;
      });

      yPosition += 5;

      // Contenido específico por tipo de reporte
      switch (reportType) {
        case 'students':
          this.addStudentReport(pdf, data, yPosition, margin, maxWidth, pageHeight);
          break;
        case 'courses':
          this.addCourseReport(pdf, data, yPosition, margin, maxWidth, pageHeight);
          break;
        case 'teachers':
          this.addTeacherReport(pdf, data, yPosition, margin, maxWidth, pageHeight);
          break;
        case 'general':
          this.addGeneralReport(pdf, data, yPosition, margin, maxWidth, pageHeight);
          break;
      }

      // Footer
      const totalPages = (pdf as any).internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Página ${i} de ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Guardar PDF
      const fileName = `reporte-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      console.log('✅ PDF generado correctamente');
      return true;

    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      alert('Error al generar el PDF. Intente nuevamente.');
      return false;
    }
  },

  addStudentReport(
    pdf: jsPDF,
    data: any,
    yPosition: number,
    margin: number,
    maxWidth: number,
    pageHeight: number
  ) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('👥 Reporte de Estudiantes', margin, yPosition);
    yPosition += 8;

    // Tabla de estudiantes
    const studentRows = data.students?.slice(0, 10).map((student: any) => [
      `${student.nombre} ${student.apellido}`,
      student.correo || '-',
      student.edad?.toString() || '-',
      student.saldo_punto?.toString() || '0',
      `${student.cursos_inscritos || 0} cursos`
    ]) || [];

    if (studentRows.length > 0) {
      (pdf as any).autoTable({
        head: [['Nombre', 'Email', 'Edad', 'Puntos', 'Cursos']],
        body: studentRows,
        startY: yPosition,
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [52, 152, 219], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
    }
  },

  addCourseReport(
    pdf: jsPDF,
    data: any,
    yPosition: number,
    margin: number,
    maxWidth: number,
    pageHeight: number
  ) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('📚 Reporte de Cursos', margin, yPosition);
    yPosition += 8;

    const courseRows = data.courses?.slice(0, 10).map((course: any) => [
      course.titulo,
      course.docente || '-',
      course.inscritos?.toString() || '0',
      `$${course.precio || 0}`,
      course.modalidad || '-'
    ]) || [];

    if (courseRows.length > 0) {
      (pdf as any).autoTable({
        head: [['Título', 'Docente', 'Inscritos', 'Precio', 'Modalidad']],
        body: courseRows,
        startY: yPosition,
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [46, 204, 113], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
    }
  },

  addTeacherReport(
    pdf: jsPDF,
    data: any,
    yPosition: number,
    margin: number,
    maxWidth: number,
    pageHeight: number
  ) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('👨‍🏫 Reporte de Docentes', margin, yPosition);
    yPosition += 8;

    const teacherRows = data.teachers?.slice(0, 10).map((teacher: any) => [
      `${teacher.nombre} ${teacher.apellido}`,
      teacher.correo || '-',
      teacher.cursos_count?.toString() || '0',
      teacher.estudiantes_totales?.toString() || '0'
    ]) || [];

    if (teacherRows.length > 0) {
      (pdf as any).autoTable({
        head: [['Nombre', 'Email', 'Cursos', 'Estudiantes']],
        body: teacherRows,
        startY: yPosition,
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [155, 89, 182], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
    }
  },

  addGeneralReport(
    pdf: jsPDF,
    data: any,
    yPosition: number,
    margin: number,
    maxWidth: number,
    pageHeight: number
  ) {
    // Cursos populares
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🏆 Cursos Más Populares', margin, yPosition);
    yPosition += 8;

    const popularRows = data.cursos_populares?.slice(0, 5).map((course: any) => [
      course.titulo,
      course.inscritos?.toString() || '0'
    ]) || [];

    if (popularRows.length > 0) {
      (pdf as any).autoTable({
        head: [['Curso', 'Inscritos']],
        body: popularRows,
        startY: yPosition,
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [241, 196, 15], textColor: 0 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 15;
    }

    // Usuarios activos
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('⭐ Usuarios Más Activos', margin, yPosition);
    yPosition += 8;

    const activeRows = data.usuarios_activos?.slice(0, 5).map((user: any) => [
      user.nombre,
      user.cursos_completados?.toString() || '0'
    ]) || [];

    if (activeRows.length > 0) {
      (pdf as any).autoTable({
        head: [['Usuario', 'Cursos Completados']],
        body: activeRows,
        startY: yPosition,
        margin: { left: margin, right: margin },
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [46, 204, 113], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });
    }
  }
};
