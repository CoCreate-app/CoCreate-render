/*globals CustomEvent*/
import action from '@cocreate/actions';
// import CoCreateApi from '@cocreate/api';

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
	
	__replaceValue: function(data, inputValue) {
		let isPass = false;
		let self = this;
		let resultValue = null;
		// let variables = inputValue.match(/{{\s*(\S+)\s*}}/g);
		// let variables = inputValue.match(/{{([A-Za-z0-9_.,\- ]*)}}/g);
		let variables = inputValue.match(/{{([A-Za-z0-9_.,\[\]\- ]*)}}/g);
		if (variables) {
			variables.forEach((attr) => {
				let value = self.__getValue(data, attr);
				if (value && typeof(value) !== "object") {
					isPass = true;
					inputValue = inputValue.replace(attr, value);
				}
			});
			
			if (isPass) {
				resultValue = inputValue;
			}
		}
		return resultValue;
	},
	
	render: function(template, data) {
		const type = template.getAttribute('render-array') || "data";
		const render_key = template.getAttribute('render-key') || type;
		const self = this;

		// const arrayData = this.__getValueFromObject(data, type);
		let arrayData = data;
		if (!Array.isArray(data))
			arrayData = this.__getValueFromObject(data, type);
		if (!arrayData){
			let cloneEl = this.cloneEl(template);
			cloneEl.classList.add('cloned');
			self.setValue([cloneEl], data);
			template.insertAdjacentHTML('beforebegin', cloneEl.outerHTML);
		}
		if (type && Array.isArray(arrayData)) {
			arrayData.forEach((item, index) => {
				let cloneEl = this.cloneEl(template);
				cloneEl.classList.add('clone_' + type);
				let new_key = render_key;
				if (typeof item !== 'object') {
					// item = {"--": item};
					new_key = new_key + "[]";
				} else {
					item['index'] = index;
				}
				let r_data = self.__createObject(item, new_key);

				self.setValue([cloneEl], r_data);
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
 
	setValue:function(els, data, template){
		if (!data) return;
		const that = this;
		Array.from(els).forEach(el => {
			// if (el.classList.contains('template')) {
			// 	el = this.cloneEl(el);
			// }
			Array.from(el.attributes).forEach(attr=>{
				let attr_name = attr.name.toLowerCase();
				let attrValue = attr.value;
				attrValue = that.__replaceValue(data, attrValue);
				
				if (attrValue) {
					el.setAttribute(attr_name, attrValue);
				}
			});
			
			if (el.children.length == 0 && el.textContent) {
				let textContent = el.textContent;
				textContent = that.__replaceValue(data, textContent);
				if (textContent) {
					el.innerHTML = textContent;
				}
			}
			
			if(el.children.length > 0) {
				that.setValue(el.children, data, template);
			}
			if (el.classList.contains('template')) {
				that.render(el, data);
			} 

		});
	},
	
	data: function({selector, data, elements}) {
		if (selector) {
			let template = document.querySelector(selector);
			if (!template) return;
			if (template.classList.contains('template')) {
				this.render(template, data);
			}
			else
				this.setValue([template], data, template);
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
	action: "renderKey",
	endEvent: "renderKey",
	callback: (btn, data) => {
		renderKey(btn);
	}
});

export default CoCreateRender;