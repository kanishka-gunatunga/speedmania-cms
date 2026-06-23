import { SeoClient } from "./seo-client-view";

export const metadata = {
  title: "SEO Management",
  description: "Manage global page SEO settings",
};

export default function SeoPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Global SEO Management</h2>
      </div>
      <SeoClient />
    </div>
  );
}
