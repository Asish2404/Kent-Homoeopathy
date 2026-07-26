const fs = require('fs');
const path = 'c:/Users/Asish/OneDrive/Desktop/Kent web/Project/src/pages/OrderSuccess.jsx';
let c = fs.readFileSync(path, 'utf8');

// Try patterns with different line endings
const patterns = [
  '    return () => clearInterval(id);\r\n  }, []);',
  '    return () => clearInterval(id);\n  }, []);'
];

const flagInsertions = [
  '    return () => clearInterval(id);\r\n  }, []);\r\n\r\n  // Signal Profile page to refresh orders when user visits it\r\n  useEffect(() => {\r\n    localStorage.setItem("kent_order_placed", "true");\r\n  }, []);',
  '    return () => clearInterval(id);\n  }, []);\n\n  // Signal Profile page to refresh orders when user visits it\n  useEffect(() => {\n    localStorage.setItem("kent_order_placed", "true");\n  }, []);'
];

let found = false;
for (let i = 0; i < patterns.length; i++) {
  if (c.includes(patterns[i])) {
    c = c.replace(patterns[i], flagInsertions[i]);
    fs.writeFileSync(path, c, 'utf8');
    console.log('Added order placed flag using pattern ' + i);
    found = true;
    break;
  }
}

if (!found) {
  // Try without line ending sensitivity - replace the lines directly
  const lines = c.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('clearInterval')) {
      console.log('Found clearInterval at line ' + i + ': ' + lines[i].trim());
      // The flag should go after the closing }, []); - find that
      for (let j = i; j < Math.min(i + 3, lines.length); j++) {
        if (lines[j].includes('}, []);') || lines[j].includes('}, []);')) {
          // Insert after this line
          const insert = [
            '',
            '  // Signal Profile page to refresh orders when user visits it',
            '  useEffect(() => {',
            '    localStorage.setItem("kent_order_placed", "true");',
            '  }, []);'
          ];
          // Determine line ending
          const eol = c.includes('\r\n') ? '\r\n' : '\n';
          lines.splice(j + 1, 0, ...insert);
          c = lines.join(eol);
          fs.writeFileSync(path, c, 'utf8');
          console.log('Added flag after line ' + j);
          found = true;
          break;
        }
      }
      break;
    }
  }
}

if (!found) {
  console.log('Could not find insertion point');
}
