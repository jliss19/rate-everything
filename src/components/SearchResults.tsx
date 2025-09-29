import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/RatingStars";
import { Eye, Users } from "lucide-react";

export interface WikiItem {
  title: string;
  description: string;
  thumbnail?: string;
  extract: string;
  pageid: number;
  rating?: number;
  totalRatings?: number;
}

interface SearchResultsProps {
  results: WikiItem[];
  onItemSelect: (item: WikiItem) => void;
}

export const SearchResults = ({ results, onItemSelect }: SearchResultsProps) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No results found. Try searching for something else!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {results.map((item) => (
        <Card 
          key={item.pageid}
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-card border-border"
          onClick={() => onItemSelect(item)}
        >
          <CardContent className="p-4">
            {item.thumbnail && (
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-32 object-cover rounded-md mb-3"
              />
            )}
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-card-foreground">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
              {item.extract}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RatingStars rating={item.rating || 0} readonly size="sm" />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {item.totalRatings && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {item.totalRatings}
                  </div>
                )}
                <Eye className="h-3 w-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};