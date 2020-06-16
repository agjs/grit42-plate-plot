import React, { Component, useState } from "react";
import { render } from "react-dom";
import Hello from "./Hello";
import "./style.css";

import PlatePlot from "./components/plots/Plate";

import dummy from "./test.json";

const App = () => {
  const [data, setData] = useState(dummy);

  const onSelected = selected => {
    if (!selected.length) {
      return;
    }
    console.log(selected);
  };
  return (
    <div>
      <PlatePlot
        onSelect={onSelected}
        // yLabels={["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"]}
        // xLabels={["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]}
        plotData={data}
      />
    </div>
  );
};

render(<App />, document.getElementById("root"));
