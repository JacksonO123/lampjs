import { Router as LampJsRouter } from '@jacksonotto/lampjs-ssr';
import { Route } from '@jacksonotto/lampjs';

import Layout from './layouts/Layout';
import App from './pages/App';
import About from './pages/About';

const Router = () => {
  return (
    <LampJsRouter>
      <Route
        path="/"
        content={() => (
          <Layout>
            <App />
          </Layout>
        )}
      />
      <Route
        path="/about"
        content={() => (
          <Layout>
            <About />
          </Layout>
        )}
      />
    </LampJsRouter>
  );
};

export default Router;
