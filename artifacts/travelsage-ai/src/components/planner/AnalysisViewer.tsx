import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Map, MapPin, Compass, Utensils, Activity, Sun } from 'lucide-react';
import type { UploadTravelGuideResult } from '@workspace/api-client-react';

interface AnalysisViewerProps {
  uploadResult: UploadTravelGuideResult;
}

export function AnalysisViewer({ uploadResult }: AnalysisViewerProps) {
  const { analysis, highlights } = uploadResult;
  const places = Array.isArray(highlights?.places) ? highlights.places : [];
  const activities = Array.isArray(highlights?.activities) ? highlights.activities : [];
  const priceRanges = Array.isArray(analysis?.priceRanges) ? analysis.priceRanges : [];
  const restaurants = Array.isArray(analysis?.restaurants) ? analysis.restaurants : [];
  const culturalNotes = Array.isArray(analysis?.culturalNotes) ? analysis.culturalNotes : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-t-4 border-t-accent shadow-md">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardDescription className="flex items-center text-accent font-semibold tracking-wider uppercase text-xs mb-1">
                <Map className="h-3 w-3 mr-1" /> Destination Confirmed
              </CardDescription>
              <CardTitle className="text-3xl font-serif text-primary">
                {analysis.destinationName}, {analysis.country}
              </CardTitle>
            </div>
            <div className="bg-muted p-3 rounded-full">
              <Compass className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed mb-6">
            {analysis.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="flex items-center font-medium text-sm text-muted-foreground uppercase tracking-wider">
                <MapPin className="h-4 w-4 mr-2 text-primary" /> Key Places
              </h4>
              <ul className="space-y-2">
                {places.slice(0, 5).map((place, i) => (
                  <li key={i} className="text-sm font-medium flex items-start">
                    <span className="text-accent mr-2">-</span> {place}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center font-medium text-sm text-muted-foreground uppercase tracking-wider">
                <Activity className="h-4 w-4 mr-2 text-primary" /> Activities
              </h4>
              <ul className="space-y-2">
                {activities.slice(0, 5).map((act, i) => (
                  <li key={i} className="text-sm font-medium flex items-start">
                    <span className="text-accent mr-2">-</span> {act}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center font-medium text-sm text-muted-foreground uppercase tracking-wider">
                <Sun className="h-4 w-4 mr-2 text-primary" /> Climate
              </h4>
              <p className="text-sm">{analysis.climate}</p>
              
              <Separator className="my-3" />
              
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-2">
                Price Ranges
              </h4>
              <div className="flex flex-wrap gap-1">
                {priceRanges.map((price, i) => (
                  <Badge key={i} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    {price}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-semibold flex items-center">
              <Utensils className="h-4 w-4 mr-2 text-accent" /> Notable Dining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {restaurants.map((rest, i) => (
                <Badge key={i} variant="outline" className="border-border">
                  {rest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-semibold flex items-center text-primary">
              Cultural Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {culturalNotes.map((note, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start">
                  <span className="mr-1 mt-0.5">•</span> {note}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
