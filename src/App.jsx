import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import quotesData from './quotes.json';

// Toast Notification Component
const Toast = ({ message, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 50 }}
    className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50"
  >
    {message}
  </motion.div>
);

// Loading Ring Component
const LoadingRing = () => (
  <motion.div
    className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  />
);

function App() {
  const [randomQuote, setRandomQuote] = useState(null);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites')) || []);
  const [showFavorites, setShowFavorites] = useState(false);
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const randomizeButtonRef = useRef(null);

  // Validate quotes data on mount
  useEffect(() => {
    if (!quotesData.quotes || quotesData.quotes.length === 0) {
      setError('No quotes available in quotes.json.');
    }
  }, []);

  // Sync favorites and theme to localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [favorites, theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        handleRandomize();
        randomizeButtonRef.current?.focus();
      }
      if (e.key === 't' || e.key === 'T') toggleTheme();
      if (e.key === 'f' || e.key === 'F') toggleFavoritesView();
      if (e.key === 's' || e.key === 'S') setSidebarOpen(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Get unique categories
  const categories = useMemo(() => ['All', ...new Set(quotesData.quotes.map(q => q.category))], []);

  // Filter quotes by category and search term
  const filteredQuotes = useMemo(() => {
    let quotes = quotesData.quotes || [];
    if (category !== 'All') {
      quotes = quotes.filter(q => q.category === category);
    }
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      quotes = quotes.filter(
        q => q.quote.toLowerCase().includes(lowerSearch) || q.author.toLowerCase().includes(lowerSearch)
      );
    }
    return quotes;
  }, [category, searchTerm]);

  // Handle randomize quote
  const handleRandomize = useCallback(() => {
    setLoading(true);
    setError(null);
    setShowFavorites(false);
    try {
      if (filteredQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        setRandomQuote(filteredQuotes[randomIndex]);
      } else {
        setError('No quotes match your criteria.');
      }
    } catch (err) {
      setError('Failed to load quotes.');
      console.error('Randomize error:', err.message);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, [filteredQuotes]);

  // Toggle favorite
  const toggleFavorite = useCallback((quote) => {
    if (favorites.some(fav => fav.quote === quote.quote)) {
      setFavorites(favorites.filter(fav => fav.quote !== quote.quote));
      setToast({ message: 'Removed from favorites', id: Date.now() });
    } else {
      setFavorites([...favorites, quote]);
      setToast({ message: 'Added to favorites', id: Date.now() });
    }
  }, [favorites]);

  // Share quote
  const shareQuote = useCallback((quote) => {
    const text = `"${quote.quote}" — ${quote.author}`;
    if (navigator.share) {
      navigator.share({ title: 'Inspiring Quote', text }).catch(err => console.error('Share failed:', err));
    } else {
      navigator.clipboard.writeText(text);
      setToast({ message: 'Quote copied to clipboard!', id: Date.now() });
    }
  }, []);

  // Toggle favorites view
  const toggleFavoritesView = useCallback(() => {
    setShowFavorites(prev => !prev);
    setError(null);
    setRandomQuote(null);
    setSidebarOpen(false);
  }, []);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Auto-clear toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Quote Card Component
  const QuoteCard = React.memo(({ quote, isFavoriteList = false }) => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg w-full p-6 rounded-xl shadow-lg relative min-h-[150px] border border-teal-500/30 hover:shadow-xl transition-shadow"
    >
      <blockquote className="text-xl italic text-gray-800 dark:text-gray-100">
        "{quote.quote}"
      </blockquote>
      <p className="text-lg font-semibold text-pink-500 dark:text-pink-400 mt-4 text-right">
        — {quote.author}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Category: {quote.category}</p>
      <div className="absolute top-4 right-4 flex gap-2">
        <motion.button
          onClick={() => toggleFavorite(quote)}
          aria-label={favorites.some(fav => fav.quote === quote.quote) ? 'Remove from favorites' : 'Add to favorites'}
          className={favorites.some(fav => fav.quote === quote.quote) ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 0.9 }}
        >
          🌟
        </motion.button>
        {!isFavoriteList && (
          <motion.button
            onClick={() => shareQuote(quote)}
            aria-label="Share quote"
            className="text-teal-500 hover:text-teal-600 dark:hover:text-teal-400"
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
          >
            📤
          </motion.button>
        )}
      </div>
    </motion.div>
  ));

  // Staggered animation for lists
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className={`relative flex min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-600' : 'bg-gradient-to-br from-purple-300 to-pink-300'}`}>
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 h-full w-64 bg-white/10 dark:bg-gray-900/10 backdrop-blur-lg p-4 shadow-lg z-40"
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-gray-800 dark:text-gray-200"
          aria-label="Close sidebar"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-4">Filters</h2>
        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 dark:text-gray-200 font-medium mb-1">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 rounded-md border border-teal-500/50 bg-white/20 dark:bg-gray-800/20 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="search" className="block text-gray-700 dark:text-gray-200 font-medium mb-1">Search</label>
          <input
            id="search"
            type="text"
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 rounded-md border border-teal-500/50 bg-white/20 dark:bg-gray-800/20 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
            aria-label="Search quotes"
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <header className="mb-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400"
            >
              Quote Generator
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-600 dark:text-gray-300 mt-2"
            >
              Spark inspiration with vibrant quotes (Shortcuts: R, T, F, S)
            </motion.p>
          </header>

          <div className="flex justify-between mb-8">
            <motion.button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md bg-purple-500 text-white hover:bg-purple-600 transition-colors"
              aria-label="Open sidebar"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ☰
            </motion.button>
            <div className="flex gap-4">
              <motion.button
                onClick={toggleFavoritesView}
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                aria-label={showFavorites ? 'Back to random quotes' : 'View favorite quotes'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showFavorites ? 'Back to Quotes' : `Favorites (${favorites.length})`}
              </motion.button>
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-md bg-teal-500 text-white hover:bg-teal-600 transition-colors"
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </motion.button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error ? (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-xl text-red-500 dark:text-red-400 text-center"
                role="alert"
              >
                {error}
              </motion.p>
            ) : loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <LoadingRing />
              </motion.div>
            ) : showFavorites ? (
              <motion.div
                key="favorites"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="space-y-4"
              >
                {favorites.length === 0 ? (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl text-gray-600 dark:text-gray-300 text-center"
                  >
                    No favorite quotes yet.
                  </motion.p>
                ) : (
                  favorites.map((quote, index) => (
                    <motion.div key={index} variants={itemVariants}>
                      <QuoteCard quote={quote} isFavoriteList />
                    </motion.div>
                  ))
                )}
              </motion.div>
            ) : randomQuote ? (
              <QuoteCard quote={randomQuote} />
            ) : (
              <motion.p
                key="initial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-xl text-gray-600 dark:text-gray-300 text-center"
              >
                Click Randomize to discover a quote
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            ref={randomizeButtonRef}
            onClick={handleRandomize}
            disabled={loading}
            aria-label="Generate a random quote"
            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(107, 70, 193, 0.5)' }}
            whileTap={{ scale: 0.95 }}
            className={`mt-8 px-8 py-3 text-lg font-semibold rounded-xl transition-colors w-full sm:w-auto ${
              loading
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700'
            }`}
          >
            {loading ? 'Loading...' : 'Randomize'}
          </motion.button>
        </div>

        <AnimatePresence>
          {toast && (
            <Toast
              key={toast.id}
              message={toast.message}
              onClose={() => setToast(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Particle Background */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-teal-500/30 rounded-full"
            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
            animate={{
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight + 100],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 10 + Math.random() * 5, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </motion.div>
    </div>
  );
}

export default App;