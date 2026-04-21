import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, BookOpen, ShieldCheck, Map } from 'lucide-react';
import { Header } from '@/components/layout/Header';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <Badge variant="outline" className="mb-4 text-accent border-accent/30 bg-accent/5 py-1 px-3">
                University Generative AI Hackathon Project
              </Badge>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-primary leading-tight tracking-tight">
                Distill the World. <br />
                <span className="text-foreground">Leave the Hallucinations Behind.</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                TravelSage AI is a destination research cockpit. Upload a guidebook, paste blog posts, or provide raw notes—we ground our AI entirely on your sources to give you trustworthy itineraries, budgets, and tips.
              </p>
              
              <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/planner">
                  <Button size="lg" className="h-14 px-8 text-base font-semibold shadow-lg hover-elevate">
                    <Compass className="mr-2 h-5 w-5" /> Open Workspace
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-card border-t">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-serif font-bold text-primary">A Cockpit for Curious Travelers</h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Built for those who want deep research without the unreliability of standard chatbots.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="space-y-4 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Source-Grounded</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Upload PDF guidebooks or paste notes. Every answer and itinerary is derived strictly from your provided materials.
                </p>
              </div>
              
              <div className="space-y-4 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-6">
                  <Map className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Complete Planning</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Generate day-by-day itineraries, climate-aware packing lists, cost breakdowns, and cultural tips with one click.
                </p>
              </div>
              
              <div className="space-y-4 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-6">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Transparent AI</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Review the exact chunks cited for every answer. Check the transparency logs for latency, token usage, and guardrail alerts.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-8 border-t bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>TravelSage AI — Hackathon Edition.</p>
        </div>
      </footer>
    </div>
  );
}
