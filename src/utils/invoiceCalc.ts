import type { RowItem, Section } from "../types/invoice";

let idCounter = 0;
export const genId = () => `id-${Date.now()}-${idCounter++}`;

export const newRow = (): RowItem => ({
  id: genId(),
  description: "",
  qty: "1",
  unitRate: "0",
  timeline: "",
});

export const newSection = (): Section => ({
  id: genId(),
  title: "NEW SECTION:",
  timeline: "",
  rows: [newRow()],
});

// Format helper: ₦ with commas and decimals
export const formatToNaira = (value: string) => {
  if (!value) return "₦0.00";
  const num = parseFloat(value.replace(/,/g, ""));
  if (isNaN(num)) return "₦0.00";
  return `₦${num.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// jsPDF's built-in Helvetica font only supports the WinAnsi character set,
// which doesn't include the Naira sign (₦) — it renders as a broken glyph.
// The PDF generator uses this "N" variant instead of embedding a custom font.
export const formatToNairaPdf = (value: string) => {
  if (!value) return "N0.00";
  const num = parseFloat(value.replace(/,/g, ""));
  if (isNaN(num)) return "N0.00";
  return `N${num.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Leading number in a free-text qty (e.g. "3 ROLL" -> 3, "SUM" -> 1)
export const qtyMultiplier = (qty: string): number => {
  const match = qty.match(/[\d.]+/);
  if (!match) return 1;
  const n = parseFloat(match[0]);
  return isNaN(n) || n <= 0 ? 1 : n;
};

export const rowTotal = (row: RowItem): number =>
  qtyMultiplier(row.qty) * (parseFloat(row.unitRate) || 0);

export const sectionSubtotal = (section: Section): number =>
  section.rows.reduce((sum, row) => sum + rowTotal(row), 0);

export const grandTotal = (sections: Section[]): number =>
  sections.reduce((sum, s) => sum + sectionSubtotal(s), 0);
