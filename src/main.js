import katex from "katex";

import "./style.css";

export default class SimpleLatex {
  static get toolbox() {
    return {
      title: "Latex",
      icon: `<svg height="20" width="20" viewBox="400 -300 500 1200" xmlns="http://www.w3.org/2000/svg">
      <path d="m5.46 4.23h-.25c-.1 1.02-.24 2.26-2 2.26h-.81c-.47 0-.49-.07-.49-.4v-5.31c0-.34 0-.48.94-.48h.33v-.3c-.36.03-1.26.03-1.67.03-.39 0-1.17 0-1.51-.03v.3h.23c.77 0 .79.11.79.47v5.25c0 .36-.02.47-.79.47h-.23v.31h5.19z" transform="matrix(45 0 0 45 40 47.65)"></path>
      <path d="m2.81.16c-.04-.12-.06-.16-.19-.16s-.16.04-.2.16l-1.61 4.08c-.07.17-.19.48-.81.48v.25h1.55v-.25c-.31 0-.5-.14-.5-.34 0-.05.01-.07.03-.14 0 0 .34-.86.34-.86h1.98l.4 1.02c.02.04.04.09.04.12 0 .2-.38.2-.57.2v.25h1.97v-.25h-.14c-.47 0-.52-.07-.59-.27 0 0-1.7-4.29-1.7-4.29zm-.4.71.89 2.26h-1.78z" transform="matrix(45 0 0 45 151.6 40)"></path>
      <path d="m6.27 0h-6.09s-.18 2.24-.18 2.24h.24c.14-1.61.29-1.94 1.8-1.94.18 0 .44 0 .54.02.21.04.21.15.21.38v5.25c0 .34 0 .48-1.05.48h-.4v.31c.41-.03 1.42-.03 1.88-.03s1.49 0 1.9.03v-.31h-.4c-1.05 0-1.05-.14-1.05-.48v-5.25c0-.2 0-.34.18-.38.11-.02.38-.02.57-.02 1.5 0 1.65.33 1.79 1.94h.25s-.19-2.24-.19-2.24z" transform="matrix(45 0 0 45 356.35 50.35)"></path>
      <path d="m6.16 4.2h-.25c-.25 1.53-.48 2.26-2.19 2.26h-1.32c-.47 0-.49-.07-.49-.4v-2.66h.89c.97 0 1.08.32 1.08 1.17h.25v-2.64h-.25c0 .85-.11 1.16-1.08 1.16h-.89v-2.39c0-.33.02-.4.49-.4h1.28c1.53 0 1.79.55 1.95 1.94h.25l-.28-2.24h-5.6v.3h.23c.77 0 .79.11.79.47v5.22c0 .36-.02.47-.79.47h-.23v.31h5.74z" transform="matrix(45 0 0 45 602.5 150.25)"></path>
      <path d="m3.76 2.95 1.37-2c.21-.32.55-.64 1.44-.65v-.3h-2.38v.3c.4.01.62.23.62.46 0 .1-.02.12-.09.23 0 0-1.14 1.68-1.14 1.68l-1.28-1.92c-.02-.03-.07-.11-.07-.15 0-.12.22-.29.64-.3v-.3c-.34.03-1.07.03-1.45.03-.31 0-.93-.01-1.3-.03v.3h.19c.55 0 .74.07.93.35 0 0 1.83 2.77 1.83 2.77l-1.63 2.41c-.14.2-.44.66-1.44.66v.31h2.38v-.31c-.46-.01-.63-.28-.63-.46 0-.09.03-.13.1-.24l1.41-2.09 1.58 2.38c.02.04.05.08.05.11 0 .12-.22.29-.65.3v.31c.35-.03 1.08-.03 1.45-.03.42 0 .88.01 1.3.03v-.31h-.19c-.52 0-.73-.05-.94-.36 0 0-2.1-3.18-2.1-3.18z" transform="matrix(45 0 0 45 845.95 47.65)"></path>
     </svg>`,
    };
  }

  static get enableLineBreaks() {
    return true;
  }

  static get isReadOnlySupported() {
    return true;
  }

  constructor({ data, readOnly, config }) {
    this.readOnly = readOnly;
    if (!this.readOnly) {
      this.onKeyUp = this.onKeyUp.bind(this);
      this.showInput = this.showInput.bind(this);
      this.hideInput = this.hideInput.bind(this);
    }
    this._data = {
      text: "",
    };
    this.data = data;
    this._element = this.drawView(this.data.text);
  }
  drawView(text) {
    const container = this.make(
      "div",
      "container",
      {},
      { click: this.showInput }
    );
    const output = this.make("div", ["output", "ce-paragraph"]);
    const input = this.make(
      "div",
      ["input", `input__${this.readOnly ? "hide" : "show"}`],
      {},
      { keyup: this.onKeyUp, blur: this.hideInput }
    );

    input.textContent = text;
    input.contentEditable = true;

    container.appendChild(input);
    container.appendChild(output);

    return this.updateView(container);
  }
  parse(str) {
    const arr = str.match(/\$[^\$]+\$/g);
    if (arr) {
      return arr.reduce((acc, value) => {
        return acc.replace(
          value,
          katex.renderToString(value.replaceAll("$", ""))
        );
      }, str);
    }
    return str;
  }
  updateView(ele) {
    const text = ele.firstChild.textContent;
    ele.lastChild.innerHTML = this.parse(text);
    return ele;
  }
  onKeyUp(e) {
    const { textContent } = this._element.firstChild;

    this.updateView(this._element);

    if (e.code !== "Backspace" && e.code !== "Delete") {
      return;
    }

    if (textContent === "") {
      this._element.firstChild.innerHTML = "";
    }
  }

  showInput(e) {
    if (this.readOnly) {
      return;
    }
    const input = this._element.firstChild;
    input.classList.add("input__show");
    input.classList.remove("input__hide");
    input.focus();
  }
  hideInput(e) {
    const input = this._element.firstChild;
    input.classList.remove("input__show");
    input.classList.add("input__hide");
  }

  render() {
    return this._element;
  }

  get data() {
    return this._data;
  }

  set data(data) {
    this._data = data.text
      ? data
      : {
          text: "",
        };
  }

  save() {
    return {
      text: this._element.firstChild.textContent,
    };
  }

  make(tagName, classNames = null, attributes = {}, events = {}) {
    const el = document.createElement(tagName);

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames);
    } else if (classNames) {
      el.classList.add(classNames);
    }

    for (const attrName in attributes) {
      el[attrName] = attributes[attrName];
    }
    for (const eventName in events) {
      el.addEventListener(eventName, events[eventName]);
    }

    return el;
  }
}
