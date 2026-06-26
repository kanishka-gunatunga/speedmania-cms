import { getCurrentUser } from "@/lib/actions/auth.actions";
import { redirect } from "next/navigation";
import AuthorRegisterForm from "@/components/auth/author-register-form";

export const dynamic = "force-dynamic";

export default async function AuthorRegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === "author") {
      redirect("/author/dashboard");
    } else {
      redirect("/submit-profile");
    }
  }

  return <AuthorRegisterForm />;
}
