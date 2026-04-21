import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGenerateBudget } from '@workspace/api-client-react';
import { Loader2, DollarSign, Wallet } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function BudgetViewer({ documentId }: { documentId: string }) {
  const budgetMutation = useGenerateBudget();

  const handleGenerate = () => {
    budgetMutation.mutate({ data: { documentId } });
  };

  return (
    <div className="space-y-4">
      {!budgetMutation.data && (
        <Card className="bg-muted/30 border-dashed text-center p-6">
          <CardContent className="pt-6">
            <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Analyze the document for cost estimates and price guidance.
            </p>
            <Button 
              onClick={handleGenerate} 
              disabled={budgetMutation.isPending}
            >
              {budgetMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating...</>
              ) : (
                "Generate Budget Estimate"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {budgetMutation.data && (
        <Card className="animate-in fade-in slide-in-from-bottom-4">
          <CardHeader className="bg-primary/5 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-serif flex items-center text-primary">
                <Wallet className="h-5 w-5 mr-2" /> Cost Breakdown
              </CardTitle>
              <div className="text-right">
                <span className="block text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Guidance</span>
                <span className="font-bold text-accent">{budgetMutation.data.totalGuidance}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Category</TableHead>
                  <TableHead className="w-[150px]">Estimate</TableHead>
                  <TableHead>Notes from Guide</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetMutation.data.items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.category}</TableCell>
                    <TableCell className="text-accent font-semibold">{item.estimate}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{item.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
