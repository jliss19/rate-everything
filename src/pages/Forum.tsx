import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/Footer";
import { getAllForumsForTag, createOrUpdateForumPost } from "@/lib/database";
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

interface Reply {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
}

interface ForumPost {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string;
  replies: Reply[];
  likes: number;
  timestamp: string;
  isHot: boolean;
}

const mockPosts: ForumPost[] = [
  {
    id: 1,
    title: "What's the most overrated movie of all time?",
    content: "I think Avatar is incredibly overrated. Sure, the visuals were groundbreaking, but the story was just Pocahontas in space. Change my mind!",
    category: "Movies",
    author: "CinemaDebate",
    replies: [
      {
        id: 1,
        author: "FilmBuff99",
        content: "I completely disagree! Avatar revolutionized 3D cinema and created an immersive experience unlike anything before it.",
        timestamp: "45 minutes ago",
        likes: 12
      },
      {
        id: 2,
        author: "MovieCritic",
        content: "The story might be familiar, but the world-building and technical achievement make it worthy of its success.",
        timestamp: "30 minutes ago",
        likes: 8
      }
    ],
    likes: 156,
    timestamp: "1 hour ago",
    isHot: true,
  },
  {
    id: 2,
    title: "Best pizza toppings combination - let's settle this!",
    content: "I'm convinced that pineapple and jalapeño is the ultimate pizza combo. Sweet, spicy, and absolutely delicious. Prove me wrong!",
    category: "Food",
    author: "PizzaLover",
    replies: [
      {
        id: 1,
        author: "ItalianChef",
        content: "As an Italian, I'm offended by pineapple on pizza, but I respect your courage to share this opinion 😄",
        timestamp: "2 hours ago",
        likes: 34
      }
    ],
    likes: 203,
    timestamp: "3 hours ago",
    isHot: true,
  },
  {
    id: 3,
    title: "Python vs JavaScript for beginners in 2025",
    content: "With all the new frameworks and tools, which language should absolute beginners start with? I'm mentoring new developers and need advice.",
    category: "Programming",
    author: "CodeGuru",
    replies: [],
    likes: 98,
    timestamp: "5 hours ago",
    isHot: false,
  },
];

const Forum = () => {
  const [posts, setPosts] = useState<ForumPost[]>(mockPosts);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("");

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !newPostCategory.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const newPost: ForumPost = {
      id: posts.length + 1,
      title: newPostTitle,
      content: newPostContent,
      category: newPostCategory,
      author: "CurrentUser",
      replies: [],
      likes: 0,
      timestamp: "Just now",
      isHot: false,
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostCategory("");
    setIsCreateDialogOpen(false);
    toast.success("Post created successfully!");
  };

  const handleReply = () => {
    if (!replyContent.trim() || !selectedPost) {
      toast.error("Please enter a reply");
      return;
    }

    const newReply: Reply = {
      id: selectedPost.replies.length + 1,
      author: "CurrentUser",
      content: replyContent,
      timestamp: "Just now",
      likes: 0,
    };

    const updatedPosts = posts.map((post) =>
      post.id === selectedPost.id
        ? { ...post, replies: [...post.replies, newReply] }
        : post
    );

    setPosts(updatedPosts);
    setSelectedPost({ ...selectedPost, replies: [...selectedPost.replies, newReply] });
    setReplyContent("");
    toast.success("Reply posted!");
  };

  if (selectedPost) {
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
          <div className="max-w-3xl mx-auto px-4 py-8">
            <Button
              variant="ghost"
              onClick={() => setSelectedPost(null)}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Forum
            </Button>

            <Card className="bg-card border-border mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{selectedPost.title}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-medium">u/{selectedPost.author}</span>
                      <span>•</span>
                      <Badge variant="secondary">{selectedPost.category}</Badge>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{selectedPost.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  {selectedPost.isHot && (
                    <Badge variant="destructive">Hot</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{selectedPost.content}</p>
                <Separator className="my-4" />
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {selectedPost.likes} Upvotes
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {selectedPost.replies.length} Comments
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border mb-6">
              <CardHeader>
                <CardTitle className="text-base">Comment as u/CurrentUser</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="What are your thoughts?"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="mb-4"
                  rows={4}
                />
                <Button onClick={handleReply}>
                  <Send className="mr-2 h-4 w-4" />
                  Comment
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {selectedPost.replies.map((reply) => (
                <Card key={reply.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <span className="text-xs font-medium">{reply.likes}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <span className="font-medium">u/{reply.author}</span>
                          <span>•</span>
                          <span>{reply.timestamp}</span>
                        </div>
                        <p className="text-foreground">{reply.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

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
                    <Input
                      placeholder="Category (e.g., Movies, Food, Tech)"
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value)}
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
            {posts.map((post) => (
              <Card
                key={post.id}
                className="bg-card border-border hover:border-primary transition-colors cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                      <span>•</span>
                      <span>Posted by u/{post.author}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.timestamp}</span>
                      </div>
                      {post.isHot && (
                        <>
                          <span>•</span>
                          <Badge variant="destructive" className="text-xs">Hot</Badge>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 hover:text-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium min-w-[2rem] text-center">{post.likes}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 hover:text-destructive"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ThumbsUp className="h-4 w-4 rotate-180" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.content}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 hover:bg-muted rounded px-2 py-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.replies.length} Comments</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Forum;
