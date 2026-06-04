import { getCurrentUser } from "@/lib/actions/auth.actions";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/submit-profile");
  }

  return <LoginForm />;
}
