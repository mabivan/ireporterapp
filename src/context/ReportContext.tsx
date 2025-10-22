import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Incident, ReportContextType } from "../utils/types";
import { mockReports } from "../utils/data";

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const useReports = () => {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error("useReports must be used within a ReportProvider");
  }
  return context;
};

interface ReportProviderProps {
  children: ReactNode;
}

export const ReportProvider: React.FC<ReportProviderProps> = ({ children }) => {
  const [reports, setReports] = useState<Incident[]>([]);

  useEffect(() => {
    const savedReports = localStorage.getItem("ireporter_reports");
    if (savedReports) setReports(JSON.parse(savedReports));
    else setReports(mockReports);
  }, []);

  useEffect(() => {
    localStorage.setItem("ireporter_reports", JSON.stringify(reports));
  }, [reports]);

  const addReport = (reportData: Omit<Incident, "id" | "createdOn">) => {
    const newReport: Incident = {
      ...reportData,
      id: reports.length ? Math.max(...reports.map(r => r.id)) + 1 : 1,
      createdOn: new Date(),
    };
    setReports(prev => [...prev, newReport]);
  };

  const updateReport = (id: number, updates: Partial<Incident>) => {
    setReports(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteReport = (id: number) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const getUserReports = (userId: number) => reports.filter(r => r.createdBy === userId);
  const getAllReports = () => reports;

  const value: ReportContextType = {
    reports,
    addReport,
    updateReport,
    deleteReport,
    getUserReports,
    getAllReports,
  };

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
};