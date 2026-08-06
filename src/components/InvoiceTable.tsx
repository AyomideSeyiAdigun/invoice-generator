import React from "react";
import type { Section } from "../types/invoice";
import { formatToNaira, newRow, newSection, rowTotal, sectionSubtotal } from "../utils/invoiceCalc";
import './InvoiceTable.css';

interface InvoiceTableProps {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  showTimeline: boolean;
  setShowTimeline: (value: boolean) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  sections,
  setSections,
  showTimeline,
  setShowTimeline,
}) => {
  const grandTotal = sections.reduce((sum, s) => sum + sectionSubtotal(s), 0);

  const updateSectionField = (
    sectionId: string,
    field: "title" | "timeline",
    value: string
  ) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, [field]: value } : s))
    );
  };

  const addSection = () => {
    setSections((prev) => [...prev, newSection()]);
  };

  const removeSection = (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };

  const addRow = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, rows: [...s.rows, newRow()] } : s
      )
    );
  };

  const removeRow = (sectionId: string, rowId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, rows: s.rows.filter((r) => r.id !== rowId) }
          : s
      )
    );
  };

  const updateRow = (
    sectionId: string,
    rowId: string,
    field: "description" | "qty" | "unitRate" | "timeline",
    value: string
  ) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          rows: s.rows.map((r) => {
            if (r.id !== rowId) return r;
            if (field === "unitRate") {
              const cleanValue = value.replace(/,/g, "");
              if (!/^\d*\.?\d{0,2}$/.test(cleanValue)) return r;
              return { ...r, unitRate: cleanValue };
            }
            return { ...r, [field]: value };
          }),
        };
      })
    );
  };

  // Description, Qty, Unit Rate, Total Rate, + Timeline when shown
  const dataColSpan = showTimeline ? 5 : 4;

  return (
    <div className="invoice-table-wrapper">
      <div className="table-controls">
        <label className="timeline-toggle">
          <input
            type="checkbox"
            checked={showTimeline}
            onChange={(e) => setShowTimeline(e.target.checked)}
          />
          Include Timeline column
        </label>
      </div>

      <table className="invoice-table boq-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Rate (₦)</th>
            <th>Total Rate (₦)</th>
            {showTimeline && <th>Timeline</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <React.Fragment key={section.id}>
              <tr className="section-header-row">
                <td colSpan={dataColSpan} className="section-title-cell">
                  <input
                    type="text"
                    className="section-title-input"
                    value={section.title}
                    onChange={(e) =>
                      updateSectionField(section.id, "title", e.target.value)
                    }
                  />
                </td>
                <td>
                  <button
                    className="remove-section-btn"
                    onClick={() => removeSection(section.id)}
                  >
                    Remove Section
                  </button>
                </td>
              </tr>

              {section.rows.map((row) => (
                <tr key={row.id} className="item-row">
                  <td data-label="Description">
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) =>
                        updateRow(section.id, row.id, "description", e.target.value)
                      }
                    />
                  </td>

                  <td data-label="Qty">
                    <input
                      type="text"
                      value={row.qty}
                      onChange={(e) =>
                        updateRow(section.id, row.id, "qty", e.target.value)
                      }
                    />
                  </td>

                  <td data-label="Unit Rate">
                    <input
                      type="text"
                      value={row.unitRate}
                      onChange={(e) =>
                        updateRow(section.id, row.id, "unitRate", e.target.value)
                      }
                    />
                  </td>

                  <td data-label="Total Rate">{formatToNaira(rowTotal(row).toString())}</td>

                  {showTimeline && (
                    <td data-label="Timeline">
                      <input
                        type="text"
                        value={row.timeline}
                        onChange={(e) =>
                          updateRow(section.id, row.id, "timeline", e.target.value)
                        }
                      />
                    </td>
                  )}

                  <td>
                    <button onClick={() => removeRow(section.id, row.id)}>-</button>
                  </td>
                </tr>
              ))}

              <tr className="section-subtotal-row">
                <td colSpan={3} className="subtotal-label-cell">
                  Subtotal
                </td>
                <td className="subtotal-amount-cell">
                  {formatToNaira(sectionSubtotal(section).toString())}
                </td>
                {showTimeline && (
                  <td className="subtotal-timeline-cell">
                    <input
                      type="text"
                      placeholder="e.g. 5 Days"
                      value={section.timeline}
                      onChange={(e) =>
                        updateSectionField(section.id, "timeline", e.target.value)
                      }
                    />
                  </td>
                )}
                <td>
                  <button onClick={() => addRow(section.id)}>+ Row</button>
                </td>
              </tr>
            </React.Fragment>
          ))}

          <tr className="grand-total-row">
            <td colSpan={3}>TOTAL</td>
            <td>{formatToNaira(grandTotal.toString())}</td>
            {showTimeline && <td></td>}
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* Add Section */}
      <div className="invoice-actions">
        <button onClick={addSection}>+ Add Section</button>
      </div>
    </div>
  );
};

export default InvoiceTable;
