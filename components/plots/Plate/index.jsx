import * as d3 from "d3";
import DragSelect from "dragselect";
import React, { useRef, useEffect, useState } from "react";

import {
  createLabels,
  addZeroPad,
  yToWell,
  wellToX,
  wellToY,
  COLORS
} from "./utils";

import "./style.css";

import { DATA_SET_SERIES } from "../../../dummy";

export default props => {
  const d3Container = useRef(null);

  const [state, setState] = useState({
    series: DATA_SET_SERIES,
    heatMap: false,
    showTextInCell: true,
    scientific: false,
    subBlank: false,
    heatMapMode: "linear",
    highLightParam: "welllayout__name",
    selectedParam: "normalized_read",
    valueMode: "ordinal",
    selectedItems: [],
    params: {
      // those most probably should be passed as props
      // as they most likely determine which features should be enabled
      // in a plate plot
      plateParam: "plate",
      wellParam: "well",
      layoutParam: "welllayout",
      concentrationParam: "concentration",
      bogusParam: "bogus"
    }
  });

  const { plotData, yLabels, xLabels, onClick, onSelect } = props;

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
      .domain(getXLabels())
      .padding(0.01);

    svg
      .append("g")
      .call(d3.axisTop(xAxis))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll("line").remove());

    return xAxis;
  };

  const createYAxis = svg => {
    const yAxis = d3
      .scaleBand()
      .range([0, height])
      .domain(getYLabels())
      .padding(0.01);

    svg
      .append("g")
      .call(d3.axisLeft(yAxis))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll("line").remove());

    return yAxis;
  };

  const getXLabels = () => {
    return createLabels(
      props.xLabels,
      getRectangleDimensions().width,
      addZeroPad
    );
  };

  const getYLabels = () => {
    return createLabels(
      props.yLabels,
      getRectangleDimensions().height,
      yToWell
    );
  };

  const heatmapColour = d3 // TODO
    .scaleLinear()
    .domain(d3.range(0, 1, 1.0 / (COLORS.heat.length - 1)))
    .range(COLORS.heat);

  const getRectangleColors = d => {
    const { bogusParam, layoutParam } = state.params;
    if (d[bogusParam] == 1) {
      return COLORS.bogus;
    } else {
      if (state.heatMap && state.valueMode === "numeric") {
        // TODO
        return heatmapColour(heatColors(d[selectedParam]));
      } else {
        if (COLORS.named[d[`${layoutParam}__name`]]) {
          return COLORS.named[d[`${layoutParam}__name`]]["bg"];
        } else {
          return COLORS.named["blank"]["bg"];
        }
      }
    }
  };

  const createRectangles = (svg, xAxis, yAxis) => {
    const attributes = {
      index: (d, i) => i,
      x: d => {
        return xAxis(d.well.substr(1)); // TODO
      },
      y: d => {
        return yAxis(d.well.charAt(0)); // TODO
      },
      rx: 4,
      ry: 4,
      width: xAxis.bandwidth(),
      height: yAxis.bandwidth()
    };

    const styles = {
      fill: d => getRectangleColors(d)
    };

    const rectangles = svg
      .selectAll()
      .data(state.series)
      .enter()
      .append("rect");

    Object.keys(attributes).forEach(attributeName =>
      rectangles.attr(attributeName, attributes[attributeName])
    );

    Object.keys(styles).forEach(styleName =>
      rectangles.style(styleName, styles[styleName])
    );

    rectangles.text(d => d[state.params["wellParam"]]);

    return rectangles;
  };

  const getRectangleDimensions = () => {
    const { rectWidth, rectHeight } = props;
    if (!rectWidth || !rectHeight) {
      switch (state.series.length) {
        case 96:
          return { width: 12, height: 8 };
        case 384:
          return { width: 24, height: 16 };
        case 1536:
          return { width: 48, height: 32 };
        default:
          return { width: 12, height: 8 };
      }
    } else {
      return { width: rectWidth, height: rectHeight };
    }
  };

  useEffect(() => {
    if (!props.plotData || !d3Container.current) {
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
