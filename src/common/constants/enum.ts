export enum RoleType {
  PUSAT = 'PUSAT',
  WILAYAH = 'WILAYAH',
  VENDOR = 'VENDOR',
}

export enum JobOrderType {
  'New Installation' = 'New Installation',
  'CM Replace' = 'CM Replace',
  'CM Re-init' = 'CM Re-init',
  'Preventive Maintenance' = 'Preventive Maintenance',
  'Withdrawal' = 'Withdrawal',
  'Cancel Installation' = 'Cancel Installation',
  'Cancel Withdrawal' = 'Cancel Withdrawal',
}

export enum Order {
  asc = 'asc',
  desc = 'desc',
}

export enum ColumnMenu {
  ID_MENU = 'id_menu',
  NAME = 'name',
  ROUTE = 'route',
  PATH = 'path',
  API_PATH = 'api_path',
  ICON = 'icon',
  PARENT = 'parent',
  PLATFORM = 'platform',
  IS_ACTIVE = 'isActive',
  ORDER = 'order',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  DELETED_AT = 'deleted_at',
  map = "map",
}

export enum ColumnMenuAction {
  ID_MENU_ACTION = 'id_menu_action',
  MENU_ID = 'menuId',
  NAME = 'name',
  ACTION = 'action',
  IS_ACTIVE = 'isActive',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  DELETED_AT = 'deleted_at',
}

export enum ColumnMenuRole {
  ID_MENU_ROLE = 'id_menu_role',
  MENU_ID = 'menuId',
  ROLE_ID = 'roleId',
}
export enum ColumnRoleAction {
  ID_ROLE_ACTION = 'id_role_action',
  ROLE_ID = 'roleId',
  MENU_ACTION_ID = 'menuActionId',
}

export enum ColumnRole {
  id = 'id',
  name = 'name',
  type = 'type',
  description = 'description',
}

export enum ColumnAudit  {  
  id = 'id',  
  url = 'Url',  
  ActionName = 'ActionName',  
  MenuName = 'MenuName',  
  DataBefore = 'DataBefore',  
  DataAfter = 'DataAfter',  
  UserName = 'UserName',  
  IpAddress = 'IpAddress',  
  ActivityDate = 'ActivityDate',  
  Browser = 'Browser',  
  OS = 'OS',  
  AppSource = 'AppSource',
}  


export enum NotificationCategory {
  CREATE = 'create',
  UPDATE = 'update',
  APPROVE = 'approve',
  DELETE = 'delete',
  BULK_APPROVE = 'bulk-approve',
  BULK_REJECT = 'bulk-reject',
}

export enum ColumnApprovedMerchant {
  id = 'id',
  merchant_id = 'merchant_id',
  type = 'type',
  status = 'status',
  reason = 'reason',
  info_remark = 'info_remark',
  approved_by = 'approved_by',
  rejected_by = 'rejected_by',
}

export enum NominalJobOrder {
  id = 'id',
  jenis = 'jenis',
  nominal = 'nominal',
  tipe = 'tipe',
}


export enum ColumnEDCTerpasang {
  id = 'id',
  owner_id = 'owner_id',
  merchant_id = 'merchant_id',
  mid = 'mid',
  tid = 'tid',
  brand = 'brand',
  brand_type = 'brand_type',
  serial_number = 'serial_number',
  status_owner = 'status_owner',
  status_owner_desc = 'status_owner_desc',
  status_machine = 'status_machine',
  status_machine_desc = 'status_machine_desc',
  status_active = 'status_active',
  simcard_provider = 'simcard_provider',
  simcard_number = 'simcard_number',
  info = 'info',
  region = 'region',
}

export enum ColumnReceivedIn {
  id = 'id',
  id_joborder = 'id_joborder',
  id_edc = 'id_edc',
  id_region = 'id_region',
  id_vendor = 'id_vendor',
  id_merchant = 'id_merchant',
  status = 'status',
  approved_by = 'approved_by',
  created_by = 'created_by',
  updated_by = 'updated_by',
  serial_number = 'serial_number',
  tid = 'tid',
}

export enum ColumnReceivedOut {
  id = 'id',
  id_joborder = 'id_joborder',
  id_edc = 'id_edc',
  id_region = 'id_region',
  id_vendor = 'id_vendor',
  id_merchant = 'id_merchant',
  status = 'status',
  approved_by = 'approved_by',
  created_by = 'created_by',
  updated_by = 'updated_by',
  serial_number = 'serial_number',
  tid = 'tid',
}


export enum StatusReceivedOut {
  WAITING = 'waiting',
  APPROVED = 'approved',
  REJECTED = 'rejected',
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

export enum ColumnJobOrderReport{  
  id = 'id',  
  job_order_no = 'job_order_no',  
  status = 'status',  
  status_approve = 'status_approve',  
  edc_brand = 'edc_brand',  
  edc_brand_type = 'edc_brand_type',  
  edc_serial_number = 'edc_serial_number',  
  edc_note = 'edc_note',  
  edc_action = 'edc_action',  
  edc_second_brand = 'edc_second_brand',  
  edc_second_brand_type = 'edc_second_brand_type',  
  edc_second_serial_number = 'edc_second_serial_number',  
  edc_second_note = 'edc_second_note',  
  edc_second_action = 'edc_second_action',  
  information = 'information',  
  arrival_time = 'arrival_time',  
  start_time = 'start_time',  
  end_time = 'end_time',  
  communication_line = 'communication_line',  
  direct_line_number = 'direct_line_number',  
  simcard_provider = 'simcard_provider',  
  paper_supply = 'paper_supply',  
  merchant_pic = 'merchant_pic',  
  merchant_pic_phone = 'merchant_pic_phone',  
  swipe_cash_indication = 'swipe_cash_indication',  
}

export enum ColumnPreventiveMaintenanceReport{  
  id = 'id',  
  job_order_no = 'job_order_no',  
  vendor_id = 'vendor_id',  
  mid = 'mid',  
  status = 'status',  
  status_approve = 'status_approve',  
  edc_brand = 'edc_brand',  
  edc_brand_type = 'edc_brand_type',  
  edc_serial_number = 'edc_serial_number',  
  edc_note = 'edc_note',  
  edc_action = 'edc_action',  
  information = 'information',  
  arrival_time = 'arrival_time',  
  start_time = 'start_time',  
  end_time = 'end_time',  
  communication_line = 'communication_line',  
  direct_line_number = 'direct_line_number',  
  simcard_provider = 'simcard_provider',  
  paper_supply = 'paper_supply',  
  merchant_pic = 'merchant_pic',  
  merchant_pic_phone = 'merchant_pic_phone',  
  swipe_cash_indication = 'swipe_cash_indication',  
}

export enum ColumnApproved {
  id = 'id',  
  id_jobOrder = 'id_jobOrder', 
  jo_report_id = 'jo_report_id', 
  vendor_id = 'vendor_id',  
  region_id = 'region_id',  
  reason = 'reason',  
  info_remark = 'info_remark',  
  status = 'status',  
  approved_by = 'approved_by',  
  rejected_by = 'rejected_by', 
}

export enum ColumntDocMerchant {
  id = 'id',  
  merchant_id = 'merchant_id',  
  file1 = 'file1',  
  file2 = 'file2',
  location = 'location',  
  created_by = 'created_by',
  updated_by = 'updated_by',
}

export enum ColumnDocVendor {
  id = 'id',  
  job_order_no = 'job_order_no',  
  vendor_id = 'vendor_id',  
  region_id = 'region_id',
  mid = 'mid',
  tid = 'tid',
  file1 = 'file1',  
  file2 = 'file2',  
  location = 'location',  
  created_by = 'created_by',
  updated_by = 'updated_by',
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
