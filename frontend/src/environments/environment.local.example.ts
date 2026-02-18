// Local environment configuration - NOT committed to git
// Copy this file to environment.local.ts for local development with sensitive data

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001',
  apiBaseUrl: 'localhost:3001',
  
  // Example of sensitive configuration that should NOT be in git:
  // apiKey: 'your-api-key-here',
  // authToken: 'your-auth-token-here',
  // googleMapsKey: 'your-google-maps-key',
  // firebaseConfig: {
  //   apiKey: "your-firebase-api-key",
  //   authDomain: "your-project.firebaseapp.com",
  //   // ... other firebase config
  // }
};