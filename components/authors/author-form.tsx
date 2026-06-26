"use client";

import { useActionState, useState } from "react";
import { submitAuthorProfile } from "@/lib/actions/author.actions";
import { Loader2 } from "lucide-react";

export function AuthorForm({ userId, initialData }: { userId: string, initialData: any }) {
  const [state, formAction, isPending] = useActionState(submitAuthorProfile, null);

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      <input type="hidden" name="userId" value={userId} />
      
      {state?.error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm border border-red-200">
          {state.error}
        </div>
      )}
      
      {state?.success && (
        <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm border border-green-200">
          Profile updated successfully!
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-semibold uppercase tracking-wider">Full Name</label>
        <input 
          type="text" 
          name="fullName" 
          required 
          defaultValue={initialData?.fullName || ""}
          className="w-full h-10 px-3 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold uppercase tracking-wider">Biography</label>
        <textarea 
          name="bio" 
          rows={5}
          defaultValue={initialData?.bio || ""}
          className="w-full p-3 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold uppercase tracking-wider">Avatar URL</label>
        <input 
          type="url" 
          name="avatarUrl" 
          defaultValue={initialData?.avatarUrl || ""}
          placeholder="https://..."
          className="w-full h-10 px-3 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-widest rounded-md flex items-center justify-center transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Save Profile
      </button>
    </form>
  );
}
