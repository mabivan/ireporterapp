export interface User {
  id: number;
  firstname: string;
  lastname: string;
  othernames: string;
  email: string;
  phoneNumber: string;
  username: string;
  registered: Date;
  isAdmin: boolean;
  password: string;
}

export interface Incident {
  id: number;
  createdOn: Date;
  createdBy: number;
  type: 'red-flag' | 'intervention';
  title: string;
  location: string;
  status: 'draft' | 'under investigation' | 'resolved' | 'rejected';
  images: string[];
  videos: string[];
  comment: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Omit<User, 'id' | 'registered' | 'isAdmin'>) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface ReportContextType {
  reports: Incident[];
  addReport: (report: Omit<Incident, 'id' | 'createdOn'>) => number;
  updateReport: (id: number, updates: Partial<Incident>) => boolean;
  deleteReport: (id: number) => boolean;
  getReport: (id: number) => Incident | undefined;
  getUserReports: (userId: number) => Incident[];
  getAllReports: () => Incident[];
  debugReports?: () => void; // Optional debug function
}