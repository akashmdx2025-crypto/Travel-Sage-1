import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { FileUploader } from '@/components/planner/FileUploader';
import { AnalysisViewer } from '@/components/planner/AnalysisViewer';
import { ChatBox } from '@/components/planner/ChatBox';
import { ItineraryViewer } from '@/components/planner/ItineraryViewer';
import { PackingViewer } from '@/components/planner/PackingViewer';
import { BudgetViewer } from '@/components/planner/BudgetViewer';
import { TipsViewer } from '@/components/planner/TipsViewer';
import { LogsViewer } from '@/components/planner/LogsViewer';
import { UploadTravelGuideResult } from '@workspace/api-zod/src/generated/types/uploadTravelGuideResult';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function Planner() {
  const [uploadResult, setUploadResult] = useState<UploadTravelGuideResult | null>(null);

  const handleUploadSuccess = (result: UploadTravelGuideResult) => {
    setUploadResult(result);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {!uploadResult ? (
          <div className="max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-bold text-primary mb-3">Workspace</h1>
              <p className="text-muted-foreground">
                Start by providing reference material for your destination.
              </p>
            </div>
            <FileUploader onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Context & Chat */}
            <div className="lg:col-span-4 space-y-8 flex flex-col">
              <div>
                <h2 className="text-lg font-serif font-bold text-primary mb-4">Destination Context</h2>
                <div className="bg-card border rounded-lg p-4 shadow-sm text-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{uploadResult.analysis.destinationName}</span>
                    <span className="text-muted-foreground text-xs">{uploadResult.wordCount} words</span>
                  </div>
                  <p className="text-muted-foreground line-clamp-3 mb-2">{uploadResult.textPreview}</p>
                  <div className="text-[10px] text-muted-foreground/70 uppercase tracking-wider">
                    Doc ID: {uploadResult.documentId}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex-1 flex flex-col">
                <ChatBox documentId={uploadResult.documentId} />
              </div>
            </div>
            
            {/* Right Column: Workspaces */}
            <div className="lg:col-span-8">
              <Tabs defaultValue="analysis" className="w-full">
                <TabsList className="grid grid-cols-6 mb-6">
                  <TabsTrigger value="analysis" className="text-xs sm:text-sm">Overview</TabsTrigger>
                  <TabsTrigger value="itinerary" className="text-xs sm:text-sm">Itinerary</TabsTrigger>
                  <TabsTrigger value="packing" className="text-xs sm:text-sm">Packing</TabsTrigger>
                  <TabsTrigger value="budget" className="text-xs sm:text-sm">Budget</TabsTrigger>
                  <TabsTrigger value="tips" className="text-xs sm:text-sm">Tips</TabsTrigger>
                  <TabsTrigger value="logs" className="text-xs sm:text-sm">Logs</TabsTrigger>
                </TabsList>
                
                <div className="bg-card border rounded-lg p-6 shadow-sm min-h-[600px]">
                  <TabsContent value="analysis" className="m-0">
                    <AnalysisViewer uploadResult={uploadResult} />
                  </TabsContent>
                  
                  <TabsContent value="itinerary" className="m-0">
                    <div className="mb-6">
                      <h2 className="text-2xl font-serif font-bold text-primary">Itinerary Planner</h2>
                      <p className="text-muted-foreground mt-1">Generate a day-by-day plan based exclusively on your guide.</p>
                    </div>
                    <ItineraryViewer documentId={uploadResult.documentId} />
                  </TabsContent>
                  
                  <TabsContent value="packing" className="m-0">
                    <div className="mb-6">
                      <h2 className="text-2xl font-serif font-bold text-primary">Packing List</h2>
                      <p className="text-muted-foreground mt-1">Get recommendations based on destination climate and activities.</p>
                    </div>
                    <PackingViewer documentId={uploadResult.documentId} />
                  </TabsContent>
                  
                  <TabsContent value="budget" className="m-0">
                    <div className="mb-6">
                      <h2 className="text-2xl font-serif font-bold text-primary">Budget Estimator</h2>
                      <p className="text-muted-foreground mt-1">Cost breakdown derived from guidebook pricing.</p>
                    </div>
                    <BudgetViewer documentId={uploadResult.documentId} />
                  </TabsContent>

                  <TabsContent value="tips" className="m-0">
                    <div className="mb-6">
                      <h2 className="text-2xl font-serif font-bold text-primary">Destination Tips</h2>
                      <p className="text-muted-foreground mt-1">Crucial advice for a smooth and respectful trip.</p>
                    </div>
                    <TipsViewer documentId={uploadResult.documentId} />
                  </TabsContent>
                  
                  <TabsContent value="logs" className="m-0">
                    <div className="mb-6">
                      <h2 className="text-2xl font-serif font-bold text-primary">System Logs</h2>
                      <p className="text-muted-foreground mt-1">Monitor AI requests, latency, and guardrail interventions.</p>
                    </div>
                    <LogsViewer />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
