import React from "react";
import cdpcLogo from "../assets/cdpc-logo.png";
import designHealthLogo from "../assets/design-health-logo.png";
import idanLogo from "../assets/idan-logo.png";
import {
  EMAIL_ICON_SVG,
  FACEBOOK_ICON_SVG,
  INSTAGRAM_ICON_SVG,
  PHONE_ICON_SVG,
} from "../pdf/footerIcons";
import type { FooterData } from "../types/invoice";
import "./InvoiceFooter.css";

interface InvoiceFooterProps {
  data: FooterData;
  onChange: <K extends keyof FooterData>(field: K, value: FooterData[K]) => void;
}

// Rendered from the same SVG source the PDF generator rasterizes, so the
// on-screen icons and the printed ones can't drift apart.
const Icon = ({ svg }: { svg: string }) => (
  <span className="footer-icon" dangerouslySetInnerHTML={{ __html: svg }} />
);

const InvoiceFooter: React.FC<InvoiceFooterProps> = ({ data, onChange }) => {
  return (
    <div className="invoice-footer">
      <div className="footer-contacts">
        <div className="footer-line">
          <Icon svg={PHONE_ICON_SVG} />
          <input
            type="text"
            className="footer-value"
            value={data.phone1}
            onChange={(e) => onChange("phone1", e.target.value)}
          />
          <span className="footer-sep">|</span>
          <input
            type="text"
            className="footer-value"
            value={data.phone2}
            onChange={(e) => onChange("phone2", e.target.value)}
          />
        </div>
        <div className="footer-line">
          <Icon svg={EMAIL_ICON_SVG} />
          <input
            type="text"
            className="footer-value"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </div>
      </div>

      <div className="footer-contacts">
        <div className="footer-line">
          <Icon svg={INSTAGRAM_ICON_SVG} />
          <input
            type="text"
            className="footer-value"
            value={data.instagram}
            onChange={(e) => onChange("instagram", e.target.value)}
          />
        </div>
        <div className="footer-line">
          <Icon svg={FACEBOOK_ICON_SVG} />
          <input
            type="text"
            className="footer-value"
            value={data.facebook}
            onChange={(e) => onChange("facebook", e.target.value)}
          />
        </div>
      </div>

      <div className="footer-logos">
        <img src={idanLogo} alt="Interior Designers Association of Nigeria" className="footer-logo-img" />
        <img src={designHealthLogo} alt="Design & Health" className="footer-logo-img" />
        <img src={cdpcLogo} alt="Certified Design Psychology Coach" className="footer-logo-img" />
      </div>
    </div>
  );
};

export default InvoiceFooter;
