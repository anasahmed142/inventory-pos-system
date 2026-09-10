# Changelog & Project Modification Ledger

All notable changes, architectural updates, and user persona features for the **Enterprise Inventory, POS & Khata System** are documented in this ledger.

---

## [2026-09-10] - 3 Universal Print Layouts, 5-Stage Supplier Lifecycle, Batch Barcode Studio & Company Logo Cache

### 📄 1. Delivery Challan vs Tax Invoice & 3 Print Layout Formats (`DocumentPrintModal.tsx`):
- **Delivery Challan (ڈلیوری چالان)**: Logistics & gate pass document containing vehicle registration, driver name, driver phone, dispatch source (Godown/Shop), and item quantities without financial sales tax breakdowns.
- **Commercial Tax Invoice (انوائس)**: Financial sales document containing Company Logo, English/Urdu Business Name, NTN, STRN, FBR POS ID, GST 18% tax calculation, payment method, dues breakdown, and authorized signature.
- **3 Adaptive Print Formats**:
  1. 📄 **Full A4 Page**: Formal corporate layout with double borders, header branding, bilingual headings, item grid with GST tax columns, vehicle metadata, and receiver/issuer signatures.
  2. 📑 **Half A5 Page**: Compact commercial landscape voucher tailored for grain markets (غلہ منڈی) and quick transport bilti receipts.
  3. 🧾 **80mm / 58mm Heat Wax Thermal Roll**: Standard thermal paper roll layout formatted for POS and bank thermal receipt printers, featuring store header, FBR QR code simulation, itemized lines, and tax summary.

### 🚚 2. 5-Stage Supplier Procurement Lifecycle (`masterDataStore.ts` & `TradeOrdersHub.tsx`):
- Added complete 5-stage procurement lifecycle tracking for purchase orders:
  - 📞 **1. Order Placed with Supplier (سپلائر کو کال پر آرڈر دیا گیا)**
  - 🤝 **2. Supplier Confirmed (سپلائر نے تصدیق کر دی)**
  - 🚚 **3. On the Way / In-Transit (راستے میں ہے / گاڑی روانہ)**
  - 🏢 **4. Received in Godown (گودام میں وصول - اسٹاک میں خودکار اضافہ)**: Automatically increments Godown stock in real-time upon receipt.
  - 🏪 **5. Received in Shop (دکان میں وصول - اسٹاک میں خودکار اضافہ)**: Automatically increments Shop stock in real-time upon receipt.
- Purchase order cards feature a 1-click status stepper and instant layout printing.

### 🏷️ 3. Batch Multi-Product Barcode Studio (`CompanyAdminDashboard.tsx`):
- Upgraded single barcode modal into a full-featured **Batch Multi-Product Barcode Studio**:
  - **Multi-Product Selection**: Check individual or all products with search filter and custom label quantities per product.
  - **5 Standard Label Sizes**:
    - `50x25mm` (Standard Retail / Supermarket Sticker)
    - `38x25mm` (Compact Sticker)
    - `40x30mm` (Medium Box / Pharmacy / Garments)
    - `100x50mm` (Wholesale Bori / Sack / Godown Carton Label)
    - `A4 Sheet` (24-Grid: 3 columns × 8 rows laser sticker paper)
  - **Display Fields Customization**: Toggles for Company Brand, Urdu Title, Retail Price (Rs.), Barcode Text, and Print Date.
  - **Live Realistic Preview & Native Print**: Renders live sticker layout with barcode bars and triggers `@media print` CSS formatted precisely to sticker paper dimensions.

### 🖼️ 4. Company Logo Upload & Persistent Offline Local Cache:
- Added **Company Official Logo** uploader in Company Admin Settings tab.
- Converts image to high-efficiency base64 string, auto-saved in `tenantBrandingStore` and `masterDataStore` across browser reloads.
- Dynamically rendered on:
  - **Branded Login Screen (`BrandedLoginScreen.tsx`)** when logged out.
  - **Top Navigation Bar (`App.tsx`)**.
  - **All 3 Document Print Layouts** (A4 Invoices, A5 Vouchers, and 80mm Receipts).

---

## [2026-09-10] - Searchable Comboboxes & Universal Trade Orders Generation Hub

### 🔍 High-Speed Product & Account Comboboxes:
1. **`ProductSearchCombobox.tsx`**:
   - Live searchable autocomplete dropdown by English name, Urdu name, barcode, SKU, and category.
   - Shows real-time stock breakdown (**Godown Stock vs Shop Stock**), unit of measure, and active price tier (**Retail Rate, Wholesale Rate, Cost Price**).
   - Instant 1-click addition of multiple products to sales bills/orders with keyboard navigation (`Enter`, arrow keys).
2. **`AccountSearchCombobox.tsx`**:
   - Unified search across Walk-in customers, Bahi-Khata parties, Wholesale Buyer vendors, and Suppliers.
   - Displays live ledger balance (**Dr / ادھار** vs **Cr / جمع**), phone, and city.
   - Embedded inline **+ Add New Customer / Party** quick modal to register new accounts without leaving the counter.

### 📦 Universal Trade & Orders Hub (`TradeOrdersHub.tsx`):
1. **Prominent Topbar Navigation Tab**:
   - Added **"Orders & Trade (خرید و فروخت آرڈرز)"** tab in `App.tsx` for quick access.
2. **+ 🛒 Generate Sales Order (خریدار کو مال فروخت کریں)**:
   - Select Buyer/Customer from `AccountSearchCombobox`.
   - Add multiple products from `ProductSearchCombobox` with wholesale rates, discounts, and deduction source (**Godown** vs **Shop**).
   - Enter dispatch & logistics details (Challan #, Vehicle #, Driver Name, Driver Phone).
   - Select payment terms (Cash, 1Link Bank, Udhaar Khata, Cheque).
   - 1-Click submit automatically decrements stock, records order, and opens printable **Wholesale Delivery Challan & Gate Pass (ڈلیوری چالان)**.
3. **+ 📥 Generate Purchase Inward Order (سپلائر سے مال خریدیں)**:
   - Select Supplier from `AccountSearchCombobox`.
   - Add multiple products from `ProductSearchCombobox` with purchase cost rates and destination location (**Store in Godown** or **Store in Shop**).
   - 1-Click submit automatically receives goods and increments stock in the selected location.
4. **📋 Universal Orders Ledger**:
   - Filter all orders by Type (`All`, `Sales Orders`, `Purchase Inward Orders`).
   - Track dispatch lifecycle (*Pending $\rightarrow$ In Godown $\rightarrow$ In Shop $\rightarrow$ Dispatched $\rightarrow$ Delivered*).
   - 1-Click reprint for Invoices, Delivery Challans, and Gate Passes.

### 🛒 Upgraded POS Terminals:
- **`SupermarketPosView.tsx`**: Integrated `ProductSearchCombobox`, `AccountSearchCombobox`, multi-product cart editing, retail/wholesale rate switcher, Godown vs Shop stock source switcher, and direct Udhaar Khata posting.
- **`KiryanaPosView.tsx`**: Integrated searchable product catalog alongside quick loose staple scale buttons.

---

## [2026-09-10] - Wholesale, Seed & Commodity Distribution Hub & Multi-Location Stock Tracking

### 🌾 Wholesale Distribution Architecture:
1. **Two-Tier Vendor Segregation**:
   - **Suppliers (سپلائرز)**: Upstream mills, importers, and agricultural corporations from whom the company purchases seed varieties, fertilizers, and wholesale stock when inventory is low.
   - **Buyer Vendors (خریدار)**: Downstream regional retailers, dealers, and progressive farmers who purchase wholesale consignments.
   - Separate contact directory, NTN, city, and ledger balances for each vendor category.

2. **Multi-Location Stock Matrix (Godown vs Shop vs In-Transit)**:
   - Products track **Godown Stock (گودام کا مال)** and **Shop Counter Stock (دکان کا مال)** independently.
   - **1-Click Low Stock Alert & Reorder**: When combined stock drops below minimum threshold, an alert triggers a 1-click pre-filled restock purchase order from the product's preferred supplier.
   - **Stock Transfer**: 1-Click transfer mechanism moving bags/quantities between Godown $\leftrightarrow$ Shop.

3. **Wholesale Sales Order & Gate Pass Delivery Challan**:
   - Create bulk wholesale orders for buyer partners.
   - Select stock deduction source (**Godown** or **Shop**).
   - Generates and prints official **Wholesale Delivery Challan & Gate Pass (ڈلیوری چالان)** with vehicle number, driver name, and item breakdown.

4. **Lifecycle Dispatch Follow-up Stepper**:
   - Track wholesale consignment stages:
     - ⏳ *Pending (زیرِ کارروائی)*
     - 🏢 *In Godown (گودام میں پیک)*
     - 🏪 *In Shop (دکان پر تیار)*
     - 🚚 *Dispatched (گاڑی میں روانہ)*
     - ✅ *Delivered & Completed (وصول شدہ)*

5. **Locked Operating Categories**:
   - Purged the redundant manual operating mode switcher from Company Admin settings.
   - Companies operate strictly in the category configured by the Main Admin.

---

## [2026-09-10] - Comprehensive Software Audit & Redundancy Removal

### 🧹 Codebase Optimization & Redundancy Purge:
1. **Removed Unused & Duplicate Views**:
   - Removed orphaned legacy prototype mock files (`SetupWizardModal.tsx`, `CompanyManagementView.tsx`, `StaffManagementView.tsx`).
   - Cleaned up package root exports in `@inventory/client-app` to expose only production modules (`MainAdminDashboard`, `CompanyAdminDashboard`, `BahiKhataLedgerView`, `SupermarketPosView`, `KiryanaPosView`, `MandiAgriPosView`, `BrandedLoginScreen`).
2. **Eliminated Redundant UI Mode Switcher**:
   - Removed manual 3-button mode switcher from the POS header in `App.tsx`.
   - Business category and specialized POS terminal (Supermarket Barcode, Kiryana Scale & Udhaar, Mandi 40kg Mann Calculation) are now 100% automated based on each company's registered category in Master Admin.
3. **Reactive Khata Ledger Selection State**:
   - Refactored `BahiKhataLedgerView.tsx` from state-snapshot copying to a reactive ID-driven pattern (`selectedPartyId`).
   - Adding or deleting ledger entries now updates party balances and transaction histories instantly without stale state.
4. **Verification**:
   - All 8 Turborepo packages compiled cleanly (`0 errors`).
   - Automated test suite passed with 20/20 test cases (100% success).

---



### 🛡️ Admin Business Rules & Category Placement:
1. **Modal-Bound Operating Category Setting**:
   - Removed inline "Change Operating Category" select dropdown from company cards in Main Admin.
   - Operating category (`Supermarket`, `Kiryana & Shop`, `Galla Mandi Seeds`, `Wholesale FMCG`) is now exclusively configured and changed inside the **+ Register New Company** modal and the **Edit Company Details** modal.
   - Company cards display clean, color-coded category badges with unlocked feature indicators.

2. **Complete Staff / Cashier CRUD in Main Admin & Company Admin**:
   - **Main Admin "Details & Staff" Company Drawer**:
     - Added **+ Add Staff / Cashier** button with modal form (Full Name, Username, 4-Digit PIN, Role Title, Granular Permissions: POS Orders, Product Catalog, Khata Ledger, Customer Directory, Financial Reports).
     - Added functioning **[Edit]** button opening `editingStaffUser` modal to adjust credentials, PIN, role title, and permissions.
     - Added functioning **[Suspend / Activate]** toggle button.
     - Added functioning **[Delete]** button with confirmation to remove staff accounts.
   - **Main Admin "Global Staff Directory" Tab**:
     - Added **+ Add New Staff User** button allowing creation and assignment of staff to any client company.
     - Attached working **[Edit]**, **[Suspend/Active]**, and **[Delete]** buttons to all rows in the global table.
   - **Company Admin "Sub-Users & Cashiers" Tab**:
     - Added full sub-user creation, editing, active toggling, and deletion workflows with instant store synchronization.

3. **Complete CRUD Verification Across All Modules**:
   - **Companies**: Register new company, Edit company profile/NTN/category, Toggle login access.
   - **Staff & Sub-Users**: Create staff, Edit staff role/PIN/permissions, Toggle active/suspended, Delete staff.
   - **Product Catalog**: Add product, Edit product prices/stock/unit, Print thermal barcode stickers (50x25mm), Delete product.
   - **Private SaaS Billing Ledger**: Record payment, View payment history modal with breakdown, Delete payment record, Auto-recalculate dues and active status.
   - **Bahi-Khata Ledger**: Create party account, Post Debit (Naam / ادھار), Post Credit (Jama / وصولی), Delete entry, Re-calculate net balance, Generate WhatsApp share slip.
   - **POS Checkout**: Cart addition, Qty adjustment, Cash tendering, Invoice generation, and automatic stock deduction.
   - **Automated Vitest Test Suite**: Verified 100% test passing (20/20 test cases in `apps/server/test/crud-verification.spec.ts` and `sync-stress.spec.ts`).

---



### 🎨 Design Overhaul & Dynamic Theming Architecture:
1. **Keenthemes Metronic Enterprise Aesthetic**:
   - Eliminated saturated retro neon glows, cyber borders, and harsh gradients across the entire frontend.
   - Implemented clean, executive SaaS surfaces (`bg-[#f4f6fa]` light / `bg-[#151521]` dark, crisp 1px borders `border-[#e4e6ef]` light / `border-[#2b2b40]` dark, elevated white and dark slate cards `bg-[#1e1e2d]`, and soft pastel pill badges).
   - Clean typography loaded via Google Fonts (*Inter*, *Plus Jakarta Sans*, *Outfit*, *Roboto Mono*, *Noto Sans Arabic*, and *Noto Nastaliq Urdu*).
2. **Dynamic UI Theme Customizer Studio (`ThemeCustomizerModal.tsx`)**:
   - Available via topbar paintbrush trigger 🎨 or embedded inside **Company Admin Portal -> Theme & Settings**.
   - **Curated Enterprise Presets**:
     - 💎 *Metronic Executive Dark* (`#3E97FF` primary / `#50CD89` secondary)
     - ☀️ *Metronic Corporate Light* (`#3E97FF` primary / `#50CD89` secondary / clean white canvas)
     - 🌌 *Midnight Sapphire Navy* (`#009EF7` primary / `#7239EA` accent)
     - 🌿 *Fintech Emerald Green* (`#50CD89` primary / `#3E97FF` accent)
     - 👑 *Royal SaaS Violet* (`#7239EA` primary / `#F1416C` accent)
     - 🍯 *Wholesale Trade Amber & Gold* (`#F59E0B` primary / `#D97706` accent)
   - **Company-Specific Custom Colors**: Hex color pickers for Primary Brand Color & Secondary Accent Color with live hex code input.
   - **Interactive Typography Selector**: Switch live between *Inter*, *Plus Jakarta Sans*, *Outfit*, and *Noto Sans Arabic*.
   - **Corner Curvature (Radius) Selector**: Choose between `6px`, `10px`, `14px`, or `20px` corners.
   - **Light / Dark Mode Switcher**: 1-click toggle in topbar and studio with smooth CSS transitions.
   - **Live Interactive Preview Card**: Instant feedback of buttons, badges, inputs, and text before saving.
   - **Automatic Persistence**: All company visual preferences are stored in the browser's persistent storage and applied instantly on login and across sessions.
3. **Comprehensive View Modernization**:
   - `BrandedLoginScreen.tsx`: Clean Metronic elevated card with light/dark toggle and sandbox disclosure badge.
   - `App.tsx`: Modern topbar with dynamic primary pill highlights, company name tag, and mode toggles.
   - `MainAdminDashboard.tsx`: Clean KPI stat cards, company cards with NTN/STRN badges, edit modal, and private SaaS billing ledger.
   - `CompanyAdminDashboard.tsx`: Clean inventory catalog, 50x25mm barcode label thermal printer preview, wholesale dispatch cards, staff permissions checklist, and embedded Theme Customizer studio.
   - `SupermarketPosView.tsx`: Modern barcode wedge scanner bar, live cart table, digital net payable card, and thermal receipt modal.
   - `KiryanaPosView.tsx`: Clean electronic weight scale indicator, staple pick cards, and dual-action Cash / Udhaar Khata buttons.
   - `MandiAgriPosView.tsx`: Clean Mandi calculation matrix (40kg Mann, Bardana tare, Arhat commission %, Mazdoori), and printable slip.
   - `BahiKhataLedgerView.tsx`: Dual-column ledger with search, Naam/Jama debit/credit posting, and WhatsApp slip generation.
4. **Verification & Monorepo Build**:
   - `Turborepo: 8 packages built, 9 tasks successful (0 errors, 100% tests passing)`.

---

## [2026-09-10] - Complete Pakistani Regulatory Integration, Role Isolation & ACID Data Persistence

### 🎯 Key Enhancements & Bug Fixes:
1. **Prominent Testing & QA Disclosures**:
   - Explicitly marked the 1-Click Role Persona Testing Panel on the login screen as:
     `[🧪 DEMO / TEST ONLY - REMOVE IN PRODUCTION] / [برائے ٹیسٹنگ و ڈیمو — پروڈکشن میں حذف کریں]`
   - Target Company / Branch selector clearly designated as a Sandbox Sandbox Switcher.
2. **Pakistani Commercial Profiles & FBR Tier-1 Integration**:
   - Added full Pakistani regulatory tax parameters to company registrations and edit modals:
     - **NTN (National Tax Number)** (e.g. `3201456-7`)
     - **STRN (Sales Tax Registration Number)** (e.g. `32-77-8761-234-55`)
     - **FBR POSID & FBR Auth Token** for real-time Tier-1 digital invoice reporting
     - **Provincial Tax Authority** registration (PRA for Punjab, SRB for Sindh, KPRA for KPK, BRA for Balochistan)
     - Pakistani Cities & Provinces (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Gujranwala, Peshawar, Quetta, Sialkot, etc.)
     - Custom Receipt Print Headers & Footers and Brand Colors.
3. **Strict Main Admin Role Isolation**:
   - Main Admin is strictly isolated as the SaaS Platform Owner and **never** sees POS Counter, Product Inventories, or Store Bahi-Khata ledgers.
   - Main Admin Header navigation contains only:
     - 🏢 **Companies & FBR Data**: Full client company profiles, category switcher, edit company settings modal, and "Details & Users" inspection drawer.
     - 💳 **Private SaaS Subscriptions & Billing Ledger**: Hidden from all client companies, tracking monthly fees, MRR, overdue dues, status changes (`active`, `trial`, `grace_period`, `suspended`), and recording subscription payments (via JazzCash, Easypaisa, 1Link/Raast Bank Transfer, Cash, Cheque).
     - 👥 **Global Staff Directory**: View and manage cashiers and clerks across all registered client stores.
4. **Permanent Local Data Persistence**:
   - Connected POS Sales (`SupermarketPosView`, `KiryanaPosView`, `MandiAgriPosView`) directly to the persistent Zustand storage (`inv_master_data_v2`).
   - Every completed sale creates an immutable `OrderRecord`, decrements product stock, generates an FBR invoice number, and displays a printable receipt.
   - Kiryana loose weighing and Mandi weighment automatically post debit (`naam`) and credit (`jama`) transactions to the customer/supplier's Bahi-Khata account with real-time balance recalculation.
   - Full CRUD actions added for deleting/editing Khata accounts, Khata entries, SaaS payment transactions, companies, and staff accounts.
5. **Compilation & Test Verification**:
   - `Turborepo: 8 packages built, 9 tasks successful (0 errors, 100% tests passing)`.

---

## [2026-09-09] - Main Admin SaaS Command Center & Company Admin Sub-User Scopes

### 🎯 Key Objectives Accomplished:
1. **Two Core Login Tiers (Main Admin vs Company Admin) + Granular Sub-Users**:
   - **👑 Main Admin (Platform / Software Owner)**:
     - Can create companies and assign operating categories: **Supermarket**, **Shop / Kiryana**, **Galla Mandi Seeds & Agri**, **Wholesale FMCG Distributor**.
     - Each category unlocks specific feature sets (e.g. Mandi unlocks 40kg Mann conversion, empty bag Bardana tare deduction, Arhat commission %; Supermarket unlocks rapid barcode scanning).
     - **Private SaaS Subscriptions & Billing Tracker**: Fully private ledger allowing Main Admin to track which company paid what subscription fee, overdue license payments, monthly MRR run rate, and toggle company login access (Block/Enable). *Strictly hidden from all companies and sub-users.*
   - **🏢 Company Admin (Store Owner / General Manager)**:
     - Full customization of company settings: store name (English & Urdu), phone, address, NTN/STRN, visual brand colors, receipt print layout (header/footer text, Urdu Nastaliq toggle, FBR QR toggle).
     - Product & Catalog management with **Direct Barcode Sticker / Thermal Label Printing** modal (50x25mm standard format).
     - Orders management with payment dues tracking and warehouse dispatch status (`pending` / `dispatched` / `delivered`).
     - Can create and manage **Company Sub-Users** with granular permission checkboxes.
   - **👥 Company Sub-Users (Staff / Employees with Scoped Access)**:
     - Sub-users are strictly restricted to their granted permission checkboxes:
       - `orders_create` (Cashier - POS & billing only)
       - `products_manage` (Inventory clerk - products & barcode sticker printing only)
       - `khata_manage` (Accountant - Bahi-Khata ledger & Naam/Jama posting only)
       - `customers_manage` (Customer & supplier directory)
       - `reports_view` (Sales reports & analytics)
2. **Updated Branded Login Screen**:
   - Added 1-click test chips for **👑 Main Admin**, **🏢 Company Admin**, **🛒 POS Cashier (orders_create)**, **📦 Inventory Clerk (products_manage)**, and **📖 Accountant (khata_manage)**.
   - Blocks login with a clear message if the Main Admin has suspended that company's account.
3. **Build & Test Verification**:
   - Turborepo builds all 8 packages cleanly with `0 errors`.
   - Vitest multi-tenant test suite executed with `100% tests passing`.

---

### 📂 Master File Registry Updates:
| File Path | Action | Description |
| :--- | :---: | :--- |
| `packages/ui/src/stores/masterDataStore.ts` | **MODIFIED** | Zustand persistent store with complete CRUD for companies, SaaS ledger, products, orders, and Khata |
| `packages/ui/src/index.ts` | **MODIFIED** | Export `masterDataStore` across the monorepo |
| `packages/client-app/src/stores/useMasterDataStore.ts` | **MODIFIED** | Re-export from `@inventory/ui` |
| `packages/client-app/src/modules/admin/MainAdminDashboard.tsx` | **MODIFIED** | Main Admin portal with company edit modal, Pakistani FBR data, private SaaS ledger CRUD & history |
| `packages/client-app/src/modules/admin/CompanyAdminDashboard.tsx` | **MODIFIED** | Company Admin portal for store inventory, barcode sticker printing, orders & sub-users |
| `packages/client-app/src/modules/pos/modes/SupermarketPosView.tsx` | **MODIFIED** | Connected POS to master store with automatic stock decrementing & order recording |
| `packages/client-app/src/modules/pos/modes/KiryanaPosView.tsx` | **MODIFIED** | Connected Kiryana weighing & loose items to cash sale and Udhaar Khata posting |
| `packages/client-app/src/modules/pos/modes/MandiAgriPosView.tsx` | **MODIFIED** | Connected Mandi weighment payout to orders and Khata credit (`jama`) |
| `packages/client-app/src/modules/khata/BahiKhataLedgerView.tsx` | **MODIFIED** | Full Bahi-Khata ledger with transaction posting, deletion, and WhatsApp slip sharing |
| `packages/client-app/src/modules/auth/BrandedLoginScreen.tsx` | **MODIFIED** | Added testing/demo disclosures, dynamic company store integration, and security checks |
| `packages/client-app/src/App.tsx` | **MODIFIED** | Strict role isolation: Main Admin never sees POS/Khata; sub-users scoped by permissions |
| `CHANGELOG.md` | **MODIFIED** | Documented all modifications and verified build status |
| `PROJECT_STATUS.md` | **MODIFIED** | Updated with latest verified build status |
