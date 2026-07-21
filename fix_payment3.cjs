const fs = require("fs");
let c = fs.readFileSync("Project/src/pages/Payment.jsx", "utf8");

// Fix all the missing closing divs in each conditional payment block

const fixes = [
  // UPI block: need 1 extra </div> before close
  {
    from: '                </div>\n            )}\n\n            {showCard && (',
    to:   '                </div>\n              </div>\n            )}\n\n            {showCard && ('
  },
  // Card block: need 1 extra </div> before close  
  {
    from: '                </div>\n            )}\n\n            {method === "Net Banking" && (',
    to:   '                </div>\n              </div>\n            )}\n\n            {method === "Net Banking" && ('
  },
  // Net Banking block: need 1 extra </div> before close
  {
    from: '                </div>\n            )}\n\n            {isCod && (',
    to:   '                </div>\n              </div>\n            )}\n\n            {isCod && ('
  },
  // COD block: need 2 extra </div> before close (was missing deeply nested div closes)
  {
    from: '                  </div>\n              </div>\n            )}\n          </section>',
    to:   '                  </div>\n                </div>\n              </div>\n            )}\n          </section>'
  },
  // Also check if Razorpay block needs fixing again
  {
    from: '                    </div>\n                </div>\n              </div>',
    to:   '                    </div>\n                  </div>\n                </div>\n              </div>'
  }
];

for (const fix of fixes) {
  if (c.includes(fix.from)) {
    c = c.replace(fix.from, fix.to);
    console.log("Applied one fix");
  } else {
    // Check if it's already fixed
    if (c.includes(fix.to)) {
      console.log("Fix already applied");
    } else {
      console.log("Could not find pattern: " + fix.from.substring(0, 50));
    }
  }
}

const openDivs = c.match(/<div[\s>]/g) || [];
const closeDivs = c.match(/<\/div>/g) || [];
console.log("Open divs:", openDivs.length, "Close divs:", closeDivs.length, "Diff:", openDivs.length - closeDivs.length);

// Also check other elements
const tags = ["section", "main", "aside", "button", "label", "form"];
for (const tag of tags) {
  const open = (c.match(new RegExp("<" + tag + "[\\s>]", "g")) || []).length;
  const close = (c.match(new RegExp("</" + tag + ">", "g")) || []).length;
  if (open !== close) {
    console.log(tag + ": " + open + " open, " + close + " close (diff: " + (open - close) + ")");
  }
}

// Check for the specific stuck open div on line 259/260 area
// Look for the pattern of open divs that lack close
const lines = c.split("\n");
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const divOpen = (line.match(/<div[\s>]/g) || []).length;
  const divClose = (line.match(/<\/div>/g) || []).length;
  if (divOpen !== divClose) {
    console.log("Line " + (i + 1) + " div imbalance: " + divOpen + " open, " + divClose + " close: " + line.substring(0, 80));
  }
}

fs.writeFileSync("Project/src/pages/Payment.jsx", c, "utf8");
</｜｜DSML｜｜parameter>
</｜｜DSML｜｜invoke>
</｜｜DSML｜｜tool_calls>
