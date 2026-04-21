import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGenerateTips } from '@workspace/api-client-react';
import { Loader2, Lightbulb, ShieldAlert, Users, Info } from 'lucide-react';

export function TipsViewer({ documentId }: { documentId: string }) {
  const tipsMutation = useGenerateTips();

  const handleGenerate = () => {
    tipsMutation.mutate({ data: { documentId } });
  };

  return (
    <div className="space-y-4">
      {!tipsMutation.data && (
        <Card className="bg-muted/30 border-dashed text-center p-6">
          <CardContent className="pt-6">
            <Lightbulb className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Extract essential safety, cultural, and practical tips from the guide.
            </p>
            <Button 
              onClick={handleGenerate} 
              disabled={tipsMutation.isPending}
            >
              {tipsMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Extracting...</>
              ) : (
                "Extract Tips"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {tipsMutation.data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4">
          <Card className="border-t-4 border-t-destructive">
            <CardHeader className="py-4">
              <CardTitle className="text-base flex items-center text-destructive">
                <ShieldAlert className="h-4 w-4 mr-2" /> Safety & Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {tipsMutation.data.safety.map((tip, i) => (
                  <li key={i} className="text-sm flex items-start">
                    <span className="text-destructive font-bold mr-2">-</span> {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-primary">
            <CardHeader className="py-4">
              <CardTitle className="text-base flex items-center text-primary">
                <Users className="h-4 w-4 mr-2" /> Cultural Norms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {tipsMutation.data.culture.map((tip, i) => (
                  <li key={i} className="text-sm flex items-start">
                    <span className="text-primary font-bold mr-2">-</span> {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-accent">
            <CardHeader className="py-4">
              <CardTitle className="text-base flex items-center text-accent">
                <Info className="h-4 w-4 mr-2" /> Practical Advice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {tipsMutation.data.practical.map((tip, i) => (
                  <li key={i} className="text-sm flex items-start">
                    <span className="text-accent font-bold mr-2">-</span> {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
