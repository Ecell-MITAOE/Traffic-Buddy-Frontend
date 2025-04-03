import StatCard from "../common/StatCard"
import { motion } from "framer-motion";

import { AlertTriangle, Check, Clock, FileSearch } from "lucide-react";

const QueryStats = (filteredStats) => {
  return (
    <motion.div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StatCard
        name="Total Queries"
        icon={FileSearch}
        value={filteredStats.total.toLocaleString()}
        color="#6366F1"
      />
      <StatCard
        name="Pending Queries"
        icon={Clock}
        value={filteredStats.byStatus?.pending || 0}
        color="#F59E0B"
      />
      <StatCard
        name="In Progress"
        icon={AlertTriangle}
        value={filteredStats.byStatus?.inProgress || 0}
        color="#3B82F6"
      />
      <StatCard
        name="Resolved"
        icon={Check}
        value={filteredStats.byStatus?.resolved || 0}
        color="#10B981"
      />
    </motion.div>
  );
};

export default QueryStats;
