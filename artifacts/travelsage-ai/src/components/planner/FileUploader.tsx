import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUploadTravelGuide } from '@workspace/api-client-react';
import { UploadTravelGuideResult } from '@workspace/api-zod/src/generated/types/uploadTravelGuideResult';

interface FileUploaderProps {
  onUploadSuccess: (result: UploadTravelGuideResult) => void;
}

export function FileUploader({ onUploadSuccess }: FileUploaderProps) {
  const [pastedText, setPastedText] = useState('');
  const uploadMutation = useUploadTravelGuide();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result?.toString().split(',')[1];
      if (base64) {
        uploadMutation.mutate(
          {
            data: {
              fileName: file.name,
              mimeType: file.type,
              contentBase64: base64,
            },
          },
          {
            onSuccess: (data) => {
              onUploadSuccess(data);
            },
          }
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTextUpload = () => {
    if (!pastedText.trim()) return;
    
    uploadMutation.mutate(
      {
        data: {
          fileName: 'pasted-notes.txt',
          pastedText,
        },
      },
      {
        onSuccess: (data) => {
          onUploadSuccess(data);
        },
      }
    );
  };

  return (
    <Card className="w-full shadow-lg border-primary/10">
      <CardHeader className="bg-muted/50 pb-4 border-b">
        <CardTitle className="text-xl text-primary font-serif">Upload Destination Guide</CardTitle>
        <CardDescription>Provide a guidebook, PDF, or paste your travel notes to ground the AI.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="file">Upload Document</TabsTrigger>
            <TabsTrigger value="text">Paste Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-10 bg-muted/30 hover:bg-muted/50 transition-colors">
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm text-foreground font-medium mb-1">Drag and drop your guide here</p>
              <p className="text-xs text-muted-foreground mb-4">Supports PDF, TXT, MD</p>
              
              <Button asChild variant="outline" disabled={uploadMutation.isPending}>
                <label className="cursor-pointer">
                  {uploadMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    "Select File"
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.txt,.md" 
                    onChange={handleFileUpload}
                    disabled={uploadMutation.isPending}
                  />
                </label>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="text">
            <div className="space-y-4">
              <Textarea 
                placeholder="Paste articles, blog posts, or Wikipedia excerpts about your destination..." 
                className="min-h-[200px] resize-y font-mono text-sm"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                disabled={uploadMutation.isPending}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleTextUpload} 
                  disabled={!pastedText.trim() || uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : (
                    <><FileText className="mr-2 h-4 w-4" /> Process Notes</>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {uploadMutation.isError && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Failed to process document. Please try again.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
