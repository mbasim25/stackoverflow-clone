-- CreateTable
CREATE TABLE "TokenBlackList" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TokenBlackList.token_unique" ON "TokenBlackList"("token");
