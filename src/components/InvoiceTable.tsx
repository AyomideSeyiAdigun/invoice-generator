import React, { useState } from "react";
import './InvoiceTable.css';

interface RowItem {
  id: string;
  description: string;
  qty: string; // free text, e.g. "9", "3 ROLL", "SUM"
  unitRate: string; // stored as raw string
  timeline: string;
  isEditingRate?: boolean;
}

interface Section {
  id: string;
  title: string;
  timeline: string;
  rows: RowItem[];
}

interface InvoiceTableProps {
  isPrintable?: boolean;
}

let idCounter = 0;
const genId = () => `id-${Date.now()}-${idCounter++}`;

const newRow = (): RowItem => ({
  id: genId(),
  description: "",
  qty: "1",
  unitRate: "0",
  timeline: "",
  isEditingRate: false,
});

const newSection = (): Section => ({
  id: genId(),
  title: "NEW SECTION:",
  timeline: "",
  rows: [newRow()],
});

const InvoiceTable: React.FC<InvoiceTableProps> = ({ isPrintable }) => {
  const [sections, setSections] = useState<Section[]>([newSection()]);
  const [showTimeline, setShowTimeline] = useState<boolean>(true);

  // Format helper: ₦ with commas and decimals
  const formatToNaira = (value: string) => {
    if (!value) return "₦0.00";
    const num = parseFloat(value.replace(/,/g, ""));
    if (isNaN(num)) return "₦0.00";
    return `₦${num.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Leading number in a free-text qty (e.g. "3 ROLL" -> 3, "SUM" -> 1)
  const qtyMultiplier = (qty: string): number => {
    const match = qty.match(/[\d.]+/);
    if (!match) return 1;
    const n = parseFloat(match[0]);
    return isNaN(n) || n <= 0 ? 1 : n;
  };

  const rowTotal = (row: RowItem): number =>
    qtyMultiplier(row.qty) * (parseFloat(row.unitRate) || 0);

  const sectionSubtotal = (section: Section): number =>
    section.rows.reduce((sum, row) => sum + rowTotal(row), 0);

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
    field: "description" | "qty" | "unitRate" | "timeline" | "isEditingRate",
    value: string | boolean
  ) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          rows: s.rows.map((r) => {
            if (r.id !== rowId) return r;
            if (field === "unitRate") {
              const cleanValue = (value as string).replace(/,/g, "");
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
      {!isPrintable && (
        <div className="table-controls no-print">
          <label className="timeline-toggle">
            <input
              type="checkbox"
              checked={showTimeline}
              onChange={(e) => setShowTimeline(e.target.checked)}
            />
            Include Timeline column
          </label>
        </div>
      )}

      <table className="invoice-table boq-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Rate (₦)</th>
            <th>Total Rate (₦)</th>
            {showTimeline && <th>Timeline</th>}
            {!isPrintable && <th className="no-print">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <React.Fragment key={section.id}>
              <tr className="section-header-row">
                <td colSpan={dataColSpan} className="section-title-cell">
                  {!isPrintable ? (
                    <input
                      type="text"
                      className="section-title-input"
                      value={section.title}
                      onChange={(e) =>
                        updateSectionField(section.id, "title", e.target.value)
                      }
                    />
                  ) : (
                    <span className="section-title-text">{section.title}</span>
                  )}
                </td>
                {!isPrintable && (
                  <td className="no-print">
                    <button
                      className="remove-section-btn"
                      onClick={() => removeSection(section.id)}
                    >
                      Remove Section
                    </button>
                  </td>
                )}
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
                      value={row.isEditingRate ? row.unitRate : formatToNaira(row.unitRate)}
                      onFocus={() => updateRow(section.id, row.id, "isEditingRate", true)}
                      onBlur={() => updateRow(section.id, row.id, "isEditingRate", false)}
                      onChange={(e) =>
                        updateRow(section.id, row.id, "unitRate", e.target.value)
                      }
                    />
                  </td>

                  <td data-label="Total Rate">{formatToNaira(rowTotal(row).toString())}</td>

                  {showTimeline && (
                    <td data-label="Timeline">
                      {!isPrintable ? (
                        <input
                          type="text"
                          value={row.timeline}
                          onChange={(e) =>
                            updateRow(section.id, row.id, "timeline", e.target.value)
                          }
                        />
                      ) : (
                        row.timeline
                      )}
                    </td>
                  )}

                  {!isPrintable && (
                    <td className="no-print">
                      <button onClick={() => removeRow(section.id, row.id)}>-</button>
                    </td>
                  )}
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
                    {!isPrintable ? (
                      <input
                        type="text"
                        placeholder="e.g. 5 Days"
                        value={section.timeline}
                        onChange={(e) =>
                          updateSectionField(section.id, "timeline", e.target.value)
                        }
                      />
                    ) : (
                      section.timeline
                    )}
                  </td>
                )}
                {!isPrintable && (
                  <td className="no-print">
                    <button onClick={() => addRow(section.id)}>+ Row</button>
                  </td>
                )}
              </tr>
            </React.Fragment>
          ))}

          <tr className="grand-total-row">
            <td colSpan={3}>TOTAL</td>
            <td>{formatToNaira(grandTotal.toString())}</td>
            {showTimeline && <td></td>}
            {!isPrintable && <td className="no-print"></td>}
          </tr>
        </tbody>
      </table>

      {/* Add Section */}
      {!isPrintable && (
        <div className="invoice-actions">
          <button onClick={addSection}>+ Add Section</button>
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;
