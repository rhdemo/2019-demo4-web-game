import { h, render } from "preact";
import { AdminView } from "./components/views/admin";

const mountNode = document.getElementById("root") as HTMLElement;
render(<AdminView />, mountNode, mountNode.lastChild as HTMLElement);
