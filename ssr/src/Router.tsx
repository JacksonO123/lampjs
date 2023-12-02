import { Router as LampJsRouter } from '@jacksonotto/lampjs-ssr';
import { Route } from '@jacksonotto/lampjs';
import App from './pages/App';
import About from './pages/About';
import Layout from './layouts/Layout';

const Router = () => {
  return (
    <LampJsRouter>
      <Route path="/">
        <Layout>
          <App />
        </Layout>
      </Route>
      <Route path="/about">
        <Layout>
          <About />
        </Layout>
      </Route>
    </LampJsRouter>
  );
};

export default Router;
