import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

const AdminContext = createContext<boolean>(false);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
	const { user } = useAuth();
	const isAdmin = !!user?.isAdmin;
	return <AdminContext.Provider value={isAdmin}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => useContext(AdminContext);

export default AdminContext;

