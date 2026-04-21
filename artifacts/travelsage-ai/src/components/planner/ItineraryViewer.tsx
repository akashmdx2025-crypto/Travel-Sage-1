import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGenerateItinerary } from '@workspace/api-client-react';
import { Loader2, Calendar, MapPin, Coffee, Moon, Sun } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ItineraryViewerProps {
  documentId: string;
}

export function ItineraryViewer({ documentId }: ItineraryViewerProps) {
  const [days, setDays] = useState('3');
  const [style, setStyle] = useState('balanced');
  
  const itineraryMutation = useGenerateItinerary();
  
  const handleGenerate = () => {
    itineraryMutation.mutate({
      data: {
        documentId,
        days: parseInt(days, 10),
        style,
        interests: ['culture', 'food']
      }
    });
  };

  return (
    <div className="space-y-4">
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5 flex-1 min-w-[150px]">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</label>
            <Select value={days} onValueChange={setDays} disabled={itineraryMutation.isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="2">2 Days</SelectItem>
                <SelectItem value="3">3 Days</SelectItem>
                <SelectItem value="5">5 Days</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1.5 flex-1 min-w-[150px]">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pace</label>
            <Select value={style} onValueChange={setStyle} disabled={itineraryMutation.isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select pace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relaxed">Relaxed</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="packed">Action-Packed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleGenerate} 
            disabled={itineraryMutation.isPending}
            className="w-full sm:w-auto"
          >
            {itineraryMutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Calendar className="mr-2 h-4 w-4" /> Generate Itinerary</>
            )}
          </Button>
        </CardContent>
      </Card>

      {itineraryMutation.data && (
        <div className="space-y-6 mt-6 animate-in fade-in slide-in-from-bottom-4">
          {itineraryMutation.data.days.map((day) => (
            <Card key={day.day} className="overflow-hidden border-l-4 border-l-primary">
              <div className="bg-primary/5 px-4 py-2 border-b flex justify-between items-center">
                <h3 className="font-serif font-medium text-lg text-primary flex items-center">
                  <span className="bg-primary text-primary-foreground text-xs rounded px-2 py-1 mr-3 font-sans">
                    Day {day.day}
                  </span>
                  {day.title}
                </h3>
                <Badge variant="outline" className="bg-background text-xs">
                  {day.estimatedCost}
                </Badge>
              </div>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                  <div className="p-4 space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase flex items-center">
                      <Sun className="h-3 w-3 mr-1.5" /> Morning
                    </h4>
                    <ul className="space-y-1.5">
                      {day.morning.map((item, i) => (
                        <li key={i} className="text-sm flex items-start">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-accent shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="p-4 space-y-2 bg-muted/10">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase flex items-center">
                      <Coffee className="h-3 w-3 mr-1.5" /> Afternoon
                    </h4>
                    <ul className="space-y-1.5">
                      {day.afternoon.map((item, i) => (
                        <li key={i} className="text-sm flex items-start">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-accent shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="p-4 space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase flex items-center">
                      <Moon className="h-3 w-3 mr-1.5" /> Evening
                    </h4>
                    <ul className="space-y-1.5">
                      {day.evening.map((item, i) => (
                        <li key={i} className="text-sm flex items-start">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 mt-0.5 text-accent shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
