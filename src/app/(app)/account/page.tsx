import { auth } from "@/auth";
import { Card, PageHeader } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/locale";
import { ChangePasswordForm } from "./change-password-form";

export default async function AccountPage() {
  const session = await auth();
  const { t } = await getDictionary();

  return (
    <div>
      <PageHeader title={t.account.title} description={session?.user?.email ?? undefined} />
      <Card className="max-w-sm">
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
