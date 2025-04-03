import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, XCircle, ChevronDown, Loader } from "lucide-react";

const CustomDropdown = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // onChange(defaultValue);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const getIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4 mr-2 text-yellow-500" />;
      case "In Progress":
        return <Loader className="w-4 h-4 mr-2 text-blue-500 animate-spin" />;
      case "Resolved":
        return <CheckCircle className="w-4 h-4 mr-2 text-green-500" />;
      case "Rejected":
        return <XCircle className="w-4 h-4 mr-2 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500";
      case "In Progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500";
      case "Resolved":
        return "bg-green-500/20 text-green-400 border-green-500";
      case "Rejected":
        return "bg-red-500/20 text-red-400 border-red-500";
      default:
        return "bg-gray-800 text-white border-gray-700";
    }
  };

  return (
    <div className="relative w-48 mt-2">
      {/* Dropdown Button with Colored Status */}
      <button
        onClick={toggleDropdown}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-md border shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500
        ${getStatusStyle(value)}`}
      >
        <div className="flex items-center">
          {getIcon(value)}
          <span className="text-sm font-medium">{value || "Select"}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full mt-1 bg-[#1F1F1F] border border-gray-700 rounded-md shadow-lg overflow-hidden"
          >
            {options.map((option) => (
              <motion.li
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOptionClick(option.value)}
                className={`flex items-center px-3 py-2 border-b border-gray-700 last:border-none transition-all duration-150 cursor-pointer text-sm font-medium rounded-sm
                  ${
                    option.value === "Pending"
                      ? "hover:bg-yellow-800/60"
                      : option.value === "In Progress"
                      ? "hover:bg-blue-800/60"
                      : option.value === "Resolved"
                      ? "hover:bg-green-800/60"
                      : option.value === "Rejected"
                      ? "hover:bg-red-800/60"
                      : "hover:bg-gray-700/60"
                  }`}
              >
                {getIcon(option.value)}
                {option.label}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDropdown;
