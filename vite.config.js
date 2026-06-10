import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: '.',
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        booking: path.resolve(__dirname, 'booking.html'),
        checkout: path.resolve(__dirname, 'checkout.html'),
        dashboard: path.resolve(__dirname, 'dashboard.html'),
        dashboardActive: path.resolve(__dirname, 'dashboard-active.html'),
        dashboardAddresses: path.resolve(__dirname, 'dashboard-addresses.html'),
        dashboardCheckout: path.resolve(__dirname, 'dashboard-checkout.html'),
        dashboardClaim: path.resolve(__dirname, 'dashboard-claim.html'),
        dashboardCreate: path.resolve(__dirname, 'dashboard-create.html'),
        dashboardDiscount: path.resolve(__dirname, 'dashboard-discount.html'),
        dashboardHistory: path.resolve(__dirname, 'dashboard-history.html'),
        dashboardOrderDetails: path.resolve(__dirname, 'dashboard-order-details.html'),
        dashboardSettings: path.resolve(__dirname, 'dashboard-settings.html'),
        dashboardSupport: path.resolve(__dirname, 'dashboard-support.html'),
        dashboardTracking: path.resolve(__dirname, 'dashboard-tracking.html'),
        details: path.resolve(__dirname, 'details.html'),
        faq: path.resolve(__dirname, 'faq.html'),
        infod: path.resolve(__dirname, 'infod.html'),
        log: path.resolve(__dirname, 'log.html'),
        plans: path.resolve(__dirname, 'plans.html'),
        register: path.resolve(__dirname, 'register.html'),
        service: path.resolve(__dirname, 'service.html'),
        success: path.resolve(__dirname, 'success.html'),
        terms: path.resolve(__dirname, 'terms.html'),
        tracking: path.resolve(__dirname, 'tracking.html'),
      },
      output: {
        entryFileNames: 'js/[name].bundle.js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|gif|tiff|bmp|ico/i.test(ext)) {
            return `photo/[name].[ext]`;
          } else if (/woff|woff2|ttf|otf|eot/i.test(ext)) {
            return `fonts/[name].[ext]`;
          } else if (ext === 'css') {
            return `style/[name].[ext]`;
          }
          return `assets/[name].[ext]`;
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true,
  },
  preview: {
    port: 4173,
    strictPort: false,
    open: true,
  },
});
