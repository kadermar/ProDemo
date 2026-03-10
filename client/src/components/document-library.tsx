import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, FileText, ShieldAlert, BookOpen, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useCatalog, type CatalogProduct } from "@/hooks/use-catalog";
import { CatalogProductModal } from "./catalog-product-modal";

interface DocumentLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  membrane:   "bg-blue-50 text-blue-700 border-blue-200",
  insulation: "bg-amber-50 text-amber-700 border-amber-200",
  fastener:   "bg-violet-50 text-violet-700 border-violet-200",
  adhesive:   "bg-rose-50 text-rose-700 border-rose-200",
  primer:     "bg-teal-50 text-teal-700 border-teal-200",
  accessory:  "bg-green-50 text-green-700 border-green-200",
};

const categoryColor = (cat: string) =>
  CATEGORY_COLORS[cat?.toLowerCase()] ?? "bg-zinc-100 text-zinc-600 border-zinc-200";

const isSDS   = (d: string) => d?.toLowerCase().includes("safety");
const isTDB   = (d: string) => !isSDS(d) && (d?.toLowerCase().includes("technical") || d?.toLowerCase().includes("bulletin"));
const isPDS   = (d: string) => !isSDS(d) && !isTDB(d) && d?.toLowerCase().includes("product");
const isOther = (d: string) => !isSDS(d) && !isTDB(d) && !isPDS(d);

function docTypeKey(d: string) {
  if (isSDS(d))   return "sds";
  if (isTDB(d))   return "tdb";
  if (isPDS(d))   return "product";
  return "other";
}

const DOC_TYPE_OPTIONS = [
  { value: "",        label: "All document types" },
  { value: "product", label: "Product Sheets" },
  { value: "sds",     label: "Safety Data Sheets" },
  { value: "tdb",     label: "Tech Bulletins" },
  { value: "other",   label: "Other" },
];

function docIcon(docType: string) {
  if (isSDS(docType)) return <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />;
  if (isTDB(docType)) return <BookOpen className="w-3.5 h-3.5 text-sky-400" />;
  return <FileText className="w-3.5 h-3.5 text-zinc-400" />;
}

function docIconBg(docType: string) {
  if (isSDS(docType)) return "bg-orange-50 group-hover:bg-orange-100";
  if (isTDB(docType)) return "bg-sky-50 group-hover:bg-sky-100";
  return "bg-zinc-100 group-hover:bg-zinc-200";
}

function docTypeBadge(docType: string) {
  if (isSDS(docType)) return "bg-orange-50 text-orange-600 border-orange-200";
  if (isTDB(docType)) return "bg-sky-50 text-sky-600 border-sky-200";
  return "text-zinc-400 border-zinc-200";
}

function docTypeLabel(docType: string) {
  if (isSDS(docType)) return "Safety Data Sheet";
  if (isTDB(docType)) return "Tech Bulletin";
  return docType;
}

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none text-[11px] h-7 pl-2.5 pr-6 rounded-lg border bg-zinc-50 transition-colors cursor-pointer outline-none focus:ring-1 focus:ring-primary/30 ${
          value ? "border-primary/40 text-zinc-800 bg-blue-50/50" : "border-zinc-200 text-zinc-500"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-1.5 top-1.5 w-3 h-3 text-zinc-400 pointer-events-none" />
    </div>
  );
}

export function DocumentLibrary({ isOpen, onClose }: DocumentLibraryProps) {
  const [searchQuery, setSearchQuery]     = useState("");
  const [brandFilter, setBrandFilter]     = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("");
  const [showFilters, setShowFilters]     = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  const { products: allProducts, isLoading } = useCatalog(searchQuery || undefined);

  // Derive sorted unique options from the full unfiltered list
  const brandOptions = useMemo(() => {
    const set = new Set(allProducts.map((p) => p.manufacturer).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
      .map((v) => ({ value: v, label: v }));
  }, [allProducts]);

  const categoryOptions = useMemo(() => {
    const set = new Set(allProducts.map((p) => p.product_category).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
      .map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));
  }, [allProducts]);

  const activeFilterCount = [brandFilter, categoryFilter, docTypeFilter].filter(Boolean).length;

  const products = useMemo(() => {
    return [...allProducts]
      .sort((a, b) => a.product_name.localeCompare(b.product_name, undefined, { sensitivity: "base" }))
      .filter((p) => {
        if (brandFilter    && p.manufacturer !== brandFilter)           return false;
        if (categoryFilter && p.product_category !== categoryFilter)    return false;
        if (docTypeFilter  && docTypeKey(p.document_type) !== docTypeFilter) return false;
        return true;
      });
  }, [allProducts, brandFilter, categoryFilter, docTypeFilter]);

  const clearFilters = () => {
    setBrandFilter("");
    setCategoryFilter("");
    setDocTypeFilter("");
  };

  return (
    <>
      <aside className="w-full h-full flex flex-col min-h-0">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-zinc-100 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-zinc-800 tracking-tight">
              Product Library
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`relative h-7 w-7 flex items-center justify-center rounded-lg border transition-colors ${
                  showFilters || activeFilterCount > 0
                    ? "border-primary/40 bg-blue-50 text-primary"
                    : "border-zinc-200 text-zinc-400 hover:text-zinc-600 hover:border-zinc-300"
                }`}
                title="Filters"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary text-white text-[8px] font-bold flex items-center justify-center leading-none">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-700 lg:hidden"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <p className="text-xs text-zinc-400 mb-2">
            {isLoading ? "Loading…" : `${products.length} sheets`}
          </p>

          {/* Search */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <Input
              placeholder="Search products, manufacturers…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-7 text-xs bg-zinc-50 border-zinc-200 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/50"
            />
          </div>

          {/* Expandable filters */}
          {showFilters && (
            <div className="space-y-1.5 pt-1 pb-0.5">
              <FilterSelect
                value={brandFilter}
                onChange={setBrandFilter}
                options={brandOptions}
                placeholder="All brands"
              />
              <FilterSelect
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={categoryOptions}
                placeholder="All product types"
              />
              <FilterSelect
                value={docTypeFilter}
                onChange={setDocTypeFilter}
                options={DOC_TYPE_OPTIONS.slice(1)}
                placeholder="All document types"
              />
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] text-primary hover:underline pt-0.5"
                >
                  Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="p-3 space-y-px">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="px-3 py-3 animate-pulse">
                  <div className="h-3 bg-zinc-100 rounded w-3/4 mb-2" />
                  <div className="h-2.5 bg-zinc-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-9 h-9 rounded-xl bg-zinc-50 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-4.5 h-4.5 text-zinc-300" />
              </div>
              <p className="text-xs font-medium text-zinc-500">No results found</p>
              <p className="text-xs text-zinc-400 mt-0.5">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {products.map((product) => (
                <button
                  key={product.id}
                  className="w-full text-left px-4 py-3 hover:bg-zinc-50 transition-colors group"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${docIconBg(product.document_type)}`}>
                      {docIcon(product.document_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-800 truncate leading-snug">
                        {product.product_name}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5 truncate">
                        {product.manufacturer}
                      </p>
                      <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                        {product.product_category && (
                          <span className={`inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded border ${categoryColor(product.product_category)}`}>
                            {product.product_category}
                          </span>
                        )}
                        <span className={`inline-flex text-[10px] px-1.5 py-0.5 rounded border ${docTypeBadge(product.document_type)}`}>
                          {docTypeLabel(product.document_type)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      <CatalogProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
