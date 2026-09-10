// packages/shared-types/src/index.ts

export type UserRole = 'main_admin' | 'company_admin' | 'sub_user' | 'super_admin' | 'admin' | 'cashier' | 'accountant';

export type UserPermission =
  | 'orders_create'      // Can create POS & wholesale orders / billing
  | 'products_manage'   // Can create & edit products, categories & barcodes
  | 'khata_manage'      // Can view Bahi-Khata ledger, post Naam/Jama entries
  | 'customers_manage'  // Can create customers, suppliers & vendors
  | 'reports_view'      // Can view sales reports & analytics
  | 'settings_edit';    // Can edit company branding, colors & receipt templates

export type CompanyCategory = 'supermarket' | 'shop_kiryana' | 'wholesale_distributor' | 'wholesale' | 'grain_mandi_seeds';

export type UnitSymbol = 'pc' | 'kg' | 'g' | 'pao' | 'mann' | 'bori50' | 'bori25' | string;

export type PartyType = 'customer' | 'supplier' | 'beopari' | 'zamindar';

export type OrderType = 'retail' | 'wholesale' | 'mandi_purchase';

export type PaymentMethod = 'cash' | 'bank' | 'jazzcash' | 'easypaisa' | 'udhaar';

export type OrderStatus = 'completed' | 'dispatched' | 'pending' | 'cancelled';

export type LedgerEntryType = 'jama' | 'naam';

export type SyncOperation = 'INSERT' | 'UPDATE' | 'DELETE';

export type SyncStatus = 'pending' | 'synced' | 'failed';

export interface TenantSubscription {
  id: string;
  tenant_id: string;
  tenant_name: string;
  plan_name: 'Starter' | 'Professional' | 'Enterprise' | 'Custom';
  fee_amount: number;
  total_paid: number;
  remaining_dues: number;
  status: 'active' | 'trial' | 'suspended' | 'grace_period';
  access_tier: 'full_access' | 'standard' | 'restricted';
  billing_cycle: 'monthly' | 'quarterly' | 'annual' | 'lifetime';
  start_date: string;
  next_due_date: string;
  last_payment_date: string;
  admin_private_notes: string;
}

export interface Tenant {
  id: string;
  name: string;
  urdu_name?: string | null;
  category: CompanyCategory;
  ntn?: string | null;
  strn?: string | null;
  logo_base64?: string | null;
  primary_color: string;
  secondary_color: string;
  phone?: string | null;
  address?: string | null;
  is_login_enabled: boolean;
  print_header_text?: string | null;
  print_footer_text?: string | null;
  show_fbr_qr: boolean;
  show_urdu_receipt: boolean;
  created_at: string;
}

export interface User {
  id: string;
  tenant_id: string;
  username: string;
  password_hash?: string;
  pin: string;
  full_name: string;
  role: UserRole;
  permissions: UserPermission[];
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  urdu_name?: string | null;
  created_at: string;
}

export interface Unit {
  id: string;
  tenant_id: string;
  name: string;
  urdu_name: string;
  symbol: UnitSymbol;
  base_multiplier: number;
  is_system: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  category_id?: string | null;
  barcode?: string | null;
  name: string;
  urdu_name?: string | null;
  default_unit_id: string;
  is_weighted: boolean;
  cost_price: number;
  retail_price: number;
  wholesale_price: number;
  min_stock_threshold: number;
  is_seed_or_chem: boolean;
  germination_rate?: number | null;
  purity_rate?: number | null;
  expiry_date?: string | null;
  current_stock: number;
  created_at: string;
  updated_at: string;
}

export interface BatchLot {
  id: string;
  tenant_id: string;
  product_id: string;
  lot_number: string;
  bardana_deduction_kg: number;
  stock_quantity: number;
  packing_date?: string | null;
  test_valid_until?: string | null;
  expiry_date?: string | null;
  created_at: string;
}

export interface Party {
  id: string;
  tenant_id: string;
  party_type: PartyType;
  name: string;
  urdu_name?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  cnic?: string | null;
  address?: string | null;
  credit_limit: number;
  current_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  tenant_id: string;
  invoice_no: string;
  party_id?: string | null;
  order_type: OrderType;
  total_gross: number;
  tare_deduction: number;
  total_discount: number;
  net_amount: number;
  paid_amount: number;
  balance_amount: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  batch_id?: string | null;
  quantity: number;
  unit_id: string;
  unit_rate: number;
  bardana_tare_deducted: number;
  line_total: number;
}

export interface LedgerEntry {
  id: string;
  tenant_id: string;
  party_id: string;
  order_id?: string | null;
  entry_type: LedgerEntryType;
  amount: number;
  balance_after: number;
  description?: string | null;
  urdu_description?: string | null;
  created_at: string;
}

export interface SyncOutboxItem {
  id: string;
  tenant_id: string;
  entity_name: string;
  entity_id: string;
  operation: SyncOperation;
  payload_json: string;
  client_version: number;
  created_at_utc: string;
  sync_status: SyncStatus;
  retry_count: number;
  last_error?: string | null;
}

export interface MandiWeighmentBreakdown {
  bag_count: number;
  gross_weight_kg: number;
  bardana_rate_per_bag_kg: number;
  total_tare_kg: number;
  net_weight_kg: number;
  net_mann: number;
  rate_per_mann: number;
  gross_value: number;
  arhat_commission_pct: number;
  arhat_amount: number;
  mazdoori_charges: number;
  chungi_kanta_fee: number;
  final_payable_to_grower: number;
}