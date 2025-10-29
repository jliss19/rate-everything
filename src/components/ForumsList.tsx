import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, ThumbsUp, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ForumPost, getForumPosts } from "@/lib/database";
import { formatRelativeTime } from "@/lib/utils";

export const ForumsList = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ForumPost[]>([]);

  useEffect(() => {
    const unsubscribe = getForumPosts((loadedPosts) => {
      // Show only top 5 posts for the homepage
      setPosts(loadedPosts.slice(0, 5));
    });

    return () => unsubscribe();
  }, []);

  // Determine if a post is "hot" (has more than 10 likes or 5 comments)
  const isPostHot = (post: ForumPost) => {
    return (post.likes || 0) >= 10 || (post.replyCount || 0) >= 5;
  };

  const handlePostClick = (post: ForumPost) => {
    navigate(`/forum/${post.id}`);
  };

  if (posts.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Active Forums</h2>
        </div>
        
        <Card className="bg-card border-border">
          <CardContent className="p-6 text-center text-muted-foreground">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No forum posts yet. Be the first to start a discussion!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Active Forums</h2>
      </div>
      
      <div className="grid gap-3">
        {posts.map((post) => (
          <Card 
            key={post.id} 
            className="bg-card border-border hover:border-primary transition-colors cursor-pointer"
            onClick={() => handlePostClick(post)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    {isPostHot(post) && (
                      <Badge variant="destructive" className="text-xs">Hot</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-medium">{post.authorName}</span>
                    <span className="text-xs">{post.category}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">{formatRelativeTime(post.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.replyCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{post.likes || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
