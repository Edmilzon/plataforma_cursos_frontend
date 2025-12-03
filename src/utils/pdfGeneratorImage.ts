import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const pdfGeneratorImage = {
  async generateReportPDF(element: HTMLElement | null, reportType: string): Promise<boolean> {
    try {
      console.log('📸 Capturando vista previa como imagen...');

      if (!element) {
        console.error('No se encontró el elemento para capturar');
        alert('Error: No se pudo encontrar el contenido del reporte');
        return false;
      }

      // Preparar elemento para captura
      const originalDisplay = element.style.display;
      const originalVisibility = element.style.visibility;
      const originalPadding = element.style.padding;
      const originalMargin = element.style.margin;
      const originalMaxHeight = element.style.maxHeight;
      const originalOverflow = element.style.overflow;
      
      element.style.display = 'block';
      element.style.visibility = 'visible';
      element.style.padding = '0px';
      element.style.margin = '0px';
      element.style.maxHeight = 'none';
      element.style.overflow = 'visible';

      // Capturar como imagen con escala pequeña para evitar problemas
      console.log('Capturando elemento...');
      const canvas = await html2canvas(element, {
        scale: 0.7,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 900,
      });

      // Restaurar estilos
      element.style.display = originalDisplay;
      element.style.visibility = originalVisibility;
      element.style.padding = originalPadding;
      element.style.margin = originalMargin;
      element.style.maxHeight = originalMaxHeight;
      element.style.overflow = originalOverflow;

      console.log('Captura completada. Creando PDF...');

      // Crear PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Márgenes
      const marginTop = 10;
      const marginLeft = 10;
      const marginBottom = 10;
      
      // Ancho disponible para la imagen
      const imgWidth = pageWidth - marginLeft - 10;
      const maxImgHeight = pageHeight - marginTop - marginBottom;

      // Calcular altura manteniendo proporción
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let currentYPos = 0;
      const totalImgHeight = imgHeight;
      let pageNum = 0;

      // Dividir en páginas
      while (currentYPos < totalImgHeight) {
        if (pageNum > 0) {
          pdf.addPage();
        }

        const heightToPrint = Math.min(maxImgHeight, totalImgHeight - currentYPos);
        
        // Calcular proporción en píxeles del canvas
        const canvasHeightToCopy = (heightToPrint * canvas.width) / imgWidth;
        const canvasYStart = (currentYPos * canvas.width) / imgWidth;

        // Crear canvas temporal con la porción
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = Math.ceil(canvasHeightToCopy);

        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.fillStyle = '#ffffff';
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          tempCtx.drawImage(
            canvas,
            0, Math.floor(canvasYStart),
            canvas.width, Math.ceil(canvasHeightToCopy),
            0, 0,
            canvas.width, Math.ceil(canvasHeightToCopy)
          );

          const imgData = tempCanvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', marginLeft, marginTop, imgWidth, heightToPrint);
        }

        currentYPos += heightToPrint;
        pageNum++;
      }

      // Guardar PDF
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `reporte-${reportType}-${timestamp}.pdf`;
      pdf.save(fileName);

      console.log(`✅ PDF generado: ${fileName} (${pageNum} páginas)`);
      return true;

    } catch (error) {
      console.error('❌ Error en generación de PDF:', error);
      alert('Error al generar el PDF. Por favor intenta nuevamente.');
      return false;
    }
  }
};
