import { mountSSR } from '../pkg';
import App from './App';

mountSSR(document.body, <App />);
