import React, { useEffect, useState } from "react";
import pantoMark from "../assets/panto-mark.svg";
import "./InvoiceHeader.css";

interface InvoiceHeaderProps {
  isPrintable?: boolean;
}

const formatDate = (isoDate: string) => {
  if (!isoDate) return "";
  const d = new Date(`${isoDate}T00:00:00`);
  if (isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })
    .toUpperCase();
};

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ isPrintable }) => {
  const [clientName, setClientName] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [documentTitle, setDocumentTitle] = useState<string>(
    "BILL OF QUANTITY- RENOVATION, FURNISHING AND DESIGN (INTERIOR)"
  );

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  return (
    <div className="boq-header">
      <img src={pantoMark} alt="" className="boq-brand-accent" />

      <div className="boq-header-top">
        <div className="boq-logo-lockup">
          <img src={pantoMark} alt="Panto Interiors" className="boq-logo-mark" />
          <div className="boq-logo-text">
            <span className="boq-logo-panto">panto</span>
            <span className="boq-logo-interiors">INTERIORS</span>
          </div>
        </div>

        <div className="boq-date-block">
          {!isPrintable ? (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          ) : (
            <div className="boq-date-text">{formatDate(date)}</div>
          )}
        </div>
      </div>

      <div className="boq-client-block">
        <div className="boq-client-row">
          <span className="boq-client-label">CLIENT:</span>
          {!isPrintable ? (
            <input
              type="text"
              className="boq-client-input"
              value={clientName}
              placeholder="Enter client name"
              onChange={(e) => setClientName(e.target.value)}
            />
          ) : (
            <span className="boq-client-value">{clientName}</span>
          )}
        </div>

        {!isPrintable ? (
          <input
            type="text"
            className="boq-project-input"
            value={projectType}
            placeholder="(e.g. Commercial - Office Project)"
            onChange={(e) => setProjectType(e.target.value)}
          />
        ) : (
          projectType && <div className="boq-project-value">({projectType})</div>
        )}
      </div>

      <div className="boq-title-block">
        {!isPrintable ? (
          <input
            type="text"
            className="boq-title-input"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
          />
        ) : (
          <h2 className="boq-doc-title">{documentTitle}</h2>
        )}
      </div>
    </div>
  );
};

export default InvoiceHeader;
