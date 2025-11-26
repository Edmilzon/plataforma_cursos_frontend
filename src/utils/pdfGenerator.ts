// utils/pdfGenerator.ts - VERSIÓN CORREGIDA
import jsPDF from 'jspdf';

export const pdfGenerator = {
  // Reporte de Estudiantes - Sin autoTable
  generateStudentsPDF(students: any[], title: string = 'Reporte de Estudiantes') {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 20, 30);
    
    let yPosition = 50;
    
    // Encabezados de tabla
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Nombre', 20, yPosition);
    doc.text('Email', 80, yPosition);
    doc.text('Edad', 140, yPosition);
    doc.text('Fecha Registro', 160, yPosition);
    
    yPosition += 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    // Datos de estudiantes
    students.forEach((student, index) => {
      if (yPosition > 270) { // Nueva página si se llena
        doc.addPage();
        yPosition = 20;
      }
      
      // Manejar campos undefined de forma segura
      const nombreCompleto = `${student.nombre || ''} ${student.apellido || ''}`.trim();
      const email = student.correo || 'N/A';
      const edad = student.edad ? student.edad.toString() : 'N/A';
      const fechaRegistro = student.fecha_registro 
        ? new Date(student.fecha_registro).toLocaleDateString() 
        : 'N/A';
      
      doc.text(nombreCompleto, 20, yPosition);
      doc.text(email, 80, yPosition);
      doc.text(edad, 140, yPosition);
      doc.text(fechaRegistro, 160, yPosition);
      
      yPosition += 8;
    });

    doc.save(`reporte-estudiantes-${new Date().toISOString().split('T')[0]}.pdf`);
  },

  // Reporte de Cursos - Sin autoTable
  generateCoursesPDF(courses: any[], title: string = 'Reporte de Cursos') {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 20, 30);
    
    let yPosition = 50;
    
    // Encabezados
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Curso', 20, yPosition);
    doc.text('Modalidad', 80, yPosition);
    doc.text('Inscritos', 120, yPosition);
    doc.text('Estado', 140, yPosition);
    
    yPosition += 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    // Datos de cursos
    courses.forEach((course, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Manejar campos undefined de forma segura
      const titulo = course.titulo || 'Sin título';
      const modalidad = course.modalidad || 'N/A';
      const inscritos = (course.inscritos || 0).toString();
      const estado = course.estado || 'Activo';
      
      doc.text(titulo, 20, yPosition);
      doc.text(modalidad, 80, yPosition);
      doc.text(inscritos, 120, yPosition);
      doc.text(estado, 140, yPosition);
      
      yPosition += 8;
    });

    doc.save(`reporte-cursos-${new Date().toISOString().split('T')[0]}.pdf`);
  },

  // Reporte de Profesores - Sin autoTable
  generateTeachersPDF(teachers: any[], title: string = 'Reporte de Profesores') {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(title, 20, 20);
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 20, 30);
    
    let yPosition = 50;
    
    // Encabezados
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Nombre', 20, yPosition);
    doc.text('Email', 80, yPosition);
    doc.text('Fecha Registro', 140, yPosition);
    
    yPosition += 10;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    // Datos de profesores
    teachers.forEach((teacher, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Manejar campos undefined de forma segura
      const nombreCompleto = `${teacher.nombre || ''} ${teacher.apellido || ''}`.trim();
      const email = teacher.correo || 'N/A';
      const fechaRegistro = teacher.fecha_registro 
        ? new Date(teacher.fecha_registro).toLocaleDateString() 
        : 'N/A';
      
      doc.text(nombreCompleto, 20, yPosition);
      doc.text(email, 80, yPosition);
      doc.text(fechaRegistro, 140, yPosition);
      
      yPosition += 8;
    });

    doc.save(`reporte-profesores-${new Date().toISOString().split('T')[0]}.pdf`);
  },

  // Reporte General
  generateGeneralReport(stats: any, title: string = 'Reporte General de la Plataforma') {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(title, 14, 22);
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);
    
    let yPosition = 50;
    
    // Estadísticas generales
    doc.setFontSize(16);
    doc.text('Estadísticas Generales', 14, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text(`• Total de Usuarios: ${stats.total_usuarios || 0}`, 20, yPosition);
    yPosition += 7;
    doc.text(`• Total de Cursos: ${stats.total_cursos || 0}`, 20, yPosition);
    yPosition += 7;
    doc.text(`• Total de Inscripciones: ${stats.total_inscripciones || 0}`, 20, yPosition);
    yPosition += 15;

    // Cursos populares
    if (stats.cursos_populares && stats.cursos_populares.length > 0) {
      doc.setFontSize(14);
      doc.text('Cursos Más Populares', 14, yPosition);
      yPosition += 10;
      
      stats.cursos_populares.forEach((curso: any, index: number) => {
        doc.setFontSize(10);
        const titulo = curso.titulo || 'Curso sin título';
        const inscritos = curso.inscritos || 0;
        doc.text(`${index + 1}. ${titulo} - ${inscritos} inscritos`, 20, yPosition);
        yPosition += 6;
      });
    }

    doc.save(`reporte-general-${new Date().toISOString().split('T')[0]}.pdf`);
  }
};