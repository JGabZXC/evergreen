/*
  Warnings:

  - You are about to drop the column `account_number` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountNumber]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_account_number_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "account_number",
ADD COLUMN     "accountNumber" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_accountNumber_key" ON "User"("accountNumber");
