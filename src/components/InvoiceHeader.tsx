import React from "react";
import pantoMark from "../assets/panto-mark.svg";
import type { HeaderData } from "../types/invoice";
import "./InvoiceHeader.css";

interface InvoiceHeaderProps {
  data: HeaderData;
  onChange: <K extends keyof HeaderData>(field: K, value: HeaderData[K]) => void;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ data, onChange }) => {
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
          <input
            type="date"
            value={data.date}
            onChange={(e) => onChange("date", e.target.value)}
          />
        </div>
      </div>

      <div className="boq-client-block">
        <div className="boq-client-row">
          <span className="boq-client-label">CLIENT:</span>
          <input
            type="text"
            className="boq-client-input"
            value={data.clientName}
            placeholder="Enter client name"
            onChange={(e) => onChange("clientName", e.target.value)}
          />
        </div>

        <input
          type="text"
          className="boq-project-input"
          value={data.projectType}
          placeholder="(e.g. Commercial - Office Project)"
          onChange={(e) => onChange("projectType", e.target.value)}
        />
      </div>

      <div className="boq-title-block">
        <input
          type="text"
          className="boq-title-input"
          value={data.documentTitle}
          onChange={(e) => onChange("documentTitle", e.target.value)}
        />
      </div>
    </div>
  );
};

export default InvoiceHeader;
