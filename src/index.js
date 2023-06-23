/*globals CustomEvent*/
import action from '@cocreate/actions';
import observer from '@cocreate/observer';
import uuid from '@cocreate/uuid';
import { queryDocumentSelector, getValueFromObject, dotNotationToObject } from '@cocreate/utils';
import '@cocreate/element-prototype';
import './index.css';

const CoCreateRender = {

    __getValue: function (data, attrValue, el) {
        let result = /{{\s*([\w\W]+)\s*}}/g.exec(attrValue);
        if (result) {
            let value = getValueFromObject(data, result[1].trim());
            if (!value && value !== '') {
                let parentTemplate
                if (el && el.nodeType == 1) {
                    if (el.hasAttribute('templateid') && el.parentElement)
                        parentTemplate = el.parentElement.closest('[templateid]')
                    else
                        parentTemplate = el.closest('[templateid]')
                }

                if (parentTemplate) {
                    do {
                        if (parentTemplate.CoCreate
                            && parentTemplate.CoCreate.render
                            && parentTemplate.CoCreate.render.data)
                            value = getValueFromObject(parentTemplate.CoCreate.render.data, result[1].trim());

                        if (!value && parentTemplate.parentElement)
                            parentTemplate = parentTemplate.parentElement
                        else
                            parentTemplate = ""

                    } while (!value && parentTemplate)
                }
            }
            return value;
        }
        return false;
    },

    __createObject: function (data, path) {
        try {
            if (!path) return data;

            let keys = path.split('.');
            let newObject = data;

            for (var i = keys.length - 1; i >= 0; i--) {
                newObject = { [keys[i]]: newObject };
            }
            return newObject;

        } catch (error) {
            console.log("Error in getValueFromObject", error);
            return false;
        }
    },

    __replaceValue: function (data, inputValue, renderKey, el) {
        let outputValue = inputValue;
        let placeholders = inputValue.match(/{{([A-Za-z0-9_.,\[\]\- ]*)}}/g);
        if (placeholders) {
            for (let placeholder of placeholders) {
                let value = this.__getValue(data, placeholder, el);

                if (value || value === "") {
                    if (typeof (value) == "object")
                        value = this.generateString(value)

                    outputValue = outputValue.replace(placeholder, value);
                } else if (renderKey && placeholder.includes(`{{${renderKey}.`)) {
                    outputValue = '';
                }
            }
        }
        return outputValue;
    },

    generateString: function (value, str = '') {
        // let str = '';
        // do {
        let flag = true;
        if (str)
            flag = false;
        for (const key of Object.keys(value)) {
            let val = value[key]
            if (typeof (val) == "object") {
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

    render: function (template, data) {
        const self = this;
        let arrayData = data;

        let exclude = template.getAttribute('render-exclude') || ''
        if (exclude) {
            exclude = exclude.replace(/ /g, '').split(",")
            if (!Array.isArray(exclude))
                exclude = [exclude]
        }

        let isRenderObject
        let dataKey = template.getAttribute('render') || ""
        if (dataKey) {
            arrayData = getValueFromObject(data, dataKey);
            if (!Array.isArray(arrayData)) {
                if (typeof arrayData === 'object') {
                    isRenderObject = true
                } else {
                    console.log(dataKey, 'value must be an objec or an array')
                }
            }
        }

        let renderKey = template.getAttribute('render-key') || dataKey;

        if (!template.CoCreate)
            template.CoCreate = { render: { keys: new Map() } }
        else if (!template.CoCreate.render)
            template.CoCreate.render = { keys: new Map() }
        else if (!template.CoCreate.render.keys)
            template.CoCreate.render.keys = new Map()

        const templateRenderKeys = template.CoCreate.render.keys
        if (isRenderObject && dataKey) {
            let array = self.renderObject(arrayData, renderKey, exclude)
            for (let item of array) {
                if (!templateRenderKeys.has(item[renderKey].key)) {
                    templateRenderKeys.set(item[renderKey].key, '')
                    let cloneEl = this.cloneEl(template);
                    cloneEl.setAttribute('renderedKey', item[renderKey].key)
                    self.setValue([cloneEl], item, dataKey, renderKey);
                    template.insertAdjacentElement('beforebegin', cloneEl);
                }
            }
        } else {
            if (!Array.isArray(arrayData))
                arrayData = getValueFromObject(data, dataKey);

            if (!arrayData) {
                let cloneEl = this.cloneEl(template);
                self.setValue([cloneEl], data, dataKey, renderKey);
                template.insertAdjacentElement('beforebegin', cloneEl);
            }

            if (!Array.isArray(arrayData))
                arrayData = [arrayData]

            if (Array.isArray(arrayData)) {
                arrayData.forEach((item) => {
                    if (!templateRenderKeys.has(item)) {
                        templateRenderKeys.set(item, '')

                        let cloneEl = this.cloneEl(template);
                        let object = self.__createObject(item, renderKey);
                        self.setValue([cloneEl], object, dataKey, renderKey);
                        template.insertAdjacentElement('beforebegin', cloneEl);
                    }
                });
            }
        }
    },

    renderObject: function (data, renderKey, exclude) {
        let array = []
        if (!data)
            return array
        for (const key of Object.keys(data)) {
            let value = data[key]
            if (!exclude.includes(key)) {
                let type = 'string';
                if (typeof (value) == "object")
                    if (Array.isArray(value))
                        type = 'array'
                    else
                        type = 'object'
                array.push({ [renderKey]: { key, value, type } })
            }
        }
        return array
    },

    cloneEl: function (template) {
        let cloneEl = template.cloneNode(true);

        if (template.CoCreate)
            cloneEl.CoCreate = template.CoCreate
        else
            cloneEl.CoCreate = {}

        if (cloneEl.CoCreate.render)
            cloneEl.CoCreate.render.template = template
        else
            cloneEl.CoCreate.render = { template }

        let templateId = cloneEl.getAttribute('template_id');
        if (!templateId)
            templateId = cloneEl.getAttribute('template');

        if (templateId) {
            cloneEl.setAttribute('templateId', templateId);
            cloneEl.removeAttribute('template_id');
            cloneEl.removeAttribute('template');
        }

        if (cloneEl.tagName == 'TEMPLATE') {
            cloneEl = template.content.firstElementChild
            for (let attribute of template.attributes) {
                let attrName = attribute.name;
                let attrValue = attribute.value || '';
                cloneEl.setAttribute(attrName, attrValue);
            }
        }
        else {
            cloneEl.classList.remove('template');
            cloneEl.removeAttribute('template');
        }
        cloneEl.setAttribute('render-clone', '');

        return cloneEl;
    },

    document_id: '',
    setValue: function (els, data, renderArray, renderKey) {
        if (!data) return;
        let isRenderKey
        if (data.renderKey)
            isRenderKey = true

        const that = this;
        Array.from(els).forEach(el => {
            let updateData;
            let renderedValue, renderMap
            if (el.CoCreate && el.CoCreate.render) {
                renderMap = el.CoCreate.render.renderMap
                renderedValue = el.CoCreate.render.renderedValue
            }
            if (el.nodeType == 1) {
                if (el.hasAttribute('render-clone')) {
                    el.CoCreate.render.data = { ...data }

                    // if (!el.CoCreate.render)
                    //     el.CoCreate.render = { data }
                    // else if (!el.CoCreate.render.data)
                    //     el.CoCreate.render.data = {...data}
                    // else if (Object.keys(el.CoCreate.render.data == Object.keys(data)[0])) {
                    //     el.CoCreate.render.data = { ...data }
                    // }

                }

                if (renderMap && !isRenderKey) {
                    let placeholder = renderMap.get(el)
                    if (placeholder) {
                        renderKey = placeholder.renderKey
                        renderArray = placeholder.renderArray
                        if (renderArray && Array.isArray(data[renderArray]))
                            updateData = data[renderArray][0]
                        else if (data[renderArray])
                            updateData = data[renderArray]

                        if (renderKey) {
                            if (updateData)
                                updateData = { [renderKey]: updateData }
                            else
                                updateData = { [renderKey]: data }
                        }

                        let textContent = placeholder.placeholder
                        let text = that.__replaceValue(updateData, textContent, renderKey, el);
                        if (text && text != renderedValue)
                            el.innerHTML = placeholder.placeholder
                    }
                }

                Array.from(el.attributes).forEach(attr => {
                    let attr_name = attr.name.toLowerCase();
                    let attrValue = attr.value;
                    let placeholder
                    if (!attr.CoCreate)
                        attr.CoCreate = { render: {} }
                    else if (!attr.CoCreate.render)
                        attr.CoCreate.render = {}

                    if (attr.CoCreate.render.renderMap)
                        placeholder = attr.CoCreate.render.renderMap.get(attr)
                    else
                        that.renderMap(attr, attr.value, renderArray, renderKey)

                    if (placeholder && !isRenderKey) {
                        let temp = placeholder.placeholder;
                        // let updateData
                        // renderKey = placeholder.renderKey
                        // renderArray = placeholder.renderArray
                        // if (renderArray && Array.isArray(data[renderArray]))
                        // 	updateData = data[renderArray][0]
                        // else if (data[renderArray])
                        // 	updateData = data[renderArray]

                        // if (renderKey) {
                        // 	if (updateData)
                        // 		updateData = {[renderKey]: updateData}
                        // 	else
                        // 		updateData = {[renderKey]: data}
                        // }
                        if (updateData)
                            attrValue = that.__replaceValue(updateData, temp, renderKey, el);
                        if (attrValue == attr.value)
                            attrValue = undefined
                    }
                    else
                        attrValue = that.__replaceValue(data, attrValue, renderKey, el);

                    // TODO: support attibute name replace if has {{}}
                    // attr_name = that.__replaceValue(data, attr_name, renderKey, el);

                    if (attrValue || attrValue == "") {
                        el.setAttribute(attr_name, attrValue);
                    }
                });

                if (CoCreate.pass) {
                    if (el.hasAttribute('[pass_id]'))
                        CoCreate.pass.initElement(el)
                }

                if (el.tagName === 'SCRIPT' && el.src) {
                    if (el.src.includes('CoCreate.js') || el.src.includes('CoCreate.min.js')) {
                        el.remove()
                        return
                    }
                }

                if (el.tagName === 'LINK' && el.href) {
                    if (el.href.includes('CoCreate.css') || el.href.includes('CoCreate.min.css')) {
                        el.remove()
                        return
                    }
                }

                if (el.childNodes.length > 0) {
                    that.setValue(el.childNodes, updateData || data, renderArray, renderKey);
                }

                if ((el.tagName == 'TEMPLATE' || el.hasAttribute('template') || el.classList.contains('template')) && !el.hasAttribute('template_id')) {
                    if (el.getAttribute('render'))
                        that.render(el, data);
                }

            }

            if (el.nodeType == 3) {
                let valueType = el.parentElement.getAttribute('value-type')

                let textContent, placeholder, text;
                if (renderMap)
                    placeholder = renderMap.get(el)
                if (placeholder && !isRenderKey) {
                    let updateData = data;
                    textContent = placeholder.placeholder
                    renderKey = placeholder.renderKey
                    renderArray = placeholder.renderArray
                    if (renderArray && Array.isArray(data[renderArray]))
                        updateData = data[renderArray][0]
                    else
                        updateData = data[renderArray]
                    if (renderKey)
                        updateData = { [renderKey]: updateData }
                    text = that.__replaceValue(updateData, textContent, renderKey, el);
                }

                if (!placeholder && !text) {
                    textContent = el.textContent;
                    if (!renderMap)
                        that.renderMap(el, textContent, renderArray, renderKey)
                    text = that.__replaceValue(data, textContent, renderKey, el);
                }

                if (text || text == "") {
                    if (text != renderedValue) {
                        if (el.CoCreate && el.CoCreate.render)
                            el.CoCreate.render.renderedValue = text

                        if (valueType == 'text' || valueType == 'string') {
                            el.textContent = text;
                        } else {
                            const newNode = document.createElement('div');
                            newNode.innerHTML = text;
                            let parentElement = el.parentElement

                            let parentRenderMap;
                            if (!parentElement.CoCreate)
                                parentElement.CoCreate = { render: {} }
                            else if (!parentElement.CoCreate.render)
                                parentElement.CoCreate.render = {}
                            else {
                                parentRenderMap = parentElement.CoCreate.render.renderMap
                            }

                            parentElement.CoCreate.render.renderedValue = text

                            if (!parentRenderMap) {
                                that.renderMap(parentElement, textContent, renderArray, renderKey)
                            } else if (!parentRenderMap.has(parentElement))
                                that.renderMap(parentElement, textContent, renderArray, renderKey)
                            el.replaceWith(...newNode.childNodes)

                            if (el.childNodes.length > 0) {
                                that.setValue(el.childNodes, updateData || data, renderArray, renderKey);
                            }
                        }
                    }
                }
            }
        });
    },

    renderMap: function (node, placeholder, renderArray, renderKey) {
        if (!node.CoCreate)
            node.CoCreate = { render: {} }
        else if (!node.CoCreate.render)
            node.CoCreate.render = {}

        if (!node.CoCreate.render.renderMap)
            node.CoCreate.render['renderMap'] = new Map();

        if (placeholder && renderKey)
            node.CoCreate.render['renderMap'].set(node, { placeholder, renderArray, renderKey })
    },

    data: function (Data) {
        if (Data.selector) {
            let template = queryDocumentSelector(Data.selector);
            if (!template) return;
            if (template.tagName == 'TEMPLATE' || template.hasAttribute('template') || template.classList.contains('template')) {
                if (template.CoCreate && template.CoCreate.render)
                    template.CoCreate.render.keys = undefined

                this.render(template, Data.data);
            }
            else
                this.setValue([template], Data.data);
        } else if (Data.elements) {
            if (Data.elements.length == 1 && (Data.elements[0].tagName == 'TEMPLATE' || Data.elements[0].hasAttribute('template') || Data.elements[0].classList.contains('template'))) {
                this.render(Data.elements[0], Data.data);
            }
            else
                this.setValue(Data.elements, Data.data);
        }

    }

};

function renderKey(element, params) {
    // TODO: custom render-keys 
    const form = element.closest("form") || document;
    if (!params)
        params = 'render-key'

    let data = {}
    let selector = `[${params}]`
    let elements = form.querySelectorAll(selector);
    for (let el of elements) {
        let attribute = el.getAttribute(params)
        if (attribute)
            data[attribute] = el.getValue()
    }
    data = dotNotationToObject(data)
    let renderData = { data: { [params]: data } }

    let templateSelector = `[template_id='${params}']`
    let template = document.querySelectorAll(templateSelector);
    if (template)
        renderData.elements = template
    else
        renderData.selector = `[template='${params}']`

    CoCreateRender.data(renderData);

    document.dispatchEvent(new CustomEvent('renderKey', {
        detail: { data }
    }));
}

action.init({
    name: "renderKey",
    callback: (data) => {
        renderKey(data.element, data.params);
    }
});

observer.init({
    name: 'render',
    observe: ['addedNodes'],
    target: '[render]',
    callback: function (mutation) {
        let element = mutation.target
        element.removeAttribute('render')

        let parentElement = element.parentElement
        if (parentElement) {
            let el = element
            let parentKeys = [];
            let renderedData = new Map();
            do {
                let data;
                el = el.parentElement
                if (el) {
                    if (el.hasAttribute('render-clone'))
                        data = el.CoCreate.render.data
                    if (data) {
                        renderedData.set(data, '')
                    }
                    let parentKey = el.getAttribute('parentKey')
                    if (parentKey && parentKey != null) {
                        if (/^\d+$/.test(parentKey))
                            parentKey = `[${parentKey}]`
                        parentKeys.push(parentKey)
                    }
                }
            } while (el)

            let renderKey = element.getAttribute('render-key')

            let parentKey;
            parentKey = parentElement.getAttribute('parentKey')
            if (renderKey == '$auto' || parentKey || parentKeys) {
                let template = element.outerHTML
                if (renderKey) {
                    template = template.replace(/\$auto/g, uuid.generate(6));
                }
                if (parentKeys.length > 0) {
                    let string = ''
                    if (parentKeys.length == 1) {
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

                parentElement.innerHTML = template

            }

            element = parentElement.firstElementChild
            let obj = {}
            let array = Array.from(renderedData.keys())
            for (let data of array.reverse()) {
                obj = { ...obj, ...data }
            }

            CoCreateRender.data({
                elements: [element],
                data: obj
            });
        }
    }
});

export default CoCreateRender;