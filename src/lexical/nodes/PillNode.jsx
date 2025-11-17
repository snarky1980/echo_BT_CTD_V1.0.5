import { DecoratorNode } from 'lexical';
import React from 'react';
import PillComponent from '../PillComponent.jsx';

export class PillNode extends DecoratorNode {
  __name;
  __value;
  __isFilled;

  static getType() {
    return 'pill';
  }

  static clone(node) {
    return new PillNode(node.__name, node.__value, node.__isFilled, node.__key);
  }

  static importJSON(serializedNode) {
    const { name, value, isFilled } = serializedNode;
    return $createPillNode(name, value, isFilled);
  }

  exportJSON() {
    return {
      name: this.__name,
      value: this.__value,
      isFilled: this.__isFilled,
      type: 'pill',
      version: 1,
    };
  }

  constructor(name, value, isFilled, key) {
    super(key);
    this.__name = name;
    this.__value = value;
    this.__isFilled = isFilled;
  }

  getName() {
    return this.__name;
  }

  getValue() {
    return this.__value;
  }

  getIsFilled() {
    return this.__isFilled;
  }

  createDOM() {
    return document.createElement('span');
  }

  updateDOM() {
    return false;
  }

  getTextContent() {
    // Return the variable placeholder for text extraction
    return `<<${this.__name}>>`;
  }

  decorate() {
    return (
      <PillComponent
        name={this.__name}
        value={this.__value}
        isFilled={this.__isFilled}
      />
    );
  }
}

export function $createPillNode(name, value, isFilled) {
  return new PillNode(name, value, isFilled);
}

export function $isPillNode(node) {
  return node instanceof PillNode;
}
