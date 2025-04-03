import { BarChart2, Mail, Menu, Settings, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMainAdmin, setIsMainAdmin] = useState(false);
  const [divisionName, setDivisionName] = useState("");
  const location = useLocation();

  useEffect(() => {
    // Make the API call inside useEffect
    axios
      .get(`${import.meta.env.VITE_Backend_URL || 'http://localhost:3000'}/api/auth/me`)
      .then((response) => {
        if (response.data.success) {
          if (response.data.user.role === "main_admin") {
            setIsMainAdmin(true);
          } else {
            setIsMainAdmin(false);
            setDivisionName(response.data.user.divisionName);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  // Define sidebar items based on user role
  const getSidebarItems = () => {
    const items = [
      {
        name: "Overview",
        icon: BarChart2,
        color: "#6366f1",
        href: isMainAdmin?"/adminoverview":"/overview",
      },
      {
        name: "Query Management",
        icon: Users,
        color: "#EC4899",
        href: isMainAdmin?"/adminQueryManagement":"/queryManagement",
      },
    ];

    // Only main admin gets access to User Management
    if (isMainAdmin) {
      items.push({
        name: "Volunteer Management",
        icon: Users,
        color: "#10B981",
        href: "/volunteermanagement",
      });
      items.push({
        name: "User Management",
        icon: Users,
        color: "#10B981",
        href: "/usermanagement",
      });
    }

    // EmailRecords Page
    items.push({
      name: "Email Records",
      icon: Mail,
      color: "#10B981",
      href: "/emailRecords",
    });

    // Everyone gets access to settings
    items.push({
      name: "Settings",
        icon: Settings,
        color: "#6EE7B7",
        href: "/settings",
    });

    return items;
  };

  const SIDEBAR_ITEMS = getSidebarItems();

  return (
    // Framer-motion div responsible for all the animations
    <motion.div
      className={`relative z-10 transition-all ease-in-out flex-shrink-0 shadow-lg shadow-bgPrimary shadow-bgPrimary${
        isSidebarOpen ? "w-48" : "w-20"
      }`}
      animate={{ width: isSidebarOpen ? 192 : 80 }}
      transition={{ duration: 0.1 }}
    >
      {/* Sidebar background */}
      <div className="h-full bg-bgSecondary overflow-hidden bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-bgPrimary">
        {/* button for collapsing sidebar */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="self-end text-tBase focus:outline-none"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {/* Button Icon */}
          <Menu size={24} />
        </motion.button>

        <div className="mt-8 mb-12 flex items-center">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="ml-3"
              >
                {/* <h1 className='text-lg font-bold text-tBase'>Traffic Buddy</h1>
                                <p className='text-xs font-semibold text-tSecondary'>
                                    {isMainAdmin ? "Main Dashboard" : `Division - ${divisionName}`}
                                </p> */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1">
          {SIDEBAR_ITEMS.map((item) => (
            <Link key={item.name} to={item.href}>
              <motion.div
                className={`flex items-center p-3 mb-1 rounded-lg transition-colors hover:bg-primary group ${
                  location.pathname === item.href ? "bg-primary" : ""
                }`}
                whileHover={{ x: 5 }}
              >
                <item.icon
                  size={24}
                  style={{ color: item.color }}
                  className="flex-shrink-0"
                />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="ml-3 text-tBase font-medium"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* Sidebar footer */}
        {isSidebarOpen && (
          <div className="mt-auto pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              <p>Logged in as:</p>
              <p className="font-medium text-white">
                {isMainAdmin
                  ? "Main Admin"
                  : `Division Admin - ${divisionName}`}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default Sidebar;
