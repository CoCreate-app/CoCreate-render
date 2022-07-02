/*globals CustomEvent*/
import action from '@cocreate/actions';
import { queryDocumentSelector } from '@cocreate/utils';
// import api from '@cocreate/api';

const CoCreateRender = {

	__getValueFromObject : function(json, path) {
		try {
			if(typeof json == 'undefined' || !path)
				return false;
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
	
	__replaceValue: function(data, inputValue, renderKey) {
		let isPass = false;
		let self = this;
		let resultValue = null;
		let variables = inputValue.match(/{{([A-Za-z0-9_.,\[\]\- ]*)}}/g);
		if (variables) {
			variables.forEach((attr) => {
				let value = self.__getValue(data, attr);
				// if (value) {
				// if (value && typeof(value) !== "object") {
				if (value && !Array.isArray(value)) {
					// converts object to string
					// if (!Array.isArray(value) && typeof(value) == "object") {
					if (typeof(value) == "object") {
						let str = '';
						for (const [key, val] of Object.entries(value)) {
							str += `${key}: ${val}\n`;
						}
						value = str	
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
	
	render: function(template, data) {
		let type = template.getAttribute('render-array') || "data";
		const renderKey = template.getAttribute('render-key') || type;
		const self = this;

		// const arrayData = this.__getValueFromObject(data, type);
		let arrayData = data;

		const isRenderObject = template.hasAttribute('render-object');
		if (isRenderObject){
			const renderObject = template.getAttribute('render-object');
			if (renderObject)
				arrayData = data[renderObject];
			
			let array = []
			for (const [key, value] of Object.entries(arrayData)) {
				array.push({key: key, value: value})
			}
			if (array.length > 0)
				arrayData = array
			
			type = renderObject || 'data'
		}

		const isRenderArray = template.hasAttribute('render-array');
		if (isRenderArray){
			const renderArray = template.getAttribute('render-array');
			if (renderArray)
				arrayData = data[renderArray];
			type = renderArray || 'data';
		}

		if (!Array.isArray(arrayData))
			arrayData = this.__getValueFromObject(data, type);

		if (!arrayData) {
			let cloneEl = this.cloneEl(template);
			cloneEl.classList.add('cloned');
			self.setValue([cloneEl], data, renderKey);
			template.insertAdjacentHTML('beforebegin', cloneEl.outerHTML);
		}

		if (type && Array.isArray(arrayData)) {
			arrayData.forEach((item) => {
				let cloneEl = this.cloneEl(template);
				cloneEl.classList.add('clone_' + type);
				let r_data = self.__createObject(item, renderKey);

				self.setValue([cloneEl], r_data, renderKey);
				template.insertAdjacentHTML('beforebegin', cloneEl.outerHTML);
			});
		}
	},
	
	cloneEl: function(template) {
		let cloneEl = template.cloneNode(true);
		cloneEl.classList.remove('template');
		let templateId = cloneEl.getAttribute('template_id');
		cloneEl.removeAttribute('template_id');
		cloneEl.setAttribute('templateId', templateId);
		return cloneEl;
	},
 
	setValue:function(els, data, renderKey){
		if (!data) return;
		const that = this;
		Array.from(els).forEach(el => {
			if (el.nodeType == 1) {
				Array.from(el.attributes).forEach(attr=>{
					let attr_name = attr.name.toLowerCase();
					let attrValue = attr.value;
					attrValue = that.__replaceValue(data, attrValue, renderKey);
					
					if (attrValue || attrValue == "") {
						el.setAttribute(attr_name, attrValue);
					}
				});

				if(el.childNodes.length > 0) {
					that.setValue(el.childNodes, data, renderKey);
				}
				if (el.classList.contains('template')) {
					that.render(el, data);
				} 
			}
			
			if (el.nodeType == 3) {
				let textContent = el.textContent;
				let text = that.__replaceValue(data, textContent, renderKey);
				if (text || text == "") {
					const newNode = document.createElement('div');
					newNode.innerHTML = text;
					el.replaceWith(...newNode.childNodes)
				}
			}

		});
	},
	
	data: function({selector, data, elements}) {
		if (selector) {
			let template = queryDocumentSelector(selector);
			if (!template) return;
			if (template.classList.contains('template')) {
				this.render(template, data);
			}
			else
				this.setValue([template], data);
		} else if (elements) {
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