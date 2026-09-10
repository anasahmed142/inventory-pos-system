-- INVENTORY SYSTEM: PHASE 1 CORE DATABASE SCHEMA
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    urdu_name VARCHAR(255),
    ntn VARCHAR(50),
    strn VARCHAR(50),
    logo_base64 TEXT,
    primary_color VARCHAR(20) DEFAULT '#0f766e',
    secondary_color VARCHAR(20) DEFAULT '#f59e0b',
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('super_admin', 'admin', 'cashier', 'accountant')),
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    urdu_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS units (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    urdu_name VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    base_multiplier NUMERIC(12,4) NOT NULL,
    is_system BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36),
    barcode VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    urdu_name VARCHAR(255),
    default_unit_id VARCHAR(36) NOT NULL,
    is_weighted BOOLEAN DEFAULT 0,
    cost_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    retail_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    wholesale_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    min_stock_threshold NUMERIC(12,2) DEFAULT 10.00,
    is_seed_or_chem BOOLEAN DEFAULT 0,
    germination_rate NUMERIC(5,2),
    purity_rate NUMERIC(5,2),
    expiry_date TIMESTAMP,
    current_stock NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (default_unit_id) REFERENCES units(id)
);

CREATE TABLE IF NOT EXISTS batches_lots (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    lot_number VARCHAR(100) NOT NULL,
    bardana_deduction_kg NUMERIC(12,2) DEFAULT 0.00,
    stock_quantity NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    packing_date TIMESTAMP,
    test_valid_until TIMESTAMP,
    expiry_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS parties (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    party_type VARCHAR(30) NOT NULL CHECK (party_type IN ('customer', 'supplier', 'beopari', 'zamindar')),
    name VARCHAR(255) NOT NULL,
    urdu_name VARCHAR(255),
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    cnic VARCHAR(30),
    address TEXT,
    credit_limit NUMERIC(12,2) DEFAULT 0.00,
    current_balance NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    invoice_no VARCHAR(100) NOT NULL,
    party_id VARCHAR(36),
    order_type VARCHAR(30) NOT NULL CHECK (order_type IN ('retail', 'wholesale', 'mandi_purchase')),
    total_gross NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    tare_deduction NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    total_discount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    balance_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('cash', 'bank', 'jazzcash', 'easypaisa', 'udhaar')),
    status VARCHAR(30) NOT NULL CHECK (status IN ('completed', 'dispatched', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    batch_id VARCHAR(36),
    quantity NUMERIC(12,2) NOT NULL,
    unit_id VARCHAR(36) NOT NULL,
    unit_rate NUMERIC(12,2) NOT NULL,
    bardana_tare_deducted NUMERIC(12,2) DEFAULT 0.00,
    line_total NUMERIC(12,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (batch_id) REFERENCES batches_lots(id) ON DELETE SET NULL,
    FOREIGN KEY (unit_id) REFERENCES units(id)
);

CREATE TABLE IF NOT EXISTS ledger_entries (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    party_id VARCHAR(36) NOT NULL,
    order_id VARCHAR(36),
    entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('jama', 'naam')),
    amount NUMERIC(12,2) NOT NULL,
    balance_after NUMERIC(12,2) NOT NULL,
    description TEXT,
    urdu_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sync_outbox (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    payload_json TEXT NOT NULL,
    client_version INTEGER NOT NULL DEFAULT 1,
    created_at_utc TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_status VARCHAR(20) NOT NULL CHECK (sync_status IN ('pending', 'synced', 'failed')) DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    last_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_products_tenant_barcode ON products(tenant_id, barcode);
CREATE INDEX IF NOT EXISTS idx_parties_phone ON parties(tenant_id, phone);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_invoice ON orders(tenant_id, invoice_no);
CREATE INDEX IF NOT EXISTS idx_ledger_party_created ON ledger_entries(tenant_id, party_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sync_status ON sync_outbox(tenant_id, sync_status, created_at_utc);