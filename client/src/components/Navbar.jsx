import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            BlogApp
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/posts/new"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Write Post
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-gray-700">Hi, {user?.name}</span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;