import React, { useState } from "react";
import './InvoiceTerm.css';

interface Term {
  title: string;
  text: string;
}
interface InvoiceTermsProps {
  isPrintable?: boolean;
}


const InvoiceTerms: React.FC<InvoiceTermsProps> = ({isPrintable}) => {
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

  const handleChange = (index: number, field: keyof Term, value: string) => {
    const updated = [...terms];
    updated[index][field] = value;
    setTerms(updated);
  };

  const addTerm = () => {
    setTerms([...terms, { title: "NEW TERM", text: "" }]);
  };

  const removeTerm = (index: number) => {
    if (terms.length === 1) return; // at least one must remain
    setTerms(terms.filter((_, i) => i !== index));
  };

  return (
    <div className="invoice-terms">
      { !isPrintable&& terms.map((term, index) => (
        <div key={index} className="term-block">
          <input
            type="text"
            className="term-title"
            value={term.title}
            onChange={(e) => handleChange(index, "title", e.target.value)}
          />
          <textarea
            className="term-text"
            rows={3}
            value={term.text}
            onChange={(e) => handleChange(index, "text", e.target.value)}
          />
          <button
            onClick={() => removeTerm(index)}
            className="remove-btn"
            disabled={terms.length === 1}
          >
            Remove
          </button>
        </div>
      ))}



       { isPrintable&& 
       terms.map((term, index) => (
        <div key={index} className="printable-terms">
                 <h5>{term.title}</h5>
 
              <div className="printable-text ">{term.text}</div>
        </div>
      ))}
     { !isPrintable&&<button onClick={addTerm} className="add-btn">
        + Add Term
      </button>}
    </div>
  );
};

export default InvoiceTerms;
