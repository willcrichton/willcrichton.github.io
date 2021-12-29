import React from "react";
import ReactDOM from "react-dom";
import Index from "./index.nota";

import '@nota-lang/nota-components/dist/nota-components.css';
import '../css/index.scss';
import '../static/index.html';

let App = () => <Index />;
ReactDOM.render(<App />, document.getElementById('app'));