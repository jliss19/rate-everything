import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "@/components/RatingStars";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Calendar, Globe } from "lucide-react";
import { WikiItem } from "@/components/SearchResults";
import { useToast } from "@/hooks/use-toast";
import { addOrUpdateRating, getItemStats, getItemRatings, getUserRatingForItem, Rating } from "@/lib/database";
import { useAuth } from "@/lib/auth";
import { convertFirebaseUser, getAnonymousUser } from "@/lib/user";

interface ItemDetailProps {
  item: WikiItem;
  onBack: () => void;
}

export const ItemDetail = ({ item, onBack }: ItemDetailProps) => {
  const [userRating, setUserRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemStats, setItemStats] = useState({ averageRating: 0, totalRatings: 0 });
  const [recentRatings, setRecentRatings] = useState<Rating[]>([]);
  const [existingUserRating, setExistingUserRating] = useState<Rating | null>(null);
  const [isLoadingUserRating, setIsLoadingUserRating] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load item statistics, recent ratings, and user's existing rating
  useEffect(() => {
    const loadItemData = async () => {
      try {
        const stats = await getItemStats(item.pageid.toString());
        setItemStats({
          averageRating: stats.averageRating,
          totalRatings: stats.totalRatings
        });
      } catch (error) {
        console.error('Error loading item stats:', error);
      }
    };

    const loadUserRating = async () => {
      try {
        const currentUser = user ? convertFirebaseUser(user) : getAnonymousUser();
        const existingRating = await getUserRatingForItem(item.pageid.toString(), currentUser.id);
        setExistingUserRating(existingRating);
        
        // If user has an existing rating, populate the form
        if (existingRating) {
          setUserRating(existingRating.rating);
          setReview(existingRating.review || "");
        }
      } catch (error) {
        console.error('Error loading user rating:', error);
      } finally {
        setIsLoadingUserRating(false);
      }
    };

    const unsubscribe = getItemRatings(item.pageid.toString(), (ratings) => {
      setRecentRatings(ratings.slice(0, 5)); // Show last 5 ratings
    });

    loadItemData();
    loadUserRating();

    return () => {
      unsubscribe();
    };
  }, [item.pageid, user]);

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
    
    try {
      // Get current user - either Firebase user or anonymous fallback
      const currentUser = user ? convertFirebaseUser(user) : getAnonymousUser();
      console.log('🚀 Submitting rating for item:', item.title);
      console.log('👤 User:', currentUser);
      console.log('⭐ Rating:', userRating);
      console.log('📝 Review:', review);
      
      const result = await addOrUpdateRating({
        itemId: item.pageid.toString(),
        rating: userRating,
        review: review.trim() || undefined,
        userId: currentUser.id,
      }, {
        pageid: item.pageid,
        title: item.title,
        description: item.description,
        extract: item.extract,
        thumbnail: item.thumbnail,
      }, {
        name: currentUser.name,
        email: currentUser.email
      });
      
      console.log('✅ Rating submitted successfully! ID:', result.ratingId);
      
      // Update the existing rating state
      setExistingUserRating({
        id: result.ratingId,
        itemId: item.pageid.toString(),
        rating: userRating,
        review: review.trim() || undefined,
        userId: currentUser.id,
        timestamp: Date.now(),
        userName: currentUser.name,
        userEmail: currentUser.email
      });
      
      toast({
        title: result.isUpdate ? "Rating updated!" : "Rating submitted!",
        description: `You ${result.isUpdate ? 'updated' : 'rated'} "${item.title}" ${userRating} star${userRating === 1 ? '' : 's'}.`,
      });
      
      // Don't clear the form if updating - keep the values
      if (!result.isUpdate) {
        setUserRating(0);
        setReview("");
      }
    } catch (error: unknown) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
                    <RatingStars rating={itemStats.averageRating} readonly />
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {itemStats.totalRatings} ratings
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
              <h3 className="text-xl font-semibold text-card-foreground">
                {existingUserRating ? "Update Your Rating" : "Rate This Item"}
              </h3>
              {existingUserRating && (
                <p className="text-sm text-muted-foreground">
                  You previously rated this item {existingUserRating.rating} star{existingUserRating.rating === 1 ? '' : 's'}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingUserRating ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading your rating...
                </div>
              ) : (
                <>
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
                      maxLength={1000}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {review.length}/1000 characters
                    </div>
                  </div>

                  <Button 
                    onClick={handleSubmitRating}
                    disabled={isSubmitting || userRating === 0}
                    className="w-full"
                  >
                    {isSubmitting 
                      ? (existingUserRating ? "Updating..." : "Submitting...") 
                      : (existingUserRating ? "Update Rating" : "Submit Rating")
                    }
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <h3 className="text-lg font-semibold text-card-foreground">Recent Reviews</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                {recentRatings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No reviews yet.</p>
                    <p>Be the first to review this item!</p>
                  </div>
                ) : (
                  recentRatings.map((rating) => (
                    <div key={rating.id} className="border-b border-border pb-3 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <RatingStars rating={rating.rating} readonly size="sm" />
                        <span className="text-sm font-medium text-card-foreground">
                          {rating.userName || 'Anonymous User'}
                        </span>
                      </div>
                      {rating.review && (
                        <p className="text-muted-foreground text-sm">{rating.review}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};