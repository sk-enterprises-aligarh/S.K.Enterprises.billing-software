# S K ENTERPRISES - GST Tax Invoice & Job Work Billing Software

Custom-designed commercial billing software tailored specifically for **S K ENTERPRISES** (Aligarh, Uttar Pradesh).

The software permanently locks the seller/owner configuration to **S K ENTERPRISES** while providing a dynamic, feature-rich interface to create, edit, save, and print GST Job Work Tax Invoices for any buyer/customer.

---

## 🌟 Key Features

### 🔒 Permanently Locked Seller & Owner (Non-Editable)
As per configuration, the billing entity is fixed and cannot be accidentally modified:
- **Firm Name**: `S K ENTERPRISES`
- **Address**: `AGRAWAL STREET, SHAKTI NAGAR, GULAR ROAD, ALIGARH 202001 (UP) - INDIA`
- **Mobile No.**: `93595 02004`
- **GSTIN**: `09AVQPG8947B1Z6`
- **State Code**: `09` (Uttar Pradesh)
- **Bank Details**: `CANARA BANK`, SME BRANCH, GULAR ROAD, ALIGARH
- **Account No.**: `120002136484` | **IFSC**: `CNRB0002375`
- **Signatory**: `FOR S K ENTERPRISES` / `Partner/ Authorised Signatory`
- **Jurisdiction**: `All Disputes are Subject to Aligarh Jurisdiction`

### 👤 Fully Editable Buyer Details ("Billed To:")
- **Buyer Name / Company**: Full name editing (e.g. `M/s SREE CORPORATION`).
- **Address**: Multi-line address (Address Line 1, Address Line 2, City & Pincode).
- **GSTIN & State Detection**: Auto-validates 15-character GSTIN and automatically detects State Code (e.g. `09` -> Uttar Pradesh).
- **Saved Buyer Directory**: Save frequent buyers to local database for 1-click loading.

### 📦 Consignment Specifications
- Transport By, L.R. No., Vehicle Number, E-Way Bill Number.
- Place of Supply, Number of Cases (e.g. `35 BAGS`), Reverse Charge (Yes/No).
- Weight (Kg) and Freight (Rs.).

### ⚙️ Line Items & GST Calculations
- Dynamic particulars table with fast presets for:
  - `ZINC DIE CASTING CHARGES` (HSN 9988)
  - `ALUMINIUM DIE CASTING CHARGES` (HSN 9988)
  - `ZINC JOB WORK CHARGES` (HSN 9988)
  - `FINISHING & BUFFING CHARGES` (HSN 9988)
- Real-time tax calculation:
  - **Intra-State (UP)**: 9% SGST + 9% CGST (18% Total GST)
  - **Inter-State (Outside UP)**: 18% IGST (auto-detected when Buyer State Code ≠ 09)
- Auto round off to nearest whole rupee.
- Real-time Indian currency Number-to-Words converter (*Lakhs, Thousands, Hundreds, Rupees & Paise*).

### ⚖️ Details of Material (Zinc Job Work Material Ledger)
Direct accounting of raw material issued by the customer and casting returned:
- Date of Material Ledger (e.g. `02-07-2022`)
- Opening Balance (Kg)
- Zinc Raw Material Received (Kg)
- Total Available (Opening + Received)
- Casting Delivered (Kg) with 1-click "Sync Qty" from bill
- Burning / Melting Loss (Kg) with 1-click "5% Loss" calculator
- Zinc Returned (Kg)
- Auto-calculated Zinc Balance with the caster

### 🖨️ Pixel-Perfect Standard A4 Print & PDF
- Exact replica of the original physical tax invoice with crisp black borders and high-contrast typography.
- Built-in `@media print` engine that formats flawlessly on standard A4 paper without cutting off tables or page elements.

### 📦 Export All Bills in a ZIP (PDF) File
- **Bulk PDF Generation**: Automatically converts all saved bills into individual high-resolution A4 PDF files and packages them into a single downloadable `.zip` archive.
- **Top Bar & History Access**: One-click "Export ZIP (PDFs)" button in the top navigation bar and inside the Invoice History Database modal.
- **Interactive Progress Dialog**: Shows real-time progress bar, percentage, and the current bill being converted.
- **Individual PDF Downloads**: Direct "PDF" button on every invoice card in the history list for instant single invoice download.
- **100% Offline & Client-Side**: Powered by bundled `JSZip` and `html2pdf.js` with zero server dependencies.

### 💾 Local Database & Backup
- **Save Bill**: Persist invoices in browser local storage.
- **Invoice History**: Search, preview, and reload any past invoice.
- **Export & Import**: Full JSON backup and restore functionality.

---

## 🚀 How to Run Locally

You can run the application directly using Python's built-in HTTP server:

```bash
cd billing-software
python -m http.server 8088
```

Open your browser and navigate to:
👉 **http://localhost:8088**

Or open `index.html` directly in Google Chrome, Microsoft Edge, or Firefox.

---

## 📂 Project Structure

```
billing-software/
├── index.html       # Application interface & A4 Tax Invoice template
├── style.css        # Modern design system & pixel-perfect print styles
├── app.js           # Calculation engine, Indian words converter & state manager
├── stamp-sk.svg     # Official S K Enterprises rubber stamp vector
└── README.md        # Documentation
```
