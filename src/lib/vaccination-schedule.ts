export type VaccinationRule = {
  name: string;
  description: string;
} & (
  | { kind: "ONE_TIME_AT_AGE"; ageDays: number }
  | { kind: "RECURRING"; intervalDays: number }
);

export const VACCINATION_SCHEDULE: VaccinationRule[] = [
  {
    name: "Newcastle HB1",
    description: "Day-1 chick vaccination (eye drop or water)",
    kind: "ONE_TIME_AT_AGE",
    ageDays: 1,
  },
  {
    name: "Newcastle HB1 rappel",
    description: "3-week booster",
    kind: "ONE_TIME_AT_AGE",
    ageDays: 21,
  },
  {
    name: "Newcastle LaSota",
    description: "Recurring booster, 3x/year (every ~4 months)",
    kind: "RECURRING",
    intervalDays: 120,
  },
  {
    name: "Variole aviaire",
    description: "Fowl pox, wing-web injection at 8-12 weeks",
    kind: "ONE_TIME_AT_AGE",
    ageDays: 70,
  },
  {
    name: "Marek",
    description: "Day-1 injection (often done at the hatchery)",
    kind: "ONE_TIME_AT_AGE",
    ageDays: 1,
  },
  {
    name: "Déparasitage",
    description: "Deworming, every 3 months",
    kind: "RECURRING",
    intervalDays: 90,
  },
  {
    name: "Contrôle parasites externes",
    description: "External parasite check / dust bath, monthly",
    kind: "RECURRING",
    intervalDays: 30,
  },
];

export type VaccinationAlert = {
  flockId: string;
  flockName: string;
  rule: VaccinationRule;
  dueDate: Date;
  overdue: boolean;
};

const DUE_SOON_WINDOW_DAYS = 14;

export function computeVaccinationAlerts(
  flocks: { id: string; name: string; startDate: Date }[],
  healthRecords: { flockId: string; vaccinationType: string | null; date: Date }[],
  now: Date
): VaccinationAlert[] {
  const alerts: VaccinationAlert[] = [];

  for (const flock of flocks) {
    for (const rule of VACCINATION_SCHEDULE) {
      const matches = healthRecords
        .filter((r) => r.flockId === flock.id && r.vaccinationType === rule.name)
        .sort((a, b) => b.date.getTime() - a.date.getTime());

      let dueDate: Date;
      if (rule.kind === "ONE_TIME_AT_AGE") {
        if (matches.length > 0) continue;
        dueDate = new Date(flock.startDate);
        dueDate.setDate(dueDate.getDate() + rule.ageDays);
      } else {
        const lastDate = matches[0]?.date ?? flock.startDate;
        dueDate = new Date(lastDate);
        dueDate.setDate(dueDate.getDate() + rule.intervalDays);
      }

      const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / 86400000);
      if (daysUntilDue <= DUE_SOON_WINDOW_DAYS) {
        alerts.push({
          flockId: flock.id,
          flockName: flock.name,
          rule,
          dueDate,
          overdue: daysUntilDue < 0,
        });
      }
    }
  }

  return alerts.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}
