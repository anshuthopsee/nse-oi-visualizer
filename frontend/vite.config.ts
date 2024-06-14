import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const API_BASE_URL = mode === 'development' ? 'http://localhost:6123/' : env.VITE_API_BASE_URL;

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  };
});