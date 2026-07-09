import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, LinkButton, PageHeader } from "@/components/ui";
import { getFarmSettings } from "@/lib/farm-settings";
import { FarmSettingsForm } from "./farm-settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const settings = await getFarmSettings();

  return (
    <div>
      <PageHeader title="Settings" />

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Business plan</h2>
        <FarmSettingsForm settings={settings} />
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">Data backup</h2>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Download a full copy of the farm database. Keep it somewhere safe — it contains everything
          in Mada Farm.
        </p>
        <LinkButton href="/api/backup" variant="secondary">
          Download backup
        </LinkButton>
      </Card>
    </div>
  );
}
