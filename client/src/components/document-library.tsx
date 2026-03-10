import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, FileText, ShieldAlert, BookOpen, MoreHorizontal } from "lucide-react";
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

const isSDS = (docType: string) => docType?.toLowerCase().includes("safety");
const isTDB = (docType: string) => !isSDS(docType) && (docType?.toLowerCase().includes("technical") || docType?.toLowerCase().includes("bulletin"));
const isPDS = (docType: string) => !isSDS(docType) && !isTDB(docType) && docType?.toLowerCase().includes("product");
const isOther = (docType: string) => !isSDS(docType) && !isTDB(docType) && !isPDS(docType);

type FilterTab = "all" | "product" | "sds" | "tdb" | "other";

const TAB_CONFIG: { id: FilterTab; label: string; activeClass: string }[] = [
  { id: "all",     label: "All",            activeClass: "bg-zinc-800 text-white border-zinc-800" },
  { id: "product", label: "Product Sheets", activeClass: "bg-zinc-800 text-white border-zinc-800" },
  { id: "sds",     label: "Safety Data",    activeClass: "bg-orange-50 text-orange-700 border-orange-200" },
  { id: "tdb",     label: "Tech Bulletins", activeClass: "bg-sky-50 text-sky-700 border-sky-200" },
  { id: "other",   label: "Other",          activeClass: "bg-zinc-100 text-zinc-700 border-zinc-300" },
];

function docIcon(docType: string) {
  if (isSDS(docType)) return <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />;
  if (isTDB(docType)) return <BookOpen className="w-3.5 h-3.5 text-sky-400" />;
  return <FileText className="w-3.5 h-3.5 text-zinc-400" />;
}

function docIconBg(docType: string, hover: boolean) {
  if (isSDS(docType)) return hover ? "bg-orange-100" : "bg-orange-50";
  if (isTDB(docType)) return hover ? "bg-sky-100" : "bg-sky-50";
  return hover ? "bg-zinc-200" : "bg-zinc-100";
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

export function DocumentLibrary({ isOpen, onClose }: DocumentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  const { products: allProducts, isLoading } = useCatalog(searchQuery || undefined);

  const sorted = [...allProducts].sort((a, b) =>
    a.product_name.localeCompare(b.product_name, undefined, { sensitivity: "base" })
  );

  const products = sorted.filter((p) => {
    if (activeTab === "sds")     return isSDS(p.document_type);
    if (activeTab === "tdb")     return isTDB(p.document_type);
    if (activeTab === "product") return isPDS(p.document_type);
    if (activeTab === "other")   return isOther(p.document_type);
    return true;
  });

  return (
    <>
      <aside className="w-full h-full flex flex-col min-h-0">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-zinc-100 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-zinc-800 tracking-tight">
              Product Library
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-700 lg:hidden"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
          <p className="text-xs text-zinc-400 mb-2">
            {isLoading ? "Loading…" : `${products.length} sheets`}
          </p>

          {/* Filter tabs — wrap onto two rows if needed */}
          <div className="flex flex-wrap gap-1 mb-3">
            {TAB_CONFIG.map(({ id, label, activeClass }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                  activeTab === id
                    ? `${activeClass} font-medium`
                    : "text-zinc-500 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <Input
              placeholder="Search products, manufacturers…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-zinc-50 border-zinc-200 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:border-primary/50"
            />
          </div>
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
              <p className="text-xs text-zinc-400 mt-0.5">Try different search terms</p>
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
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${docIconBg(product.document_type, false)} group-hover:${docIconBg(product.document_type, true)}`}>
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
                        <span className={`inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded border ${categoryColor(product.product_category)}`}>
                          {product.product_category}
                        </span>
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
