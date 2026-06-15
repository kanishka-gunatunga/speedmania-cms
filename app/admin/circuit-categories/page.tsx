import { getCategories } from "@/lib/actions/category.actions";
import { CategoryManager } from "@/components/admin/category-manager";

export const dynamic = "force-dynamic";

export default async function CircuitCategoriesPage() {
  const categoriesList = await getCategories("circuit");

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
        <h1 className="text-4xl font-extrabold tracking-tight">Circuit Categories</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Add and manage categories and sub-categories for circuits (e.g. Domestic, International, F1, MotoGP).
        </p>
      </div>

      <CategoryManager initialCategories={formattedCategories} type="circuit" />
    </div>
  );
}
