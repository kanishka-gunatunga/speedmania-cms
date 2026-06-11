import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db";
import { circuits } from "@/lib/db/schema";

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

    let filteredData = data;
    if (category) {
      const lowerCat = category.toLowerCase();
      if (lowerCat === "all" || lowerCat === "domestic") {
        // Domestic: filter out any categories that match F1, MotoGP, WEC, WRC
        filteredData = data.filter((circuit) => {
          const cat = (circuit.racingCategory || "").toLowerCase();
          return !["f1", "formula 1", "formula-1", "motogp", "wec", "wrc"].some((intl) =>
            cat.includes(intl)
          );
        });
      } else {
        // Specific category filter
        filteredData = data.filter((circuit) => {
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

    return NextResponse.json(filteredData);
  } catch (error) {
    console.error("[CIRCUITS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
