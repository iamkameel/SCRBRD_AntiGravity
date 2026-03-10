"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface UmpireRating {
  matchId: string;
  date: string;
  rating: number; // 1-5
  feedback?: string;
  submittedBy: string;
}

interface UmpireRatingCardProps {
  umpireName: string;
  ratings: UmpireRating[];
  onSubmitRating?: (rating: number, feedback: string) => void;
  canRate?: boolean;
}

export function UmpireRatingCard({ 
  umpireName, 
  ratings, 
  onSubmitRating,
  canRate = false 
}: UmpireRatingCardProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratings.filter(r => r.rating === star).length,
    percentage: ratings.length > 0 
      ? (ratings.filter(r => r.rating === star).length / ratings.length) * 100 
      : 0,
  }));

  const handleSubmit = async () => {
    if (selectedRating === 0 || !onSubmitRating) return;
    setIsSubmitting(true);
    await onSubmitRating(selectedRating, feedback);
    setIsSubmitting(false);
    setSelectedRating(0);
    setFeedback("");
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Umpire Rating
          </span>
          <Badge variant="secondary" className="text-lg font-bold">
            {averageRating.toFixed(1)} / 5
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Average Rating Display */}
        <div className="flex items-center justify-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-8 w-8 transition-colors",
                star <= Math.round(averageRating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              )}
            />
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Based on {ratings.length} rating{ratings.length !== 1 ? "s" : ""}
        </p>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-8">{star} ★</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>

        {/* Submit Rating (if allowed) */}
        {canRate && (
          <div className="pt-4 border-t space-y-3">
            <p className="text-sm font-medium">Rate this umpire</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setSelectedRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors cursor-pointer",
                      star <= (hoveredStar || selectedRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>
            {selectedRating > 0 && (
              <>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Optional feedback..."
                  className="w-full p-2 text-sm border rounded-md bg-background resize-none"
                  rows={2}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                  size="sm"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Submit Rating
                </Button>
              </>
            )}
          </div>
        )}

        {/* Recent Feedback */}
        {ratings.filter(r => r.feedback).length > 0 && (
          <div className="pt-4 border-t space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Recent Feedback
            </p>
            {ratings
              .filter(r => r.feedback)
              .slice(0, 3)
              .map((rating, i) => (
                <div key={i} className="p-2 bg-muted/50 rounded text-sm">
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-3 w-3",
                          star <= rating.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground">{rating.feedback}</p>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
