/**
 * change name Class
 * add functionality to add value on any attr of each elements into template
 */
const CoCreateRender = {
	restrictAttrList : [
		"name", 
		"data-pass_to", 
		"data-pass_id", 
		"data-pass_collection", 
	],
	print(message) {
		let debug = true;
		debug = debug || false;
		if(debug)
			console.log(message)
	},
	
	addRestrictItem: function(attr) {
		this.restrictAttrList.push(attr);	
	},
	
	findInJsonDeep : function(json, path) {
		try {
			if(typeof json == 'undefined')
				return false;
			let subpath = path.split('.');
			let find = subpath.shift();
			if (subpath.length > 0){
					return this.findInJsonDeep(json[find], subpath.join('.'))
			}
			let value = (Object.keys(json).indexOf(find) != -1) ? json[find] : false
			return value;
		}catch(error){
			this.print(['Error in findInJsonDeep',error])
			return false;
		}
	},
	
	setArray: function(template, data) {
		const type = template.getAttribute('data-render_array') || "data";
		const self = this;
		const arrayData = this.findInJsonDeep(data, type);
		if (type && Array.isArray(arrayData)) {
			arrayData.forEach(row => {
				let cloneEl = template.cloneNode(true);
				cloneEl.classList.remove('template');
				cloneEl.classList.add('clone_' + type);
				self.setValue([cloneEl], row, cloneEl);
				template.insertAdjacentHTML('beforebegin', cloneEl.outerHTML);
			})
		}
	},
 
	setValue:function(els, row, template, passTo){
		if (!row) return;
		const that = this;
		Array.from(els).forEach(e => {
			let passId = e.getAttribute('data-pass_id');
			if (passTo && passId != passTo) {
				return;
			}
			Array.from(e.attributes).forEach(attr=>{
				let value = false
				let attr_name = attr.name.toLowerCase();
				if (that.restrictAttrList.includes(attr_name)) {
					return;
				}
				
				switch (attr_name) {
					case 'class':
						let list_class = []
						attr.value.split(' ').forEach(my_class => {
							value = that.findInJsonDeep(row, my_class);
							list_class.push(value != false ? value : my_class)
						});
						if(list_class.length) {
							value = list_class.join(' ')
						}
						break;
					default:
						if (attr.value === '--') {
							value = row
						} else {
							value = that.findInJsonDeep(row, attr.value);
						}
				}
				
				if(value != false && typeof(value) !== "object"){
					if(attr_name == 'value'){
						let tag = e.tagName.toLowerCase();
						switch (tag) {
							case 'input':
								 e.setAttribute(attr_name, value);
							break;
							case 'textarea':
								e.setAttribute(attr_name, value);
								e.textContent =value;
							break;
							default:
								e.innerHTML =  value;
						}
					}else{
						e.setAttribute(attr_name, value);
					}
				}
					
			});
			
			if(e.children.length > 0) {
				if (e.classList.contains('template')) {
					that.setArray(e, row);
				} else {
					that.setValue(e.children, row, template)
				}
			}
		});
	},
	
	render : function(selector, dataResult) {
		let template_div = document.querySelector(selector)
		if (Array.isArray(dataResult)) {
			template_div.setAttribute('data-render_array', 'test');
			this.setValue([template_div], {test: dataResult}, template_div);
		} else {
			this.setValue(template_div.children, dataResult, template_div);
		}
	}

}