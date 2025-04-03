import React from "react";
import { motion } from "framer-motion";
import { Search, Calendar } from "lucide-react";
import DownloadExcelButton from "./DownloadExcelButton";


const QueryFilters = ({searchTerm, handleSearch, selectedType, handleTypeFilter, selectedStatus, handleStatusFilter,  selectedDivision, handleDivisionFilter, startDate, setStartDate, endDate, setEndDate, applyTimelineFilter , timelineActive, clearTimelineFilter}) => {
  return (
    <motion.div
      className="bg-bgSecondary bg-opacity-50 backdrop-blur-md shadow-lg shadow-bgPrimary rounded-xl p-6 border border-borderPrimary mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="grid grid-cols-1 md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-row md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative flex-1 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search queries..."
              className="bg-primary text-tBase placeholder-tDisabled rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-secondary w-full"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search
              className="absolute left-3 top-2.5 text-tSecondary"
              size={18}
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select
              value={selectedType}
              onChange={handleTypeFilter}
              className="bg-primary text-tBase rounded-lg border-2 border-borderPrimary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option className="bg-primary hover:bg-hovPrimary" value="">
                All Types
              </option>
              <option
                className="bg-primary hover:bg-hovPrimary"
                value="Traffic Violation"
              >
                Traffic Violation
              </option>
              <option
                className="bg-primary hover:bg-hovPrimary"
                value="Traffic Congestion"
              >
                Traffic Congestion
              </option>
              <option
                className="bg-primary hover:bg-hovPrimary"
                value="Accident"
              >
                Accident
              </option>
              <option
                className="bg-primary hover:bg-hovPrimary"
                value="Road Damage"
              >
                Road Damage
              </option>
              <option
                className="bg-primary hover:bg-hovPrimary"
                value="Illegal Parking"
              >
                Illegal Parking
              </option>
              <option
                className="bg-primary hover:bg-hovPrimary"
                value="Suggestion"
              >
                Suggestion
              </option>
              <option
                className="bg-primary hover:bg-hovPrimary"
                value="General Report"
              >
                General Report
              </option>
            </select>

            <select
              value={selectedStatus}
              onChange={handleStatusFilter}
              className="bg-primary text-tBase rounded-lg border-2 border-borderPrimary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option className="bg-primary hover:bg-hovPrimary" value="">
                All Statuses
              </option>
              <option
                className="bg-primary hover:bg-hovPrimary"
                value="Pending"
              >
                Pending
              </option>
              <option
                className="bg-primary hover:bg-hovPrimary"
                value="In Progress"
              >
                In Progress
              </option>
              <option
                className="bg-primary hover:bg-hovPrimary"
                value="Resolved"
              >
                Resolved
              </option>
              <option
                className="bg-primary hover:bg-hovPrimary"
                value="Rejected"
              >
                Rejected
              </option>
            </select>

            {/* Download Button */}
            {/* <DownloadExcelButton/>   */}
          </div>
        </div>

        {/* Add this inside the filter section div */}
        <div className="flex text-tBase items-center gap-3 w-full md:w-auto mt-3 md:mt-0">
          <label className="text-tBase">Select Division:</label>
          <select
            id="division-select"
            name="divisions"
            value={selectedDivision}
            onChange={handleDivisionFilter}
            className="bg-primary text-tBase rounded-lg border-2 border-borderPrimary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
          >
            <option className="bg-primary hover:bg-hovPrimary" value="">
              All Divisions
            </option>
            <option className="bg-primary hover:bg-hovPrimary" value="MHALUNGE">
              Mahalunge
            </option>
            <option className="bg-primary hover:bg-hovPrimary" value="CHAKAN">
              Chakan
            </option>
            <option
              className="bg-primary hover:bg-hovPrimary"
              value="DIGHI ALANDI"
            >
              Dighi-Alandi
            </option>
            <option className="bg-primary hover:bg-hovPrimary" value="BHOSARI">
              Bhosari
            </option>
            <option className="bg-primary hover:bg-hovPrimary" value="TALWADE">
              Talwade
            </option>
            <option className="bg-primary hover:bg-hovPrimary" value="PIMPRI">
              Pimpri
            </option>
            <option
              className="bg-primary hover:bg-hovPrimary"
              value="CHINCHWAD"
            >
              Chinchwad
            </option>
            <option className="bg-primary hover:bg-hovPrimary" value="NIGDI">
              Nigdi
            </option>
            <option className="bg-primary hover:bg-hovPrimary" value="SANGHVI">
              Sanghvi
            </option>
            <option
              className="bg-primary hover:bg-hovPrimary"
              value="HINJEWADI"
            >
              Hinjewadi
            </option>
            <option className="bg-primary hover:bg-hovPrimary" value="WAKAD">
              Wakad
            </option>
            <option className="bg-primary hover:bg-hovPrimary" value="BACDHAN">
              Bavdhan
            </option>
            <option className="bg-primary hover:bg-hovPrimary" value="DEHUROAD">
              Dehuroad
            </option>
            <option className="bg-primary hover:bg-hovPrimary" value="TALEGOAN">
              Talegaon
            </option>
          </select>
          <div className="flex items-center">
            <Calendar size={18} className="text-tBase mr-2" />
            <span className="text-tBase mr-2">From:</span>
            <input
              type="date"
              className="bg-primary text-tBase rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
              onChange={(e) => setStartDate(e.target.value)}
              value={startDate}
            />
          </div>
          <div className="flex items-center">
            <span className="text-tBase mr-2">To:</span>
            <input
              type="date"
              className="bg-primary text-tBase rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
              onChange={(e) => setEndDate(e.target.value)}
              value={endDate}
            />
          </div>
          <button
            className="bg-secondary hover:bg-hovSecondary text-tBase px-3 py-2 rounded-lg"
            onClick={applyTimelineFilter}
          >
            Apply
          </button>
          {timelineActive && (
            <button
              className="bg-gray-600 hover:bg-bgSecondary text-tBase px-3 py-2 rounded-lg"
              onClick={clearTimelineFilter}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default QueryFilters;
