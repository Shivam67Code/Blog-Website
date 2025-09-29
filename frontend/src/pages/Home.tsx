import { useEffect, useState } from "react";
import { postsAPI } from "../services/api";
import type { Post } from "../types";
import PostCard from "../components/PostCard";
import Loader from "../components/Loader";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { motion } from "framer-motion";

const PAGE_SIZE = 6;

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState("");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: PAGE_SIZE };
      if (search) params.search = search;
      if (tags) params.tags = tags;

      const res = await postsAPI.getAllPosts(params);
      setPosts(res.data.data.posts || []);
      setTotal(res.data.data.totalPosts || 0);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [page, search, tags]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Latest Blog Posts</h1>
          <p className="text-gray-500">Explore, search and filter posts</p>
        </div>

        {/* Search and Filter */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <input
            type="text"
            placeholder="Filter by tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="input"
          />
          <button
            type="submit"
            className="btn-primary"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {(posts && posts.length > 0) ? (
              posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-12">
                <p className="text-lg">No posts found.</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
            )}
          </motion.div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <button
                className="btn-outline p-2"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft />
              </button>
              <span className="px-3 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn-outline p-2"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}