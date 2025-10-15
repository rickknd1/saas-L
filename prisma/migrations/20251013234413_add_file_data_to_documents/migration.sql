/*
  Warnings:

  - You are about to drop the column `key` on the `document_versions` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `document_versions` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `documents` table. All the data in the column will be lost.
  - Added the required column `fileData` to the `document_versions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `document_versions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileData` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `documents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "document_versions" DROP COLUMN "key",
DROP COLUMN "url",
ADD COLUMN     "fileData" BYTEA NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "key",
DROP COLUMN "url",
ADD COLUMN     "fileData" BYTEA NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL;
