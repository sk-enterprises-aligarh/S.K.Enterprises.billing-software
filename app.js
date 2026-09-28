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

  // Details of Material (Zinc Job Work Ledger)
  material: {
    show: true,
    date: '2022-07-02',
    opening: 0.000,
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
    show: false,
    dataUrl: '',
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
  const matOpening = parseFloat(currentInvoice.material.opening) || 0;
  const matReceived = parseFloat(currentInvoice.material.received) || 0;
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
    document.getElementById('view-mat-received').textContent = formatQty(totals.material.received);
    document.getElementById('view-mat-total').textContent = formatQty(totals.material.total);
    document.getElementById('view-mat-delivered').textContent = formatQty(totals.material.delivered);
    document.getElementById('view-mat-loss').textContent = formatQty(totals.material.loss);
    document.getElementById('view-mat-returned').textContent = totals.material.returned > 0 ? formatQty(totals.material.returned) : '';
    document.getElementById('view-mat-balance').textContent = formatQty(totals.material.balance);

    // Sidebar indicators
    document.getElementById('mat-total').value = totals.material.total.toFixed(3);
    document.getElementById('mat-balance').value = totals.material.balance.toFixed(3);
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
  document.getElementById('mat-received').value = currentInvoice.material.received;
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
// 9. Signature Pad (HTML5 Canvas)
// =============================================================================
function initSignaturePad() {
  const canvas = document.getElementById('signature-pad');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let currentColor = '#1e293b';

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentColor;
  }
  resizeCanvas();

  function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    document.getElementById('signature-hint').style.display = 'none';
  }

  function draw(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDrawing() {
    if (!isDrawing) return;
    isDrawing = false;
    currentInvoice.signature.dataUrl = canvas.toDataURL('image/png');
    currentInvoice.signature.show = true;
    document.getElementById('toggle-signature').checked = true;
    renderInvoiceSheet();
  }

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDrawing);

  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawing(e); }, { passive: false });
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); }, { passive: false });
  window.addEventListener('touchend', stopDrawing);

  // Pen color picker
  document.querySelectorAll('.pen-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      document.querySelectorAll('.pen-dot').forEach(d => d.classList.remove('active'));
      e.target.classList.add('active');
      currentColor = e.target.dataset.color;
      ctx.strokeStyle = currentColor;
    });
  });

  // Clear signature button
  document.getElementById('btn-clear-sig').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentInvoice.signature.dataUrl = '';
    currentInvoice.signature.show = false;
    document.getElementById('toggle-signature').checked = false;
    document.getElementById('signature-hint').style.display = 'block';
    renderInvoiceSheet();
  });

  // Signature file upload
  document.getElementById('input-sig-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        currentInvoice.signature.dataUrl = event.target.result;
        currentInvoice.signature.show = true;
        document.getElementById('toggle-signature').checked = true;
        renderInvoiceSheet();
        showToast('Signature image uploaded!', 'toast-success');
      };
      reader.readAsDataURL(file);
    }
  });
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
      document.getElementById(targetTab).classList.add('active');
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
  document.getElementById('mat-received').addEventListener('input', (e) => {
    currentInvoice.material.received = parseFloat(e.target.value) || 0;
    renderInvoiceSheet();
  });
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
