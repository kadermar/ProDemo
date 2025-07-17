import { type InsertProductData } from "@shared/schema";

// Pre-loaded product data extracted from the provided PDF assembly letters
// This data comes from the zip file containing roofing system specifications
export const preloadedProducts: InsertProductData[] = [
  {
    system: "TPO",
    manufacturer: "Carlisle",
    membraneType: "Sure-Weld TPO",
    thickness: "60-mil",
    buildingHeight: "Approximately 35-feet tall",
    warranty: "20-year warranty with 72-MPH wind speed coverage",
    windSpeed: "72-MPH",
    location: "Richmond, Virginia",
    contractor: "BAKER ROOFING OF RICHMOND",
    projectName: "8001 Greenpine Rd",
    date: "January 25, 2024",
    specifications: {
      membrane: "60-mil Sure-Weld® TPO membrane heat induction welded to the top of the RhinoBond® plates",
      insulation: "1.5-inch thick InsulBase® Polyisocyanurate [4'x 8' boards] mechanically fastened with 8 Carlisle InsulFast™ fasteners and 3\" insulation plates",
      deck: "Existing standing seam metal roof",
      bevelCut: "Bevel Cut Carlisle EPS loose laid",
      specialRequirements: "20' wide perimeter [centered over the opening] must be installed along any roof edge containing large openings"
    },
    sourceDocument: "1-25-24.VA.8001 Greenpine Rd.R3"
  },
  {
    system: "TPO",
    manufacturer: "Versico",
    membraneType: "VersiFleece TPO",
    thickness: "115-mil",
    buildingHeight: "Approximately 18-feet tall",
    warranty: "20-year warranty with 72-MPH wind speed coverage",
    windSpeed: "72-MPH",
    location: "Dexter, Kansas",
    contractor: "BLOYER & SONS INC.",
    projectName: "USD 471 Dexter Public School",
    date: "January 31, 2024",
    specifications: {
      membrane: "115-mil VersiFleece® TPO membrane adhered with Flexible DASH™ Adhesive at 6\" on center bead spacing in the field, 4\" on center bead spacing in a minimum 4' wide perimeter and corners",
      deck: "Existing Smooth BUR with aluminum coating roofing system [by others] to remain over 22-gauge steel or heavier deck"
    },
    sourceDocument: "1-31-24.KS.USD 471 Dexter Public School"
  },
  {
    system: "EPDM",
    manufacturer: "Carlisle",
    membraneType: "Sure-Seal EPDM",
    thickness: "60-mil",
    buildingHeight: "Not specified",
    warranty: "20 Year Total System Warranty",
    windSpeed: "Not specified",
    location: "Reading, PA",
    contractor: "TRUMBLE CONSTRUCTION INC.",
    projectName: "USPS Reading, PA",
    date: "August 8, 2024",
    specifications: {
      membrane: "60-mil Sure-Seal® EPDM Membrane adhered with 90-8-30A Bonding Adhesive",
      deck: "Existing Structural Concrete",
      primer: "CCW 702 or CAV-GRIP™ III Low-VOC Primer",
      baseSheet: "SureMB 70 SA adhered to the primed deck",
      insulation: "Two layers of 2.0-inch thick InsulBase® Polyisocyanurate per attachment method",
      topInsulation: "¼\" per foot Tapered InsulBase® Polyisocyanurate per attachment method",
      coverBoard: "DensDeck® Prime: 1/2\" per attachment method"
    },
    sourceDocument: "080824.PA.USPS Reading, PA"
  },
  {
    system: "EPDM",
    manufacturer: "Carlisle",
    membraneType: "Sure-Tough EPDM",
    thickness: "75-mil",
    buildingHeight: "Approximately 30-feet tall",
    warranty: "25-year warranty with 90-MPH wind speed coverage",
    windSpeed: "90-MPH",
    location: "Perrysville, Pennsylvania",
    contractor: "KALKREUTH BROTHERS, INC.",
    projectName: "Verizon Perrysville",
    date: "September 23, 2024",
    specifications: {
      membrane: "75-mil Sure-Tough™ EPDM membrane adhered with CAV-GRIP™ III Low-VOC Adhesive/Primer",
      coverBoard: "1/2\" SecurShield™ HD adhered with Flexible FAST™ Adhesive at 4\" on center bead spacing",
      insulation: "2 layers 2.0-inch thick and Tapered InsulBase® Polyisocyanurate insulation adhered with Flexible FAST™ Adhesive at 4\" on center bead spacing",
      vaporBarrier: "VapAir Seal™ 725TR Air and Vapor Barrier adhered to the primed deck",
      deck: "Tear off to Structural Concrete deck"
    },
    sourceDocument: "9-23-24.PA.Verizon Perrysville"
  },
  {
    system: "PVC",
    manufacturer: "Carlisle",
    membraneType: "Sure-Flex PVC",
    thickness: "115-mil",
    buildingHeight: "Approximately 12-feet tall",
    warranty: "20-year warranty with 55-MPH wind speed coverage",
    windSpeed: "55-MPH",
    location: "Texarkana, TX",
    contractor: "TRUMBLE CONSTRUCTION INC.",
    projectName: "Miller County 6th Street",
    date: "October 21, 2024",
    specifications: {
      membrane: "115-mil Sure-Flex™ PVC Polyester FleeceBACK® membrane adhered with Flexible FAST beads spaced 6 inches on center in all roof zones",
      deck: "Cellular lightweight insulating concrete over 22-gauge steel or heavier deck with the existing modified roofing assembly to remain"
    },
    sourceDocument: "10.21.24.TX.Miller County 6th Street"
  },
  {
    system: "PVC",
    manufacturer: "Carlisle",
    membraneType: "Sure-Flex PVC",
    thickness: "60-mil",
    buildingHeight: "Approximately 35-feet tall",
    warranty: "20-year warranty with 90-MPH wind speed coverage",
    windSpeed: "90-MPH",
    location: "Washington, DC",
    contractor: "CHU CONTRACTING, INC.",
    projectName: "MacArthur High School",
    date: "October 22, 2024",
    specifications: {
      membrane: "60-mil Sure-Flex PVC membrane adhered with Sure-Flex™ PVC Low VOC Bonding or PVC Cav Grip Adhesive",
      coverBoard: "1/2\" SecurShield™ HD [4'x 8' boards] adhered with Flexible FAST™ Adhesive at 6\" on center bead spacing",
      insulation: "3.0-inch thick 25psi InsulBase® Polyisocyanurate insulation [4'x 8' boards] mechanically fastened with 12 Carlisle HP fasteners and 3\" insulation plates",
      vaporBarrier: "VapAir Seal™ 725TR Air and Vapor Barrier",
      thermalBarrier: "SECUROCK Gypsum-Fiber: 5/8\" [4'x 8' boards] mechanically fastened with Carlisle InsulFast™ fasteners and 3\" insulation plates"
    },
    sourceDocument: "9.26.24 DC MacArthur High School Washington CHU Contracting REVISED"
  },
  {
    system: "TPO",
    manufacturer: "Versico",
    membraneType: "VersiWeld TPO",
    thickness: "80-mil / 135-mil",
    buildingHeight: "Maximum 52-feet tall",
    warranty: "30-year warranty with 72-MPH wind speed coverage",
    windSpeed: "72-MPH",
    location: "Montgomery, Alabama",
    contractor: "BOND CONSTRUCTION LLC",
    projectName: "Reroofing of Annex 1 for the Montgomery County Commission",
    date: "February 7, 2024",
    specifications: {
      membrane: "80-mil VersiWeld® TPO Plus membrane adhered with CAV-GRIP™ 3V Low-VOC Adhesive/Primer OR 135-mil VersiWeld® TPO FleeceBACK membrane",
      coverBoard: "1/2\" SecurShield HD Plus adhered with Flexible DASH™ Adhesive utilizing the Splatter Method via rigs",
      insulation: "4.0-inch thick 20-PSI VersiCore® Polyisocyanurate adhered with Flexible DASH™ Adhesive",
      deck: "Tear off to Structural Concrete deck",
      hailRating: "Design 1 - 2\" hail, Design 2 - 3\" hail & 32 hours of accidental puncture coverage"
    },
    sourceDocument: "2-7-24.AL.Reroofing of Annex 1 for the Montgomery County Commission.R4"
  }
];
