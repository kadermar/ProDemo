import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ProductData } from "@shared/schema";
import { Building, Shield, Wind, Calendar, MapPin, User } from "lucide-react";

interface ProductModalProps {
  product: ProductData | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  if (!product) return null;

  const getSystemColor = (system: string) => {
    switch (system.toLowerCase()) {
      case 'tpo': return 'bg-blue-100 text-blue-800';
      case 'epdm': return 'bg-orange-100 text-orange-800';
      case 'pvc': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {product.projectName}
            <Badge className={getSystemColor(product.system)}>
              {product.system}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">System Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Manufacturer:</strong> {product.manufacturer}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    <strong>Membrane:</strong> {product.thickness} {product.membraneType}
                  </span>
                </div>
                {product.buildingHeight && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Building Height:</strong> {product.buildingHeight}
                    </span>
                  </div>
                )}
                {product.windSpeed && (
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Wind Speed:</strong> {product.windSpeed}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {product.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Location:</strong> {product.location}
                    </span>
                  </div>
                )}
                {product.contractor && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Contractor:</strong> {product.contractor}
                    </span>
                  </div>
                )}
                {product.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Date:</strong> {product.date}
                    </span>
                  </div>
                )}
                {product.warranty && (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Warranty:</strong> {product.warranty}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Specifications */}
          {product.specifications && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="border-l-4 border-blue-200 pl-4">
                      <div className="font-medium text-sm capitalize mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-sm text-gray-600">{value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Source Document */}
          {product.sourceDocument && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Source Document</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <strong>Original Document:</strong> {product.sourceDocument}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}