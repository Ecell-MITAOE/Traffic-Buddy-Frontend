import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const [inputPage, setInputPage] = React.useState('');

    const handleDirectPageNavigation = (e) => {
        e.preventDefault();
        const page = parseInt(inputPage);
        if (page && page >= 1 && page <= totalPages) {
            onPageChange(page);
            setInputPage('');
        }
    };

    const showPages = () => {
        const pages = [];

        // Always show first page
        pages.push(1);

        if (totalPages <= 7) {
            // If total pages is 7 or less, show all pages
            for (let i = 2; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 4) {
                // Near the start
                for (let i = 2; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                // Near the end
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Middle - show current page and neighbors
                pages.push('...');
                for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-between items-center mt-4 mb-2">
            <div className="text-sm text-gray-400">
                Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
                {/* Previous button */}
                <button
                    onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`inline-flex items-center px-2.5 py-2 rounded-l-md border border-borderPrimary ${
                        currentPage === 1
                            ? "bg-bgSecondary text-gray-500 cursor-not-allowed"
                            : "bg-bgSecondary text-tBase hover:bg-hovPrimary"
                    }`}
                    aria-label="Previous page"
                >
                    <ChevronLeft size={16} />
                </button>

                {/* Page numbers */}
                <div className="flex items-center -space-x-px">
                    {showPages().map((pageNum, idx) => (
                        <button
                            key={idx}
                            onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : null}
                            disabled={pageNum === '...'}
                            className={`inline-flex items-center px-4 py-2 border border-borderPrimary first:rounded-l-md last:rounded-r-md ${
                                currentPage === pageNum
                                    ? "bg-blue-600 text-white z-10 border-blue-600"
                                    : pageNum === '...'
                                        ? "bg-bgSecondary text-gray-500 cursor-default"
                                        : "bg-bgSecondary text-tBase hover:bg-hovPrimary"
                            }`}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>

                {/* Next button */}
                <button
                    onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`inline-flex items-center px-2.5 py-2 rounded-r-md border border-borderPrimary ${
                        currentPage === totalPages
                            ? "bg-bgSecondary text-gray-500 cursor-not-allowed"
                            : "bg-bgSecondary text-tBase hover:bg-hovPrimary"
                    }`}
                    aria-label="Next page"
                >
                    <ChevronRight size={16} />
                </button>                {/* Direct page navigation */}                  <form onSubmit={handleDirectPageNavigation} className="flex items-center space-x-2 ml-4">
                    <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={inputPage}
                        onChange={(e) => setInputPage(e.target.value)}
                        placeholder="Go to page"
                        className="w-20 px-2 py-2 bg-hovPrimary text-tBase border border-borderPrimary rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                        type="submit"
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50"
                        disabled={!inputPage || parseInt(inputPage) < 1 || parseInt(inputPage) > totalPages}
                    >
                        Go
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Pagination;
