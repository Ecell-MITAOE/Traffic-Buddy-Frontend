import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from '../components/auth/AuthContext';

const DivisionContext = createContext();

export const useDivision = () => useContext(DivisionContext);

export const DivisionProvider = ({ children }) => {
  const { currentUser, getDivisionId, isMainAdmin } = useAuth();
  const [currentDivision, setCurrentDivision] = useState(null);
  const [allDivisions, setAllDivisions] = useState([]);
  const [loadingDivision, setLoadingDivision] = useState(true);
  const [error, setError] = useState(null);

  // Load division data when user is authenticated
  useEffect(() => {
    const fetchDivisionData = async () => {
      if (!currentUser) {
        setLoadingDivision(false);
        return;
      }

      try {
        setLoadingDivision(true);
        setError(null);

        if (isMainAdmin()) {
          // For main admin, fetch all divisions
          const response = await axios.get('/api/divisions');
          setAllDivisions(response.data.divisions || []);
          setCurrentDivision(null); // Main admin doesn't have a specific division
        } else {
          // For division admin, fetch only their division
          const divisionId = getDivisionId();
          if (divisionId) {
            const response = await axios.get(`/api/divisions/${divisionId}`);
            setCurrentDivision(response.data.division);
            setAllDivisions([response.data.division]); // Just their own division
          }
        }
      } catch (error) {
        console.error('Error fetching division data:', error);
        setError('Failed to load division data');
      } finally {
        setLoadingDivision(false);
      }
    };

    fetchDivisionData();
  }, [currentUser, getDivisionId, isMainAdmin]);

  // Filter queries by current division
  const filterQueriesByDivision = (queries) => {
    if (isMainAdmin() || !currentDivision) {
      return queries; // Main admin sees all queries
    }
    
    // Division admin only sees their division's queries
    return queries.filter(query => 
      query.division && query.division.toString() === currentDivision._id.toString()
    );
  };

  // Get division by ID
  const getDivisionById = (divisionId) => {
    return allDivisions.find(div => div._id === divisionId);
  };

  // Get division name by ID
  const getDivisionNameById = (divisionId) => {
    const division = getDivisionById(divisionId);
    return division ? division.name : 'Unknown Division';
  };

  const value = {
    currentDivision,
    allDivisions,
    loadingDivision,
    error,
    filterQueriesByDivision,
    getDivisionById,
    getDivisionNameById
  };

  return (
    <DivisionContext.Provider value={value}>
      {children}
    </DivisionContext.Provider>
  );
};

export default DivisionContext;