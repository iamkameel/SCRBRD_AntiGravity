"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { HelpCircle, ChevronDown, ChevronUp, Mail, Video, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How do I add a new match?",
    a: "Navigate to the Matches page and click the 'New Match' button. Fill in the match details including teams, venue, and date. You can then start scoring in real-time or enter results after the match."
  },
  {
    q: "Can I export match data?",
    a: "Yes! Go to Data Management and use the 'Export Data' button to download all your data as JSON. You can import this data later if needed."
  },
  {
    q: "How do I manage team rosters?",
    a: "Visit the Teams page, select a team, and use the roster management interface to add or remove players. You can assign player numbers and roles."
  },
  {
    q: "What roles are available in the system?",
    a: "SCRBRD supports multiple roles including Administrator, Coach, Scorer, Player, Parent, and more. Each role has specific permissions. Visit the Roles page to see the complete list."
  },
  {
    q: "How does the AI Scouting Assistant work?",
    a: "The scouting assistant analyzes player statistics and generates comprehensive reports. It can compare players side-by-side and provide insights on strengths, weaknesses, and potential."
  }
];

export default function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-4">
          <HelpCircle size={36} className="text-primary" />
          Help & Support
        </h1>
        <p className="text-lg text-muted-foreground">Find answers to common questions and get assistance.</p>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        <Card className="text-center p-6">
          <Activity size={24} className="text-emerald-500 mx-auto mb-2" />
          <div className="text-sm text-muted-foreground">System Status</div>
          <div className="text-xl font-bold text-emerald-500">Operational</div>
        </Card>
        <Card className="text-center p-6">
          <Activity size={24} className="text-emerald-500 mx-auto mb-2" />
          <div className="text-sm text-muted-foreground">API Status</div>
          <div className="text-xl font-bold text-emerald-500">Online</div>
        </Card>
        <Card className="text-center p-6">
          <Activity size={24} className="text-emerald-500 mx-auto mb-2" />
          <div className="text-sm text-muted-foreground">Uptime</div>
          <div className="text-xl font-bold text-emerald-500">99.9%</div>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="mb-12 p-6">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <HelpCircle size={24} className="text-primary" /> Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-4">
          {FAQS.map((faq, index) => (
            <div 
              key={index}
              className="rounded-lg border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className={cn(
                  "w-full flex justify-between items-center p-5 border-none text-white cursor-pointer text-left text-base font-semibold transition-colors",
                  openFAQ === index ? "bg-white/5" : "bg-transparent hover:bg-white/5"
                )}
              >
                {faq.q}
                {openFAQ === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {openFAQ === index && (
                <div className="p-5 pt-0 text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Video Tutorials */}
      <Card className="mb-12 p-6">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Video size={24} className="text-primary" /> Video Tutorials
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {['Getting Started', 'Creating Your First Match', 'Using Analytics'].map((title, i) => (
            <div key={i} className="rounded-lg overflow-hidden border border-white/10">
              <div className="h-[140px] bg-gradient-to-br from-emerald-500/30 to-primary/30 flex items-center justify-center">
                <Video size={40} className="text-primary" />
              </div>
              <div className="p-4">
                <h3 className="m-0 text-base font-bold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">5:30</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Contact Support */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Mail size={24} className="text-primary" /> Contact Support
        </h2>
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject"
              placeholder="What do you need help with?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea 
              id="message"
              rows={5}
              placeholder="Describe your issue in detail..."
            />
          </div>
          <Button className="self-start gap-2">
            <Mail size={18} /> Send Message
          </Button>
        </div>
      </Card>
    </div>
  );
}
