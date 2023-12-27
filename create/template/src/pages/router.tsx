import About from "./about";
import Root from "./root";
import { Route, Router } from "@jacksonotto/lampjs";

const PageRouter = () => {
  return (
    <Router>
      <Route path="/" content={() => <Root />} />
      <Route path="/about" content={() => <About />} />
    </Router>
  );
};

export default PageRouter;
