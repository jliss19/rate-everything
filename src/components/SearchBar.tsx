import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

const popularCategories = [
  "All",
  "Movies",
  "Food",
  "Cars",
  "Events",
  "Books",
  "Music",
  "Places",
  "Technology",
  "People",
];

export const SearchBar = ({ onSearch, loading }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const searchQuery = category !== "All" ? `${category} ${query.trim()}` : query.trim();
      onSearch(searchQuery);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-3xl gap-2">
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-[110px] bg-card border-border">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border z-50">
          {popularCategories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for anything to rate..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>
      
      <Button type="submit" disabled={loading || !query.trim()}>
        {loading ? "Searching..." : "Search"}
      </Button>
    </form>
  );
};