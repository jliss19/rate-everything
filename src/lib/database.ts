import { 
    ref, 
    push, 
    set, 
    get, 
    onValue, 
    off, 
    query, 
    orderByChild, 
    equalTo,
    update,
    remove
  } from 'firebase/database';
  import { database } from './firebase';
  
export interface Rating {
  id?: string;
  itemId: string;
  rating: number;
  review?: string;
  userId: string;
  timestamp: number;
  userName?: string; // Store user name for display
  userEmail?: string; // Store user email for identification
}

export interface DatabaseItem {
  id: string;
  pageid: number;
  title: string;
  description: string;
  extract: string;
  thumbnail?: string; // Optional - may not be present for all items
  createdAt: number;
  updatedAt: number;
}

export interface ItemStats {
  averageRating: number;
  totalRatings: number;
  ratings: { [key: string]: Rating };
}

// Utility function to remove undefined values from objects (Firebase doesn't allow undefined)
const removeUndefinedValues = (obj: any): any => {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};
  
  // Create or update an item in the database
  export const createOrUpdateItem = async (item: {
    pageid: number;
    title: string;
    description: string;
    extract: string;
    thumbnail?: string;
  }): Promise<string> => {
    console.log('📦 Creating/updating item:', item.title);
    const itemsRef = ref(database, 'items');
    const itemQuery = query(itemsRef, orderByChild('pageid'), equalTo(item.pageid));
    const snapshot = await get(itemQuery);
    
    if (snapshot.exists()) {
      // Item exists, update it
      console.log('🔄 Item exists, updating...');
      const existingItem = Object.values(snapshot.val())[0] as DatabaseItem;
      const itemRef = ref(database, `items/${existingItem.id}`);
      const updatedItem: DatabaseItem = {
        ...existingItem,
        title: item.title,
        description: item.description,
        extract: item.extract,
        thumbnail: item.thumbnail,
        updatedAt: Date.now()
      };
      await set(itemRef, removeUndefinedValues(updatedItem));
      console.log('✅ Item updated successfully!');
      return existingItem.id;
    } else {
      // Create new item
      console.log('🆕 Creating new item...');
      const newItemRef = push(itemsRef);
      const newItem: DatabaseItem = {
        id: newItemRef.key!,
        pageid: item.pageid,
        title: item.title,
        description: item.description,
        extract: item.extract,
        thumbnail: item.thumbnail,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await set(newItemRef, removeUndefinedValues(newItem));
      console.log('✅ New item created successfully! ID:', newItemRef.key);
      return newItemRef.key!;
    }
  };

  // Get an item by pageid
  export const getItemByPageId = async (pageid: number): Promise<DatabaseItem | null> => {
    const itemsRef = ref(database, 'items');
    const itemQuery = query(itemsRef, orderByChild('pageid'), equalTo(pageid));
    const snapshot = await get(itemQuery);
    
    if (snapshot.exists()) {
      const items = snapshot.val();
      return Object.values(items)[0] as DatabaseItem;
    }
    return null;
  };

  // Validate rating data
  const validateRating = (rating: Omit<Rating, 'id' | 'timestamp'>): void => {
    if (!rating.itemId || typeof rating.itemId !== 'string') {
      throw new Error('Item ID is required and must be a string');
    }
    if (!rating.userId || typeof rating.userId !== 'string') {
      throw new Error('User ID is required and must be a string');
    }
    if (!rating.rating || typeof rating.rating !== 'number' || rating.rating < 1 || rating.rating > 5) {
      throw new Error('Rating must be a number between 1 and 5');
    }
    if (rating.review && typeof rating.review !== 'string') {
      throw new Error('Review must be a string if provided');
    }
    if (rating.review && rating.review.length > 1000) {
      throw new Error('Review must be 1000 characters or less');
    }
  };

  // Check if user has already rated this item
  export const getUserRatingForItem = async (itemId: string, userId: string): Promise<Rating | null> => {
    const ratingsRef = ref(database, 'ratings');
    const userRatingsQuery = query(
      ratingsRef, 
      orderByChild('itemId'), 
      equalTo(itemId)
    );
    
    const snapshot = await get(userRatingsQuery);
    if (snapshot.exists()) {
      const ratings = snapshot.val();
      for (const ratingId in ratings) {
        if (ratings[ratingId].userId === userId) {
          return { ...ratings[ratingId], id: ratingId };
        }
      }
    }
    return null;
  };

  // Add a new rating (now creates/updates item first)
  export const addRating = async (
    rating: Omit<Rating, 'id' | 'timestamp'>, 
    item: {
      pageid: number;
      title: string;
      description: string;
      extract: string;
      thumbnail?: string;
    },
    userInfo?: {
      name?: string;
      email?: string;
    }
  ): Promise<string> => {
    try {
      // Validate rating data
      validateRating(rating);
      
      // Check if user has already rated this item
      const existingRating = await getUserRatingForItem(rating.itemId, rating.userId);
      if (existingRating) {
        throw new Error('You have already rated this item. Use updateRating to modify your rating.');
      }
      
      // First, ensure the item exists in the database
      const itemId = await createOrUpdateItem(item);
      
      // Then add the rating
      const ratingsRef = ref(database, 'ratings');
      const newRatingRef = push(ratingsRef);
      
      const ratingData: any = {
        itemId: rating.itemId,
        rating: rating.rating,
        userId: rating.userId,
        id: newRatingRef.key!,
        timestamp: Date.now(),
        userName: userInfo?.name,
        userEmail: userInfo?.email
      };
      
      // Only include review if it's not undefined
      if (rating.review !== undefined) {
        ratingData.review = rating.review;
      }
      
      await set(newRatingRef, removeUndefinedValues(ratingData));
      console.log('✅ Rating added successfully:', newRatingRef.key);
      return newRatingRef.key!;
    } catch (error) {
      console.error('❌ Error adding rating:', error);
      throw error;
    }
  };
  
  // Get all ratings for a specific item
  export const getItemRatings = (itemId: string, callback: (ratings: Rating[]) => void) => {
    const ratingsRef = ref(database, 'ratings');
    const itemRatingsQuery = query(ratingsRef, orderByChild('itemId'), equalTo(itemId));
    
    const unsubscribe = onValue(itemRatingsQuery, (snapshot) => {
      const ratings: Rating[] = [];
      snapshot.forEach((childSnapshot) => {
        ratings.push(childSnapshot.val());
      });
      callback(ratings);
    });
    
    return unsubscribe;
  };
  
  // Get item statistics (average rating, total count)
  export const getItemStats = async (itemId: string): Promise<ItemStats> => {
    const ratingsRef = ref(database, 'ratings');
    const itemRatingsQuery = query(ratingsRef, orderByChild('itemId'), equalTo(itemId));
    
    const snapshot = await get(itemRatingsQuery);
    const ratings: Rating[] = [];
    
    snapshot.forEach((childSnapshot) => {
      ratings.push(childSnapshot.val());
    });
    
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
      : 0;
    
    return {
      averageRating,
      totalRatings,
      ratings: ratings.reduce((acc, rating) => {
        acc[rating.id!] = rating;
        return acc;
      }, {} as { [key: string]: Rating })
    };
  };
  
  // Update a rating
  export const updateRating = async (
    ratingId: string, 
    updates: Partial<Omit<Rating, 'id' | 'userId' | 'itemId'>>,
    userId: string
  ): Promise<void> => {
    try {
      // First, verify the rating exists and belongs to the user
      const ratingRef = ref(database, `ratings/${ratingId}`);
      const snapshot = await get(ratingRef);
      
      if (!snapshot.exists()) {
        throw new Error('Rating not found');
      }
      
      const existingRating = snapshot.val() as Rating;
      if (existingRating.userId !== userId) {
        throw new Error('You can only update your own ratings');
      }
      
      // Validate rating if it's being updated
      if (updates.rating !== undefined) {
        if (typeof updates.rating !== 'number' || updates.rating < 1 || updates.rating > 5) {
          throw new Error('Rating must be a number between 1 and 5');
        }
      }
      
      // Validate review if it's being updated
      if (updates.review !== undefined) {
        if (updates.review && typeof updates.review !== 'string') {
          throw new Error('Review must be a string if provided');
        }
        if (updates.review && updates.review.length > 1000) {
          throw new Error('Review must be 1000 characters or less');
        }
      }
      
      // Add timestamp for the update
      const updateData = {
        ...updates,
        timestamp: Date.now()
      };
      
      await update(ratingRef, removeUndefinedValues(updateData));
      console.log('✅ Rating updated successfully:', ratingId);
    } catch (error) {
      console.error('❌ Error updating rating:', error);
      throw error;
    }
  };
  
  // Delete a rating
  export const deleteRating = async (ratingId: string, userId: string): Promise<void> => {
    try {
      // First, verify the rating exists and belongs to the user
      const ratingRef = ref(database, `ratings/${ratingId}`);
      const snapshot = await get(ratingRef);
      
      if (!snapshot.exists()) {
        throw new Error('Rating not found');
      }
      
      const existingRating = snapshot.val() as Rating;
      if (existingRating.userId !== userId) {
        throw new Error('You can only delete your own ratings');
      }
      
      await remove(ratingRef);
      console.log('✅ Rating deleted successfully:', ratingId);
    } catch (error) {
      console.error('❌ Error deleting rating:', error);
      throw error;
    }
  };
  
  // Get recent ratings (for homepage)
  export const getRecentRatings = (limit: number = 10, callback: (ratings: Rating[]) => void) => {
    const ratingsRef = ref(database, 'ratings');
    const recentQuery = query(ratingsRef, orderByChild('timestamp'));
    
    const unsubscribe = onValue(recentQuery, (snapshot) => {
      const ratings: Rating[] = [];
      snapshot.forEach((childSnapshot) => {
        ratings.push(childSnapshot.val());
      });
      
      // Sort by timestamp descending and limit
      const sortedRatings = ratings
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
      
      callback(sortedRatings);
    });
    
    return unsubscribe;
  };

  // Get all items from database
  export const getAllItems = async (): Promise<DatabaseItem[]> => {
    const itemsRef = ref(database, 'items');
    const snapshot = await get(itemsRef);
    
    if (snapshot.exists()) {
      return Object.values(snapshot.val()) as DatabaseItem[];
    }
    return [];
  };

  // Get items with their statistics
  export const getItemsWithStats = async (): Promise<(DatabaseItem & { stats: ItemStats })[]> => {
    const items = await getAllItems();
    const itemsWithStats = await Promise.all(
      items.map(async (item) => {
        const stats = await getItemStats(item.id);
        return { ...item, stats };
      })
    );
    return itemsWithStats;
  };

  // Get all ratings by a specific user
  export const getUserRatings = async (userId: string): Promise<Rating[]> => {
    const ratingsRef = ref(database, 'ratings');
    const userRatingsQuery = query(ratingsRef, orderByChild('userId'), equalTo(userId));
    
    const snapshot = await get(userRatingsQuery);
    const ratings: Rating[] = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        ratings.push({ ...childSnapshot.val(), id: childSnapshot.key });
      });
    }
    
    return ratings.sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
  };

  // Get top-rated items (items with highest average ratings)
  export const getTopRatedItems = async (limit: number = 10): Promise<(DatabaseItem & { stats: ItemStats })[]> => {
    const itemsWithStats = await getItemsWithStats();
    
    // Filter items with at least 1 rating and sort by average rating
    const topRatedItems = itemsWithStats
      .filter(item => item.stats.totalRatings > 0)
      .sort((a, b) => b.stats.averageRating - a.stats.averageRating)
      .slice(0, limit);
    
    return topRatedItems;
  };

  // Get most-reviewed items (items with most ratings)
  export const getMostReviewedItems = async (limit: number = 10): Promise<(DatabaseItem & { stats: ItemStats })[]> => {
    const itemsWithStats = await getItemsWithStats();
    
    // Sort by total ratings count
    const mostReviewedItems = itemsWithStats
      .filter(item => item.stats.totalRatings > 0)
      .sort((a, b) => b.stats.totalRatings - a.stats.totalRatings)
      .slice(0, limit);
    
    return mostReviewedItems;
  };

  // Add or update rating (convenience function that handles both cases)
  export const addOrUpdateRating = async (
    rating: Omit<Rating, 'id' | 'timestamp'>,
    item: {
      pageid: number;
      title: string;
      description: string;
      extract: string;
      thumbnail?: string;
    },
    userInfo?: {
      name?: string;
      email?: string;
    }
  ): Promise<{ ratingId: string; isUpdate: boolean }> => {
    try {
      // Check if user has already rated this item
      const existingRating = await getUserRatingForItem(rating.itemId, rating.userId);
      
      if (existingRating) {
        // Update existing rating
        const updateData: Partial<Omit<Rating, 'id' | 'userId' | 'itemId'>> = {
          rating: rating.rating,
          userName: userInfo?.name,
          userEmail: userInfo?.email
        };
        
        // Only include review if it's not undefined
        if (rating.review !== undefined) {
          updateData.review = rating.review;
        }
        
        await updateRating(existingRating.id!, updateData, rating.userId);
        
        return { ratingId: existingRating.id!, isUpdate: true };
      } else {
        // Add new rating
        const ratingId = await addRating(rating, item, userInfo);
        return { ratingId, isUpdate: false };
      }
    } catch (error) {
      console.error('❌ Error adding or updating rating:', error);
      throw error;
    }
  };

  // ========== FORUM POSTS ==========
  
  export interface ForumPost {
    id?: string;
    title: string;
    content: string;
    category: string;
    authorId: string;
    authorName: string;
    timestamp: number;
    likes: number;
    likedBy?: { [userId: string]: boolean };
    replyCount?: number;
  }

  export interface ForumComment {
    id?: string;
    postId: string;
    content: string;
    authorId: string;
    authorName: string;
    timestamp: number;
    likes: number;
    likedBy?: { [userId: string]: boolean };
  }

  // Create a new forum post
  export const createForumPost = async (
    post: Omit<ForumPost, 'id' | 'timestamp' | 'likes' | 'replyCount'>
  ): Promise<string> => {
    try {
      if (!post.title.trim() || !post.content.trim() || !post.category.trim()) {
        throw new Error('Title, content, and category are required');
      }

      const postsRef = ref(database, 'forumPosts');
      const newPostRef = push(postsRef);
      
      const postData: ForumPost = {
        ...post,
        id: newPostRef.key!,
        timestamp: Date.now(),
        likes: 0,
        replyCount: 0,
        likedBy: {}
      };
      
      await set(newPostRef, removeUndefinedValues(postData));
      console.log('✅ Forum post created successfully:', newPostRef.key);
      return newPostRef.key!;
    } catch (error) {
      console.error('❌ Error creating forum post:', error);
      throw error;
    }
  };

  // Get all forum posts
  export const getForumPosts = (callback: (posts: ForumPost[]) => void) => {
    const postsRef = ref(database, 'forumPosts');
    const postsQuery = query(postsRef, orderByChild('timestamp'));
    
    const unsubscribe = onValue(postsQuery, (snapshot) => {
      const posts: ForumPost[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          posts.push({ ...childSnapshot.val(), id: childSnapshot.key });
        });
      }
      // Sort by timestamp descending (newest first)
      const sortedPosts = posts.sort((a, b) => b.timestamp - a.timestamp);
      callback(sortedPosts);
    });
    
    return unsubscribe;
  };

  // Get a single forum post by ID
  export const getForumPostById = async (postId: string): Promise<ForumPost | null> => {
    try {
      const postRef = ref(database, `forumPosts/${postId}`);
      const snapshot = await get(postRef);
      
      if (snapshot.exists()) {
        return { ...snapshot.val(), id: postId };
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting forum post:', error);
      throw error;
    }
  };

  // Like/unlike a forum post
  export const togglePostLike = async (postId: string, userId: string): Promise<boolean> => {
    try {
      const postRef = ref(database, `forumPosts/${postId}`);
      const snapshot = await get(postRef);
      
      if (!snapshot.exists()) {
        throw new Error('Post not found');
      }
      
      const post = snapshot.val() as ForumPost;
      const likedBy = post.likedBy || {};
      const isLiked = likedBy[userId] === true;
      
      if (isLiked) {
        // Unlike
        delete likedBy[userId];
        await update(postRef, {
          likes: Math.max(0, (post.likes || 0) - 1),
          likedBy
        });
        return false;
      } else {
        // Like
        likedBy[userId] = true;
        await update(postRef, {
          likes: (post.likes || 0) + 1,
          likedBy
        });
        return true;
      }
    } catch (error) {
      console.error('❌ Error toggling post like:', error);
      throw error;
    }
  };

  // ========== FORUM COMMENTS ==========

  // Create a new forum comment
  export const createForumComment = async (
    comment: Omit<ForumComment, 'id' | 'timestamp' | 'likes'>
  ): Promise<string> => {
    try {
      if (!comment.content.trim()) {
        throw new Error('Comment content is required');
      }

      // Verify post exists
      const postRef = ref(database, `forumPosts/${comment.postId}`);
      const postSnapshot = await get(postRef);
      
      if (!postSnapshot.exists()) {
        throw new Error('Post not found');
      }

      const commentsRef = ref(database, 'forumComments');
      const newCommentRef = push(commentsRef);
      
      const commentData: ForumComment = {
        ...comment,
        id: newCommentRef.key!,
        timestamp: Date.now(),
        likes: 0,
        likedBy: {}
      };
      
      await set(newCommentRef, removeUndefinedValues(commentData));
      
      // Update post reply count
      const post = postSnapshot.val() as ForumPost;
      await update(postRef, {
        replyCount: (post.replyCount || 0) + 1
      });
      
      console.log('✅ Forum comment created successfully:', newCommentRef.key);
      return newCommentRef.key!;
    } catch (error) {
      console.error('❌ Error creating forum comment:', error);
      throw error;
    }
  };

  // Get all comments for a forum post
  export const getForumComments = (postId: string, callback: (comments: ForumComment[]) => void) => {
    const commentsRef = ref(database, 'forumComments');
    const commentsQuery = query(commentsRef, orderByChild('postId'), equalTo(postId));
    
    const unsubscribe = onValue(commentsQuery, (snapshot) => {
      const comments: ForumComment[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          comments.push({ ...childSnapshot.val(), id: childSnapshot.key });
        });
      }
      // Sort by timestamp ascending (oldest first)
      const sortedComments = comments.sort((a, b) => a.timestamp - b.timestamp);
      callback(sortedComments);
    });
    
    return unsubscribe;
  };

  // Like/unlike a forum comment
  export const toggleCommentLike = async (commentId: string, userId: string): Promise<boolean> => {
    try {
      const commentRef = ref(database, `forumComments/${commentId}`);
      const snapshot = await get(commentRef);
      
      if (!snapshot.exists()) {
        throw new Error('Comment not found');
      }
      
      const comment = snapshot.val() as ForumComment;
      const likedBy = comment.likedBy || {};
      const isLiked = likedBy[userId] === true;
      
      if (isLiked) {
        // Unlike
        delete likedBy[userId];
        await update(commentRef, {
          likes: Math.max(0, (comment.likes || 0) - 1),
          likedBy
        });
        return false;
      } else {
        // Like
        likedBy[userId] = true;
        await update(commentRef, {
          likes: (comment.likes || 0) + 1,
          likedBy
        });
        return true;
      }
    } catch (error) {
      console.error('❌ Error toggling comment like:', error);
      throw error;
    }
  };

  // Get all forum posts by a specific user
  export const getUserForumPosts = async (userId: string): Promise<ForumPost[]> => {
    try {
      const postsRef = ref(database, 'forumPosts');
      const userPostsQuery = query(postsRef, orderByChild('authorId'), equalTo(userId));
      
      const snapshot = await get(userPostsQuery);
      const posts: ForumPost[] = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          posts.push({ ...childSnapshot.val(), id: childSnapshot.key });
        });
      }
      
      return posts.sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
    } catch (error) {
      console.error('❌ Error getting user forum posts:', error);
      throw error;
    }
  };

  // Get all forum comments by a specific user
  export const getUserForumComments = async (userId: string): Promise<ForumComment[]> => {
    try {
      const commentsRef = ref(database, 'forumComments');
      const userCommentsQuery = query(commentsRef, orderByChild('authorId'), equalTo(userId));
      
      const snapshot = await get(userCommentsQuery);
      const comments: ForumComment[] = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          comments.push({ ...childSnapshot.val(), id: childSnapshot.key });
        });
      }
      
      return comments.sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first
    } catch (error) {
      console.error('❌ Error getting user forum comments:', error);
      throw error;
    }
  };