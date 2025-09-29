import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "@/components/RatingStars";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Calendar, Globe } from "lucide-react";
import { WikiItem } from "@/components/SearchResults";
import { useToast } from "@/hooks/use-toast";

interface ItemDetailProps {
  item: WikiItem;
  onBack: () => void;
}

export const ItemDetail = ({ item, onBack }: ItemDetailProps) => {
  const [userRating, setUserRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmitRating = async () => {
    if (userRating === 0) {
      toast({
        title: "Please select a rating",
        description: "Choose between 1 and 5 stars to rate this item.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Rating submitted!",
      description: `You rated "${item.title}" ${userRating} star${userRating === 1 ? '' : 's'}.`,
    });
    
    setIsSubmitting(false);
    setUserRating(0);
    setReview("");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to results
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-start gap-4">
                {item.thumbnail && (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2 text-card-foreground">{item.title}</h1>
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  <div className="flex items-center gap-4">
                    <RatingStars rating={item.rating || 0} readonly />
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {item.totalRatings || 0} ratings
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <p className="text-card-foreground leading-relaxed">{item.extract}</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Globe className="h-3 w-3 mr-1" />
                  Wikipedia
                </Badge>
                <Badge variant="outline">
                  ID: {item.pageid}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <h3 className="text-xl font-semibold text-card-foreground">Rate This Item</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-card-foreground mb-2 block">
                  Your Rating
                </label>
                <RatingStars 
                  rating={userRating} 
                  onRatingChange={setUserRating}
                  size="lg"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-card-foreground mb-2 block">
                  Review (Optional)
                </label>
                <Textarea
                  placeholder="Share your thoughts about this item..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="bg-background border-border"
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSubmitRating}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Submitting..." : "Submit Rating"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <h3 className="text-lg font-semibold text-card-foreground">Recent Reviews</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="text-center py-8 text-muted-foreground">
                  <p>No reviews yet.</p>
                  <p>Be the first to review this item!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};