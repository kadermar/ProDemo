import fs from 'fs';

// Read the product data file
let content = fs.readFileSync('./server/data/all-product-sheets.ts', 'utf8');

// Find and fix all insulation-related products
const insulation_keywords = [
  'INS_', 'INS ', 'Insul', 'SecurShield', 'R-Tech', 'DensDeck', 
  'InsulBase', 'InsulFast', 'Insulation'
];

// Split into lines for processing
let lines = content.split('\n');
let inProduct = false;
let currentProduct = [];
let updatedLines = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  if (line.includes('"system":') && line.includes('"Other"')) {
    // Check if this is an insulation product by looking at surrounding context
    let contextLines = lines.slice(Math.max(0, i-20), i+20).join('\n');
    
    if (insulation_keywords.some(keyword => contextLines.includes(keyword))) {
      console.log(`Found insulation product at line ${i+1}, changing system from Other to Insulation`);
      line = line.replace('"system": "Other"', '"system": "Insulation"');
    }
  }
  
  if (line.includes('"category":') && line.includes('"Other"')) {
    // Check if this is an insulation product
    let contextLines = lines.slice(Math.max(0, i-20), i+20).join('\n');
    
    if (insulation_keywords.some(keyword => contextLines.includes(keyword))) {
      console.log(`Found insulation product at line ${i+1}, changing category from Other to Insulation`);
      line = line.replace('"category": "Other"', '"category": "Insulation"');
    }
  }
  
  if (line.includes('"thickness": "N/A"')) {
    // Check if this is an insulation product
    let contextLines = lines.slice(Math.max(0, i-20), i+20).join('\n');
    
    if (insulation_keywords.some(keyword => contextLines.includes(keyword))) {
      console.log(`Found insulation product at line ${i+1}, updating thickness`);
      line = line.replace('"thickness": "N/A"', '"thickness": "Multiple thicknesses available"');
    }
  }
  
  // Update applications for insulation products
  if (line.includes('"applications": ["Other roofing systems","Other applications"]')) {
    let contextLines = lines.slice(Math.max(0, i-20), i+20).join('\n');
    
    if (insulation_keywords.some(keyword => contextLines.includes(keyword))) {
      console.log(`Found insulation product at line ${i+1}, updating applications`);
      line = line.replace('"applications": ["Other roofing systems","Other applications"]', '"applications": ["Insulation systems","Roof insulation applications"]');
    }
  }
  
  // Update features for insulation products  
  if (line.includes('"features": ["Other technology","Professional grade","Industry standard"]')) {
    let contextLines = lines.slice(Math.max(0, i-20), i+20).join('\n');
    
    if (insulation_keywords.some(keyword => contextLines.includes(keyword))) {
      console.log(`Found insulation product at line ${i+1}, updating features`);
      line = line.replace('"features": ["Other technology","Professional grade","Industry standard"]', '"features": ["Insulation technology","Professional grade","Industry standard"]');
    }
  }
  
  updatedLines.push(line);
}

// Write the updated content back to file
fs.writeFileSync('./server/data/all-product-sheets.ts', updatedLines.join('\n'));
console.log('Successfully updated insulation products!');