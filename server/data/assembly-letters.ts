import { type InsertDocument } from "@shared/schema";

// Pre-loaded assembly letters from the provided PDF files
// These contain the full text content for AI context and search
export const preloadedDocuments: InsertDocument[] = [
  {
    filename: "1-25-24_VA_8001_Greenpine_Rd_R3.pdf",
    originalName: "1-25-24.VA.8001 Greenpine Rd.R3.pdf",
    content: `        January 25, 2024                                               Revision 3: February 8, 2024

        Attn:    JESSE MERICA
                 BAKER ROOFING OF RICHMOND
                 1800 BATTERY DANTZLER COURT
                 CHESTER, VIRGINIA 23836

        Re:      8001 Greenpine Rd
                 Richmond, Virginia

        To Whom It May Concern:

        This letter acknowledges the following roof system is considered for issuance of warranty by Carlisle Syntec
        Systems.

        Building Height:           Approximately 35-feet tall
        Membrane:                  60-mil Sure-Weld® TPO membrane heat induction welded to the top of the
                                   RhinoBond® plates following Carlisle's specifications and details. First two purlins a
                                   minimum of 4-ft and a maximum 5-ft from the eave shall be a full row of
                                   securement. Third purlin from the eave shall have a row of securement coming in
                                   from the rake edge a minimum 10-ft. Fourth purlin from the eave shall be a full row
                                   of securement. The pattern of alternating perimeter securement [10-ft from each
                                   rake edge] and full rows of securement will continue up to the top where the last or
                                   top purlin shall have a full row of securement. All fastened with Carlisle
                                   RetroDriller Fasteners and RhinoBond® Plates at 12" on center.
        Insulation:                1.5-inch thick InsulBase® Polyisocyanurate [4'x 8' boards] mechanically fastened
                                   with 8 Carlisle InsulFast™ fasteners and 3" insulation plates in the field, perimeter
                                   and corners.
        Insulation:                Bevel Cut Carlisle EPS loose laid.
        Deck:                      Existing standing seam metal roof

        Note: 20' wide perimeter [centered over the opening] must be installed along any roof edge containing large
        openings [over-head doors] with a total area greater than 10% of the total wall area on which the openings are
        located [Reference Carlisle Detail RB-2].

        This roof assembly is not intended to modify, negate, or alter requirements as dictated by the contract
        documents, mandated per applicable building code, or the building owner's insurer. Unless approved by
        the Architect/Consultant of record, project specific roof system enhancements, exceeding those outlined in
        the assembly, are to be complied with.

        System enhancements pertaining, but not limited, to membrane thickness, insulation type and thickness,
        flashing height, slope requirements and membrane terminations [beyond those required by Carlisle] are to
        be complied with when specified unless approved by the Architect / Consultant. These conditions are
        considered above and beyond the scope of Carlisle review and take precedence.

        Upon final inspection and acceptance by a Carlisle Field Service Representative confirming that the roof
        system has been installed in accordance with Carlisle Specifications, Carlisle will issue a 20-year warranty
        with 72-MPH wind speed coverage. Unless purchased or supplied through Carlisle, please note that
        performance, integrity, and impact of products by others is not included under coverage of the Carlisle
        Warranty.

        If you have any question or need any additional information, feel free to contact our office.

        Sincerely,



        Kristiana Burns
        Design Analyst
        Carlisle SynTec Systems

        Cc: Tyler Crist; Mike Bluman
_________________________________________________________________________________________________________________________________________
P.O. Box 7000 Carlisle, PA 17013 Phone: 800.479.6832 Fax: 717.245.7053 www.carlislesyntec.com`,
    metadata: {
      filename: "1-25-24_VA_8001_Greenpine_Rd_R3.pdf",
      size: 2048,
      pageCount: 1,
      extractedAt: new Date(),
      project: "8001 Greenpine Rd",
      location: "Richmond, Virginia",
      contractor: "BAKER ROOFING OF RICHMOND",
      membrane: "60-mil Sure-Weld® TPO",
      warranty: "20-year warranty with 72-MPH wind speed coverage"
    }
  },
  {
    filename: "1-31-24_KS_USD_471_Dexter_Public_School.pdf",
    originalName: "1-31-24.KS.USD 471 Dexter Public School.pdf",
    content: `January 31, 2024

Attn:   GABE BLOYER
        BLOYER & SONS INC.
        5645 172ND ROAD
        WINFIELD, KANSAS 67156

Re:     USD 471 Dexter Public School
        Dexter, Kansas

To Whom It May Concern:

This letter acknowledges the following roof system is considered for issuance of warranty by Versico
Systems.

Building Height:      Approximately 18-feet tall
Membrane:             115-mil VersiFleece® TPO membrane adhered with Flexible DASH™ Adhesive at 6"
                      on center bead spacing in the field, 4" on center bead spacing in a minimum 4'
                      wide perimeter and corners.
Deck:                 Existing Smooth BUR with aluminum coating roofing system [by others] to remain
                      over 22-gauge steel or heavier deck. Remove all loose flakes of coating, an adhesion
                      test is recommended. Remove and replace any compromised, damaged or wet areas
                      of existing system.

This roof assembly is not intended to modify, negate, or alter requirements as dictated by the contract
documents, mandated per applicable building code, or the building owner's insurer. Unless approved by
the Architect/Consultant of record, project specific roof system enhancements, exceeding those outlined
in the assembly, are to be complied with.

System enhancements pertaining, but not limited, to membrane thickness, insulation type and
thickness, flashing height, slope requirements and membrane terminations [beyond those required by
Versico] are to be complied with when specified unless approved by the Architect / Consultant. These
conditions are considered above and beyond the scope of Versico review and take precedence.

Upon final inspection and acceptance by a Versico Field Service Representative confirming that the roof
system has been installed in accordance with Versico's Specifications, Versico will issue a 20-year
warranty with 72-MPH wind speed coverage. Unless purchased or supplied through Versico, please note
that performance, integrity, and impact of products by others is not included under coverage of the
Versico Warranty.

If you have any question or need any additional information, feel free to contact our office.

Sincerely,



Kristiana Burns
Design Analyst
Versico Roofing Systems

Cc: Duke Maddox; Kellen Zawadzki; Tim Devore`,
    metadata: {
      filename: "1-31-24_KS_USD_471_Dexter_Public_School.pdf",
      size: 1536,
      pageCount: 1,
      extractedAt: new Date(),
      project: "USD 471 Dexter Public School",
      location: "Dexter, Kansas",
      contractor: "BLOYER & SONS INC.",
      membrane: "115-mil VersiFleece® TPO",
      warranty: "20-year warranty with 72-MPH wind speed coverage"
    }
  },
  {
    filename: "2-7-24_AL_Montgomery_County_Commission_R4.pdf",
    originalName: "2-7-24.AL.Reroofing of Annex 1 for the Montgomery County Commission.R4.pdf",
    content: `February 7, 2024                                        Revision 4: March 19, 2024

Attn:     SHANE HOGGLE
          BOND CONSTRUCTION LLC
          1001 30TH AVE.
          NORTHPORT, ALABAMA 35476

Re:       Reroofing of Annex 1 for the Montgomery County Commission
          Montgomery, Alabama

To Whom It May Concern:
This letter acknowledges the following roof system is considered for issuance of warranty by Versico Systems.
Submitted for inclusion with this letter, are project specific uplift pressures that the roof system is to resist.

                   Zone 1'= -17.3 PSF; Zone 1= -30.1 PSF; Zone 2= -39.7 PSF; Zone 3= -54.1 PSF

In accordance with ANSI/FM 4474, the assembly listed is tested for a maximum design pressure allowance of
-315 PSF.

The roofing assembly as listed and noted below has been reviewed based on the IBC 2021 Section 1504.4 &
1504.4.1 as it relates to wind uplift (ANSI/FM 4474) and Section 1504.8 impact resistance. Additionally, the
assembly achieves the Severe Hail (SH) as tested associated to the FM 4470 paragraph 4.4.

                                      Design 1 – system qualifies for 2" hail
Building Height:         Maximum 52-feet tall
Slope:                   This assembly is UL Class A listed with a maximum slope restriction of 1/4" per foot
                         [UL 790/ASTM E108].
Membrane:                80-mil VersiWeld® TPO Plus membrane adhered with CAV-GRIP™ 3V Low-VOC
                         Adhesive/Primer.
Cover Board:             1/2" SecurShield HD Plus adhered with Flexible DASH™ Adhesive utilizing the Splatter
                         Method via rigs in the field, perimeter and corners.
Insulation:              4.0-inch thick 20-PSI VersiCore® Polyisocyanurate adhered with Flexible DASH™
                         Adhesive utilizing the Splatter Method via rigs in the field, perimeter and corners.
Insulation:              Tapered 20-PSI VersiCore® Polyisocyanurate insulation adhered with Flexible DASH™
                         Adhesive utilizing the Splatter Method via rigs in the field, perimeter and corners.
Primer:                  If residual or unexposed asphalt is present on the deck surface, it must be primed with
                         CCW 702 or CAV-GRIP™ 3V Low-VOC Adhesive/Primer.
Deck:                    Tear off to Structural Concrete deck

            Design 2 – system qualifies for 3" hail & 32 hours of accidental puncture coverage
Building Height:       Maximum 52-feet tall
Slope:                 This assembly is UL Class A listed with a maximum slope restriction of 1/4" per foot
                       [UL 790/ASTM E108].
Membrane:              135-mil VersiWeld® TPO FleeceBACK membrane adhered with Flexible DASH™
                       Adhesive utilizing the Splatter Method in the field, perimeter and corners.
Cover Board:           1/2" SecurShield HD Plus adhered with Flexible DASH™ Adhesive utilizing the Splatter
                       Method via rigs in the field, perimeter and corners.
Insulation:            4.0-inch thick 20-PSI VersiCore® Polyisocyanurate adhered with Flexible DASH™
                       Adhesive utilizing the Splatter Method via rigs in the field, perimeter and corners.
Insulation:            Tapered 20-PSI VersiCore® Polyisocyanurate insulation adhered with Flexible DASH™
                       Adhesive utilizing the Splatter Method via rigs in the field, perimeter and corners.
Primer:                If residual or unexposed asphalt is present on the deck surface, it must be primed with
                       CCW 702 or CAV-GRIP™ 3V Low-VOC Adhesive/Primer.
Deck:                  Tear off to Structural Concrete deck
                                                    Design 3
Building Height:        Maximum 52-feet tall
Slope:                  This assembly is UL Class A listed with a maximum slope restriction of 1/4" per foot
                        [UL 790/ASTM E108].
Membrane:               80-mil VersiWeld® TPO Plus membrane adhered with CAV-GRIP™ 3V Low-VOC
                        Adhesive/Primer.
Cover Board:            1/2" SecurShield HD Plus [4'x 8' boards] mechanically fastened with 16 Carlisle
                        InsulFast fasteners and 3" insulation plates in the field, 24 in a minimum 12' wide
                        perimeter and corners.
Insulation:             4.0-inch thick and Tapered 20-PSI VersiCore® Polyisocyanurate insulation loose laid.
Deck:                   Tear off to 22-gauge or heavier steel deck

This roof assembly is not intended to modify, negate, or alter requirements as dictated by the contract
documents, mandated per applicable building code, or the building owner's insurer. Unless approved by the
Architect/Consultant of record, project specific roof system enhancements, exceeding those outlined in the
assembly, are to be complied with.

System enhancements pertaining, but not limited, to membrane thickness, insulation type and thickness,
flashing height, slope requirements and membrane terminations [beyond those required by Versico] are to be
complied with when specified unless approved by the Architect / Consultant. These conditions are considered
above and beyond the scope of Versico review and take precedence.

Upon final inspection and acceptance by a Versico Field Service Representative confirming that the roof system
has been installed in accordance with Versico's Specifications, Versico will issue a 30-year warranty with 72-
MPH wind speed coverage. Unless purchased or supplied through Versico, please note that performance,
integrity, and impact of products by others is not included under coverage of the Versico Warranty.

If you have any question or need any additional information, feel free to contact our office.

Sincerely,



Kristiana Burns
Design Analyst
Versico Roofing Systems

Cc: Zac Wilson; Andrew Gleason; Corey Pierce`,
    metadata: {
      filename: "2-7-24_AL_Montgomery_County_Commission_R4.pdf",
      size: 3072,
      pageCount: 1,
      extractedAt: new Date(),
      project: "Reroofing of Annex 1 for the Montgomery County Commission",
      location: "Montgomery, Alabama",
      contractor: "BOND CONSTRUCTION LLC",
      membrane: "80-mil/135-mil VersiWeld® TPO",
      warranty: "30-year warranty with 72-MPH wind speed coverage"
    }
  }
  // Additional assembly letters would be added here...
];