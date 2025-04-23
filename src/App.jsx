import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import quotesData from './quotes.json';

function App() {
  const [randomQuote, setRandomQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validate quotes data on mount
  useEffect(() => {
    if (!quotesData.quotes || quotesData.quotes.length === 0) {
      setError('No quotes available. Please check the data source.');
    }
  }, []);

  const handleRandomize = () => {
    setLoading(true);
    setError(null);

    try {
      const quotes = quotesData.quotes;
      if (quotes && quotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setRandomQuote(quotes[randomIndex]);
      } else {
        setError('No quotes available.');
      }
    } catch (err) {
      setError('Failed to load quotes.');
    } finally {
      setTimeout(() => setLoading(false), 300); // Simulate async delay
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-xl text-red-600"
            role="alert"
          >
            {error}
          </motion.p>
        ) : loading ? (
          <motion.p
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xl text-gray-600"
          >
            Loading quote...
          </motion.p>
        ) : randomQuote ? (
          <motion.div
            key={randomQuote.quote}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white w-11/12 max-w-2xl p-6 rounded-lg shadow-lg relative min-h-[200px]"
          >
            <blockquote className="text-xl italic text-gray-800">
              "{randomQuote.quote}"
            </blockquote>
            <p className="text-2xl font-semibold text-indigo-600 mt-4 text-right">
              — {randomQuote.author}
            </p>
          </motion.div>
        ) : (
          <motion.p
            key="initial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-xl text-gray-600"
          >
            Click the button to generate a quote
          </motion.p>
        )}
      </AnimatePresence>

      <button
        onClick={handleRandomize}
        disabled={loading}
        aria-label="Generate a random quote"
        className={`mt-6 px-6 py-3 text-lg font-semibold rounded-xl transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {loading ? 'Loading...' : 'Randomize'}
      </button>
    </div>
  );
}

export default App;