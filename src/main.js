import "./style.css";
import { parse, HtmlGenerator } from "latex.js";
import "../../latex.js/dist/css/katex.css";
import toolboxIcon from "./Latex_logo.svg?raw";

export default class SimpleLatex {
  static get toolbox() {
    return {
      title: "Latex",
      icon: toolboxIcon,
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
      console.log("in update", generator.stylesAndScripts(""));

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
