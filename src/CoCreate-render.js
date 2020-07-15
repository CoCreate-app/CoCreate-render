
const CoCreateTemplate = {
	selector: '.template-wrapper',
	className: 'template-wrapper',
	items: [],
	
	init: function() {
		this.__initItem();
		this.__initSocketEvent();
		this.__initLoadMore();
	},
	
	__initItem: function(container) {
		
		let process_container = container || document;
		if (!process_container.querySelectorAll) {
			return;
		}
		let wrappers = process_container.querySelectorAll(this.selector);
		
		if (wrappers.length == 0 && process_container != document && process_container.hasAttributes(this.className)) {
			wrappers = [process_container];
		}
		
		for (let i = 0; i < wrappers.length; i++) {
			const fetch_type = wrappers[i].getAttribute('data-fetch_value_type') || "string";
			if (fetch_type === "array") {
				this.__initFetchArray(wrappers[i], true, true);
			} else {
				this.__initEachElement(wrappers[i], true, true);
			}
		}
	},
	
	__initFetchArray: function(element, isInit, checkInit) {
		let item_id = element.getAttribute('data-template_id')
		if (!item_id) {
			return;
		}
		
		let item = g_cocreateFilter.getObjectByFilterId(this.items, item_id);
		let filter = null;
		const self = this;
		if (checkInit && CoCreateUtils.getInitialized(element)) {
			return;
		}
		
		if (!item) {
			filter = {
				fetch_name: element.getAttribute('data-fetch_name'),
				fetch_value: element.getAttribute('data-fetch_value'),
				id: item_id,
				el: element,
				collection: element.getAttribute('data-fetch_collection') || 'module_activity',
				fetch_type: 'array'
			}
			
			if (!filter.fetch_value) {
				return;
			}
			
			CoCreateUtils.setInitialized(element)
			item = {
				el: element,
				filter: filter,
				templateId: item_id,
			}
			this.items.push(item)
		}
		
		if (isInit) {
			this.__removeOldData(element);
		}
		//. fetch array data
		
		CoCreate.readDocument({
			'collection': filter.collection,
			'document_id': filter.fetch_value,
			'element': item_id
		})
	},
	
	__initSocketEvent: function() {
		const self = this;
		CoCreateSocket.listen('readDocumentList', function(data) {
			if (data.created_ids) {
				self.__fetchedItems(data)
			} else {
				self.__fetchedItem(data);
			}
		})
		CoCreateSocket.listen('readCollectionList', function(data) {
			let item_id = data['element'];
			let item = g_cocreateFilter.getObjectByFilterId(self.items, item_id);
			
			if (item) {
				if (item.filter.is_collection || item.fetch_type === 'collection') {
					self.__renderCollection(item.el, data['data']);
				}
			}
		})
		
		CoCreateSocket.listen('createDocument', function(data) {
			self.__createItem(data)
		})
	
		CoCreateSocket.listen('deleteDocument', function(data) {
			self.__deleteItem(data);
		})
		
		CoCreateSocket.listen('readDocument', function(data) {
			self.__fetchedArray(data);
		})
	},
	
	__initLoadMore: function() {
		let buttons = document.querySelectorAll('.loadMore');
		const self = this;
		buttons.forEach((btn) => {
			btn.addEventListener('click', function(e) {
				e.preventDefault();
				
				let item_id = this.getAttribute("data-template_id");
				if (!item_id) return;
				let item = g_cocreateFilter.getObjectByFilterId(self.items, item_id);
				
				if (!item) return;
				if (item.filter.count > 0) {
					g_cocreateFilter.fetchData(item.filter)
				}
			})
		});
	},
	
	__initEachElement: function(element, isInit, checkInit) {
		
		let item_id = element.getAttribute('data-template_id');
		if (!item_id) {
			return;
		}
		
		let item = g_cocreateFilter.getObjectByFilterId(this.items, item_id);
		let filter = null;
		const self = this;
		
		if (checkInit && CoCreateUtils.getInitialized(element)) {
			return;
		}
	
		if (!item) {
			filter = g_cocreateFilter.setFilter(element, "data-template_id", "template");
			let fetch_type = element.getAttribute('data-fetch_value_type') || "string";
			if (!filter) {
				return;
			}
			
			// if (checkInit) {
				CoCreateUtils.setInitialized(element)
			// }
			
			if (fetch_type === 'collection') {
				filter.is_collection = true;
			}
			
			item = {
				el: element,
				filter: filter,
				templateId: item_id,
				availableMore: true,
				fetch_type: fetch_type
			}
			
			this.items.push(item);

			element.addEventListener("changeFilterInput", function(e) {
				self.__removeOldData(item.el)
				item.filter.startIndex = 0;
				g_cocreateFilter.fetchData(item.filter);
			})
		} else {
			filter = item.filter
			g_cocreateFilter.changeCollection(filter);
			if (isInit) {
				self.__removeOldData(element);
				filter.startIndex = 0;
			}
		}
		g_cocreateFilter.fetchData(filter);
	},
	
	__removeOldData: function(wrapper) {
		let item_id = wrapper.getAttribute('data-template_id');
	
		let elements = wrapper.querySelectorAll("[templateId='" + item_id + "']");
		for (let i=0; i < elements.length; i++) {
			elements[i].remove();
		}
	},
	
	__renderData: function(wrapper, collection, items, position) {

		let template = wrapper.querySelector('.template');
		if (!template) return;
		
		let ids = [];
		items.forEach(function(item) {
			ids.push(item['_id']);
		})
	
		let result = this.__cloneItems(wrapper, collection, items);
	
		//. insert for position
		let templateId = wrapper.getAttribute('data-template_id');
		var pos_element = null;
		if (position) {
			pos_element = wrapper.querySelector("[templateId=" + templateId + "]:nth-child(" + (position + 1) + ")")
		}
		
		if (pos_element) {
			pos_element.insertAdjacentHTML('beforebegin', result.innerHTML);
		} else {
			template.insertAdjacentHTML('beforebegin', result.innerHTML);
		}
		
		/// emit event
		var evt = new CustomEvent('fetchedTemplate', { bubbles: true });
		wrapper.dispatchEvent(evt);
		this.__initNewAtags(wrapper.parentNode);
		
		/// init passValueBtns
		let forms = wrapper.parentNode.getElementsByTagName('form');
		
		for (let i = 0; i < forms.length; i++) {
			let form = forms[i];
			
			let valuePassBtn = form.querySelector('.passValueBtn');
			
			if (valuePassBtn) CoCreateLogic.__registerValuePassBtnEvent(form, valuePassBtn);
		}
		
		CoCreate.fetchModules(wrapper.parentNode);
		//. re-init....
		this.__initItem(wrapper)
		CoCreate.initModules(wrapper.parentNode)
	},
	
	__renderCollection: function(wrapper, items) {
		let template = wrapper.querySelector('.template');
		if (!template) return;
		
		let templateId = wrapper.getAttribute('data-template_id');
		let passTo = wrapper.getAttribute('data-pass_to');
		let templateDiv = document.createElement('div');
		let template_node = wrapper.querySelector('.template');
		if (template_node.getAttribute('data-template_id') != templateId) {
			template_node = wrapper.querySelector('template-wrapper > .template');
		}
		
		for (let k = 0; k < items.length; k++) {
			
			let collection_info = items[k];
			let itemTemplateDiv = this.__cloneElement(template_node, templateId)
	
			let displayList = itemTemplateDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, p, i, q, a, b, li, span, code');
			let aTags = itemTemplateDiv.getElementsByTagName('a');
			
			for (let i = 0; i < displayList.length; i++) {
				
				let display = displayList[i];
				let pass_id = display.getAttribute('data-pass_id');
				if (passTo && passTo == pass_id) {
					if (display.getAttribute("name") == "name" || display.classList.contains("collection-name")) {
						display.textContent = collection_info['name'];
						this.__setCommonValue(display, collection_info['name']);

					}
					if (display.getAttribute("name") == "id") {
						display.textContent = collection_info['_id'];
					}
					
				}
			}
			for (let i = 0; i < aTags.length; i++) {
				
				let aTag = aTags[i];
				let data_pass_to = aTag.getAttribute('data-pass_to');
				if (!data_pass_to) continue;
				
				aTag.classList.add('newLink');
				aTag.setAttribute('data-pass_collection', collection_info['name']);
			}
			templateDiv.insertAdjacentHTML('beforeend', itemTemplateDiv.innerHTML);
		}
		template.insertAdjacentHTML('beforebegin', templateDiv.innerHTML);
	},
	
	__fetchedArray: function(data) {
		let is_fetch = false;
		let item_id = data['element'];
		let item = g_cocreateFilter.getObjectByFilterId(this.items, item_id);
		
		if (!item) {
			return;
		}
		let filter = item.filter;
		
		if (filter.fetch_type != 'array') {
			return;
		}
		
		let ids = data['data'][filter.fetch_name];
		if (ids) {
			item.values = ids;
			if (!Array.isArray(ids)) {
				item.values = [ids]
			}
			let template = item.el.querySelector('.template');
			if (template) {
				let renders = this.__renderArray(item.el, item.values);
				this.__removeOldData(item.el)
				template.insertAdjacentHTML('beforebegin', renders.innerHTML);
				item.el.dispatchEvent(new CustomEvent('fetchedArray'));
				is_fetch = true;
			}
		}
		
		if (is_fetch) {
			CoCreate.fetchModules();
		}
	},
	__renderArray: function(wrapper, items) {
		let templateId = wrapper.getAttribute('data-template_id');
		let passTo = wrapper.getAttribute('data-pass_to');
		
		let templateDiv = document.createElement('div');
		let template_node = wrapper.querySelector('.template');
		let new_templateId = template_node.getAttribute('data-template_id');
		if (new_templateId && new_templateId != templateId) {
			template_node = wrapper.querySelector('template-wrapper > .template');
		}
		
		for (let k=0; k < items.length; k++) {
			let id = items[k];
			
			let itemTemplateDiv = this.__cloneElement(template_node, templateId)
			
			let displayList = itemTemplateDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, p, i, q, a, b, li, span, code, img');
			
			for (let i = 0; i < displayList.length; i++) {
				
				let display = displayList[i];
				let pass_id = display.getAttribute('data-pass_id');
				if (passTo && passTo == pass_id) {
					
					display.setAttribute('data-document_id', id);
					this.__setCommonValue(display, id);
				}
			}

			templateDiv.insertAdjacentHTML('beforeend', itemTemplateDiv.innerHTML);
		}
		
		return templateDiv;
	},

	__cloneItems: function(wrapper, collection, items) {
		let templateId = wrapper.getAttribute('data-template_id');
		let passTo = wrapper.getAttribute('data-pass_to');
	
		 
		let templateDiv = document.createElement('div');
		
		let template_node = wrapper.querySelector('.template');
		let new_tempate_id = template_node.getAttribute('data-template_id');
		if (new_tempate_id && new_tempate_id != templateId) {
			template_node = wrapper.querySelector('template-wrapper >.template');
		}

		for (let k = 0; k < items.length; k++) {
			let id = items[k]['_id'];
			
			let itemTemplateDiv = this.__cloneElement(template_node, templateId, id)
			
			/////  fetch data for h1, h2, h3, h4, h5 ,h6, p, i, q, a, b, li, span, code
			let displayList = itemTemplateDiv.querySelectorAll('div, h1, h2, h3, h4, h5, h6, p, i, q, a, b, li, span, code, img, tr, td');
			let inputList = itemTemplateDiv.querySelectorAll('input, textarea');
			let aTags = itemTemplateDiv.getElementsByTagName('a');
			
			for (let i = 0; i < displayList.length; i++) {
				let display = displayList[i];
				let pass_id = display.getAttribute('data-pass_id');
				if (passTo && passTo == pass_id) {
					if (display.classList.contains('template-wrapper')) {
						display.setAttribute('data-template_id', id);
						display.setAttribute('data-fetch_value', id)
					} else if (display.classList.contains('template')) {
						display.setAttribute('data-template_id', id)
					} else {       
						display.setAttribute('data-collection', collection);
						display.setAttribute('data-document_id', id);
					}
					
					const name = display.getAttribute('name')
					this.__setCommonValue(display, items[k][name])
				}
			}
			
			for (let i = 0; i < aTags.length; i++) {
				let aTag = aTags[i];
				let data_pass_to = aTag.getAttribute('data-pass_to');
				if (!data_pass_to) continue;
				
				aTag.classList.add('newLink');
				aTag.setAttribute('data-pass_document_id', id);
			}
			
			///// setup update
			for (let i = 0; i < inputList.length; i++) {
				let input = inputList[i];
				let pass_id = input.getAttribute('data-pass_id');
				if (passTo && passTo == pass_id) {
					input.setAttribute('data-document_id', id);
				}
			}
			templateDiv.appendChild(itemTemplateDiv.firstChild);
			// templateDiv.insertAdjacentHTML('beforeend', itemTemplateDiv.innerHTML);
		}
		return templateDiv;
	},
	
	__initNewAtags: function(parent) {
		let aTags = parent.querySelectorAll('a');
		aTags.forEach(aTag => {
			if (aTags.classList.contains('newLink')) {
				aTags.addEventListener('click', function(e) {
					e.preventDefault();
					CoCreateLogic.setLinkProcess(this);
				})
			}
		})
	},
	
	__deleteItem: function(data) {
		let collection = data['collection'];
		let document_id = data['document_id'];
		
		for (let i = 0; i < this.items.length; i++) {
			let item = this.items[i];
			
			if (item.filter.collection == collection) {
				var tmpId = item.el.getAttribute('data-template_id')
				var els = item.el.querySelectorAll("[templateId='" + tmpId + "'][data-document_id='" + document_id + "']");
				for (let j = 0; j < els.length; j++) {
					els[j].remove();
					item.startIndex--;
				}
			}
		}
	},
	
	__fetchedItem: function(data) {
		let item_id = data['element'];
		let item = g_cocreateFilter.getObjectByFilterId(this.items, item_id);
		
		if (item) {
			// eObj.startIndex += data.result.length;
			const result_data = data['data'];
			item.filter.startIndex += result_data.length;
		
			let eWrapper = item.el;
			if (item.filter.is_collection || item.fetch_type === 'collection') {
				this.__renderCollection(eWrapper, result_data);
			} else {
				this.__renderData(eWrapper, data['collection'], result_data);
			}
		}
	},
	
	__fetchedItems: function(data) {
		console.log(data);
		let item_id = data['element'];
		let item = g_cocreateFilter.getObjectByFilterId(this.items, item_id);
		
		if (item) {
			item.filter.startIndex += data['data'].length;
		
			let eWrapper = item.el;
			let collection = data['collection'];
			/**
			 *  data[data]= [
			 *    {item: info, position: 1}
			 *  ]
			 */
			 
			const self = this;
			data['data'].forEach((item, index) => {
				self.__renderData(eWrapper, collection, [item['item']], item['position']);
			})
		}
	},
	
	__createItem: function(data) {
		let collection = data['collection'];
		const self = this;
		this.items.forEach((item) => {
			item.fetch_ids = [];
			let ids = [];
			if (item.filter.collection === collection && 
					item.filter.fetch.value && 
					item.filter.fetch.value === data['data'][item.filter.fetch.name]
				) {
					ids.push(data['document_id']); 
			}
			
			if (ids.length > 0) {
				let info = g_cocreateFilter.makeFetchOptions(item.item);
				info['created_ids'] = ids;
				CoCreate.readDocumentList(info);
			}
		})
	},
	
	__cloneElement: function(clone_node, templateId, id) {
		let itemTemplateDiv = document.createElement('div');
		let template = clone_node.cloneNode(true);
		template.setAttribute('templateId', templateId);
		template.removeAttribute('id');
		template.classList.remove('template');
		if (id) {
			template.setAttribute('data-document_id', id);
		}
		itemTemplateDiv.appendChild(template.cloneNode(true));
		return itemTemplateDiv;
	},
	
	
	__setCommonValue: function(el, value) {
		if (value == null) {
			return;
		}
		if (el.hasAttribute('value')) {
			el.setAttribute('raw', true);
			el.setAttribute('value', value);
			el.textContent = value;
		}
		
		if (el.hasAttribute('data-value')) {
			el.setAttribute('data-value', value);
		}
	},
	
	//. public functions....
	reload: function(element) {
		
		if (!element || !element.getAttribute) {
			return;
		}
		this.__initEachElement(element, true)
	},
	
	findTemplateElByChild: function(element) {
		return CoCreateUtils.getParentFromElement(element, this.className);
	},
	
	updateParentTemplateOfChild: function(template, element) {
		var name = template.getAttribute('data-fetch_name')
		var value = template.getAttribute('data-fetch_value')
		var collection = template.getAttribute('data-fetch_collection')
		
		var document_id = element.getAttribute('data-document_id')
		
		if (!name) {
			return;
		}
		
		CoCreate.replaceDataCrdt({
			collection, 
			document_id, 
			name, 
			value, 
			update_crud: true
		})
	},
	
	reorderChildrenOfTemplate: function (template) {
		const orderField = template.getAttribute('data-order_by');
		const orderType = template.getAttribute('data-order_type') || 'asc';
		const collection = template.getAttribute('data-fetch_collection')
		const template_id = template.getAttribute('data-template_id')
		
		if (!orderField || !template_id) {
			return;
		}
		var children = template.querySelectorAll(`[data-template_id="${template_id}"][data-document_id]`)
		
		const coff = orderType == 'asc' ? 1 : -1;
		children.forEach((item, index) => {
			const document_id = item.getAttribute('data-document_id');
			CoCreate.replaceDataCrdt({
				collection, 
				document_id, 
				name: orderField, 
				value: index * coff, 
				update_crud: true})
		})
	}
}

/**
 * change name Class
 * add functionality to add value on any attr of each elements into template
 */
let debug = true
const CoCreateRender = {
	
	 print(message,debug) {
		debug = debug || false;
		if(debug)
			console.log(message)
	},
	
	findInJsonDeep : function(json,path) {
				try {
						if(typeof json == 'undefined')
								return false;
						let subpath = path.split('.');
						let find = subpath.shift();
						if (subpath.length > 0){
								return this.findInJsonDeep(json[find],subpath.join('.'))
						}
						let value = (Object.keys(json).indexOf(find) != -1) ? json[find] : false
						return value;
				}catch(error){
						this.print(['Error in findInJsonDeep',error],debug)
						return false;
				}
 },
 
	customFillElementTemplate: function(element,row,attr_name,value){
	
	},
	eachChildren:function(els,row){
			let that = this;
			els.forEach(e=>{
					if(e.children.length>0)
						that.eachChildren(Array.from(e.children),row)
					Array.from(e.attributes).forEach(attr=>{
							let value = false
							let attr_name = attr.name.toLowerCase();
							switch (attr_name) {
									case 'class':
											let list_class = []
											attr.value.split(' ').forEach(my_class=>{
													value = this.findInJsonDeep(row,my_class);
													list_class.push(typeof value != 'undefined' ? value : my_class)
											});
											if(list_class.length)
												value = list_class.join(' ')
											break;
									default:
											value = this.findInJsonDeep(row,attr.value);
							}
							
							if(value != false){
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
									}
									/*else{
										e.setAttribute(attr_name, value);
									}*/
								this.customFillElementTemplate(e,row,attr_name,value);
							}
							
					});
			});
	},
	template_id : function(type,dataResult) {
	 try{
		 let that  = this;
		 let template_div = document.querySelector('.template[data-template_id="'+type+'"]')
		 if (!template_div) return;
		 document.querySelectorAll('.clone_'+type).forEach(e => e.parentNode.removeChild(e));
		 dataResult.forEach(row=>{
				 let template = template_div.cloneNode(true);
				 template.classList.remove('template');
				 template.classList.add('clone_'+type);
				 that.eachChildren(Array.from(template.children),row);
				 template_div.insertAdjacentHTML('beforebegin', template.outerHTML);
		 })
	 }catch (error) {
			 this.print(['Error in Template',error],debug)
	 }
 } 

	
}//end CocreateResult

CoCreateTemplate.init();
// CoCreateInit.register('CoCreateTemplate', CoCreateTemplate, CoCreateTemplate.__initItem);