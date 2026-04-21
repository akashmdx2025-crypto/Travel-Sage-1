import React from 'react';
import { Switch, Route, Link } from 'wouter';
import { Compass } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-14 flex items-center">
        <Link href="/" className="flex items-center space-x-2 mr-6 text-primary hover:opacity-80 transition-opacity">
          <Compass className="h-5 w-5" />
          <span className="font-serif font-bold text-lg tracking-tight">TravelSage AI</span>
        </Link>
        
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link href="/planner" className="transition-colors hover:text-foreground/80 text-foreground">
            Workspace
          </Link>
        </nav>
      </div>
    </header>
  );
}
