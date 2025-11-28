import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { uploadData, getUrl, remove } from "@aws-amplify/storage";
import { getCurrentUser } from "@aws-amplify/auth";
import { useToast } from '@/hooks/use-toast';
import "@/awsConfig";
import { Heart, MessageCircle, Image, Video, Send, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    userId: string;
  };
  content: string;
  timestamp: string;
}

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    userId: string;
  };
  content: string;
  media?: {
    type: 'image' | 'video';
    url?: string;
    file?: File;
    path?: string;
  };
  likes: string[];
  comments: Comment[];
  timestamp: string;
}

export default function SocialFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video'; url?: string; file?: File } | null>(null);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const feed_url = import.meta.env.VITE_FEED_API;

  //Get Posts from dynamodb
  useEffect(() => {
    getPosts();
  }, [posts]);

  const getPosts = async () =>{
    const data = await fetch(`${feed_url}/getPosts`,{method:"GET"}).then(res => res.json());
    setPosts(data);
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedMedia({ type: 'image', url, file });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedMedia({ type: 'video', url, file });
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post.id);
    setNewPost(post.content);
    setSelectedMedia(post.media || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      const post = posts.filter(p=>p.id === postId);
      setPosts(posts.filter(p => p.id !== postId));
      await fetch(`${feed_url}/deletePost`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id:postId }),
      })
      // const result = await remove({key: post[0].media?.url});
      // console.log("S3 deletion:- ", result);
      toast({
        title: 'Post deleted successfully!',
      });
    }
  };

  const uploadMediaToS3 = async (file: File) => {
  try {
    const { userId } = await getCurrentUser();
    const fileKey = `posts/${userId}/${Date.now()}-${file.name}`;

    // Upload file
    const result = await uploadData({
      key: fileKey,
      data: file,
      options: {
        contentType: file.type,
      },
    }).result;

    // Get a public URL (or use CloudFront)
    const url = await getUrl({ key: fileKey, options:{expiresIn: 1000} });

    return url.url; // ✅ return S3 file URL
  } catch (error) {
    console.error("S3 Upload failed:", error);
    throw error;
  }
};


  const handleCreatePost = async () => {
    if (!newPost.trim() && !selectedMedia) {
      toast({
        title: 'Please add some content or media',
        variant: 'destructive',
      });
      return;
    }

    if (editingPost) {
      let mediaUrl:URL;
      if (selectedMedia?.file) {
        mediaUrl = await uploadMediaToS3(selectedMedia.file);
      }
      const mediaObj = selectedMedia?.type && mediaUrl ? { type: selectedMedia?.type, url: mediaUrl?.toString() } : undefined;
      // Update existing post
      setPosts(posts.map(p => p.id === editingPost ? {
        ...p,
        content: newPost,
        media: mediaObj || undefined,
        timestamp: new Date().toISOString(),
      } : p));

      const targetPost = posts.find(p => p.id === editingPost);

      const newPost1 = {
        id: editingPost,
        author: {
          name: user?.name || 'Anonymous',
          avatar: user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
          userId: user?.id || 'anonymous',
        },
        media: mediaObj || undefined,
        content: newPost,
        likes: targetPost?.likes || [],
        comments: targetPost?.comments || [],
        timestamp: new Date().toISOString(),
      };

      await fetch(`${feed_url}/updatePost`,{method: 'PUT',headers: {'Content-Type': 'application/json',},body: JSON.stringify({id:editingPost,...newPost1})});
      
      toast({
        title: 'Post updated successfully!',
      });
      setEditingPost(null);
    } else {
      let mediaUrl:URL;
      if (selectedMedia?.file) {
        mediaUrl = await uploadMediaToS3(selectedMedia.file);
      }
      const mediaObj = selectedMedia?.type && mediaUrl ? { type: selectedMedia?.type, url: mediaUrl?.toString() } : undefined;
      // Create new post
      const post: Post = {
        id: Date.now().toString(),
        author: {
          name: user?.name || 'Anonymous',
          avatar: user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
          userId: user?.id || 'anonymous',
        },
        content: newPost,
        media: mediaObj || undefined,
        likes: [],
        comments: [],
        timestamp: new Date().toISOString(),
      };

      setPosts([post, ...posts]);

      await fetch(`${feed_url}/createPost`,{method: 'POST',headers: {'Content-Type': 'application/json',},body: JSON.stringify(post),});
      
      toast({
        title: 'Post shared successfully!',
      });
    }

    setNewPost('');
    setSelectedMedia(null);
  };

  // const handleLike = async (postId: string, userId: string) => {
  //   const targetPost = posts.find(p => p.id === postId);
  //   setPosts(posts.map(post => 
  //     post.id === postId 
  //       ? { ...post, likes: {...post.likes, userId} }
  //       : post
  //   ));

  //   const updatedLikes = {...targetPost?.likes, userId};

  //   await fetch(`${feed_url}/updatePost`,{method: 'PUT',headers: {'Content-Type': 'application/json',},body: JSON.stringify({id:postId,likes: updatedLikes})});
  // };

  // ✅ Fix handleLike function
const handleLike = async (postId: string) => {
  const targetPost = posts.find((p) => p.id === postId);
  if (!targetPost) return;

  const userId = user?.id;
  if (!userId) return;

  // Toggle like
  let updatedLikes: string[];
  if (targetPost.likes.includes(userId)) {
    // Unlike
    updatedLikes = targetPost.likes.filter((id) => id !== userId);
  } else {
    // Like
    updatedLikes = [...targetPost.likes, userId];
  }

  // Update state immediately for responsiveness
  setPosts((prevPosts) =>
    prevPosts.map((p) =>
      p.id === postId ? { ...p, likes: updatedLikes } : p
    )
  );

  // Update in DynamoDB
  await fetch(`${feed_url}/updatePost`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: postId, likes: updatedLikes }),
  });
};


  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: user?.name || 'Anonymous',
        avatar: user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
        userId: user?.id || 'anonymous',
      },
      content: commentText,
      timestamp: new Date().toISOString(),
    };

    // setPosts(posts.map(post => {
    //   if (post.id === postId) {
    //     return { ...post, comments: [...post.comments, comment] };
    //   }
    //   return post;
    // }));

      setPosts(prevPosts =>
    prevPosts.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, comment] }
        : post
    )
  );

  const targetPost = posts.find(p => p.id === postId);
  const updatedComments = [...targetPost.comments, comment];

  await fetch(`${feed_url}/updatePost`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: postId, comments: updatedComments }),
  });
    
    setCommentText('');
    setCommentingOn(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 glass-card border-b p-3 md:p-4">
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold">Social Feed</h1>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto p-3 md:p-4 space-y-4 md:space-y-6">
        {/* Create Post Card */}
        <Card className="p-4 md:p-6 shadow-[0_10px_30px_-10px_hsl(var(--accent)/0.3)]">
          <div className="flex gap-2 md:gap-3">
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
              alt="Your avatar"
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1 space-y-3 min-w-0">
              {editingPost && (
                <div className="text-sm text-muted-foreground flex items-center justify-between">
                  <span>Editing post...</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setEditingPost(null);
                      setNewPost('');
                      setSelectedMedia(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
              <Textarea
                placeholder="Share your riding experience..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[80px] md:min-h-[100px] resize-none text-sm md:text-base"
              />
              
              {selectedMedia && (
                <div className="relative rounded-lg overflow-hidden border">
                  {selectedMedia.type === 'image' ? (
                    <img src={selectedMedia.url} alt="Upload preview" className="w-full max-h-60 md:max-h-96 object-contain bg-muted" />
                  ) : (
                    <video src={selectedMedia.url} controls className="w-full max-h-60 md:max-h-96 object-contain bg-muted" />
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 text-xs md:text-sm"
                    onClick={() => setSelectedMedia(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-1 md:gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs md:text-sm"
                  >
                    <Image className="h-4 w-4 md:h-5 md:w-5 md:mr-2" />
                    <span className="hidden md:inline">Photo</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => videoInputRef.current?.click()}
                    className="text-xs md:text-sm"
                  >
                    <Video className="h-4 w-4 md:h-5 md:w-5 md:mr-2" />
                    <span className="hidden md:inline">Video</span>
                  </Button>
                </div>
                <Button onClick={handleCreatePost} variant="accent" size="sm" className="text-xs md:text-sm">
                  <Send className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  {editingPost ? 'Update' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Posts Feed */}
        {posts.length === 0 ? (
          <Card className="p-8 md:p-12 text-center">
            <p className="text-muted-foreground text-sm md:text-base">No posts yet. Be the first to share!</p>
          </Card>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-3 md:mb-4 gap-2">
                  <div className="flex gap-2 md:gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => navigate(`/profile/${post.author.userId}`)}>
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 hover:ring-2 hover:ring-accent transition-all"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm md:text-base truncate hover:text-accent transition-colors">{post.author.name}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {new Date(post.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  {post.author.userId === user?.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                        <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditPost(post)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Post
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeletePost(post.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  )}
                </div>

                <p className="mb-3 md:mb-4 whitespace-pre-wrap break-words text-sm md:text-base">{post.content}</p>

                {post.media && (
                  <div className="mb-3 md:mb-4 rounded-lg overflow-hidden border">
                    {post.media.type === 'image' ? (
                      <img src={post.media.url} alt="Post content" className="w-full max-h-60 md:max-h-96 object-contain bg-muted" />
                    ) : (
                      <video src={post.media.url} controls className="w-full max-h-60 md:max-h-96 object-contain bg-muted" />
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 md:gap-6 pt-3 md:pt-4 border-t flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={`text-xs md:text-sm ${post?.likes.includes(user.id) ? 'text-red-500' : ''} active:scale-95 transition-transform`}
                  >
                    <Heart className={`h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2 ${post?.likes.includes(user.id) ? 'fill-current' : ''}`} />
                    {post?.likes.length}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs md:text-sm active:scale-95 transition-transform"
                    onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
                  >
                    <MessageCircle className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                    {post.comments.length}
                  </Button>
                </div>

                {/* Comments Section */}
                {commentingOn === post.id && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    {/* Existing Comments */}
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2 md:gap-3">
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0 cursor-pointer"
                          onClick={() => navigate(`/profile/${comment.author.userId}`)}
                        />
                        <div className="flex-1 bg-muted rounded-lg p-2 md:p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span 
                              className="font-semibold text-xs md:text-sm cursor-pointer hover:text-accent"
                              onClick={() => navigate(`/profile/${comment.author.userId}`)}
                            >
                              {comment.author.name}
                            </span>
                            <span className="text-[10px] md:text-xs text-muted-foreground">
                              {new Date(comment.timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs md:text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}

                    {/* Add Comment */}
                    <div className="flex gap-2 md:gap-3">
                      <img
                        src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                        alt="Your avatar"
                        className="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 flex gap-2">
                        <Textarea
                          placeholder="Write a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleComment(post.id))}
                          className="flex-1 min-h-[60px] md:min-h-[80px] resize-none text-xs md:text-sm"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleComment(post.id)}
                          disabled={!commentText.trim()}
                          className="self-end text-xs md:text-sm"
                        >
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
