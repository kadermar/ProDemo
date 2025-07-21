import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to extract product info from filename
function extractProductInfo(filename) {
  const name = filename.replace('.pdf', '');
  
  // Extract system type (TPO, PVC, EPDM, etc.)
  let system = 'Other';
  if (name.includes('TPO') || name.includes('SureWeld')) {
    system = 'TPO';
  } else if (name.includes('PVC') || name.includes('SureFlex')) {
    system = 'PVC';
  } else if (name.includes('EPDM') || name.includes('SureWhite') || name.includes('SureSeal')) {
    system = 'EPDM';
  }
  
  // Extract category
  let category = 'Other';
  if (name.includes('Membrane') || name.includes('Reinforced')) {
    category = 'Membrane';
  } else if (name.includes('Walkway')) {
    category = 'Walkway';
  } else if (name.includes('Primer')) {
    category = 'Primer';
  } else if (name.includes('Adhesive') || name.includes('Bonding')) {
    category = 'Adhesive';
  } else if (name.includes('Fastener') || name.includes('Fastening')) {
    category = 'Fastener';
  } else if (name.includes('Sealant') || name.includes('Sealer')) {
    category = 'Sealant';
  } else if (name.includes('Corner') || name.includes('Pipe')) {
    category = 'Accessory';
  } else if (name.includes('Insulation')) {
    category = 'Insulation';
  } else if (name.includes('Flashing')) {
    category = 'Flashing';
  }
  
  // Extract manufacturer
  let manufacturer = 'Carlisle';
  if (name.includes('Versico')) {
    manufacturer = 'Versico';
  }
  
  // Extract thickness if mentioned
  let thickness = 'N/A';
  const thicknessMatch = name.match(/(\d+)-?mil/i);
  if (thicknessMatch) {
    thickness = thicknessMatch[0];
  }
  
  // Clean up product name
  let productName = name
    .replace(/^\d+_en_/, '')
    .replace(/_Product_Data_Sheet.*$/, '')
    .replace(/_PDS.*$/, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return {
    system,
    manufacturer,
    category,
    thickness,
    productName,
    filename
  };
}

// Read all PDF files
const extractedDir = path.join(__dirname, 'attached_assets', 'extracted_products');
const files = fs.readdirSync(extractedDir).filter(file => file.endsWith('.pdf'));

console.log(`Found ${files.length} product data sheets`);

// Process all files - create simple array without duplicated references
const allProducts = [];

files.forEach(file => {
  const info = extractProductInfo(file);
  
  const product = {
    system: info.system,
    manufacturer: info.manufacturer,
    membraneType: info.productName,
    thickness: info.thickness,
    buildingHeight: "N/A",
    warranty: "Varies by system",
    windSpeed: "N/A",
    location: "N/A",
    contractor: "N/A",
    projectName: info.productName,
    date: "2025-07-21",
    specifications: {
      category: info.category,
      system: info.system,
      manufacturer: info.manufacturer,
      thickness: info.thickness,
      applications: [`${info.system} roofing systems`, `${info.category} applications`],
      features: [`${info.system} technology`, "Professional grade", "Industry standard"]
    },
    sourceDocument: file
  };
  
  allProducts.push(product);
});

// Count by system for verification
const systemCounts = {
  TPO: allProducts.filter(p => p.system === 'TPO').length,
  PVC: allProducts.filter(p => p.system === 'PVC').length,
  EPDM: allProducts.filter(p => p.system === 'EPDM').length,
  Other: allProducts.filter(p => p.system === 'Other').length
};

console.log('\n=== Product Summary ===');
console.log(`TPO Products: ${systemCounts.TPO}`);
console.log(`PVC Products: ${systemCounts.PVC}`);
console.log(`EPDM Products: ${systemCounts.EPDM}`);
console.log(`Other Products: ${systemCounts.Other}`);
console.log(`Total Products: ${allProducts.length}`);

// Create output manually to avoid reference issues
let tsContent = 'import { type InsertProductData } from "@shared/schema";\n\n';
tsContent += `// Complete product database extracted from ZIP file (${allProducts.length} products)\n`;
tsContent += 'export const allProductSheets: InsertProductData[] = [\n';

allProducts.forEach((product, index) => {
  tsContent += '  {\n';
  tsContent += `    "system": "${product.system}",\n`;
  tsContent += `    "manufacturer": "${product.manufacturer}",\n`;
  tsContent += `    "membraneType": "${product.membraneType}",\n`;
  tsContent += `    "thickness": "${product.thickness}",\n`;
  tsContent += `    "buildingHeight": "${product.buildingHeight}",\n`;
  tsContent += `    "warranty": "${product.warranty}",\n`;
  tsContent += `    "windSpeed": "${product.windSpeed}",\n`;
  tsContent += `    "location": "${product.location}",\n`;
  tsContent += `    "contractor": "${product.contractor}",\n`;
  tsContent += `    "projectName": "${product.projectName}",\n`;
  tsContent += `    "date": "${product.date}",\n`;
  tsContent += `    "specifications": {\n`;
  tsContent += `      "category": "${product.specifications.category}",\n`;
  tsContent += `      "system": "${product.specifications.system}",\n`;
  tsContent += `      "manufacturer": "${product.specifications.manufacturer}",\n`;
  tsContent += `      "thickness": "${product.specifications.thickness}",\n`;
  tsContent += `      "applications": ${JSON.stringify(product.specifications.applications)},\n`;
  tsContent += `      "features": ${JSON.stringify(product.specifications.features)}\n`;
  tsContent += `    },\n`;
  tsContent += `    "sourceDocument": "${product.sourceDocument}"\n`;
  tsContent += '  }';
  if (index < allProducts.length - 1) {
    tsContent += ',';
  }
  tsContent += '\n';
});

tsContent += '];\n\n';
tsContent += '// Organized by system type\n';
tsContent += 'export const productsBySystem = {\n';
tsContent += '  TPO: allProductSheets.filter(p => p.system === \'TPO\'),\n';
tsContent += '  PVC: allProductSheets.filter(p => p.system === \'PVC\'),\n';
tsContent += '  EPDM: allProductSheets.filter(p => p.system === \'EPDM\'),\n';
tsContent += '  Other: allProductSheets.filter(p => p.system === \'Other\')\n';
tsContent += '};\n';

fs.writeFileSync('server/data/all-product-sheets.ts', tsContent);
console.log('\nGenerated clean server/data/all-product-sheets.ts with all products');