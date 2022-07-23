/*globals CustomEvent*/
import action from '@cocreate/actions';
import observer from '@cocreate/observer';
import uuid from '@cocreate/uuid';
import { queryDocumentSelector } from '@cocreate/utils';
// import { getValue } from '../../CoCreate-elements/src/getValue';
// import api from '@cocreate/api';

const CoCreateRender = {

	__getValueFromObject : function(json, path) {
		try {
			if(typeof json == 'undefined' || !path)
				return false;
			if (path.indexOf('.') == -1 && path.includes('collection'))
				json = this.dataOriginal
			let jsonData = json, subpath = path.split('.');
			
			for (let i = 0; i < subpath.length; i++) {
				jsonData = jsonData[subpath[i]];
				if (!jsonData) return false;
			}
			return jsonData;
		}catch(error){
			console.log("Error in getValueFromObject", error);
			return false;
		}
	},
	
	__getValue: function(data, attrValue) {
		let result = /{{\s*([\w\W]+)\s*}}/g.exec(attrValue);
		if (result) {
			return this.__getValueFromObject(data, result[1].trim());
		}
		return false;
		
	},
	
	__createObject: function (data, path) {
		try {
			if (!path) return data;
			
			let keys = path.split('.');
			let newObject = data;

			for (var  i = keys.length - 1; i >= 0; i--) {
				newObject = {[keys[i]]: newObject};				
			}
			return newObject;
			
		} catch (error) {
			console.log("Error in getValueFromObject", error);
			return false;
		}
	},
	
	__replaceValue: function(data, inputValue, renderKey, valueType) {
		let isPass = false;
		let self = this;
		let resultValue = null;
		let variables = inputValue.match(/{{([A-Za-z0-9_.,\[\]\- ]*)}}/g);
		if (variables) {
			variables.forEach((attr) => {
				if (attr.includes(`collection`))
					if( this.dataOriginal[renderKey] && this.dataOriginal[renderKey]['collection'] && attr.includes(`{{${renderKey}.`))
						data[renderKey]['collection'] = this.dataOriginal[renderKey]['collection']

				let value = self.__getValue(data, attr);
				if (value) {
					if (typeof(value) == "object") {
						value = this.generateString(value)	
					}	
					isPass = true;
					inputValue = inputValue.replace(attr, value);
				}
				if (!isPass && renderKey && attr.includes(`{{${renderKey}.`)) {
					resultValue = '';
				}
			});
			
			if (isPass) {
				resultValue = inputValue;
			}
		}
		return resultValue;
	},

	generateString: function(value, str = ''){
		// let str = '';
		// do {
			let flag = true;
			if (str)
				flag = false;
			for (const [key, val] of Object.entries(value)) {
				if (typeof(val) == "object") {
					str += `${key}: \n`;
					this.generateString(val, str)
				}
				else
					str += `${key}: ${val}\n`;
			}
		// } while()
		if (flag)
			return str
	},
	
	render: function(template, data) {
		const self = this;
		let type = '';
		let arrayData = data;

		const isRenderObject = template.hasAttribute('render-object');
		if (isRenderObject){
			const renderObject = template.getAttribute('render-object');
			type = renderObject || ''
		}

		const isRenderArray = template.hasAttribute('render-array');
		if (isRenderArray){
			var renderArray = template.getAttribute('render-array');
			if (renderArray)
				arrayData = data[renderArray];
			type = renderArray || '';
		}

		let renderKey = template.getAttribute('render-key') || type;

		if (isRenderObject && type) {
			let Data = self.__getValueFromObject(arrayData, type);
			let array = self.isRenderObject(Data, renderKey)
			for (let item of array) {
				let cloneEl = this.cloneEl(template);
				self.setValue([cloneEl], item, renderArray, renderKey);
				template.insertAdjacentElement('beforebegin', cloneEl);
			}
		} else {

			if (!Array.isArray(arrayData))
				arrayData = this.__getValueFromObject(data, type);

			if (!arrayData) {
				let cloneEl = this.cloneEl(template);
				self.setValue([cloneEl], data, renderArray, renderKey);
				template.insertAdjacentElement('beforebegin', cloneEl);
			}

			if(type && Array.isArray(arrayData)) {
				arrayData.forEach((item) => {
					let cloneEl = this.cloneEl(template);
					let object = self.__createObject(item, renderKey);
					self.setValue([cloneEl], object, renderArray, renderKey);
					template.insertAdjacentElement('beforebegin', cloneEl);
				});
			}
		}
	},
	
	isRenderObject: function(data, renderKey) {	
		let array = []
		if (!data) 
			return array
		for (const [key, value] of Object.entries(data)) {
			let type = 'string';
			if (typeof(value) == "object")
				if (Array.isArray(value))
					type = 'array'
				else
					type = 'object'
			array.push({[renderKey]: {key, value, type}})
		}
		return array
	},

	cloneEl: function(template) {
		let cloneEl = template.cloneNode(true);

		let templateId = cloneEl.getAttribute('template_id');
		if (templateId)
			cloneEl.setAttribute('templateId', templateId);

		cloneEl.removeAttribute('template_id');
		cloneEl.setAttribute('render-clone', '');	
		cloneEl.classList.remove('template');

		if (template.dataOriginal)
			cloneEl.dataOriginal = template.dataOriginal

		return cloneEl;
	},

	setValue: function(els, data, renderArray, renderKey){
		if (!data) return;
		const that = this;
		Array.from(els).forEach(el => {
			let updateData;

			if (el.nodeType == 1) {
				if (el.hasAttribute('render-clone')) {
					el.renderData = {...data}
				}
				if (el.renderMap) {
					let placeholder = el.renderMap.get(el)
					if (placeholder){
						console.log('innerhtml', el, placeholder.placeholder)
						renderKey = placeholder.renderKey
						renderArray = placeholder.renderArray
						if (renderArray)
						updateData = data[renderArray][0]
						if (renderKey)
						updateData = {[renderKey]: updateData}
						let textContent = placeholder.placeholder
						let text = that.__replaceValue(updateData, textContent, renderKey, valueType);
						if (text)
							el.innerHTML = placeholder.placeholder
					}
				}

				Array.from(el.attributes).forEach(attr=>{
					let attr_name = attr.name.toLowerCase();
					let attrValue = attr.value;

					let placeholder
					if (attr.renderMap)
						placeholder = attr.renderMap.get(attr)
					else
						that.renderMap(attr, attr.value, renderArray, renderKey)

					if(placeholder){
						let updateData = data;
						attrValue = placeholder.placeholder;
						renderKey = placeholder.renderKey
						renderArray = placeholder.renderArray
						if (renderArray)
							updateData = data[renderArray][0]
						if (renderKey)
							updateData = {[renderKey]: updateData}
	
						attrValue = that.__replaceValue(updateData, attrValue, renderKey);
					}
					else
						attrValue = that.__replaceValue(data, attrValue, renderKey);
					
					
					// ToDo support attibute name replace if has {{}}
					// attr_name = that.__replaceValue(data, attr_name, renderKey);

					if (attrValue || attrValue == "") {
						el.setAttribute(attr_name, attrValue);
					}
				});

				if(el.childNodes.length > 0) {		
					that.setValue(el.childNodes, updateData || data, renderArray, renderKey);
				}
				if (el.classList.contains('template') && !el.hasAttribute('template_id')) {
					that.render(el, data);
				} 
			}

			if (el.nodeType == 3) {
				let valueType = el.parentElement.getAttribute('value-type')
				
				let textContent, placeholder, text;
				if (el.renderMap)
					placeholder = el.renderMap.get(el)
					if (placeholder) {
						let updateData = data;
						textContent = placeholder.placeholder
						renderKey = placeholder.renderKey
						renderArray = placeholder.renderArray
						if (renderArray)
							updateData = data[renderArray][0]
						if (renderKey)
							updateData = {[renderKey]: updateData}
						text = that.__replaceValue(updateData, textContent, renderKey, valueType);
					}
				if (!text) {
					textContent = el.textContent;
					that.renderMap(el, textContent, renderArray, renderKey)
					text = that.__replaceValue(data, textContent, renderKey, valueType);
				}

				if (text || text == "") {
					if (valueType == 'text' || valueType == 'string'){
						el.textContent = text;
					} else {
						const newNode = document.createElement('div');
						newNode.innerHTML = text;
						let parentElement = el.parentElement
						if (!parentElement.renderMap) {
							that.renderMap(parentElement, textContent, renderArray, renderKey)
						} else if (!parentElement['renderMap'].has(parentElement))
							that.renderMap(parentElement, textContent, renderArray, renderKey)
						el.replaceWith(...newNode.childNodes)
					}
				}
			}
		});
	},

	renderMap: function(node, placeholder, renderArray, renderKey) {
		if (!node.renderMap) {
			node['renderMap'] = new Map();
		}
		if (placeholder && renderKey)
			node['renderMap'].set(node, {placeholder, renderArray, renderKey})
	},
	
	dataOriginal: {},
	data: function({selector, data, elements}) {
		this.dataOriginal = {...data};
		this.dataString = {...data};
		delete this.dataOriginal.data

		for (let element of elements)
			element.dataOriginal = {...this.dataOriginal};

		if (selector) {
			let template = queryDocumentSelector(selector);
			if (!template) return;
			template.dataOriginal = {...data}
			if (template.classList.contains('template')) {
				this.render(template, data);
			}
			else
				this.setValue([template], data);
		} else if (elements) {
			if (elements.length == 1 && elements[0].classList.contains('template')){
				this.render(elements[0], data);
			}
			else
				this.setValue(elements, data);
		}
		
	}
	
};

function renderKey(element) {
	const form = element.closest("form") || document;
	let data = CoCreate.api.getFormData('render-key', 'renderKey',  form);

	CoCreateRender.data({
		selector: "[template_id='renderKey']",
		data: {renderKey: data}
	});
	
	document.dispatchEvent(new CustomEvent('renderKey', {
		detail: { data }
	}));
}

function renderKeys(elements, autoKey, parentKey, parentKeys) {
	Array.from(elements).forEach(el => {
		if (el.nodeType == 1) {
			Array.from(el.attributes).forEach(attr=>{
				let attr_name = attr.name.toLowerCase();
				let attr_value = attr.value || '';
				if (attr_name)
					attr_name = replaceKeys(attr_name, autoKey, parentKey, parentKeys)
				if (attr_value)
					attr_value = replaceKeys(attr_value, autoKey, parentKey, parentKeys)
				if (attr_name) {
					el.setAttribute(attr_name, attr_value);
				}
			});

			if(el.childNodes.length > 0) {		
				renderKeys(el.childNodes, autoKey, parentKey, parentKeys);
			}
		}

		if (el.nodeType == 3) {			
			let text = el.textContent;
			text = replaceKeys(text, autoKey, parentKey, parentKeys)
			el.textContent = text;
		}
	});
}

function replaceKeys(string, autoKey, parentKey, parentKeys) {
	if (autoKey)
		string = string.replace(/\$auto/g, autoKey);
	if (parentKeys)
		string = string.replace(/\$parents/g, parentKeys);
	if (parentKey)
		string = string.replace(/\$parent/g, parentKey);
	return string
}

action.init({
	name: "renderKey",
	endEvent: "renderKey",
	callback: (btn, data) => {
		renderKey(btn);
	}
});

observer.init({
	name: 'render',
	observe: ['addedNodes'],
	target: '[render]',
	callback: function(mutation) {
		let element = mutation.target
		element.removeAttribute('render')

		let parentElement = element.parentElement
		if (parentElement) {
			parentElement.removeAttribute('get-value')
			let el = element
			let parentKeys = [];
			let renderData = new Map();
			do {
				let data;
				el = el.parentElement
				if (el) {
					if (el.dataOriginal)
						renderData.set(el.dataOriginal, '')
					if (el.hasAttribute('render-clone'))
						data = el.renderData
					if (data)
						renderData.set(data, '')
					
					let parentKey = el.getAttribute('parentKey')
					if(parentKey && parentKey != null) {
						if (/^\d+$/.test(parentKey))
							parentKey = `[${parentKey}]`
						parentKeys.push(parentKey)
					}
				}
			} while (el)
			
			let renderKey = element.getAttribute('render-key')

			let parentKey;
			parentKey = parentElement.getAttribute('parentKey')
			if(renderKey == '$auto' || parentKey || parentKeys) {
				// let autoKey = uuid.generate(6)
				// let parentKeysString = "";
				// if (parentKeys.length > 0) {
				// 	if (parentKeys.length == 1){
				// 		parentKeysString = parentKeys[0]
				// 	}
				// 	else {
				// 		parentKeysString = parentKeys.reverse().join('.')	
				// 		parentKeysString = parentKeysString.replace(/.\[/g, '[');
				// 	}
				// }

				// renderKeys([element], autoKey, parentKey, parentKeysString)
				let template = element.outerHTML
				if (renderKey) {				
					template = template.replace(/\$auto/g, uuid.generate(6));
				}
				if (parentKeys.length > 0) {
					let string = ''	
					if (parentKeys.length == 1){
						string = parentKeys[0]
					}
					else
						string = parentKeys.reverse().join('.')	
						string = string.replace(/.\[/g, '[');
					template = template.replace(/\$parents/g, string);
				}
				if (parentKey) {				
					template = template.replace(/\$parent/g, parentKey);
				}
	
				// let div = document.createElement('div')
				// div.innerHTML = template
				// if (!alreadyRendered.has(parentElement)) {
					// alreadyRendered.set(parentElement, '')
					parentElement.innerHTML = template
				// }
				// else
				// 	console.log('already rendered', template)
				// parentElement.replaceChildren(...div.childNodes)
				// element.replaceWith(...div.childNodes);

			}

			element = parentElement.firstElementChild
			let obj = {}
			let array = Array.from(renderData.keys())
			for (let data of array.reverse()){
				obj = {...obj, ...data}
			}

			CoCreateRender.data({
				elements: [element],
				data: obj
			});
		}
	}
});

export default CoCreateRender;