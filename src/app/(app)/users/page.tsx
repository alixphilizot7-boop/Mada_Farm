import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/locale";
import { CreateUserForm } from "./create-user-form";
import { ResetPasswordForm } from "./reset-password-form";
import { EditUserForm } from "./edit-user-form";
import { ToggleActiveButton } from "./toggle-active-button";

export default async function UsersPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");
  const { t } = await getDictionary();
  const u = t.users;

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <PageHeader title={u.title} description={u.description} />

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          {u.addAccount}
        </h2>
        <CreateUserForm />
      </Card>

      <Table>
        <THead>
          <Th>{u.name}</Th>
          <Th>{u.email}</Th>
          <Th>{u.role}</Th>
          <Th>{u.status}</Th>
          <Th>{u.joined}</Th>
          <Th>{u.actions}</Th>
        </THead>
        <TBody>
          {users.map((user) => (
            <tr key={user.id}>
              <Td>{user.name}</Td>
              <Td>{user.email}</Td>
              <Td>
                <Badge tone={user.role === "ADMIN" ? "blue" : user.role === "EMPLOYEE" ? "amber" : "zinc"}>
                  {user.role === "ADMIN" ? u.roleAdmin : user.role === "EMPLOYEE" ? u.roleEmployee : u.roleStaff}
                </Badge>
              </Td>
              <Td>
                <Badge tone={user.active ? "green" : "red"}>
                  {user.active ? u.active : u.deactivated}
                </Badge>
              </Td>
              <Td>{formatDate(user.createdAt)}</Td>
              <Td>
                <div className="flex flex-wrap items-center gap-2">
                  <EditUserForm user={user} isSelf={user.id === session.user.id} />
                  <ResetPasswordForm userId={user.id} />
                  <ToggleActiveButton userId={user.id} active={user.active} name={user.name} />
                </div>
              </Td>
            </tr>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
