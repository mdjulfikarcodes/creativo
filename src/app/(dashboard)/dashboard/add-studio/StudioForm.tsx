"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AlertCircle,
  Loader2,
  MapPin,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/toast";
import { getBearerToken, useSession } from "@/lib/auth-client";
import { getStudioById } from "@/lib/studios";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(5, "Location is required"),
  overview: z.string().min(20, "Overview must be at least 20 characters"),
  hourlyRate: z.string().min(1, "Hourly rate is required"),
  securityDeposit: z.string().min(1, "Security deposit is required"),
  maxCapacity: z.string().min(1, "Max capacity is required"),
  imageUrl: z.string().url("Must be a valid URL"),
  amenities: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one amenity.",
  }),
});

const PRESET_IMAGES = [
  { id: "1", url: "https://shorturl.at/Glqbv", label: "Photo Studio" },
  { id: "2", url: "https://shorturl.at/pCgE6", label: "Sound Stage" },
  { id: "3", url: "https://shorturl.at/tc6jA", label: "Podcast Suite" },
  { id: "4", url: "https://shorturl.at/SdXFe", label: "Music Suite" },
  { id: "5", url: "https://shorturl.at/HHm77", label: "Art Workshops" },
];

export default function StudioForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEdit = Boolean(editId);

  const { data: session } = useSession();
  const email = session?.user?.email ?? "";
  const hostName = session?.user?.name ?? "";

  const [loadingStudio, setLoadingStudio] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      location: "",
      overview: "",
      hourlyRate: "",
      securityDeposit: "",
      maxCapacity: "",
      imageUrl: "",
      amenities: [],
    },
  });

  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });

  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (!editId) return;

    let active = true;

    getStudioById(editId)
      .then((studio) => {
        if (!active) return;

        if (!studio) {
          router.push("/dashboard/my-studio");
          return;
        }

        const amenities = Array.isArray(studio.amenities)
          ? studio.amenities
          : typeof studio.amenities === "string"
            ? studio.amenities.split(",").map((item) => item.trim()).filter(Boolean)
            : [];

        const toFieldValue = (value: unknown) =>
          value === undefined || value === null ? "" : String(value);

        form.reset({
          title: studio.title ?? "",
          category: studio.category ?? "",
          location: studio.location ?? "",
          overview: studio.overview ?? studio.description ?? "",
          hourlyRate: toFieldValue(studio.hourlyRate),
          securityDeposit: toFieldValue(studio.securityDeposit),
          maxCapacity: toFieldValue(studio.maxCapacity),
          imageUrl: studio.imageUrl ?? studio.image ?? "",
          amenities,
        });
      })
      .catch((err: unknown) => {
        if (!active) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load this studio.");
      })
      .finally(() => {
        if (active) setLoadingStudio(false);
      });

    return () => {
      active = false;
    };
  }, [editId, form]);

  const AMENITIES = [
    "3-Wall Infinity Cyclorama", "Profoto Lighting Rig",
    "Acoustic Soundproofing NC-20", "Hair & Makeup Station",
    "Drive-In Equipment Bay", "High-Speed Fiber Wi-Fi (10Gbps)",
    "Client Lounge & Kitchenette", "Air Conditioning & Heating",
    "Freight Elevator Access", "Private Dressing Room",
    "4K Video Cameras", "Broadcast Microphones",
    "Ceramic Pottery Wheels", "Easels & Drying Racks",
  ];

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const baseUrl = (process.env.NEXT_PUBLIC_SERVER_BASE_URL ?? "").replace(/\/+$/, "");

    if (!baseUrl) {
      toast.add({ type: "error", title: "Studio API is not configured", description: "Set NEXT_PUBLIC_SERVER_BASE_URL in .env.local." });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...values,
        hourlyRate: Number(values.hourlyRate),
        securityDeposit: Number(values.securityDeposit),
        maxCapacity: Number(values.maxCapacity),
        ...(email ? { ownerEmail: email, hostEmail: email } : {}),
        ...(hostName ? { hostName } : {}),
      };

      const endpoint = isEdit && editId ? `${baseUrl}/studio/${encodeURIComponent(editId)}` : `${baseUrl}/studio`;
      const token = await getBearerToken();

      const result = await fetch(endpoint, {
        method: isEdit ? "PATCH" : "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", result.status);

      if (result.status === 401) {
        toast.add({ type: "error", title: "Session expired", description: "Session expired. Please sign in again." });
        router.push("/login");
        return;
      }

      if (!result.ok) {
        const data = await result.json().catch(() => null);
        throw new Error(typeof data?.message === "string" ? data.message : isEdit ? "Failed to update studio." : "Failed to publish studio.");
      }

      toast.add({
        type: "success",
        title: isEdit ? "Studio updated" : "Studio published",
        description: isEdit ? "Your studio listing has been updated successfully." : "Your studio listing has been created successfully.",
      });
      router.push("/dashboard/my-studio");
      router.refresh();
    } catch (error) {
      toast.add({
        type: "error",
        title: isEdit ? "Could not update studio" : "Could not publish studio",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingStudio) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-4xl py-12 px-4">
        <div className="flex flex-col gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-600 dark:text-rose-300 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{loadError}</p>
          </div>
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/my-studio")} className="h-9 border-rose-500/30 bg-transparent text-rose-600 hover:bg-rose-500/15 dark:text-rose-200 dark:hover:text-white">
            Back to My Studio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 relative">
      <div className="max-w-4xl mx-auto space-y-6">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? "Edit Studio Listing" : "Add New Studio"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isEdit
              ? "Update your production space details and save your changes."
              : "Publish a new production space and start receiving bookings."}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Space Overview</h2>
                <p className="text-sm text-muted-foreground mt-1">Primary identity and location details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Studio Title :</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Your Title" className="bg-background border-input" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category :</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger className="bg-background border-input">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Photo Studios">Photo Studios</SelectItem>
                        <SelectItem value="Sound Stages">Sound Stages</SelectItem>
                        <SelectItem value="Podcast Rooms">Podcast Rooms</SelectItem>
                        <SelectItem value="Music Suites">Music Suites</SelectItem>
                        <SelectItem value="Art Workshops">Art Workshops</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (District, City) :</FormLabel>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input placeholder="Location" className="pl-9 bg-background border-input" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="overview" render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Detailed Workspace Overview :</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your studio, lighting, equipment, amenities, and ideal use."
                        className="min-h-[120px] bg-background border-input resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Pricing & Capacity</h2>
                <p className="text-sm text-muted-foreground mt-1">Define hourly rental rates, deposits, and crew limits</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="hourlyRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate (TK) :</FormLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">৳</span>
                      <FormControl>
                        <Input type="number" placeholder="1000" className="pl-8 bg-background border-input" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="securityDeposit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Deposit (TK) :</FormLabel>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">৳</span>
                      <FormControl>
                        <Input type="number" placeholder="2000" className="pl-8 bg-background border-input" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="maxCapacity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Capacity (People) :</FormLabel>
                    <div className="relative">
                      <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="number" placeholder="10" className="pl-9 bg-background border-input" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Studio Cover Imagery</h2>
                <p className="text-sm text-muted-foreground mt-1">Enter an image URL or choose from curated high-res studio assets</p>
              </div>

              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Direct link or ImgBB) :</FormLabel>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="Image Url" className="pl-9 bg-background border-input" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Or pick a production photo preset :</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => form.setValue("imageUrl", img.url)}
                      className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                        imageUrl === img.url ? "border-violet-500 ring-2 ring-violet-500/20" : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.label}
                        width={400}
                        height={96}
                        unoptimized
                        className="w-full h-24 object-cover opacity-80 hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute bottom-0 w-full bg-background/80 text-xs py-1.5 text-center text-foreground">
                        {img.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Production Amenities & Features</h2>
                <p className="text-sm text-muted-foreground mt-1">Select all equipment and facilities available at your studio</p>
              </div>

              <FormField
                control={form.control}
                name="amenities"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {AMENITIES.map((item) => (
                        <FormField
                          key={item}
                          control={form.control}
                          name="amenities"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item}
                                className={`flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 cursor-pointer transition-colors ${
                                  field.value?.includes(item)
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "bg-background border-border text-muted-foreground hover:border-muted-foreground"
                                }`}
                                onClick={() => {
                                  const current = field.value || [];
                                  const updated = current.includes(item)
                                    ? current.filter((val) => val !== item)
                                    : [...current, item];
                                  field.onChange(updated);
                                }}
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item])
                                        : field.onChange(field.value?.filter((value) => value !== item));
                                    }}
                                    className={`border-muted-foreground ${field.value?.includes(item) ? "bg-primary border-primary text-primary-foreground" : ""}`}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer text-sm w-full">
                                  {item}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-card border border-border border-dashed rounded-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Host Information (Read-Only)</h2>
                <p className="text-sm text-muted-foreground mt-1">This studio listing will be tied to your verified account credentials</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Host Name</label>
                  <Input value={hostName || "Not signed in"} readOnly disabled className="bg-muted text-muted-foreground cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Host Email</label>
                  <Input value={email || "Not signed in"} readOnly disabled className="bg-muted text-muted-foreground cursor-not-allowed" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pb-12">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-violet-600 hover:bg-violet-700 text-white min-w-[150px] gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEdit ? "Saving..." : "Publishing..."}
                  </>
                ) : isEdit ? (
                  "Save Changes"
                ) : (
                  "Publish Studio Listing"
                )}
              </Button>
            </div>

          </form>
        </Form>
      </div>
    </div>
  );
}
