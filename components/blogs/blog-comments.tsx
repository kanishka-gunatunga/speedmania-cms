"use client";

import { useState, useTransition } from "react";
import { approveComment, deleteComment } from "@/lib/actions/comment.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Trash2, MessageSquare, Clock } from "lucide-react";

interface CommentUser {
  id: string;
  username: string;
}

interface Comment {
  id: string;
  content: string;
  approved: boolean;
  createdAt: Date;
  user: CommentUser;
}

interface BlogCommentsProps {
  blogId: string;
  initialComments: Comment[];
}

export function BlogComments({ blogId, initialComments }: BlogCommentsProps) {
  const [commentsList, setCommentsList] = useState<Comment[]>(initialComments);
  const [isPending, startTransition] = useTransition();

  const handleApprove = (commentId: string) => {
    if (confirm("Are you sure you want to approve this comment for public display?")) {
      startTransition(async () => {
        const res = await approveComment(commentId, blogId);
        if (res.success) {
          setCommentsList((prev) =>
            prev.map((c) => (c.id === commentId ? { ...c, approved: true } : c))
          );
        } else {
          alert(res.error || "Failed to approve comment");
        }
      });
    }
  };

  const handleDelete = (commentId: string) => {
    if (confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
      startTransition(async () => {
        const res = await deleteComment(commentId, blogId);
        if (res.success) {
          setCommentsList((prev) => prev.filter((c) => c.id !== commentId));
        } else {
          alert(res.error || "Failed to delete comment");
        }
      });
    }
  };

  return (
    <Card className="border-border/50 shadow-sm mt-8">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <CardTitle className="text-xl font-bold">Comments Moderation</CardTitle>
        </div>
        <CardDescription>
          Review, approve, or delete comments left by fans on this article.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {commentsList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No comments have been posted to this blog yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {commentsList.map((comment) => {
              const formattedDate = new Date(comment.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={comment.id}
                  className="p-4 rounded-xl border border-border/60 bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-muted/30"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm">{comment.user.username}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Fan
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formattedDate}
                      </span>
                      {comment.approved ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Approved
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                          Pending Approval
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {!comment.approved && (
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 hover:cursor-pointer"
                        onClick={() => handleApprove(comment.id)}
                        disabled={isPending}
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1.5 hover:cursor-pointer"
                      onClick={() => handleDelete(comment.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
