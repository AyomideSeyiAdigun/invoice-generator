import React, { useState } from "react";
import InvoiceFooter from "../components/InvoiceFooter";
import InvoiceHeader from "../components/InvoiceHeader";
import InvoiceTable from "../components/InvoiceTable";
import InvoiceTerms from "../components/InvoiceTerms";
import { generateInvoicePdf } from "../pdf/generateInvoicePdf";
import type { FooterData, HeaderData, Section, Term } from "../types/invoice";
import { newSection } from "../utils/invoiceCalc";
import "./InvoicePage.css";

const InvoicePage: React.FC = () => {
  const [header, setHeader] = useState<HeaderData>({
    clientName: "",
    projectType: "",
    date: new Date().toISOString().split("T")[0],
    documentTitle: "BILL OF QUANTITY- RENOVATION, FURNISHING AND DESIGN (INTERIOR)",
  });

  const [sections, setSections] = useState<Section[]>([newSection()]);
  const [showTimeline, setShowTimeline] = useState<boolean>(true);

  const [terms, setTerms] = useState<Term[]>([
    {
      title: "TERMS OF PAYMENT",
      text: "An advance payment of 90% is required to commence work on your project and 10% balance payment upon delivery, within 48 hours.",
    },
    {
      title: "BANK DETAILS",
      text: "Panto Interiors \n 13404588A \n Providus Bank",
    },
    {
      title: "CHARGE",
      text: "The sum of 50,000 naira is to be charged for any change in scope of work that earlier agreed by both parties.",
    },
    {
      title: "",
      text: "Thank you for understanding and trusting us with your facilities.",
    },
  ]);

  const [footer, setFooter] = useState<FooterData>({
    phone1: "09093498637",
    phone2: "07068028522",
    email: "pantoltd2@gmail.com",
    instagram: "@panto_interior",
    facebook: "/pantointerior",
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const updateHeader = <K extends keyof HeaderData>(field: K, value: HeaderData[K]) =>
    setHeader((prev) => ({ ...prev, [field]: value }));

  const updateFooter = <K extends keyof FooterData>(field: K, value: FooterData[K]) =>
    setFooter((prev) => ({ ...prev, [field]: value }));

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const doc = await generateInvoicePdf({ header, sections, showTimeline, terms, footer });
      doc.save("invoice.pdf");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="invoice-container">
      <div className="invoice-watermark">Panto Interiors</div>

      <div className="print-button no-print">
        <button className="pdf-button" onClick={handleDownload} disabled={isGenerating}>
          {isGenerating ? "Generating…" : "Download pdf"}
        </button>
      </div>

      <div className="my-invoice">
        <InvoiceHeader data={header} onChange={updateHeader} />

        <InvoiceTable
          sections={sections}
          setSections={setSections}
          showTimeline={showTimeline}
          setShowTimeline={setShowTimeline}
        />

        <InvoiceTerms terms={terms} setTerms={setTerms} />

        <InvoiceFooter data={footer} onChange={updateFooter} />
      </div>
    </div>
  );
};

export default InvoicePage;
