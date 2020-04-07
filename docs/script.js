console.clear();

function App(props) {
  const appContainer = React.useRef();
  const [colors, setColors] = React.useState({
    text: '#ffffff',
    start: '#a1168d',
    end: '#06008e'
  });
  const [gradientArray, setGradientArray] = React.useState([]);

  const updateColors = (key, value) => {
    const newColors = { ...colors
    };
    newColors[key] = value;
    setColors(newColors);
    document.documentElement.style.setProperty(`--color-${key}`, value);
    updateFavicon();
  };

  const updateFavicon = () => {
    const favicon = document.querySelector('link[rel="icon"]');
    const svg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="200px" height="200px" viewBox="0 0 200 200" xml:space="preserve"><defs><linearGradient id="faviconGradient"><stop offset="-20%" stop-color="${colors.start}" /><stop offset="120%" stop-color="${colors.end}" /></linearGradient></defs><path d="M108.4,146.4L97.8,157c-5.9,5.9-15.4,5.9-21.2,0l-41.1-41.1c-5.9-5.9-5.9-15.4,0-21.2l0,0c5.9-5.9,15.4-5.9,21.2,0l30.5,30.5l89.4-89.4C158.2,13.9,130.7,0,100,0C44.8,0,0,44.8,0,100s44.8,100,100,100s100-44.8,100-100c0-13.4-2.6-26.2-7.4-37.9L108.4,146.4z" fill="url(#faviconGradient)"/></svg>`;
    const svgHref = `data:image/svg+xml;base64, ${btoa(svg)}`;
    favicon.setAttribute('href', svgHref);
  };

  return /*#__PURE__*/React.createElement("div", {
    ref: appContainer
  }, /*#__PURE__*/React.createElement("div", {
    class: "input-area"
  }, /*#__PURE__*/React.createElement(ColorInput, {
    updateColors: updateColors,
    color: colors.start,
    name: "start"
  }), /*#__PURE__*/React.createElement(ColorInput, {
    updateColors: updateColors,
    color: colors.text,
    name: "text"
  }), /*#__PURE__*/React.createElement(ColorInput, {
    updateColors: updateColors,
    color: colors.end,
    name: "end"
  }), /*#__PURE__*/React.createElement(ButtonPreview, {
    text: colors.text,
    start: colors.start,
    end: colors.end,
    setGradientArray: setGradientArray
  })), /*#__PURE__*/React.createElement(SwatchList, {
    gradientArray: gradientArray,
    textColor: colors.text
  }));
}

function ColorInput(props) {
  const [color, setColor] = React.useState(props.color);

  const handleInput = e => {
    const value = e.target.value;
    const color = tinycolor(value);
    setColor(value);

    if (color.isValid()) {
      props.updateColors(props.name, color.toHexString());
    }
  };

  const handleBlur = e => {
    const value = e.target.value;
    const color = tinycolor(value);

    if (color.isValid()) {
      setColor(color.toHexString());
    }

    if (!color.isValid()) {
      setColor(props.color);
    }
  };

  return /*#__PURE__*/React.createElement("div", {
    class: "color-input-card"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: props.name,
    class: "card-title"
  }, props.name), /*#__PURE__*/React.createElement("div", {
    class: "color-picker-wrap",
    style: {
      backgroundColor: color
    }
  }, /*#__PURE__*/React.createElement("input", {
    class: "color-picker-input",
    tabIndex: "-1",
    value: props.color,
    type: "color",
    onInput: handleInput
  })), /*#__PURE__*/React.createElement("input", {
    class: "color-value-input",
    type: "text",
    value: color,
    onInput: handleInput,
    onBlur: handleBlur,
    id: props.name
  }));
}

function ButtonPreview(props) {
  const [gradientWidth, setGradientWidth] = React.useState(100);
  const canvas = React.useRef();

  const createId = () => {
    return '_' + Math.random().toString(36).substr(2, 9);
  };

  const getAllGradientColors = e => {
    const ctx = canvas.current.getContext("2d");
    let gradientColors = [];

    for (let i = 0; i < gradientWidth; i++) {
      const {
        data
      } = ctx.getImageData(i, 0, 1, 1);
      const rgbString = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
      const colorObj = {
        id: createId(),
        value: tinycolor(rgbString).toHexString(),
        readability: tinycolor.readability(rgbString, props.text)
      };
      gradientColors.push(colorObj);
    }

    return gradientColors;
  };

  const drawGradient = () => {
    canvas.width = gradientWidth;
    canvas.height = 50;
    const ctx = canvas.current.getContext("2d");
    var gradient = ctx.createLinearGradient(0, 0, gradientWidth, 0);
    gradient.addColorStop(0, props.start);
    gradient.addColorStop(1, props.end);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, gradientWidth, 50);
  };

  React.useEffect(() => {
    drawGradient();
    props.setGradientArray(getAllGradientColors());
  }, [props.start, props.end, props.text]);
  return /*#__PURE__*/React.createElement("canvas", {
    ref: canvas,
    width: gradientWidth,
    height: "50"
  });
}

function SwatchList(props) {
  const {
    textColor
  } = props;
  const [sortByReadability, setSortByReadability] = React.useState(false);
  const {
    gradientArray
  } = props;
  const minContrastObj = gradientArray.reduce((prev, current) => prev.readability < current.readability ? prev : current, 0);
  const maxContrastObj = gradientArray.reduce((prev, current) => prev.readability > current.readability ? prev : current, 0);

  const sortedArray = colorArray => {
    if (sortByReadability) {
      return [...colorArray].sort((a, b) => a.readability - b.readability);
    } else {
      return colorArray;
    }
  };

  const textPreviewStyle = {
    color: textColor
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    class: "swatch-list"
  }, /*#__PURE__*/React.createElement("div", {
    class: "text-preview",
    style: textPreviewStyle
  }, "Text Preview"), sortedArray(props.gradientArray).map(color => /*#__PURE__*/React.createElement(Swatch, {
    color: color,
    isMaxContrast: color.id === maxContrastObj.id,
    isMinContrast: color.id === minContrastObj.id
  }))), /*#__PURE__*/React.createElement("div", {
    class: "swatch-list-options"
  }, /*#__PURE__*/React.createElement("button", {
    class: "button",
    onClick: () => setSortByReadability(!sortByReadability)
  }, sortByReadability ? 'Sort Naturally' : 'Sort by Contrast')), /*#__PURE__*/React.createElement("div", {
    class: "readability-report"
  }, /*#__PURE__*/React.createElement(WcagStatusIndicator, {
    level: "aa",
    size: "small",
    textColor: textColor,
    color: minContrastObj.value
  }), /*#__PURE__*/React.createElement(WcagStatusIndicator, {
    level: "aa",
    size: "large",
    textColor: textColor,
    color: minContrastObj.value
  }), /*#__PURE__*/React.createElement(WcagStatusIndicator, {
    level: "aaa",
    size: "small",
    textColor: textColor,
    color: minContrastObj.value
  }), /*#__PURE__*/React.createElement(WcagStatusIndicator, {
    level: "aaa",
    size: "large",
    textColor: textColor,
    color: minContrastObj.value
  })));
}

function Swatch(props) {
  const {
    isMinContrast,
    isMaxContrast
  } = props;
  const style = {
    backgroundColor: props.color.value
  };
  const statusClass = isMinContrast || isMaxContrast ? 'highlighted' : null;
  const classList = ['swatch', statusClass].join(" ");
  const {
    readability,
    value
  } = props.color;
  return /*#__PURE__*/React.createElement("div", {
    class: classList,
    style: style,
    tabIndex: "0"
  }, isMaxContrast && /*#__PURE__*/React.createElement("div", {
    class: "indicator max-value"
  }, /*#__PURE__*/React.createElement("div", null, readability.toFixed(2))), isMinContrast && /*#__PURE__*/React.createElement("div", {
    class: "indicator min-value"
  }, /*#__PURE__*/React.createElement("div", null, readability.toFixed(2))), /*#__PURE__*/React.createElement("div", {
    class: "tooltip"
  }, /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, value), /*#__PURE__*/React.createElement("li", null, readability.toFixed(2)))));
}

function WcagStatusIndicator(props) {
  const {
    passes,
    color,
    level,
    size,
    textColor
  } = props;
  const isReadable = tinycolor.isReadable(color, textColor, {
    size: size,
    level: level
  });
  const statusClass = isReadable ? 'success' : 'failure';
  const classList = ['status-indicator', statusClass].join(' ');
  return /*#__PURE__*/React.createElement("div", {
    class: "report-item"
  }, /*#__PURE__*/React.createElement("div", {
    class: classList
  }, isReadable && /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    height: "3   2",
    viewBox: "0 0 24 24",
    width: "32"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M0 0h24v24H0V0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M9 16.17L5.53 12.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L9 16.17z"
  })), !isReadable && /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    height: "32",
    viewBox: "0 0 24 24",
    width: "32"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M0 0h24v24H0V0z",
    fill: "none"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"
  }))), /*#__PURE__*/React.createElement("div", null, level), /*#__PURE__*/React.createElement("div", null, size));
}

ReactDOM.render( /*#__PURE__*/React.createElement(App, null), document.querySelector('#root'));