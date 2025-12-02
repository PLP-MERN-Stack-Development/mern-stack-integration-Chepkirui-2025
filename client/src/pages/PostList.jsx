
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { postService, categoryService } from '../services/api';
import { useApi } from '../hooks/useApi';

const PostList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || ''
  );
  const [searchQuery, setSearchQuery] = useState('');

  const { loading, error, execute: fetchPosts } = useApi(postService.getAllPosts);
  const { execute: fetchCategories } = useApi(categoryService.getAllCategories);
  const { execute: searchPostsApi } = useApi(postService.searchPosts);

  const currentPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [currentPage, selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadPosts = async () => {
    try {
      const data = await fetchPosts(
        currentPage,
        10,
        selectedCategory || null
      );
      setPosts(data.data || []);
      setPagination({
        page: data.page,
        pages: data.pages,
        total: data.total,
      });
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchParams({ category: categoryId, page: 1 });
  };

  const handlePageChange = (page) => {
    const params = { page };
    if (selectedCategory) params.category = selectedCategory;
    setSearchParams(params);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadPosts();
      return;
    }

    try {
      const data = await searchPostsApi(searchQuery);
      setPosts(data.data || []);
      setPagination({});
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Blog Posts</h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </form>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-2 rounded-full ${
              !selectedCategory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryChange(category._id)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category._id
                  ? 'text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={{
                backgroundColor:
                  selectedCategory === category._id ? category.color : undefined,
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No posts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {posts.map((post) => (
            <article
              key={post._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-200 relative">
                {post.featuredImage && (
                  <img
                    src={`/uploads/${post.featuredImage}`}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div
                  className="absolute top-3 right-3 px-3 py-1 rounded-full text-white text-sm"
                  style={{ backgroundColor: post.category?.color }}
                >
                  {post.category?.name}
                </div>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-bold mb-2 line-clamp-2">
                  <Link
                    to={`/posts/${post.slug || post._id}`}
                    className="hover:text-blue-600"
                  >
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt && (
                  <p className="text-gray-600 mb-3 line-clamp-3">{post.excerpt}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <img
                      src={`/uploads/${post.author?.avatar || 'default-avatar.jpg'}`}
                      alt={post.author?.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span>{post.author?.name}</span>
                  </div>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <span>{post.viewCount} views</span>
                  <span>{post.comments?.length || 0} comments</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Previous
          </button>
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-4 py-2 border rounded-lg ${
                pagination.page === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PostList;