import { getCurrentUser } from "@/lib/actions/auth.actions";
import { redirect } from "next/navigation";
import RegisterForm from "@/components/auth/register-form";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/submit-profile");
  }

  return <RegisterForm />;
}
