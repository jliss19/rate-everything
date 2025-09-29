import { WikiItem } from "@/components/SearchResults";

const WIKIPEDIA_API_BASE = "https://en.wikipedia.org/api/rest_v1";
const WIKIPEDIA_SEARCH_BASE = "https://en.wikipedia.org/w/api.php";

export interface WikipediaSearchResult {
  pageid: number;
  title: string;
  snippet: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
}

export const searchWikipedia = async (query: string): Promise<WikiItem[]> => {
  try {
    // Search for articles
    const searchResponse = await fetch(
      `${WIKIPEDIA_SEARCH_BASE}?` + new URLSearchParams({
        action: "query",
        format: "json",
        generator: "search",
        gsrsearch: query,
        gsrlimit: "20",
        prop: "pageimages|extracts|info",
        piprop: "thumbnail",
        pithumbsize: "200",
        exintro: "true",
        explaintext: "true",
        exlimit: "20",
        inprop: "url",
        origin: "*"
      })
    );

    const searchData = await searchResponse.json();
    
    if (!searchData.query?.pages) {
      return [];
    }

    const pages = Object.values(searchData.query.pages) as any[];
    
    return pages.map((page): WikiItem => ({
      pageid: page.pageid,
      title: page.title,
      description: page.extract ? page.extract.substring(0, 150) + "..." : "No description available",
      extract: page.extract || "No detailed information available.",
      thumbnail: page.thumbnail?.source,
      rating: Math.random() * 5, // Simulated rating
      totalRatings: Math.floor(Math.random() * 1000) + 1 // Simulated total ratings
    }));

  } catch (error) {
    console.error("Error searching Wikipedia:", error);
    return [];
  }
};

export const getWikipediaPage = async (pageId: number): Promise<WikiItem | null> => {
  try {
    const response = await fetch(
      `${WIKIPEDIA_SEARCH_BASE}?` + new URLSearchParams({
        action: "query",
        format: "json",
        pageids: pageId.toString(),
        prop: "extracts|pageimages|info",
        piprop: "original",
        exintro: "false",
        explaintext: "true",
        inprop: "url",
        origin: "*"
      })
    );

    const data = await response.json();
    const page = data.query?.pages?.[pageId];
    
    if (!page) return null;

    return {
      pageid: page.pageid,
      title: page.title,
      description: page.extract ? page.extract.substring(0, 200) + "..." : "No description available",
      extract: page.extract || "No detailed information available.",
      thumbnail: page.original?.source || page.thumbnail?.source,
      rating: Math.random() * 5, // Simulated rating
      totalRatings: Math.floor(Math.random() * 1000) + 1 // Simulated total ratings
    };

  } catch (error) {
    console.error("Error fetching Wikipedia page:", error);
    return null;
  }
};