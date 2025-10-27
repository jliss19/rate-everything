import { RatingStars } from "@/components/RatingStars";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getTopRatedItems } from "@/lib/database";


export const DisplayTopRated = () => {
  
  const [item, setItem] = useState([]);
  useEffect(() => {
    async function fetchData() {
      const data = await getTopRatedItems();
      console.log("Top rated items fetched:", data);
      setItem(data);
    }
    fetchData();
  }, []);


  return (
    <div className="grid gap-3">
      {item.map((item) => (
        <Card key={item.id} className="bg-card border-border hover:border-primary transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-primary w-8">
                <p>1</p>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <div className="text-right">
                <RatingStars rating={item.stats.averageRating} />
                <p className="text-xs text-muted-foreground mt-1">{item.stats.totalRatings} votes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}