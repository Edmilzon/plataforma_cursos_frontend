import jsPDF from 'jspdf';

export const pdfGeneratorSimple = {
  async generateReportPDF(data: any, reportType: string): Promise<boolean> {
    try {
      console.log('📄 Iniciando generación de PDF simple...');
      console.log('Datos recibidos:', { reportType, dataKeys: Object.keys(data || {}) });

      if (!data) {
        console.error('No hay datos para generar el PDF');
        alert('Error: No hay datos para generar el reporte');
        return false;
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPos = 15;
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;

      // ========== HEADER ==========
      pdf.setFillColor(41, 128, 185);
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('REPORTE - PLATAFORMA EDUCATIVA', pageWidth / 2, 20, { align: 'center' });

      // ========== RESUMEN GENERAL ==========
      yPos = 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESUMEN GENERAL', margin, yPos);
      
      yPos += 12;
      
      // Cuadrícula de estadísticas
      const stats = [
        { label: 'Total Usuarios', value: data.total_usuarios || 0 },
        { label: 'Total Cursos', value: data.total_cursos || 0 },
        { label: 'Inscripciones', value: data.total_inscripciones || 0 },
        { label: 'Profesores', value: data.teachers_count || 0 }
      ];

      const statsPerRow = 2;
      const boxWidth = (contentWidth - 10) / statsPerRow;
      const boxHeight = 20;
      
      stats.forEach((stat, index) => {
        const row = Math.floor(index / statsPerRow);
        const col = index % statsPerRow;
        const xPos = margin + col * (boxWidth + 5);
        const statYPos = yPos + row * (boxHeight + 5);

        // Caja de estadística
        pdf.setFillColor(230, 240, 250);
        pdf.rect(xPos, statYPos, boxWidth, boxHeight, 'F');
        pdf.setDrawColor(100, 150, 200);
        pdf.rect(xPos, statYPos, boxWidth, boxHeight);

        // Valor
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.setTextColor(41, 128, 185);
        pdf.text(stat.value.toString(), xPos + boxWidth / 2, statYPos + 10, { align: 'center' });

        // Etiqueta
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(80, 80, 80);
        pdf.text(stat.label, xPos + boxWidth / 2, statYPos + 16, { align: 'center' });
      });

      yPos += 50;

      // ========== CONTENIDO POR TIPO ==========
      pdf.setTextColor(0, 0, 0);

      switch (reportType) {
        case 'students':
          this.addStudentSection(pdf, data, yPos, margin, contentWidth);
          break;
        case 'courses':
          this.addCourseSection(pdf, data, yPos, margin, contentWidth);
          break;
        case 'teachers':
          this.addTeacherSection(pdf, data, yPos, margin, contentWidth);
          break;
        case 'general':
          this.addGeneralSection(pdf, data, yPos, margin, contentWidth);
          break;
      }

      // ========== GUARDAR PDF ==========
      const fileName = `reporte-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('✅ PDF guardado correctamente:', fileName);
      return true;

    } catch (error) {
      console.error('❌ Error grave en generación de PDF:', error);
      alert('Error al generar el PDF. Por favor intenta nuevamente.');
      return false;
    }
  },

  addStudentSection(pdf: jsPDF, data: any, startY: number, margin: number, contentWidth: number) {
    let yPos = startY;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ESTUDIANTES REGISTRADOS', margin, yPos);
    yPos += 8;

    const students = data.students || [];
    if (students.length === 0) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('No hay estudiantes registrados', margin, yPos);
      return;
    }

    // Tabla simple de estudiantes
    const tableData = students.slice(0, 8).map((student: any) => [
      `${student.nombre || ''} ${student.apellido || ''}`,
      student.correo || '-',
      student.edad?.toString() || '-',
      student.saldo_punto?.toString() || '0'
    ]);

    this.drawSimpleTable(pdf, 
      ['Nombre', 'Email', 'Edad', 'Puntos'],
      tableData,
      yPos,
      margin,
      contentWidth
    );
  },

  addCourseSection(pdf: jsPDF, data: any, startY: number, margin: number, contentWidth: number) {
    let yPos = startY;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CURSOS ACTIVOS', margin, yPos);
    yPos += 8;

    const courses = data.courses || [];
    if (courses.length === 0) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('No hay cursos registrados', margin, yPos);
      return;
    }

    const tableData = courses.slice(0, 8).map((course: any) => [
      course.titulo || '-',
      course.docente || '-',
      course.inscritos?.toString() || '0',
      `$${course.precio || 0}`
    ]);

    this.drawSimpleTable(pdf,
      ['Curso', 'Docente', 'Inscritos', 'Precio'],
      tableData,
      yPos,
      margin,
      contentWidth
    );
  },

  addTeacherSection(pdf: jsPDF, data: any, startY: number, margin: number, contentWidth: number) {
    let yPos = startY;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PROFESORES REGISTRADOS', margin, yPos);
    yPos += 8;

    const teachers = data.teachers || [];
    if (teachers.length === 0) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('No hay profesores registrados', margin, yPos);
      return;
    }

    const tableData = teachers.slice(0, 8).map((teacher: any) => [
      `${teacher.nombre || ''} ${teacher.apellido || ''}`,
      teacher.correo || '-',
      teacher.cursos_count?.toString() || '0',
      teacher.estudiantes_totales?.toString() || '0'
    ]);

    this.drawSimpleTable(pdf,
      ['Nombre', 'Email', 'Cursos', 'Estudiantes'],
      tableData,
      yPos,
      margin,
      contentWidth
    );
  },

  addGeneralSection(pdf: jsPDF, data: any, startY: number, margin: number, contentWidth: number) {
    let yPos = startY;

    // Cursos populares
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CURSOS MÁS POPULARES', margin, yPos);
    yPos += 8;

    const popularCourses = data.cursos_populares || [];
    if (popularCourses.length > 0) {
      const tableData = popularCourses.slice(0, 5).map((course: any) => [
        course.titulo || '-',
        course.inscritos?.toString() || '0'
      ]);
      
      this.drawSimpleTable(pdf,
        ['Curso', 'Inscritos'],
        tableData,
        yPos,
        margin,
        contentWidth
      );
      
      yPos += 60;
    }

    // Usuarios más activos
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('USUARIOS MÁS ACTIVOS', margin, yPos);
    yPos += 8;

    const activeUsers = data.usuarios_activos || [];
    if (activeUsers.length > 0) {
      const tableData = activeUsers.slice(0, 5).map((user: any) => [
        user.nombre || '-',
        user.cursos_completados?.toString() || '0'
      ]);

      this.drawSimpleTable(pdf,
        ['Usuario', 'Cursos Completados'],
        tableData,
        yPos,
        margin,
        contentWidth
      );
    }
  },

  drawSimpleTable(
    pdf: jsPDF,
    headers: string[],
    data: string[][],
    startY: number,
    margin: number,
    contentWidth: number
  ) {
    const cellHeight = 6;
    const colWidths = headers.map(() => contentWidth / headers.length);
    let currentY = startY;

    // Header
    pdf.setFillColor(41, 128, 185);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);

    headers.forEach((header, i) => {
      const xPos = margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      pdf.rect(xPos, currentY, colWidths[i], cellHeight, 'F');
      pdf.text(header, xPos + 1, currentY + 4);
    });

    currentY += cellHeight;

    // Datos
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    let rowCount = 0;

    data.forEach((row) => {
      // Alternancia de colores
      if (rowCount % 2 === 0) {
        pdf.setFillColor(240, 245, 250);
      } else {
        pdf.setFillColor(255, 255, 255);
      }

      row.forEach((cell, i) => {
        const xPos = margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        pdf.rect(xPos, currentY, colWidths[i], cellHeight, 'F');
        pdf.rect(xPos, currentY, colWidths[i], cellHeight);
        pdf.setFontSize(8);
        pdf.text(cell.substring(0, 20), xPos + 1, currentY + 4);
      });

      currentY += cellHeight;
      rowCount++;

      // Salto de página si es necesario
      if (currentY > 270) {
        pdf.addPage();
        currentY = 20;
      }
    });
  }
};
