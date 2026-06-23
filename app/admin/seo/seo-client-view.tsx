"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadField } from "@/components/ui/image-upload-field";

const PAGES = [
  { id: "home", label: "Home Page" },
  { id: "drivers", label: "Drivers Page" },
  { id: "riders", label: "Riders Page" },
  { id: "results", label: "Results Page" },
  { id: "tracks", label: "Tracks Page" },
  { id: "teams", label: "Teams Page" },
];

export function SeoClient() {
  const [activePage, setActivePage] = useState("home");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    keywords: "",
    ogImage: "",
  });

  const fetchSeo = async (pageName: string) => {
    try {
      setFetching(true);
      const res = await fetch(`/api/seo/${pageName}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          title: data?.title || "",
          description: data?.description || "",
          keywords: data?.keywords || "",
          ogImage: data?.ogImage || "",
        });
      }
    } catch (err) {
      setError("Failed to load SEO data");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSeo(activePage);
  }, [activePage]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`/api/seo/${activePage}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save");
      setSuccess("SEO settings saved successfully");
      setError(null);
    } catch (err) {
      setError("Something went wrong");
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Settings</CardTitle>
        <CardDescription>
          Configure the meta tags and Open Graph image for the global pages on your site.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activePage} onValueChange={setActivePage} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2">
            {PAGES.map((page) => (
              <TabsTrigger key={page.id} value={page.id} className="cursor-pointer">
                {page.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/15 text-green-700 p-3 rounded-md text-sm font-medium">
              {success}
            </div>
          )}

          <TabsContent value={activePage} className="space-y-4">
            {fetching ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input
                    placeholder="E.g. Speedmania | Latest F1 News"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Recommended length: 50-60 characters</p>
                </div>

                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea
                    placeholder="Enter meta description..."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Recommended length: 150-160 characters</p>
                </div>

                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <Input
                    placeholder="E.g. f1, formula 1, racing, news (comma separated)"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Open Graph (OG) Image</Label>
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <ImageUploadField
                        value={formData.ogImage}
                        onChange={(url) => setFormData({ ...formData, ogImage: url || "" })}
                        placeholder="https://example.com/og-image.jpg"
                      />
                    </div>
                  </div>
                  {formData.ogImage && (
                    <div className="mt-4 relative aspect-video w-64 rounded-md overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.ogImage} alt="OG Preview" className="object-cover w-full h-full" />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Recommended size: 1200 x 630 pixels</p>
                </div>

                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
