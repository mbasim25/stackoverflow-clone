-- CreateEnum
CREATE TYPE "Type" AS ENUM ('like', 'dislike');

-- CreateTable
CREATE TABLE "QLikes" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" "Type" NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QLikes.userId_questionId_unique" ON "QLikes"("userId", "questionId");

-- AddForeignKey
ALTER TABLE "QLikes" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QLikes" ADD FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
