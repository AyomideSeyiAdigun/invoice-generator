

````markdown
# InvoiceTable Component

A **React-based dynamic invoice table** that allows users to add, edit, and remove invoice rows.  
Each row contains an **Item, Quantity, Rate, and Amount** field, with amounts and totals dynamically calculated in Nigerian Naira (**₦**).  
The table also supports a **printable mode** where editing actions are disabled.

---

## ✨ Features
- ✅ Add or remove invoice rows dynamically  
- ✅ Auto-calculation of row amount (`quantity × rate`)  
- ✅ Auto-calculation of **grand total** at the bottom  
- ✅ Nigerian Naira (**₦**) currency formatting with commas and 2 decimal places  
- ✅ Editable fields for item name, quantity, and rate  
- ✅ Toggle between **editable** and **printable** mode via `isPrintable` prop  
- ✅ Input validation (only numbers allowed for quantity and rate)  

---

## 🚀 Usage

### 1. Install Dependencies
Make sure you have **React** set up in your project.  

```bash
npm install
# or
yarn install
````

### 2. Import the Component

```tsx
import React from "react";
import InvoiceTable from "./InvoiceTable";

const App = () => {
  return (
    <div>
      <h2>Invoice Example</h2>
      <InvoiceTable isPrintable={false} />
    </div>
  );
};

export default App;
```

---

## 🔧 Props

| Prop          | Type      | Default | Description                                                    |
| ------------- | --------- | ------- | -------------------------------------------------------------- |
| `isPrintable` | `boolean` | `false` | If `true`, disables editing and action buttons (for printing). |

---

## 📂 File Structure

```
/src
  ├── InvoiceTable.tsx      # Component logic
  ├── InvoiceTable.css      # Styles
  └── App.tsx               # Example usage
```

---

## 🎨 Styling

The component comes with a **basic CSS file** (`InvoiceTable.css`) for layout.
You can override styles using your own CSS or frameworks like **Tailwind / Bootstrap**.

---

## 🖨 Printable Mode

To generate a clean invoice (without add/remove buttons), set `isPrintable={true}`:

```tsx
<InvoiceTable isPrintable={true} />
```

---

## 📸 Example

| Item      | Qty | Rate (₦)    | Amount (₦)      |
| --------- | --- | ----------- | --------------- |
| Laptop    | 2   | ₦250,000.00 | ₦500,000.00     |
| Phone     | 1   | ₦150,000.00 | ₦150,000.00     |
| **Total** |     |             | **₦650,000.00** |

---

## 📜 License

MIT License © 2025

```

---
 