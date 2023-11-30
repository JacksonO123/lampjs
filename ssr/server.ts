import { startServer } from '@jacksonotto/lampjs-ssr/server';

startServer(process.argv[2] === 'prod');
