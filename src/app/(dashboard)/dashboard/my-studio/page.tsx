"use client";

import Link from "next/link";
import { MapPin, Star, PlusCircle, ExternalLink, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// --- Dummy Data (পরে API থেকে ফেচ করবে) ---
const DUMMY_LISTINGS = [
  {
    id: "1",
    title: "Lumina Grand Cyclorama Stage",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=200&auto=format&fit=crop",
    location: "Soho Design District, New York, NY",
    category: "Photo Studios",
    rate: 145,
    capacity: 25,
    rating: 4.96,
  },
  {
    id: "2",
    title: "The Greenhouse Daylight Photo Pavilion",
    image: "https://images.unsplash.com/photo-1593697821252-0c9137d9fc45?q=80&w=200&auto=format&fit=crop",
    location: "Greenpoint Waterfront, Brooklyn, NY",
    category: "Photo Studios",
    rate: 130,
    capacity: 15,
    rating: 4.89,
  },
];

export default function MyListingsPage() {
  const handleDelete = () => {
    // Deletion will be wired to the API once the listing endpoint is available.
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] py-12 px-4 text-gray-900 dark:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* হেডার সেকশন */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              My Studio Listings
            </h1>
            <p className="text-gray-400 dark:text-gray-400 mt-2 text-sm md:text-base">
              Manage your listed production spaces, update hourly rates, and review listings.
            </p>
          </div>
          <Link href="/add-studio">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New Studio
            </Button>
          </Link>
        </div>

        {/* টেবিল সেকশন */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              
              {/* টেবিল হেডার */}
              <thead className="bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/5 text-xs uppercase text-gray-400 dark:text-gray-400 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Studio Space</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Hourly Rate</th>
                  <th className="px-6 py-4">Capacity</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              
              {/* টেবিল বডি */}
              <tbody className="divide-y divide-slate-800/50">
                {DUMMY_LISTINGS.map((studio) => (
                  <tr key={studio.id} className="hover:bg-slate-800/20 transition-colors">
                    
                    {/* Studio Space (Image + Title) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-md overflow-hidden shrink-0 bg-slate-800">
                          <img 
                            src={studio.image} 
                            alt={studio.title} 
                            className="w-full h-full object-cover opacity-90"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{studio.title}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {studio.location}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-violet-950/40 text-violet-400 border border-violet-900/50 whitespace-nowrap">
                        {studio.category}
                      </span>
                    </td>

                    {/* Hourly Rate */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 dark:text-white">${studio.rate}</span>
                      <span className="text-xs text-slate-400">/hr</span>
                    </td>

                    {/* Capacity */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">{studio.capacity} people</span>
                    </td>

                    {/* Rating */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-slate-300">
                        <Star className="w-4 h-4 text-violet-500 fill-violet-500" />
                        <span>{studio.rating}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        
                        <Link href={`/studios/edit/${studio.id}`}>
                          <Button variant="outline" size="sm" className="h-8 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                            <Edit className="w-3.5 h-3.5 mr-1.5" />
                            Update
                          </Button>
                        </Link>

                        {/* Delete Confirmation Modal */}
                        <Dialog>
                          <DialogTrigger
                            render={
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-950/30">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            }
                          />
                          <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
                            <DialogHeader>
                              <DialogTitle>Are you absolutely sure?</DialogTitle>
                              <DialogDescription className="text-slate-400">
                                This action cannot be undone. This will permanently delete your
                                studio listing and remove your data from our servers.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="mt-4">
                              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                                Cancel
                              </Button>
                              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                                Delete Studio
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}