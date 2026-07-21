const fs = require("fs");
const path = "Project/src/pages/Payment.jsx";
let c = fs.readFileSync(path, "utf8");

// The key issue: The outer card div in each conditional payment section
// has its closing tag missing before the )} closing the conditional.
// The pattern is:
//   <div className="rounded-2xl border...">  (outer card - 14sp)
//     <div className="px-5 py-5">             (content - 16sp)
//       <div ...>                              (inner - 18sp)
//         ...                                  (innermost - 20sp)
//       </div>                                 (close inner - 18sp)  
//     </div>                                  (close content - 16sp)
//   </div>                                    (close outer card - 14sp)  <-- MISSING
//   )}                                        (close conditional - 12sp)

// 4 sections need fixing: isRazorpay, showUpi, showCard, method === "Net Banking", isCod
// And also: COD closing and aside section

// Strategy: Find "{blockName} && (" then find "                </div>" before the matching ")"

function fixSection(c, blockStart, blockEnd) {
  const startIdx = c.indexOf(blockStart);
  if (startIdx === -1) return c;
  
  // From blockStart, find the last "                </div>" before blockEnd
  const endIdx = c.indexOf(blockEnd, startIdx);
  if (endIdx === -1) return c;
  
  const sectionContent = c.substring(startIdx, endIdx);
  
  // Count opens and closes in this section
  const opens = (sectionContent.match(/<div[\s>]/g) || []).length;
  const selfClosing = (sectionContent.match(/<div[^>]*\/>/g) || []).length;
  const closes = (sectionContent.match(/<\/div>/g) || []).length;
  const diff = (opens - selfClosing) - closes;
  
  if (diff > 0) {
    // Need to add diff number of </div> before the )
    const lastClosePos = c.lastIndexOf("                </div>", endIdx);
    if (lastClosePos !== -1) {
      const beforeClose = c.substring(lastClosePos, endIdx);
      // Only add if the </div> at 14sp isn't already there
      if (!beforeClose.includes("              </div>")) {
        c = c.substring(0, lastClosePos) + 
            "              </div>\n" + 
            c.substring(lastClosePos);
        console.log("Fixed section: " + blockStart.substring(0, 30) + "... added </div> at 14sp, diff was " + diff);
      } else {
        console.log("Section already has closing: " + blockStart.substring(0, 30));
      }
    } else {
      console.log("Could not find '                </div>' before blockEnd for: " + blockStart.substring(0, 30));
    }
  }
  
  return c;
}

// Fix each section
c = fixSection(c, "{isRazorpay && (", ")");
c = fixSection(c, "{showUpi && (", ")");
c = fixSection(c, "{showCard && (", ")");
c = fixSection(c, '{method === "Net Banking" && (', ")");
c = fixSection(c, "{isCod && (", ")");

// Fix the aside section - missing </div> for sticky div
const asideIdx = c.indexOf('<aside className="lg:col-span-5 space-y-5">');
const endAside = c.indexOf("</aside>", asideIdx);
if (asideIdx !== -1 && endAside !== -1) {
  const asideBlock = c.substring(asideIdx, endAside);
  const opens = (asideBlock.match(/<div[\s>]/g) || []).length;
  const selfClosing = (asideBlock.match(/<div[^>]*\/>/g) || []).length;
  const closes = (asideBlock.match(/<\/div>/g) || []).length;
  const diff = (opens - selfClosing) - closes;
  console.log("Aside section diff: " + diff);
}

// Final verification
const o = (c.match(/<div[\s>]/g) || []).length;
const cl = (c.match(/<\/div>/g) || []).length;
const sc = (c.match(/<div[^>]*\/>/g) || []).length;
const diff = (o - sc) - cl;
console.log("Global diff: " + diff + (diff === 0 ? " PERFECT!" : " STILL ISSUES"));

// Find where the mismatch is
let run = 0;
c.split("\n").forEach((l, i) => {
  const openCount = (l.match(/<div[\s>]/g) || []).length;
  const selfCloseCount = (l.match(/<div[^>]*\/>/g) || []).length;
  const closeCount = (l.match(/<\/div>/g) || []).length;
  run += (openCount - selfCloseCount) - closeCount;
  if (run !== 0) {
    console.log("L" + (i + 1) + " [" + run + "]: " + l.trim().substring(0, 80));
  }
});

fs.writeFileSync(path, c, "utf8");
console.log("Saved!");
