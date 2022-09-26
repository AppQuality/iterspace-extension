interface IDomNode {
  toString(): string;
  name: string;
  text: string;
  className: string;
  id: string;
  tagName: string;
  attributes: { [key: string]: string };
}

class DomNode implements IDomNode {
  constructor(private node: HTMLElement) {}

  toString() {
    const attributes = `${this.id} ${this.className} ${this.name}`.trim();
    return `<${this.node.tagName}${attributes ? ` ${attributes}` : ''}>${
      this.text
    }</${this.node.tagName}>`;
  }

  get name() {
    return typeof this.node.className === 'string'
      ? `class="${this.node.className}"`
      : '';
  }

  get text() {
    return this.node.innerText || '';
  }

  get className() {
    return this.node.name ? `name="${this.node.name}"` : '';
  }

  get id() {
    return this.node.id ? `id="${this.node.id}"` : '';
  }

  get tagName() {
    return this.node.tagName.toLowerCase();
  }

  get attributes() {
    const attributes: { [key: string]: string } = {};
    for (let i = 0; i < this.node.attributes.length; i++) {
      attributes[this.node.attributes[i].name] = this.node.attributes[i].value;
    }
    return attributes;
  }
}

export default DomNode;
