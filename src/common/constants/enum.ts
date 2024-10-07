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
  vendor_id = 'vendor_id',  
  region_id = 'region_id',  
  reason = 'reason',  
  info_remark = 'info_remark',  
  status = 'status',  
  approved_by = 'approved_by',  
  rejected_by = 'rejected_by', 
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
