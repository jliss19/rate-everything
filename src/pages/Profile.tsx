import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/Footer";
import { 
  User, 
  Star, 
  MessageCircle, 
  Clock,
  ArrowLeft,
  ThumbsUp,
  LogOut
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { convertFirebaseUser } from "@/lib/user";
import { 
  Rating, 
  ForumPost, 
  ForumComment,
  getUserRatings, 
  getUserForumPosts, 
  getUserForumComments,
  getItemByPageId,
  DatabaseItem
} from "@/lib/database";
import { formatRelativeTime } from "@/lib/utils";
import { RatingStars } from "@/components/RatingStars";
import { toast } from "sonner";

interface RatingWithItem extends Rating {
  item?: DatabaseItem;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [ratings, setRatings] = useState<RatingWithItem[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = user ? convertFirebaseUser(user) : null;

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user || !currentUser) {
        navigate("/");
        return;
      }

      setIsLoading(true);
      try {
        // Load all user data in parallel
        const [userRatings, userPosts, userComments] = await Promise.all([
          getUserRatings(currentUser.id),
          getUserForumPosts(currentUser.id),
          getUserForumComments(currentUser.id)
        ]);

        setRatings(userRatings);
        setPosts(userPosts);
        setComments(userComments);

        // Load item details for ratings
        const ratingsWithItems = await Promise.all(
          userRatings.map(async (rating) => {
            try {
              const pageid = parseInt(rating.itemId, 10);
              if (!isNaN(pageid)) {
                const item = await getItemByPageId(pageid);
                return { ...rating, item };
              }
              return rating;
            } catch (error) {
              console.error("Error loading item for rating:", error);
              return rating;
            }
          })
        );
        
        setRatings(ratingsWithItems);
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user, currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Failed to logout");
    }
  };

  if (!user || !currentUser) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border bg-card sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap hover:opacity-80 transition-opacity">
                RateEverything
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap hover:opacity-80 transition-opacity">
              RateEverything
            </Link>
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="ml-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <Card className="bg-card border-border mb-6 relative">
            <CardContent className="p-6">
              <div className="absolute top-6 right-6">
                <Button variant="outline" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:border-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={currentUser.photoURL} />
                  <AvatarFallback className="text-2xl">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{currentUser.name}</h1>
                  {currentUser.email && (
                    <p className="text-muted-foreground mb-4">{currentUser.email}</p>
                  )}
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">Average Rating</div>
                        <div className="text-xl font-bold">{averageRating.toFixed(1)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">Total Ratings</div>
                        <div className="text-xl font-bold">{totalRatings}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">Forum Posts</div>
                        <div className="text-xl font-bold">{posts.length}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">Comments</div>
                        <div className="text-xl font-bold">{comments.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <div className="space-y-6">
            {/* My Ratings */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  My Ratings ({ratings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ratings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>You haven't rated any items yet.</p>
                    <Link to="/">
                      <Button variant="outline" className="mt-4">
                        Start Rating
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ratings.map((rating) => (
                      <div key={rating.id} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            {rating.item ? (
                              <Link
                                to={`/item/${rating.item.pageid}`}
                                className="text-lg font-semibold hover:text-primary transition-colors"
                              >
                                {rating.item.title}
                              </Link>
                            ) : (
                              <div className="text-lg font-semibold">Item #{rating.itemId}</div>
                            )}
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatRelativeTime(rating.timestamp)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <RatingStars rating={rating.rating} readonly size="sm" />
                            <span className="text-sm font-medium">{rating.rating}/5</span>
                          </div>
                        </div>
                        {rating.review && (
                          <p className="text-foreground mt-2 whitespace-pre-wrap">{rating.review}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Forum Posts */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  My Forum Posts ({posts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {posts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>You haven't created any forum posts yet.</p>
                    <Link to="/forum">
                      <Button variant="outline" className="mt-4">
                        Create a Post
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="border-b border-border pb-3 last:border-b-0 last:pb-0 hover:bg-muted/50 rounded p-3 transition-colors"
                      >
                        <Link
                          to={`/forum/${post.id}`}
                          className="block"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold hover:text-primary transition-colors mb-1">
                                {post.title}
                              </h3>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatRelativeTime(post.timestamp)}
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="h-3 w-3" />
                                  {post.likes || 0} likes
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  {post.replyCount || 0} comments
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* My Comments */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  My Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>You haven't commented on any forum posts yet.</p>
                    <Link to="/forum">
                      <Button variant="outline" className="mt-4">
                        Browse Forum
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <Link
                              to={`/forum/${comment.postId}`}
                              className="text-sm font-medium hover:text-primary transition-colors"
                            >
                              View Post →
                            </Link>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatRelativeTime(comment.timestamp)}
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                {comment.likes || 0} likes
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;

