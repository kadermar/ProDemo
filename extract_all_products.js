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

// Process all files
const allProducts = files.map(file => {
  const info = extractProductInfo(file);
  
  return {
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
    date: new Date().toISOString().split('T')[0],
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
});

// Group by system for better organization
const groupedProducts = {
  TPO: allProducts.filter(p => p.system === 'TPO'),
  PVC: allProducts.filter(p => p.system === 'PVC'),
  EPDM: allProducts.filter(p => p.system === 'EPDM'),
  Other: allProducts.filter(p => p.system === 'Other')
};

console.log('\n=== Product Summary ===');
console.log(`TPO Products: ${groupedProducts.TPO.length}`);
console.log(`PVC Products: ${groupedProducts.PVC.length}`);
console.log(`EPDM Products: ${groupedProducts.EPDM.length}`);
console.log(`Other Products: ${groupedProducts.Other.length}`);

// Export TypeScript format
const tsOutput = `import { type InsertProductData } from "@shared/schema";

// Complete product database extracted from ZIP file (${files.length} products)
export const allProductSheets: InsertProductData[] = ${JSON.stringify(allProducts, null, 2)};

// Organized by system type
export const productsBySystem = {
  TPO: allProductSheets.filter(p => p.system === 'TPO'),
  PVC: allProductSheets.filter(p => p.system === 'PVC'),
  EPDM: allProductSheets.filter(p => p.system === 'EPDM'),
  Other: allProductSheets.filter(p => p.system === 'Other')
};`;

fs.writeFileSync('server/data/all-product-sheets.ts', tsOutput);
console.log('\nGenerated server/data/all-product-sheets.ts with all products');