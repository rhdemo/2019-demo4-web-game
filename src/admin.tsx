import { h, render } from "preact";
import { AdminView } from "./components/views/admin";
import * as ws from "@app/websocks/ws";

// ws.connect()

const mountNode = document.getElementById("root") as HTMLElement;
render(<AdminView />, mountNode, mountNode.lastChild as HTMLElement);