import React, { useState, useEffect, useRef } from 'react';
import { render } from 'react-dom';
import * as d3 from 'd3';
import { KEY_CODES } from './components/plots/Plate/utils';
import './style.css';

import PlateView from './components/plots/Plate';
import { modifyBySelection } from './components/plots/Plate/utils';

import { DATA_SET_SERIES, parameters } from './dummy/index';

const App = () => {
  const [data, setData] = useState([]);
  const [selected, _setSelected] = useState([]);

  const selectedStateRef = React.useRef(selected);

  const setSelected = (data) => {
    selectedStateRef.current = data;
    _setSelected(data);
  };

  const onKeyDown = () => {
    switch (d3.event.keyCode) {
      case KEY_CODES.b:
        const selected = selectedStateRef.current;
        setData(
          modifyBySelection(data, selected, (element) => ({
            bogus: element.bogus ? 0 : 1,
          })),
        );
        return;
      default:
        return null;
    }
  };
  const onSelected = (items) => {
    if (!items.length) {
      return;
    }
    setSelected(items);
  };

  useEffect(() => {
    setTimeout(() => {
      setData(DATA_SET_SERIES);
    }, 1000);
  }, []);

  return (
    <div>
      <PlateView
        onSelect={onSelected}
        onKeyDown={onKeyDown}
        data={data}
        parameters={parameters}
        properties={[
          { name: '% Effect', value: 'effect', canDisplayHeatMap: false },
          { name: 'Compound', value: 'compound', canDisplayHeatMap: true },
          { name: 'Concentration', value: 'concentration', canDisplayHeatMap: true },
          {
            name: 'Concentration Normalized',
            value: 'concentration_normalized',
            canDisplayHeatMap: false,
          },
          {
            name: 'Signal',
            value: 'signal',
            canDisplayHeatMap: true,
          },
          {
            name: 'Singal without background % (delta F)',
            value: 'signal_wo_background',
            canDisplayHeatMap: true,
          },
          {
            name: 'Unit',
            value: 'unit',
            canDisplayHeatMap: false,
          },
          {
            name: 'Well Layout',
            value: 'welllayout',
            canDisplayHeatMap: true,
          },
        ]}
      />
    </div>
  );
};

render(<App />, document.getElementById('root'));
