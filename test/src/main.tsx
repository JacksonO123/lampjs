import "./style.css";
import Root from "./pages/root";
import { Router, mount } from "@jacksonotto/lampjs";
import About from "./pages/about";

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
