import { neon } from '@neondatabase/serverless';
import { getErrorMessage } from '@/utils/errorHandler';

const neonUrl = import.meta.env.VITE_NEON_DATABASE_URL || '';

// Check for missing environment variables
const usingPlaceholder = !neonUrl;

// Debug Neon configuration
console.log('🔧 Neon Configuration:', {
  url: !usingPlaceholder ? '✅ URL configured' : '❌ URL missing',
  urlValue: usingPlaceholder ? 'undefined' : 'postgresql://***masked***'
});

if (usingPlaceholder) {
  console.warn('⚠️ Neon configuration missing! Running in offline mode.');
  console.warn('🔧 To connect to Neon, set this environment variable:');
  console.warn('   VITE_NEON_DATABASE_URL=postgresql://user:password@host/database');
}

// Create a client that handles missing environment variables gracefully
let sql: any;

if (usingPlaceholder) {
  console.warn('⚠️ Neon configuration missing! Running in offline mode with mock data.');
  
  // Create a mock client for offline mode
  sql = () => Promise.resolve([]);
} else {
  sql = neon(neonUrl);
}

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  // In offline mode, return false
  if (usingPlaceholder) return false;
  
  // For now, return false until auth system is implemented
  return false;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  // In offline mode, return null
  if (usingPlaceholder) return null;
  
  // For now, return null until auth system is implemented
  return null;
};

// Test Neon connection
export const testNeonConnection = async () => {
  try {
    console.log('🔍 Testing Neon connection...');

    // First check if configuration is valid
    if (!neonUrl) {
      return {
        success: false,
        error: 'Neon configuration missing. Check environment variable VITE_NEON_DATABASE_URL'
      };
    }

    // Test database connectivity
    console.log('🔍 Testing database service...');
    try {
      const result = await sql`SELECT 1 as test`;
      console.log('✅ Neon connection test successful');
      return { success: true, data: result };
    } catch (dbError: any) {
      const errorMessage = getErrorMessage(dbError);
      console.error('❌ Database service test failed:', errorMessage);
      
      if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
        return {
          success: false,
          error: 'Database tables not found. Please run database setup.'
        };
      } else {
        return {
          success: false,
          error: `Database error: ${errorMessage}`
        };
      }
    }
  } catch (error: any) {
    const errorMessage = getErrorMessage(error);
    console.error('❌ Neon connection test error:', errorMessage);

    if (errorMessage.includes('fetch')) {
      return {
        success: false,
        error: 'Network connection failed. Please check your internet connection.'
      };
    } else if (errorMessage.includes('timeout')) {
      return {
        success: false,
        error: 'Connection timeout. Neon service may be unavailable.'
      };
    } else {
      return {
        success: false,
        error: errorMessage
      };
    }
  }
};

export { sql };
export default sql;
