import { AdvertisementForm } from "@/components/admin/advertisement-form";

export const dynamic = 'force-dynamic';

export default function NewAdvertisementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">New Advertisement</h1>
      </div>
      <AdvertisementForm />
    </div>
  );
}
