/*
  Warnings:

  - Changed the type of `previousStatus` on the `RoomStatusHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `newStatus` on the `RoomStatusHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "RoomStatusHistory" DROP COLUMN "previousStatus",
ADD COLUMN     "previousStatus" "RoomStatus" NOT NULL,
DROP COLUMN "newStatus",
ADD COLUMN     "newStatus" "RoomStatus" NOT NULL;
