/*
  Warnings:

  - The primary key for the `QuestionLikes` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "QuestionLikes" DROP CONSTRAINT "QuestionLikes_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD PRIMARY KEY ("id");
DROP SEQUENCE "QuestionLikes_id_seq";
