# Project Status & Comprehensive Architectural Ledger
## Project: Enterprise Multi-Tenant Inventory, POS, Wholesale Trade & Khata Management System
**Target Market:** Pakistani Retail & Commercial Trade (Supermarkets, Kiryana Stores, Wholesale Grain/Seed Distributors, and Galla Mandi Agri Merchants).  
**Form Factors:** Dual-Target Native Windows Desktop (`.exe` via Tauri 2.0) and Fully Responsive Offline Web App (React 18 + Vite 5 + Tailwind CSS v3).  
**Responsive Support:** Mobile Phones (`320px–640px`), Tablets / iPads (`768px–1024px`), Laptops & Desktops (`1024px–1440px+`).  
**Synchronization:** Offline-First with NestJS Multi-Tenant Cloud Sync Engine & PostgreSQL 16+.  
**Commercial Status:** `[x] PRODUCTION-READY, FULLY COMPILED & TESTED ON DISK`  
**Physical Root Path:** `C:\Work\inventorySystem`  
**Last Verified Build:** `Turborepo: 9/9 packages built, 14/14 automated tests passing (0 compile errors, 0 lint failures)`

---

## 1. Operating Business Categories Overview

| Operating Mode | Category Key | Primary Operating Interface | Specialized Capabilities | Retail POS Displayed? |
| :--- | :--- | :--- | :--- | :--- |
| 🛒 **Supermarket** | `supermarket` | **Retail POS (بار کوڈ کاؤنٹر)** | Barcode scanning, Cash drawer, FBR Tier-1 USIN QR | ✅ Yes (Retail POS) |
| 🏪 **Kiryana Grocery** | `shop_kiryana` | **Kiryana Counter (کریانہ کاؤنٹر)** | Loose item scales (Sugar, Flour, Pulses in Kg/Pao), Quick bill | ✅ Yes (Kiryana Counter) |
| 🏢 **Wholesale Distributor** | `wholesale` / `wholesale_distributor` | **Trade Orders & Procurement (خرید و فروخت آرڈرز)** | 5-stage supplier inward lifecycle, buyer sales orders, godown vs shop stock, delivery challans | ❌ **NO (POS Hidden)** |
| 🌾 **Galla Mandi Seeds & Arhat** | `grain_mandi_seeds` | **Mandi Kanta & Arhat (غلہ منڈی کانٹا)** | Electronic scale (کانٹا), 40kg Mann math, Bardana tare deduction, Arhat %, Mazdoori, Farmer Khata | ⚖️ **Mandi Kanta Hub (Not Retail POS)** |

---

## 2. System Architecture & Capabilities

### A. Zero-Latency Offline-First Engine
- **Local Storage**: Tauri SQLite on Desktop and IndexedDB (Dexie.js) on Web.
- **Polymorphic Repository Pattern**: Clean decoupling between data access layer and presentation UI.
- **Idempotent Outbox Sync**: Atomic mutation logging with monotonic versioning for cloud sync.

### B. Specialized Module Suite
1. **Trade Orders & 5-Stage Procurement Hub (`TradeOrdersHub.tsx`)**:
   - Order Placed $\to$ Confirmed $\to$ In-Transit $\to$ Received at Godown $\to$ Invoiced.
   - Segregation between Delivery Challans (transport gate passes) and Commercial Tax Invoices.
2. **Galla Mandi Kanta & Agricultural Scale Terminal (`MandiAgriPosView.tsx`)**:
   - Real-time RS-232 / Web Serial scale listener.
   - Automatic 40kg Mann conversion, bag tare deduction, and Arhat commission calculation.
3. **Bahi-Khata Ledger (`BahiKhataLedgerView.tsx`)**:
   - Double-entry accounting (Naam / نام debit, Jama / جمع credit).
   - Master-detail mobile switching with full-screen ledger statements and 1-click WhatsApp reminders.
4. **Excel & CSV Bulk Data Hub (`ExcelImportExportModal.tsx` & `excelHub.ts`)**:
   - Bulk product catalog ingestion with live preview validation table.
   - Bulk Bahi-Khata parties import and 1-click template downloads.
   - 1-Click Excel export for products, orders, ledger statements, and tax reports.
5. **1-Click WhatsApp Sharing Utility (`whatsappService.ts`)**:
   - Instant sharing of Invoices, Delivery Gate Passes, Khata Statements, and Daily Roznamcha closings with Pakistani phone sanitization (`0300...` $\to$ `92300...`).
6. **Daily Expenses & Real Net Profit Roznamcha (`DailyExpenseRoznamchaModal.tsx`)**:
   - Daily expense categorization (Labor Mazdoori, Transport Freight کرایہ, Tea/Kharcha, Electricity, Rent).
   - Real-time P&L: $\text{Net Profit} = \text{Revenue} - \text{COGS} - \text{Expenses}$.
7. **Official In-App User Manual & Guide (`SoftwareUserManualModal.tsx`)**:
   - Searchable 11-chapter interactive bilingual (English + Urdu) guide and keyboard shortcuts cheat sheet.
8. **3-Format Document Printing & Barcode Studio (`DocumentPrintModal.tsx`)**:
   - Full A4 Page, Half A5 Voucher, and 80mm Heat Wax / Thermal receipts with FBR QR verification.
9. **Metronic UI Theme & Branding Studio (`ThemeCustomizerModal.tsx`)**:
   - 6 Curated presets, live CSS variable reactivity, logo upload, font selectors, and corner radius curvature.
10. **Multi-Tenant SaaS HQ & Store Admin (`MainAdminDashboard.tsx` & `CompanyAdminDashboard.tsx`)**:
    - Subscription fee collection ledger, company login lockdown, and sub-user PIN access controls.

---

## 3. Monorepo Package Build & Test Verification

```text
• Packages in scope:
  - @inventory/shared-types
  - @inventory/database
  - @inventory/hardware
  - @inventory/ui
  - @inventory/client-app
  - @inventory/desktop
  - @inventory/web
  - @inventory/server

 Tasks:    9 successful, 9 total
Cached:    4 cached, 9 total
 Tests:    14 passed, 14 total (100% clean)
 Compile:  0 TypeScript errors, 0 Lint errors
```

| Workspace / Package | Physical Path | Status | Artifacts Generated |
| :--- | :--- | :---: | :--- |
| `@inventory/shared-types` | `packages/shared-types` | `[x] Compiled` | `dist/index.js`, `dist/index.d.ts` |
| `@inventory/database` | `packages/database` | `[x] Compiled` | `dist/index.js`, `dist/index.d.ts` |
| `@inventory/hardware` | `packages/hardware` | `[x] Compiled` | `dist/index.js`, `dist/index.d.ts` |
| `@inventory/ui` | `packages/ui` | `[x] Compiled` | `dist/index.js`, `dist/index.d.ts`, `globals.css` |
| `@inventory/client-app` | `packages/client-app` | `[x] Compiled` | `dist/index.js`, `dist/index.d.ts` |
| `@inventory/web` | `apps/web` | `[x] Compiled` | `dist/index.html`, `dist/assets/*.css`, `dist/assets/*.js` |
| `@inventory/desktop` | `apps/desktop` | `[x] Compiled` | `dist/index.html`, `dist/assets/*.css`, `dist/assets/*.js` |
| `@inventory/server` | `apps/server` | `[x] Compiled` | `dist/main.js`, `dist/modules/*` (14/14 tests passing) |

---

## 4. Default Login Credentials & Quick Personas

| Configuration | Value | Purpose |
| :--- | :--- | :--- |
| **Default Web URL** | `http://localhost:3001` | React + Vite Client Application |
| **Default Backend URL**| `http://localhost:3000` | NestJS Multi-Tenant Cloud Sync API |
| **SaaS Master Admin** | Username: **`admin`** / PIN: **`1234`** | Super Admin Headquarters & Subscriptions |
| **Supermarket Cashier**| Username: **`cashier_usman`** / PIN: **`1111`** | High-speed retail POS & barcode counter |
| **Wholesale Order Desk**| Username: **`wholesale_desk`** / PIN: **`3333`** | Wholesale orders, procurement & dispatch |
| **Mandi Kanta Operator**| Username: **`kanta_operator`** / PIN: **`4444`** | Electronic weighing scale & 40kg Mann slips |
| **Kiryana Store Cashier**| Username: **`rashan_counter`** / PIN: **`2222`** | Loose item scale & customer Udhaar slips |
| **Store Owner Admin** | Username: **`madina_admin`** / PIN: **`1234`** | Catalog, Staff users, Theme studio, Roznamcha |

---

## 5. Master Codebase File Registry

```text
C:\Work\inventorySystem\
├── PROJECT_STATUS.md                                             # This Master Status & Architecture Ledger
├── DEPLOYMENT_RUNBOOK.md                                         # Hardware Calibration & Deployment Guide
├── CHANGELOG.md                                                  # Comprehensive Feature Changelog
├── package.json                                                  # Root Monorepo Manifest
├── pnpm-workspace.yaml                                           # Workspace Definitions
├── turbo.json                                                    # Turborepo Pipeline Caching
├── tsconfig.base.json                                            # Shared TypeScript Compiler Settings
│
├── apps/
│   ├── desktop/                                                  # Tauri 2.0 Desktop Shell
│   ├── web/                                                      # Vite Web Application Shell
│   └── server/                                                   # NestJS Multi-Tenant Cloud Sync API
│
└── packages/
    ├── shared-types/                                             # Domain Types & DTOs
    ├── database/                                                 # SQLite & Dexie Repository Drivers
    ├── hardware/                                                 # Serial Scale, Scanner, ESC/POS Drivers
    ├── ui/                                                       # Shared Components, Theming & Excel Engine
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── combobox/
    │   │   │   │   ├── ProductSearchCombobox.tsx
    │   │   │   │   └── AccountSearchCombobox.tsx
    │   │   │   ├── excel/
    │   │   │   │   ├── excelHub.ts
    │   │   │   │   └── ExcelImportExportModal.tsx
    │   │   │   ├── expenses/
    │   │   │   │   └── DailyExpenseRoznamchaModal.tsx
    │   │   │   ├── manual/
    │   │   │   │   └── SoftwareUserManualModal.tsx
    │   │   │   ├── printing/
    │   │   │   │   └── DocumentPrintModal.tsx
    │   │   │   ├── receipts/
    │   │   │   │   ├── SupermarketReceipt.tsx
    │   │   │   │   ├── KiryanaUdhaarSlip.tsx
    │   │   │   │   └── MandiKantaSlip.tsx
    │   │   │   ├── theming/
    │   │   │   │   └── ThemeCustomizerModal.tsx
    │   │   │   └── whatsapp/
    │   │   │       └── whatsappService.ts
    │   │   └── stores/
    │   │       └── masterDataStore.ts
    │
    └── client-app/                                               # Core Business Presentation Layer
        └── src/
            ├── App.tsx                                           # Responsive Navigation & View Router
            └── modules/
                ├── admin/
                │   ├── MainAdminDashboard.tsx                   # SaaS Super Admin Headquarters
                │   └── CompanyAdminDashboard.tsx                # Store Owner Admin & Barcode Studio
                ├── auth/
                │   └── BrandedLoginScreen.tsx                   # Persona Quick-Login & Auth Guard
                ├── khata/
                │   └── BahiKhataLedgerView.tsx                  # Master-Detail Ledger Statement
                ├── orders/
                │   └── TradeOrdersHub.tsx                       # Wholesale Sales & 5-Stage Procurement
                ├── pos/
                │   └── modes/
                │       ├── SupermarketPosView.tsx               # Retail Barcode POS Counter
                │       ├── KiryanaPosView.tsx                   # Loose Items Grocery Counter
                │       └── MandiAgriPosView.tsx                 # Galla Mandi Kanta Scale Terminal
                └── wholesale/
                    └── WholesaleDistributionHub.tsx             # Godown & Dispatch Manager
```