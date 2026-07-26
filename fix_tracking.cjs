const fs = require('fs');
const path = 'c:/Users/Asish/OneDrive/Desktop/Kent web/Project/src/pages/OrderTracking.jsx';
let content = fs.readFileSync(path, 'utf8');

// Fix 1: loading section - add missing closing tag
content = content.replace(
  '<div className="h-48 bg-neutral-200 rounded-3xl" />\n          </div>\n</div>\n      </div>\n    );',
  '<div className="h-48 bg-neutral-200 rounded-3xl" />\n          </div>\n        </div>\n      </div>\n    );'
);

// Fix 2: error section - missing closing div
content = content.replace(
  '            Back to Orders\n          </button>\n        </div>\n    );',
  '            Back to Orders\n          </button>\n        </div>\n      </div>\n    );'
);

// Fix 3: progress section - progress div not closed before grid
content = content.replace(
  '<div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: progress }} />\n            </div>\n\n          <div className="mt-6 grid',
  '<div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: progress }} />\n            </div>\n          </div>\n\n          <div className="mt-6 grid'
);

// Fix 4: grid section - missing closing div
content = content.replace(
  '              </span>\n            </div>\n        </div>',
  '              </span>\n            </div>\n          </div>\n        </div>'
);

// Fix 5: items map - missing closing div for map item
content = content.replace(
  '                  </div>\n              );\n            })}',
  '                  </div>\n                </div>\n              );\n            })}'
);

// Fix 6: shippingAddress section
content = content.replace(
  '            </div>\n        )}',
  '            </div>\n          </div>\n        )}'
);

// Fix 7: final closing - add missing closing tags
content = content.replace(
  '\n      </div>\n  );\n}',
  '\n        </div>\n      </div>\n    </div>\n  );\n}'
);

fs.writeFileSync(path, content, 'utf8');
console.log('File fixed successfully');
