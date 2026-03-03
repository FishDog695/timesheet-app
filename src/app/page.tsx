import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { role } = session.user;

  switch (role) {
    case "ADMINISTRATOR":
      redirect("/admin");
    case "ACCOUNTING":
      redirect("/accounting");
    case "FOREMAN":
      redirect("/foreman");
    case "EMPLOYEE":
    default:
      redirect("/timesheet");
  }
}
