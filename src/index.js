/*globals CustomEvent*/
import action from '@cocreate/actions';
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
		let type = template.getAttribute('render-array') || "data";
		const renderKey = template.getAttribute('render-key') || type;
		const self = this;

		let arrayData = data;

		const isRenderObject = template.hasAttribute('render-object');
		if (isRenderObject){
			const renderObject = template.getAttribute('render-object');			
			type = renderObject || 'data'
		}

		const isRenderArray = template.hasAttribute('render-array');
		if (isRenderArray){
			const renderArray = template.getAttribute('render-array');
			if (renderArray)
				arrayData = data[renderArray];
			type = renderArray || 'data';
		}
		if (isRenderObject && type) {
			let r_data = self.isRenderObject(arrayData[type], renderKey)
			for (let sdata of r_data) {
				let cloneEl = this.cloneEl(template);
				cloneEl.classList.add('clone_' + type);	
				self.setValue([cloneEl], sdata, renderKey);
				template.insertAdjacentElement('beforebegin', cloneEl);
			}
		} else {

			if (!Array.isArray(arrayData))
				arrayData = this.__getValueFromObject(data, type);

			if (!arrayData) {
				let cloneEl = this.cloneEl(template);
				cloneEl.classList.add('cloned');
				self.setValue([cloneEl], data, renderKey);
				template.insertAdjacentElement('beforebegin', cloneEl);
			}

			if(type && Array.isArray(arrayData)) {
				arrayData.forEach((item) => {
					let cloneEl = this.cloneEl(template);
					cloneEl.classList.add('clone_' + type);
					let r_data = self.__createObject(item, renderKey);
					self.setValue([cloneEl], r_data, renderKey);
					template.insertAdjacentElement('beforebegin', cloneEl);
				});
			}
		}
	},
	
	isRenderObject: function(data, renderKey) {	
		let array = []
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
		cloneEl.classList.remove('template');
		let templateId = cloneEl.getAttribute('template_id');
		cloneEl.removeAttribute('template_id');
		cloneEl.setAttribute('templateId', templateId);
		return cloneEl;
	},

	setValue: function(els, data, renderKey){
		if (!data) return;
		const that = this;
		Array.from(els).forEach(el => {

			if (el.nodeType == 1) {
				if (el.renderMap) {
					let placeholder = el.renderMap.get(el)
					if (placeholder){
						el.innerHTML = placeholder.placeholder
						renderKey = placeholder.renderKey
						if (data[renderKey][0])
							data = {[renderKey]: data[renderKey][0]}
					}
				}

				Array.from(el.attributes).forEach(attr=>{
					let attr_name = attr.name.toLowerCase();
					let attrValue = attr.value;

					// get placeholder
					let placeholder
					if (attr.renderMap)
						placeholder = attr.renderMap.get(attr)
					else
						that.renderMap(attr, attr.value, renderKey)

					if(placeholder){
						attrValue = placeholder.placeholder;
						renderKey = placeholder.renderKey
						let updateData = data;
						if (data[renderKey][0])
							updateData = {[renderKey]: data[renderKey][0]}
						attrValue = that.__replaceValue(updateData, attrValue, renderKey);
					}
					else
						attrValue = that.__replaceValue(data, attrValue, renderKey);
					
					if (attrValue || attrValue == "") {
						el.setAttribute(attr_name, attrValue);
					}
				});

				if(el.childNodes.length > 0) {		
					that.setValue(el.childNodes, data, renderKey);
				}
				if (el.classList.contains('template') && !el.hasAttribute('template_id')) {
					that.render(el, data);
				} 
			}

			if (el.nodeType == 3) {
				let valueType = el.parentElement.getAttribute('value-type')
				
				// get placeholder
				let textContent, placeholder, text;
				if (el.renderMap)
					placeholder = el.renderMap.get(el)
					if (placeholder) {
						textContent = placeholder.placeholder
						renderKey = placeholder.renderKey
						let updateData = data;
						if (data[renderKey][0])
							updateData = {[renderKey]: data[renderKey][0]}
						text = that.__replaceValue(updateData, textContent, renderKey, valueType);
					}
				if (!text) {
					textContent = el.textContent;
					that.renderMap(el, textContent, renderKey)
					text = that.__replaceValue(data, textContent, renderKey, valueType);
				}

				// let textContent = el.textContent;
				// let text = that.__replaceValue(data, textContent, renderKey, valueType);
				if (text || text == "") {
					if (valueType == 'text' || valueType == 'string'){
						el.textContent = text;
					} else {
						const newNode = document.createElement('div');
						newNode.innerHTML = text;
						let parentElement = el.parentElement
						if (!parentElement.renderMap) {
							that.renderMap(parentElement, textContent, renderKey)
						} else if (!parentElement['renderMap'].has(parentElement))
							that.renderMap(parentElement, textContent, renderKey)
						el.replaceWith(...newNode.childNodes)
					}
				}
			}
		});
	},

	renderMap: function(node, placeholder, renderKey) {
		if (!node.renderMap) {
			node['renderMap'] = new Map();
		}
		if (placeholder && renderKey)
			node['renderMap'].set(node, {placeholder, renderKey})
	},
	
	dataOriginal: {},
	data: function({selector, data, elements}) {
		this.dataOriginal = data;
		if (selector) {
			let template = queryDocumentSelector(selector);
			if (!template) return;
			if (template.classList.contains('template')) {
				this.render(template, data);
			}
			else
				this.setValue([template], data);
		} else if (elements) {
			if (elements.length == 1 && elements[0].classList.contains('template'))
				this.render(elements[0], data);
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

action.init({
	name: "renderKey",
	endEvent: "renderKey",
	callback: (btn, data) => {
		renderKey(btn);
	}
});

export default CoCreateRender;