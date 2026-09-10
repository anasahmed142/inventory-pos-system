# 🏪 Enterprise Inventory, POS, Wholesale Trade & Khata Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Firebase%20Hosting-blue?style=for-the-badge&logo=firebase)](https://inventory-pos-anas-142.web.app)
[![GitHub License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)](https://github.com/anasahmed142/inventory-pos-system/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)

> **A high-performance, multi-tenant, offline-first Enterprise Retail POS, Wholesale Distribution, Agricultural Mandi Kanta, and Bahi-Khata Ledger Management Suite.** Built for Pakistan & global trading markets with FBR digital tax compliance, Urdu typography, 3-tier document printing, and 1-click WhatsApp alerts.

---

## 🌐 Live Web Application

- **Production Live URL**: [**https://inventory-pos-anas-142.web.app**](https://inventory-pos-anas-142.web.app)
- **Alternative Mirror**: [https://inventory-pos-anas-142.firebaseapp.com](https://inventory-pos-anas-142.firebaseapp.com)
- **GitHub Repository**: [https://github.com/anasahmed142/inventory-pos-system](https://github.com/anasahmed142/inventory-pos-system)

---

## 🔑 Demo Access & Role Accounts

Click any demo profile on the login screen or sign in with the credentials below:

| Role | Email / ID | Default PIN | System Mode & Access Level |
| :--- | :--- | :--- | :--- |
| 👑 **Super Admin** | `admin@enterprise.pos` | `1234` | Full access to multi-tenant settings, branding, P&L analytics, and user logs. |
| 🛒 **Retail Cashier** | `cashier@supermarket.pos` | `1111` | Supermarket barcode scanning, rapid checkout, discount controls & receipt printing. |
| ⚖️ **Kiryana Counter** | `kiryana@store.pos` | `2222` | Loose weight scale calculation, fraction quantities (e.g. 0.250 kg), and Udhaar slips. |
| 📦 **Wholesale Manager**| `wholesale@distro.pos` | `3333` | 5-stage procurement lifecycle, bulk cartons/deal pricing & delivery challans. |
| 🌾 **Galla Mandi Agent**| `kanta@mandi.pos` | `4444` | Agricultural trade, Gross/Tare weight calculation, 40kg Mann conversion & Bardana cuts. |

---

## 🚀 Key Modules & Capabilities

### 1. 🛒 Multi-Mode POS & Checkout Terminals
- **Supermarket Mode**: Real-time barcode scanner stream, rapid product lookups, tax calculations, and FBR-compliant digital QR receipts.
- **Kiryana & Grocery Mode**: Precision digital weight scale decoding, fractional quantity inputs, tare deduction, and loose spice/grain pricing.
- **Galla Mandi & Agri Trade**: 40kg Mann math calculation, gross vs. tare vehicle weighing, moisture deductions, and commission kanta slips.
- **Wholesale Distribution**: Bulk pack breakdowns, trade credit verification, volume-tiered pricing, and gated customer approvals.

### 2. 📦 5-Stage Wholesale Procurement Lifecycle
Track B2B orders through complete supply chain milestones:
1. `Quotation / Pro-forma` $\rightarrow$ Draft pricing submitted to supplier/buyer.
2. `Confirmed` $\rightarrow$ Order locked in with agreed rates and credit terms.
3. `Dispatched` $\rightarrow$ Stock allocated and goods loaded onto transport.
4. `In Transit` $\rightarrow$ Driver phone number, vehicle registration number, and tracking.
5. `Delivered & Invoiced` $\rightarrow$ Goods received at godown, auto-generating tax invoice & updating inventory.

### 3. 🖨️ 3-Tier Document Printing Matrix
- 📄 **Full A4 Commercial Tax Invoice**: Formal company header, NTN/STRN tax numbers, itemized rate table, and authorized signatures.
- 📋 **A5 Commercial Delivery Challan & Gate Pass**: Consignee details, vehicle registration number, security gate entry pass, and driver sign-off.
- 🧾 **80mm & 58mm Thermal POS Slip**: High-density thermal rasterization with FBR digital verification QR codes.

### 4. 🏷️ Multi-Product & Multi-Size Barcode Label Studio
- Generate and batch-print barcodes for multiple items simultaneously.
- Standard label presets:
  - **Small (38 × 25 mm)**: Jewelry, cosmetics & small retail items.
  - **Medium (50 × 30 mm)**: Standard FMCG shelf labels & grocery packets.
  - **Large (70 × 40 mm)**: Wholesale cartons, textile rolls & godown pallets.

### 5. 📥 Excel & CSV Bulk Data Hub
- **Product Importer**: Upload `.xlsx` or `.csv` spreadsheets to import hundreds of items in seconds with automated column matching and validation preview.
- **Bahi-Khata Accounts Importer**: Bulk ingest customer & supplier ledgers with initial opening balances.
- **1-Click Export & Sample Templates**: Download pre-formatted Excel template files for instant zero-error data entry.

### 6. 📖 11-Chapter Interactive Bilingual User Manual
Integrated directly into the software interface (English & Urdu) covering:
1. Getting Started & Role Logins
2. Supermarket POS & FBR Compliance
3. Kiryana Counter & Loose Weighing
4. Wholesale Distribution & Procurement Workflow
5. Galla Mandi Seeds, Kanta Scale & 40kg Mann Calculation
6. Bahi-Khata Ledger, Debit/Credit & WhatsApp Reminders
7. Excel & CSV Bulk Data Ingestion Hub
8. 3-Format Printing Matrix & Barcode Label Studio
9. Daily Roznamcha & Real Net Profit Accounting
10. SaaS Multi-Tenant Branding Customizer
11. Rapid POS Keyboard Shortcuts

### 7. 💵 Daily Expenses & Real Net Profit Roznamcha
- Track daily operating costs (Labor/Mazdoori, Transport/Freight, Tea/Refreshment, Electricity, Shop Rent).
- Real-time P&L KPI dashboard:
  $$\text{Net Store Profit (خالص بچت)} = \text{Today's Revenue} - \text{COGS} - \text{Total Daily Expenses}$$
- 1-Click WhatsApp closing statement dispatch to business owners.

### 8. 📱 Multi-Device Responsive Matrix
- **Mobile Phones (320px–640px)**: Bottom 1-tap navigation bar, master-detail ledger switcher, and horizontal scrolling data containers.
- **Tablets & iPads (768px–1024px)**: Dual-pane split view for cart and product grid.
- **Laptops & Desktops (1024px+)**: Comprehensive 4-column KPI cards, keyboard shortcut triggers, and hardware scanner integration.

---

## 🛠️ Architecture & Tech Stack

```
inventory-pos-system/
├── apps/
│   ├── web/           # React 18 + Vite Web Application
│   ├── desktop/       # Tauri 2.0 Desktop Wrapper (Rust + React)
│   └── server/        # NestJS Sync & Multi-Tenant Backend (Optional)
├── packages/
│   ├── client-app/    # Core POS, Wholesale, Khata & Admin UI Engine
│   ├── database/      # Offline-first Dexie.js (IndexedDB) & SQLite Adapter
│   ├── hardware/      # ESC/POS Thermal Printer, Serial Scale & Barcode Engine
│   ├── shared-types/  # TypeScript Domain Models & Interfaces
│   └── ui/            # Reusable Design System & Tailwind Components
```

- **Frontend**: React 18, TypeScript, TailwindCSS, Lucide Icons, Canvas ESC/POS Rasterizer.
- **Persistence**: IndexedDB (Dexie.js) for instantaneous 100% offline-first execution with $0 hosting overhead.
- **Desktop Runtime**: Tauri 2.0 (Rust backend with native hardware access).
- **Monorepo Management**: Turborepo & PNPM Workspaces.
- **Hosting & CI/CD**: Firebase Hosting (Spark Plan - 100% Free Forever) with automated GitHub Actions on `main` push.

---

## 💻 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20+)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

### 1. Clone the repository
```bash
git clone https://github.com/anasahmed142/inventory-pos-system.git
cd inventory-pos-system
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Run Development Server
```bash
# Start Web application
pnpm dev:web

# Or start Desktop Tauri app
pnpm dev:desktop
```
Open [http://localhost:3001](http://localhost:3001) in your web browser.

### 4. Build Production Bundles
```bash
pnpm build
```

### 5. Run Automated Test Suite
```bash
pnpm test
```

---

## 🔄 Automated CI/CD Deployment

The repository is configured with **GitHub Actions** (`.github/workflows/deploy-main.yml`).

- **Rule**: Pushes to the **`main` branch only** will automatically trigger a clean build and deploy live to Firebase Hosting.
- Pushes to feature branches (`feat/*`, `fix/*`, `dev`) will **not** trigger production deployment.

### Manual Live Deployment (Terminal)
```bash
# Build the project
pnpm build

# Deploy to Firebase Hosting
npx firebase-tools deploy --only hosting
```

---

## ⌨️ POS Keyboard Shortcuts Reference

| Key | Action |
| :--- | :--- |
| <kbd>F1</kbd> | Search / Focus Product Barcode Bar |
| <kbd>F2</kbd> | Open Bahi-Khata Customer Selection |
| <kbd>F4</kbd> | Direct Cash Payment Checkout |
| <kbd>F8</kbd> | Select Udhaar / Credit Ledger Account |
| <kbd>F9</kbd> | Toggle Kiryana Weight Scale Integration |
| <kbd>F12</kbd> | Instant Print Last Receipt / Invoice |
| <kbd>Esc</kbd> | Cancel / Clear Current Cart |

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
