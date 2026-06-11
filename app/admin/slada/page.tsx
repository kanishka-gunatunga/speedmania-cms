"use client";

import { useEffect, useState, useTransition } from "react";
import { 
  getSladaContent, 
  updateSladaPage, 
  addCommitteeMember, 
  updateCommitteeMember, 
  deleteCommitteeMember 
} from "@/lib/actions/slada.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  UserPlus, 
  FileText, 
  Image as ImageIcon, 
  Loader2, 
  Users 
} from "lucide-react";

const SPRITE_OPTIONS = [
  { label: "Sanjaya Kariyawansa (Col 1, Row 1)", value: "0% 0%" },
  { label: "Rizvi Farouk (Col 2, Row 1)", value: "33.333% 0%" },
  { label: "Maj. Gen. Devinda Perera (Col 3, Row 1)", value: "66.667% 0%" },
  { label: "Maj. Gen. Janaka Ranasinghe 1 (Col 4, Row 1)", value: "100% 0%" },
  { label: "Maj. Gen. Piyal Siriwardana (Col 1, Row 2)", value: "0% 100%" },
  { label: "Mr. Upulwan Serasinghe (Col 2, Row 2)", value: "33.333% 100%" },
  { label: "Mr. Janaka Dias (Col 3, Row 2)", value: "66.667% 100%" },
  { label: "Maj. Gen. Janaka Ranasinghe 2 (Col 4, Row 2)", value: "100% 100%" },
  { label: "None / Not in Sprite", value: "" },
];

export default function SladaAdminPage() {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states for SLADA page settings
  const [logoUrl, setLogoUrl] = useState("/slada-logo.png");
  const [aboutTitle, setAboutTitle] = useState("About SLADA");
  const [aboutImageUrl, setAboutImageUrl] = useState("/slada-bio.png");
  const [aboutDescription, setAboutDescription] = useState("");
  const [committeeTitle, setCommitteeTitle] = useState("SLADA Committee (2026/2027)");
  const [committeeDescription, setCommitteeDescription] = useState("");

  // Committee list state
  const [committee, setCommittee] = useState<any[]>([]);

  // Dialog state for add/edit member
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [memberBgPosition, setMemberBgPosition] = useState("0% 0%");
  const [memberCustomImage, setMemberCustomImage] = useState("");
  const [memberDisplayOrder, setMemberDisplayOrder] = useState("0");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSladaContent();
      if (result.success && result.page) {
        setLogoUrl(result.page.logoUrl);
        setAboutTitle(result.page.aboutTitle);
        setAboutImageUrl(result.page.aboutImageUrl);
        setAboutDescription(result.page.aboutDescription);
        setCommitteeTitle(result.page.committeeTitle);
        setCommitteeDescription(result.page.committeeDescription);
        setCommittee(result.committee);
      } else {
        setError(result.error || "Failed to load SLADA settings.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSavePageSettings = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const result = await updateSladaPage({
          logoUrl,
          aboutTitle,
          aboutImageUrl,
          aboutDescription,
          committeeTitle,
          committeeDescription,
        });

        if (result.success) {
          setSuccess("SLADA page settings updated successfully!");
          setTimeout(() => setSuccess(null), 3000);
        } else {
          setError(result.error || "Failed to save settings.");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      }
    });
  };

  const handleOpenAddDialog = () => {
    setEditingMember(null);
    setMemberName("");
    setMemberRole("");
    setMemberBgPosition("0% 0%");
    setMemberCustomImage("");
    setMemberDisplayOrder(String(committee.length + 1));
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (member: any) => {
    setEditingMember(member);
    setMemberName(member.name);
    setMemberRole(member.role);
    setMemberBgPosition(member.bgPosition || "");
    setMemberCustomImage(member.image || "");
    setMemberDisplayOrder(String(member.displayOrder || 0));
    setDialogOpen(true);
  };

  const handleSaveMember = async () => {
    if (!memberName.trim() || !memberRole.trim()) {
      alert("Name and role are required.");
      return;
    }

    startTransition(async () => {
      try {
        const memberData = {
          name: memberName,
          role: memberRole,
          bgPosition: memberBgPosition,
          image: memberCustomImage || undefined,
          displayOrder: parseInt(memberDisplayOrder) || 0,
        };

        let result;
        if (editingMember) {
          result = await updateCommitteeMember(editingMember.id, memberData);
        } else {
          result = await addCommitteeMember(memberData);
        }

        if (result.success) {
          setDialogOpen(false);
          loadData();
        } else {
          alert(result.error || "Failed to save member.");
        }
      } catch (err: any) {
        alert(err.message || "An unexpected error occurred.");
      }
    });
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to remove this committee member?")) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await deleteCommitteeMember(id);
        if (result.success) {
          loadData();
        } else {
          alert(result.error || "Failed to delete member.");
        }
      } catch (err: any) {
        alert(err.message || "An unexpected error occurred.");
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-semibold">Loading SLADA settings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">SLADA Page CMS</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage page branding, About description, and Executive Committee members.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm font-medium bg-destructive/15 text-destructive rounded-xl border border-destructive/20">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 mb-6 text-sm font-medium bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
          {success}
        </div>
      )}

      <Tabs defaultValue="page-content" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 h-auto gap-2 bg-transparent p-0">
          <TabsTrigger 
            value="page-content" 
            className="border border-border py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-bold"
          >
            <FileText className="w-4 h-4 mr-2" />
            Page Content
          </TabsTrigger>
          <TabsTrigger 
            value="committee" 
            className="border border-border py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-bold"
          >
            <Users className="w-4 h-4 mr-2" />
            Committee Members
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: GENERAL PAGE CONTENT */}
        <TabsContent value="page-content" className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Page Brand & About Section</CardTitle>
              <CardDescription>
                Customize logo, about image cover, and page descriptions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Logo URL */}
                <div className="space-y-2">
                  <Label className="font-bold text-sm">SLADA Logo</Label>
                  <ImageUploadField 
                    value={logoUrl} 
                    onChange={setLogoUrl} 
                    placeholder="E.g. /slada-logo.png or uploaded image url" 
                  />
                  <p className="text-xs text-muted-foreground">Centered header logo. Recommend landscape aspect ratio.</p>
                </div>

                {/* About cover image */}
                <div className="space-y-2">
                  <Label className="font-bold text-sm">About Cover Image</Label>
                  <ImageUploadField 
                    value={aboutImageUrl} 
                    onChange={setAboutImageUrl} 
                    placeholder="E.g. /slada-bio.png or uploaded image url" 
                  />
                  <p className="text-xs text-muted-foreground">Figma Spec: 560px wide section image.</p>
                </div>

                {/* About title */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="aboutTitle" className="font-bold text-sm">About Section Title</Label>
                  <Input 
                    id="aboutTitle"
                    value={aboutTitle} 
                    onChange={(e) => setAboutTitle(e.target.value)} 
                    placeholder="About SLADA" 
                  />
                </div>

                {/* About description content */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="aboutDescription" className="font-bold text-sm">About Section Biography</Label>
                  <Textarea 
                    id="aboutDescription"
                    value={aboutDescription} 
                    onChange={(e) => setAboutDescription(e.target.value)} 
                    placeholder="Explain the history, role and operations of SLADA..." 
                    className="min-h-[220px]"
                  />
                  <p className="text-xs text-muted-foreground">Separate paragraphs by double line breaks (press enter twice).</p>
                </div>

                {/* Committee title */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="committeeTitle" className="font-bold text-sm">Committee Section Title</Label>
                  <Input 
                    id="committeeTitle"
                    value={committeeTitle} 
                    onChange={(e) => setCommitteeTitle(e.target.value)} 
                    placeholder="SLADA Committee (2026/2027)" 
                  />
                </div>

                {/* Committee description content */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="committeeDescription" className="font-bold text-sm">Committee Section Description</Label>
                  <Textarea 
                    id="committeeDescription"
                    value={committeeDescription} 
                    onChange={(e) => setCommitteeDescription(e.target.value)} 
                    placeholder="Following the 14th Annual General Meeting..." 
                    className="min-h-[80px]"
                  />
                </div>

              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button 
                  onClick={handleSavePageSettings} 
                  disabled={isPending}
                  className="gap-2 px-6 py-2.5 font-bold"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: COMMITTEE MEMBERS */}
        <TabsContent value="committee" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Committee Members List</h2>
            <Button onClick={handleOpenAddDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          </div>

          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[80px] text-center">Order</TableHead>
                    <TableHead className="w-[300px]">Member Details</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Photo Source</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {committee.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground font-semibold">
                        No committee members registered yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    committee.map((member) => {
                      const spriteLabel = SPRITE_OPTIONS.find(o => o.value === member.bgPosition)?.label || "Custom Sprite Coordinates";
                      return (
                        <TableRow key={member.id} className="hover:bg-muted/10">
                          <TableCell className="text-center font-bold text-muted-foreground">{member.displayOrder}</TableCell>
                          <TableCell className="font-semibold text-foreground">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-200 border relative">
                                {member.image ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img 
                                    src={member.image} 
                                    alt={member.name} 
                                    className="w-full h-full object-cover" 
                                  />
                                ) : (
                                  <div 
                                    className="w-full h-full"
                                    style={{
                                      backgroundImage: `url('/member-placeolder.png')`,
                                      backgroundSize: "400% 200%",
                                      backgroundPosition: member.bgPosition || "0% 0%",
                                      backgroundRepeat: "no-repeat",
                                    }}
                                  />
                                )}
                              </div>
                              <span>{member.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">{member.role}</TableCell>
                          <TableCell>
                            {member.image ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
                                Custom Upload
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 uppercase tracking-wider block max-w-xs truncate">
                                Sprite: {spriteLabel.split(" (")[0]}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 text-blue-600"
                                onClick={() => handleOpenEditDialog(member)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 text-red-600"
                                onClick={() => handleDeleteMember(member.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MEMBER EDIT / ADD DIALOG MODAL */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Edit Committee Member" : "Add Committee Member"}</DialogTitle>
            <DialogDescription>
              Provide name, role, and choose if you want a custom image or use a slot from the default sprite.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="memberName" className="font-bold text-sm">Full Name</Label>
              <Input 
                id="memberName"
                value={memberName} 
                onChange={(e) => setMemberName(e.target.value)} 
                placeholder="E.g. Rizvi Farouk" 
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label htmlFor="memberRole" className="font-bold text-sm">Designation / Role</Label>
              <Input 
                id="memberRole"
                value={memberRole} 
                onChange={(e) => setMemberRole(e.target.value)} 
                placeholder="E.g. Vice President" 
              />
            </div>

            {/* Custom Image Upload */}
            <div className="space-y-1.5">
              <Label className="font-bold text-sm">Custom Profile Photo (Optional)</Label>
              <ImageUploadField 
                value={memberCustomImage} 
                onChange={(url) => {
                  setMemberCustomImage(url);
                  if (url) {
                    setMemberBgPosition(""); // Enforce exclusivity
                  }
                }} 
                placeholder="Upload file or paste image url"
              />
              <p className="text-[11px] text-muted-foreground">Uploading a custom profile photo overrides the sprite sheet.</p>
            </div>

            {/* Sprite Position Dropdown (if no custom photo) */}
            {!memberCustomImage && (
              <div className="space-y-1.5">
                <Label htmlFor="memberBg" className="font-bold text-sm">Sprite Photo Position</Label>
                <select 
                  id="memberBg"
                  value={memberBgPosition} 
                  onChange={(e) => setMemberBgPosition(e.target.value)} 
                  className="w-full bg-background border border-border rounded-lg text-sm px-3 py-2 transition-all focus:ring-2 focus:ring-primary/20"
                >
                  {SPRITE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">Maps to coordinates in the default member-placeolder.png file.</p>
              </div>
            )}

            {/* Display Order */}
            <div className="space-y-1.5">
              <Label htmlFor="memberOrder" className="font-bold text-sm">Display Order (Sorting)</Label>
              <Input 
                id="memberOrder"
                type="number"
                value={memberDisplayOrder} 
                onChange={(e) => setMemberDisplayOrder(e.target.value)} 
                placeholder="1" 
              />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMember} disabled={isPending} className="font-bold">
              {isPending ? "Saving..." : (editingMember ? "Save Changes" : "Add Member")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
