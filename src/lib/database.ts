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
}

export interface DatabaseItem {
  id: string;
  pageid: number;
  title: string;
  description: string;
  extract: string;
  thumbnail?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ItemStats {
  averageRating: number;
  totalRatings: number;
  ratings: { [key: string]: Rating };
}
  
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
      await set(itemRef, updatedItem);
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
      await set(newItemRef, newItem);
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

  // Add a new rating (now creates/updates item first)
  export const addRating = async (rating: Omit<Rating, 'id' | 'timestamp'>, item: {
    pageid: number;
    title: string;
    description: string;
    extract: string;
    thumbnail?: string;
  }): Promise<string> => {
    // First, ensure the item exists in the database
    const itemId = await createOrUpdateItem(item);
    
    // Then add the rating
    const ratingsRef = ref(database, 'ratings');
    const newRatingRef = push(ratingsRef);
    
    const ratingData: Rating = {
      ...rating,
      id: newRatingRef.key!,
      timestamp: Date.now()
    };
    
    await set(newRatingRef, ratingData);
    return newRatingRef.key!;
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
  export const updateRating = async (ratingId: string, updates: Partial<Rating>): Promise<void> => {
    const ratingRef = ref(database, `ratings/${ratingId}`);
    await update(ratingRef, updates);
  };
  
  // Delete a rating
  export const deleteRating = async (ratingId: string): Promise<void> => {
    const ratingRef = ref(database, `ratings/${ratingId}`);
    await remove(ratingRef);
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