"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { policies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getPolicies() {
  try {
    const list = await db.select().from(policies);
    return { success: true, policies: list || [] };
  } catch (error: any) {
    console.error("[GET_POLICIES_ERROR]", error);
    return { success: false, error: error.message || "Failed to get policies", policies: [] };
  }
}

export async function getPolicyById(id: string) {
  try {
    const policy = await db.query.policies.findFirst({
      where: eq(policies.id, id),
    });
    return policy || null;
  } catch (error: any) {
    console.error("[GET_POLICY_BY_ID_ERROR]", error);
    return null;
  }
}

export async function updatePolicy(id: string, data: { title: string; content: string }) {
  try {
    const existing = await db.query.policies.findFirst({
      where: eq(policies.id, id),
    });

    if (existing) {
      await db.update(policies)
        .set({
          title: data.title,
          content: data.content,
          updatedAt: new Date(),
        })
        .where(eq(policies.id, id));
    } else {
      await db.insert(policies).values({
        id,
        title: data.title,
        content: data.content,
      });
    }

    revalidatePath(`/admin/policies/${id}`);
    revalidatePath(`/admin/policies`);
    
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_POLICY_ERROR]", error);
    return { success: false, error: error.message || "Failed to update policy" };
  }
}
