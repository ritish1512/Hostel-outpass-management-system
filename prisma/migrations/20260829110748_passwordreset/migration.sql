-- CreateTable
CREATE TABLE "PasswordChange" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "newPasswordHash" TEXT NOT NULL,
    "passwordStatus" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "activeToken" TEXT NOT NULL,
    "expiryTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordChange_activeToken_key" ON "PasswordChange"("activeToken");

-- AddForeignKey
ALTER TABLE "PasswordChange" ADD CONSTRAINT "PasswordChange_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
