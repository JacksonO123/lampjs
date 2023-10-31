import About from "./about";
import Root from "./root";
import { Route, Router } from "@jacksonotto/lampjs";

const PageRouter = () => {
  return (
    <Router>
      <Route path="/">
        <Root />
      </Route>
      <Route path="/about">
        <About />
      </Route>
    </Router>
  );
};

export default PageRouter;
