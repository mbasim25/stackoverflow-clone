/*
  Warnings:

  - You are about to drop the `QLikes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QLikes" DROP CONSTRAINT "QLikes_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QLikes" DROP CONSTRAINT "QLikes_userId_fkey";

-- DropTable
DROP TABLE "QLikes";

-- CreateTable
CREATE TABLE "QuestionLikes" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" "Type" NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionLikes.userId_questionId_unique" ON "QuestionLikes"("userId", "questionId");

-- AddForeignKey
ALTER TABLE "QuestionLikes" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionLikes" ADD FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
