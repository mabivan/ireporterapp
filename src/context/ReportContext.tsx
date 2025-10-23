import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Incident, ReportContextType } from '../utils/types';
import { mockReports } from '../utils/data';

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const useReports = () => {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportProvider');
  }
  return context;
};

interface ReportProviderProps {
  children: ReactNode;
}

export const ReportProvider: React.FC<ReportProviderProps> = ({ children }) => {
  const [reports, setReports] = useState<Incident[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load reports from localStorage on component mount
  useEffect(() => {
    const loadReports = () => {
      try {
        const savedReports = localStorage.getItem('ireporter_reports');
        if (savedReports) {
          const parsedReports = JSON.parse(savedReports);
          
          // Convert date strings back to Date objects
          const reportsWithDates = parsedReports.map((report: any) => ({
            ...report,
            createdOn: new Date(report.createdOn)
          }));
          
          setReports(reportsWithDates);
          console.log('Loaded reports from storage:', reportsWithDates.length);
        } else {
          // Initialize with mock data only if no saved data exists
          setReports(mockReports);
          console.log('Initialized with mock reports:', mockReports.length);
        }
      } catch (error) {
        console.error('Error loading reports from localStorage:', error);
        // Fallback to mock data if there's an error
        setReports(mockReports);
      } finally {
        setIsInitialized(true);
      }
    };

    loadReports();
  }, []);

  // Save reports to localStorage whenever reports change
  useEffect(() => {
    if (isInitialized && reports.length > 0) {
      try {
        localStorage.setItem('ireporter_reports', JSON.stringify(reports));
        console.log('Saved reports to storage:', reports.length);
      } catch (error) {
        console.error('Error saving reports to localStorage:', error);
      }
    }
  }, [reports, isInitialized]);

  const addReport = (reportData: Omit<Incident, 'id' | 'createdOn'>) => {
    try {
      // Generate a unique ID (max of existing IDs + 1, or 1 if no reports)
      const newId = reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1;
      
      const newReport: Incident = {
        ...reportData,
        id: newId,
        createdOn: new Date()
      };
      
      setReports(prev => {
        const updatedReports = [...prev, newReport];
        console.log('Added new report. Total reports:', updatedReports.length);
        return updatedReports;
      });
      
      return newReport.id;
    } catch (error) {
      console.error('Error adding report:', error);
      return -1; // Return -1 to indicate failure
    }
  };

  const updateReport = (id: number, updates: Partial<Incident>) => {
    try {
      setReports(prev => {
        const updatedReports = prev.map(report => 
          report.id === id ? { ...report, ...updates } : report
        );
        console.log('Updated report:', id);
        return updatedReports;
      });
      return true;
    } catch (error) {
      console.error('Error updating report:', error);
      return false;
    }
  };

  const deleteReport = (id: number) => {
    try {
      setReports(prev => {
        const updatedReports = prev.filter(report => report.id !== id);
        console.log('Deleted report:', id, 'Remaining reports:', updatedReports.length);
        return updatedReports;
      });
      return true;
    } catch (error) {
      console.error('Error deleting report:', error);
      return false;
    }
  };

  const getReport = (id: number) => {
    return reports.find(report => report.id === id);
  };

  const getUserReports = (userId: number) => {
    const userReports = reports.filter(report => report.createdBy === userId);
    console.log(`Getting reports for user ${userId}:`, userReports.length);
    return userReports;
  };

  const getAllReports = () => {
    return reports;
  };

  // Debug function to check current state
  const debugReports = () => {
    console.log('Current reports state:', reports);
    console.log('LocalStorage reports:', localStorage.getItem('ireporter_reports'));
  };

  const value: ReportContextType = {
    reports,
    addReport,
    updateReport,
    deleteReport,
    getReport,
    getUserReports,
    getAllReports,
    debugReports // Optional: for debugging
  };

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
};