import { startServer } from '@jacksonotto/lampjs-ssr/server';
import App from './src/App';

startServer(App, process.argv[2] === 'prod');
