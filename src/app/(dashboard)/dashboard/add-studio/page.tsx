"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, DollarSign, Users, Image as ImageIcon, Check } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// --- Zod Schema for Validation ---
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
  { id: "1", url: "/src/assets/images/hero_cyclorama_studio_1793552711863.jpg", label: "Daylight Cyc" },
  { id: "2", url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04", label: "Sound Stage" },
  { id: "3", url: "https://images.unsplash.com/photo-1593697821252-0c9137d9fc45", label: "Podcast Suite" },
  { id: "4", url: "https://images.unsplash.com/photo-1516280440502-863a346513c6", label: "Music Suite" },
];

export default function AddStudioPage() {
  const router = useRouter();

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

  const AMENITIES = [
  "3-Wall Infinity Cyclorama", "Profoto Lighting Rig",
  "Acoustic Soundproofing NC-20", "Hair & Makeup Station",
  "Drive-In Equipment Bay", "High-Speed Fiber Wi-Fi (10Gbps)",
  "Client Lounge & Kitchenette", "Air Conditioning & Heating",
  "Freight Elevator Access", "Private Dressing Room",
  "4K Video Cameras", "Broadcast Microphones",
  "Ceramic Pottery Wheels", "Easels & Drying Racks",
];

  // ফর্ম সাবমিট হ্যান্ডলার (এখানে তোমার Express API কল করবে)
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    window.alert("Studio Published! Your studio has been successfully listed.");
    router.push("/my-listings");
    const result = await fetch(`${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/studio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const data = await result.json();
    console.log("Api Response:", data);

    
    
  }

  


  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 text-slate-200">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* ১. Space Overview Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Space Overview</h2>
                <p className="text-sm text-slate-400 mt-1">Primary identity and location details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Studio Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Apex Industrial Daylight Loft & Cyclorama" className="bg-slate-950 border-slate-700" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-950 border-slate-700">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Photo Studios">Photo Studios</SelectItem>
                        <SelectItem value="Sound Stages">Sound Stages</SelectItem>
                        <SelectItem value="Podcast Rooms">Podcast Rooms</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (City, Neighborhood, Address) *</FormLabel>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <FormControl>
                        <Input placeholder="e.g. DUMBO, Brooklyn, NY" className="pl-9 bg-slate-950 border-slate-700" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="overview" render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Detailed Workspace Overview *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the ceiling height, daylight orientation, electric panel capacity (e.g. 200A 3-phase), sound isolation level, and suitable production types..." 
                        className="min-h-[120px] bg-slate-950 border-slate-700 resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* ২. Pricing & Capacity Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Pricing & Capacity</h2>
                <p className="text-sm text-slate-400 mt-1">Define hourly rental rates, deposits, and crew limits</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="hourlyRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate ($ USD) *</FormLabel>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <FormControl>
                        <Input type="number" placeholder="120" className="pl-9 bg-slate-950 border-slate-700" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="securityDeposit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Deposit ($ USD) *</FormLabel>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <FormControl>
                        <Input type="number" placeholder="250" className="pl-9 bg-slate-950 border-slate-700" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="maxCapacity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Capacity (People) *</FormLabel>
                    <div className="relative">
                      <Users className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <FormControl>
                        <Input type="number" placeholder="15" className="pl-9 bg-slate-950 border-slate-700" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* ৩. Studio Cover Imagery */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Studio Cover Imagery</h2>
                <p className="text-sm text-slate-400 mt-1">Enter an image URL or choose from curated high-res studio assets</p>
              </div>

              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Direct link or ImgBB) *</FormLabel>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <FormControl>
                      <Input placeholder="/src/assets/images/hero_cyclorama_studio...jpg" className="pl-9 bg-slate-950 border-slate-700" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              <div>
                <p className="text-sm font-medium text-slate-300 mb-3">Or pick a production photo preset:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => form.setValue("imageUrl", img.url)}
                      className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                        form.watch("imageUrl") === img.url ? "border-violet-500 ring-2 ring-violet-500/20" : "border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-24 object-cover opacity-80 hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 w-full bg-slate-950/80 text-xs py-1.5 text-center text-white">
                        {img.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ৪. Production Amenities & Features */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Production Amenities & Features</h2>
                <p className="text-sm text-slate-400 mt-1">Select all equipment and facilities available at your studio</p>
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
                                    ? "bg-violet-950/30 border-violet-600 text-white" 
                                    : "bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500"
                                }`}
                                onClick={() => {
                                  // Custom toggle logic to make the whole div clickable
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
                                    className={`border-slate-500 ${field.value?.includes(item) ? "bg-violet-600 border-violet-600 text-white" : ""}`}
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

            {/* ৫. Host Information (Read-Only) */}
            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Host Information (Read-Only)</h2>
                <p className="text-sm text-slate-400 mt-1">This studio listing will be tied to your verified account credentials</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Host Name</label>
                  <Input value="Julfikar Rahman" readOnly disabled className="bg-slate-950/50 border-slate-800 text-slate-500 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Host Email</label>
                  <Input value="julfikar8574@gmail.com" readOnly disabled className="bg-slate-950/50 border-slate-800 text-slate-500 cursor-not-allowed" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pb-12">
              <Button type="button" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white min-w-[150px]">
                Publish Studio Listing
              </Button>
            </div>
            
          </form>
        </Form>
      </div>
    </div>
  );
}