import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { circuits, categories, circuitCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const data = await db.query.circuits.findMany({
      with: {
        faqs: true,
      },
    });

    const mappings = await db
      .select({
        circuitId: circuitCategories.circuitId,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          parentId: categories.parentId,
          type: categories.type,
        },
      })
      .from(circuitCategories)
      .innerJoin(categories, eq(categories.id, circuitCategories.categoryId));

    const circuitsWithCats = data.map((circuit) => {
      const assoc = mappings
        .filter((m) => m.circuitId === circuit.id)
        .map((m) => ({
          circuitId: circuit.id,
          categoryId: m.category.id,
          category: m.category,
        }));
      return {
        ...circuit,
        circuitCategories: assoc,
      };
    });

    let filteredData = circuitsWithCats;
    if (category) {
      const lowerCat = category.toLowerCase();

      // Look up category in the database by slug
      const catRecord = await db.query.categories.findFirst({
        where: eq(categories.slug, lowerCat),
      });

      if (catRecord) {
        // Find all child subcategories if this is a top-level category
        const childCats = await db.query.categories.findMany({
          where: eq(categories.parentId, catRecord.id),
        });
        const categoryIdsToMatch = [catRecord.id, ...childCats.map((c) => c.id)];

        filteredData = circuitsWithCats.filter((circuit) => {
          return circuit.circuitCategories?.some((cc) =>
            categoryIdsToMatch.includes(cc.categoryId)
          );
        });
      } else {
        // Backward compatibility fallback to match against racingCategory text
        if (lowerCat === "all") {
          filteredData = circuitsWithCats;
        } else if (lowerCat === "domestic" || lowerCat === "international") {
          filteredData = circuitsWithCats.filter((circuit) => {
            const cat = (circuit.racingCategory || "").toLowerCase();
            const isIntl = ["f1", "formula 1", "formula-1", "motogp", "wec", "wrc"].some((intl) =>
              cat.includes(intl)
            );
            return lowerCat === "domestic" ? !isIntl : isIntl;
          });
        } else {
          filteredData = circuitsWithCats.filter((circuit) => {
            const cat = (circuit.racingCategory || "").toLowerCase();
            if (lowerCat === "f1") {
              return (
                cat === "f1" ||
                cat === "formula 1" ||
                cat === "formula-1" ||
                cat.includes("f1") ||
                cat.includes("formula")
              );
            }
            return cat === lowerCat || cat.includes(lowerCat);
          });
        }
      }
    }

    return NextResponse.json(filteredData);
  } catch (error) {
    console.error("[CIRCUITS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
