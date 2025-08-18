import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React, { useRef, useState } from "react";
import InvoiceHeader from "../components/InvoiceHeader";
import InvoiceTable from "../components/InvoiceTable";
import InvoiceTerms from "../components/InvoiceTerms";
import "./InvoicePage.css";
 

const InvoicePage: React.FC = () => {
     const [isPrintable, setIsPrintable] = useState<boolean>(false);
     

   
    const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    setIsPrintable(true);


      setTimeout(async () => {
          if (invoiceRef.current) {
      // hide controls before capture
      const buttons = invoiceRef.current.querySelectorAll(".no-print");
      buttons.forEach((btn) => (btn as HTMLElement).style.display = "none");

      const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("invoice.pdf");

      // restore controls
      buttons.forEach((btn) => (btn as HTMLElement).style.display = "block");

      setTimeout(() => {
           setIsPrintable(false);
      }, 1200);
    }
     }, 500);
  
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
      </div>
    </div>
  );
};

export default InvoicePage;
