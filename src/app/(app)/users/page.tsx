import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge, Button, Card, PageHeader, Table, TBody, Td, Th, THead } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { CreateUserForm } from "./create-user-form";
import { ResetPasswordForm } from "./reset-password-form";
import { EditUserForm } from "./edit-user-form";
import { toggleUserActiveAction } from "./actions";

export default async function UsersPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/");

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <PageHeader title="Users" description="Manage who can sign in to Mada Farm." />

      <Card className="mb-6">
        <h2 className="mb-4 text-sm font-semibold text-stone-700 dark:text-stone-200">
          Add a new account
        </h2>
        <CreateUserForm />
      </Card>

      <Table>
        <THead>
          <Th>Name</Th>
          <Th>Email</Th>
          <Th>Role</Th>
          <Th>Status</Th>
          <Th>Joined</Th>
          <Th>Actions</Th>
        </THead>
        <TBody>
          {users.map((user) => (
            <tr key={user.id}>
              <Td>{user.name}</Td>
              <Td>{user.email}</Td>
              <Td>
                <Badge tone={user.role === "ADMIN" ? "blue" : "zinc"}>{user.role}</Badge>
              </Td>
              <Td>
                <Badge tone={user.active ? "green" : "red"}>
                  {user.active ? "Active" : "Deactivated"}
                </Badge>
              </Td>
              <Td>{formatDate(user.createdAt)}</Td>
              <Td>
                <div className="flex flex-wrap items-center gap-2">
                  <EditUserForm user={user} isSelf={user.id === session.user.id} />
                  <ResetPasswordForm userId={user.id} />
                  <form action={toggleUserActiveAction.bind(null, user.id)}>
                    <Button type="submit" variant={user.active ? "danger" : "secondary"}>
                      {user.active ? "Deactivate" : "Activate"}
                    </Button>
                  </form>
                </div>
              </Td>
            </tr>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
