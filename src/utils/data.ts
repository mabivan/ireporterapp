import { User, Incident } from './types';

export const mockUsers: User[] = [
  {
    id: 1,
    firstname: 'Admin',
    lastname: 'User',
    othernames: 'System',
    email: 'admin@ireporter.com',
    phoneNumber: '+1234567890',
    username: 'admin',
    registered: new Date(),
    isAdmin: true,
    password: 'admin123'
  },
  {
    id: 2,
    firstname: 'John',
    lastname: 'Doe',
    othernames: 'Michael',
    email: 'john@example.com',
    phoneNumber: '+1234567891',
    username: 'johndoe',
    registered: new Date(),
    isAdmin: false,
    password: 'user123'
  }
];

export const mockReports: Incident[] = [
  {
    id: 1,
    createdOn: new Date('2024-01-15'),
    createdBy: 2,
    type: 'red-flag',
    title: 'Bribery at City Hall',
    location: '40.7128,-74.0060',
    status: 'under investigation',
    images: [],
    videos: [],
    comment: 'Official demanding bribes for permit processing'
  },
  {
    id: 2,
    createdOn: new Date('2024-01-16'),
    createdBy: 2,
    type: 'intervention',
    title: 'Potholes on Main Street',
    location: '40.7589,-73.9851',
    status: 'draft',
    images: [],
    videos: [],
    comment: 'Large potholes causing traffic issues'
  }
];