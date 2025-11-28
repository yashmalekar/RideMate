import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Moon, Sun, User, LogOut, ArrowLeft, Heart, MessageCircle, MapPin, TrendingUp, Calendar, Settings, Phone, Plus, Trash2, Route, Clock, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useRides, Ride } from '@/contexts/RideContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface SOSContact {
  id: string;
  name: string;
  phone: string;
}

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

export default function Profile() {
  const { userId } = useParams();
  const { user, logout, accentColor, setAccentColor, useMetric, setUseMetric } = useAuth();
  const { rides, userRides, totalDistance, weeklyDistance, updateRide, deleteRide } = useRides();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [sosContacts, setSOSContacts] = useState<SOSContact[]>([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRide, setEditingRide] = useState<Ride | null>(null);
  const [editForm, setEditForm] = useState({
    startLocation: '',
    destination: '',
    distance: '',
    duration: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const isOwnProfile = !userId || userId === user?.id;

  const kmToMiles = (km: number) => km * 0.621371;
  const convertDistance = (km: number) => useMetric ? km : kmToMiles(km);
  const distanceUnit = useMetric ? 'km' : 'mi';
  const feed_api = import.meta.env.VITE_FEED_API;
  const sos_api = import.meta.env.VITE_SOS_API;
  const feed_url = import.meta.env.VITE_FEED_API;

  const accentColors = [
    { name: 'Orange', value: '#ff6b35' },
    { name: 'Blue', value: '#556ee6' },
    { name: 'Teal', value: '#4ecdc4' },
    { name: 'Purple', value: '#6c5ce7' },
    { name: 'Pink', value: '#ef476f' },
    { name: 'Amber', value: '#f7931e' },
  ];

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    // Load posts from localStorage
    // const storedPosts = localStorage.getItem('socialPosts');
    getSOSContact();
    const fetchPosts = async () =>{
      const storedPosts = await fetch(`${feed_api}/getPosts`,{method:"GET"}).then(res => res.json());
      if (storedPosts) {
        const allPosts: Post[] = storedPosts.map((p: any) => ({
          ...p,
          timestamp: new Date(p.timestamp)
        }));
        
        // Filter posts by user
        const filteredPosts = isOwnProfile 
          ? allPosts.filter(p => p.author.userId === user?.id)
          : allPosts.filter(p => p.author.userId === userId);
        
        
        setUserPosts(filteredPosts);
      }
    }
    fetchPosts();
  }, [userId, user?.id, isOwnProfile]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

const handleLike = async (postId: string) => {
  const targetPost = userPosts.find((p) => p.id === postId);
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
  setUserPosts((prevPosts) =>
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

      setUserPosts(prevPosts =>
    prevPosts.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, comment] }
        : post
    )
  );

  const targetPost = userPosts.find(p => p.id === postId);
  const updatedComments = [...targetPost.comments, comment];

  await fetch(`${feed_url}/updatePost`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: postId, comments: updatedComments }),
  });
    
    setCommentText('');
    setCommentingOn(null);
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      const post = userPosts.filter(p=>p.id === postId);
      setUserPosts(userPosts.filter(p => p.id !== postId));
      await fetch(`${feed_api}/deletePost`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id:postId }),
      })
      // const result = await remove({key: post[0].media?.url});
      // console.log("S3 deletion:- ", result);
      toast.success('Post deleted successfully!');
    }
  };

  const getSOSContact = async () =>{
    const data = await fetch(`${sos_api}/getsos`,{method:"GET"}).then(res => res.json());
    setSOSContacts(data);
  }

  const handleAddSOSContact = async () => {
    if (!newContact.name || !newContact.phone) {
      toast.error('Please fill in both name and phone number');
      return;
    }
    
    const contact: SOSContact = {
      id: user.id,
      name: newContact.name,
      phone: "+91"+newContact.phone,
    };
   
    await fetch(`${sos_api}/addsos`,{ method: 'POST' , headers: {'Content-Type': 'application/json'}, body: JSON.stringify(contact)});
    const updatedContacts = [...sosContacts, contact];
    setSOSContacts(updatedContacts);
    // localStorage.setItem('sos_contacts', JSON.stringify(updatedContacts));
    setNewContact({ name: '', phone: '' });
    toast.success('SOS contact added');
  };

  const handleDeleteSOSContact = async (id: string) => {
    const updatedContacts = sosContacts.filter(c => c.id !== id);
    setSOSContacts(updatedContacts);
    // localStorage.setItem('sos_contacts', JSON.stringify(updatedContacts));
    await fetch(`${sos_api}/deletesos?id=${id}`,{ method: 'DELETE', body: JSON.stringify({id})});
    toast.success('SOS contact removed');
  };

  const handleEditRide = (ride: Ride) => {
    setEditingRide(ride);
    setEditForm({
      startLocation: ride.startLocation,
      destination: ride.destination,
      distance: ride.distance.toString(),
      duration: ride.duration.toString(),
      date: new Date(ride.date).toISOString().split('T')[0],
      notes: ride.notes || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingRide) return;
    
    if (!editForm.startLocation || !editForm.destination || !editForm.distance || !editForm.duration || !editForm.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    updateRide(editingRide.id, {
      startLocation: editForm.startLocation,
      destination: editForm.destination,
      distance: parseFloat(editForm.distance),
      duration: parseFloat(editForm.duration),
      date: new Date(editForm.date).toISOString().split('T')[0],
      notes: editForm.notes,
    });

    toast.success('Ride updated successfully');
    setEditDialogOpen(false);
    setEditingRide(null);
  };

  const handleDeleteRide = (id: string) => {
    if (window.confirm('Are you sure you want to delete this ride?')) {
      deleteRide(id);
      toast.success('Ride deleted');
    }
  };

  const profileUser = isOwnProfile ? user : {
    id: userId,
    name: userPosts[0]?.author.name || 'User',
    email: '',
    avatar: userPosts[0]?.author.avatar
  };

  const userRides1 = isOwnProfile ? userRides.filter(ride => ride.userId === user?.id) : userRides.filter(ride => ride.userId === userId);
  const totalUserDistance = userRides1.reduce((sum, ride) => sum + ride.distance, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-card border-b p-3 sm:p-4">
        <div className="container max-w-4xl mx-auto flex items-center gap-4">
          {!isOwnProfile && (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl sm:text-2xl font-bold">
            {isOwnProfile ? 'Profile' : `${profileUser?.name}'s Profile`}
          </h1>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Profile Header Card with Cover */}
        <Card className="overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-32 sm:h-40 gradient-primary">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/80 via-accent/60 to-primary/80" />
          </div>
          
          {/* Profile Info */}
          <div className="relative px-4 sm:px-6 pb-6">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 sm:-mt-16">
              <div className="relative">
                {profileUser?.avatar ? (
                  <img 
                    src={profileUser.avatar} 
                    alt={profileUser.name}
                    className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover border-4 border-background shadow-lg"
                  />
                ) : (
                  <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-accent/10 flex items-center justify-center border-4 border-background shadow-lg">
                    <User className="h-12 w-12 sm:h-16 sm:w-16 text-accent" />
                  </div>
                )}

              </div>
              
              {/* Name and Edit Button */}
              <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0 sm:mb-2">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div>
                    <h2 className="text-2xl font-bold">{profileUser?.name}</h2>
                    {isOwnProfile && <p className="text-muted-foreground text-sm">{user?.email}</p>}
                  </div>
                  {/*
                  {isOwnProfile && (
                    <Link to="/edit-profile">
                      <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
                        Edit Profile
                      </Button>
                    </Link>
                  )}
                    */}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
              <Card className="p-4 text-center">
                <MessageCircle className="h-5 w-5 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-bold">{userPosts.length}</p>
                <p className="text-xs text-muted-foreground">{isOwnProfile ? 'Posts' : 'Total Posts'}</p>
              </Card>
              
              <Card className="p-4 text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-bold">
                  {isOwnProfile ? `${convertDistance(totalUserDistance).toFixed(0)}` : userPosts.reduce((acc, p) => acc + p.likes.length, 0)}
                </p>
                <p className="text-xs text-muted-foreground">{isOwnProfile ? `Distance (${distanceUnit})` : 'Total Likes'}</p>
              </Card>
              
              <Card className="p-4 text-center">
                <MapPin className="h-5 w-5 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-bold">{isOwnProfile ? userRides1.length : userPosts.length}</p>
                <p className="text-xs text-muted-foreground">{isOwnProfile ? 'Total Rides' : 'Total Posts'}</p>
              </Card>
              
              <Card className="p-4 text-center">
                <Calendar className="h-5 w-5 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-bold">{isOwnProfile ? `${convertDistance(weeklyDistance).toFixed(0)}` : userRides1.length}</p>
                <p className="text-xs text-muted-foreground">{isOwnProfile ? `Weekly (${distanceUnit})` : 'Total Rides'}</p>
              </Card>
            </div>
          </div>
        </Card>

        {/* Tabs for Posts, Rides, and Settings */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: isOwnProfile ? '1fr 1fr 1fr' : '1fr 1fr' }}>
            <TabsTrigger value="posts">
              <MessageCircle className="h-4 w-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="rides">
              <MapPin className="h-4 w-4 mr-2" />
              Rides
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            )}
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4 mt-4">
            {userPosts.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                    <MessageCircle className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold mb-1">No posts yet</p>
                    <p className="text-sm text-muted-foreground">
                      {isOwnProfile ? 'Share your riding adventures!' : 'This user hasn\'t posted anything yet'}
                    </p>
                  </div>
                  {isOwnProfile && (
                    <Button variant="accent" onClick={() => navigate('/social')}>
                      Create Post
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              userPosts.map((post) => (
                <Card key={post.id} className="p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 sm:gap-4 mb-4">
                    {post.author.avatar ? (
                      <img 
                        src={post.author.avatar} 
                        alt={post.author.name}
                        className="h-10 w-10 rounded-full ring-2 ring-accent/20"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 ring-2 ring-accent/20">
                        <User className="h-5 w-5 text-accent" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{post.author.name}</p>
                        {isOwnProfile && <Badge variant="secondary" className="text-xs">You</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.timestamp).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })} at {new Date(post.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {isOwnProfile && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePost(post.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <p className="text-foreground mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>

                  {post.media && (
                    <div className="mb-4 rounded-lg overflow-hidden border">
                      {post.media.type === 'image' ? (
                        <img 
                          src={post.media.url} 
                          alt="Post content" 
                          className="w-full max-h-96 object-cover"
                        />
                      ) : (
                        <video 
                          src={post.media.url} 
                          controls 
                          className="w-full max-h-96"
                        />
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`${post?.likes.includes(user.id) ? 'text-red-500 hover:text-red-600' : ''} active:scale-95 transition-transform`}
                    >
                      <Heart className={`h-5 w-5 mr-2 ${post?.likes.includes(user.id) ? 'fill-current' : ''}`} />
                      <span className="font-medium">{post?.likes.length}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
                      className="active:scale-95 transition-transform"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">{post.comments.length}</span>
                    </Button>
                  </div>

                  {/* Comments Section */}
                  {commentingOn === post.id && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      {/* Existing Comments */}
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <img
                            src={comment.author.avatar}
                            alt={comment.author.name}
                            className="w-8 h-8 rounded-full flex-shrink-0 cursor-pointer ring-2 ring-accent/20"
                            onClick={() => navigate(`/profile/${comment.author.userId}`)}
                          />
                          <div className="flex-1 bg-muted rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span 
                                className="font-semibold text-sm cursor-pointer hover:text-accent"
                                onClick={() => navigate(`/profile/${comment.author.userId}`)}
                              >
                                {comment.author.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.timestamp).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))}

                      {/* Add Comment */}
                      <div className="flex gap-3">
                        <img
                          src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                          alt="Your avatar"
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1 flex gap-2">
                          <Input
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                            className="flex-1"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleComment(post.id)}
                            disabled={!commentText.trim()}
                          >
                            Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </TabsContent>

          {/* Rides Tab */}
          <TabsContent value="rides" className="space-y-4 mt-4">
            {userRides1.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                    <MapPin className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold mb-1">No rides yet</p>
                    <p className="text-sm text-muted-foreground">
                      {isOwnProfile ? 'Start tracking your rides!' : 'This user hasn\'t recorded any rides yet'}
                    </p>
                  </div>
                  {isOwnProfile && (
                    <Button variant="accent" onClick={() => navigate('/my-rides')}>
                      View My Rides
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {userRides1.map((ride) => (
                  <Card key={ride.id} className="p-4 sm:p-6 hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-accent flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-semibold">{ride.startLocation}</p>
                              <p className="text-sm text-muted-foreground">to {ride.destination}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {isOwnProfile && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditRide(ride)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          )}
                          {isOwnProfile && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRide(ride.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Route className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{convertDistance(ride.distance).toFixed(1)} {distanceUnit}</p>
                            <p className="text-xs text-muted-foreground">Distance</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{Math.floor(ride.duration)}h</p>
                            <p className="text-xs text-muted-foreground">Duration</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">
                              {new Date(ride.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">Date</p>
                          </div>
                        </div>
                      </div>

                      {ride.notes && (
                        <div className="pt-4 border-t">
                          <p className="text-sm text-muted-foreground">{ride.notes}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab (only for own profile) */}
          {isOwnProfile && (
            <TabsContent value="settings" className="space-y-4 mt-4">
              {/* Profile Management Card */}
              {/* <Card className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <User className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Profile Management</h2>
                    <p className="text-sm text-muted-foreground">Update your personal information</p>
                  </div>
                </div>
                <Link to="/edit-profile">
                  <Button variant="outline" className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </Card> */}

              {/* Appearance */}
              <Card className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {darkMode ? (
                        <Moon className="h-5 w-5 text-accent" />
                      ) : (
                        <Sun className="h-5 w-5 text-accent" />
                      )}
                      <div>
                        <Label htmlFor="dark-mode" className="font-medium">
                          Dark Mode
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Toggle dark theme
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={darkMode}
                      onCheckedChange={toggleDarkMode}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="font-medium mb-2 block">Accent Color</Label>
                    <div className="grid grid-cols-6 gap-3">
                      {accentColors.map((color) => (
                        <button
                          key={color.value}
                          className={`w-10 h-10 rounded-full border-2 hover:scale-110 transition-transform ${
                            accentColor === color.value ? 'border-foreground ring-2 ring-offset-2 ring-foreground' : 'border-border'
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => {
                            setAccentColor(color.value);
                            toast.success(`Accent color changed to ${color.name}`);
                          }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Units */}
              <Card className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Units</h2>
                    <p className="text-sm text-muted-foreground">Distance measurement preference</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Distance Unit</Label>
                    <p className="text-sm text-muted-foreground">
                      Kilometers or Miles
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={useMetric ? "default" : "outline"} 
                      size="sm"
                      onClick={() => {
                        setUseMetric(true);
                        toast.success('Using Kilometers');
                      }}
                    >
                      KM
                    </Button>
                    <Button 
                      variant={!useMetric ? "default" : "outline"} 
                      size="sm"
                      onClick={() => {
                        setUseMetric(false);
                        toast.success('Using Miles');
                      }}
                    >
                      MI
                    </Button>
                  </div>
                </div>
              </Card>

              {/* SOS Contacts */}
              {/* <Card className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Phone className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">SOS Emergency Contacts</h2>
                    <p className="text-sm text-muted-foreground">Quick access emergency contacts</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Contact name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      className="border-2"
                    />
                    <Input
                      placeholder="Phone number"
                      type="tel"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      className="border-2"
                    />
                    <Button onClick={handleAddSOSContact} className="sm:w-auto">
                      <Plus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Add</span>
                    </Button>
                  </div>
                  
                  {sosContacts.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {sosContacts.map((contact) => (
                        <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">{contact.phone}</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteSOSContact(contact.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {sosContacts.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No emergency contacts added yet
                    </p>
                  )}
                </div>
              </Card> */}

              {/* Account Actions */}
              <Card className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <LogOut className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Account</h2>
                    <p className="text-sm text-muted-foreground">Manage your account</p>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
      
      {/* Edit Ride Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Ride</DialogTitle>
            <DialogDescription>
              Update your ride details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-start">Start Location</Label>
              <Input
                id="edit-start"
                value={editForm.startLocation}
                onChange={(e) => setEditForm({ ...editForm, startLocation: e.target.value })}
                placeholder="Enter start location"
                className="border-2"
              />
            </div>
            <div>
              <Label htmlFor="edit-destination">Destination</Label>
              <Input
                id="edit-destination"
                value={editForm.destination}
                onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                placeholder="Enter destination"
                className="border-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-distance">Distance ({distanceUnit})</Label>
                <Input
                  id="edit-distance"
                  type="number"
                  value={editForm.distance}
                  onChange={(e) => setEditForm({ ...editForm, distance: e.target.value })}
                  placeholder={useMetric ? "50" : "31"}
                  className="border-2"
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">Duration (hours)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={editForm.duration}
                  onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                  placeholder="90"
                  className="border-2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Add any notes about your ride..."
                className="min-h-[80px] resize-none border-2"
              />
            </div>
            <div>
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                className="border-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}