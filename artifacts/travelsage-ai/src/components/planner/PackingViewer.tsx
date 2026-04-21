import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGeneratePackingList } from '@workspace/api-client-react';
import { Loader2, Briefcase, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PackingViewer({ documentId }: { documentId: string }) {
  const packingMutation = useGeneratePackingList();

  const handleGenerate = () => {
    packingMutation.mutate({ data: { documentId } });
  };

  return (
    <div className="space-y-4">
      {!packingMutation.data && (
        <Card className="bg-muted/30 border-dashed text-center p-6">
          <CardContent className="pt-6">
            <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Generate a packing list tailored to the destination's climate and planned activities.
            </p>
            <Button 
              onClick={handleGenerate} 
              disabled={packingMutation.isPending}
            >
              {packingMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                "Create Packing List"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {packingMutation.data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4">
          {packingMutation.data.categories.map((category, i) => (
            <Card key={i} className="shadow-sm">
              <CardHeader className="py-3 bg-muted/20 border-b">
                <CardTitle className="text-sm font-semibold text-primary uppercase tracking-wider flex justify-between items-center">
                  {category.category}
                  <Badge variant="secondary" className="text-[10px]">{category.items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {category.items.map((item, j) => (
                    <li key={j} className="flex items-start text-sm">
                      <CheckSquare className="h-4 w-4 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
