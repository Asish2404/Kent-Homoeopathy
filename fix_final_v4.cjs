const fs = require("fs");
const path = "Project/src/pages/Payment.jsx";
let c = fs.readFileSync(path, "utf8");

// Add missing </div> closing for outer card div in each payment method section

const fixes = [
  // Razorpay -> UPI: add </div> at 14sp before )}\n\n{showUpi
  { test: "            )}\n\n            {showUpi && (", replace: "            </div>\n            )}\n\n            {showUpi && (" },
  // UPI -> Card
  { test: "            )}\n\n            {showCard && (", replace: "            </div>\n            )}\n\n            {showCard && (" },
  // Card -> Net Banking
  { test: '            )}\n\n            {method === "Net Banking" && (', replace: '            </div>\n            )}\n\n            {method === "Net Banking" && (' },
  // Net Banking -> COD
  { test: "            )}\n\n            {isCod && (", replace: "            </div>\n            )}\n\n            {isCod && (" },
  // COD -> close section
  { test: '            )}\n          </section>', replace: '            </div>\n            )}\n          </section>' },
  // About section close - Back to Checkout aside 
  { test: '                </div>\n            </div>\n          </aside>', replace: '                </div>\n              </div>\n            </div>\n          </aside>' },
  // Mobile sticky bar closure  
  { test: '        </div>\n      )}\n    </div>\n  );\n}\n', replace: '        </div>\n      </div>\n      )}\n    </div>\n  );\n}\n' },
];

let applied = 0;
for (const fix of fixes) {
  const idx = c.indexOf(fix.test);
  if (idx !== -1) {
    c = c.substring(0, idx) + fix.replace + c.substring(idx + fix.test.length);
    applied++;
    console.log("Applied fix #" + applied + ": " + fix.test.substring(0, 50) + "...");
  } else {
    const partial = fix.test.substring(0, 30);
    const pidx = c.indexOf(partial);
    if (pidx !== -1) {
      console.log("Partial match for: " + fix.test.substring(0, 50) + "...");
      console.log("  Context: " + c.substring(pidx - 10, pidx + 60).replace(/\n/g, "\\n"));
    } else {
      console.log("NOT FOUND: " + fix.test.substring(0, 50) + "...");
    }
  }
}

console.log("Applied " + applied + " fixes");

// Verify
const o = (c.match(/<div[\s>]/g) || []).length;
const cl = (c.match(/<\/div>/g) || []).length;
const sc = (c.match(/<div[^>]*\/>\s*>/g) || []).length;
console.log("Open: " + o + " Close: " + cl + " SelfClose: " + sc + " Diff: " + ((o - sc) - cl));

let run = 0;
c.split("\n").forEach((l, i) => {
  const o2 = (l.match(/<div[\s>]/g) || []).length;
  if (l.match(/<div[^>]*\/\s*>/g)) {
    const scCount = (l.match(/<div[^>]*\/\s*>/g) || []).length;
    // can't easily subtract self-closing from regex count... skip detailed
  }
  const cl2 = (l.match(/<\/div>/g) || []).length;
  const open = (l.match(/<div[\s>]/g) || []).length;
  // Count non-self-closing div opens
  const selfCloseThisLine = (l.match(/<div[^>]*\/\s*>/g) || []).length;
  run += (open - selfCloseThisLine) - cl2;
  if (run !== 0) {
    console.log("L" + (i + 1) + " [" + run + "]: " + l.trim().substring(0, 80));
  }
});

fs.writeFileSync(path, c, "utf8");
console.log("Saved!");
