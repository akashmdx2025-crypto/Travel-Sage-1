import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useGetAiLogs } from '@workspace/api-client-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Server, Activity, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LogsViewer() {
  const { data, isLoading, refetch, isRefetching } = useGetAiLogs();

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-4 border-b bg-muted/10">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-serif flex items-center text-primary">
              <Server className="h-5 w-5 mr-2" /> AI Transparency Logs
            </CardTitle>
            <CardDescription>Review model latency, token usage, and hallucination guardrails.</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isLoading || isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} /> 
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
            <Activity className="h-8 w-8 animate-pulse mb-2 text-primary/50" />
            Loading logs...
          </div>
        ) : !data || data.logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No AI actions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead>Tokens (P/C)</TableHead>
                  <TableHead>Guardrail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.logs.map((log) => (
                  <TableRow key={log.id} className="text-xs">
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="font-medium">{log.endpoint}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-mono">{log.model}</Badge>
                    </TableCell>
                    <TableCell>{log.latencyMs}ms</TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.promptTokens} / {log.completionTokens}
                    </TableCell>
                    <TableCell>
                      {log.guardrailPassed ? (
                        <span className="flex items-center text-primary">
                          <ShieldCheck className="h-3 w-3 mr-1" /> Pass
                        </span>
                      ) : (
                        <span className="flex items-center text-destructive">
                          <ShieldAlert className="h-3 w-3 mr-1" /> Flagged
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
