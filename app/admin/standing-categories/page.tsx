import { getCategories } from "@/lib/actions/category.actions";
import { CategoryManager } from "@/components/admin/category-manager";

export const dynamic = "force-dynamic";

export default async function StandingCategoriesPage() {
  const categoriesList = await getCategories("standing");

  // Convert categories list schema objects to match Category interface
  const formattedCategories = categoriesList.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    parentId: cat.parentId,
    createdAt: cat.createdAt,
    type: (cat as any).type,
  }));

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Standing Categories</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Add and manage top-level categories and subcategories for race results and season standings.
        </p>
      </div>

      <CategoryManager initialCategories={formattedCategories} type="standing" />
    </div>
  );
}
