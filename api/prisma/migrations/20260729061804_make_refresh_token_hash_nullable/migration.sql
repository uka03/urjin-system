-- DropIndex
DROP INDEX "RefreshToken_tokenHash_key";

-- AlterTable
ALTER TABLE "RefreshToken" ALTER COLUMN "tokenHash" DROP NOT NULL;
