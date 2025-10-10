import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/RatingStars";
import { Eye, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { getItemStats, ItemStats } from "@/lib/database";

export interface WikiItem {
  title: string;
  description: string;
  thumbnail?: string;
  extract: string;
  pageid: number;
  rating?: number;
  totalRatings?: number;
  stats?: ItemStats;
}

interface SearchResultsProps {
  results: WikiItem[];
  onItemSelect: (item: WikiItem) => void;
}

export const SearchResults = ({ results, onItemSelect }: SearchResultsProps) => {
  const [itemStats, setItemStats] = useState<{ [key: string]: ItemStats }>({});

  // Load statistics for all items
  useEffect(() => {
    const loadStats = async () => {
      const statsPromises = results.map(async (item) => {
        try {
          const stats = await getItemStats(item.pageid.toString());
          return { pageid: item.pageid, stats };
        } catch (error) {
          console.error('Error loading stats for item:', item.pageid, error);
          return { pageid: item.pageid, stats: { averageRating: 0, totalRatings: 0, ratings: {} } };
        }
      });

      const statsResults = await Promise.all(statsPromises);
      const statsMap = statsResults.reduce((acc, { pageid, stats }) => {
        acc[pageid] = stats;
        return acc;
      }, {} as { [key: string]: ItemStats });

      setItemStats(statsMap);
    };

    if (results.length > 0) {
      loadStats();
    }
  }, [results]);

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
                <RatingStars 
                  rating={itemStats[item.pageid]?.averageRating || 0} 
                  readonly 
                  size="sm" 
                />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {itemStats[item.pageid]?.totalRatings ? (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {itemStats[item.pageid].totalRatings}
                  </div>
                ) : null}
                <Eye className="h-3 w-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};