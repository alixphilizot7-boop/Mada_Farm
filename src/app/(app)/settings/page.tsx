import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, LinkButton, PageHeader } from "@/components/ui";
import { getFarmSettings } from "@/lib/farm-settings";
import { getDictionary } from "@/lib/i18n/locale";
import { FarmSettingsForm } from "./farm-settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");
  const { t } = await getDictionary();
  const s = t.settings;

  const settings = await getFarmSettings();

  return (
    <div>
      <PageHeader title={s.title} />

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">{s.businessPlanSection}</h2>
        <FarmSettingsForm settings={settings} />
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-stone-700 dark:text-stone-200">{s.dataBackup}</h2>
        <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">{s.backupHint}</p>
        <LinkButton href="/api/backup" variant="secondary">
          {s.downloadBackup}
        </LinkButton>
      </Card>
    </div>
  );
}
