import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDocuments } from "@/hooks/use-documents";
import { DocumentModal } from "./document-modal";
import { UploadModal } from "./upload-modal";
import { X, Search, CloudUpload, FileText } from "lucide-react";
import { type Document } from "@shared/schema";

interface DocumentLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentLibrary({ isOpen, onClose }: DocumentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const { documents, isLoading, uploadFiles } = useDocuments();

  const filteredDocuments = documents?.filter((doc) =>
    doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleFileUpload = (files: FileList) => {
    uploadFiles(files);
    setShowUploadModal(true);
  };

  const getMembraneTypeColor = (content: string) => {
    if (content.toLowerCase().includes("tpo")) return "bg-blue-100 text-blue-700";
    if (content.toLowerCase().includes("epdm")) return "bg-orange-100 text-orange-700";
    if (content.toLowerCase().includes("pvc")) return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-700";
  };

  const getWarrantyInfo = (content: string) => {
    const warrantyMatch = content.match(/(\d+)-year warranty/i);
    return warrantyMatch ? `${warrantyMatch[1]}yr Warranty` : "Warranty Info";
  };

  return (
    <>
      <aside className="w-full h-full bg-white border-r border-gray-200 flex flex-col">
        {/* Library Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Document Library</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Upload Section */}
          <div className="mb-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <CloudUpload className="text-gray-400 w-8 h-8 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Upload PDF Assembly Letters</p>
              <p className="text-xs text-gray-500 mt-1">Drag & drop or click to browse</p>
            </div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf"
              multiple
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Document List */}
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
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No documents found</p>
              <p className="text-sm">Upload PDF assembly letters to get started</p>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedDocument(doc)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <FileText className="text-red-500 w-5 h-5 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {doc.originalName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getMembraneTypeColor(doc.content)}>
                          {doc.content.toLowerCase().includes("tpo") ? "TPO Membrane" :
                           doc.content.toLowerCase().includes("epdm") ? "EPDM Membrane" :
                           doc.content.toLowerCase().includes("pvc") ? "PVC Membrane" : "Membrane"}
                        </Badge>
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          {getWarrantyInfo(doc.content)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </aside>

      {/* Document Modal */}
      {selectedDocument && (
        <DocumentModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </>
  );
}
