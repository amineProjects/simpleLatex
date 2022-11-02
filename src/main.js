import "./style.css";
import { parse, HtmlGenerator } from "latex.js";
import "../node_modules/latex.js/dist/css/katex.css";
import toolboxIcon from "./javascript.svg";

export default class SimpleLatex {
  static get toolbox() {
    return {
      title: "Latex",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="32" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path fill="#F7DF1E" d="M0 0h256v256H0V0Z"></path><path d="m67.312 213.932l19.59-11.856c3.78 6.701 7.218 12.371 15.465 12.371c7.905 0 12.89-3.092 12.89-15.12v-81.798h24.057v82.138c0 24.917-14.606 36.259-35.916 36.259c-19.245 0-30.416-9.967-36.087-21.996m85.07-2.576l19.588-11.341c5.157 8.421 11.859 14.607 23.715 14.607c9.969 0 16.325-4.984 16.325-11.858c0-8.248-6.53-11.17-17.528-15.98l-6.013-2.58c-17.357-7.387-28.87-16.667-28.87-36.257c0-18.044 13.747-31.792 35.228-31.792c15.294 0 26.292 5.328 34.196 19.247l-18.732 12.03c-4.125-7.389-8.591-10.31-15.465-10.31c-7.046 0-11.514 4.468-11.514 10.31c0 7.217 4.468 10.14 14.778 14.608l6.014 2.577c20.45 8.765 31.963 17.7 31.963 37.804c0 21.654-17.012 33.51-39.867 33.51c-22.339 0-36.774-10.654-43.819-24.574"></path></svg>`,
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
    const output = this.make("div", "output");
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
  updateView(ele) {
    const text = ele.firstChild.textContent;
    try {
      let generator = new HtmlGenerator({ hyphenate: false });
      let doc = parse(text, { generator }).domFragment();
      ele.replaceChild(doc, ele.lastChild);
    } catch (e) {
      console.log(e);
    }
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
    this._data = data?.text
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
