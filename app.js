/**
 * S K ENTERPRISES - Smart GST Tax Invoice & Job Work Billing System
 * 
 * Rules:
 * - Seller / Bill Owner is STRICTLY LOCKED to S K ENTERPRISES (Aligarh)
 * - Only Buyer Details ("Billed To"), Consignment, Items & Material Ledger can be edited
 * - Includes Indian currency Number-to-Words, Zinc Job Work Ledger calculations,
 *   Buyer Directory, Local Storage History, and Pixel-Perfect A4 Printing.
 */

// =============================================================================
// 1. Permanent / Fixed Seller & Owner Configuration
// =============================================================================
const FIXED_SELLER = {
  name: 'S K ENTERPRISES',
  address: 'AGRAWAL STREET, SHAKTI NAGAR, GULAR ROAD, ALIGARH 202001 (UP) - INDIA',
  mobile: '93595 02004',
  gstin: '09AVQPG8947B1Z6',
  stateCode: '09',
  state: 'UTTAR PRADESH',
  bankName: 'CANARA BANK',
  branch: 'SME BRANCH, GULAR ROAD, ALIGARH',
  acNo: '120002136484',
  ifsc: 'CNRB0002375',
  signatory: 'FOR S K ENTERPRISES',
  signCaption: 'Partner/ Authorised Signatory',
  jurisdiction: 'All Disputes are Subject to Aligarh Jurisdiction'
};

// =============================================================================
// 2. Default Invoice State (Exact Data from Original Bill Photo)
// =============================================================================
const ORIGINAL_BILL_DATA = {
  invoiceNumber: '001',
  invoiceDate: '2022-05-15',
  copyType: 'ORIGINAL',
  category: 'JOB WORK',

  // Buyer Details ("Billed To:")
  buyer: {
    name: 'M/s SREE CORPORATION',
    addr1: 'C-72, PHASE-I',
    addr2: 'TALANAGRI',
    cityPin: 'ALIGARH - 202001',
    gstin: '09AEZPG1543H1Z6',
    state: 'UTTAR PRADESH',
    stateCode: '09'
  },

  // Details of Consignment
  consignment: {
    transport: '',
    lrNo: '',
    vehNo: '',
    ewbNo: '',
    placeOfSupply: '',
    noOfCases: '35 BAGS',
    reverseCharge: '',
    weight: 402.000,
    freight: 0
  },

  // Line items (Particulars)
  items: [
    {
      id: 'item-1',
      particulars: 'ZINC DIE CASTING CHARGES',
      hsn: '9988',
      qty: 402.000,
      rate: 40.00
    }
  ],

  // Tax and Round off
  taxMode: 'intra', // 'intra' (9% SGST + 9% CGST) or 'inter' (18% IGST)
  autoDetectTax: true,
  autoRoundoff: true,
  customRoundoff: -0.40,
  wordsOverride: '',

// Official S K Enterprises Partner Signature Preset Vector Data URL
const DEFAULT_PARTNER_SIGNATURE_DATAURL = (function() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="110" viewBox="0 0 320 110">
    <path d="M25 65 C 45 25, 75 20, 85 55 C 95 90, 115 25, 135 60 C 145 75, 160 35, 185 55 C 205 70, 230 45, 255 58 C 275 68, 290 55, 305 60" fill="none" stroke="#1d4ed8" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="35" y="68" font-family="'Caveat', cursive, sans-serif" font-size="44" font-weight="700" fill="#1d4ed8">S. K. Enterprises</text>
    <path d="M30 84 Q 160 76, 285 80" fill="none" stroke="#1d4ed8" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
})();

// Active state clone
const ORIGINAL_BILL_DATA = {
  invoiceNumber: '001',
  invoiceDate: '2022-05-15',
  copyType: 'ORIGINAL',
  category: 'JOB WORK',

  // Buyer Details ("Billed To:")
  buyer: {
    name: 'M/s SREE CORPORATION',
    addr1: 'C-72, PHASE-I',
    addr2: 'TALANAGRI',
    cityPin: 'ALIGARH - 202001',
    gstin: '09AEZPG1543H1Z6',
    state: 'UTTAR PRADESH',
    stateCode: '09'
  },

  // Details of Consignment
  consignment: {
    transport: '',
    lrNo: '',
    vehNo: '',
    ewbNo: '',
    placeOfSupply: '',
    noOfCases: '35 BAGS',
    reverseCharge: '',
    weight: 402.000,
    freight: 0
  },

  // Line items (Particulars)
  items: [
    {
      id: 'item-1',
      particulars: 'ZINC DIE CASTING CHARGES',
      hsn: '9988',
      qty: 402.000,
      rate: 40.00
    }
  ],

  // Tax and Round off
  taxMode: 'intra', // 'intra' (9% SGST + 9% CGST) or 'inter' (18% IGST)
  autoDetectTax: true,
  autoRoundoff: true,
  customRoundoff: -0.40,
  wordsOverride: '',

  // Details of Material (Zinc Job Work Ledger)
  material: {
    show: true,
    date: '2022-07-02',
    opening: 0.000,
    receivedEntries: [
      {
        id: 'rec-1',
        date: '2022-07-02',
        qty: 1256.000,
        note: ''
      }
    ],
    received: 1256.000,
    delivered: 402.000,
    loss: 20.100,
    returned: 0.000
  },

  // Sign & Stamp
  stamp: {
    show: true,
    color: '#1d4ed8',
    rotation: -7
  },
  signature: {
    show: true,
    dataUrl: DEFAULT_PARTNER_SIGNATURE_DATAURL,
    caption: 'Partner/ Authorised Signatory'
  }
};

// Active state clone
let currentInvoice = JSON.parse(JSON.stringify(ORIGINAL_BILL_DATA));

// Default Buyer Presets
const DEFAULT_BUYERS = [
  {
    id: 'buyer-sree',
    name: 'M/s SREE CORPORATION',
    addr1: 'C-72, PHASE-I',
    addr2: 'TALANAGRI',
    cityPin: 'ALIGARH - 202001',
    gstin: '09AEZPG1543H1Z6',
    state: 'UTTAR PRADESH',
    stateCode: '09'
  },
  {
    id: 'buyer-aligarh-locks',
    name: 'M/s ALIGARH LOCKS & DIE CASTINGS',
    addr1: 'PLOT 14, ITI ROAD',
    addr2: 'INDUSTRIAL AREA',
    cityPin: 'ALIGARH - 202001',
    gstin: '09BCDPG2314K1Z1',
    state: 'UTTAR PRADESH',
    stateCode: '09'
  },
  {
    id: 'buyer-radhey',
    name: 'M/s RADHEY KRISHNA HARDWARE',
    addr1: 'D-19, SECTOR 2',
    addr2: 'TALANAGRI INDUSTRIAL AREA',
    cityPin: 'ALIGARH - 202001',
    gstin: '09AAAFR1234A1Z3',
    state: 'UTTAR PRADESH',
    stateCode: '09'
  }
];

// =============================================================================
// 3. Indian Currency Number to Words Converter
// =============================================================================
function numberToIndianWords(amount) {
  if (isNaN(amount) || amount === 0) return 'RUPEES ZERO ONLY';

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const rupees = Math.floor(absAmount);
  const paise = Math.round((absAmount - rupees) * 100);

  const ones = [
    '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
    'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
    'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'
  ];

  const tens = [
    '', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'
  ];

  function convertTwoDigits(n) {
    if (n < 20) return ones[n];
    const unit = n % 10;
    const ten = Math.floor(n / 10);
    return tens[ten] + (unit > 0 ? ' ' + ones[unit] : '');
  }

  function convertThreeDigits(n) {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (hundred > 0) {
      res += ones[hundred] + ' HUNDRED';
      if (rest > 0) res += ' AND ';
    }
    if (rest > 0) {
      res += convertTwoDigits(rest);
    }
    return res;
  }

  // Indian Numbering System: Crores, Lakhs, Thousands, Hundreds
  let remaining = rupees;
  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;
  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;
  const hundredAndRest = remaining;

  let words = '';

  if (crore > 0) {
    words += convertTwoDigits(crore) + ' CRORE ';
  }
  if (lakh > 0) {
    words += convertTwoDigits(lakh) + ' LAKH ';
  }
  if (thousand > 0) {
    words += convertTwoDigits(thousand) + ' THOUSAND ';
  }
  if (hundredAndRest > 0) {
    words += convertThreeDigits(hundredAndRest);
  }

  words = words.trim();
  if (words === '') words = 'ZERO';

  let result = 'RUPEES ' + words;
  if (paise > 0) {
    result += ' AND PAISE ' + convertTwoDigits(paise);
  } else {
    result += ' AND PAISE ZERO ONLY';
  }

  if (isNegative) result = 'MINUS ' + result;
  return result;
}

// Format date to DD-MM-YYYY
function formatDateDDMMYYYY(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateString;
}

// Format currency amount with commas and 2 decimals
function formatCurrency(num) {
  return Number(num || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Format decimal quantity with 3 decimals
function formatQty(num) {
  return Number(num || 0).toFixed(3);
}

// =============================================================================
// 4. Calculations Engine
// =============================================================================
function calculateBillTotals() {
  // 1. Taxable items total
  let totalTaxable = 0;
  currentInvoice.items.forEach(item => {
    const qty = parseFloat(item.qty) || 0;
    const rate = parseFloat(item.rate) || 0;
    const amount = qty * rate;
    item.amount = amount;
    totalTaxable += amount;
  });

  // 2. Tax Mode Resolution (Intra 9%+9% or Inter 18%)
  let taxMode = currentInvoice.taxMode;
  if (currentInvoice.autoDetectTax) {
    const buyerCode = (currentInvoice.buyer.stateCode || '').trim();
    if (buyerCode && buyerCode !== '09') {
      taxMode = 'inter';
    } else {
      taxMode = 'intra';
    }
  }

  let sgstAmount = 0;
  let cgstAmount = 0;
  let igstAmount = 0;
  let totalGst = 0;

  if (taxMode === 'intra') {
    sgstAmount = totalTaxable * 0.09;
    cgstAmount = totalTaxable * 0.09;
    totalGst = sgstAmount + cgstAmount;
  } else if (taxMode === 'inter') {
    igstAmount = totalTaxable * 0.18;
    totalGst = igstAmount;
  }

  // 3. Raw Total
  const rawTotal = totalTaxable + totalGst;

  // 4. Round off
  let roundoff = 0;
  let grandTotal = rawTotal;

  if (currentInvoice.autoRoundoff) {
    const rounded = Math.round(rawTotal);
    roundoff = rounded - rawTotal;
    grandTotal = rounded;
  } else {
    roundoff = parseFloat(currentInvoice.customRoundoff) || 0;
    grandTotal = rawTotal + roundoff;
  }

  // 5. Material Ledger (Zinc Job Work Calculations)
  ensureMaterialEntries(currentInvoice.material);
  const matOpening = parseFloat(currentInvoice.material.opening) || 0;
  
  // Calculate total received from receivedEntries array with legacy fallback
  let matReceived = 0;
  if (Array.isArray(currentInvoice.material.receivedEntries) && currentInvoice.material.receivedEntries.length > 0) {
    matReceived = currentInvoice.material.receivedEntries.reduce((sum, entry) => sum + (parseFloat(entry.qty) || 0), 0);
  } else {
    matReceived = parseFloat(currentInvoice.material.received) || 0;
  }
  currentInvoice.material.received = matReceived;

  const matTotal = matOpening + matReceived;
  const matDelivered = parseFloat(currentInvoice.material.delivered) || 0;
  const matLoss = parseFloat(currentInvoice.material.loss) || 0;
  const matReturned = parseFloat(currentInvoice.material.returned) || 0;
  const matBalance = matTotal - matDelivered - matLoss - matReturned;

  return {
    totalTaxable,
    taxMode,
    sgstAmount,
    cgstAmount,
    igstAmount,
    totalGst,
    roundoff,
    grandTotal,
    material: {
      opening: matOpening,
      received: matReceived,
      total: matTotal,
      delivered: matDelivered,
      loss: matLoss,
      returned: matReturned,
      balance: matBalance
    }
  };
}

// =============================================================================
// 5. DOM Synchronization: Update View (Live Preview Sheet)
// =============================================================================
function renderInvoiceSheet() {
  const totals = calculateBillTotals();

  // 1. Seller Information (Strictly Locked to S K ENTERPRISES)
  document.getElementById('view-seller-name').textContent = FIXED_SELLER.name;
  document.getElementById('view-seller-address').textContent = FIXED_SELLER.address;
  document.getElementById('view-seller-mobile').textContent = FIXED_SELLER.mobile;
  document.getElementById('view-seller-gstin').textContent = FIXED_SELLER.gstin;
  document.getElementById('view-seller-statecode').textContent = FIXED_SELLER.stateCode;

  // 2. Invoice Meta
  document.getElementById('view-inv-number').textContent = currentInvoice.invoiceNumber || '001';
  document.getElementById('view-inv-date').textContent = formatDateDDMMYYYY(currentInvoice.invoiceDate);
  document.getElementById('view-copy-type').textContent = currentInvoice.copyType || 'ORIGINAL';
  document.getElementById('view-inv-category').textContent = currentInvoice.category || 'JOB WORK';

  // 3. Buyer Details ("Billed To:")
  document.getElementById('view-buyer-name').textContent = currentInvoice.buyer.name || 'M/s SREE CORPORATION';
  document.getElementById('view-buyer-addr1').textContent = currentInvoice.buyer.addr1 || '';
  document.getElementById('view-buyer-addr2').textContent = currentInvoice.buyer.addr2 || '';
  document.getElementById('view-buyer-city-pin').textContent = currentInvoice.buyer.cityPin || '';
  document.getElementById('view-buyer-gstin').textContent = currentInvoice.buyer.gstin || '';
  document.getElementById('view-buyer-state').textContent = currentInvoice.buyer.state || '';
  document.getElementById('view-buyer-statecode').textContent = currentInvoice.buyer.stateCode || '';

  // 4. Details of Consignment
  document.getElementById('view-cons-transport').textContent = currentInvoice.consignment.transport || '';
  document.getElementById('view-cons-lr-no').textContent = currentInvoice.consignment.lrNo || '';
  document.getElementById('view-cons-veh-no').textContent = currentInvoice.consignment.vehNo || '';
  document.getElementById('view-cons-ewb-no').textContent = currentInvoice.consignment.ewbNo || '';
  document.getElementById('view-cons-place-supply').textContent = currentInvoice.consignment.placeOfSupply || '';
  document.getElementById('view-cons-no-cases').textContent = currentInvoice.consignment.noOfCases || '';
  document.getElementById('view-cons-reverse-charge').textContent = currentInvoice.consignment.reverseCharge || '';
  document.getElementById('view-cons-weight').textContent = formatQty(currentInvoice.consignment.weight);
  document.getElementById('view-cons-freight').textContent = (currentInvoice.consignment.freight || 0).toString();

  // 5. Line Items Table
  const tbody = document.getElementById('view-items-tbody');
  tbody.innerHTML = '';

  currentInvoice.items.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.className = 'item-data-row';
    tr.innerHTML = `
      <td class="cell-sno">${index + 1}</td>
      <td class="cell-particulars">${item.particulars || ''}</td>
      <td class="cell-hsn">${item.hsn || ''}</td>
      <td class="cell-qty">${formatQty(item.qty)}</td>
      <td class="cell-rate">${Number(item.rate || 0).toFixed(0)}</td>
      <td class="cell-amount">${Number(item.amount || 0).toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Add blank spacer rows so the table maintains realistic invoice height
  const blankRowsNeeded = Math.max(0, 5 - currentInvoice.items.length);
  for (let i = 0; i < blankRowsNeeded; i++) {
    const tr = document.createElement('tr');
    tr.className = 'blank-item-row';
    tr.innerHTML = `
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
    `;
    tbody.appendChild(tr);
  }

  // 6. Subtotals Block (Bottom Right of Items Table)
  document.getElementById('view-total-taxable').textContent = Number(totals.totalTaxable).toFixed(2);

  const rowSgst = document.getElementById('row-view-sgst');
  const rowCgst = document.getElementById('row-view-cgst');
  const rowIgst = document.getElementById('row-view-igst');

  if (totals.taxMode === 'intra') {
    rowSgst.style.display = '';
    rowCgst.style.display = '';
    rowIgst.style.display = 'none';
    document.getElementById('view-total-sgst').textContent = Number(totals.sgstAmount).toFixed(2);
    document.getElementById('view-total-cgst').textContent = Number(totals.cgstAmount).toFixed(2);
  } else if (totals.taxMode === 'inter') {
    rowSgst.style.display = 'none';
    rowCgst.style.display = 'none';
    rowIgst.style.display = '';
    document.getElementById('view-total-igst').textContent = Number(totals.igstAmount).toFixed(2);
  } else {
    rowSgst.style.display = 'none';
    rowCgst.style.display = 'none';
    rowIgst.style.display = 'none';
  }

  // Round off display
  const roundoffRow = document.getElementById('row-view-roundoff');
  if (Math.abs(totals.roundoff) > 0.001) {
    roundoffRow.style.display = '';
    const prefix = totals.roundoff >= 0 ? '+' : '';
    document.getElementById('view-total-roundoff').textContent = prefix + Number(totals.roundoff).toFixed(2);
  } else {
    document.getElementById('view-total-roundoff').textContent = '0.00';
  }

  // Grand Total
  document.getElementById('view-grand-total').textContent = Number(totals.grandTotal).toFixed(2);
  document.getElementById('quick-total-display').textContent = 'Rs. ' + formatCurrency(totals.grandTotal);

  // 7. Amount Chargeable in Words
  let wordsText = currentInvoice.wordsOverride;
  if (!wordsText) {
    wordsText = numberToIndianWords(totals.grandTotal);
  }
  document.getElementById('view-amount-in-words').textContent = wordsText;

  // 8. Tax Summary Table Box
  document.getElementById('view-sum-taxable').textContent = Number(totals.totalTaxable).toFixed(2);
  if (totals.taxMode === 'intra') {
    document.getElementById('th-sum-sgst').textContent = '9% SGST';
    document.getElementById('th-sum-cgst').textContent = '9% CGST';
    document.getElementById('view-sum-sgst').textContent = Number(totals.sgstAmount).toFixed(2);
    document.getElementById('view-sum-cgst').textContent = Number(totals.cgstAmount).toFixed(2);
  } else {
    document.getElementById('th-sum-sgst').textContent = 'IGST';
    document.getElementById('th-sum-cgst').textContent = '-';
    document.getElementById('view-sum-sgst').textContent = Number(totals.igstAmount).toFixed(2);
    document.getElementById('view-sum-cgst').textContent = '0.00';
  }
  document.getElementById('view-sum-total-gst').textContent = Number(totals.totalGst).toFixed(2);

  // 9. Details of Material Block (Zinc Job Work Ledger)
  const matContainer = document.getElementById('view-material-container');
  if (currentInvoice.material.show) {
    matContainer.style.display = '';
    document.getElementById('view-mat-date').textContent = formatDateDDMMYYYY(currentInvoice.material.date);
    document.getElementById('view-mat-opening').textContent = formatQty(totals.material.opening);

    // Render dynamic received rows on the printed bill
    const rowsWrapper = document.getElementById('view-mat-received-rows-wrapper');
    if (rowsWrapper) {
      rowsWrapper.innerHTML = '';
      const entries = (currentInvoice.material.receivedEntries && currentInvoice.material.receivedEntries.length > 0)
        ? currentInvoice.material.receivedEntries
        : [{ id: 'rec-fallback', date: currentInvoice.material.date, qty: totals.material.received, note: '' }];

      entries.forEach(entry => {
        const row = document.createElement('div');
        row.className = 'mat-row mat-row-received';
        const dateFormatted = entry.date ? formatDateDDMMYYYY(entry.date) : '';
        const dateSpan = dateFormatted ? `<span class="mat-row-date">${dateFormatted}</span> ` : '';
        const noteSpan = entry.note ? ` <span class="mat-note-suffix">(${entry.note})</span>` : '';
        row.innerHTML = `
          <div class="mat-label">${dateSpan}ZINC RAW MATERIAL RECEIVED${noteSpan}</div>
          <div class="mat-val">${formatQty(entry.qty)}</div>
        `;
        rowsWrapper.appendChild(row);
      });
    }

    document.getElementById('view-mat-total').textContent = formatQty(totals.material.total);
    document.getElementById('view-mat-delivered').textContent = formatQty(totals.material.delivered);
    document.getElementById('view-mat-loss').textContent = formatQty(totals.material.loss);
    document.getElementById('view-mat-returned').textContent = totals.material.returned > 0 ? formatQty(totals.material.returned) : '';
    document.getElementById('view-mat-balance').textContent = formatQty(totals.material.balance);

    // Sidebar indicators
    document.getElementById('mat-total').value = totals.material.total.toFixed(3);
    document.getElementById('mat-balance').value = totals.material.balance.toFixed(3);
    const stripVal = document.getElementById('mat-received-total-strip-val');
    if (stripVal) stripVal.textContent = `${totals.material.received.toFixed(3)} Kg`;
    document.getElementById('metric-mat-total').textContent = `${totals.material.total.toFixed(3)} Kg`;
    document.getElementById('metric-mat-used').textContent = `${(totals.material.delivered + totals.material.loss).toFixed(3)} Kg`;
    document.getElementById('metric-mat-bal').textContent = `${totals.material.balance.toFixed(3)} Kg`;
  } else {
    matContainer.style.display = 'none';
  }

  // 10. Bank Details (Strictly Locked)
  document.getElementById('view-bank-name').textContent = FIXED_SELLER.bankName;
  document.getElementById('view-bank-branch').textContent = FIXED_SELLER.branch;
  document.getElementById('view-bank-ac').textContent = FIXED_SELLER.acNo;
  document.getElementById('view-bank-ifsc').textContent = FIXED_SELLER.ifsc;

  // 11. Signatory & Stamp
  const stampEl = document.getElementById('view-rubber-stamp');
  stampEl.style.display = currentInvoice.stamp.show ? 'block' : 'none';
  stampEl.style.transform = `rotate(${currentInvoice.stamp.rotation}deg)`;

  const sigEl = document.getElementById('view-seller-signature');
  const sigImg = document.getElementById('view-sig-img');
  if (currentInvoice.signature.show && currentInvoice.signature.dataUrl) {
    sigEl.style.display = 'block';
    sigImg.src = currentInvoice.signature.dataUrl;
    sigImg.style.display = 'block';
  } else {
    sigEl.style.display = 'none';
    sigImg.style.display = 'none';
  }

  document.getElementById('view-sign-caption').textContent = currentInvoice.signature.caption || FIXED_SELLER.signCaption;
}

// =============================================================================
// 6. DOM Synchronization: Update Editor Fields from State
// =============================================================================
function populateEditorFields() {
  // Invoice Meta
  document.getElementById('inv-number').value = currentInvoice.invoiceNumber;
  document.getElementById('inv-date').value = currentInvoice.invoiceDate;
  document.getElementById('inv-copy-type').value = currentInvoice.copyType;

  // Buyer Details
  document.getElementById('buyer-name').value = currentInvoice.buyer.name || '';
  document.getElementById('buyer-addr1').value = currentInvoice.buyer.addr1 || '';
  document.getElementById('buyer-addr2').value = currentInvoice.buyer.addr2 || '';
  document.getElementById('buyer-city-pin').value = currentInvoice.buyer.cityPin || '';
  document.getElementById('buyer-gstin').value = currentInvoice.buyer.gstin || '';
  document.getElementById('buyer-state').value = currentInvoice.buyer.state || '';
  document.getElementById('buyer-state-code').value = currentInvoice.buyer.stateCode || '';

  // Consignment Details
  document.getElementById('cons-transport').value = currentInvoice.consignment.transport || '';
  document.getElementById('cons-lr-no').value = currentInvoice.consignment.lrNo || '';
  document.getElementById('cons-veh-no').value = currentInvoice.consignment.vehNo || '';
  document.getElementById('cons-ewb-no').value = currentInvoice.consignment.ewbNo || '';
  document.getElementById('cons-place-supply').value = currentInvoice.consignment.placeOfSupply || '';
  document.getElementById('cons-no-cases').value = currentInvoice.consignment.noOfCases || '';
  document.getElementById('cons-reverse-charge').value = currentInvoice.consignment.reverseCharge || '';
  document.getElementById('cons-weight').value = currentInvoice.consignment.weight || 0;
  document.getElementById('cons-freight').value = currentInvoice.consignment.freight || 0;

  // Items Render
  renderItemEditorCards();

  // Taxes & Round off
  document.getElementById('tax-mode').value = currentInvoice.taxMode;
  document.getElementById('auto-detect-tax').checked = currentInvoice.autoDetectTax;
  document.getElementById('toggle-roundoff').checked = currentInvoice.autoRoundoff;
  document.getElementById('custom-roundoff').value = currentInvoice.customRoundoff;
  document.getElementById('custom-roundoff').disabled = currentInvoice.autoRoundoff;
  document.getElementById('words-override-input').value = currentInvoice.wordsOverride || '';

  // Material Ledger
  document.getElementById('toggle-material-table').checked = currentInvoice.material.show;
  document.getElementById('mat-date').value = currentInvoice.material.date;
  document.getElementById('mat-opening').value = currentInvoice.material.opening;
  renderMaterialReceivedEditor();
  document.getElementById('mat-delivered').value = currentInvoice.material.delivered;
  document.getElementById('mat-loss').value = currentInvoice.material.loss;
  document.getElementById('mat-returned').value = currentInvoice.material.returned;

  // Sign & Stamp
  document.getElementById('toggle-stamp').checked = currentInvoice.stamp.show;
  document.getElementById('stamp-color').value = currentInvoice.stamp.color;
  document.getElementById('stamp-rotation').value = currentInvoice.stamp.rotation;
  document.getElementById('toggle-signature').checked = currentInvoice.signature.show;
  document.getElementById('signatory-label').value = currentInvoice.signature.caption;

  // Refresh saved counts
  updateSavedInvoiceCount();
  populateSavedBuyerDropdown();
}

// Render dynamic item cards in Editor sidebar
function renderItemEditorCards() {
  const container = document.getElementById('items-editor-container');
  container.innerHTML = '';

  currentInvoice.items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'item-edit-card';
    card.dataset.itemId = item.id;
    card.innerHTML = `
      <div class="item-edit-header">
        <span class="item-edit-title">Item #${index + 1}</span>
        ${currentInvoice.items.length > 1 ? `<button type="button" class="btn-del-item" data-id="${item.id}">Delete</button>` : ''}
      </div>
      <div class="form-group">
        <label>Particulars (Description) *</label>
        <input type="text" class="form-control item-particulars" value="${item.particulars || ''}" placeholder="e.g. ZINC DIE CASTING CHARGES">
      </div>
      <div class="form-row">
        <div class="form-group flex-1">
          <label>HSN/SAC Code</label>
          <input type="text" class="form-control item-hsn" value="${item.hsn || '9988'}" placeholder="9988">
        </div>
        <div class="form-group flex-1">
          <label>Quantity (Kg)</label>
          <input type="number" step="0.001" class="form-control item-qty" value="${item.qty || 0}">
        </div>
        <div class="form-group flex-1">
          <label>Rate (Rs.)</label>
          <input type="number" step="0.01" class="form-control item-rate" value="${item.rate || 0}">
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  document.getElementById('items-badge-count').textContent = currentInvoice.items.length;

  // Attach input listeners
  container.querySelectorAll('.item-particulars').forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      currentInvoice.items[idx].particulars = e.target.value;
      renderInvoiceSheet();
    });
  });

  container.querySelectorAll('.item-hsn').forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      currentInvoice.items[idx].hsn = e.target.value;
      renderInvoiceSheet();
    });
  });

  container.querySelectorAll('.item-qty').forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      currentInvoice.items[idx].qty = parseFloat(e.target.value) || 0;
      renderInvoiceSheet();
    });
  });

  container.querySelectorAll('.item-rate').forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      currentInvoice.items[idx].rate = parseFloat(e.target.value) || 0;
      renderInvoiceSheet();
    });
  });

  container.querySelectorAll('.btn-del-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      currentInvoice.items = currentInvoice.items.filter(item => item.id !== id);
      renderItemEditorCards();
      renderInvoiceSheet();
    });
  });
}

// =============================================================================
// 7. Buyer Directory Management
// =============================================================================
function getSavedBuyers() {
  try {
    const raw = localStorage.getItem('sk_saved_buyers');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading buyers:', e);
  }
  return DEFAULT_BUYERS;
}

function saveBuyersList(buyers) {
  localStorage.setItem('sk_saved_buyers', JSON.stringify(buyers));
  populateSavedBuyerDropdown();
  updateBuyerDirectoryModal();
}

function populateSavedBuyerDropdown() {
  const select = document.getElementById('select-saved-buyer');
  const buyers = getSavedBuyers();
  select.innerHTML = '<option value="">-- Choose Existing Buyer --</option>';

  buyers.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.id;
    opt.textContent = `${b.name} (${b.cityPin || b.state})`;
    select.appendChild(opt);
  });

  const countBadge = document.getElementById('buyer-count');
  if (countBadge) countBadge.textContent = buyers.length;
}

function loadBuyerIntoForm(buyerId) {
  const buyers = getSavedBuyers();
  const buyer = buyers.find(b => b.id === buyerId);
  if (!buyer) return;

  currentInvoice.buyer.name = buyer.name;
  currentInvoice.buyer.addr1 = buyer.addr1;
  currentInvoice.buyer.addr2 = buyer.addr2;
  currentInvoice.buyer.cityPin = buyer.cityPin;
  currentInvoice.buyer.gstin = buyer.gstin;
  currentInvoice.buyer.state = buyer.state;
  currentInvoice.buyer.stateCode = buyer.stateCode;

  populateEditorFields();
  renderInvoiceSheet();
  showToast(`Buyer loaded: ${buyer.name}`, 'toast-success');
}

function saveCurrentBuyerToDirectory() {
  const name = (currentInvoice.buyer.name || '').trim();
  if (!name) {
    showToast('Please enter a Buyer Name first.', 'toast-error');
    return;
  }

  const buyers = getSavedBuyers();
  const existingIdx = buyers.findIndex(b => b.name.toLowerCase() === name.toLowerCase());

  const newBuyerObj = {
    id: 'buyer-' + Date.now(),
    name: currentInvoice.buyer.name,
    addr1: currentInvoice.buyer.addr1,
    addr2: currentInvoice.buyer.addr2,
    cityPin: currentInvoice.buyer.cityPin,
    gstin: currentInvoice.buyer.gstin,
    state: currentInvoice.buyer.state,
    stateCode: currentInvoice.buyer.stateCode
  };

  if (existingIdx >= 0) {
    buyers[existingIdx] = newBuyerObj;
    showToast(`Updated saved buyer: ${name}`, 'toast-success');
  } else {
    buyers.push(newBuyerObj);
    showToast(`Saved ${name} to Buyer Directory`, 'toast-success');
  }

  saveBuyersList(buyers);
}

function updateBuyerDirectoryModal() {
  const listEl = document.getElementById('buyer-directory-list');
  const countEl = document.getElementById('modal-buyer-count');
  const buyers = getSavedBuyers();

  if (countEl) countEl.textContent = `${buyers.length} Buyers`;
  if (!listEl) return;

  if (buyers.length === 0) {
    listEl.innerHTML = '<p class="text-muted text-center py-4">No saved buyers in directory.</p>';
    return;
  }

  listEl.innerHTML = '';
  buyers.forEach(b => {
    const card = document.createElement('div');
    card.className = 'saved-item-card';
    card.innerHTML = `
      <div class="saved-item-info">
        <span class="saved-item-title">${b.name}</span>
        <span class="saved-item-meta">${b.cityPin || ''} • GSTIN: ${b.gstin || 'Unregistered'} • State: ${b.state || ''} (${b.stateCode || ''})</span>
      </div>
      <div class="saved-item-actions">
        <button type="button" class="btn btn-sm btn-primary btn-load-buyer-modal" data-id="${b.id}">Load</button>
        <button type="button" class="btn btn-sm btn-ghost text-danger btn-del-buyer-modal" data-id="${b.id}">Delete</button>
      </div>
    `;
    listEl.appendChild(card);
  });

  listEl.querySelectorAll('.btn-load-buyer-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      loadBuyerIntoForm(e.target.dataset.id);
      document.getElementById('modal-buyer-directory').close();
    });
  });

  listEl.querySelectorAll('.btn-del-buyer-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const updated = getSavedBuyers().filter(b => b.id !== id);
      saveBuyersList(updated);
      showToast('Buyer removed from directory.', 'toast-info');
    });
  });
}

// =============================================================================
// 8. Saved Invoices History (LocalStorage Database)
// =============================================================================
function getSavedInvoices() {
  try {
    const raw = localStorage.getItem('sk_saved_invoices');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading saved invoices:', e);
  }
  return [];
}

function updateSavedInvoiceCount() {
  const countEl = document.getElementById('saved-count');
  if (countEl) {
    countEl.textContent = getSavedInvoices().length;
  }
}

function saveCurrentInvoice() {
  const invoices = getSavedInvoices();
  const invoiceId = currentInvoice.invoiceNumber || 'INV-' + Date.now();
  const totals = calculateBillTotals();

  const record = {
    id: invoiceId,
    timestamp: new Date().toISOString(),
    invoiceNumber: currentInvoice.invoiceNumber,
    invoiceDate: currentInvoice.invoiceDate,
    buyerName: currentInvoice.buyer.name || 'Unspecified Buyer',
    grandTotal: totals.grandTotal,
    data: JSON.parse(JSON.stringify(currentInvoice))
  };

  const existingIndex = invoices.findIndex(inv => inv.id === invoiceId);
  if (existingIndex >= 0) {
    invoices[existingIndex] = record;
    showToast(`Invoice #${invoiceId} updated in history!`, 'toast-success');
  } else {
    invoices.unshift(record);
    showToast(`Invoice #${invoiceId} saved to database!`, 'toast-success');
  }

  localStorage.setItem('sk_saved_invoices', JSON.stringify(invoices));
  updateSavedInvoiceCount();
}

function updateSavedInvoicesModal(query = '') {
  const listEl = document.getElementById('saved-invoices-list');
  const countBadge = document.getElementById('modal-invoice-count');
  const invoices = getSavedInvoices();

  let filtered = invoices;
  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = invoices.filter(inv => 
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(q)) ||
      (inv.buyerName && inv.buyerName.toLowerCase().includes(q))
    );
  }

  if (countBadge) countBadge.textContent = `${invoices.length} Invoices`;

  if (filtered.length === 0) {
    listEl.innerHTML = '<p class="text-muted text-center py-4">No matching invoices found.</p>';
    return;
  }

  listEl.innerHTML = '';
  filtered.forEach(inv => {
    const card = document.createElement('div');
    card.className = 'saved-item-card';
    card.innerHTML = `
      <div class="saved-item-info">
        <span class="saved-item-title">Invoice #${inv.invoiceNumber} - ${inv.buyerName}</span>
        <span class="saved-item-meta">Date: ${formatDateDDMMYYYY(inv.invoiceDate)} • Total: Rs. ${formatCurrency(inv.grandTotal)}</span>
      </div>
      <div class="saved-item-actions">
        <button type="button" class="btn btn-sm btn-primary btn-load-saved-inv" data-id="${inv.id}">Open</button>
        <button type="button" class="btn btn-sm btn-outline btn-download-single-pdf" data-id="${inv.id}" title="Download this invoice as a PDF file">PDF</button>
        <button type="button" class="btn btn-sm btn-ghost text-danger btn-del-saved-inv" data-id="${inv.id}">Delete</button>
      </div>
    `;
    listEl.appendChild(card);
  });

  listEl.querySelectorAll('.btn-load-saved-inv').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const target = invoices.find(i => i.id === id);
      if (target) {
        currentInvoice = JSON.parse(JSON.stringify(target.data));
        populateEditorFields();
        renderInvoiceSheet();
        document.getElementById('modal-saved-invoices').close();
        showToast(`Loaded Invoice #${target.invoiceNumber}`, 'toast-success');
      }
    });
  });

  listEl.querySelectorAll('.btn-download-single-pdf').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const target = invoices.find(i => i.id === id);
      if (target) {
        exportSingleInvoiceToPdf(target.data, target.invoiceNumber, target.buyerName);
      }
    });
  });

  listEl.querySelectorAll('.btn-del-saved-inv').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const updated = invoices.filter(i => i.id !== id);
      localStorage.setItem('sk_saved_invoices', JSON.stringify(updated));
      updateSavedInvoiceCount();
      updateSavedInvoicesModal(query);
      showToast('Invoice removed from database.', 'toast-info');
    });
  });
}

// =============================================================================
// 8b. PDF & ZIP Export Functions (html2pdf + JSZip)
// =============================================================================

async function exportSingleInvoiceToPdf(invoiceData, invoiceNum, buyerName) {
  if (typeof html2pdf === 'undefined') {
    showToast('PDF engine is loading. Please try again.', 'toast-error');
    return;
  }

  const backupInvoice = JSON.parse(JSON.stringify(currentInvoice));
  const sheet = document.getElementById('invoice-sheet');
  const originalTransform = sheet.style.transform;
  sheet.style.transform = 'scale(1)';

  showToast(`Generating PDF for Invoice #${invoiceNum}...`, 'toast-info');

  try {
    currentInvoice = JSON.parse(JSON.stringify(invoiceData || currentInvoice));
    renderInvoiceSheet();
    await new Promise(resolve => setTimeout(resolve, 80));

    const safeBuyer = (buyerName || 'Buyer').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
    const filename = `Invoice_${invoiceNum || '001'}_${safeBuyer}.pdf`;

    const opt = {
      margin: [0, 0, 0, 0],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        scrollX: 0
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    await html2pdf().set(opt).from(sheet).save();
    showToast(`Downloaded ${filename}`, 'toast-success');
  } catch (err) {
    console.error('Error generating single PDF:', err);
    showToast('Failed to generate PDF.', 'toast-error');
  } finally {
    currentInvoice = backupInvoice;
    populateEditorFields();
    renderInvoiceSheet();
    sheet.style.transform = originalTransform;
  }
}

async function exportAllInvoicesToZip() {
  if (typeof JSZip === 'undefined' || typeof html2pdf === 'undefined') {
    showToast('Export libraries are loading. Please try again.', 'toast-error');
    return;
  }

  let invoices = getSavedInvoices();

  // If no saved invoices in history, export the currently open bill
  if (!invoices || invoices.length === 0) {
    const totals = calculateBillTotals();
    invoices = [{
      id: currentInvoice.invoiceNumber || '001',
      invoiceNumber: currentInvoice.invoiceNumber || '001',
      invoiceDate: currentInvoice.invoiceDate,
      buyerName: currentInvoice.buyer.name || 'M/s SREE CORPORATION',
      grandTotal: totals.grandTotal,
      data: JSON.parse(JSON.stringify(currentInvoice))
    }];
  }

  // Close the saved invoices modal if open so progress modal is clear
  const savedModal = document.getElementById('modal-saved-invoices');
  if (savedModal && savedModal.open) {
    savedModal.close();
  }

  const progressModal = document.getElementById('modal-export-progress');
  const progressTitle = document.getElementById('export-progress-title');
  const progressDetail = document.getElementById('export-progress-detail');
  const progressBar = document.getElementById('export-progress-bar');
  const progressPercent = document.getElementById('export-progress-percent');
  const progressFooter = document.getElementById('export-progress-footer');
  const spinnerWrapper = document.querySelector('.export-spinner-wrapper');

  progressFooter.style.display = 'none';
  spinnerWrapper.style.display = 'block';
  progressBar.style.width = '0%';
  progressPercent.textContent = '0%';
  progressTitle.textContent = `Preparing ${invoices.length} Bill${invoices.length > 1 ? 's' : ''} for Export...`;
  progressDetail.textContent = 'Initializing PDF conversion engine...';
  progressModal.showModal();

  // Backup current UI state
  const backupInvoice = JSON.parse(JSON.stringify(currentInvoice));
  const sheet = document.getElementById('invoice-sheet');
  const originalTransform = sheet.style.transform;
  sheet.style.transform = 'scale(1)';

  const zip = new JSZip();
  const folder = zip.folder("SK_Enterprises_Tax_Invoices");

  try {
    for (let i = 0; i < invoices.length; i++) {
      const inv = invoices[i];
      const invNum = inv.invoiceNumber || inv.id || String(i + 1);
      const buyerName = (inv.buyerName || 'Buyer').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
      const filename = `Invoice_${invNum}_${buyerName}.pdf`;

      const pct = Math.round((i / invoices.length) * 90);
      progressBar.style.width = `${pct}%`;
      progressPercent.textContent = `${pct}%`;
      progressTitle.textContent = `Converting Bill ${i + 1} of ${invoices.length}`;
      progressDetail.textContent = `Generating PDF: Invoice #${invNum} (${inv.buyerName || 'Customer'})...`;

      // Render this invoice into the live sheet
      currentInvoice = JSON.parse(JSON.stringify(inv.data || inv));
      renderInvoiceSheet();

      // Delay to ensure DOM repaint and clean layout
      await new Promise(resolve => setTimeout(resolve, 80));

      const opt = {
        margin: [0, 0, 0, 0],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          scrollX: 0
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      };

      const pdfBlob = await html2pdf().set(opt).from(sheet).outputPdf('blob');
      folder.file(filename, pdfBlob);
    }

    // Packing ZIP
    progressBar.style.width = '95%';
    progressPercent.textContent = '95%';
    progressTitle.textContent = 'Compressing into ZIP archive...';
    progressDetail.textContent = `Bundling ${invoices.length} PDF bills into ZIP file...`;

    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    const zipFilename = `SK_Enterprises_Bills_PDFs_${Date.now()}.zip`;
    const downloadUrl = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = zipFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);

    // Completion status
    progressBar.style.width = '100%';
    progressPercent.textContent = '100%';
    progressTitle.textContent = 'ZIP Export Complete!';
    progressDetail.textContent = `Successfully packaged and downloaded ${invoices.length} bill PDF${invoices.length > 1 ? 's' : ''} in ${zipFilename}.`;
    spinnerWrapper.style.display = 'none';
    progressFooter.style.display = 'flex';

    showToast(`Exported ${invoices.length} bills as PDF in ZIP!`, 'toast-success');
  } catch (err) {
    console.error('Error exporting ZIP of PDFs:', err);
    progressTitle.textContent = 'Export Failed';
    progressDetail.textContent = `Error: ${err.message || 'Could not complete PDF export.'}`;
    spinnerWrapper.style.display = 'none';
    progressFooter.style.display = 'flex';
    showToast('Failed to export ZIP file.', 'toast-error');
  } finally {
    // Restore UI state
    currentInvoice = backupInvoice;
    populateEditorFields();
    renderInvoiceSheet();
    sheet.style.transform = originalTransform;
  }
}

// =============================================================================
// 9. Signature Pad (HTML5 Canvas)
// =============================================================================
// Ensure material entries helper
function ensureMaterialEntries(mat) {
  if (!mat) return;
  if (!Array.isArray(mat.receivedEntries) || mat.receivedEntries.length === 0) {
    const qty = parseFloat(mat.received) || 0;
    mat.receivedEntries = [
      {
        id: 'rec-' + Date.now(),
        date: mat.date || '2022-07-02',
        qty: qty,
        note: ''
      }
    ];
  }
}

// Render dynamic Zinc Raw Material Received Cards in Editor
function renderMaterialReceivedEditor() {
  ensureMaterialEntries(currentInvoice.material);
  const container = document.getElementById('mat-received-entries-container');
  if (!container) return;

  container.innerHTML = '';
  const entries = currentInvoice.material.receivedEntries;

  const countBadge = document.getElementById('mat-rec-count-badge');
  if (countBadge) {
    countBadge.textContent = `${entries.length} ${entries.length === 1 ? 'Entry' : 'Entries'}`;
  }

  entries.forEach((entry, idx) => {
    const card = document.createElement('div');
    card.className = 'mat-rec-card';
    card.dataset.id = entry.id;
    card.innerHTML = `
      <div class="mat-rec-header">
        <span class="mat-rec-num">Entry #${idx + 1}</span>
        ${entries.length > 1 ? `<button type="button" class="btn-del-mat-entry" data-id="${entry.id}" title="Remove this entry">✕ Remove</button>` : ''}
      </div>
      <div class="form-row">
        <div class="form-group flex-1">
          <label>Receipt Date *</label>
          <input type="date" class="form-control mat-entry-date" value="${entry.date || ''}">
        </div>
        <div class="form-group flex-1">
          <label>Received Qty (Kg.) *</label>
          <input type="number" step="0.001" class="form-control mat-entry-qty font-bold" value="${entry.qty !== undefined ? entry.qty : ''}" placeholder="0.000">
        </div>
      </div>
      <div class="form-group mt-1">
        <label>Challan / Slip No. / Remarks (Optional)</label>
        <input type="text" class="form-control mat-entry-note" value="${entry.note || ''}" placeholder="e.g. Challan #104 or Lot 1">
      </div>
    `;
    container.appendChild(card);
  });

  // Attach input listeners
  container.querySelectorAll('.mat-entry-date').forEach((input, idx) => {
    input.addEventListener('change', (e) => {
      currentInvoice.material.receivedEntries[idx].date = e.target.value;
      renderInvoiceSheet();
    });
  });

  container.querySelectorAll('.mat-entry-qty').forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      currentInvoice.material.receivedEntries[idx].qty = parseFloat(e.target.value) || 0;
      renderInvoiceSheet();
    });
  });

  container.querySelectorAll('.mat-entry-note').forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      currentInvoice.material.receivedEntries[idx].note = e.target.value;
      renderInvoiceSheet();
    });
  });

  container.querySelectorAll('.btn-del-mat-entry').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      currentInvoice.material.receivedEntries = currentInvoice.material.receivedEntries.filter(item => item.id !== id);
      renderMaterialReceivedEditor();
      renderInvoiceSheet();
      showToast('Received entry removed', 'toast-info');
    });
  });
}

// =============================================================================
// 9. Signature Pad (HTML5 Canvas with Pointer Events & Multi-Mode)
// =============================================================================
let signatureCtx = null;
let signatureCanvas = null;

function initSignaturePad() {
  const canvas = document.getElementById('signature-pad');
  if (!canvas) return;

  signatureCanvas = canvas;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  signatureCtx = ctx;

  let isDrawing = false;
  let currentColor = '#1d4ed8'; // Navy Blue default ink
  let currentLineWidth = 3.5;

  // Fixed high-resolution canvas space
  canvas.width = 600;
  canvas.height = 200;

  function updateContextStyle() {
    ctx.lineWidth = currentLineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentColor;
  }
  updateContextStyle();

  function getCanvasPoint(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width ? (canvas.width / rect.width) : 1;
    const scaleY = rect.height ? (canvas.height / rect.height) : 1;
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function startDraw(e) {
    isDrawing = true;
    updateContextStyle();
    const pt = getCanvasPoint(e);
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    const hint = document.getElementById('signature-hint');
    if (hint) hint.style.display = 'none';
    const status = document.getElementById('sig-status-badge');
    if (status) status.textContent = 'Drawing...';
  }

  function moveDraw(e) {
    if (!isDrawing) return;
    const pt = getCanvasPoint(e);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  }

  function endDraw() {
    if (!isDrawing) return;
    isDrawing = false;
    const dataUrl = canvas.toDataURL('image/png');
    currentInvoice.signature.dataUrl = dataUrl;
    currentInvoice.signature.show = true;
    const toggleSig = document.getElementById('toggle-signature');
    if (toggleSig) toggleSig.checked = true;
    const status = document.getElementById('sig-status-badge');
    if (status) status.textContent = '✓ Signature synced to bill';
    renderInvoiceSheet();
  }

  // Pointer events (modern web standard for mouse, touch & stylus)
  canvas.addEventListener('pointerdown', (e) => {
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    startDraw(e);
  });
  canvas.addEventListener('pointermove', moveDraw);
  canvas.addEventListener('pointerup', (e) => {
    try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
    endDraw();
  });
  canvas.addEventListener('pointercancel', (e) => {
    try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
    endDraw();
  });

  // Pen color picker
  document.querySelectorAll('.pen-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      document.querySelectorAll('.pen-dot').forEach(d => d.classList.remove('active'));
      e.target.classList.add('active');
      currentColor = e.target.dataset.color || '#1d4ed8';
      updateContextStyle();
    });
  });

  // Clear signature button
  const btnClear = document.getElementById('btn-clear-sig');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      currentInvoice.signature.dataUrl = '';
      currentInvoice.signature.show = false;
      const toggleSig = document.getElementById('toggle-signature');
      if (toggleSig) toggleSig.checked = false;
      const hint = document.getElementById('signature-hint');
      if (hint) hint.style.display = 'block';
      const status = document.getElementById('sig-status-badge');
      if (status) status.textContent = 'Canvas cleared';
      renderInvoiceSheet();
    });
  }

  // Signature file upload
  const fileInput = document.getElementById('input-sig-file');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.85;
            const nw = img.width * scale;
            const nh = img.height * scale;
            const nx = (canvas.width - nw) / 2;
            const ny = (canvas.height - nh) / 2;
            ctx.drawImage(img, nx, ny, nw, nh);
            currentInvoice.signature.dataUrl = event.target.result;
            currentInvoice.signature.show = true;
            const toggleSig = document.getElementById('toggle-signature');
            if (toggleSig) toggleSig.checked = true;
            const hint = document.getElementById('signature-hint');
            if (hint) hint.style.display = 'none';
            const status = document.getElementById('sig-status-badge');
            if (status) status.textContent = '✓ Image loaded';
            renderInvoiceSheet();
            showToast('Signature image uploaded and applied!', 'toast-success');
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Signature mode tabs (Draw / Type / Upload)
  document.querySelectorAll('.btn-sig-mode').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mode = e.currentTarget.dataset.sigMode;
      if (!mode) return;
      document.querySelectorAll('.btn-sig-mode').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');

      document.querySelectorAll('.sig-panel').forEach(p => p.style.display = 'none');
      const targetPanel = document.getElementById(`sig-mode-${mode}-panel`);
      if (targetPanel) targetPanel.style.display = 'block';

      if (mode === 'draw') {
        refreshSignatureCanvas();
      }
    });
  });

  // Typed Signature Apply
  const btnApplyType = document.getElementById('btn-apply-typed-sign');
  const inputType = document.getElementById('input-type-sign');
  const typePreview = document.getElementById('type-sign-preview-text');

  if (inputType && typePreview) {
    inputType.addEventListener('input', (e) => {
      typePreview.textContent = e.target.value || 'S. K. Enterprises';
    });
  }

  if (btnApplyType && inputType) {
    btnApplyType.addEventListener('click', () => {
      const name = (inputType.value || 'S. K. Enterprises').trim();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'italic 700 52px "Caveat", "Dancing Script", cursive, sans-serif';
      ctx.fillStyle = currentColor || '#1d4ed8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, canvas.width / 2, canvas.height / 2 - 6);

      // Add calligraphic underline flourish
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = currentColor || '#1d4ed8';
      const textWidth = ctx.measureText(name).width;
      const startX = Math.max(20, (canvas.width - textWidth) / 2 - 10);
      const endX = Math.min(canvas.width - 20, (canvas.width + textWidth) / 2 + 25);
      const startY = canvas.height / 2 + 26;
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(canvas.width / 2, startY + 12, endX, startY - 4);
      ctx.stroke();

      currentInvoice.signature.dataUrl = canvas.toDataURL('image/png');
      currentInvoice.signature.show = true;
      const toggleSig = document.getElementById('toggle-signature');
      if (toggleSig) toggleSig.checked = true;
      const hint = document.getElementById('signature-hint');
      if (hint) hint.style.display = 'none';
      const status = document.getElementById('sig-status-badge');
      if (status) status.textContent = '✓ Typed signature applied';
      renderInvoiceSheet();
      showToast('Typed digital signature applied!', 'toast-success');
    });
  }

  // S.K. Enterprises Preset Partner Signature button
  const btnPreset = document.getElementById('btn-sig-preset');
  if (btnPreset) {
    btnPreset.addEventListener('click', () => {
      currentInvoice.signature.dataUrl = DEFAULT_PARTNER_SIGNATURE_DATAURL;
      currentInvoice.signature.show = true;
      const toggleSig = document.getElementById('toggle-signature');
      if (toggleSig) toggleSig.checked = true;
      refreshSignatureCanvas();
      renderInvoiceSheet();
      showToast('Official S K Enterprises Partner signature loaded!', 'toast-success');
    });
  }

  // Initial draw if preset is present
  refreshSignatureCanvas();
}

function refreshSignatureCanvas() {
  if (!signatureCanvas || !signatureCtx) return;
  const hint = document.getElementById('signature-hint');
  const status = document.getElementById('sig-status-badge');

  if (currentInvoice.signature && currentInvoice.signature.dataUrl) {
    const img = new Image();
    img.onload = () => {
      signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
      const scale = Math.min(signatureCanvas.width / img.width, signatureCanvas.height / img.height) * 0.9;
      const nw = img.width * scale;
      const nh = img.height * scale;
      const nx = (signatureCanvas.width - nw) / 2;
      const ny = (signatureCanvas.height - nh) / 2;
      signatureCtx.drawImage(img, nx, ny, nw, nh);
      if (hint) hint.style.display = 'none';
      if (status) status.textContent = '✓ Active signature loaded';
    };
    img.src = currentInvoice.signature.dataUrl;
  } else {
    signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    if (hint) hint.style.display = 'block';
    if (status) status.textContent = 'Ready to draw';
  }
}

// =============================================================================
// 10. Toast Notification System
// =============================================================================
function showToast(message, type = 'toast-info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// =============================================================================
// 11. Event Listeners Setup
// =============================================================================
function setupEventListeners() {
  // Sidebar Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const targetTab = e.currentTarget.dataset.tab;
      e.currentTarget.classList.add('active');
      const targetEl = document.getElementById(targetTab);
      if (targetEl) targetEl.classList.add('active');

      // Refresh signature canvas if switching to signature tab
      if (targetTab === 'tab-sign') {
        refreshSignatureCanvas();
      }
    });
  });

  // Buyer Presets Select
  document.getElementById('select-saved-buyer').addEventListener('change', (e) => {
    if (e.target.value) {
      loadBuyerIntoForm(e.target.value);
    }
  });

  // Save current buyer button
  document.getElementById('btn-save-current-buyer').addEventListener('click', () => {
    saveCurrentBuyerToDirectory();
  });

  // Reset to sample buyer (Sree Corporation)
  document.getElementById('btn-sample-buyer').addEventListener('click', () => {
    currentInvoice.buyer = JSON.parse(JSON.stringify(ORIGINAL_BILL_DATA.buyer));
    populateEditorFields();
    renderInvoiceSheet();
    showToast('Reset to M/s Sree Corporation', 'toast-info');
  });

  // Clear buyer fields
  document.getElementById('btn-clear-buyer').addEventListener('click', () => {
    currentInvoice.buyer = {
      name: '',
      addr1: '',
      addr2: '',
      cityPin: '',
      gstin: '',
      state: 'UTTAR PRADESH',
      stateCode: '09'
    };
    populateEditorFields();
    renderInvoiceSheet();
    showToast('Buyer fields cleared for new customer.', 'toast-info');
  });

  // Buyer Input Listeners
  document.getElementById('buyer-name').addEventListener('input', (e) => {
    currentInvoice.buyer.name = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('buyer-addr1').addEventListener('input', (e) => {
    currentInvoice.buyer.addr1 = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('buyer-addr2').addEventListener('input', (e) => {
    currentInvoice.buyer.addr2 = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('buyer-city-pin').addEventListener('input', (e) => {
    currentInvoice.buyer.cityPin = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('buyer-gstin').addEventListener('input', (e) => {
    const val = e.target.value.toUpperCase();
    currentInvoice.buyer.gstin = val;

    // Auto extract 2-digit state code from GSTIN
    if (val.length >= 2 && /^\d{2}/.test(val)) {
      const code = val.substring(0, 2);
      currentInvoice.buyer.stateCode = code;
      document.getElementById('buyer-state-code').value = code;
      if (code === '09') {
        currentInvoice.buyer.state = 'UTTAR PRADESH';
        document.getElementById('buyer-state').value = 'UTTAR PRADESH';
      }
    }
    renderInvoiceSheet();
  });
  document.getElementById('buyer-state-code').addEventListener('input', (e) => {
    currentInvoice.buyer.stateCode = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('buyer-state').addEventListener('input', (e) => {
    currentInvoice.buyer.state = e.target.value;
    renderInvoiceSheet();
  });

  // Invoice Meta Listeners
  document.getElementById('inv-number').addEventListener('input', (e) => {
    currentInvoice.invoiceNumber = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('inv-date').addEventListener('change', (e) => {
    currentInvoice.invoiceDate = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('inv-copy-type').addEventListener('change', (e) => {
    currentInvoice.copyType = e.target.value;
    renderInvoiceSheet();
  });

  // Consignment Details Listeners
  document.getElementById('cons-transport').addEventListener('input', (e) => {
    currentInvoice.consignment.transport = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('cons-lr-no').addEventListener('input', (e) => {
    currentInvoice.consignment.lrNo = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('cons-veh-no').addEventListener('input', (e) => {
    currentInvoice.consignment.vehNo = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('cons-ewb-no').addEventListener('input', (e) => {
    currentInvoice.consignment.ewbNo = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('cons-place-supply').addEventListener('input', (e) => {
    currentInvoice.consignment.placeOfSupply = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('cons-no-cases').addEventListener('input', (e) => {
    currentInvoice.consignment.noOfCases = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('cons-reverse-charge').addEventListener('change', (e) => {
    currentInvoice.consignment.reverseCharge = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('cons-weight').addEventListener('input', (e) => {
    currentInvoice.consignment.weight = parseFloat(e.target.value) || 0;
    renderInvoiceSheet();
  });
  document.getElementById('cons-freight').addEventListener('input', (e) => {
    currentInvoice.consignment.freight = parseFloat(e.target.value) || 0;
    renderInvoiceSheet();
  });

  // Line Item Presets & Addition
  document.getElementById('btn-add-item').addEventListener('click', () => {
    currentInvoice.items.push({
      id: 'item-' + Date.now(),
      particulars: 'ZINC DIE CASTING CHARGES',
      hsn: '9988',
      qty: 100,
      rate: 40
    });
    renderItemEditorCards();
    renderInvoiceSheet();
    showToast('New line item added', 'toast-info');
  });

  document.querySelectorAll('.btn-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const name = e.target.dataset.name;
      const hsn = e.target.dataset.hsn;
      const rate = parseFloat(e.target.dataset.rate) || 40;
      currentInvoice.items.push({
        id: 'item-' + Date.now(),
        particulars: name,
        hsn: hsn,
        qty: 100,
        rate: rate
      });
      renderItemEditorCards();
      renderInvoiceSheet();
      showToast(`Added: ${name}`, 'toast-success');
    });
  });

  // Tax Setup & Round off Listeners
  document.getElementById('tax-mode').addEventListener('change', (e) => {
    currentInvoice.taxMode = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('auto-detect-tax').addEventListener('change', (e) => {
    currentInvoice.autoDetectTax = e.target.checked;
    renderInvoiceSheet();
  });
  document.getElementById('toggle-roundoff').addEventListener('change', (e) => {
    currentInvoice.autoRoundoff = e.target.checked;
    document.getElementById('custom-roundoff').disabled = e.target.checked;
    renderInvoiceSheet();
  });
  document.getElementById('custom-roundoff').addEventListener('input', (e) => {
    currentInvoice.customRoundoff = parseFloat(e.target.value) || 0;
    renderInvoiceSheet();
  });
  document.getElementById('words-override-input').addEventListener('input', (e) => {
    currentInvoice.wordsOverride = e.target.value;
    renderInvoiceSheet();
  });

  // Material Ledger Listeners
  document.getElementById('toggle-material-table').addEventListener('change', (e) => {
    currentInvoice.material.show = e.target.checked;
    renderInvoiceSheet();
  });
  document.getElementById('mat-date').addEventListener('change', (e) => {
    currentInvoice.material.date = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('mat-opening').addEventListener('input', (e) => {
    currentInvoice.material.opening = parseFloat(e.target.value) || 0;
    renderInvoiceSheet();
  });

  // Add Zinc Raw Material Received Entry Button Listener
  const btnAddMatRec = document.getElementById('btn-add-mat-received');
  if (btnAddMatRec) {
    btnAddMatRec.addEventListener('click', () => {
      ensureMaterialEntries(currentInvoice.material);
      const defaultDate = currentInvoice.invoiceDate || new Date().toISOString().split('T')[0];
      currentInvoice.material.receivedEntries.push({
        id: 'rec-' + Date.now(),
        date: defaultDate,
        qty: 0.000,
        note: ''
      });
      renderMaterialReceivedEditor();
      renderInvoiceSheet();
      showToast('Added Zinc Raw Material Received entry', 'toast-success');
    });
  }
  document.getElementById('mat-delivered').addEventListener('input', (e) => {
    currentInvoice.material.delivered = parseFloat(e.target.value) || 0;
    renderInvoiceSheet();
  });
  document.getElementById('mat-loss').addEventListener('input', (e) => {
    currentInvoice.material.loss = parseFloat(e.target.value) || 0;
    renderInvoiceSheet();
  });
  document.getElementById('mat-returned').addEventListener('input', (e) => {
    currentInvoice.material.returned = parseFloat(e.target.value) || 0;
    renderInvoiceSheet();
  });

  // Sync Qty button in Material Ledger
  document.getElementById('btn-sync-qty').addEventListener('click', () => {
    const totalItemQty = currentInvoice.items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0);
    currentInvoice.material.delivered = totalItemQty;
    document.getElementById('mat-delivered').value = totalItemQty;
    renderInvoiceSheet();
    showToast(`Synced delivered casting: ${totalItemQty} Kg`, 'toast-info');
  });

  // Calculate 5% burning loss button
  document.getElementById('btn-calc-5percent-loss').addEventListener('click', () => {
    const delivered = parseFloat(currentInvoice.material.delivered) || 0;
    const loss5 = Number((delivered * 0.05).toFixed(3));
    currentInvoice.material.loss = loss5;
    document.getElementById('mat-loss').value = loss5;
    renderInvoiceSheet();
    showToast(`Calculated 5% melting loss: ${loss5} Kg`, 'toast-info');
  });

  // Stamp & Sign Listeners
  document.getElementById('toggle-stamp').addEventListener('change', (e) => {
    currentInvoice.stamp.show = e.target.checked;
    renderInvoiceSheet();
  });
  document.getElementById('stamp-color').addEventListener('change', (e) => {
    currentInvoice.stamp.color = e.target.value;
    renderInvoiceSheet();
  });
  document.getElementById('stamp-rotation').addEventListener('input', (e) => {
    currentInvoice.stamp.rotation = parseInt(e.target.value, 10);
    renderInvoiceSheet();
  });
  document.getElementById('toggle-signature').addEventListener('change', (e) => {
    currentInvoice.signature.show = e.target.checked;
    renderInvoiceSheet();
  });
  document.getElementById('signatory-label').addEventListener('input', (e) => {
    currentInvoice.signature.caption = e.target.value;
    renderInvoiceSheet();
  });

  // Toggle seller info card expansion
  document.getElementById('toggle-seller-info').addEventListener('click', () => {
    const card = document.getElementById('seller-info-card');
    card.classList.toggle('collapsed-group');
  });

  // Header Actions
  document.getElementById('btn-load-sample').addEventListener('click', () => {
    currentInvoice = JSON.parse(JSON.stringify(ORIGINAL_BILL_DATA));
    populateEditorFields();
    renderInvoiceSheet();
    showToast('Loaded original S K ENTERPRISES bill (Invoice #001)', 'toast-success');
  });

  document.getElementById('btn-new-bill').addEventListener('click', () => {
    // Generate next invoice number
    let nextNum = '002';
    const currentNum = parseInt(currentInvoice.invoiceNumber, 10);
    if (!isNaN(currentNum)) {
      nextNum = String(currentNum + 1).padStart(3, '0');
    }

    currentInvoice.invoiceNumber = nextNum;
    currentInvoice.invoiceDate = new Date().toISOString().split('T')[0];
    populateEditorFields();
    renderInvoiceSheet();
    showToast(`Ready for New Bill #${nextNum}`, 'toast-success');
  });

  document.getElementById('btn-save-bill').addEventListener('click', () => {
    saveCurrentInvoice();
  });

  document.getElementById('btn-history').addEventListener('click', () => {
    updateSavedInvoicesModal();
    document.getElementById('modal-saved-invoices').showModal();
  });

  document.getElementById('btn-buyer-directory').addEventListener('click', () => {
    updateBuyerDirectoryModal();
    document.getElementById('modal-buyer-directory').showModal();
  });

  document.getElementById('btn-add-new-buyer-dialog').addEventListener('click', () => {
    document.getElementById('modal-buyer-directory').close();
    // Switch to buyer tab
    document.querySelector('.tab-btn[data-tab="tab-buyer"]').click();
    document.getElementById('buyer-name').focus();
    showToast('Enter new buyer details in the editor tab.', 'toast-info');
  });

  // Modal Closers
  document.getElementById('btn-close-saved-modal').addEventListener('click', () => {
    document.getElementById('modal-saved-invoices').close();
  });
  document.getElementById('btn-close-saved-modal-2').addEventListener('click', () => {
    document.getElementById('modal-saved-invoices').close();
  });
  document.getElementById('btn-close-buyer-modal').addEventListener('click', () => {
    document.getElementById('modal-buyer-directory').close();
  });
  document.getElementById('btn-close-buyer-modal-2').addEventListener('click', () => {
    document.getElementById('modal-buyer-directory').close();
  });

  // Search in Saved Invoices Modal
  document.getElementById('input-search-saved').addEventListener('input', (e) => {
    updateSavedInvoicesModal(e.target.value);
  });

  // Print buttons
  document.getElementById('btn-print').addEventListener('click', () => {
    window.print();
  });
  document.getElementById('btn-quick-print').addEventListener('click', () => {
    window.print();
  });

  // Zoom controls
  let currentZoom = 1;
  const sheet = document.getElementById('invoice-sheet');
  const zoomDisplay = document.getElementById('zoom-value');

  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    if (currentZoom < 1.4) {
      currentZoom += 0.1;
      sheet.style.transform = `scale(${currentZoom})`;
      zoomDisplay.textContent = Math.round(currentZoom * 100) + '%';
    }
  });

  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    if (currentZoom > 0.5) {
      currentZoom -= 0.1;
      sheet.style.transform = `scale(${currentZoom})`;
      zoomDisplay.textContent = Math.round(currentZoom * 100) + '%';
    }
  });

  document.getElementById('btn-zoom-reset').addEventListener('click', () => {
    currentZoom = 1;
    sheet.style.transform = 'scale(1)';
    zoomDisplay.textContent = '100%';
  });

  // Theme Toggle (Dark/Light workspace)
  document.getElementById('btn-theme-toggle').addEventListener('click', () => {
    const isDark = document.body.classList.toggle('theme-dark');
    document.getElementById('theme-icon').textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('sk_theme', isDark ? 'dark' : 'light');
  });

  // Export All as PDFs (ZIP) buttons
  const btnExportZipTop = document.getElementById('btn-export-zip-top');
  if (btnExportZipTop) {
    btnExportZipTop.addEventListener('click', () => {
      exportAllInvoicesToZip();
    });
  }

  const btnExportAllZipPdf = document.getElementById('btn-export-all-zip-pdf');
  if (btnExportAllZipPdf) {
    btnExportAllZipPdf.addEventListener('click', () => {
      exportAllInvoicesToZip();
    });
  }

  const btnCloseProgressModal = document.getElementById('btn-close-progress-modal');
  if (btnCloseProgressModal) {
    btnCloseProgressModal.addEventListener('click', () => {
      document.getElementById('modal-export-progress').close();
    });
  }

  // Export JSON
  document.getElementById('btn-export-all-json').addEventListener('click', () => {
    const data = {
      seller: FIXED_SELLER,
      invoices: getSavedInvoices(),
      buyers: getSavedBuyers(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sk-enterprises-invoices-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Invoices backup exported as JSON', 'toast-success');
  });

  // Import JSON
  document.getElementById('input-import-json').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported.invoices && Array.isArray(imported.invoices)) {
            localStorage.setItem('sk_saved_invoices', JSON.stringify(imported.invoices));
          }
          if (imported.buyers && Array.isArray(imported.buyers)) {
            localStorage.setItem('sk_saved_buyers', JSON.stringify(imported.buyers));
          }
          populateSavedBuyerDropdown();
          updateSavedInvoiceCount();
          updateSavedInvoicesModal();
          showToast('Invoices backup imported successfully!', 'toast-success');
        } catch (err) {
          showToast('Failed to parse backup JSON file.', 'toast-error');
        }
      };
      reader.readAsText(file);
    }
  });
}

// =============================================================================
// 12. Application Initialization
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Restore saved theme
  const savedTheme = localStorage.getItem('sk_theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('theme-dark');
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = '☀️';
  }

  // Initialize Buyer Directory default if empty
  if (!localStorage.getItem('sk_saved_buyers')) {
    localStorage.setItem('sk_saved_buyers', JSON.stringify(DEFAULT_BUYERS));
  }

  // Initialize Canvas
  initSignaturePad();

  // Populate editor with initial bill state and render sheet
  populateEditorFields();
  renderInvoiceSheet();

  // Attach all user interactions
  setupEventListeners();

  console.log('S K ENTERPRISES Billing Software successfully initialized.');
});
