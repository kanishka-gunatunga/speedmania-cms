"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteBlog } from "@/lib/actions/blog.actions";
import { useTransition } from "react";

export function DeleteBlogButton({ blogId }: { blogId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
      disabled={isPending}
      onClick={() => {
        if (window.confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
          startTransition(async () => {
            await deleteBlog(blogId);
          });
        }
      }}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
