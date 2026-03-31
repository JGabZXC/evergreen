-- AlterTable
ALTER TABLE "User" ADD COLUMN     "insertedById" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_insertedById_fkey" FOREIGN KEY ("insertedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
