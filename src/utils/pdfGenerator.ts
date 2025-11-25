// utils/pdfGenerator.ts
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const pdfGenerator = {
  // Reporte de Estudiantes
  generateStudentsPDF(students: any[], title: string = 'Reporte de Estudiantes') {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text(title, 14, 22);
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Tabla de estudiantes
    const tableData = students.map(student => [
      student.nombre + ' ' + student.apellido,
      student.correo,
      student.edad,
      student.fecha_registro ? new Date(student.fecha_registro).toLocaleDateString() : 'N/A',
      student.cursos_inscritos || 0
    ]);

    (doc as any).autoTable({
      startY: 40,
      head: [['Nombre', 'Email', 'Edad', 'Fecha Registro', 'Cursos Inscritos']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    doc.save(`reporte-estudiantes-${new Date().toISOString().split('T')[0]}.pdf`);
  },

  // Reporte de Cursos
  generateCoursesPDF(courses: any[], title: string = 'Reporte de Cursos') {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(title, 14, 22);
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);
    
    const tableData = courses.map(course => [
      course.titulo,
      course.modalidad,
      course.fecha_inicio ? new Date(course.fecha_inicio).toLocaleDateString() : 'N/A',
      course.fecha_fin ? new Date(course.fecha_fin).toLocaleDateString() : 'N/A',
      course.inscritos || 0,
      course.estado || 'Activo'
    ]);

    (doc as any).autoTable({
      startY: 40,
      head: [['Curso', 'Modalidad', 'Inicio', 'Fin', 'Inscritos', 'Estado']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [39, 174, 96] }
    });

    doc.save(`reporte-cursos-${new Date().toISOString().split('T')[0]}.pdf`);
  },

  // Reporte de Profesores
  generateTeachersPDF(teachers: any[], title: string = 'Reporte de Profesores') {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text(title, 14, 22);
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);
    
    const tableData = teachers.map(teacher => [
      teacher.nombre + ' ' + teacher.apellido,
      teacher.correo,
      teacher.cursos_asignados || 0,
      teacher.estudiantes_totales || 0,
      teacher.fecha_registro ? new Date(teacher.fecha_registro).toLocaleDateString() : 'N/A'
    ]);

    (doc as any).autoTable({
      startY: 40,
      head: [['Nombre', 'Email', 'Cursos Asignados', 'Total Estudiantes', 'Fecha Registro']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [142, 68, 173] }
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
        doc.text(`${index + 1}. ${curso.titulo} - ${curso.inscritos} inscritos`, 20, yPosition);
        yPosition += 6;
      });
    }

    doc.save(`reporte-general-${new Date().toISOString().split('T')[0]}.pdf`);
  }
};
