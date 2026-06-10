"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Tag } from "lucide-react";
import { createCategory, deleteCategory } from "@/lib/actions/category.actions";

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  type?: string;
  createdAt: Date;
}

interface CategoryManagerProps {
  initialCategories: Category[];
  type?: "blog" | "driver" | "rider";
}

export function CategoryManager({ initialCategories, type = "blog" }: CategoryManagerProps) {
  const [categoriesList, setCategoriesList] = useState<Category[]>(initialCategories);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    // Auto-generate slug from name if not manually modified
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    );
  };

  const handleAddCategory = () => {
    setError(null);
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    if (!slug.trim()) {
      setError("Slug is required");
      return;
    }

    startTransition(async () => {
      const result = await createCategory({ name, slug, parentId: parentId || null, type });
      if (result.success && result.category) {
        setCategoriesList((prev) => [
          ...prev,
          {
            id: result.category!.id,
            name: result.category!.name,
            slug: result.category!.slug,
            parentId: result.category!.parentId || null,
            type: type,
            createdAt: new Date(),
          },
        ].sort((a, b) => a.name.localeCompare(b.name)));
        setName("");
        setSlug("");
        setParentId("");
      } else {
        setError(result.error || "Failed to create category");
      }
    });
  };

  const handleDeleteCategory = (id: string) => {
    if (!confirm("Are you sure you want to delete this category? This will remove it from all assigned blog posts. Any child sub-categories will be unlinked.")) return;

    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result.success) {
        setCategoriesList((prev) => 
          prev
            .filter((c) => c.id !== id)
            .map((c) => (c.parentId === id ? { ...c, parentId: null } : c))
        );
      } else {
        setError(result.error || "Failed to delete category");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create Category Form */}
      <div className="lg:col-span-1">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              Add Category
            </CardTitle>
            <CardDescription>Create a new racing or blog category.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm font-medium">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="cat-name" className="text-sm font-semibold">
                Category Name
              </label>
              <Input
                id="cat-name"
                placeholder="E.g., Formula 1, MotoGP"
                value={name}
                onChange={handleNameChange}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="cat-slug" className="text-sm font-semibold">
                Slug
              </label>
              <Input
                id="cat-slug"
                placeholder="E.g., formula-1, motogp"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="cat-parent" className="text-sm font-semibold">
                Parent Category (Optional)
              </label>
              <select
                id="cat-parent"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                disabled={isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">None (Top-Level Category)</option>
                {categoriesList
                  .filter((c) => !c.parentId && (!c.type || c.type === type))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <Button
              className="w-full gap-2 mt-2"
              onClick={handleAddCategory}
              disabled={isPending}
            >
              <Plus className="w-4 h-4" />
              {isPending ? "Adding..." : "Add Category"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* List Categories */}
      <div className="lg:col-span-2">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">All Categories</CardTitle>
            <CardDescription>
              Manage categories used to group news stories and standings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/50 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoriesList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        No categories found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    categoriesList.map((category) => {
                      const parent = category.parentId
                        ? categoriesList.find((c) => c.id === category.parentId)
                        : null;
                      return (
                        <TableRow key={category.id} className="hover:bg-muted/20">
                          <TableCell className="font-semibold">
                            {parent ? (
                              <span className="flex items-center gap-1.5">
                                <span className="text-muted-foreground font-normal text-xs">{parent.name} &gt;</span>
                                <span>{category.name}</span>
                              </span>
                            ) : (
                              category.name
                            )}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs px-2 py-1 bg-muted rounded">
                              {category.slug}
                            </code>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
