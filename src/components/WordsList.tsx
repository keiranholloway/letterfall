// File: src/components/WordsList.tsx
import React from 'react';

export interface WordsListProps {
  words: string[];
  className?: string;
}

export const WordsList: React.FC<WordsListProps> = ({ words, className = '' }) => {
  if (words.length === 0) {
    return (
      <div className={`bg-gray-800 p-4 rounded-lg ${className}`}>
        <h3 className="text-lg font-bold mb-3">Words Found</h3>
        <p className="text-gray-400 text-sm">No words found yet</p>
      </div>
    );
  }

  // Remove duplicates and sort words by length (descending) then alphabetically  
  const uniqueWords = [...new Set(words)];
  const sortedWords = uniqueWords.sort((a, b) => {
    if (a.length !== b.length) {
      return b.length - a.length;
    }
    return a.localeCompare(b);
  });

  // Group words by length for better display
  const wordsByLength = sortedWords.reduce((groups: Record<number, string[]>, word) => {
    const length = word.length;
    if (!groups[length]) {
      groups[length] = [];
    }
    groups[length].push(word);
    return groups;
  }, {});

  return (
    <div className={`bg-gray-800 p-4 rounded-lg ${className}`}>
      <h3 className="text-lg font-bold mb-3">Words Found ({uniqueWords.length})</h3>
      <div className="max-h-48 overflow-y-auto space-y-2">
        {Object.entries(wordsByLength)
          .sort(([a], [b]) => parseInt(b) - parseInt(a))
          .map(([length, wordsInGroup]) => (
            <div key={length} className="space-y-1">
              <h4 className="text-sm font-semibold text-gray-300">
                {length} Letter{parseInt(length) > 1 ? 's' : ''}:
              </h4>
              <div className="flex flex-wrap gap-1">
                {wordsInGroup.map((word, index) => (
                  <span
                    key={`${word}-${index}`}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      word.length >= 6
                        ? 'bg-purple-600 text-white'
                        : word.length >= 5
                        ? 'bg-blue-600 text-white'
                        : word.length >= 4
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-100'
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};