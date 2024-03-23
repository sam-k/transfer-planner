import {CLIENT_PORT, REPO_DIR} from '@internal/constants';
import react from '@vitejs/plugin-react';
import {join as joinPath} from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  root: joinPath(REPO_DIR, 'packages/client'),
  server: {port: CLIENT_PORT},
  plugins: [react()],
});
