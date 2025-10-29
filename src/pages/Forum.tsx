import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/Footer";
import { getAllForumsForTag, createOrUpdateForumPost, getCount, ForumPost } from "@/lib/database";
import { 
  MessageCircle, 
  ThumbsUp, 
  Clock, 
  Send,
  ArrowLeft,
  Plus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { DisplayForums } from "@/components/DisplayForums";

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("");

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      setIsCreateDialogOpen(false);
      console.log("title is: ", newPostTitle, " content is: ", newPostContent)
      toast.error("Please fill in all fields");
      return;
    }
    const newPost = await createOrUpdateForumPost(
      {
        title: newPostTitle,
        post: newPostContent
      },{
        name: "currentUser",
        id: "currentUserID"
      }
    )
    console.log("Created or updated post with ID:", newPost);

  };

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedPost) {
      toast.error("Please enter a reply");
      return;
    }
    
    const newPost = await createOrUpdateForumPost(
      {
        title: newPostTitle,
        post: replyContent
      },{
        name: "currentUser",
        id: "currentUserID"
      }
    )
    console.log("Created or updated post with ID:", newPost);
    
  };
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap hover:opacity-80 transition-opacity">
              RateEverything
            </Link>
            <Link to="/forum">
              <Button variant="outline">Forum</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Community Forum</h1>
              <p className="text-muted-foreground">Join the conversation and share your opinions</p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Post
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Create a New Post</DialogTitle>
                  <DialogDescription>
                    Share your thoughts and start a discussion
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Input
                      placeholder="Post title"
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="What's on your mind?"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      rows={6}
                    />
                  </div>
                  <Button onClick={handleCreatePost} className="w-full">
                    Create Post
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            <DisplayForums />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Forum;
