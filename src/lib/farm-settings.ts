import { prisma } from "@/lib/prisma";

export async function getFarmSettings() {
  return prisma.farmSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", farmStartDate: new Date("2026-10-01") },
  });
}

export function planYearForDate(farmStartDate: Date, date: Date) {
  const months =
    (date.getFullYear() - farmStartDate.getFullYear()) * 12 + (date.getMonth() - farmStartDate.getMonth());
  const year = Math.floor(months / 12) + 1;
  const yearStart = new Date(farmStartDate);
  yearStart.setFullYear(yearStart.getFullYear() + (year - 1));
  const yearEnd = new Date(yearStart);
  yearEnd.setFullYear(yearEnd.getFullYear() + 1);
  return { year, yearStart, yearEnd };
}
