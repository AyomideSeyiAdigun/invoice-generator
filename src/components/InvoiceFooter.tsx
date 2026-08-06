import React, { useState } from "react";
import cdpcLogo from "../assets/cdpc-logo.png";
import designHealthLogo from "../assets/design-health-logo.png";
import idanLogo from "../assets/idan-logo.png";
import "./InvoiceFooter.css";

interface InvoiceFooterProps {
  isPrintable?: boolean;
}

// Icon size/fill are set as explicit SVG attributes (not just CSS) because
// html2canvas rasterizes inline <svg> elements by serializing the element
// itself; a size/color that only exists in an external stylesheet or via
// currentColor/CSS vars gets dropped, leaving the icon blank in the PDF.
const ICON_GOLD = "#D4AF37";

const PhoneIcon = () => (
  <svg className="footer-icon" width="14" height="14" viewBox="0 0 24 24" fill={ICON_GOLD}>
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="footer-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ICON_GOLD} strokeWidth="2">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="footer-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ICON_GOLD} strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill={ICON_GOLD} stroke="none" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="footer-icon" width="14" height="14" viewBox="0 0 24 24" fill={ICON_GOLD}>
    <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6C16.5 3.6 15.6 3.5 14.6 3.5c-2.4 0-4.1 1.5-4.1 4.1v2.3H7.8v3.1h2.7v8h3z" />
  </svg>
);

const InvoiceFooter: React.FC<InvoiceFooterProps> = ({ isPrintable }) => {
  const [phone1, setPhone1] = useState<string>("09093498637");
  const [phone2, setPhone2] = useState<string>("07068028522");
  const [email, setEmail] = useState<string>("pantoltd2@gmail.com");
  const [instagram, setInstagram] = useState<string>("@panto_interior");
  const [facebook, setFacebook] = useState<string>("/pantointerior");

  const editable = (
    value: string,
    onChange: (v: string) => void,
    className: string
  ) =>
    !isPrintable ? (
      <input
        type="text"
        className={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <span className={className}>{value}</span>
    );

  return (
    <div className="invoice-footer">
      <div className="footer-contacts">
        <div className="footer-line">
          <PhoneIcon />
          {editable(phone1, setPhone1, "footer-value")}
          <span className="footer-sep">|</span>
          {editable(phone2, setPhone2, "footer-value")}
        </div>
        <div className="footer-line">
          <EmailIcon />
          {editable(email, setEmail, "footer-value")}
        </div>
      </div>

      <div className="footer-contacts">
        <div className="footer-line">
          <InstagramIcon />
          {editable(instagram, setInstagram, "footer-value")}
        </div>
        <div className="footer-line">
          <FacebookIcon />
          {editable(facebook, setFacebook, "footer-value")}
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
