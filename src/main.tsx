
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// MongoDB URI is now stored in a configuration value that can be accessed in services
const MONGODB_URI = "mongodb+srv://Vignesh:vignesh@cluster0.6fjqe2e.mongodb.net/goldsmith?retryWrites=true&w=majority&appName=Cluster0";

// For security, in a production app, this URI should be stored in environment variables
// and only accessed on the backend, not exposed in the frontend

// Export for use in services
export const config = {
  mongodbUri: MONGODB_URI,
};

createRoot(document.getElementById("root")!).render(<App />);
