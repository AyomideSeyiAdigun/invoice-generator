import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React, { useRef, useState } from "react";
import InvoiceFooter from "../components/InvoiceFooter";
import InvoiceHeader from "../components/InvoiceHeader";
import InvoiceTable from "../components/InvoiceTable";
import InvoiceTerms from "../components/InvoiceTerms";
import "./InvoicePage.css";

// Wait for the next two paints so React has actually committed & painted
// the printable layout before we hand the DOM to html2canvas.
const waitForPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

// Logos/badges load asynchronously; html2canvas snapshots whatever is in
// the DOM at call time, so an unloaded <img> renders as blank in the PDF.
const waitForImages = (container: HTMLElement) => {
  const images = Array.from(container.querySelectorAll("img"));
  return Promise.all(
    images.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          })
    )
  );
};

const InvoicePage: React.FC = () => {
  const [isPrintable, setIsPrintable] = useState<boolean>(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    setIsPrintable(true);
    await waitForPaint();

    if (!invoiceRef.current) return;
    const node = invoiceRef.current;

    // Hide controls
    const buttons = node.querySelectorAll(".no-print");
    buttons.forEach((btn) => ((btn as HTMLElement).style.display = "none"));

    await waitForImages(node);

    // Render invoice to canvas
    const canvas = await html2canvas(node, { scale: 1.5, useCORS: true });
    const imgData = canvas.toDataURL("image/jpeg", 0.7);

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const topMargin = 0; // px
    const bottomMargin = 0; // mm (≈ 2rem)
    const usableHeight = pdfHeight - bottomMargin;

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page with margin
    pdf.addImage(imgData, "JPEG", 0, position + topMargin, imgWidth, imgHeight);
    heightLeft -= usableHeight;

    // Additional pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + topMargin;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= usableHeight;
    }

    pdf.save("invoice.pdf");

    // Restore controls
    buttons.forEach((btn) => ((btn as HTMLElement).style.display = "block"));
    setIsPrintable(false);
  };
  return (
    <div className="invoice-container">
      <div className="invoice-watermark">Panto Interiors</div>

        <div className="print-button no-print"><button className="pdf-button" onClick={handleDownload}>Download pdf</button></div>

      <div className="my-invoice" ref={invoiceRef}>
        {/* Header */}
           <InvoiceHeader  isPrintable={isPrintable}/>

        {/* Dynamic Table */}
        <InvoiceTable isPrintable={isPrintable} />

        {/* Terms */}
        <InvoiceTerms isPrintable={isPrintable}  />

        {/* Footer */}
        <InvoiceFooter isPrintable={isPrintable} />
      </div>
    </div>
  );
};

export default InvoicePage;
