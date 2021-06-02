/*
  Warnings:

  - You are about to drop the `QuestionLikes` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AnswerType" AS ENUM ('like', 'dislike');

-- DropForeignKey
ALTER TABLE "QuestionLikes" DROP CONSTRAINT "QuestionLikes_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionLikes" DROP CONSTRAINT "QuestionLikes_userId_fkey";

-- DropTable
DROP TABLE "QuestionLikes";

-- CreateTable
CREATE TABLE "QuestionLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" "Type" NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "type" "AnswerType" NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionLike.userId_questionId_unique" ON "QuestionLike"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "AnswerLike.userId_answerId_unique" ON "AnswerLike"("userId", "answerId");

-- AddForeignKey
ALTER TABLE "QuestionLike" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionLike" ADD FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerLike" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerLike" ADD FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
