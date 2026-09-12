import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  name: string;
  slug: string;
  description: string;
  specifications: string;
  image_url: string | null;
  active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  first_name: string;
  surname: string;
  company?: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteRequest {
  id: number;
  quote_reference: string;
  customer_id: number;
  customer?: Customer;
  comment?: string;
  status: string;
  created_at: string;
  updated_at: string;
  items?: QuoteItem[];
}

export interface QuoteItem {
  id?: number;
  quote_request_id?: number;
  product_id: number;
  product_name_snapshot: string;
  quantity: number;
  created_at?: string;
  specifications?: string;
  category_name?: string;
}

class DatabaseManager {
  private db: Database | null = null;
  private dbFilePath: string = path.join(process.cwd(), 'dkmedical.sqlite');

  public async init(): Promise<void> {
    if (this.db) return;

    const SQL = await initSqlJs();

    if (fs.existsSync(this.dbFilePath)) {
      try {
        const fileBuffer = fs.readFileSync(this.dbFilePath);
        this.db = new SQL.Database(fileBuffer);
        console.log('[DB] Loaded existing SQLite database from disk');
      } catch (err) {
        console.error('[DB] Failed to load existing database file, creating fresh instance:', err);
        this.db = new SQL.Database();
      }
    } else {
      this.db = new SQL.Database();
      console.log('[DB] Initialized fresh in-memory SQLite database');
    }

    this.createTables();
    this.seedInitialData();
    this.persist();
  }

  private persist(): void {
    if (!this.db) return;
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbFilePath, buffer);
    } catch (err) {
      console.error('[DB] Error saving SQLite database to disk:', err);
    }
  }

  private createTables(): void {
    if (!this.db) throw new Error('Database not initialized');

    const schemaPath = path.join(process.cwd(), 'server', 'db', 'schema.sql');
    let schemaSql = '';
    if (fs.existsSync(schemaPath)) {
      schemaSql = fs.readFileSync(schemaPath, 'utf8');
    } else {
      schemaSql = `
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          description TEXT,
          active INTEGER NOT NULL DEFAULT 1,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          description TEXT NOT NULL,
          specifications TEXT DEFAULT 'Specifications available on request.',
          image_url TEXT,
          active INTEGER NOT NULL DEFAULT 1,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT NOT NULL,
          surname TEXT NOT NULL,
          company TEXT,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS quote_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          quote_reference TEXT NOT NULL UNIQUE,
          customer_id INTEGER NOT NULL,
          comment TEXT,
          status TEXT NOT NULL DEFAULT 'New',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS quote_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          quote_request_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          product_name_snapshot TEXT NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (quote_request_id) REFERENCES quote_requests(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );
      `;
    }

    this.db.exec(schemaSql);
  }

  private seedInitialData(): void {
    if (!this.db) return;

    // Check if categories exist
    const catCheck = this.db.exec('SELECT COUNT(*) as count FROM categories');
    const catCount = (catCheck[0]?.values[0]?.[0] as number) || 0;

    if (catCount === 0) {
      console.log('[DB] Seeding categories and products...');

      // 1. Seed Categories
      const categories = [
        { id: 1, name: 'Medical Equipment', slug: 'medical-equipment', description: 'Precision diagnostic and therapeutic medical devices.', sort_order: 1 },
        { id: 2, name: 'Medical Consumables', slug: 'medical-consumables', description: 'Essential sterile consumables, wound care, kits and PPE.', sort_order: 2 },
        { id: 3, name: 'General Supplies', slug: 'general-supplies', description: 'General operational, packaging and stationery supplies.', sort_order: 3 },
        { id: 4, name: 'Services', slug: 'services', description: 'Procurement, consulting, tenders, sourcing and delivery solutions.', sort_order: 4 }
      ];

      for (const cat of categories) {
        this.db.run(
          `INSERT INTO categories (id, name, slug, description, active, sort_order) VALUES (?, ?, ?, ?, 1, ?)`,
          [cat.id, cat.name, cat.slug, cat.description, cat.sort_order]
        );
      }

      // 2. Seed Products (Alphabetically strictly ordered within each section as specified)
      const products = [
        // SECTION 1 — MEDICAL EQUIPMENT (A-Z)
        {
          category_id: 1,
          name: 'Blood Pressure Monitors',
          slug: 'blood-pressure-monitors',
          description: 'Digital automatic upper arm blood pressure monitor featuring a large backlit LCD display, memory storage for up to 120 readings, and one-touch operation.',
          specifications: '• Type: Digital Automatic Upper Arm Blood Pressure Monitor\n• Measurements: Systolic & Diastolic Pressure, Pulse Rate\n• Memory: Stores up to 120 clinical readings\n• Display: High-contrast LCD with WHO pressure classification guide\n• Cuff Size: Upper arm 22–32 cm (8.7–12.6 in)\n• Operation: One-touch automatic inflation and instant digital readout',
          image_url: '/images/blood-pressure-monitor.svg'
        },
        {
          category_id: 1,
          name: 'Medical Scales',
          slug: 'medical-scales',
          description: 'High-precision heavy-duty medical column scale with large platform, zero/tare calculation, unit switching (kg/lb), and clear LCD display.',
          specifications: '• Capacity: 200 kg (440 lb)\n• Accuracy: ± 0.1 kg\n• Platform Dimensions: 40 cm x 30 cm\n• Display: Large LCD with blue backlight\n• Power: Built-in rechargeable battery & AC adapter\n• Functions: Zero/Tare, Unit conversion, Auto power off, Low battery alert',
          image_url: '/images/scale.svg'
        },
        {
          category_id: 1,
          name: 'Nebulisers',
          slug: 'nebulisers',
          description: 'Medical compressor nebuliser system engineered for optimal medication delivery in asthma, COPD, bronchitis, and respiratory treatments.',
          specifications: '• Type: High-efficiency Piston Compressor Nebuliser\n• Indications: Asthma, COPD, Bronchitis, Cystic Fibrosis & acute respiratory care\n• Kit Included: Adult mask, pediatric mask, medicine cup, tubing, mouthpiece\n• Operation: Continuous aerosolisation into fine breathable mist',
          image_url: '/images/nebuliser.svg'
        },
        {
          category_id: 1,
          name: 'Pulse Oximeters',
          slug: 'pulse-oximeters',
          description: 'Fingertip OLED pulse oximeter for accurate real-time blood oxygen saturation (SpO2) and pulse rate monitoring.',
          specifications: '• Display: High-clarity dual-color OLED display\n• SpO2 Range: 70% – 100% (Accuracy: ±2%)\n• Pulse Rate Range: 30 – 250 bpm (Accuracy: ±2 bpm)\n• Power: 2x AAA batteries with auto shut-off after 8 seconds of inactivity\n• Weight: Approx. 50g with batteries (lightweight & portable)',
          image_url: '/images/pulse-oximeter.svg'
        },
        {
          category_id: 1,
          name: 'Thermometers',
          slug: 'thermometers',
          description: 'Clinical grade digital and infrared non-contact thermometers providing rapid, hygienic, and precise temperature readings.',
          specifications: '• Types: Non-Contact Infrared Forehead (1–2s), Digital Oral/Axillary, Tympanic Ear (1–3s), Glass Clinical\n• Normal Range: 36.1°C – 37.2°C (97.0°F – 99.0°F)\n• Features: Instant fever alert tone, backlit color indicator, recall memory',
          image_url: '/images/thermometer.svg'
        },

        // SECTION 2 — MEDICAL CONSUMABLES (A-Z)
        {
          category_id: 2,
          name: 'Burn Kits',
          slug: 'burn-kits',
          description: '12-component emergency burn care kit with sterile gel dressings, soothing hydrogel, conforming bandages, cold packs, and burn treatment guide.',
          specifications: '• Kit Contents (12 items): 1. Gel-impregnated Burn Dressings (10x10cm) 2. Burn Gel Hydrogel (3.5g) 3. Sterile Gauze Pads 4. Conforming Bandage 5. Adhesive Tape 6. Triangular Bandage 7. Disposable Nitrile Gloves 8. Medical Scissors 9. Instant Cold Pack 10. Alcohol-Free Wipes 11. Burn Care Guide 12. Heavy-duty Zip Bag',
          image_url: '/images/burn-kit.svg'
        },
        {
          category_id: 2,
          name: 'Cleaning Chemicals',
          slug: 'cleaning-chemicals',
          description: 'Hospital-grade sanitising and surface cleaning chemicals formulated for high-standard medical hygiene and infection prevention.',
          specifications: '• Applications: Clinic floors, ward sanitisation, surface disinfection\n• Formulations: Concentrated biocidal cleaner, non-corrosive, broad-spectrum pathogen control',
          image_url: null
        },
        {
          category_id: 2,
          name: 'Disinfectants',
          slug: 'disinfectants',
          description: 'Broad-spectrum medical disinfectants for clinic surfaces, surgical instruments, and medical environment decontamination.',
          specifications: '• Efficacy: Effective against bacteria, viruses, fungi, and bacterial spores\n• Standards: Certified hospital surface and instrument decontamination',
          image_url: null
        },
        {
          category_id: 2,
          name: 'Disposable Gloves',
          slug: 'disposable-gloves',
          description: 'High-barrier disposable examination gloves in nitrile and latex, powder-free, with textured fingertips for clinical dexterity.',
          specifications: '• Materials: Synthetic Nitrile & Natural Latex\n• Sizes: XS, S, M, L, XL\n• Features: Powder-free, textured fingertips, ambidextrous, food & medical grade certified',
          image_url: '/images/surgical-gloves.svg'
        },
        {
          category_id: 2,
          name: 'Dressings',
          slug: 'dressings',
          description: 'Elastic support compression roll bandages and sterile adhesive wound dressings for sprains, strains, and wound protection.',
          specifications: '• Roll Bandage Sizes: 5 cm x 4.5 m (2"x5yd), 7.5 cm x 4.5 m (3"x5yd), 10 cm x 4.5 m (4"x5yd), 15 cm x 4.5 m (6"x5yd)\n• Uses: Support and compression for sprains, strains, edema control, and primary dressing security',
          image_url: '/images/roll-bandages.svg'
        },
        {
          category_id: 2,
          name: 'Face Masks',
          slug: 'face-masks',
          description: 'Certified 3-Ply disposable surgical masks, procedure masks, and high-barrier filtration masks with ear loops and nose bridge.',
          specifications: '• Types: 3-Ply Surgical Mask (Disposable), Procedure Mask (Ear loops/ties), KN95 Mask, Surgical Mask with Clear Splash Face Shield\n• Features: High fluid resistance, 3-layer filtration, adjustable nose clip, soft ear loops',
          image_url: '/images/face-mask.svg'
        },
        {
          category_id: 2,
          name: 'Face Shields',
          slug: 'face-shields',
          description: 'Optically clear anti-fog medical face shields offering complete facial barrier protection against splashes and airborne droplets.',
          specifications: '• Types: Standard Full Face Shield, Anti-Fog Shield, Glasses Frame Mounted Shield, Full Wrap-Around Shield\n• Features: Clear PET visor, comfort sponge foam strip, adjustable headband, full facial coverage forehead to below chin',
          image_url: '/images/medical-face-shields.svg'
        },
        {
          category_id: 2,
          name: 'First Aid Kits',
          slug: 'first-aid-kits',
          description: '15-item comprehensive emergency first aid kit equipped with certified bandages, antiseptic solution, CPR shield, cold packs, and shears.',
          specifications: '• Kit Contents (15 items): 1. Adhesive Bandages (Band-Aids) 2. Sterile Gauze Pads (5x5cm 8-ply) 3. Adhesive Tape 4. Antiseptic Wipes 5. Povidone Iodine Solution (50ml) 6. Cotton Balls 7. Triangular Bandage (96x96x136cm) 8. Scissors 9. Tweezers 10. Disposable Gloves 11. Instant Cold Pack 12. CPR Face Shield 13. Pain Relievers 14. Safety Pins 15. First Aid Guide',
          image_url: '/images/first-aid-kit.svg'
        },
        {
          category_id: 2,
          name: 'Gauze',
          slug: 'gauze',
          description: 'Soft, absorbent, reliable sterile 8-ply gauze swabs and conforming gauze rolls across diverse surgical and dressing sizes.',
          specifications: '• Gauze Swabs / Pads: 5x5 cm (2"x2"), 7.5x7.5 cm (3"x3"), 10x10 cm (4"x4"), 10x20 cm (4"x8"), 10x10 cm (8-ply 4"x4")\n• Gauze Rolls (Stretched): 5 cm x 4.5 m (2"x4.5yd), 7.5 cm x 4.5 m (3"x4.5yd), 10 cm x 4.5 m (4"x4.5yd)\n• Material: 100% pure cotton, sterile, high absorbency',
          image_url: '/images/gauze.svg'
        },
        {
          category_id: 2,
          name: 'Medical Needles',
          slug: 'medical-needles',
          description: 'Color-coded peripheral IV catheters (over-the-needle) and hypodermic needles engineered for smooth vascular access and medication delivery.',
          specifications: '• IV Catheter Gauges (Color Coded):\n  - 14G (Orange, 2.1x45mm, 270 ml/min - Trauma/rapid infusion)\n  - 16G (Grey, 1.7x45mm, 180 ml/min - Rapid blood infusion)\n  - 18G (Green, 1.3x45mm, 90 ml/min - General use & fluids)\n  - 20G (Pink, 1.1x32mm, 55 ml/min - Most common clinical use)\n  - 22G (Blue, 0.9x25mm, 33 ml/min - Small veins / pediatrics)\n  - 24G (Yellow, 0.7x19mm, 20 ml/min - Pediatrics & elderly)\n• Construction: Bevelled needle tip, catheter, flexible wings, flashback chamber, luer lock',
          image_url: '/images/iv-catheters.svg'
        },
        {
          category_id: 2,
          name: 'N95 Respirators',
          slug: 'n95-respirators',
          description: 'NIOSH-certified N95 tight-fitting particulate respirators filtering at least 95% of airborne particulate matter for high-risk clinical procedures.',
          specifications: '• Filtration: ≥95% filtration efficiency against airborne droplets and particulate matter\n• Fit: Cup-style / flat-fold tight facial seal with double headband and cushioned nose piece',
          image_url: '/images/face-mask.svg'
        },
        {
          category_id: 2,
          name: 'PPE',
          slug: 'ppe',
          description: 'Complete personal protective equipment solutions including isolation gowns, face shields, surgical gloves, shoe covers, and head caps.',
          specifications: '• Comprehensive infection control packs compliant with healthcare safety standards',
          image_url: '/images/medical-gowns.svg'
        },
        {
          category_id: 2,
          name: 'Protective Gowns',
          slug: 'protective-gowns',
          description: 'Medical protective gowns for barrier protection, fluid resistance, comfort, and cross-contamination prevention.',
          specifications: '• Gown Types:\n  1. Isolation Gown (Non-Sterile, fluid resistant, yellow, elastic cuffs)\n  2. Surgical Gown (Sterile, fluid resistant, reinforced critical areas, knit cuffs, blue)\n  3. Enhanced Isolation Gown (High fluid resistance, royal blue, tie neck & waist)\n  4. Impermeable Gown (High chemical/fluid barrier, coated film, teal)\n  5. Disposable Visitor Gown (Non-sterile, lightweight, white)\n• Features: Breathable, fluid repellent, durable seam construction',
          image_url: '/images/medical-gowns.svg'
        },
        {
          category_id: 2,
          name: 'Sanitizers',
          slug: 'sanitizers',
          description: '70% alcohol-based liquid gels, foams, sanitising wipes, and sprays formulated to eliminate 99.9% of germs while protecting skin moisture.',
          specifications: '• Formats Available:\n  1. Alcohol-Based Hand Sanitizer Liquid / Gel (60–80% alcohol)\n  2. Alcohol-Based Hand Sanitizer Foam (70% alcohol)\n  3. Alcohol-Free Moisturising Hand Sanitizer\n  4. Antibacterial Hand Sanitizing Wipes (80 wipes)\n  5. Hand Sanitizer Spray (70% alcohol, quick-drying)',
          image_url: '/images/sanitizer.svg'
        },
        {
          category_id: 2,
          name: 'Surgical Gloves',
          slug: 'surgical-gloves',
          description: 'Sterile latex and synthetic nitrile surgical gloves with anatomical fit, high tensile strength, and textured tactile precision.',
          specifications: '• Materials: Natural Rubber Latex & Synthetic Nitrile (Latex-Free)\n• Size Guide (Hand Circumference):\n  - Size 6.0 (Light Green, 152–165mm)\n  - Size 6.5 (White, 165–178mm)\n  - Size 7.0 (Navy Blue, 178–191mm - Most Common)\n  - Size 7.5 (Green, 191–203mm)\n  - Size 8.0 (Yellow, 203–216mm)\n  - Size 8.5 (Brown, 216–229mm)\n• Standards: Gamma radiation sterilised, powder-free, tear resistant',
          image_url: '/images/surgical-gloves.svg'
        },
        {
          category_id: 2,
          name: 'Syringes',
          slug: 'syringes',
          description: 'Sterile single-use medical syringes with clear graduation markings, smooth plunger movement, and secure luer lock/slip connections.',
          specifications: '• Sizes & Capacities:\n  - 1 mL (Tuberculin / precision micro-doses)\n  - 3 mL (Small volume medications)\n  - 5 mL (Standard clinical injections)\n  - 10 mL (Larger volume medications)\n  - 20 mL (Aspiration & IV delivery)\n  - 30 mL (Infusions & medication prep)\n  - 50/60 mL (Catheter irrigation & enteral feeding)',
          image_url: '/images/syringes.svg'
        },
        {
          category_id: 2,
          name: 'Trauma Kits',
          slug: 'trauma-kits',
          description: '16-piece high-impact emergency trauma response kit equipped for life-threatening bleeding, chest trauma, burns, and severe injuries.',
          specifications: '• Kit Contents (16 items): 1. Tactical Tourniquet 2. Sterile Trauma Dressings (10x18cm) 3. Hemostatic Gauze 4. Israeli Emergency Bandage 5. Vented Chest Seal 6. Nitrile Gloves 7. CPR Face Shield 8. Trauma Shears 9. Rolled Gauze 10. Triangular Bandage 11. Adhesive Tape 12. Marker & Patient Card 13. Emergency Thermal Blanket 14. Burn Dressing (10x10cm) 15. Eye Pad Dressing 16. Instant Cold Pack\n• Bag: Heavy-duty water-resistant emergency trauma bag with organized compartments',
          image_url: '/images/trauma-kit.svg'
        },

        // SECTION 3 — GENERAL SUPPLIES (A-Z)
        {
          category_id: 3,
          name: 'Office Supplies',
          slug: 'office-supplies',
          description: 'General administrative supplies, filing equipment, desk essentials and paper products for healthcare and corporate offices.',
          specifications: 'Specifications available on request.',
          image_url: null
        },
        {
          category_id: 3,
          name: 'Packaging Materials',
          slug: 'packaging-materials',
          description: 'Durable packaging supplies, cartons, bubble wrap, sealing tapes, and sterile transport containment materials.',
          specifications: 'Specifications available on request.',
          image_url: null
        },
        {
          category_id: 3,
          name: 'Stationery',
          slug: 'stationery',
          description: 'Medical record books, registers, custom stationery, pens, pads, and office document management products.',
          specifications: 'Specifications available on request.',
          image_url: null
        },

        // SECTION 4 — SERVICES (A-Z)
        {
          category_id: 4,
          name: 'Bulk Procurement',
          slug: 'bulk-procurement',
          description: 'High-volume institutional sourcing and consolidated supply agreements delivering cost efficiencies for hospitals and large groups.',
          specifications: 'Specifications available on request.',
          image_url: null
        },
        {
          category_id: 4,
          name: 'Corporate Supply',
          slug: 'corporate-supply',
          description: 'Dedicated business supply partner offering scheduled consumable deliveries, office first-aid management and corporate accounts.',
          specifications: 'Specifications available on request.',
          image_url: null
        },
        {
          category_id: 4,
          name: 'Custom Product Sourcing',
          slug: 'custom-product-sourcing',
          description: 'Specialised procurement services to locate and supply niche medical equipment or custom-specification general items.',
          specifications: 'Specifications available on request.',
          image_url: null
        },
        {
          category_id: 4,
          name: 'Government Tenders',
          slug: 'government-tenders',
          description: 'Fully compliant South African supply partner for municipal, provincial and national healthcare and general tenders.',
          specifications: 'Specifications available on request.',
          image_url: null
        },
        {
          category_id: 4,
          name: 'Medical Supply Consulting',
          slug: 'medical-supply-consulting',
          description: 'Professional advisory for clinic startups, emergency preparedness provisioning, and supply chain rationalisation.',
          specifications: 'Specifications available on request.',
          image_url: null
        },
        {
          category_id: 4,
          name: 'Nationwide Delivery',
          slug: 'nationwide-delivery',
          description: 'Fast, secure, trackable distribution network delivering to healthcare facilities and clients across all nine South African provinces.',
          specifications: 'Specifications available on request.',
          image_url: null
        }
      ];

      for (let i = 0; i < products.length; i++) {
        const p = products[i];
        this.db.run(
          `INSERT INTO products (category_id, name, slug, description, specifications, image_url, active, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
          [p.category_id, p.name, p.slug, p.description, p.specifications, p.image_url, i + 1]
        );
      }

      console.log(`[DB] Successfully seeded ${categories.length} categories and ${products.length} products.`);
    } else {
      // Sync image URLs and specifications
      const productsToSync = [
        {
          slug: 'blood-pressure-monitors',
          image_url: '/images/blood-pressure-monitor.svg',
          description: 'Digital automatic upper arm blood pressure monitor featuring a large backlit LCD display, memory storage for up to 120 readings, and one-touch operation.',
          specifications: '• Type: Digital Automatic Upper Arm Blood Pressure Monitor\n• Measurements: Systolic & Diastolic Pressure, Pulse Rate\n• Memory: Stores up to 120 clinical readings\n• Display: High-contrast LCD with WHO pressure classification guide\n• Cuff Size: Upper arm 22–32 cm (8.7–12.6 in)\n• Operation: One-touch automatic inflation and instant digital readout'
        },
        {
          slug: 'medical-scales',
          image_url: '/images/scale.svg',
          description: 'High-precision heavy-duty medical column scale with large platform, zero/tare calculation, unit switching (kg/lb), and clear LCD display.',
          specifications: '• Capacity: 200 kg (440 lb)\n• Accuracy: ± 0.1 kg\n• Platform Dimensions: 40 cm x 30 cm\n• Display: Large LCD with blue backlight\n• Power: Built-in rechargeable battery & AC adapter\n• Functions: Zero/Tare, Unit conversion, Auto power off, Low battery alert'
        },
        {
          slug: 'nebulisers',
          image_url: '/images/nebuliser.svg',
          description: 'Medical compressor nebuliser system engineered for optimal medication delivery in asthma, COPD, bronchitis, and respiratory treatments.',
          specifications: '• Type: High-efficiency Piston Compressor Nebuliser\n• Indications: Asthma, COPD, Bronchitis, Cystic Fibrosis & acute respiratory care\n• Kit Included: Adult mask, pediatric mask, medicine cup, tubing, mouthpiece\n• Operation: Continuous aerosolisation into fine breathable mist'
        },
        {
          slug: 'pulse-oximeters',
          image_url: '/images/pulse-oximeter.svg',
          description: 'Fingertip OLED pulse oximeter for accurate real-time blood oxygen saturation (SpO2) and pulse rate monitoring.',
          specifications: '• Display: High-clarity dual-color OLED display\n• SpO2 Range: 70% – 100% (Accuracy: ±2%)\n• Pulse Rate Range: 30 – 250 bpm (Accuracy: ±2 bpm)\n• Power: 2x AAA batteries with auto shut-off after 8 seconds of inactivity\n• Weight: Approx. 50g with batteries (lightweight & portable)'
        },
        {
          slug: 'thermometers',
          image_url: '/images/thermometer.svg',
          description: 'Clinical grade digital and infrared non-contact thermometers providing rapid, hygienic, and precise temperature readings.',
          specifications: '• Types: Non-Contact Infrared Forehead (1–2s), Digital Oral/Axillary, Tympanic Ear (1–3s), Glass Clinical\n• Normal Range: 36.1°C – 37.2°C (97.0°F – 99.0°F)\n• Features: Instant fever alert tone, backlit color indicator, recall memory'
        },
        {
          slug: 'burn-kits',
          image_url: '/images/burn-kit.svg',
          description: '12-component emergency burn care kit with sterile gel dressings, soothing hydrogel, conforming bandages, cold packs, and burn treatment guide.',
          specifications: '• Kit Contents (12 items): 1. Gel-impregnated Burn Dressings (10x10cm) 2. Burn Gel Hydrogel (3.5g) 3. Sterile Gauze Pads 4. Conforming Bandage 5. Adhesive Tape 6. Triangular Bandage 7. Disposable Nitrile Gloves 8. Medical Scissors 9. Instant Cold Pack 10. Alcohol-Free Wipes 11. Burn Care Guide 12. Heavy-duty Zip Bag'
        },
        {
          slug: 'disposable-gloves',
          image_url: '/images/surgical-gloves.svg',
          description: 'High-barrier disposable examination gloves in nitrile and latex, powder-free, with textured fingertips for clinical dexterity.',
          specifications: '• Materials: Synthetic Nitrile & Natural Latex\n• Sizes: XS, S, M, L, XL\n• Features: Powder-free, textured fingertips, ambidextrous, food & medical grade certified'
        },
        {
          slug: 'dressings',
          image_url: '/images/roll-bandages.svg',
          description: 'Elastic support compression roll bandages and sterile adhesive wound dressings for sprains, strains, and wound protection.',
          specifications: '• Roll Bandage Sizes: 5 cm x 4.5 m (2"x5yd), 7.5 cm x 4.5 m (3"x5yd), 10 cm x 4.5 m (4"x5yd), 15 cm x 4.5 m (6"x5yd)\n• Uses: Support and compression for sprains, strains, edema control, and primary dressing security'
        },
        {
          slug: 'face-masks',
          image_url: '/images/face-mask.svg',
          description: 'Certified 3-Ply disposable surgical masks, procedure masks, and high-barrier filtration masks with ear loops and nose bridge.',
          specifications: '• Types: 3-Ply Surgical Mask (Disposable), Procedure Mask (Ear loops/ties), KN95 Mask, Surgical Mask with Clear Splash Face Shield\n• Features: High fluid resistance, 3-layer filtration, adjustable nose clip, soft ear loops'
        },
        {
          slug: 'face-shields',
          image_url: '/images/medical-face-shields.svg',
          description: 'Optically clear anti-fog medical face shields offering complete facial barrier protection against splashes and airborne droplets.',
          specifications: '• Types: Standard Full Face Shield, Anti-Fog Shield, Glasses Frame Mounted Shield, Full Wrap-Around Shield\n• Features: Clear PET visor, comfort sponge foam strip, adjustable headband, full facial coverage forehead to below chin'
        },
        {
          slug: 'first-aid-kits',
          image_url: '/images/first-aid-kit.svg',
          description: '15-item comprehensive emergency first aid kit equipped with certified bandages, antiseptic solution, CPR shield, cold packs, and shears.',
          specifications: '• Kit Contents (15 items): 1. Adhesive Bandages (Band-Aids) 2. Sterile Gauze Pads (5x5cm 8-ply) 3. Adhesive Tape 4. Antiseptic Wipes 5. Povidone Iodine Solution (50ml) 6. Cotton Balls 7. Triangular Bandage (96x96x136cm) 8. Scissors 9. Tweezers 10. Disposable Gloves 11. Instant Cold Pack 12. CPR Face Shield 13. Pain Relievers 14. Safety Pins 15. First Aid Guide'
        },
        {
          slug: 'gauze',
          image_url: '/images/gauze.svg',
          description: 'Soft, absorbent, reliable sterile 8-ply gauze swabs and conforming gauze rolls across diverse surgical and dressing sizes.',
          specifications: '• Gauze Swabs / Pads: 5x5 cm (2"x2"), 7.5x7.5 cm (3"x3"), 10x10 cm (4"x4"), 10x20 cm (4"x8"), 10x10 cm (8-ply 4"x4")\n• Gauze Rolls (Stretched): 5 cm x 4.5 m (2"x4.5yd), 7.5 cm x 4.5 m (3"x4.5yd), 10 cm x 4.5 m (4"x4.5yd)\n• Material: 100% pure cotton, sterile, high absorbency'
        },
        {
          slug: 'medical-needles',
          image_url: '/images/iv-catheters.svg',
          description: 'Color-coded peripheral IV catheters (over-the-needle) and hypodermic needles engineered for smooth vascular access and medication delivery.',
          specifications: '• IV Catheter Gauges (Color Coded):\n  - 14G (Orange, 2.1x45mm, 270 ml/min - Trauma/rapid infusion)\n  - 16G (Grey, 1.7x45mm, 180 ml/min - Rapid blood infusion)\n  - 18G (Green, 1.3x45mm, 90 ml/min - General use & fluids)\n  - 20G (Pink, 1.1x32mm, 55 ml/min - Most common clinical use)\n  - 22G (Blue, 0.9x25mm, 33 ml/min - Small veins / pediatrics)\n  - 24G (Yellow, 0.7x19mm, 20 ml/min - Pediatrics & elderly)\n• Construction: Bevelled needle tip, catheter, flexible wings, flashback chamber, luer lock'
        },
        {
          slug: 'n95-respirators',
          image_url: '/images/face-mask.svg',
          description: 'NIOSH-certified N95 tight-fitting particulate respirators filtering at least 95% of airborne particulate matter for high-risk clinical procedures.',
          specifications: '• Filtration: ≥95% filtration efficiency against airborne droplets and particulate matter\n• Fit: Cup-style / flat-fold tight facial seal with double headband and cushioned nose piece'
        },
        {
          slug: 'ppe',
          image_url: '/images/medical-gowns.svg',
          description: 'Complete personal protective equipment solutions including isolation gowns, face shields, surgical gloves, shoe covers, and head caps.',
          specifications: '• Comprehensive infection control packs compliant with healthcare safety standards'
        },
        {
          slug: 'protective-gowns',
          image_url: '/images/medical-gowns.svg',
          description: 'Medical protective gowns for barrier protection, fluid resistance, comfort, and cross-contamination prevention.',
          specifications: '• Gown Types:\n  1. Isolation Gown (Non-Sterile, fluid resistant, yellow, elastic cuffs)\n  2. Surgical Gown (Sterile, fluid resistant, reinforced critical areas, knit cuffs, blue)\n  3. Enhanced Isolation Gown (High fluid resistance, royal blue, tie neck & waist)\n  4. Impermeable Gown (High chemical/fluid barrier, coated film, teal)\n  5. Disposable Visitor Gown (Non-sterile, lightweight, white)\n• Features: Breathable, fluid repellent, durable seam construction'
        },
        {
          slug: 'sanitizers',
          image_url: '/images/sanitizer.svg',
          description: '70% alcohol-based liquid gels, foams, sanitising wipes, and sprays formulated to eliminate 99.9% of germs while protecting skin moisture.',
          specifications: '• Formats Available:\n  1. Alcohol-Based Hand Sanitizer Liquid / Gel (60–80% alcohol)\n  2. Alcohol-Based Hand Sanitizer Foam (70% alcohol)\n  3. Alcohol-Free Moisturising Hand Sanitizer\n  4. Antibacterial Hand Sanitizing Wipes (80 wipes)\n  5. Hand Sanitizer Spray (70% alcohol, quick-drying)'
        },
        {
          slug: 'surgical-gloves',
          image_url: '/images/surgical-gloves.svg',
          description: 'Sterile latex and synthetic nitrile surgical gloves with anatomical fit, high tensile strength, and textured tactile precision.',
          specifications: '• Materials: Natural Rubber Latex & Synthetic Nitrile (Latex-Free)\n• Size Guide (Hand Circumference):\n  - Size 6.0 (Light Green, 152–165mm)\n  - Size 6.5 (White, 165–178mm)\n  - Size 7.0 (Navy Blue, 178–191mm - Most Common)\n  - Size 7.5 (Green, 191–203mm)\n  - Size 8.0 (Yellow, 203–216mm)\n  - Size 8.5 (Brown, 216–229mm)\n• Standards: Gamma radiation sterilised, powder-free, tear resistant'
        },
        {
          slug: 'syringes',
          image_url: '/images/syringes.svg',
          description: 'Sterile single-use medical syringes with clear graduation markings, smooth plunger movement, and secure luer lock/slip connections.',
          specifications: '• Sizes & Capacities:\n  - 1 mL (Tuberculin / precision micro-doses)\n  - 3 mL (Small volume medications)\n  - 5 mL (Standard clinical injections)\n  - 10 mL (Larger volume medications)\n  - 20 mL (Aspiration & IV delivery)\n  - 30 mL (Infusions & medication prep)\n  - 50/60 mL (Catheter irrigation & enteral feeding)'
        },
        {
          slug: 'trauma-kits',
          image_url: '/images/trauma-kit.svg',
          description: '16-piece high-impact emergency trauma response kit equipped for life-threatening bleeding, chest trauma, burns, and severe injuries.',
          specifications: '• Kit Contents (16 items): 1. Tactical Tourniquet 2. Sterile Trauma Dressings (10x18cm) 3. Hemostatic Gauze 4. Israeli Emergency Bandage 5. Vented Chest Seal 6. Nitrile Gloves 7. CPR Face Shield 8. Trauma Shears 9. Rolled Gauze 10. Triangular Bandage 11. Adhesive Tape 12. Marker & Patient Card 13. Emergency Thermal Blanket 14. Burn Dressing (10x10cm) 15. Eye Pad Dressing 16. Instant Cold Pack\n• Bag: Heavy-duty water-resistant emergency trauma bag with organized compartments'
        }
      ];

      for (const p of productsToSync) {
        this.db.run(
          'UPDATE products SET image_url = ?, description = ?, specifications = ? WHERE slug = ?',
          [p.image_url, p.description, p.specifications, p.slug]
        );
      }
    }
  }

  // --- QUERY METHODS ---

  public getCategories(): Category[] {
    if (!this.db) throw new Error('Database not initialized');
    const res = this.db.exec('SELECT * FROM categories WHERE active = 1 ORDER BY sort_order ASC');
    if (!res.length) return [];
    const cols = res[0].columns;
    return res[0].values.map((row) => {
      const obj: any = {};
      cols.forEach((c, idx) => { obj[c] = row[idx]; });
      return obj as Category;
    });
  }

  public getProducts(options?: { categorySlug?: string; search?: string }): Product[] {
    if (!this.db) throw new Error('Database not initialized');

    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.active = 1 AND c.active = 1
    `;
    const params: any[] = [];

    if (options?.categorySlug && options.categorySlug !== 'all') {
      sql += ` AND c.slug = ?`;
      params.push(options.categorySlug);
    }

    if (options?.search && options.search.trim()) {
      const term = `%${options.search.trim()}%`;
      sql += ` AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)`;
      params.push(term, term, term);
    }

    // Always sort alphabetically by name within each category/result set
    sql += ` ORDER BY p.name ASC`;

    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    const results: Product[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as Product);
    }
    stmt.free();

    return results;
  }

  public getProductById(id: number): Product | null {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.active = 1
    `);
    stmt.bind([id]);
    let prod: Product | null = null;
    if (stmt.step()) {
      prod = stmt.getAsObject() as unknown as Product;
    }
    stmt.free();
    return prod;
  }

  public getProductBySlug(slug: string): Product | null {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.active = 1
    `);
    stmt.bind([slug]);
    let prod: Product | null = null;
    if (stmt.step()) {
      prod = stmt.getAsObject() as unknown as Product;
    }
    stmt.free();
    return prod;
  }

  // --- TRANSACTIONAL QUOTE SUBMISSION ---
  public createQuoteRequest(data: {
    first_name: string;
    surname: string;
    company?: string;
    email: string;
    phone: string;
    comment?: string;
    items: Array<{ product_id: number; quantity: number }>;
  }): { quote_reference: string; quote_id: number; customer: Customer; items: QuoteItem[] } {
    if (!this.db) throw new Error('Database not initialized');

    if (!data.first_name || !data.surname || !data.email || !data.phone) {
      throw new Error('Please complete all required fields before submitting your enquiry.');
    }
    if (!data.items || data.items.length === 0) {
      throw new Error('Please add at least one product to your quote request.');
    }

    // BEGIN TRANSACTION
    this.db.exec('BEGIN TRANSACTION;');

    try {
      // 1. Find or create customer
      const emailClean = data.email.trim().toLowerCase();
      let customerId: number;

      const custStmt = this.db.prepare('SELECT * FROM customers WHERE email = ?');
      custStmt.bind([emailClean]);
      let existingCustomer: Customer | null = null;
      if (custStmt.step()) {
        existingCustomer = custStmt.getAsObject() as unknown as Customer;
      }
      custStmt.free();

      if (existingCustomer) {
        customerId = existingCustomer.id;
        this.db.run(
          `UPDATE customers SET first_name = ?, surname = ?, company = ?, phone = ?, updated_at = datetime('now') WHERE id = ?`,
          [data.first_name.trim(), data.surname.trim(), data.company?.trim() || null, data.phone.trim(), customerId]
        );
      } else {
        this.db.run(
          `INSERT INTO customers (first_name, surname, company, email, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [data.first_name.trim(), data.surname.trim(), data.company?.trim() || null, emailClean, data.phone.trim()]
        );
        const lastCust = this.db.exec('SELECT last_insert_rowid() as id');
        customerId = lastCust[0].values[0][0] as number;
      }

      // 2. Generate unique Quote Reference: DKM-YYYYMMDD-XXXX
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const countRes = this.db.exec(`SELECT COUNT(*) FROM quote_requests WHERE quote_reference LIKE 'DKM-${dateStr}-%'`);
      const dailyCount = ((countRes[0]?.values[0]?.[0] as number) || 0) + 1;
      const sequenceStr = String(dailyCount).padStart(4, '0');
      const quoteReference = `DKM-${dateStr}-${sequenceStr}`;

      // 3. Insert Quote Request
      this.db.run(
        `INSERT INTO quote_requests (quote_reference, customer_id, comment, status, created_at, updated_at) VALUES (?, ?, ?, 'New', datetime('now'), datetime('now'))`,
        [quoteReference, customerId, data.comment?.trim() || null]
      );
      const lastQuote = this.db.exec('SELECT last_insert_rowid() as id');
      const quoteId = lastQuote[0].values[0][0] as number;

      // 4. Validate items against database and record item snapshots
      const savedItems: QuoteItem[] = [];
      for (const item of data.items) {
        const pStmt = this.db.prepare(`
          SELECT p.*, c.name as category_name
          FROM products p
          JOIN categories c ON p.category_id = c.id
          WHERE p.id = ?
        `);
        pStmt.bind([item.product_id]);
        if (!pStmt.step()) {
          pStmt.free();
          throw new Error(`Product with ID ${item.product_id} is no longer valid or active.`);
        }
        const prod = pStmt.getAsObject() as any;
        pStmt.free();

        const qty = Math.max(1, Number(item.quantity) || 1);
        this.db.run(
          `INSERT INTO quote_items (quote_request_id, product_id, product_name_snapshot, quantity, created_at) VALUES (?, ?, ?, ?, datetime('now'))`,
          [quoteId, item.product_id, prod.name, qty]
        );

        savedItems.push({
          product_id: item.product_id,
          product_name_snapshot: prod.name,
          quantity: qty,
          specifications: prod.specifications,
          category_name: prod.category_name
        });
      }

      // COMMIT TRANSACTION
      this.db.exec('COMMIT;');
      this.persist();

      const customer: Customer = {
        id: customerId,
        first_name: data.first_name.trim(),
        surname: data.surname.trim(),
        company: data.company?.trim(),
        email: emailClean,
        phone: data.phone.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return {
        quote_reference: quoteReference,
        quote_id: quoteId,
        customer,
        items: savedItems
      };
    } catch (error) {
      // ROLLBACK on any failure
      this.db.exec('ROLLBACK;');
      console.error('[DB] Transaction failed and rolled back:', error);
      throw error;
    }
  }

  // --- TRANSACTIONAL CONTACT / DETAILS ENQUIRY SUBMISSION ---
  public createContactInquiry(data: {
    first_name: string;
    surname: string;
    company?: string;
    email: string;
    phone: string;
    subject?: string;
    message: string;
  }): { reference: string; customer: Customer } {
    if (!this.db) throw new Error('Database not initialized');

    if (!data.first_name || !data.surname || !data.email || !data.phone || !data.message) {
      throw new Error('Please complete all required fields before submitting your enquiry.');
    }

    this.db.exec('BEGIN TRANSACTION;');

    try {
      // 1. Find or create customer
      const emailClean = data.email.trim().toLowerCase();
      let customerId: number;

      const custStmt = this.db.prepare('SELECT * FROM customers WHERE email = ?');
      custStmt.bind([emailClean]);
      let existingCustomer: Customer | null = null;
      if (custStmt.step()) {
        existingCustomer = custStmt.getAsObject() as unknown as Customer;
      }
      custStmt.free();

      if (existingCustomer) {
        customerId = existingCustomer.id;
        this.db.run(
          `UPDATE customers SET first_name = ?, surname = ?, company = ?, phone = ?, updated_at = datetime('now') WHERE id = ?`,
          [data.first_name.trim(), data.surname.trim(), data.company?.trim() || null, data.phone.trim(), customerId]
        );
      } else {
        this.db.run(
          `INSERT INTO customers (first_name, surname, company, email, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [data.first_name.trim(), data.surname.trim(), data.company?.trim() || null, emailClean, data.phone.trim()]
        );
        const lastCust = this.db.exec('SELECT last_insert_rowid() as id');
        customerId = lastCust[0].values[0][0] as number;
      }

      // 2. Generate unique Reference: DKM-INQ-YYYYMMDD-XXXX
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const countRes = this.db.exec(`SELECT COUNT(*) FROM quote_requests WHERE quote_reference LIKE 'DKM-INQ-${dateStr}-%'`);
      const dailyCount = ((countRes[0]?.values[0]?.[0] as number) || 0) + 1;
      const sequenceStr = String(dailyCount).padStart(4, '0');
      const reference = `DKM-INQ-${dateStr}-${sequenceStr}`;

      // 3. Insert into quote_requests table as an advisory contact enquiry
      const fullComment = `[Subject: ${data.subject || 'General Enquiry'}] ${data.message.trim()}`;
      this.db.run(
        `INSERT INTO quote_requests (quote_reference, customer_id, comment, status, created_at, updated_at) VALUES (?, ?, ?, 'New', datetime('now'), datetime('now'))`,
        [reference, customerId, fullComment]
      );

      this.db.exec('COMMIT;');
      this.persist();

      const customer: Customer = {
        id: customerId,
        first_name: data.first_name.trim(),
        surname: data.surname.trim(),
        company: data.company?.trim(),
        email: emailClean,
        phone: data.phone.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return { reference, customer };
    } catch (error) {
      this.db.exec('ROLLBACK;');
      console.error('[DB] Contact transaction failed and rolled back:', error);
      throw error;
    }
  }
}

export const dbManager = new DatabaseManager();
