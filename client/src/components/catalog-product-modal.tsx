import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Loader2, Building2, Tag, Hash } from "lucide-react";
import { type CatalogProduct, getProductPdfUrl } from "@/hooks/use-catalog";

interface CatalogProductModalProps {
  product: CatalogProduct | null;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  membrane:   "bg-blue-100 text-blue-800",
  insulation: "bg-amber-100 text-amber-800",
  fastener:   "bg-violet-100 text-violet-800",
  adhesive:   "bg-rose-100 text-rose-800",
  primer:     "bg-teal-100 text-teal-800",
  accessory:  "bg-green-100 text-green-800",
};

const categoryColor = (cat: string) =>
  CATEGORY_COLORS[cat?.toLowerCase()] ?? "bg-zinc-100 text-zinc-700";

export function CatalogProductModal({ product, onClose }: CatalogProductModalProps) {
  const [loadingPdf, setLoadingPdf] = useState(false);

  if (!product) return null;

  const filename = product.source_file.split("/").pop() ?? product.source_file;

  const handleViewPdf = async () => {
    setLoadingPdf(true);
    try {
      const url = await getProductPdfUrl(product.source_file);
      window.open(url, "_blank");
    } catch (e) {
      console.error("Failed to get PDF URL", e);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-2 leading-snug">
            <span className="flex-1">{product.product_name}</span>
            <Badge className={`shrink-0 ${categoryColor(product.product_category)}`}>
              {product.product_category}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {product.manufacturer} · {product.document_type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Key info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-zinc-600">
              <Building2 className="w-4 h-4 shrink-0 text-zinc-400" />
              <span><span className="font-medium">Manufacturer:</span> {product.manufacturer}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600">
              <Tag className="w-4 h-4 shrink-0 text-zinc-400" />
              <span><span className="font-medium">Type:</span> {product.document_type}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600">
              <Hash className="w-4 h-4 shrink-0 text-zinc-400" />
              <span><span className="font-medium">Sections:</span> {product.chunk_count}</span>
            </div>
          </div>

          {/* Source file + PDF button */}
          <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 shrink-0 text-zinc-400" />
              <span className="text-xs text-zinc-500 truncate" title={filename}>{filename}</span>
            </div>
            <Button
              onClick={handleViewPdf}
              disabled={loadingPdf}
              size="sm"
              variant="outline"
              className="shrink-0 h-8 text-xs gap-1.5"
            >
              {loadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  View PDF
                  <ExternalLink className="w-3 h-3" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
