"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

type Rule = {
  id: string;
  title: string;
  category: string;
  content: string;
};

const RULES: Rule[] = [
  {
    id: "1",
    title: "The Players",
    category: "General",
    content: "A match is played between two sides, each of eleven players, one of whom shall be captain. By agreement a match may be played between sides of fewer than, or more than, eleven players, but not more than eleven players may field at any time."
  },
  {
    id: "2",
    title: "The Umpires",
    category: "Officials",
    content: "Before the match, two umpires shall be appointed, one for each end, to control the match as required by the Laws, with absolute impartiality. The umpires shall be the sole judges of fair and unfair play."
  },
  {
    id: "3",
    title: "The Scorers",
    category: "Officials",
    content: "Two scorers shall be appointed to record all runs scored, all wickets taken and, where appropriate, number of overs bowled. The umpires shall signal to the scorers whatever has occurred. The scorers shall acknowledge all signals."
  },
  {
    id: "4",
    title: "The Ball",
    category: "Equipment",
    content: "The ball, when new, shall weigh not less than 5.5 ounces/155.9 g, nor more than 5.75 ounces/163 g, and shall measure not less than 8.81 in/22.4 cm, nor more than 9 in/22.9 cm in circumference."
  },
  {
    id: "5",
    title: "The Bat",
    category: "Equipment",
    content: "The bat consists of two parts, a handle and a blade. The overall length of the bat, when the lower portion of the handle is inserted, shall not be more than 38 in/96.52 cm."
  },
  {
    id: "6",
    title: "The Pitch",
    category: "Field",
    content: "The pitch is a rectangular area of the ground 22 yards/20.12 m in length and 10 ft/3.05 m in width. It is bounded at either end by the bowling creases and on either side by imaginary lines, one each side of the imaginary line joining the centres of the two middle stumps."
  },
  {
    id: "7",
    title: "The Wicket",
    category: "Field",
    content: "Two sets of wickets shall be pitched opposite and parallel to each other in the centres of the bowling creases. Each set shall be 22 yards/20.12 m apart and shall consist of three wooden stumps with two wooden bails on top."
  },
  {
    id: "8",
    title: "Bowling",
    category: "Play",
    content: "The ball is bowled from each end alternately in overs of 6 balls. A bowler shall finish an over in progress unless incapacitated or suspended under any of the Laws."
  },
  {
    id: "9",
    title: "The Over",
    category: "Play",
    content: "An over has started when the bowler starts his/her run-up or, if there is no run-up, starts his/her bowling action for the first delivery of that over."
  },
  {
    id: "10",
    title: "Scoring Runs",
    category: "Scoring",
    content: "A run is scored so often as the batsmen, at any time while the ball is in play, have crossed and made good their ground from end to end. The runs shall be credited to the striker if the ball is struck by the bat."
  },
  {
    id: "11",
    title: "Boundaries",
    category: "Scoring",
    content: "Before the toss, the umpires shall agree the boundary of the field of play with both captains. The boundary shall if possible be marked along its whole length. A boundary 4 is scored when the ball touches the boundary. A boundary 6 is scored when the ball is hit over the boundary without touching the ground."
  },
  {
    id: "12",
    title: "Leg Before Wicket (LBW)",
    category: "Dismissals",
    content: "The striker is out LBW if the ball, delivered lawfully, not pitching in the leg side, strikes the person and, but for that impact, would have hit the wicket."
  },
  {
    id: "13",
    title: "Bowled",
    category: "Dismissals",
    content: "The striker is out Bowled if his/her wicket is put down by a ball delivered by the bowler, not being a No ball, even if it first touches the striker's bat or person."
  },
  {
    id: "14",
    title: "Caught",
    category: "Dismissals",
    content: "The striker is out Caught if a ball delivered by the bowler, not being a No ball, touches his/her bat without having previously been in contact with any fielder, and is subsequently held by a fielder as a fair catch."
  },
  {
    id: "15",
    title: "Wide Ball",
    category: "Extras",
    content: "If the bowler bowls a ball, not being a No ball, the umpire shall adjudge it a Wide if, according to the definition in the Laws, the ball passes wide of the striker where he/she is standing and which would also have passed wide of the striker standing in a normal guard position."
  },
  {
    id: "16",
    title: "No Ball",
    category: "Extras",
    content: "The umpire shall call and signal No ball if a ball delivered by the bowler is unlawful. A No ball is not a Wide ball. One run is awarded to the batting side."
  }
];

export default function RulebookPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  const filteredRules = RULES.filter(rule => 
    rule.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    rule.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRule = (id: string) => {
    if (expandedRule === id) {
      setExpandedRule(null);
    } else {
      setExpandedRule(id);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-4">
          <BookOpen className="h-10 w-10 text-primary" />
          Digital Rule Book
        </h1>
        <p className="text-lg text-muted-foreground">
          The Laws of Cricket, simplified and searchable.
        </p>
      </div>

      <div className="mb-8 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search for a rule (e.g., 'LBW', 'Wide', 'Pitch')..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRules.length > 0 ? (
          filteredRules.map((rule) => (
            <div key={rule.id} onClick={() => toggleRule(rule.id)} className="cursor-pointer">
              <Card className="p-0 overflow-hidden hover:bg-accent/50 transition-colors">
                <div className={`p-6 flex justify-between items-center ${expandedRule === rule.id ? 'bg-accent/50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <Badge variant="default">{rule.category}</Badge>
                    <h3 className="text-lg font-semibold m-0">{rule.title}</h3>
                  </div>
                  {expandedRule === rule.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
                {expandedRule === rule.id && (
                  <div className="px-6 pb-6 pt-0 text-muted-foreground leading-relaxed">
                    {rule.content}
                  </div>
                )}
              </Card>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            No rules found matching &quot;{searchTerm}&quot;.
          </div>
        )}
      </div>
    </div>
  );
}
