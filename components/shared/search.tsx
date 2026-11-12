"use client";

import { Search } from "lucide-react";
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchContextValue = {
  query: string;
  setQuery: (query: string) => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

/**
 * Giữ từ khoá tìm kiếm dùng chung giữa ô nhập (toolbar) và danh sách.
 * Có thể bọc cả server component con vì children được truyền xuyên qua.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");

  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchQuery() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("useSearchQuery phải được dùng bên trong SearchProvider.");
  }

  return context;
}

export function SearchInput({
  placeholder,
  className,
}: {
  placeholder: string;
  className?: string;
}) {
  const { query, setQuery } = useSearchQuery();

  return (
    <div className={cn("relative w-full sm:w-60", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-rose-800/50"
      />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="bg-white pl-8"
      />
    </div>
  );
}
