import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, X } from "lucide-react";
import { type Document } from "@shared/schema";

interface DocumentModalProps {
  document: Document;
  onClose: () => void;
}

export function DocumentModal({ document, onClose }: DocumentModalProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const extractKeyInfo = (content: string) => {
    const lines = content.split('\n');
    const keyInfo: { [key: string]: string } = {};
    
    lines.forEach(line => {
      if (line.includes('Building Height:')) {
        keyInfo['Building Height'] = line.split(':')[1]?.trim() || '';
      }
      if (line.includes('Membrane:')) {
        keyInfo['Membrane'] = line.split(':')[1]?.trim() || '';
      }
      if (line.includes('Insulation:')) {
        keyInfo['Insulation'] = line.split(':')[1]?.trim() || '';
      }
      if (line.includes('Deck:')) {
        keyInfo['Deck'] = line.split(':')[1]?.trim() || '';
      }
      if (line.includes('warranty')) {
        keyInfo['Warranty'] = line.trim();
      }
    });
    
    return keyInfo;
  };

  const keyInfo = extractKeyInfo(document.content);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-red-500" />
            <span>Document Viewer</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="text-red-500 w-6 h-6" />
                <div>
                  <h4 className="font-medium text-gray-900">
                    {document.originalName}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Uploaded on {formatDate(document.uploadedAt)}
                  </p>
                </div>
              </div>

              {Object.keys(keyInfo).length > 0 && (
                <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                  <h5 className="font-medium text-gray-900 mb-3">Key Information</h5>
                  <div className="space-y-2">
                    {Object.entries(keyInfo).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="font-medium text-gray-700 w-32 flex-shrink-0">
                          {key}:
                        </span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h5 className="font-medium text-gray-900 mb-3">Full Content</h5>
                <div className="font-mono text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {document.content}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
