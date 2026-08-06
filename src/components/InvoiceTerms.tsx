import React from "react";
import type { Term } from "../types/invoice";
import './InvoiceTerm.css';

interface InvoiceTermsProps {
  terms: Term[];
  setTerms: React.Dispatch<React.SetStateAction<Term[]>>;
}

const InvoiceTerms: React.FC<InvoiceTermsProps> = ({ terms, setTerms }) => {
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
      {terms.map((term, index) => (
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

      <button onClick={addTerm} className="add-btn">
        + Add Term
      </button>
    </div>
  );
};

export default InvoiceTerms;
