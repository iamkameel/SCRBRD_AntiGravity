"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Bell, Search, Star, MoreVertical, Send, Users, ShieldAlert } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const MOCK_MESSAGES = [
  { id: 1, sender: "Director of Sport", subject: "U15A Fixture Update", preview: "Please note the U15A fixture has been moved to field 4...", date: "10:42 AM", unread: true, threadType: "direct" },
  { id: 2, sender: "Head Coach - 1st XI", subject: "Match Strategy Reminder", preview: "Guys, let's focus on strike rotation in the middle overs.", date: "Yesterday", unread: false, threadType: "direct" },
  { id: 3, sender: "S. Peterson (Physio)", subject: "Injury Report - M. James", preview: "M. James has suffered a grade 1 hamstring tear. Recommended 2 week rest.", date: "Mon, 12th", unread: true, threadType: "medical" },
];

const MOCK_NEWSFEED = [
  { id: 1, source: "Platform Logic", title: "Kearsney College Match Completed", details: "Westville Boys' High School won by 42 runs.", type: "match_result", timestamp: "2 hours ago" },
  { id: 2, source: "Fixture Engine", title: "Weather Warning", details: "Predicted thunderstorms Saturday. Consider alternate arrangements.", type: "weather", timestamp: "5 hours ago" },
  { id: 3, source: "Transport Hub", title: "Bus 4 Departure Delayed", details: "Departure time for away fixture shifted to 08:30.", type: "logistics", timestamp: "1 day ago" },
];

export function InboxViewClient() {
  const [activeMessage, setActiveMessage] = useState(MOCK_MESSAGES[0]);

  return (
    <div className="container mx-auto py-8 max-w-7xl h-[calc(100vh-theme(spacing.24))] flex flex-col pt-4">
      <div className="flex flex-col mb-6">
        <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4 text-foreground">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary/20 flex flex-col items-center justify-center">
            <MessageSquare className="h-6 w-6 text-primary shadow-lg" />
          </div>
          Communications Hub
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">Manage priority threads, medical alerts, and platform notifications.</p>
      </div>

      <Tabs defaultValue="inbox" className="w-full flex-1 flex flex-col h-full min-h-0">
        <TabsList className="bg-transparent h-auto p-0 flex gap-6 border-b border-border/50 pb-4 mb-6">
          <TabsTrigger value="inbox" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-2 text-lg font-bold data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground shadow-none">
            Threaded Inbox
          </TabsTrigger>
          <TabsTrigger value="newsfeed" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-2 text-lg font-bold data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground shadow-none">
            Automated Newsfeed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-0 outline-none flex-1 flex min-h-0 rounded-2xl border border-border/50 bg-card/40 overflow-hidden shadow-sm">
          {/* Inbox Sidebar */}
          <div className="w-80 border-r border-border/50 flex flex-col bg-muted/10 shrink-0">
            <div className="p-4 border-b border-border/50">
               <div className="relative">
                 <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input placeholder="Search messages..." className="pl-9 bg-background font-medium" />
               </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {MOCK_MESSAGES.map((msg) => (
                <div 
                  key={msg.id}
                  onClick={() => setActiveMessage(msg)}
                  className={`p-4 border-b border-border/50 cursor-pointer transition-colors relative ${activeMessage.id === msg.id ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                >
                  {activeMessage.id === msg.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  
                  <div className="flex justify-between items-baseline mb-1">
                    <span className={`font-bold text-sm ${msg.unread ? 'text-foreground' : 'text-foreground/80'}`}>{msg.sender}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{msg.date}</span>
                  </div>
                  
                  <div className={`text-sm mb-1 ${msg.unread ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                    {msg.subject}
                  </div>
                  
                  <div className="text-xs text-muted-foreground truncate font-medium">
                    {msg.preview}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inbox Main View */}
          <div className="flex-1 flex flex-col min-h-0 bg-background">
            {/* Message Header */}
            <div className="p-6 border-b border-border/50 flex justify-between items-start bg-muted/5">
               <div>
                  <h2 className="text-2xl font-black tracking-tight mb-2">{activeMessage.subject}</h2>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">{activeMessage.sender}</span>
                    <span className="text-muted-foreground text-xs font-semibold">to Me, U15A Squad</span>
                  </div>
               </div>
               <div className="flex gap-2 text-muted-foreground">
                 <Button variant="ghost" size="icon"><Star className="h-4 w-4" /></Button>
                 <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
               </div>
            </div>
            
            {/* Message Body */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar text-sm leading-relaxed whitespace-pre-line font-medium text-foreground/90">
               <p>Hi Team,</p>
               <br />
               <p>{activeMessage.preview}</p>
               <br />
               <p>Please make sure any adjustments are logged in the squad sheet prior to 14:00 today. Any ongoing niggles or issues should be updated in the medical log as soon as possible.</p>
               <br />
               <p>Thanks.</p>
            </div>

            {/* Message Reply Box */}
            <div className="p-6 border-t border-border/50 bg-muted/5">
              <Textarea 
                placeholder="Reply to thread..." 
                className="mb-4 min-h-[100px] bg-background resize-none font-medium"
              />
              <div className="flex justify-between items-center">
                 <Button variant="outline" size="sm" className="font-bold uppercase tracking-widest text-[10px]">Attach Intel</Button>
                 <Button size="sm" className="font-bold uppercase tracking-widest text-[10px] px-6">
                   <Send className="mr-2 h-3 w-3" /> Send
                 </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="newsfeed" className="mt-0 outline-none flex-1 overflow-y-auto custom-scrollbar">
           <div className="max-w-3xl mx-auto space-y-6 pt-4">
              {MOCK_NEWSFEED.map(feed => (
                <Card key={feed.id} className="border border-border/50 bg-card/40 hover:bg-card/80 transition-colors shadow-sm">
                  <CardHeader className="pb-3 border-b border-border/30 bg-muted/20">
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-2">
                         {feed.type === 'match_result' && <Badge variant="default" className="bg-primary/20 text-primary border-primary/30 uppercase text-[9px] font-black">Match Completed</Badge>}
                         {feed.type === 'weather' && <Badge variant="destructive" className="uppercase text-[9px] font-black">System Alert</Badge>}
                         {feed.type === 'logistics' && <Badge variant="secondary" className="uppercase text-[9px] font-black">Transport Hub</Badge>}
                         <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{feed.source}</span>
                       </div>
                       <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{feed.timestamp}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <h3 className="font-bold text-lg leading-tight mb-2">{feed.title}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{feed.details}</p>
                    
                    {feed.type === 'match_result' && (
                      <Button variant="outline" size="sm" className="mt-4 font-bold uppercase tracking-widest text-[9px]">
                        View Full Scorecard
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
           </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
