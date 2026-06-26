import { AdvertisementForm } from "@/components/admin/advertisement-form";
import { db } from "@/lib/db";
import { advertisements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditAdvertisementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);
  const ad = data[0];

  if (!ad) {
    notFound();
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Advertisement</h1>
      </div>
      <AdvertisementForm initialData={ad} />
    </div>
  );
}
