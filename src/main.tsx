
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// MongoDB URI would be handled on the backend
// The frontend won't directly connect to MongoDB
// This would be used in API calls
const MONGODB_URI = "mongodb+srv://Vignesh:vignesh@cluster0.6fjqe2e.mongodb.net/goldsmith?retryWrites=true&w=majority&appName=Cluster0";

// In a real app, we'd configure an API client here
// For example:
// import axios from 'axios';
// axios.defaults.baseURL = '/api';

createRoot(document.getElementById("root")!).render(<App />);
