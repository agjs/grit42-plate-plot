import * as d3 from "d3";
import DragSelect from "dragselect";
import React, { useRef, useEffect } from "react";

import "./style.css";

export default props => {
  const d3Container = useRef(null);
  const margin = { top: 30, right: 30, bottom: 30, left: 30 };
  const width = 450 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  const { data, yLabels, xLabels, onClick, onSelect } = props;

  const setSelectables = selectable =>
    new DragSelect({
      selectables: document.querySelectorAll(".grit42-plate-plot rect"),
      callback: data => {
        const selected = data.map(rect => ({
          ...rect.__data__,
          index: parseInt(rect.getAttribute("index"), 10)
        }));

        props.onSelect(selected);
      }
    });

  const setEventListeners = () => {};

  const createSVG = () => {
    return d3
      .select(d3Container.current)
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

  useEffect(() => {
    if (!props.data || !d3Container.current) {
      return;
    }

    const svg = createSVG();
    const xAxis = createXAxis(svg);
    const yAxis = createYAxis(svg);

    createRectangles(svg, xAxis, yAxis);
    setEventListeners();
    setSelectables();
  }, [props.data, d3Container.current]);

  return <svg className="grit42-plate-plot" ref={d3Container} />;
};
