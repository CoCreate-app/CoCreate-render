/********************************************************************************
 * Copyright (C) 2023 CoCreate and Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ********************************************************************************/

// Commercial Licensing Information:
// For commercial use of this software without the copyleft provisions of the AGPLv3,
// you must obtain a commercial license from CoCreate LLC.
// For details, visit <https://cocreate.app/licenses/> or contact us at sales@cocreate.app.

/*globals CustomEvent*/
import Actions from "@cocreate/actions";
import Observer from "@cocreate/observer";
import uuid from "@cocreate/uuid";
import {
	queryElements,
	getValueFromObject,
	dotNotationToObject,
	ObjectId
} from "@cocreate/utils";
import "@cocreate/element-prototype";
import "./index.css";

const sources = new Map();
const renderedNodes = new Map();
const elementSelector =
	"[render-selector], [render-closest], [render-parent], [render-next], [render-previous]";

/**
 * Initializes elements based on specified rendering attributes. If a specific element is provided, it initializes that element.
 * If no element is provided, it queries and initializes all elements matching the defined selector criteria for rendering attributes.
 *
 * Supported rendering attributes:
 * - render-selector: [Describe what this attribute does]
 * - render-closest: [Describe what this attribute does]
 * - render-parent: [Describe what this attribute does]
 * - render-next: [Describe what this attribute does]
 * - render-previous: [Describe what this attribute does]
 *
 * @param {(Element|Element[]|HTMLCollection|null)} [element] - Optional. A single element, an array of elements, an HTMLCollection, or null.
 *     - If an HTMLCollection or an array of elements is provided, each element in the collection/array is initialized.
 *     - If a single element is provided, only that element is initialized.
 *     - If null or omitted, the function queries and initializes all elements matching the 'elementSelector'.
 */
function init(element) {
	if (
		element &&
		!(element instanceof HTMLCollection) &&
		!Array.isArray(element)
	)
		element = [element];
	else if (!element) element = document.querySelectorAll(elementSelector);

	for (let i = 0; i < element.length; i++) {
		let source = sources.get(element[i]);
		if (!source) {
			sources.set(element[i], { element: element[i] });
			element[i].renderValue = async (data) =>
				await render({ source: element[i], data });
			element[i].getData = () => sources.get(element[i]).data;
		}
	}
}

/**
 * Asynchronously renders content based on the provided parameters. This function handles the rendering logic for elements
 * based on data sources, selectors, and other options.
 *
 * @param {Object} options - An object containing the parameters for rendering.
 * @param {Object} options.source - The data source used for rendering.
 * @param {Element} options.element - The DOM element where content will be rendered.
 * @param {string} options.selector - CSS selector to specify target elements for rendering.
 * @param {Object} options.data - Data to be used in rendering.
 * @param {string} [options.key] - Optional key to reference specific parts of the data.
 * @param {number} [options.index] - Optional index, typically used when rendering lists or arrays.
 * @param {number} [options.currentIndex] - The current index in a list or array rendering process.
 * @param {boolean} [options.update] - Flag to indicate if the rendering should update existing content.
 * @param {boolean} [options.remove] - Flag to indicate if the rendering should remove elements instead of updating or appending.
 */
async function render({
	source,
	element,
	selector,
	data,
	key,
	index,
	currentIndex,
	update,
	remove
}) {
	let Data = { ...data };
	if (!element) {
		if (source) {
			element = queryElements({ element: source, prefix: "render" });
			if (!element && source.children.length > 0) {
				for (const child of source.children) {
					if (
						child.matches(
							"template, [template], .template, [render]"
						)
					) {
						element = child;
						break; // Found the desired element, no need to continue the loop
					}
				}
			}

			if (!element) {
				element = source.querySelector(
					"template, [template], .template, [render]"
				);
			}
		} else if (selector) element = queryElements({ selector });

		if (!element) return;
	}

	if (source) {
		if (!key) {
			key = source.getAttribute("render") || source.getAttribute("key");
			if (!key) {
				key = data.type;
				if (key == "key") key = "object";
				else if (!key && data.method) key = data.method.split(".")[0];
				else if (!key) return;
			} else if (key == "{}") key = "object";
		}
		let sourceData = sources.get(source);
		if (!sourceData) {
			sourceData = { element: source, Data };
			sources.set(source, sourceData);
		}

		source = sourceData;
		if (!source.data) source.data = Data;
	} else if (data) source = { Data };

	if (data.$filter) {
		index = index || data.$filter.startingIndex || data.$filter.index;
		update = update || data.$filter.update;
		remove = remove || data.$filter.remove;
	}

	if (
		!Array.isArray(element) &&
		!(element instanceof HTMLCollection) &&
		!(element instanceof NodeList)
	)
		element = [element];

	for (let i = 0; i < element.length; i++) {
		key = element[i].getAttribute("render") || key;

		let renderedNode = renderedNodes.get(element[i]);
		if (
			renderedNode &&
			renderedNode.clones &&
			renderedNode.source &&
			renderedNode.source.element
		) {
			let limit =
				renderedNode.source.element.getAttribute("render-limit");
			if (limit && renderedNode.clones.size >= parseInt(limit)) continue;
		}

		if (source) {
			if (!renderedNode) {
				renderedNode = {
					element: element[i],
					source,
					clones: new Map(),
					renderAs: new Map()
				};
				renderedNodes.set(element[i], renderedNode);
			}
		}

		if (remove) {
			for (let j = 0; j < data[key].length; j++) {
				let cloneKey;
				if (key === "object") {
					cloneKey = data[key][j]._id;
				} else {
					cloneKey = data[key][j].name;
				}

				let clone = renderedNode.clones.get(cloneKey);
				if (!clone) return;

				renderedNode.clones.delete(cloneKey);
				renderedNodes.delete(clone);
				clone.remove();
			}
		} else if ((key && Array.isArray(data[key])) || Array.isArray(data)) {
			if (update) {
				for (let j = 0; j < data[key].length; j++) {
					let clone;
					if (key === "object") {
						clone = renderedNode.clones.get(data[key][j]._id);
					} else {
						clone = renderedNode.clones.get(data[key][j].name);
					}

					if (!currentIndex) currentIndex = data.$filter.currentIndex;

					if (!clone) return;

					await renderValues(clone, { object: data[key][j] });
					if (currentIndex >= 0)
						insertElement(renderedNode, clone, index, currentIndex);
				}
			} else {
				// TODO: if $auto here every subsequent clone will have same value, not replacing here will apply unique value to each clone
				if (key === "$auto")
					key = key.replace(/\$auto/g, uuid.generate(6));

				if (key) element[i].setAttribute("render", key);

				await renderTemplate(element[i], data, key, index);
			}
		} else {
			let renderAs = element[i].getAttribute("render-as") || key;
			await renderValues(element[i], data, key, renderAs);
		}
	}
}

async function renderTemplate(template, data, key, index, keyPath) {
	// if (!key)
	//     key = template.getAttribute('render')

	let templateData = renderedNodes.get(template);
	if (!templateData) {
		templateData = { element: template, clones: new Map() };
		renderedNodes.set(template, templateData);
	}

	templateData.parent = template.parentElement.closest("[render]");
	if (templateData.parent)
		templateData.parent = renderedNodes.get(templateData.parent);

	if (!templateData.keyPath) {
		if (keyPath) templateData.keyPath = keyPath;
		else if (templateData.parent && templateData.parent.keyPath)
			templateData.keyPath = templateData.parent.keyPath;
		else if (key) templateData.keyPath = key;
	}

	template = templateData;

	let renderData;
	if (key) renderData = getRenderValue(template.element, data, key);
	else if (Array.isArray(data)) renderData = data;

	if (!renderData && data)
		if (Array.isArray(data)) renderData = data;
		else renderData = [data];
	else if (!renderData) return;

	let isInsert = data.$filter && (data.$filter.create || data.$filter.update);
	if ((!isInsert && !index) || data.$filter.overwrite) {
		if (!template.clones) template = template.template;
		for (const [key, element] of template.clones) {
			renderedNodes.delete(element);
			element.remove();
			template.clones.delete(key);
		}
		// if (renderedNodes.size) {
		//     for (let [element] of renderedNodes) {
		//         element.remove()
		//     }
		//     renderedNodes.clear();
		// }

		// template.data = renderData
	}
	// else if (index) {
	// updates data that has already been rendered
	// template.data = dotNotationToObject(renderData, template.data)
	// }

	let renderAs = template.element.getAttribute("render-as") || key;
	template.renderAs = renderAs;

	let renderType;
	if (templateData.source && templateData.source.element)
		renderType = templateData.source.element.getAttribute("render-type");

	let renderReverse;
	if (templateData.source && templateData.source.element) {
		renderReverse =
			templateData.source.element.getAttribute("render-reverse");
		if (!renderReverse)
			renderReverse = template.element.getAttribute("render-reverse");
	}

	let exclude = template.element.getAttribute("render-exclude") || "";
	if (exclude) {
		exclude = exclude.replace(/ /g, "").split(",");
	}
	let reference = template.element.getAttribute("render-reference");

	if ((key && !Array.isArray(renderData)) || renderType === "object") {
		if (renderType && Array.isArray(renderData) && renderData.length === 1)
			renderData = renderData[0];

		const keys = Object.keys(renderData);
		for (let i = 0; i < keys.length; i++) {
			if (exclude.includes(keys[i])) continue;
			if (
				reference === "false" &&
				["$storage", "$database", "$array"].includes(key)
			)
				continue;

			let value = renderData[keys[i]];
			let type = "string";

			if (Array.isArray(value)) type = "array";
			else if (typeof value == "object") type = "object";

			let Data = { [renderAs]: { key: keys[i], value, type } };

			let clone = cloneTemplate(template);
			let renderedKey = key.split(".");
			renderedKey = renderedKey[renderedKey.length - 1];
			//renderedKey needs to remove the parent.renderAs/key

			clone.key = keys[i];
			clone.keyPath = template.keyPath + "." + renderedKey;
			clone.parentKey = renderedKey;
			clone.renderKey = key;
			clone.element.setAttribute("renderedKey", keys[i]);
			await renderValues(clone.element, Data, keys[i], renderAs);
			insertElement(template, clone.element, index);
		}
	} else {
		if (!key && !Array.isArray(renderData)) {
			key = "data";
			renderData = getValueFromObject(renderData, key);
			if (!renderAs) renderAs = key;
		}

		if (!renderData) {
			let clone = cloneTemplate(template);
			clone.keyPath = template.keyPath;
			await renderValues(clone.element, data, key, renderAs);
			insertElement(template, clone.element, index);
		} else {
			if (!Array.isArray(renderData)) renderData = [renderData];

			for (let i = 0; i < renderData.length; i++) {
				let clone = cloneTemplate(template);

				let test = clone.element.getAttribute("render-as");
				if (test) renderAs = test;

				clone.keyPath = template.keyPath || "" + `[${i}]`;

				let object = { ...renderData[i] };
				for (let j = 0; j < exclude.length; j++)
					delete object[exclude[j]];

				if (reference === "false") {
					delete object.$storage;
					delete object.$database;
					delete object.$array;
				}

				if (renderAs) {
					object = { [renderAs]: object };
					if (renderAs.includes("."))
						object = dotNotationToObject(object);
				} else object = object;

				let index;
				if (key !== "data") index = i;
				await renderValues(
					clone.element,
					object,
					key,
					renderAs,
					null,
					null,
					index
				);
				insertElement(
					template,
					clone.element,
					index,
					"",
					data,
					renderReverse
				);
			}
		}
	}
}

function cloneTemplate(template) {
	let clone = template.element.cloneNode(true);
	let cloneTagName = clone.tagName;

	if (clone.tagName == "TEMPLATE") {
		clone = template.element.content.firstElementChild;
		for (let attribute of template.element.attributes) {
			clone.setAttribute(attribute.name, attribute.value || "");
		}
	} else {
		clone.classList.remove("template");
		clone.removeAttribute("template");
	}

	clone.setAttribute("render-clone", "");

	let renderAs = clone.getAttribute("render-as");
	if (renderAs === "$auto") {
		renderAs = uuid.generate(6);
		clone = clone.outerHTML.replace(/\$auto/g, renderAs);
	}

	if (typeof clone === "string") {
		// TODO: Some elements are only allowed a specific element, need to find these elements and confirm proper rendering.
		let container;
		if (cloneTagName === "TR") container = document.createElement("tbody");
		else container = document.createElement("div");

		container.innerHTML = clone;
		clone = container.firstChild;
		container.remove();
	}
	let renderedNode = { template, element: clone };
	renderedNodes.set(clone, renderedNode);
	return renderedNode;
}

function insertElement(
	template,
	element,
	index,
	currentIndex,
	data,
	renderReverse
) {
	let eid = element.getAttribute("eid");
	if (!eid) {
		eid = uuid.generate(6);
		element.setAttribute("eid", eid);
	}

	if (index !== null && index >= 0) {
		if (!template.clones) template = template.template;
		// const clones = Array.from(template.clones);

		let item;
		if (!currentIndex && currentIndex !== 0) {
			if (template.clones.has(eid)) return;
			item = [eid, element];
		}

		const clones = Array.from(template.clones);

		if (currentIndex || currentIndex === 0) {
			item = clones.splice(currentIndex, 1)[0];
		}

		if (data && data.$filter && data.$filter.startingIndex)
			index += data.$filter.startingIndex;
		clones.splice(index, 0, item); // Insert item into clones at the specified index

		if (renderReverse) {
			// Chat-specific logic: reverse rendering but still inserting based on sorting

			// If we're rendering in reverse order, we want to respect the insertion index
			if (clones[index + 1] && clones[index + 1][1] !== element) {
				// Insert before the next element (reverse order means newer items come before older ones)
				clones[index + 1][1].insertAdjacentElement("afterend", element);
			} else if (clones[index] && clones[index][1] !== element) {
				// Insert after the current element if there's no next element
				clones[index][1].insertAdjacentElement("beforeend", element);
			} else {
				// Fallback: insert before the template if clones are empty or undefined
				template.element.insertAdjacentElement("afterend", element);
			}
		} else {
			// Non-chat logic: handle ascending or descending order as usual
			if (clones[index + 1] && clones[index + 1][1] !== element) {
				// Insert before the next element
				clones[index + 1][1].insertAdjacentElement(
					"beforebegin",
					element
				);
			} else if (clones[index] && clones[index][1] !== element) {
				// Insert after the current element if there's no next element
				clones[index][1].insertAdjacentElement("afterend", element);
			} else {
				// Fallback: insert before the template if clones are empty or undefined
				template.element.insertAdjacentElement("beforebegin", element);
			}
		}

		template.clones = new Map(clones);
	} else {
		template.clones.set(eid, element);
		template.element.insertAdjacentElement("beforebegin", element);
	}
}

async function renderValues(node, data, key, renderAs, keyPath, parent, index) {
	if (!data) return;

	let renderedNode = renderedNodes.get(node);
	if (!renderedNode) renderedNode = { key, renderAs };

	if (!renderedNode.key) renderedNode.key = key;
	else if (!key) key = renderedNode.key;

	if (!renderedNode.renderAs) renderedNode.renderAs = renderAs;
	else if (!renderAs) renderAs = renderedNode.renderAs;

	if (keyPath) renderedNode.keyPath = keyPath;
	else if (renderedNode.keyPath) keyPath = renderedNode.keyPath;

	if (parent) renderedNode.parent = parent;

	if (node.nodeType == 1) {
		if (node.hasAttribute("render-clone")) {
			parent = renderedNode;

			for (let eid of ["_id", "name", "key"]) {
				if (renderAs) eid = data[renderAs][eid];
				else eid = data[eid];

				if (!eid) continue;

				let oldEid = renderedNode.eid;
				let temp = renderedNode.template;
				if (!temp) {
					console.log("temp could not be found");
				} else if (!temp.clones) {
					if (temp.template) temp = temp.template;
					else console.log(temp);

					if (oldEid && oldEid !== eid) temp.clones.delete(oldEid);

					temp.clones.set(eid, node);
				}

				renderedNode.eid = eid;

				node.setAttribute("eid", eid);
				break;
			}
		}

		// Array.from(node.attributes).forEach(attr => {
		for (let attr of node.attributes) {
			let name = attr.name;
			let value = attr.value;

			let renderedAttribute = renderedNodes.get(attr);
			if (!renderedAttribute) {
				renderedAttribute = {
					placeholder: { name, value },
					key,
					renderAs,
					parent: renderedNode
				};
			}

			let namePlaceholder = renderedAttribute.placeholder.name || name;
			let valuePlaceholder = renderedAttribute.placeholder.value || value;

			name = await renderValue(
				attr,
				data,
				namePlaceholder,
				renderAs,
				renderedAttribute,
				index
			);
			value = await renderValue(
				attr,
				data,
				valuePlaceholder,
				renderAs,
				renderedAttribute,
				index
			);
			if (namePlaceholder.includes("{{") && name) {
				const attributes = name.match(/([^\s]+="[^"]*"|[^\s]+)/g) || [];
				attributes.forEach((attr) => {
					let [attributeName, attributeValue] = attr.split("=");
					attributeValue = attributeValue
						? attributeValue.replace(/"/g, "")
						: "";
					node.setAttribute(attributeName, attributeValue);
				});
			} else if (name === undefined || name === null || name === "") {
				renderedNodes.delete(attr);
				node.removeAttribute(attr.name);
			} else if (
				name &&
				(value || value === "") &&
				(name !== attr.name || value !== attr.value)
			)
				node.setAttribute(name, value);
		}
		// });

		if (CoCreate.state) {
			if (node.hasAttribute("[state_id]"))
				CoCreate.state.initElement(node);
		}

		if (node.tagName === "SCRIPT" && node.src) {
			if (
				node.src.includes("CoCreate.js") ||
				node.src.includes("CoCreate.min.js")
			) {
				node.remove();
				return;
			}
		}

		if (node.tagName === "LINK" && node.href) {
			if (
				node.href.includes("CoCreate.css") ||
				node.href.includes("CoCreate.min.css")
			) {
				node.remove();
				return;
			}
		}
		if (node.getAttribute("render") && !node.hasAttribute("render-clone")) {
			renderTemplate(node, data);
		} else if (node.childNodes.length > 0) {
			// Array.from(node.childNodes).forEach(childNode => {
			for (let childNode of node.childNodes) {
				await renderValues(
					childNode,
					data,
					key,
					renderAs,
					keyPath,
					parent,
					index
				);
			}
			// });
		}
	} else if (node.nodeType == 3) {
		let valueType = node.parentElement.getAttribute("value-type");

		let textContent, text;

		if (!renderedNode.placeholder && node.textContent.match(/{{(.*?)}}/))
			renderedNode.placeholder = node.textContent;

		if (!renderedNode.placeholder) return;
		textContent = renderedNode.placeholder || node.textContent;

		text = await renderValue(
			node,
			data,
			textContent,
			renderAs,
			renderedNode,
			index
		);

		if (text || text == "") {
			if (text != renderedNode.text) {
				renderedNode.text = text;

				if (
					valueType == "text" ||
					valueType == "string" ||
					valueType != "html"
				) {
					node.textContent = text;
				} else {
					const newNode = document.createElement("div");
					newNode.innerHTML = text;
					let parentElement = node.parentElement;

					let renderedParent = renderedNodes.get(parentElement);
					if (!renderedParent) {
						renderedParent = {
							placeholder: textContent,
							key,
							renderAs
						};
					}
					renderedParent.text = text;
					for (let newChild of newNode.childNodes) {
						renderedNode.element = newChild;
						renderedNodes.set(newChild, renderedNode);
					}
					renderedNodes.delete(node);
					node.replaceWith(...newNode.childNodes);
				}

				if (node.childNodes.length > 0) {
					// Array.from(node.childNodes).forEach(childNode => {
					for (let childNode of node.childNodes) {
						await renderValues(
							childNode,
							data,
							key,
							renderAs,
							keyPath,
							parent,
							index
						);
					}
					// });
				}
			}
		}
	}
}

async function renderValue(
	node,
	data,
	placeholder,
	renderAs,
	renderedNode,
	index
) {
	let output = placeholder;

	// Updated regex to match {{ }}, {[ ]}, {( )}
	let regex = /\{\{([^{}]+?)\}\}|\{\[([^{}\[\]]+?)\]\}|\{\(([^{}()]+?)\)\}/;
	let omitted = {};

	let match;
	do {
		match = output.match(regex);
		if (match) {
			let value;
			let placeholderContent;
			let placeholderType;

			try {
				// Initialize placeholderContent and placeholderType for each match
				if (match[1] !== undefined) {
					// Matched {{ }}
					placeholderContent = match[1];
					placeholderType = "doubleCurly";
				} else if (match[2] !== undefined) {
					// Matched {[ ]}
					placeholderContent = match[2];
					placeholderType = "squareBrackets";
				} else if (match[3] !== undefined) {
					// Matched {( )}
					placeholderContent = match[3];
					placeholderType = "parentheses";
				}

				// Process based on the placeholder type
				if (placeholderContent === "index" && index >= 0) {
					// Handle {{index}} - index
					value = index;
				} else if (placeholderType === "squareBrackets") {
					// {[ ]} - Dot-notation
					value = getRenderValue(
						node,
						data,
						placeholderContent,
						renderAs
					);
				} else if (placeholderType === "parentheses") {
					// If using JSON Structure:
					try {
						let Data = JSON.parse(
							placeholderContent.replace(/'/g, '"')
						);
						if (
							Data.storage ||
							Data.database ||
							Data.array ||
							Data.object ||
							Data.index
						) {
							Data.method = "object.read";
							let response = await CoCreate.crud.send(Data);
							value = response.object[0][Data.key];
						}
					} catch (error) {
						// If parsing fails, you can handle it as needed
						// {( )} - CSS Selector and JSON Structure
						// For CSS Selector handling, implement your logic here
						// Example:

						let valueElement = queryElements({
							selector: placeholderContent
						});
						if (valueElement && valueElement[0])
							value = valueElement[0].getValue();

						// For now, we'll omit the placeholder
						omitted[`<|${placeholderContent}|>`] = match[0];
					}
				} else if (placeholderType === "doubleCurly") {
					// {{ }} - Dot-notation and JSON Structure
					try {
						let Data = JSON.parse(
							placeholderContent.replace(/'/g, '"')
						);
						if (
							Data.storage ||
							Data.database ||
							Data.array ||
							Data.object ||
							Data.index
						) {
							Data.method = "object.read";
							let response = await CoCreate.crud.send(Data);
							value = response.object[0][Data.key];
						}
					} catch (error) {
						// Treat as dot-notation
						value = getRenderValue(
							node,
							data,
							placeholderContent,
							renderAs
						);
					}
				} else {
					// If none of the conditions match, store for omission
					omitted[`<|${placeholderContent}|>`] = match[0];
				}
			} catch (error) {
				console.error(error);
			}

			// Replace the placeholder with the resolved value
			if (value !== undefined && value !== null) {
				if (typeof value === "object") {
					value = JSON.stringify(value, null, 2);
				}
				output = output.replaceAll(match[0], value);
			} else if (renderAs) {
				if (match[0].startsWith(`{{${renderAs}.`)) {
					output = output.replaceAll(match[0], "");
				} else if (placeholderContent) {
					output = output.replaceAll(
						match[0],
						`<|${placeholderContent}|>`
					);
					omitted[`<|${placeholderContent}|>`] = match[0];
				}
			} else {
				// If no value is found and no renderAs, exit the loop
				match = null;
			}
		}
	} while (match);

	// Restore any omitted placeholders
	for (let key of Object.keys(omitted)) {
		output = output.replaceAll(key, omitted[key]);
	}

	return output;
}

function getRenderValue(node, data, key, renderAs) {
	// TODO: handle operators directly from render placholders
	// <span>{{ $toLocaleDateString.object.created.on }}</span>

	let operator;
	if (key.startsWith("$")) {
		let keys = key.split(".");
		operator = keys.shift();
		if (keys.length > 0) {
			key = keys.join(".");
		}
	}

	let value = getValueFromObject(data, key);

	if (!value && value !== "" && node) {
		let parentTemplate = node;
		do {
			let parentNode = renderedNodes.get(parentTemplate);
			if (parentNode) {
				if (!value && (parentNode.parent || parentNode.template)) {
					let Data,
						eid,
						parent = parentNode.parent || parentNode.template;
					do {
						if (key.includes("keyPath"))
							value = parentNode.keyPath || parent.keyPath;
						else if (key.includes("parentKey")) {
							value =
								parentNode.parentKey ||
								parent.parentKey ||
								parent.parent.parentKey;
						} else if (key.includes("renderAs")) {
							value = renderAs;
						} else if (key === "object" || key === "_id")
							value = ObjectId().toString();
						else if (key === "uuid") value = uuid.generate(6);
						else if (parent.source) Data = parent.source.data;
						else if (parent.parent) parent = parent.parent;
						else if (parent.template) parent = parent.template;
						else parent = undefined;

						if (!Data && parent && parent.eid) eid = parent.eid;
					} while (!value && parent && !Data);

					if (!value && Data) value = getValueFromObject(Data, key);

					if (!value && key.includes(".")) {
						let renderedData = getValueFromObject(
							Data,
							key.split(".")[0]
						);
						if (renderedData) {
							let index;
							if (!parent.clones.size || parent.clones.size === 1)
								index = 0;
							else if (eid)
								index = Array.from(
									parent.clones.keys()
								).indexOf(eid);
							else console.log("eid not found");

							if (index >= 0)
								Data = {
									[key.split(".")[0]]: renderedData[index]
								};

							value = getValueFromObject(Data, key);
						}
					}
				}
			}

			if (!value && parentTemplate.parentElement)
				parentTemplate =
					parentTemplate.parentElement.closest("[render]");
			else parentTemplate = undefined;
		} while (!value && parentTemplate);
	}

	if (operator) {
		if (value) {
			console.log("return processed render value using operator", value);
		} else {
			console.log("return render operator", operator);
		}
	}

	return value;
}

async function renderKey(action) {
	// TODO: custom render-keys
	let element = action.element;
	let form = action.form || document;
	let params = action.params;

	if (!params) params = "render-key";

	let data = {};
	let selector = `[${params}]`;
	let elements = form.querySelectorAll(selector);
	for (let el of elements) {
		let attribute = el.getAttribute(params);
		if (attribute) data[attribute] = await el.getValue();
	}
	data = dotNotationToObject(data);
	let renderData = { data: { [params]: data } };

	let renderSelector = element.getAttribute("render-selector");
	if (!renderSelector) return;

	renderData.selector = renderSelector;
	render(renderData);

	document.dispatchEvent(
		new CustomEvent("renderKey", {
			detail: { data }
		})
	);
}

Actions.init({
	name: "renderKey",
	callback: (action) => {
		renderKey(action);
	}
});

Actions.init({
	name: "render",
	callback: async (action) => {
		if (!action.form) return;

		let elements;
		if (action.params)
			elements = queryElements({
				element: action.element,
				selector: action.params,
				type: "selector"
			});
		else
			elements = queryElements({
				element: action.element,
				prefix: "render"
			});

		// TODO: data returned from form.getData() returns an array of objects each representing an storage, database and array in form. need a solution for handling what is the item to be rendered
		let data = await action.form.getData();
		let array = action.form.getAttribute("array");
		if (array) data = data.find((obj) => obj.array === array);
		for (let i = 0; i < elements.length; i++)
			await render({ source: elements[i], data });

		document.dispatchEvent(
			new CustomEvent("render", {
				detail: {}
			})
		);
	}
});

Observer.init({
	name: "render",
	observe: ["addedNodes"],
	selector: elementSelector,
	callback: function (mutation) {
		init(mutation.target);
	}
});

Observer.init({
	name: "fileRender",
	observe: ["attributes"],
	attributeName: [
		"render-selector",
		"render-closest",
		"render-parent",
		"render-next",
		"render-previous"
	],
	callback: async function (mutation) {
		render({
			element: mutation.target,
			data: await mutation.target.getValue()
		});
	}
});

Observer.init({
	name: "render",
	observe: ["addedNodes"],
	selector: "[render]",
	callback: function (mutation) {
		if (mutation.target.hasAttribute("render-clone")) return;
		let parentElement = mutation.target.parentElement.closest("[render]");
		if (!parentElement) return;
		return;
		let renderedNode = renderedNodes.get(parentElement);
		let data;
		if (renderedNode.source) data = renderedNode.source.data;
		if (renderedNode.template) data = renderedNode.template.source.data;

		render({ element: mutation.target, data });
	}
});

// Observer.init({
//     name: 'render',
//     observe: ['addedNodes'],
//   selector: '[render-clone]',
//     callback: function (mutation) {
//         let renderedNode = renderedNodes.get(mutation.target)
//         if (!renderedNode) return

// render({ source, element, data, key, index, currentIndex, update, remove })

// let nextElement = mutation.target.nextElementSibling
// if (!nextElement) return

// let nextRenderedNode = renderedNodes.get(nextElement)
// if (!nextRenderedNode) return

// let clones
// if (nextRenderedNode.template)
//     clones = nextRenderedNode.template.clones
// else if (nextRenderedNode.clones)
//     clones = nextRenderedNode.clones

// const cloneValueArray = Array.from(clones.values())
// let index = cloneValueArray.indexOf(nextElement);

// const cloneArray = Array.from(clones)

// cloneArray.splice(index, 0, [renderedNode.eid, mutation.target]);
// clones = new Map(cloneArray);

//     }
// })

Observer.init({
	name: "renderNodesRemoved",
	observe: ["removedNodes"],
	selector: "[render-clone]",
	callback: function (mutation) {
		if (mutation.target.parentElement) return;
		let renderedNode = renderedNodes.get(mutation.target);
		if (!renderedNode) return;
		renderedNode.template.clones.delete(renderedNode.eid);
		renderedNodes.delete(mutation.target);
	}
});

init();

export { render, renderValue, sources, renderedNodes };
