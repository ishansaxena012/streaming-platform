import { useUiStore } from "../store/ui.store";
import { useDebounce } from "../hooks/use-debounce";
import { SearchGrid } from "../features/search/components/search-grid";
import { Search } from "lucide-react";

export function SearchPage() {
  const { searchQuery, setSearchQuery } = useUiStore();
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  return (
    <div className="bg-[#08080C] min-h-[80vh] py-8 select-none">
      
      {/* Mobile search bar container input (for touch responsive sizes) */}
      <div className="max-w-md mx-auto px-4 mb-6 md:hidden">
        <div className="relative flex items-center group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cinema-gray group-focus-within:text-netflix-red transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, genres, actors..."
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white placeholder-cinema-gray focus:outline-none focus:border-netflix-red focus:bg-white/[0.08]"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <SearchGrid debouncedQuery={debouncedSearchQuery} />
      </div>

    </div>
  );
}
export default SearchPage;
