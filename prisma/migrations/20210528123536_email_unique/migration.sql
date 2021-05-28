/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `resetToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "resetToken.email_unique" ON "resetToken"("email");
