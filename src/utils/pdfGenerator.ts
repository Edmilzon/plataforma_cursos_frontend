// src/utils/pdfGenerator.ts - VERSIÓN SIN MÉTODO ALTERNATIVO
import jsPDF from 'jspdf';

export const pdfGenerator = {
  async generateReportPDF(element: HTMLElement, reportType: string): Promise<boolean> {
    try {
      console.log('🔄 Iniciando captura de PDF...');
      console.log('📏 Dimensiones del elemento:', {
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
        offsetHeight: element.offsetHeight
      });
      
      this.prepareElementForCapture(element);
      
      // Esperar a que el DOM se actualice
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowHeight: element.scrollHeight,
        windowWidth: element.scrollWidth,
        proxy: undefined,
        ignoreElements: (el: Element) => {
          return el.tagName === 'SCRIPT' || el.tagName === 'LINK' || el.tagName === 'STYLE';
        }
      });

      console.log('✅ Canvas creado:', {
        width: canvas.width,
        height: canvas.height,
        isEmpty: canvas.width === 0 || canvas.height === 0
      });
      
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas vacío - el elemento no se capturó correctamente');
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgHeight / imgWidth;
      
      let imgPDFWidth = pdfWidth - 20;
      let imgPDFHeight = imgPDFWidth * ratio;
      
      const needsMultiplePages = imgPDFHeight > pdfHeight - 20;
      
      console.log('📄 Configuración PDF:', {
        pdfWidth,
        pdfHeight,
        imgPDFWidth,
        imgPDFHeight,
        needsMultiplePages
      });
      
      if (needsMultiplePages) {
        this.addImageToMultiplePages(pdf, canvas, imgPDFWidth, imgPDFHeight);
      } else {
        const x = (pdfWidth - imgPDFWidth) / 2;
        const y = 10;
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', x, y, imgPDFWidth, imgPDFHeight);
      }
      
      // ⭐⭐ SOLO UN SAVE ⭐⭐
      const fileName = `reporte-${reportType}.pdf`;
      pdf.save(fileName);
      
      console.log('✅ PDF generado correctamente:', fileName);
      return true;
      
    } catch (error) {
      console.error('❌ Error en captura:', error);
      // ⭐⭐ NO MÁS MÉTODOS ALTERNATIVOS ⭐⭐
      alert('No se pudo generar el PDF. Intente nuevamente.');
      return false;
    }
  },

  prepareElementForCapture(element: HTMLElement) {
    const originalStyles = element.getAttribute('style');
    
    // Limpiar cualquier clase que pudiera ocultar el elemento
    element.style.cssText = `
      background: white !important;
      color: black !important;
      font-family: Arial, sans-serif !important;
      padding: 20px !important;
      margin: 0 !important;
      width: auto !important;
      min-width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      line-height: 1.5 !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      overflow: visible !important;
    `;
    
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      
      // Asegurar que TODO sea visible
      htmlEl.style.visibility = 'visible !important';
      htmlEl.style.opacity = '1 !important';
      htmlEl.style.display = htmlEl.style.display === 'none' ? 'block !important' : htmlEl.style.display;
      htmlEl.style.position = htmlEl.style.position === 'absolute' && htmlEl.style.display === 'none' ? 'static !important' : htmlEl.style.position;
      
      if (['P', 'DIV', 'SPAN'].includes(htmlEl.tagName)) {
        htmlEl.style.marginBottom = '8px !important';
        htmlEl.style.lineHeight = '1.5 !important';
        htmlEl.style.display = 'block !important';
      }
      
      if (['H1', 'H2', 'H3', 'H4'].includes(htmlEl.tagName)) {
        htmlEl.style.margin = '15px 0 10px 0 !important';
        htmlEl.style.padding = '0 !important';
        htmlEl.style.lineHeight = '1.3 !important';
        htmlEl.style.display = 'block !important';
      }
      
      if (htmlEl.tagName === 'TABLE') {
        htmlEl.style.borderSpacing = '0 !important';
        htmlEl.style.borderCollapse = 'collapse !important';
        htmlEl.style.margin = '15px 0 !important';
        htmlEl.style.width = '100% !important';
        htmlEl.style.display = 'table !important';
      }
      
      if (htmlEl.tagName === 'TR') {
        htmlEl.style.display = 'table-row !important';
      }
      
      if (htmlEl.tagName === 'TD' || htmlEl.tagName === 'TH') {
        htmlEl.style.padding = '8px !important';
        htmlEl.style.border = '1px solid #999 !important';
        htmlEl.style.lineHeight = '1.4 !important';
        htmlEl.style.display = 'table-cell !important';
      }
      
      if (htmlEl.tagName === 'CANVAS' || htmlEl.tagName === 'IMG') {
        htmlEl.style.display = 'block !important';
        htmlEl.style.margin = '15px auto !important';
        htmlEl.style.maxWidth = '100% !important';
        htmlEl.style.height = 'auto !important';
      }
      
      // Remover transforms y filters que pueden afectar la captura
      htmlEl.style.animation = 'none !important';
      htmlEl.style.transition = 'none !important';
      htmlEl.style.transform = 'none !important';
      htmlEl.style.filter = 'none !important';
      htmlEl.style.boxShadow = 'none !important';
    });
    
    console.log('✅ Elemento preparado para captura');
  },

  addImageToMultiplePages(pdf: jsPDF, canvas: HTMLCanvasElement, imgPDFWidth: number, imgPDFHeight: number) {
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    let currentHeight = 0;
    const pageHeight = pdfHeight - 20;
    
    while (currentHeight < imgPDFHeight) {
      if (currentHeight > 0) {
        pdf.addPage();
      }
      
      const heightThisPage = Math.min(pageHeight, imgPDFHeight - currentHeight);
      const x = (pdfWidth - imgPDFWidth) / 2;
      const y = 10;
      
      pdf.addImage(
        imgData, 
        'JPEG', 
        x, 
        y - currentHeight,
        imgPDFWidth, 
        imgPDFHeight
      );
      
      currentHeight += pageHeight;
    }
  }
};