import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingStars } from "@/components/RatingStars";
import { MessageSquare, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Review {
  id: number;
  itemName: string;
  category: string;
  rating: number;
  comment: string;
  author: string;
  timestamp: string;
  isNew: boolean;
}

const mockReviews: Review[] = [
  {
    id: 1,
    itemName: "Dark Knight",
    category: "Movies",
    rating: 5,
    comment: "Absolutely masterful performance by Heath Ledger. A cinematic triumph!",
    author: "MovieBuff42",
    timestamp: "2 hours ago",
    isNew: true,
  },
  {
    id: 2,
    itemName: "Margherita Pizza",
    category: "Food",
    rating: 4.5,
    comment: "Simple yet perfect. The basil really makes it shine.",
    author: "FoodCritic",
    timestamp: "5 hours ago",
    isNew: true,
  },
  {
    id: 3,
    itemName: "React",
    category: "Programming",
    rating: 4,
    comment: "Great for building UIs but the learning curve is steep.",
    author: "DevMaster",
    timestamp: "1 day ago",
    isNew: false,
  },
  {
    id: 4,
    itemName: "Golden Gate Bridge",
    category: "Landmarks",
    rating: 5,
    comment: "Breathtaking views! A must-see in San Francisco.",
    author: "Traveler99",
    timestamp: "1 day ago",
    isNew: false,
  },
];

export const ReviewsList = () => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Recent Reviews</h2>
      </div>
      
      <div className="grid gap-4">
        {mockReviews.map((review) => (
          <Card key={review.id} className="bg-card border-border hover:border-primary transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{review.itemName}</CardTitle>
                    {review.isNew && (
                      <Badge variant="default" className="text-xs">New</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{review.category}</p>
                </div>
                <RatingStars rating={review.rating} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-3">{review.comment}</p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="font-medium">{review.author}</span>
                <span>{review.timestamp}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
