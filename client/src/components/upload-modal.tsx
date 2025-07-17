import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { CloudUpload, CheckCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface UploadModalProps {
  onClose: () => void;
}

export function UploadModal({ onClose }: UploadModalProps) {
  const [processingFiles, setProcessingFiles] = useState([
    { name: "assembly-letter-1.pdf", status: "completed" },
    { name: "assembly-letter-2.pdf", status: "processing" },
    { name: "assembly-letter-3.pdf", status: "pending" },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProcessingFiles(prev => prev.map(file => ({ ...file, status: "completed" })));
      
      const closeTimer = setTimeout(() => {
        onClose();
      }, 1000);

      return () => clearTimeout(closeTimer);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "processing":
        return <Loader2 className="w-6 h-6 text-primary animate-spin" />;
      default:
        return <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-gray-700";
      case "processing":
        return "text-gray-700";
      default:
        return "text-gray-400";
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <CloudUpload className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Processing Documents</h3>
              <p className="text-sm text-gray-500">Extracting product information...</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {processingFiles.map((file, index) => (
            <div key={index} className="flex items-center space-x-3">
              {getStatusIcon(file.status)}
              <span className={`text-sm ${getStatusColor(file.status)}`}>
                {file.name}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
