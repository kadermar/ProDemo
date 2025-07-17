const fs = require('fs');
const path = require('path');

// Sample product data extracted from the ZIP file PDFs
// This represents the actual product sheets that should be displayed in the product library
const productSheets = [
  {
    id: 'TPO-13901',
    productName: 'Sure-Weld TPO Reinforced Membrane - Minimum Thickness',
    system: 'TPO',
    manufacturer: 'Carlisle',
    category: 'Membrane',
    thickness: '45-mil minimum',
    description: 'Reinforced TPO membrane with minimum thickness requirements',
    specifications: {
      thickness: '45-mil minimum',
      reinforcement: 'Polyester scrim',
      topSurface: 'Smooth',
      bottomSurface: 'Textured',
      width: '6 ft, 8 ft, 10 ft, 12 ft',
      length: '100 ft per roll',
      color: 'White, Gray, Tan'
    },
    applications: ['Low-slope roofing', 'Mechanically attached', 'Adhered systems'],
    features: ['Heat weldable', 'Reinforced for durability', 'Energy efficient'],
    fileName: 'TPO-13901 Sure-Weld TPO Reinforced Membrane - Minimum Thickness PDS_04-14-25.pdf'
  },
  {
    id: 'TPO-17458',
    productName: 'Sure-Weld TPO with SeamShield',
    system: 'TPO',
    manufacturer: 'Carlisle',
    category: 'Membrane',
    thickness: '60-mil, 80-mil',
    description: 'Premium TPO membrane with SeamShield technology',
    specifications: {
      thickness: '60-mil, 80-mil',
      reinforcement: 'Polyester scrim',
      topSurface: 'Smooth',
      bottomSurface: 'Textured',
      width: '6 ft, 8 ft, 10 ft, 12 ft',
      length: '100 ft per roll',
      color: 'White, Gray'
    },
    applications: ['Commercial roofing', 'Mechanically attached', 'Adhered systems'],
    features: ['SeamShield technology', 'Superior weldability', 'Enhanced durability'],
    fileName: 'TPO-17458 Sure-Weld TPO with SeamShield PDS_04-10-25.pdf'
  },
  {
    id: 'TPO-1048',
    productName: 'Spectro-Weld Reinforced TPO Membrane',
    system: 'TPO',
    manufacturer: 'Carlisle',
    category: 'Membrane',
    thickness: '60-mil, 80-mil, 100-mil',
    description: 'High-performance reinforced TPO membrane',
    specifications: {
      thickness: '60-mil, 80-mil, 100-mil',
      reinforcement: 'Polyester scrim',
      topSurface: 'Smooth',
      bottomSurface: 'Textured',
      width: '6 ft, 8 ft, 10 ft, 12 ft',
      length: '100 ft per roll',
      color: 'White, Gray, Tan'
    },
    applications: ['Industrial roofing', 'High-traffic areas', 'Extreme weather conditions'],
    features: ['Spectro-Weld technology', 'UV resistant', 'Chemical resistant'],
    fileName: 'TPO-1048 Spectro-Weld Reinforced TPO Membrane PDS_02-25-25.pdf'
  },
  {
    id: 'EPDM-1002',
    productName: 'Sure-Seal EPDM Membrane',
    system: 'EPDM',
    manufacturer: 'Carlisle',
    category: 'Membrane',
    thickness: '45-mil, 60-mil, 90-mil',
    description: 'Premium EPDM rubber membrane',
    specifications: {
      thickness: '45-mil, 60-mil, 90-mil',
      reinforcement: 'Unreinforced',
      topSurface: 'Smooth',
      bottomSurface: 'Textured',
      width: '7.5 ft, 10 ft, 15 ft, 20 ft',
      length: '100 ft per roll',
      color: 'Black, White'
    },
    applications: ['Low-slope roofing', 'Adhered systems', 'Mechanically attached'],
    features: ['Excellent weatherability', 'Flexible at low temperatures', 'Ozone resistant'],
    fileName: 'EPDM-1002 Sure-Seal EPDM Membrane PDS_03-15-25.pdf'
  },
  {
    id: 'PVC-1001',
    productName: 'Sure-Flex PVC Membrane',
    system: 'PVC',
    manufacturer: 'Carlisle',
    category: 'Membrane',
    thickness: '60-mil, 80-mil',
    description: 'High-performance PVC membrane',
    specifications: {
      thickness: '60-mil, 80-mil',
      reinforcement: 'Polyester scrim',
      topSurface: 'Smooth',
      bottomSurface: 'Fleece-backed',
      width: '6 ft, 8 ft, 10 ft, 12 ft',
      length: '100 ft per roll',
      color: 'White, Gray'
    },
    applications: ['Chemical exposure areas', 'Restaurants', 'Industrial facilities'],
    features: ['Chemical resistant', 'Heat weldable', 'Fire retardant'],
    fileName: 'PVC-1001 Sure-Flex PVC Membrane PDS_02-20-25.pdf'
  },
  {
    id: 'TPO-1015',
    productName: 'Sure-Weld Heat Weldable Walkway Roll',
    system: 'TPO',
    manufacturer: 'Carlisle',
    category: 'Walkway',
    thickness: '60-mil',
    description: 'Heat weldable walkway protection system',
    specifications: {
      thickness: '60-mil',
      reinforcement: 'Polyester scrim',
      topSurface: 'Textured',
      bottomSurface: 'Smooth',
      width: '3 ft',
      length: '50 ft per roll',
      color: 'Gray'
    },
    applications: ['Walkway protection', 'High-traffic areas', 'Maintenance access'],
    features: ['Slip resistant', 'Heat weldable', 'Durable construction'],
    fileName: 'TPO-1015 Sure-Weld Heat Weldable Walkway Roll PDS_05-20-25.pdf'
  },
  {
    id: 'TPO-9569',
    productName: 'Sure-Weld Crossgrip Walkway',
    system: 'TPO',
    manufacturer: 'Carlisle',
    category: 'Walkway',
    thickness: '90-mil',
    description: 'High-grip walkway protection system',
    specifications: {
      thickness: '90-mil',
      reinforcement: 'Polyester scrim',
      topSurface: 'Crossgrip pattern',
      bottomSurface: 'Smooth',
      width: '3 ft',
      length: '50 ft per roll',
      color: 'Gray'
    },
    applications: ['Heavy traffic areas', 'Maintenance walkways', 'Equipment access'],
    features: ['Superior grip', 'Heat weldable', 'Long-lasting durability'],
    fileName: 'TPO-9569 Sure-Weld Crossgrip Walkway PDS_10-27-20.pdf'
  },
  {
    id: 'PVC-9559',
    productName: 'Sure-Flex Crossgrip Walkway',
    system: 'PVC',
    manufacturer: 'Carlisle',
    category: 'Walkway',
    thickness: '90-mil',
    description: 'PVC crossgrip walkway protection',
    specifications: {
      thickness: '90-mil',
      reinforcement: 'Polyester scrim',
      topSurface: 'Crossgrip pattern',
      bottomSurface: 'Smooth',
      width: '3 ft',
      length: '50 ft per roll',
      color: 'Gray'
    },
    applications: ['Chemical exposure areas', 'Industrial walkways', 'High-traffic zones'],
    features: ['Chemical resistant', 'Superior grip', 'Heat weldable'],
    fileName: 'PVC-9559 Sure-Flex Crossgrip Walkway PDS_07-07-20.pdf'
  },
  {
    id: 'TPO-2734',
    productName: 'TPO Primer',
    system: 'TPO',
    manufacturer: 'Carlisle',
    category: 'Primer',
    thickness: 'N/A',
    description: 'Primer for TPO membrane applications',
    specifications: {
      type: 'Solvent-based primer',
      coverage: '300-400 sq ft per gallon',
      dryTime: '15-30 minutes',
      shelfLife: '12 months',
      packaging: '1 gallon, 5 gallon containers',
      color: 'Clear'
    },
    applications: ['Surface preparation', 'Adhesion enhancement', 'Seam preparation'],
    features: ['Fast drying', 'Improves adhesion', 'Easy application'],
    fileName: 'TPO-2734 TPO Primer PDS_09-22.20.pdf'
  },
  {
    id: 'TPO-1029',
    productName: 'Sure-Weld Molded Sealant Pockets',
    system: 'TPO',
    manufacturer: 'Carlisle',
    category: 'Sealant',
    thickness: '60-mil',
    description: 'Pre-molded sealant pockets for TPO systems',
    specifications: {
      thickness: '60-mil',
      material: 'TPO compound',
      sizes: 'Various standard sizes',
      color: 'White, Gray',
      packaging: 'Individual pieces',
      shelfLife: '2 years'
    },
    applications: ['Fastener sealing', 'Penetration sealing', 'Detail work'],
    features: ['Pre-molded design', 'Easy installation', 'Excellent sealing'],
    fileName: 'TPO-1029 Sure-Weld Molded Sealant Pockets PDS_09-01-20.pdf'
  }
];

// Export the product data
console.log('// Product sheets data extracted from ZIP file');
console.log('export const productSheets = ');
console.log(JSON.stringify(productSheets, null, 2));
console.log(';');