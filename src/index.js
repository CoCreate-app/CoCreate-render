/**
 * change name Class
 * add functionality to add value on any attr of each elements into template
 */
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
			
			let keys = path.split('.')
			let newObject = data;

			for (var  i = keys.length - 1; i >= 0; i--) {
				newObject = {[keys[i]]: newObject}				
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
				let value = self.__getValue(data, attr)
				if (value && typeof(value) !== "object") {
					isPass = true;
					inputValue = inputValue.replace(attr, value);
				}
			})
			
			if (isPass) {
				resultValue = inputValue;
			}
		}
		return resultValue;
	},
	
	setArray: function(template, data) {
		const type = template.getAttribute('render-array') || "data";
		const render_key = template.getAttribute('render-key') || type;
		const self = this;
		const arrayData = this.__getValueFromObject(data, type);

		if (type && Array.isArray(arrayData)) {
			arrayData.forEach((item, index) => {
				
				let cloneEl = template.cloneNode(true);
				cloneEl.classList.remove('template');
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
			})
		}
	},
 
	setValue:function(els, data, passTo, template){
		if (!data) return;
		const that = this;
		Array.from(els).forEach(e => {
			let passId = e.getAttribute('pass_id');
			if (passTo && passId != passTo) {
				return;
			}
			Array.from(e.attributes).forEach(attr=>{
				let attr_name = attr.name.toLowerCase();
				let  isPass = false;
				let attrValue = attr.value;
				attrValue = that.__replaceValue(data, attrValue);
				
				if (attrValue) {
					// if(attr_name == 'value'){
					// 	let tag = e.tagName.toLowerCase();
					// 	switch (tag) {
					// 		case 'input':
					// 			 e.setAttribute(attr_name, attrValue);
					// 			break;
					// 		case 'textarea':
					// 			e.setAttribute(attr_name, attrValue);
					// 			e.textContent = attrValue;
					// 			break;
					// 		default:
					// 			if (e.children.length === 0) {
					// 				e.innerHTML =  attrValue;
					// 			}
					// 	}
					// }
					e.setAttribute(attr_name, attrValue);
				}
			});
			
			if (e.children.length == 0 && e.textContent) {
				let textContent = e.textContent;
				textContent = that.__replaceValue(data, textContent);
				if (textContent) {
					e.textContent = textContent;
				}
			}
			
			
			
			if(e.children.length > 0) {
				that.setValue(e.children, data)
			}
			if (e.classList.contains('template')) {
				that.setArray(e, data);
			} 

		});
	},
	
	data: function({selector, data, elements, passTo}) {
		if (selector) {
			this.render(selector, data);
		} else if (elements) {
			this.setValue(elements, data, passTo);
		}
	},
	
	render : function(selector, dataResult) {
		let template_div = document.querySelector(selector)
		if (!template_div) {
			return;
		}
		if (Array.isArray(dataResult)) {
			template_div.setAttribute('render-array', 'test');
			this.setValue([template_div], {test: dataResult});
		} else {
			this.setValue(template_div.children, dataResult);
		}
	}

}
export default CoCreateRender;