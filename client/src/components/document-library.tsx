import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useProducts } from "@/hooks/use-products";
import { ProductModal } from "./product-modal";
import { X, Search, FileText, Building, Shield, Wind } from "lucide-react";
import { type ProductData } from "@shared/schema";

interface DocumentLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentLibrary({ isOpen, onClose }: DocumentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  
  const { products, isLoading } = useProducts();

  const filteredProducts = products?.filter((product) =>
    product.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.system.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.membraneType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.location && product.location.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const getSystemColor = (system: string) => {
    switch (system.toLowerCase()) {
      case 'tpo': return "bg-blue-100 text-blue-700";
      case 'epdm': return "bg-orange-100 text-orange-700";
      case 'pvc': return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      <aside className="w-full h-full bg-white border-r border-gray-200 flex flex-col">
        {/* Library Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Product Library</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Browse roofing system specifications from zip file product sheets
            </p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                {products.length} Product Sheets
              </Badge>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No products found</p>
              <p className="text-sm">Try adjusting your search terms</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedProduct(product)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <Building className="text-blue-500 w-5 h-5 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {product.projectName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {product.manufacturer} • {product.location}
                      </p>
                      <div className="flex items-center flex-wrap gap-2 mt-2">
                        <Badge className={getSystemColor(product.system)}>
                          {product.manufacturer}
                        </Badge>
                        <Badge variant="outline" className="text-purple-600 border-purple-200">
                          {product.specifications?.category || 
                           (product.membraneType.includes('Primer') ? 'Primer' :
                            product.membraneType.includes('Walkway') ? 'Walkway' :
                            product.membraneType.includes('Adhesive') ? 'Adhesive' :
                            product.membraneType.includes('Sealant') ? 'Sealant' :
                            product.membraneType.includes('Fastener') ? 'Fastener' :
                            product.membraneType.includes('Membrane') ? 'Membrane' : 'Other')}
                        </Badge>
                        <Badge variant="outline" className="text-indigo-600 border-indigo-200">
                          {product.system}
                        </Badge>
                        {product.warranty && (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            <Shield className="w-3 h-3 mr-1" />
                            {product.warranty.match(/(\d+)-year/)?.[1] || ""}yr
                          </Badge>
                        )}
                        {product.windSpeed && (
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            <Wind className="w-3 h-3 mr-1" />
                            {product.windSpeed}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </aside>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}