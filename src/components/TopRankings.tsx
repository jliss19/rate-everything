import { Card, CardContent } from "@/components/ui/card";
import { RatingStars } from "@/components/RatingStars";
import { TrendingUp } from "lucide-react";

interface RankingItem {
  id: number;
  name: string;
  category: string;
  rating: number;
  votes: number;
}

const mockRankings: RankingItem[] = [
  { id: 1, name: "The Shawshank Redemption", category: "Movies", rating: 4.9, votes: 2456 },
  { id: 2, name: "Pizza Margherita", category: "Food", rating: 4.8, votes: 3421 },
  { id: 3, name: "Python", category: "Programming", rating: 4.7, votes: 5632 },
  { id: 4, name: "Golden Retriever", category: "Dog Breeds", rating: 4.9, votes: 4123 },
  { id: 5, name: "The Legend of Zelda", category: "Video Games", rating: 4.8, votes: 6234 },
];

export const TopRankings = () => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Top Rankings</h2>
      </div>
      
      <div className="grid gap-3">
        {mockRankings.map((item, index) => (
          <Card key={item.id} className="bg-card border-border hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-primary w-8">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                <div className="text-right">
                  <RatingStars rating={item.rating} />
                  <p className="text-xs text-muted-foreground mt-1">{item.votes} votes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
