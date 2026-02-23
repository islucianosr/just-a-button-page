import { useCallback, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const xmlFile = files.find(file => file.name.endsWith('.xml'));

    if (xmlFile) {
      setSelectedFile(xmlFile);
      onFileSelect(xmlFile);
    } else {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo XML válido.',
        variant: 'destructive',
      });
    }
  }, [onFileSelect, toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (
    <Card
      className={`p-12 border-2 border-dashed transition-all duration-300 ${
        isDragging ? 'border-primary bg-primary/5 scale-105' : 'border-border'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="p-6 rounded-full bg-primary/10">
          <Upload className="w-12 h-12 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold">Upload XML do Google Maps</h3>
          <p className="text-muted-foreground max-w-md">
            Arraste e solte seu arquivo XML aqui ou clique para selecionar
          </p>
        </div>

        {selectedFile && (
          <div className="flex items-center gap-2 p-4 bg-accent/10 rounded-lg">
            <FileText className="w-5 h-5 text-accent" />
            <span className="font-medium">{selectedFile.name}</span>
          </div>
        )}

        <label htmlFor="file-upload">
          <Button variant="default" size="lg" className="cursor-pointer" asChild>
            <span>Selecionar Arquivo</span>
          </Button>
          <input
            id="file-upload"
            type="file"
            accept=".xml"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>
    </Card>
  );
};
