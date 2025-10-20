import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, ThumbsUp, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ForumPost {
  id: number;
  title: string;
  category: string;
  author: string;
  replies: number;
  likes: number;
  timestamp: string;
  isHot: boolean;
}

const mockForumPosts: ForumPost[] = [
  {
    id: 1,
    title: "What's the most overrated movie of all time?",
    category: "Movies",
    author: "CinemaDebate",
    replies: 234,
    likes: 156,
    timestamp: "1 hour ago",
    isHot: true,
  },
  {
    id: 2,
    title: "Best pizza toppings combination - let's settle this!",
    category: "Food",
    author: "PizzaLover",
    replies: 189,
    likes: 203,
    timestamp: "3 hours ago",
    isHot: true,
  },
  {
    id: 3,
    title: "Python vs JavaScript for beginners in 2025",
    category: "Programming",
    author: "CodeGuru",
    replies: 142,
    likes: 98,
    timestamp: "5 hours ago",
    isHot: false,
  },
  {
    id: 4,
    title: "Underrated travel destinations you MUST visit",
    category: "Travel",
    author: "Wanderlust",
    replies: 87,
    likes: 124,
    timestamp: "8 hours ago",
    isHot: false,
  },
  {
    id: 5,
    title: "Are modern video games better than classics?",
    category: "Gaming",
    author: "RetroGamer",
    replies: 312,
    likes: 245,
    timestamp: "12 hours ago",
    isHot: true,
  },
];

export const ForumsList = () => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Active Forums</h2>
      </div>
      
      <div className="grid gap-3">
        {mockForumPosts.map((post) => (
          <Card key={post.id} className="bg-card border-border hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    {post.isHot && (
                      <Badge variant="destructive" className="text-xs">Hot</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-medium">{post.author}</span>
                    <span className="text-xs">{post.category}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">{post.timestamp}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.replies}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{post.likes}</span>
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
