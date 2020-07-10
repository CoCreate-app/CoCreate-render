var eOBJs = [];
var templateWrapperClass="template-wrapper";


function initSocketsForEngine() {
  CoCreateSocket.listen('readDocumentList', function(data) {
    if (data.created_ids) {
      fetchedDocumentForEngine(data)
    } else {
      fetchedEngine(data);
    }
  })
  
  CoCreateSocket.listen('createDocument', function(data) {
    createdDocumentForEngine(data);
  })

  CoCreateSocket.listen('deleteDocument', function(data) {
    deletedDocumentForEngine(data);
  })

}

function initEngines(container) {
  let process_container = container || document;
  if (!process_container.querySelectorAll) {
    return;
  }
  let templateWrappers = process_container.querySelectorAll('.' + templateWrapperClass);
  
  if (templateWrappers.length == 0 && process_container != document && process_container.hasAttribute(templateWrapperClass)) {
    templateWrappers = [process_container];
  }
  
  for (let i=0; i < templateWrappers.length; i++) {
    let templateWrapper = templateWrappers[i];
    
    let filter = g_cocreateFilter.setFilter(templateWrapper, "data-template_id", "template");
    if (!filter) continue;
    
    if (CoCreateUtils.getInitialized(templateWrapper)) {
			continue;
		}
		CoCreateUtils.setInitialized(templateWrapper)
    
    /// check if there is search input

    let eObj = {
      el: templateWrapper,
      filter: filter,
      templateId: templateWrapper.getAttribute('data-template_id'),
      availableMore: true,
    }
    
    eOBJs.push(eObj);
    
    templateWrapper.addEventListener("changeFilterInput", function(e) {
      removeOldData(eObj.el)
      eObj.filter.startIndex = 0;
      g_cocreateFilter.fetchData(eObj.filter);
    })
    
    g_cocreateFilter.fetchData(filter);
  }
}

function initTemplateByElement(element, isInit) {
  
  let template_id = element.getAttribute('data-template_id');
  if (!template_id) {
    return;
  }
  
  let tempalteObj = g_cocreateFilter.getObjectByFilterId(eOBJs, template_id);
  let filter = null;

  if (!tempalteObj) {
    filter = g_cocreateFilter.setFilter(element, "data-template_id", "template");
    if (!filter) {
      return;
    }
    
    tempalteObj = {
      el: element,
      filter: filter,
      templateId: template_id,
      availableMore: true,
    }
    
    eOBJs.push(tempalteObj);
    
    element.addEventListener("changeFilterInput", function(e) {
      removeOldData(tempalteObj.el)
      tempalteObj.filter.startIndex = 0;
      g_cocreateFilter.fetchData(tempalteObj.filter);
    })
  } else {
    filter = tempalteObj.filter
    g_cocreateFilter.changeCollection(filter);
    if (isInit) {
      removeOldData(element);
      filter.startIndex = 0;
    }
  }
  
  g_cocreateFilter.fetchData(filter);
}

function fetchedEngine(data) {
  let eId = data['element'];
  let eObj = g_cocreateFilter.getObjectByFilterId(eOBJs, eId);
  
  if (eObj) {
    // eObj.startIndex += data.result.length;
    const result_data = data['data'];
    eObj.filter.startIndex += result_data.length;
  
    let eWrapper = eObj.el;
    if (eObj.filter.is_collection) {
      showCollectionListEngine(eWrapper, result_data);
    } else {
      showFetchedEngine(eWrapper, data['collection'], result_data);
    }
  }
}

function showCollectionListEngine(wrapper, items) {
  let template = wrapper.querySelector('.template');
  if (!template) return;
  
  let templateId = wrapper.getAttribute('data-template_id');
  let passTo = wrapper.getAttribute('data-pass_to');
   
  let templateDiv = document.createElement('div');
  
  let template_node = wrapper.querySelector('.template');
  
  if (template_node.getAttribute('data-template_id') != templateId) {
    template_node = wrapper.querySelector('template-wrapper >.template');
  }
  
  for (let k = 0; k < items.length; k++) {
    
    let collection_info = items[k];
    let itemTemplateDiv = document.createElement('div');
    let template = template_node.cloneNode(true);
    template.removeAttribute('id');
    template.classList.remove('template');
    template.setAttribute('templateId', templateId);
    itemTemplateDiv.appendChild(template.cloneNode(true));

    let displayList = itemTemplateDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, p, i, q, a, b, li, span, code, img');
    let aTags = itemTemplateDiv.getElementsByTagName('a');
    
    for (let i = 0; i < displayList.length; i++) {
      
      let display = displayList[i];
      let pass_id = display.getAttribute('data-pass_id');
      if (passTo && passTo == pass_id) {
        if (display.hasAttribute('data-value')) {
          display.setAttribute('data-value', collection_info['name'])
        }
        if (display.getAttribute("name") == "name" || display.classList.contains("collection-name")) {
          display.textContent = collection_info['name'];
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
}


function showFetchedEngine(wrapper, collection, items, position) {

  let template = wrapper.querySelector('.template');
  if (!template) return;
  
  let ids = [];
  items.forEach(function(item) {
    ids.push(item['_id']);
  })

  let result = getEngineResltTemplate(wrapper, collection, ids);

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
  
  initNewAtags(wrapper.parentNode);
  
  /// init passValueBtns
  let forms = wrapper.parentNode.getElementsByTagName('form');
  
  for (let i=0; i < forms.length; i++) {
    let form = forms[i];
    
    let valuePassBtn = form.querySelector('.passValueBtn');
    
    if (valuePassBtn) CoCreateLogic.__registerValuePassBtnEvent(form, valuePassBtn);
  }
  
  CoCreate.fetchModules(wrapper.parentNode);
  //. re-init....
  
  initEngines(wrapper)
  
  CoCreate.initModules(wrapper.parentNode)
}


function createdDocumentForEngine(data) {
  let collection = data['collection'];

  for (let i=0; i < eOBJs.length; i++) {
    let eObj = eOBJs[i];
    eObj.fetch_ids = [];
    let ids = [];

    if (eObj.filter.collection == collection) {
      if (eObj.filter.fetch.value && eObj.filter.fetch.value === data['data'][eObj.filter.fetch.name]) {
        ids.push(data['document_id']);
      }
    }
    
    if (ids.length > 0) {
      let info = g_cocreateFilter.makeFetchOptions(eObj.item);
      info['created_ids'] = ids;
      CoCreate.readDocumentList(info);
    }
  }
}

function fetchedDocumentForEngine(data) {
  console.log(data);
  let eId = data['element'];
  let eObj = g_cocreateFilter.getObjectByFilterId(eOBJs, eId);
  
  if (eObj) {
    eObj.filter.startIndex += data['data'].length;
  
    let eWrapper = eObj.el;
    let collection = data['collection'];
    /**
     *  data[data]= [
     *    {item: info, position: 1}
     *  ]
     */
    data['data'].forEach((item, index) => {
      showFetchedEngine(eWrapper, collection, [item['item']], item['position']);
    })
  }
}


function deletedDocumentForEngine(data) {
  let collection = data['collection'];
  let document_id = data['document_id'];
  
  for (let i=0; i < eOBJs.length; i++) {
    let eObj = eOBJs[i];
    
    if (eObj.filter.collection == collection) {
      var tmpId = eObj.el.getAttribute('data-template_id')
      var els = eObj.el.querySelectorAll("[templateId='" + tmpId + "'][data-document_id='" + document_id + "'");
      for (let j = 0; j < els.length; j++) {
        els[j].remove();
        eObj.startIndex--;
      }
    }
  }
}

// function deletedDocumentsForEngine(data) {
//   let collection = data['data-collection'];
//   let ids = data['ids'];
  
//   for (let i=0; i < eOBJs.length; i++) {
//     let eObj = eOBJs[i];
    
//     if (eObj.filter.collection == collection) {
//       for (let j = 0; j < ids.length; j++) {
//         var tmpId = eObj.el.getAttribute('data-template_id')
//         var els = eObj.el.querySelectorAll("[templateId='" + tmpId + "'][data-document_id='" + ids[i] + "'");
//         for (let k = 0; k < els.length; k++) {
//           els[k].remove();
//         }
//       }
//     }
//   }
// }

function getEngineResltTemplate(wrapper, collection, ids) {
  let templateId = wrapper.getAttribute('data-template_id');
  let passTo = wrapper.getAttribute('data-pass_to');

   
  let templateDiv = document.createElement('div');
  
  let template_node = wrapper.querySelector('.template');
  let new_tempate_id = template_node.getAttribute('data-template_id');
  if (new_tempate_id && new_tempate_id != templateId) {
    template_node = wrapper.querySelector('template-wrapper >.template');
  }
  //console.log(ids);
  
  for (let k=0; k < ids.length; k++) {
    let id = ids[k];
    
    let itemTemplateDiv = document.createElement('div');
    let template = template_node.cloneNode(true);
    template.setAttribute('templateId', templateId);
    template.removeAttribute('id');
    template.classList.remove('template');
    template.setAttribute('data-document_id', id);
    itemTemplateDiv.appendChild(template.cloneNode(true));
  
    // templateDiv.appendChild(itemTemplateDiv);
    
    /////  fetch data for h1, h2, h3, h4, h5 ,h6, p, i, q, a, b, li, span, code
    let displayList = itemTemplateDiv.querySelectorAll('div, h1, h2, h3, h4, h5, h6, p, i, q, a, b, li, span, code, img, tr, td');
  
    let inputList = itemTemplateDiv.getElementsByTagName('input');
    let textareaList = itemTemplateDiv.getElementsByTagName('textarea');
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
    inputList = itemTemplateDiv.querySelectorAll('input, textarea');
    
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
}


function removeOldData(wrapper) {
  let templateId = wrapper.getAttribute('data-template_id');
  
  let olds = wrapper.querySelectorAll("[templateId='" + templateId + "']");
  
  for (let i=0; i < olds.length; i++) {
    olds[i].remove();
  }
}

function initNewAtags(parent) {
  let aTags = parent.querySelectorAll('a');
  
  for (let i=0; i<aTags.length; i++) {
    if (aTags[i].classList.contains('newLink')) {
      initNewATag(aTags[i]);  
    }
    
  }
}

function initNewATag(aTag) {
	
	let href = aTag.getAttribute('href');

	if (CoCreateLogic.checkOpenCocreateModal(aTag)) {
	  aTag.addEventListener('click', function(e) {
	    e.preventDefault();
		  CoCreateLogic.storePassData(aTag);
			g_cocreateWindow.openWindow(aTag);
		})
	} else if (href) {
		aTag.addEventListener('click', function(e) {
		  e.preventDefault();
		  CoCreateLogic.storePassData(aTag);
			CoCreateLogic.openAnother(aTag);
		})
	} else {
	 
	}
}

function initLoadMoreButtons() {
  let loadMoreBtns = document.querySelectorAll('.loadMore');
  
  for (let i=0; i < loadMoreBtns.length; i++) {
    let loadMoreBtn = loadMoreBtns[i];
    
    loadMoreBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      let eId = this.getAttribute("data-template_id");
      
      if (!eId) return;
      
      let eObj = g_cocreateFilter.getObjectByFilterId(eOBJs, eId);
      
      console.log(eObj, eId);
      if (!eObj) return;
      
      if (eObj.filter.count > 0) {
        g_cocreateFilter.fetchData(eObj.filter)
        
      }
    })
  }
}

function findTemplateElByChild(element) {
  return CoCreateUtils.getParentFromElement(element, templateWrapperClass);
}

function updateParentTemplateOfChild(template, element) {
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
}

function reorderChildrenOfTemplate(template) {
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

/** init **/
initEngines();
initSocketsForEngine();
initLoadMoreButtons();

const CoCreateTemplate = {

  reload(element) {
    
    if (!element || !element.getAttribute) {
      return;
    }
    initTemplateByElement(element, true)
  }
}



CoCreateInit.register('CoCreateTemplate', window, initEngines);

