import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/Footer";
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
import { 
  ForumPost, 
  ForumComment,
  getForumPosts, 
  createForumPost,
  getForumPostById,
  getForumComments,
  createForumComment,
  togglePostLike,
  toggleCommentLike
} from "@/lib/database";
import { useAuth } from "@/lib/auth";
import { convertFirebaseUser, getAnonymousUser } from "@/lib/user";
import { formatRelativeTime } from "@/lib/utils";
import { AuthModal } from "@/components/AuthModal";

const Forum = () => {
  const { postId } = useParams<{ postId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const currentUser = user ? convertFirebaseUser(user) : getAnonymousUser();

  // Load all posts
  useEffect(() => {
    const unsubscribe = getForumPosts((loadedPosts) => {
      setPosts(loadedPosts);
    });

    return () => unsubscribe();
  }, []);

  // Load selected post and its comments
  useEffect(() => {
    if (postId) {
      const loadPost = async () => {
        try {
          const post = await getForumPostById(postId);
          if (post) {
            setSelectedPost(post);
          } else {
            toast.error("Post not found");
            navigate("/forum");
          }
        } catch (error) {
          console.error("Error loading post:", error);
          toast.error("Failed to load post");
          navigate("/forum");
        }
      };

      loadPost();
    } else {
      setSelectedPost(null);
      setComments([]);
    }
  }, [postId, navigate]);

  // Load comments for selected post
  useEffect(() => {
    if (selectedPost?.id) {
      const unsubscribe = getForumComments(selectedPost.id, (loadedComments) => {
        setComments(loadedComments);
      });

      return () => unsubscribe();
    }
  }, [selectedPost?.id]);

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !newPostCategory.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (currentUser.isAnonymous) {
      toast.error("Please sign in to create a post");
      setAuthModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await createForumPost({
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        category: newPostCategory.trim(),
        authorId: currentUser.id,
        authorName: currentUser.name,
      });

      setNewPostTitle("");
      setNewPostContent("");
      setNewPostCategory("");
      setIsCreateDialogOpen(false);
      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateComment = async () => {
    if (!commentContent.trim() || !selectedPost) {
      toast.error("Please enter a comment");
      return;
    }

    if (currentUser.isAnonymous) {
      toast.error("Please sign in to comment");
      setAuthModalOpen(true);
      return;
    }

    setIsSubmittingComment(true);
    try {
      await createForumComment({
        postId: selectedPost.id!,
        content: commentContent.trim(),
        authorId: currentUser.id,
        authorName: currentUser.name,
      });

      setCommentContent("");
      toast.success("Comment posted!");
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handlePostClick = (post: ForumPost) => {
    navigate(`/forum/${post.id}`);
  };

  const handleBack = () => {
    navigate("/forum");
  };

  const handleLikePost = async (post: ForumPost) => {
    if (currentUser.isAnonymous) {
      toast.error("Please sign in to like posts");
      setAuthModalOpen(true);
      return;
    }

    try {
      await togglePostLike(post.id!, currentUser.id);
    } catch (error) {
      console.error("Error toggling post like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleLikeComment = async (comment: ForumComment) => {
    if (currentUser.isAnonymous) {
      toast.error("Please sign in to like comments");
      setAuthModalOpen(true);
      return;
    }

    try {
      await toggleCommentLike(comment.id!, currentUser.id);
    } catch (error) {
      console.error("Error toggling comment like:", error);
      toast.error("Failed to update like");
    }
  };

  // Determine if a post is "hot" (has more than 10 likes or 5 comments)
  const isPostHot = (post: ForumPost) => {
    return (post.likes || 0) >= 10 || (post.replyCount || 0) >= 5;
  };

  // Determine if user has liked a post/comment
  const hasLiked = (item: ForumPost | ForumComment) => {
    return item.likedBy?.[currentUser.id] === true;
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
              onClick={handleBack}
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
                      <span className="font-medium">u/{selectedPost.authorName}</span>
                      <span>•</span>
                      <Badge variant="secondary">{selectedPost.category}</Badge>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeTime(selectedPost.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  {isPostHot(selectedPost) && (
                    <Badge variant="destructive">Hot</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{selectedPost.content}</p>
                <Separator className="my-4" />
                <div className="flex items-center gap-4">
                  <Button 
                    variant={hasLiked(selectedPost) ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => handleLikePost(selectedPost)}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {selectedPost.likes || 0} {selectedPost.likes === 1 ? 'Upvote' : 'Upvotes'}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {selectedPost.replyCount || 0} {selectedPost.replyCount === 1 ? 'Comment' : 'Comments'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border mb-6">
              <CardHeader>
                <CardTitle className="text-base">Comment as u/{currentUser.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="What are your thoughts?"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="mb-4"
                  rows={4}
                />
                <Button 
                  onClick={handleCreateComment}
                  disabled={isSubmittingComment || !commentContent.trim()}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmittingComment ? "Posting..." : "Comment"}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <p>No comments yet. Be the first to comment!</p>
                  </CardContent>
                </Card>
              ) : (
                comments.map((comment) => (
                  <Card key={comment.id} className="bg-card border-border">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1">
                          <Button 
                            variant={hasLiked(comment) ? "default" : "ghost"} 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => handleLikeComment(comment)}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <span className="text-xs font-medium">{comment.likes || 0}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span className="font-medium">u/{comment.authorName}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(comment.timestamp)}</span>
                          </div>
                          <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>

        <Footer />
        <AuthModal 
          open={authModalOpen} 
          onOpenChange={setAuthModalOpen} 
        />
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
                  <Button 
                    onClick={handleCreatePost} 
                    className="w-full"
                    disabled={isSubmitting || !newPostTitle.trim() || !newPostContent.trim() || !newPostCategory.trim()}
                  >
                    {isSubmitting ? "Creating..." : "Create Post"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {posts.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No posts yet</p>
                  <p>Be the first to start a discussion!</p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card
                  key={post.id}
                  className="bg-card border-border hover:border-primary transition-colors cursor-pointer"
                  onClick={() => handlePostClick(post)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                        <span>•</span>
                        <span>Posted by u/{post.authorName}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatRelativeTime(post.timestamp)}</span>
                        </div>
                        {isPostHot(post) && (
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikePost(post);
                          }}
                        >
                          <ThumbsUp className={`h-4 w-4 ${hasLiked(post) ? 'fill-current' : ''}`} />
                        </Button>
                        <span className="text-sm font-medium min-w-[2rem] text-center">{post.likes || 0}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors mb-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.content}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 hover:bg-muted rounded px-2 py-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.replyCount || 0} {post.replyCount === 1 ? 'Comment' : 'Comments'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
      />
    </div>
  );
};

export default Forum;
