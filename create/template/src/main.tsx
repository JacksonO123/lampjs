import "./style.css";
import Root from "./pages/root";
import About from "./pages/about";
import { mount, Router } from "@jacksonotto/lampjs";

const routes = [
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "/about",
    element: <About />,
  },
];

mount(document.body, <Router routes={routes} />);
