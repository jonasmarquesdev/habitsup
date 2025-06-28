-- CreateTable
CREATE TABLE "daily_habit_availability" (
    "id" TEXT NOT NULL,
    "day_id" TEXT NOT NULL,
    "habit_id" TEXT NOT NULL,

    CONSTRAINT "daily_habit_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_habit_availability_day_id_habit_id_key" ON "daily_habit_availability"("day_id", "habit_id");

-- AddForeignKey
ALTER TABLE "daily_habit_availability" ADD CONSTRAINT "daily_habit_availability_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "days"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_habit_availability" ADD CONSTRAINT "daily_habit_availability_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
