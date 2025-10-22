// Test file to demonstrate the enhanced rating system functionality
import { 
  addRating, 
  addOrUpdateRating, 
  getUserRatingForItem, 
  updateRating, 
  deleteRating,
  getItemStats,
  getTopRatedItems,
  getMostReviewedItems,
  getUserRatings
} from './database';

// Mock data for testing
const mockItem = {
  pageid: 12345,
  title: "Test Item",
  description: "A test item for rating system",
  extract: "This is a test item to demonstrate the rating system functionality.",
  thumbnail: "https://example.com/thumbnail.jpg"
};

const mockUser = {
  id: "test-user-123",
  name: "Test User",
  email: "test@example.com"
};

// Test functions
export const testRatingSystem = async () => {
  console.log("🧪 Testing Enhanced Rating System...");
  
  try {
    // Test 1: Add a new rating
    console.log("\n1️⃣ Testing addRating...");
    const ratingId = await addRating({
      itemId: mockItem.pageid.toString(),
      rating: 4,
      review: "This is a great test item!",
      userId: mockUser.id
    }, mockItem, {
      name: mockUser.name,
      email: mockUser.email
    });
    console.log("✅ Rating added successfully:", ratingId);

    // Test 2: Check if user can add duplicate rating (should fail)
    console.log("\n2️⃣ Testing duplicate rating prevention...");
    try {
      await addRating({
        itemId: mockItem.pageid.toString(),
        rating: 5,
        review: "Trying to add duplicate rating",
        userId: mockUser.id
      }, mockItem);
      console.log("❌ Duplicate rating was allowed (this shouldn't happen)");
    } catch (error) {
      console.log("✅ Duplicate rating prevented:", error.message);
    }

    // Test 3: Get user's existing rating
    console.log("\n3️⃣ Testing getUserRatingForItem...");
    const existingRating = await getUserRatingForItem(mockItem.pageid.toString(), mockUser.id);
    console.log("✅ Found existing rating:", existingRating);

    // Test 4: Update existing rating
    console.log("\n4️⃣ Testing updateRating...");
    await updateRating(ratingId, {
      rating: 5,
      review: "Updated review - this is even better!",
      userName: mockUser.name,
      userEmail: mockUser.email
    }, mockUser.id);
    console.log("✅ Rating updated successfully");

    // Test 5: Get item statistics
    console.log("\n5️⃣ Testing getItemStats...");
    const stats = await getItemStats(mockItem.pageid.toString());
    console.log("✅ Item stats:", stats);

    // Test 6: Test addOrUpdateRating convenience function
    console.log("\n6️⃣ Testing addOrUpdateRating...");
    const result = await addOrUpdateRating({
      itemId: mockItem.pageid.toString(),
      rating: 3,
      review: "Using convenience function to update",
      userId: mockUser.id
    }, mockItem, {
      name: mockUser.name,
      email: mockUser.email
    });
    console.log("✅ AddOrUpdate result:", result);

    // Test 7: Get user's ratings
    console.log("\n7️⃣ Testing getUserRatings...");
    const userRatings = await getUserRatings(mockUser.id);
    console.log("✅ User ratings:", userRatings);

    // Test 8: Get top rated items
    console.log("\n8️⃣ Testing getTopRatedItems...");
    const topRated = await getTopRatedItems(5);
    console.log("✅ Top rated items:", topRated);

    // Test 9: Get most reviewed items
    console.log("\n9️⃣ Testing getMostReviewedItems...");
    const mostReviewed = await getMostReviewedItems(5);
    console.log("✅ Most reviewed items:", mostReviewed);

    // Test 10: Delete rating
    console.log("\n🔟 Testing deleteRating...");
    await deleteRating(ratingId, mockUser.id);
    console.log("✅ Rating deleted successfully");

    console.log("\n🎉 All tests completed successfully!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Export for use in development
export default testRatingSystem;
