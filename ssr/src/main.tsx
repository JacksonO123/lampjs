import { mountSSR } from '@jacksonotto/lampjs-ssr';
// import { mountSSR } from '../pkg';
import App from './App.js';

mountSSR(document.body, <App />);
