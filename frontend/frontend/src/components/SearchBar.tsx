import { useState } from "react";
import axios from "axios";
import type { Email } from "../types/email";

interface Props {
  onResults: (emails: Email[]) => void;
}

function SearchBar({ onResults }: Props) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) {
      alert("Enter something to search");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/search`,
        {
          params: { q: search },
        }
      );

      onResults(response.data.emails || []);
    } catch (error) {
      console.error("Search failed:", error);
      alert("Unable to search emails");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search recipient, subject or status..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
      />

      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>

      <button
        onClick={() => {
          setSearch("");
          onResults([]);
        }}
      >
        Clear
      </button>
    </div>
  );
}

export default SearchBar;