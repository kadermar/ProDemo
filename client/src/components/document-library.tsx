import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, FileText } from "lucide-react";
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

export function DocumentLibrary({ isOpen, onClose }: DocumentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  const { products, isLoading } = useCatalog(searchQuery || undefined);

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
          <p className="text-xs text-zinc-400 mb-3">
            {isLoading ? "Loading…" : `${products.length} product sheets`}
          </p>
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
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-zinc-200 transition-colors">
                      <FileText className="w-3.5 h-3.5 text-zinc-400" />
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
                        <span className="inline-flex text-[10px] text-zinc-400 border border-zinc-200 px-1.5 py-0.5 rounded">
                          {product.document_type}
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
