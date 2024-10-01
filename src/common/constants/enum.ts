export enum RoleType {
  PUSAT = 'PUSAT',
  WILAYAH = 'WILAYAH',
  VENDOR = 'VENDOR',
}

export enum JobOrderType {
  'New Installation' = 'New Installation',
  'CM Replace' = 'CM Replace',
  'CM Re-init' = 'CM Re-init',
  'Withdrawal' = 'Withdrawal',
  'Cancel Installation' = 'Cancel Installation',
  'Cancel Withdrawal' = 'Cancel Withdrawal',
}

export enum Order {
  asc = 'asc',
  desc = 'desc',
}

export enum ColumnRole {
  id = 'id',
  name = 'name',
  type = 'type',
  description = 'description',
}

export enum ColumnUser {
  id = 'id',
  role_id = 'role_id',
  region_id = 'region_id',
  vendor_id = 'vendor_id',
  name = 'name',
  email = 'email',
  npp = 'npp',
  dob = 'dob',
  phone = 'phone',
}

export enum ColumnVendor {
  id = 'id',
  name = 'name',
  code = 'code',
  description = 'description',
}

export enum ColumnRegion {
  id = 'id',
  name = 'name',
  code = 'code',
  description = 'description',
}

export enum ColumnJobOrder {
  id = 'id',
  no = 'no',
  type = 'type',
  vendor_id = 'vendor_id',
  region_id = 'region_id',
  mid = 'mid',
  tid = 'tid',
  status = 'status',
  merchant_name = 'merchant_name',
  merchant_category = 'merchant_category',
  ownership = 'ownership',
  'vendor.name' = 'vendor.name',
  'region.name' = 'region.name',
}

export enum Ownersip {
  'Milik' = 'Milik',
  'Sewa' = 'Sewa',
}

export enum JobOrderStatus {
  'Open' = 'Open',
  'Acknowledge' = 'Acknowledge',
  'Done' = 'Done',
  'Cancel' = 'Cancel',
}

export enum Widget {
  SHORT_FIELD = 'SHORT_FIELD',
  LONG_FIELD = 'LONG_FIELD',
  NUMBER_FIELD = 'NUMBER_FIELD',
  RADIO_BUTTON = 'RADIO_BUTTON',
  CHECKBOX = 'CHECKBOX',
  DROPDOWN = 'DROPDOWN',
  UPLOAD_FILE = 'UPLOAD_FILE',
  DATE = 'DATE',
  TIME = 'TIME',
  DATETIME = 'DATETIME',
}
