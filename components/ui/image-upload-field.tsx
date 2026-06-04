"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Link, Upload, Trash2, Image as ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ImageUploadField({
  value,
  onChange,
  placeholder = "https://example.com/image.jpg",
  className,
}: ImageUploadFieldProps) {
  const isUploadedUrl = (url: string) => {
    if (!url) return false;
    return url.includes("vercel-storage.com") || url.startsWith("/uploads");
  };

  const initialTab = isUploadedUrl(value) ? "upload" : "url";
  const [activeTab, setActiveTab] = useState<"url" | "upload">(initialTab);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronize tab if value changes externally (e.g. form reset or default values loading)
  useEffect(() => {
    if (value) {
      setActiveTab(isUploadedUrl(value) ? "upload" : "url");
    }
  }, [value]);

  const handleTabChange = (tab: "url" | "upload") => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setError(null);
      // Enforce mutual exclusivity: clear the value when switching sources
      onChange("");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.url) {
        onChange(data.url);
      } else {
        setError(data.error || "Failed to upload image.");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError("An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    onChange("");
    setError(null);
  };

  return (
    <div className={cn("space-y-3 w-full", className)}>
      {/* Premium Tab Selector */}
      <div className="flex w-fit bg-muted p-1 rounded-lg border border-border/80 shadow-inner">
        <button
          type="button"
          onClick={() => handleTabChange("url")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all select-none cursor-pointer",
            activeTab === "url"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Link className="w-3.5 h-3.5" />
          Paste URL
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("upload")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all select-none cursor-pointer",
            activeTab === "upload"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload File
        </button>
      </div>

      {/* URL Mode */}
      {activeTab === "url" && (
        <div className="space-y-2">
          <Input
            type="url"
            placeholder={placeholder}
            value={isUploadedUrl(value) ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-background border border-border rounded-lg text-sm transition-all focus:ring-2 focus:ring-primary/20"
          />
          {value && !isUploadedUrl(value) && (
            <div className="relative mt-2 border border-border/60 rounded-xl overflow-hidden bg-muted/20 w-fit max-w-[200px] h-[120px] shadow-sm flex items-center justify-center group animate-in fade-in zoom-in-95">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="URL Preview"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1.5 right-1.5 bg-destructive/90 hover:bg-destructive text-destructive-foreground p-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload Mode */}
      {activeTab === "upload" && (
        <div className="space-y-2">
          {error && (
            <div className="flex items-center gap-2 p-2.5 text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {value && isUploadedUrl(value) ? (
            /* Uploaded Preview State */
            <div className="relative border border-border rounded-xl overflow-hidden bg-muted/20 w-fit max-w-[240px] h-[150px] shadow-sm flex items-center justify-center group animate-in fade-in zoom-in-95">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Uploaded Preview"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg transition-transform scale-95 group-hover:scale-100 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            /* Drag and Drop Dropzone State */
            <label
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all cursor-pointer bg-muted/5 select-none hover:bg-muted/10 group",
                uploading
                  ? "border-primary/50 cursor-not-allowed pointer-events-none"
                  : "border-border/60 hover:border-primary/50"
              )}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-xs font-semibold text-muted-foreground animate-pulse">
                      Uploading image to Vercel Blob...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                      <ImageIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground mt-1">
                      <span className="text-primary hover:underline">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 font-medium">
                      PNG, JPG, JPEG or WEBP (Max 5MB)
                    </p>
                  </div>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
