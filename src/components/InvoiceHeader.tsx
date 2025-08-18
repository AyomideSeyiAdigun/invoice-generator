import React, { useEffect, useState } from "react";
import logo from "../assets/logo.jpeg";
import "./InvoiceHeader.css";

interface InvoiceTermsProps {
  isPrintable?: boolean;
}

const InvoiceHeader: React.FC<InvoiceTermsProps> = ({isPrintable}) => {
  const [invoiceNumber, setInvoiceNumber] = useState<number>(0);
  const [billTo, setBillTo] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [subtitle, setSubtitle] = useState<string>(
    "PANTO INTERIORS - FACILITY MANAGEMENT"
  );
  const [isEditingSubtitle, setIsEditingSubtitle] = useState<boolean>(false);

  useEffect(() => {
    setInvoiceNumber(Math.floor(Math.random() * 1000)); // random invoice number

    const today = new Date().toISOString().split("T")[0];
    setDate(today);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setDueDate(nextWeek.toISOString().split("T")[0]);
  }, []);

  return (
    <div className="invoice-box-2">
      {/* Header */}
      <div className="invoice-header">
        <div>
          <img src={logo} alt="Panto Interiors" className="invoice-logo" />

          {isEditingSubtitle ? (
            <input
              type="text"
              value={subtitle}
              className="invoice-subtitle-input"
              onChange={(e) => setSubtitle(e.target.value)}
              onBlur={() => setIsEditingSubtitle(false)}
              autoFocus
            />
          ) : (
            <h2
              className="invoice-subtitle"
              onClick={() => setIsEditingSubtitle(true)}
              title="Click to edit"
            >
              {subtitle}
            </h2>
          )}
        </div>

        <div className="invoice-title">
          <h1>INVOICE</h1>
          <p>#{invoiceNumber.toString().padStart(3, "0")}</p>
        </div>
      </div>

      {/* Bill To + Dates */}
      <div className="invoice-info">
        <div className="invoice-printable">
          <label>Bill To:</label>
          {!isPrintable ?<input
            type="text"
            value={billTo}
            placeholder="Enter client name"
            onChange={(e) => setBillTo(e.target.value)}
          />:<div className="billTo">{billTo}</div>}
        </div>

        <div className="invoice-dates">
          <div className="invoice-printable">
            <label>Date:</label>
            { !isPrintable ?<input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />:<div  className="datesText">{date}</div>}
          </div>
          <div className="invoice-printable">
            <label>Due Date:</label>
            {!isPrintable?<input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />:<div className="datesText">{dueDate}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;
