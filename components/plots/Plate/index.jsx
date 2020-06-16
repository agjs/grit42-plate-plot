import * as d3 from "d3";
import DragSelect from "dragselect";
import React, { useRef, useEffect, useState } from "react";

import { heatmapColors } from "./utils";

import "./style.css";

import { DATA_SET_SERIES } from "../../../dummy";

export default props => {
  const d3Container = useRef(null);

  const [state, setState] = useState({
    series: DATA_SET_SERIES,
    heatMap: false,
    showTextInCell: true,
    heatMapMode: "linear",
    highLightParam: "welllayout__name",
    selectedParam: "normalized_read",
    selectedItems: [],
    params: {
      mm_plateParam: "plate",
      mm_wellParam: "well",
      mm_layoutParam: "welllayout",
      mm_concentrationParam: "concentration",
      mm_bogusParam: "bogus"
    }
  });

  const { data, yLabels, xLabels, onClick, onSelect } = props;

  const margin = { top: 30, right: 30, bottom: 30, left: 30 };
  const width = 450 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  const setEventListeners = container => {};

  const setSelectables = selectable =>
    new DragSelect({
      selectables: document.querySelectorAll(".grit42-plate-plot__svg rect"),
      callback: data => {
        props.onSelect(
          data.map(rect => ({
            ...rect.__data__,
            index: parseInt(rect.getAttribute("index"), 10)
          }))
        );
      }
    });

  const createSVG = container => {
    return d3
      .select(container)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", `0 0 450 450`)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  };

  const createXAxis = svg => {
    const xAxis = d3
      .scaleBand()
      .range([0, width])
      .domain(xLabels)
      .padding(0.01);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xAxis));

    return xAxis;
  };

  const createYAxis = svg => {
    const yAxis = d3
      .scaleBand()
      .range([height, 0])
      .domain(yLabels)
      .padding(0.01);

    svg.append("g").call(d3.axisLeft(yAxis));

    return yAxis;
  };

  const getStyles = () => {
    return {
      fill: d3
        .scaleLinear()
        .range(["white", "#69b3a2"])
        .domain([1, 100])
    };
  };

  const createRectangles = (svg, xAxis, yAxis) => {
    const rectangles = svg
      .selectAll()
      .data(data, d => `${d.group}:${d.variable}`)
      .enter()
      .append("rect");

    rectangles
      .attr("index", (d, i) => i)
      .attr("x", d => xAxis(d.group))
      .attr("y", d => yAxis(d.variable))
      .attr("width", xAxis.bandwidth())
      .attr("height", yAxis.bandwidth())
      .style("fill", d => getStyles().fill(d.value));

    return rectangles;
  };

  const getRectangleDimensions = () => {
    const { xDim: width, yDim: height } = state;
    const { length } = state.series;

    if (!width || !height) {
      switch (length) {
        case 96:
          return { width: 12, height: 8 };
        case 384:
          return { width: 24, height: 16 };
        case 1536:
          return { width: 48, height: 32 };
      }
    } else {
      return {
        xDim: width,
        yDim: height
      };
    }
  };

  useEffect(() => {
    if (!props.data || !d3Container.current) {
      return;
    }

    const svg = createSVG(d3Container.current);
    const xAxis = createXAxis(svg);
    const yAxis = createYAxis(svg);

    createRectangles(svg, xAxis, yAxis);
    setEventListeners();
    setSelectables();
  }, [props.data, d3Container.current]);

  return (
    <div className="grit42-plate-plot">
      <form>
        <select>
          <option>% Effect</option>
          <option>Compound</option>
          <option>Concentration</option>
          <option>Concentration Normalized</option>
          <option>Signal</option>
          <option>Singal without background % (delta F)</option>
          <option>Unit</option>
          <option>Well Layout</option>
        </select>
        <label htmlFor="show_heatmap">Show Heatmap</label>
        <input type="checkbox" name="show_heatmap" value="show_heatmap" />
        <select>
          <option>Linear</option>
          <option>Logarithmic</option>
        </select>
      </form>
      <svg className="grit42-plate-plot__svg" ref={d3Container} />
    </div>
  );
};
