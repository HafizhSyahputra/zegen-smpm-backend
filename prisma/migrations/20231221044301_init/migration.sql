BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [role_id] INT NOT NULL,
    [region_id] INT,
    [vendor_id] INT,
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [npp] NVARCHAR(1000) NOT NULL,
    [dob] DATETIME2,
    [phone] NVARCHAR(1000),
    [created_by] INT,
    [updated_by] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [User_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email]),
    CONSTRAINT [User_npp_key] UNIQUE NONCLUSTERED ([npp])
);

-- CreateTable
CREATE TABLE [dbo].[UserSession] (
    [id] INT NOT NULL IDENTITY(1,1),
    [user_id] INT NOT NULL,
    [identifier] NVARCHAR(1000) NOT NULL,
    [access_token] NVARCHAR(1000),
    [refresh_token] NVARCHAR(1000),
    [created_by] INT,
    [updated_by] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [UserSession_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    CONSTRAINT [UserSession_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserSession_user_id_identifier_key] UNIQUE NONCLUSTERED ([user_id],[identifier])
);

-- CreateTable
CREATE TABLE [dbo].[Role] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [created_by] INT,
    [updated_by] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [Role_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    CONSTRAINT [Role_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Role_name_key] UNIQUE NONCLUSTERED ([name]),
    CONSTRAINT [Role_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[Vendor] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [created_by] INT,
    [updated_by] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [Vendor_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    CONSTRAINT [Vendor_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Vendor_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[Region] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [created_by] INT,
    [updated_by] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [Region_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    CONSTRAINT [Region_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Region_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[Merchant] (
    [id] INT NOT NULL IDENTITY(1,1),
    [region_id] INT NOT NULL,
    [mid] INT NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [category] NVARCHAR(1000) NOT NULL,
    [customer_name] NVARCHAR(1000) NOT NULL,
    [telephone] NVARCHAR(1000),
    [pic] NVARCHAR(1000) NOT NULL,
    [phone1] NVARCHAR(1000) NOT NULL,
    [phone2] NVARCHAR(1000),
    [address1] NVARCHAR(1000) NOT NULL,
    [address2] NVARCHAR(1000) NOT NULL,
    [address3] NVARCHAR(1000) NOT NULL,
    [address4] NVARCHAR(1000) NOT NULL,
    [district] NVARCHAR(1000),
    [subdistrict] NVARCHAR(1000),
    [city] NVARCHAR(1000),
    [province] NVARCHAR(1000),
    [postal_code] NVARCHAR(1000) NOT NULL,
    [created_by] INT,
    [updated_by] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [Merchant_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    CONSTRAINT [Merchant_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Merchant_mid_key] UNIQUE NONCLUSTERED ([mid])
);

-- CreateTable
CREATE TABLE [dbo].[ElectronicDataCaptureMachine] (
    [id] INT NOT NULL IDENTITY(1,1),
    [owner_id] INT,
    [mid] NVARCHAR(1000) NOT NULL,
    [tid] NVARCHAR(1000) NOT NULL,
    [brand] NVARCHAR(1000) NOT NULL,
    [brand_type] NVARCHAR(1000) NOT NULL,
    [serial_number] NVARCHAR(1000) NOT NULL,
    [status_owner] NVARCHAR(1000) NOT NULL,
    [status_owner_desc] NVARCHAR(1000),
    [status_machine] NVARCHAR(1000) NOT NULL,
    [status_machine_desc] NVARCHAR(1000),
    [status_active] BIT NOT NULL,
    [simcard_provider] NVARCHAR(1000),
    [simcard_number] NVARCHAR(1000),
    [info] NVARCHAR(1000),
    [region] NVARCHAR(1000),
    [created_by] INT,
    [updated_by] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [ElectronicDataCaptureMachine_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    CONSTRAINT [ElectronicDataCaptureMachine_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[JobOrder] (
    [id] INT NOT NULL IDENTITY(1,1),
    [vendor_id] INT NOT NULL,
    [region_id] INT NOT NULL,
    [no] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [date] DATE NOT NULL,
    [mid] NVARCHAR(1000) NOT NULL,
    [tid] NVARCHAR(1000) NOT NULL,
    [office_name] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL,
    [merchant_name] NVARCHAR(1000) NOT NULL,
    [address1] NVARCHAR(1000) NOT NULL,
    [address2] NVARCHAR(1000) NOT NULL,
    [address3] NVARCHAR(1000) NOT NULL,
    [address4] NVARCHAR(1000) NOT NULL,
    [subdistrict] NVARCHAR(1000),
    [village] NVARCHAR(1000),
    [city] NVARCHAR(1000),
    [postal_code] NVARCHAR(1000),
    [pic] NVARCHAR(1000) NOT NULL,
    [phone_number1] NVARCHAR(1000) NOT NULL,
    [phone_number2] NVARCHAR(1000),
    [provider] NVARCHAR(1000),
    [trx_type_mini_atm] NVARCHAR(1000),
    [trx_type_visa] NVARCHAR(1000),
    [trx_type_master] NVARCHAR(1000),
    [trx_type_jcb] NVARCHAR(1000),
    [trx_type_maestro] NVARCHAR(1000),
    [trx_type_gpn] NVARCHAR(1000),
    [trx_type_tapcash_topup] NVARCHAR(1000),
    [trx_type_tapcash_purchase] NVARCHAR(1000),
    [trx_type_qrcode_qris] NVARCHAR(1000),
    [trx_type_qrcode_linkaja] NVARCHAR(1000),
    [trx_type_contactless_master] NVARCHAR(1000),
    [trx_type_contractless_visa] NVARCHAR(1000),
    [edc_facility_cepp_plan1] NVARCHAR(1000),
    [edc_facility_cepp_plan2] NVARCHAR(1000),
    [edc_facility_cepp_plan3] NVARCHAR(1000),
    [edc_facility_reedem_point] NVARCHAR(1000),
    [edc_facility_activation_keyinsales] NVARCHAR(1000),
    [edc_facility_activation_keyinsales_keyinpreauth_completion] NVARCHAR(1000),
    [edc_facility_activation_keyinpreauth_completion] NVARCHAR(1000),
    [edc_facility_activation_preauth_completion] NVARCHAR(1000),
    [edc_facility_activation_keyinsales_preauth_completion] NVARCHAR(1000),
    [edc_facility_offline] NVARCHAR(1000),
    [edc_facility_card_ver] NVARCHAR(1000),
    [edc_facility_refund] NVARCHAR(1000),
    [edc_facility_adjust_tip] NVARCHAR(1000),
    [trx_test_credit] NVARCHAR(1000),
    [trx_test_debit] NVARCHAR(1000),
    [trx_test_inquiry] NVARCHAR(1000),
    [trx_test_transfer] NVARCHAR(1000),
    [trx_test_jcb] NVARCHAR(1000),
    [trx_test_gpn] NVARCHAR(1000),
    [trx_test_tapcash] NVARCHAR(1000),
    [trx_test_qris] NVARCHAR(1000),
    [trx_test_linkaja] NVARCHAR(1000),
    [trx_test_visa_contactless] NVARCHAR(1000),
    [trx_test_master_contactless] NVARCHAR(1000),
    [trx_test_instalment] NVARCHAR(1000),
    [trx_test_reedemption] NVARCHAR(1000),
    [thermal_paper] INT NOT NULL,
    [sticker_bni] NVARCHAR(1000),
    [acrylic] NVARCHAR(1000),
    [description1] NVARCHAR(1000),
    [description2] NVARCHAR(1000),
    [merchant_category] NVARCHAR(1000),
    [ownership] NVARCHAR(1000) NOT NULL,
    [created_by] INT,
    [updated_by] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [JobOrder_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    CONSTRAINT [JobOrder_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [JobOrder_no_key] UNIQUE NONCLUSTERED ([no])
);

-- CreateTable
CREATE TABLE [dbo].[Media] (
    [id] INT NOT NULL IDENTITY(1,1),
    [filename] NVARCHAR(1000) NOT NULL,
    [ext] NVARCHAR(1000) NOT NULL,
    [size] INT NOT NULL,
    [mime] NVARCHAR(1000) NOT NULL,
    [path] NVARCHAR(1000) NOT NULL,
    [destination] NVARCHAR(1000) NOT NULL,
    [created_by] INT,
    [updated_by] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [Media_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    CONSTRAINT [Media_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[JobOrderReport] (
    [id] INT NOT NULL IDENTITY(1,1),
    [job_order_no] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [edc_brand] NVARCHAR(1000) NOT NULL,
    [edc_brand_type] NVARCHAR(1000) NOT NULL,
    [edc_serial_number] NVARCHAR(1000) NOT NULL,
    [edc_note] NVARCHAR(1000),
    [edc_action] NVARCHAR(1000),
    [information] NVARCHAR(1000) NOT NULL,
    [arrival_time] DATETIME2,
    [start_time] DATETIME2,
    [end_time] DATETIME2,
    [communication_line] NVARCHAR(1000),
    [direct_line_number] NVARCHAR(1000),
    [simcard_provider] NVARCHAR(1000),
    [paper_supply] NVARCHAR(1000),
    [merchant_pic] NVARCHAR(1000),
    [merchant_pic_phone] NVARCHAR(1000),
    [swipe_cash_indication] NVARCHAR(1000),
    [created_by] INT,
    [updated_by] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [JobOrderReport_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    CONSTRAINT [JobOrderReport_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[JobOrderReportProduct] (
    [id] INT NOT NULL IDENTITY(1,1),
    [job_order_report_id] INT NOT NULL,
    [product] NVARCHAR(1000) NOT NULL,
    [serial_number] NVARCHAR(1000) NOT NULL,
    [note] NVARCHAR(1000),
    [action] NVARCHAR(1000),
    [created_by] INT,
    [updated_by] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [JobOrderReportProduct_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    CONSTRAINT [JobOrderReportProduct_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[JobOrderReportEdcEquipmentDongle] (
    [id] INT NOT NULL IDENTITY(1,1),
    [job_order_report_id] INT NOT NULL,
    [battery_cover] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_battery_cover_df] DEFAULT 0,
    [battery] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_battery_df] DEFAULT 0,
    [edc_adapter] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_edc_adapter_df] DEFAULT 0,
    [edc_bracket] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_edc_bracket_df] DEFAULT 0,
    [edc_holder] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_edc_holder_df] DEFAULT 0,
    [dongle_holder] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_dongle_holder_df] DEFAULT 0,
    [dongle_adapter] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_dongle_adapter_df] DEFAULT 0,
    [cable_ecr] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_cable_ecr_df] DEFAULT 0,
    [cable_lan] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_cable_lan_df] DEFAULT 0,
    [cable_telephone_line] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_cable_telephone_line_df] DEFAULT 0,
    [mid_tid] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_mid_tid_df] DEFAULT 0,
    [magic_box] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_magic_box_df] DEFAULT 0,
    [transaction_guide] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_transaction_guide_df] DEFAULT 0,
    [pin_cover] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_pin_cover_df] DEFAULT 0,
    [telephone_line_splitter] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_telephone_line_splitter_df] DEFAULT 0,
    [sticker_bank] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_sticker_bank_df] DEFAULT 0,
    [sticer_dongle] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_sticer_dongle_df] DEFAULT 0,
    [sticer_gpn] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_sticer_gpn_df] DEFAULT 0,
    [sticker_qrcode] BIT NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_sticker_qrcode_df] DEFAULT 0,
    [created_by] INT,
    [updated_by] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [JobOrderReportEdcEquipmentDongle_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    [jobOrderReportId] INT,
    CONSTRAINT [JobOrderReportEdcEquipmentDongle_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[JobOrderReportMaterialPromo] (
    [id] INT NOT NULL IDENTITY(1,1),
    [job_order_report_id] INT NOT NULL,
    [flyer] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialPromo_flyer_df] DEFAULT 0,
    [tent_card] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialPromo_tent_card_df] DEFAULT 0,
    [holder_card] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialPromo_holder_card_df] DEFAULT 0,
    [holder_pen] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialPromo_holder_pen_df] DEFAULT 0,
    [holder_bill] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialPromo_holder_bill_df] DEFAULT 0,
    [sign_pad] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialPromo_sign_pad_df] DEFAULT 0,
    [pen] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialPromo_pen_df] DEFAULT 0,
    [acrylic_open_close] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialPromo_acrylic_open_close_df] DEFAULT 0,
    [logo_sticker] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialPromo_logo_sticker_df] DEFAULT 0,
    [banner] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialPromo_banner_df] DEFAULT 0,
    [created_by] INT,
    [updated_by] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [JobOrderReportMaterialPromo_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    CONSTRAINT [JobOrderReportMaterialPromo_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[JobOrderReportMaterialTraining] (
    [id] INT NOT NULL IDENTITY(1,1),
    [job_order_report_id] INT NOT NULL,
    [fraud_awareness] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialTraining_fraud_awareness_df] DEFAULT 0,
    [sale_void_settlement_logon] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialTraining_sale_void_settlement_logon_df] DEFAULT 0,
    [installment] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialTraining_installment_df] DEFAULT 0,
    [audit_report] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialTraining_audit_report_df] DEFAULT 0,
    [top_up] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialTraining_top_up_df] DEFAULT 0,
    [redeem_point] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialTraining_redeem_point_df] DEFAULT 0,
    [cardverif_preauth_offline] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialTraining_cardverif_preauth_offline_df] DEFAULT 0,
    [manual_key_in] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialTraining_manual_key_in_df] DEFAULT 0,
    [tips_adjust] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialTraining_tips_adjust_df] DEFAULT 0,
    [mini_atm] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialTraining_mini_atm_df] DEFAULT 0,
    [fare_non_fare] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialTraining_fare_non_fare_df] DEFAULT 0,
    [dcc_download_bin] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialTraining_dcc_download_bin_df] DEFAULT 0,
    [first_level_maintenance] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialTraining_first_level_maintenance_df] DEFAULT 0,
    [transaction_receipt_storage] BIT NOT NULL CONSTRAINT [JobOrderReportMaterialTraining_transaction_receipt_storage_df] DEFAULT 0,
    [created_by] INT,
    [updated_by] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [JobOrderReportMaterialTraining_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    CONSTRAINT [JobOrderReportMaterialTraining_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[MediaJobOrderReportProofOfVisit] (
    [id] INT NOT NULL IDENTITY(1,1),
    [media_id] INT NOT NULL,
    [job_order_report_id] INT NOT NULL,
    [created_by] INT,
    [updated_by] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [MediaJobOrderReportProofOfVisit_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    CONSTRAINT [MediaJobOrderReportProofOfVisit_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[MediaJobOrderReportOptionalPhoto] (
    [id] INT NOT NULL IDENTITY(1,1),
    [media_id] INT NOT NULL,
    [job_order_report_id] INT NOT NULL,
    [created_by] INT,
    [updated_by] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [MediaJobOrderReportOptionalPhoto_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    CONSTRAINT [MediaJobOrderReportOptionalPhoto_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EdcBrandType] (
    [id] INT NOT NULL IDENTITY(1,1),
    [brand] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [created_by] INT,
    [updated_by] INT,
    [created_at] DATETIME2 NOT NULL CONSTRAINT [EdcBrandType_created_at_df] DEFAULT CURRENT_TIMESTAMP,
    [updated_at] DATETIME2 NOT NULL,
    [deleted_at] DATETIME2,
    CONSTRAINT [EdcBrandType_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [EdcBrandType_brand_type_key] UNIQUE NONCLUSTERED ([brand],[type])
);

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_role_id_fkey] FOREIGN KEY ([role_id]) REFERENCES [dbo].[Role]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_region_id_fkey] FOREIGN KEY ([region_id]) REFERENCES [dbo].[Region]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_vendor_id_fkey] FOREIGN KEY ([vendor_id]) REFERENCES [dbo].[Vendor]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserSession] ADD CONSTRAINT [UserSession_user_id_fkey] FOREIGN KEY ([user_id]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Merchant] ADD CONSTRAINT [Merchant_region_id_fkey] FOREIGN KEY ([region_id]) REFERENCES [dbo].[Region]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ElectronicDataCaptureMachine] ADD CONSTRAINT [ElectronicDataCaptureMachine_owner_id_fkey] FOREIGN KEY ([owner_id]) REFERENCES [dbo].[Vendor]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[JobOrder] ADD CONSTRAINT [JobOrder_vendor_id_fkey] FOREIGN KEY ([vendor_id]) REFERENCES [dbo].[Vendor]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[JobOrder] ADD CONSTRAINT [JobOrder_region_id_fkey] FOREIGN KEY ([region_id]) REFERENCES [dbo].[Region]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[JobOrderReport] ADD CONSTRAINT [JobOrderReport_job_order_no_fkey] FOREIGN KEY ([job_order_no]) REFERENCES [dbo].[JobOrder]([no]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[JobOrderReportProduct] ADD CONSTRAINT [JobOrderReportProduct_job_order_report_id_fkey] FOREIGN KEY ([job_order_report_id]) REFERENCES [dbo].[JobOrderReport]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[JobOrderReportEdcEquipmentDongle] ADD CONSTRAINT [JobOrderReportEdcEquipmentDongle_jobOrderReportId_fkey] FOREIGN KEY ([jobOrderReportId]) REFERENCES [dbo].[JobOrderReport]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[JobOrderReportMaterialPromo] ADD CONSTRAINT [JobOrderReportMaterialPromo_job_order_report_id_fkey] FOREIGN KEY ([job_order_report_id]) REFERENCES [dbo].[JobOrderReport]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[JobOrderReportMaterialTraining] ADD CONSTRAINT [JobOrderReportMaterialTraining_job_order_report_id_fkey] FOREIGN KEY ([job_order_report_id]) REFERENCES [dbo].[JobOrderReport]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[MediaJobOrderReportProofOfVisit] ADD CONSTRAINT [MediaJobOrderReportProofOfVisit_media_id_fkey] FOREIGN KEY ([media_id]) REFERENCES [dbo].[Media]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[MediaJobOrderReportProofOfVisit] ADD CONSTRAINT [MediaJobOrderReportProofOfVisit_job_order_report_id_fkey] FOREIGN KEY ([job_order_report_id]) REFERENCES [dbo].[JobOrderReport]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[MediaJobOrderReportOptionalPhoto] ADD CONSTRAINT [MediaJobOrderReportOptionalPhoto_media_id_fkey] FOREIGN KEY ([media_id]) REFERENCES [dbo].[Media]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[MediaJobOrderReportOptionalPhoto] ADD CONSTRAINT [MediaJobOrderReportOptionalPhoto_job_order_report_id_fkey] FOREIGN KEY ([job_order_report_id]) REFERENCES [dbo].[JobOrderReport]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
