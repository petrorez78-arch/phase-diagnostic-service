import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ExportData {
  company?: string;
  ticker?: string;
  phase?: string;
  indices?: {
    s?: number;
    vS?: number;
    aS?: number;
    iFund?: number;
    iMarketGap?: number;
    iStruct?: number;
    iVola?: number;
  };
  signals?: string[];
  aiInterpretation?: string;
  timestamp?: Date;
}

/**
 * Export diagnostic results to PDF
 */
export async function exportToPDF(data: ExportData, chartElements?: HTMLElement[]) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Title
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("Фазовая диагностика акций MOEX", margin, yPosition);
  yPosition += 10;

  // Company info
  if (data.company || data.ticker) {
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    const companyText = `${data.company || ""} (${data.ticker || ""})`;
    pdf.text(companyText, margin, yPosition);
    yPosition += 8;
  }

  // Timestamp
  if (data.timestamp) {
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(
      `Дата анализа: ${data.timestamp.toLocaleString("ru-RU")}`,
      margin,
      yPosition
    );
    yPosition += 10;
  }

  pdf.setTextColor(0);

  // Phase
  if (data.phase) {
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Фаза:", margin, yPosition);
    pdf.setFont("helvetica", "normal");
    pdf.text(data.phase, margin + 20, yPosition);
    yPosition += 8;
  }

  // Indices
  if (data.indices) {
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Индексы:", margin, yPosition);
    yPosition += 7;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const indices = [
      { label: "S-индекс:", value: data.indices.s },
      { label: "Скорость (vS):", value: data.indices.vS },
      { label: "Ускорение (aS):", value: data.indices.aS },
      { label: "IFund:", value: data.indices.iFund },
      { label: "IMarketGap:", value: data.indices.iMarketGap },
      { label: "IStruct:", value: data.indices.iStruct },
      { label: "IVola:", value: data.indices.iVola },
    ];

    indices.forEach((index) => {
      if (index.value !== undefined) {
        pdf.text(`${index.label} ${index.value}`, margin + 5, yPosition);
        yPosition += 5;
      }
    });

    yPosition += 5;
  }

  // Weak signals
  if (data.signals && data.signals.length > 0) {
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Слабые сигналы:", margin, yPosition);
    yPosition += 7;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    data.signals.forEach((signal) => {
      const lines = pdf.splitTextToSize(`• ${signal}`, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
    });

    yPosition += 5;
  }

  // Add charts as images
  if (chartElements && chartElements.length > 0) {
    for (const element of chartElements) {
      try {
        const canvas = await html2canvas(element, {
          backgroundColor: "#0f172a",
          scale: 2,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (yPosition + imgHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (error) {
        console.error("Failed to add chart to PDF:", error);
      }
    }
  }

  // AI interpretation
  if (data.aiInterpretation) {
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("AI-интерпретация:", margin, yPosition);
    yPosition += 7;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const lines = pdf.splitTextToSize(
      data.aiInterpretation,
      pageWidth - 2 * margin
    );

    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 5;
    });
  }

  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(
      `Страница ${i} из ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    pdf.text(
      "Создано с помощью Phase Diagnostic Service",
      pageWidth / 2,
      pageHeight - 5,
      { align: "center" }
    );
  }

  // Save PDF
  const filename = `phase-diagnostic-${data.ticker || "report"}-${Date.now()}.pdf`;
  pdf.save(filename);
}
