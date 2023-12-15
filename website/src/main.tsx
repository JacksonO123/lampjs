import { mountSSR } from '@jacksonotto/lampjs-ssr';
import App from './pages/App';
import './main.css';

mountSSR(<App />);

export default App;
