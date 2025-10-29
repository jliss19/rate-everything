import {  ForumPost, getAllForumsForTag } from "@/lib/database";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { MessageCircle, ThumbsUp, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const DisplayForums = () => {
  const [post, setPost] = useState([]);
  useEffect(() => {
    async function fetchData() {
      const data = await getAllForumsForTag("");
      setPost(data);
    }
    fetchData();
  }, []);

  function arrayLen(post: ForumPost): number {
    if (post.replies) { return post.replies.length; } else { return 0 }
  }

  return (
    <div className="grid gap-3">        
      {post.map((post) => (
        <Card
          key={post.id}
          className="bg-card border-border hover:border-primary transition-colors cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-medium">{post.userName}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">{post.updatedAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{arrayLen(post)}</span>
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
  );
};
