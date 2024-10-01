/*
  Warnings:

  - You are about to drop the column `office_name` on the `JobOrder` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[JobOrder] DROP COLUMN [office_name];
ALTER TABLE [dbo].[JobOrder] ADD [officer_name] NVARCHAR(1000);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
