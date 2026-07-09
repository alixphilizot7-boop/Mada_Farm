import { auth } from "@/auth";
import { Card, PageHeader } from "@/components/ui";
import { ChangePasswordForm } from "./change-password-form";

export default async function AccountPage() {
  const session = await auth();

  return (
    <div>
      <PageHeader title="My Account" description={session?.user?.email ?? undefined} />
      <Card className="max-w-sm">
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
