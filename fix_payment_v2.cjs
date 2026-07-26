const fs = require('fs');
const path = 'c:/Users/Asish/OneDrive/Desktop/Kent web/Project/src/pages/Payment.jsx';
let c = fs.readFileSync(path, 'utf8');

// Check and report what line endings are used
const hasCRLF = c.includes('\r\n');
console.log('Line endings: ' + (hasCRLF ? 'CRLF' : 'LF'));

// Search patterns
function search(pattern, label) {
  const idx = c.indexOf(pattern);
  if (idx >= 0) {
    console.log('Found ' + label + ' at position ' + idx);
    console.log('Context: [' + c.substring(idx, idx + 100).replace(/\r/g, '\\r').replace(/\n/g, '\\n') + ']');
    return true;
  }
  return false;
}

// Search for key patterns
search('import { useEffect, useMemo, useState, useCallback } from "react"', 'import line');
search('const { data } = await api.post("/orders/place"', 'place order call');
search('navigate("/order-success", { replace: true });', 'navigate success');
search('navigate("/order-success", { state:', 'navigate with state');
search('api.post("/payment/verify"', 'verify call');
search('localStorage.removeItem("kent_cart")', 'kent_cart removal');
