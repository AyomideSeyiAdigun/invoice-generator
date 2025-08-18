import React, { useState } from "react";
import './InvoiceTable.css';

interface InvoiceRow {
  item: string;
  quantity: number;
  rate: string; // stored as raw string
  amount: number;
  isEditingRate?: boolean; // flag to handle edit/display toggle
}

interface InvoiceTableProps {
  isPrintable?: boolean;
}


const InvoiceTable: React.FC<InvoiceTableProps> = ({isPrintable}) => {
  const [rows, setRows] = useState<InvoiceRow[]>([
    { item: "", quantity: 1, rate: "0", amount: 0, isEditingRate: false },
  ]);

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

  const handleChange = (index: number, field: keyof InvoiceRow, value: string) => {
    const updatedRows = [...rows];

    if (field === "quantity") {
      const qty = parseInt(value) || 0;
      updatedRows[index].quantity = qty;
      updatedRows[index].amount = qty * (parseFloat(updatedRows[index].rate) || 0);
    } else if (field === "rate") {
      const cleanValue = value.replace(/,/g, "");
      if (/^\d*\.?\d{0,2}$/.test(cleanValue)) {
        updatedRows[index].rate = cleanValue;
        updatedRows[index].amount =
          updatedRows[index].quantity * (parseFloat(cleanValue) || 0);
      }
    } else if (field === "item") {
      updatedRows[index].item = value;
    }

    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      { item: "", quantity: 1, rate: "0", amount: 0, isEditingRate: false },
    ]);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);
  
  return (
    
    <div className="invoice-table-wrapper">
         <div className="total-amount">
        <h4>Payment Due:</h4>
        <div className="total-text">{formatToNaira(totalAmount.toString())}</div>
      </div>
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Rate (₦)</th>
            <th>Amount (₦)</th>
            {!isPrintable && <th className="no-print">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {/* Item */}
              <td data-label="Item">
                <input
                  type="text"
                  value={row.item}
                  onChange={(e) => handleChange(index, "item", e.target.value)}
                />
              </td>

              {/* Quantity */}
              <td data-label="Qty">
                <input
                  type="number"
                  value={row.quantity}
                  min="1"
                  onChange={(e) => handleChange(index, "quantity", e.target.value)}
                />
              </td>

              {/* Rate */}
              <td data-label="Rate">
                <input
                  type="text"
                  value={row.isEditingRate ? row.rate : formatToNaira(row.rate)}
                  onFocus={() => {
                    const updatedRows = [...rows];
                    updatedRows[index].isEditingRate = true;
                    setRows(updatedRows);
                  }}
                  onBlur={() => {
                    const updatedRows = [...rows];
                    updatedRows[index].isEditingRate = false;
                    setRows(updatedRows);
                  }}
                  onChange={(e) => handleChange(index, "rate", e.target.value)}
                />
              </td>

              {/* Amount */}
              <td data-label="Amount">{formatToNaira(row.amount.toString())}</td>

              {/* Remove button */}
               {!isPrintable && 
              <td>
                <button onClick={() => removeRow(index)}>-</button>
              </td>
               }
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Row */}
        {!isPrintable && 
      <div className="invoice-actions">
        <button onClick={addRow}>+ Add Row</button>
      </div>
       }

       
     
    </div>
  );
};

export default InvoiceTable;
