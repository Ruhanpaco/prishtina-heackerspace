"use client";

import React, { useState, useEffect } from "react";
import { getCsrfToken } from "next-auth/react";
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Package,
    MapPin,
    Upload,
    ChevronDown,
    Loader2,
    ExternalLink,
    FileJson,
    FileSpreadsheet,
    ShieldX,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface InventoryItem {
    _id: string;
    name: string;
    manufacturer?: string;
    description?: string;
    category: string;
    subCategory?: string;
    unit: string;
    quantity: number;
    location: string;
    inUse: boolean;
    inUseBy?: {
        _id: string;
        name: string;
        image?: string;
    };
    electricSpecs?: {
        voltage?: string;
        current?: string;
        power?: string;
        notes?: string;
    };
    updatedAt: string;
}

export function InventoryDashboard() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const { toast } = useToast();

    // Form state
    const [formData, setFormData] = useState<Partial<InventoryItem>>({
        name: "",
        manufacturer: "",
        description: "",
        category: "",
        subCategory: "",
        unit: "pcs",
        quantity: 1,
        location: "",
        electricSpecs: {
            voltage: "",
            current: "",
            power: "",
            notes: ""
        }
    });

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const url = new URL("/api/v2/GET/inventory", window.location.origin);
            url.searchParams.append("page", currentPage.toString());
            url.searchParams.append("limit", "25");
            if (categoryFilter !== "all") url.searchParams.append("category", categoryFilter);
            if (searchTerm) url.searchParams.append("query", searchTerm);

            const res = await fetch(url.toString());
            const data = await res.json();
            if (data.items) {
                setItems(data.items);
                setTotalPages(data.pagination.totalPages);
                setTotalItems(data.pagination.total);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch inventory items",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchItems();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, categoryFilter, currentPage]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingItem ? "PATCH" : "POST";
        const url = editingItem
            ? `/api/v2/PATCH/inventory/${editingItem._id}`
            : "/api/v2/POST/inventory";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast({
                    title: "Success",
                    description: `Item ${editingItem ? "updated" : "created"} successfully`
                });
                setIsAddModalOpen(false);
                setEditingItem(null);
                setFormData({
                    name: "", manufacturer: "", description: "", category: "", subCategory: "",
                    unit: "pcs", quantity: 1, location: "",
                    electricSpecs: { voltage: "", current: "", power: "", notes: "" }
                });
                fetchItems();
            } else {
                const err = await res.json();
                toast({
                    title: "Error",
                    description: err.error || "Something went wrong",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save item",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        try {
            const res = await fetch(`/api/v2/DELETE/inventory/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast({ title: "Deleted", description: "Item removed from inventory" });
                fetchItems();
            }
        } catch (error) {
            toast({ title: "Error", description: "Delete failed", variant: "destructive" });
        }
    };

    const handleImport = async () => {
        if (!selectedFile) return;
        setIsImporting(true);
        try {
            const reader = new FileReader();
            const fileContent = await new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsText(selectedFile);
            });

            let parsed;
            const fileName = selectedFile.name.toLowerCase();

            if (fileName.endsWith(".json")) {
                parsed = JSON.parse(fileContent);
            } else {
                // Handle TSV/CSV (Supports "One Thousand Columns")
                const delimiter = fileName.endsWith(".tsv") ? "\t" : ",";
                const lines = fileContent.split(/\r?\n/).filter(line => line.trim());
                if (lines.length < 2) throw new Error("File empty or missing data rows");

                const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ""));
                parsed = lines.slice(1).map(line => {
                    const values = line.split(delimiter);
                    const obj: any = {};
                    headers.forEach((h, i) => {
                        if (h) {
                            // Extract value and remove optional quotes
                            obj[h] = (values[i] || "").trim().replace(/^"|"$/g, "");
                        }
                    });
                    return obj;
                });
            }

            const csrfToken = await getCsrfToken();

            const res = await fetch("/api/v2/POST/inventory/import", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-csrf-token": csrfToken || ""
                },
                body: JSON.stringify(parsed)
            });

            if (res.ok) {
                const result = await res.json();
                toast({
                    title: "Import Success",
                    description: `Successfully imported ${result.count} items`
                });
                setIsImportModalOpen(false);
                setSelectedFile(null);
                fetchItems();
            } else {
                const err = await res.json();
                toast({ title: "Import Failed", description: err.error || err.message || "Failed to import", variant: "destructive" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Import failed. Ensure file format is correct.", variant: "destructive" });
        } finally {
            setIsImporting(false);
        }
    };

    const openEditModal = (item: InventoryItem) => {
        setEditingItem(item);
        setFormData(item);
        setIsAddModalOpen(true);
    };

    const categories = Array.from(new Set(items.map(i => i.category)));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Package className="w-8 h-8 text-brand-yellow" />
                        Inventory Control
                    </h1>
                    <p className="text-zinc-500 font-medium mt-1">Manage equipment, tools, and components spanning the space.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-white/5 bg-white/5 hover:bg-white/10 text-zinc-400 font-bold px-6 rounded-2xl h-11 flex items-center gap-2">
                                <Upload className="w-5 h-5" />
                                Import Data
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-zinc-900 border-white/10 text-white rounded-3xl overflow-hidden p-0">
                            <DialogHeader className="p-6 bg-zinc-950/50 border-b border-white/5">
                                <DialogTitle className="text-2xl font-black">Bulk Asset Import</DialogTitle>
                            </DialogHeader>
                            <div className="p-6 space-y-4">
                                <div className="p-4 rounded-2xl bg-brand-yellow/5 border border-brand-yellow/10 space-y-2">
                                    <p className="text-xs text-brand-yellow/80 font-bold uppercase tracking-widest flex items-center gap-2">
                                        <FileJson className="w-4 h-4" />
                                        Instructions
                                    </p>
                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                        Upload your inventory data as a <strong>JSON</strong> file or a <strong>CSV/TSV</strong> spreadsheet.
                                        CSV headers should match: <code>name, manufacturer, category, location, quantity</code>
                                    </p>
                                </div>

                                <div className="group relative">
                                    <input
                                        type="file"
                                        id="inventory-file"
                                        className="hidden"
                                        accept=".json,.csv,.tsv"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    />
                                    <label
                                        htmlFor="inventory-file"
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setIsDragging(true);
                                        }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDragging(false);
                                            const file = e.dataTransfer.files?.[0];
                                            if (file) setSelectedFile(file);
                                        }}
                                        className={cn(
                                            "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 bg-black/20",
                                            isDragging ? "border-brand-yellow bg-brand-yellow/10 scale-[0.99]" : "",
                                            selectedFile
                                                ? "border-brand-yellow/50 bg-brand-yellow/5"
                                                : "border-white/10 hover:border-brand-yellow/30 hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {selectedFile ? (
                                                <>
                                                    <div className="w-12 h-12 rounded-2xl bg-brand-yellow/20 flex items-center justify-center mb-3 animate-bounce">
                                                        <FileSpreadsheet className="w-6 h-6 text-brand-yellow" />
                                                    </div>
                                                    <p className="mb-1 text-sm text-white font-bold">{selectedFile.name}</p>
                                                    <p className="text-xs text-zinc-500">{(selectedFile.size / 1024).toFixed(1)} KB • Ready to sync</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-10 h-10 mb-3 text-zinc-600 group-hover:text-brand-yellow transition-colors" />
                                                    <p className="mb-2 text-sm text-zinc-400 font-bold tracking-tight">Click to browse or drag & drop</p>
                                                    <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">JSON, CSV, or TSV</p>
                                                </>
                                            )}
                                        </div>
                                    </label>
                                    {selectedFile && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedFile(null)}
                                            className="absolute top-2 right-2 text-zinc-600 hover:text-red-400"
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                    <Button variant="ghost" onClick={() => setIsImportModalOpen(false)} className="rounded-xl h-10 px-6 font-bold text-zinc-400">Cancel</Button>
                                    <Button
                                        onClick={handleImport}
                                        disabled={isImporting || !selectedFile}
                                        className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-black h-10 px-8 rounded-xl shadow-lg shadow-brand-yellow/10 min-w-[140px]"
                                    >
                                        {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Initiate Import"}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                        setIsAddModalOpen(open);
                        if (!open) {
                            setEditingItem(null);
                            setFormData({
                                name: "", manufacturer: "", description: "", category: "", subCategory: "",
                                unit: "pcs", quantity: 1, location: "",
                                electricSpecs: { voltage: "", current: "", power: "", notes: "" }
                            });
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold px-6 rounded-2xl h-11 shadow-lg shadow-brand-yellow/10 flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Add Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-zinc-900 border-white/10 text-white rounded-3xl overflow-hidden p-0">
                            <DialogHeader className="p-6 bg-zinc-950/50 border-b border-white/5">
                                <DialogTitle className="text-2xl font-black">{editingItem ? "Edit Asset" : "Register New Asset"}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSave} className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Item Name</label>
                                        <Input
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-black/40 border-white/5 rounded-xl h-12"
                                            placeholder="e.g. Oscilloscope DHO1074"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Manufacturer</label>
                                        <Input
                                            value={formData.manufacturer}
                                            onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                                            className="bg-black/40 border-white/5 rounded-xl h-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Location</label>
                                        <Input
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            className="bg-black/40 border-white/5 rounded-xl h-10"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Category</label>
                                        <Input
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="bg-black/40 border-white/5 rounded-xl h-10"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Quantity</label>
                                        <Input
                                            type="number"
                                            value={formData.quantity}
                                            onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                            className="bg-black/40 border-white/5 rounded-xl h-10"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-black h-12 px-8 rounded-2xl w-full sm:w-auto">
                                        {editingItem ? "Update Asset" : "Finalize Registration"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filter/Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        placeholder="Search assets, manufacturers, or descriptions..."
                        className="bg-zinc-900/40 border-white/5 rounded-2xl h-12 pl-12"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[200px] bg-zinc-900/40 border-white/5 rounded-2xl h-12">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-zinc-500" />
                            <SelectValue placeholder="All Categories" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table Area */}
            <Card className="rounded-3xl border-white/5 bg-zinc-900/40 backdrop-blur-md overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Asset Info</th>
                                    <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Metric / Location</th>
                                    <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Electrical</th>
                                    <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                                    <th className="text-right py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <Loader2 className="w-8 h-8 text-brand-yellow animate-spin mx-auto mb-2" />
                                            <p className="text-zinc-500 text-xs font-black uppercase tracking-tighter">Scanning Inventory...</p>
                                        </td>
                                    </tr>
                                ) : items.length > 0 ? (
                                    items.map((item) => (
                                        <tr key={item._id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5 text-brand-yellow">
                                                        <Package className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white group-hover:text-brand-yellow transition-colors">{item.name}</div>
                                                        <div className="text-[10px] text-zinc-500 font-black uppercase">{item.manufacturer || "Generic"}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-xs font-bold text-zinc-300">
                                                    {item.quantity} {item.unit} @ <span className="text-brand-yellow/80">{item.location}</span>
                                                </div>
                                                <Badge variant="outline" className="text-[8px] h-4 border-white/10 text-zinc-500 uppercase mt-1">{item.category}</Badge>
                                            </td>
                                            <td className="py-4 px-6 text-[10px] text-zinc-400 font-black">
                                                {item.electricSpecs?.voltage || item.electricSpecs?.power || "None"}
                                            </td>
                                            <td className="py-4 px-6">
                                                {item.inUse ? (
                                                    <Badge className="bg-brand-yellow/10 text-brand-yellow border-none text-[9px] font-black uppercase">Claimed</Badge>
                                                ) : (
                                                    <Badge className="bg-green-500/10 text-green-400 border-none text-[9px] font-black uppercase">Ready</Badge>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-brand-yellow" onClick={() => openEditModal(item)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-400" onClick={() => handleDelete(item._id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-32 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs">No assets detected</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-between px-2 pt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        Page {currentPage} of {totalPages} <span className="mx-2 opacity-20">|</span> {totalItems} Assets Total
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="bg-zinc-900 border-white/5 text-white rounded-xl h-10 px-4 hover:bg-brand-yellow hover:text-black transition-all"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Prev
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="bg-zinc-900 border-white/5 text-white rounded-xl h-10 px-4 hover:bg-brand-yellow hover:text-black transition-all"
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
