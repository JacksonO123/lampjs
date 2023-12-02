import { mountSSR } from '@jacksonotto/lampjs-ssr';
import Router from './Router';
import './main.css';

mountSSR(<Router />);

export default Router;
