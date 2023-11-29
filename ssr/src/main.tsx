import { mountSSR } from '@jacksonotto/lampjs-ssr';
import App from './App';

mountSSR(document.body, <App />);
