/*globals CustomEvent*/
import Actions from '@cocreate/actions';
import Observer from '@cocreate/observer';
import uuid from '@cocreate/uuid';
import { queryDocumentSelector, queryDocumentSelectorAll, getValueFromObject, dotNotationToObject } from '@cocreate/utils';
import '@cocreate/element-prototype';
import './index.css';

const sources = new Map()
const renderedNodes = new Map()

function init(element) {
    if (element && !(element instanceof HTMLCollection) && !Array.isArray(element))
        element = [element]
    else if (!element)
        element = document.querySelectorAll('[render-selector]')

    for (let i = 0; i < element.length; i++) {
        let selector = element[i].getAttribute('render-selector')
        if (!selector) return

        let source = sources.get(element[i])
        if (!source || source && source.selector !== selector) {
            sources.set(element[i], { element: element[i], selector })
            element[i].setValue = (data) => {
                // TODO: something to dertimine if its from crud. crudTpye, action??
                let index
                if (data.filter && data.filter.index)
                    index = data.filter.index
                render({ source: element[i], data, index })
            }
            element[i].getValue = () => sources.get(element[i]).data
        }
    }
}

function renderTemplate(template, data, key, index, dotNotation) {
    if (!key)
        key = template.getAttribute('render')

    if (!dotNotation)
        dotNotation = key

    let templateData = renderedNodes.get(template)
    if (!templateData) {
        templateData = { element: template, keys: new Map(), clones: new Map(), data, dotNotation, renderKeys: new Map() }
        renderedNodes.set(template, templateData)
    }

    templateData.parent = template.parentElement.closest('[render]')
    if (templateData.parent)
        templateData.parent = renderedNodes.get(templateData.parent)

    template = templateData

    let renderData = getRenderValue(template.element, data, key)
    if (!renderData) return

    if (index === 0) {
        for (const [key, element] of template.clones) {
            renderedNodes.delete(element)
            element.remove()
            template.clones.delete(key)
        }
        template.data = data
    } else if (index) {
        // updates data that has already been rendered
        template.data = dotNotationToObject(renderData, template.data)
    }

    let renderKey = template.element.getAttribute('render-key') || key;

    if (key && !Array.isArray(renderData)) {
        let exclude = template.element.getAttribute('render-exclude') || ''
        if (exclude) {
            exclude = exclude.replace(/ /g, '').split(",")
            if (!Array.isArray(exclude))
                exclude = [exclude]
        }

        const keys = Object.keys(renderData)
        for (let i = 0; i < keys.length; i++) {
            if (exclude.includes(keys[i]))
                continue

            let value = renderData[keys[i]]
            let type = 'string';
            let keyPath = 'string';

            if (Array.isArray(value))
                type = 'array'
            else if (typeof (value) == "object")
                type = 'object'

            let Data = { [renderKey]: { key: keys[i], value, type } }

            if (!template.keys.has(Data[renderKey].key)) {
                template.keys.set(Data[renderKey].key, Data)
                let clone = cloneTemplate(template);
                clone.setAttribute('renderedKey', Data[renderKey].key)
                renderValues(clone, Data, keys[i], renderKey);
                insertElement(template, clone, index);
            }

        }
    } else {
        if (!key) {
            key = 'data'
            renderData = getValueFromObject(renderData, key);
            if (!renderKey)
                renderKey = key
        }

        if (!renderData) {
            let clone = cloneTemplate(template);
            renderValues(clone, data, key, renderKey);
            insertElement(template, clone, index);
        } else {
            if (!Array.isArray(renderData))
                renderData = [renderData]

            renderData.forEach((item) => {
                if (!template.keys.has(item)) {
                    template.keys.set(item, '')

                    let clone = cloneTemplate(template);
                    let object = { [renderKey]: item }
                    if (renderKey.includes('.'))
                        object = dotNotationToObject(object);
                    renderValues(clone, object, key, renderKey);
                    insertElement(template, clone, index);
                }
            });
        }
    }
}

function cloneTemplate(template) {
    let clone = template.element.cloneNode(true);

    if (clone.tagName == 'TEMPLATE') {
        clone = template.element.content.firstElementChild
        for (let attribute of template.element.attributes) {
            clone.setAttribute(attribute.name, attribute.value || '');
        }
    } else {
        clone.classList.remove('template');
        clone.removeAttribute('template');
    }

    clone.setAttribute('render-clone', '');

    let renderKey = clone.getAttribute('render-key')
    if (renderKey) {
        clone = clone.outerHTML.replace(/\$auto/g, renderKey);
    } else {
        clone = clone.outerHTML;
    }

    if (typeof clone === 'string') {
        let container = document.createElement('div');
        container.innerHTML = clone;
        clone = container.firstChild
        container.remove()
    }

    renderedNodes.set(clone, { template })
    return clone;
}

function insertElement(template, element, index) {
    if (index !== null && index >= 0) {
        const clones = Array.from(template.clones);

        // Insert a new item at a specific index in the array
        let eid = element.getAttribute('eid')
        if (eid && !template.clones.has(eid)) {
            const newEntry = [eid, element];
            clones.splice(index, 0, newEntry);
        }

        if (clones[index])
            clones[index].insertAdjacentElement('beforebegin', element);
        else if (clones[index - 1])
            clones[index - 1].insertAdjacentElement('afterend', element);
        else
            template.element.insertAdjacentElement('beforebegin', element);

        template.clones = new Map(clones);
    } else {
        template.element.insertAdjacentElement('beforebegin', element);
    }
}

function renderValues(node, data, key, renderKey) {
    if (!data) return;
    let isRenderKey
    // if (data.renderKey)
    //     isRenderKey = true

    let updateData, renderedValue, placeholder;
    let renderedNode = renderedNodes.get(node)

    if (!renderedNode)
        renderedNode = { key, renderKey }

    if (!renderedNode.key)
        renderedNode.key = key
    else if (!key)
        key = renderedNode.key

    if (!renderedNode.renderKey)
        renderedNode.renderKey = renderKey
    else if (!renderKey)
        renderKey = renderedNode.renderKey


    if (node.nodeType == 1) {
        if (node.hasAttribute('render-clone')) {
            if (renderedNode.template) {
                if (renderedNode.template.renderKeys)
                    renderedNode.template.renderKeys.set(renderKey, key)
                renderedNode.dotNotation = key

                if (key.includes('.')) {
                    let keys = key.split('.')
                    for (i = 0; i < keys.length; i++) {
                        renderedNode.dotNotation += renderedNode.template.renderKeys.get(keys[i]) || keys[i]
                    }
                }
            }

            for (let eid of ['_id', 'name', 'key']) {
                eid = data[renderKey][eid]
                if (eid) {
                    let oldEid = renderedNode.eid
                    if (oldEid !== eid) {
                        renderedNode.template.clones.delete(oldEid)
                    }

                    renderedNode.eid = eid
                    renderedNode.template.clones.set(eid, node)

                    node.setAttribute('eid', eid)
                    break
                }
            }
        }

        if (placeholder && !isRenderKey) {
            if (key && Array.isArray(data[key]))
                updateData = data[key][0]
            else if (data[key])
                updateData = data[key]

            if (renderKey) {
                if (updateData)
                    updateData = { [renderKey]: updateData }
                else
                    updateData = { [renderKey]: data }
            }

            let textContent = placeholder
            let text = renderValue(node, updateData, textContent, renderKey, renderedNode);
            if (text && text != renderedValue)
                node.innerHTML = placeholder
        }

        Array.from(node.attributes).forEach(attr => {
            let name = attr.name;
            let value = attr.value;

            let renderedAttribute = renderedNodes.get(attr)
            if (!renderedAttribute) {
                renderedAttribute = { placeholder: { name, value }, key, renderKey }
                name = renderValue(attr, data, name, renderKey, renderedAttribute);
                value = renderValue(attr, data, value, renderKey, renderedAttribute);
            } else if (!isRenderKey && renderedAttribute.placeholder) {
                let temp = renderedAttribute.placeholder
                if (updateData) {
                    name = renderValue(attr, updateData, temp.name, renderKey, renderedAttribute);
                    value = renderValue(attr, updateData, temp.value, renderKey, renderedAttribute);
                }
            } else {
                name = renderValue(attr, data, name, renderKey, renderedAttribute);
                value = renderValue(attr, data, value, renderKey, renderedAttribute);
            }

            if (name === undefined && name === null) {
                renderedNodes.delete(attr)
                node.removeAttribute(attr.name);
            } else if ((value || value === "") && (name !== attr.name || value !== attr.value))
                node.setAttribute(name, value);

        });

        if (CoCreate.pass) {
            if (node.hasAttribute('[pass_id]'))
                CoCreate.pass.initElement(node)
        }

        if (node.tagName === 'SCRIPT' && node.src) {
            if (node.src.includes('CoCreate.js') || node.src.includes('CoCreate.min.js')) {
                node.remove()
                return
            }
        }

        if (node.tagName === 'LINK' && node.href) {
            if (node.href.includes('CoCreate.css') || node.href.includes('CoCreate.min.css')) {
                node.remove()
                return
            }
        }
        if (node.getAttribute('render') && !node.hasAttribute('render-clone')) {
            renderTemplate(node, data);
        } else if (node.childNodes.length > 0) {
            Array.from(node.childNodes).forEach(childNode => {
                renderValues(childNode, updateData || data, key, renderKey);
            });
        }

    } else if (node.nodeType == 3) {
        let valueType = node.parentElement.getAttribute('value-type')

        let textContent, text;
        if (placeholder && !isRenderKey) {
            let updateData = data;
            textContent = placeholder
            if (key && Array.isArray(data[key]))
                updateData = data[key][0]
            else
                updateData = data[key]
            if (renderKey)
                updateData = { [renderKey]: updateData }
            text = renderValue(node, updateData, textContent, renderKey, renderedNode);
        }

        if (!placeholder && !text) {
            textContent = node.textContent;
            renderedNode.placeholder = textContent
            text = renderValue(node, data, textContent, renderKey, renderedNode);
        }

        if (text || text == "") {
            if (text != renderedValue) {
                renderedNode.text = text

                if (valueType == 'text' || valueType == 'string') {
                    node.textContent = text;
                } else {
                    const newNode = document.createElement('div');
                    newNode.innerHTML = text;
                    let parentElement = node.parentElement

                    let renderedParent = renderedNodes.get(parentElement)
                    if (!renderedParent) {
                        renderedParent = { placeholder: textContent, key, renderKey }
                    }
                    renderedParent.renderedValue = text
                    node.replaceWith(...newNode.childNodes)
                }

                if (node.childNodes.length > 0) {
                    Array.from(node.childNodes).forEach(childNode => {
                        renderValues(childNode, updateData || data, key, renderKey);
                    });
                }
            }
        }
    }
}

function renderValue(node, data, placeholder, renderKey, renderedNode) {
    let output = placeholder;

    if (placeholder.match(/{{(.*?)}}/)) {
        if (renderedNode) {
            renderedNodes.set(node, renderedNode)
        }

        let match
        do {
            match = output.match(/{{([A-Za-z0-9_.,\[\]\- ]*)}}/);

            if (match) {
                if (match[1] == 'document.created.on')
                    console.log('aaaaaa')

                let value = getRenderValue(node, data, match[1], renderKey)

                if (value || value === "") {
                    if (typeof value === "object")
                        value = JSON.stringify(value, null, 2)

                    output = output.replace(match[0], value);
                } else if (renderKey) {
                    if (match[0].startsWith(`{{${renderKey}.`)) {
                        output = output.replace(match[0], "");
                    } else {
                        match = null
                    }
                } else {
                    match = null
                }
            }

        } while (match)
    }
    return output;
}

function getRenderValue(node, data, key, renderKey) {
    let value = getValueFromObject(data, key);
    if (!value && value !== '' && node) {
        let parentTemplate
        if (node.parentElement)
            parentTemplate = node.parentElement.closest('[render]')

        if (parentTemplate) {
            do {
                if (key == 'status')
                    console.log('lllls')

                let parentNode = renderedNodes.get(parentTemplate)
                if (parentNode) {
                    if (parentNode.template) {
                        let Data, parent = parentNode.parent || parentNode.template
                        do {
                            if (parent.source)
                                Data = parent.source.data
                            else if (parent.parent)
                                parent = parent.parent
                            else if (parent.template)
                                parent = parent.template

                        } while (parent && !Data)
                        if (key == 'status')
                            console.log('lllls', Data)

                        let dotNotation = parentNode.dotNotation
                        let renderedData = getValueFromObject(Data, dotNotation);
                        if (!renderedData) {
                            value = getValueFromObject(Data, key);
                        }
                        if (renderedData) {
                            if (Array.isArray(renderedData)) {
                                const keysArray = Array.from(parentNode.template.clones.keys());
                                const index = keysArray.indexOf(parentNode.eid);
                                Data = { [parentNode.renderKey]: renderedData[index] }
                            } else
                                Data = { [parentNode.renderKey]: renderedData }

                            let nodeData = renderedNodes.get(node)
                            if (nodeData.key && nodeData.renderKey) {
                                Data = getValueFromObject(Data, nodeData.key);
                                Data = { [nodeData.renderKey]: Data }
                            }

                            value = getValueFromObject(Data, key);
                            if (value && renderKey && key.startsWidth(`${renderKey}.`))
                                value = getValueFromObject({ [renderKey]: value }, key);

                            if (!value) {
                                value = getValueFromObject(parentNode.template.source.data, key);
                            }
                        }
                    }
                }

                if (!value && parentTemplate.parentElement)
                    parentTemplate = parentTemplate.parentElement.closest('[render]')
                else {
                    parentTemplate = undefined
                }

            } while (!value && parentTemplate)
        }
    }
    return value
}

// function getData({ element, selector, template, data, key, index }) {
//     console.log('render.getData returns json data rendered')
// }

// function createElement(data) {
//     // check all render elements to see if data pertains to them 
//     // check filters to see if its index is with in the current renderd data length
//     render({ source, selector, element, data, key, index, update, remove })
// }

function render({ source, selector, element, data, key, index, update, remove }) {
    if (!element) {
        if (!selector && source)
            selector = source.getAttribute('render-selector')
        if (selector)
            element = queryDocumentSelectorAll(selector);
        if (!element && source)
            element = source.querySelector('template, [template], .template', '[render]')
        if (!element) return;
    }

    if (source) {
        let sourceData = sources.get(source)
        if (!sourceData) {
            sourceData = { element: source, selector, data }
            sources.set(source, sourceData)
        }

        source = sourceData
        if (!source.data)
            source.data = data
    } else if (data)
        source = { data }


    if (!(element instanceof HTMLCollection) && !Array.isArray(element))
        element = [element]

    for (let i = 0; i < element.length; i++) {
        if (source) {
            let renderedNode = renderedNodes.get(element[i])
            if (!renderedNode)
                renderedNodes.set(element[i], { element: element[i], source, clones: new Map(), keys: new Map(), renderKeys: new Map() })
            else if (renderedNode.source)
                renderedNode.source = source
        }

        if (!key)
            key = element[i].getAttribute('render')

        if (remove) {
            modifyClones(element[i], data, key, index, 'delete')
        } else if (update) {
            modifyClones(element[i], data, key, index, 'update')
        } else if (key) {
            // TODO: if $auto here every subsequent clone will have same value. 
            //       not replacing here will apply unique value to each clone
            if (key === '$auto')
                key = key.replace(/\$auto/g, uuid.generate(6));

            element[i].setAttribute('render', key);

            renderTemplate(element[i], data, key, index);
        } else
            renderValues(element[i], data);

    }


}

function modifyClones(template, data, key, index, action) {
    template = renderedNodes.get(template)
    if (!template)
        return
    if (index) {
        modifyClone({ template, data, eid, index, action })
    } else {
        let type = data.type
        if (!type || !data[type])
            return

        let name = "name"
        if (type = 'document')
            name = '_id'

        if (Array.isArray(data[type])) {
            for (let i = 0; i < data[type].length; i++) {
                eid = data[type][i][name]
                modifyClone({ template, eid, action })
            }
        } else {
            if (typeof data[type] === "object") {
                eid = data[type][name]
            } else
                eid = data[type]

            modifyClone({ template, data, eid, action })
        }
    }
}

function modifyClone({ template, data, eid, index, action }) {
    let clone = template.clones.get(eid)

    if (clone) {
        if (action === 'remove') {
            clone.remove()
            template.clones.delete(eid)
            renderedNodes.delete(clone)
        } else if (action === 'update') {
            renderValues(clone, data);

            // TODO: compare clone index with new index if same only renderValues
            if (index >= 0)
                insertElement(template, element, index)
        }

    } else if (action === 'update' && index >= 0) {
        renderTemplate(template.element, data, key, index);
    }

}

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

    let renderSelector = element.getAttribute('render-selector')
    if (!renderSelector) return

    renderData.selector = renderSelector
    render(renderData);

    document.dispatchEvent(new CustomEvent('renderKey', {
        detail: { data }
    }));
}

Actions.init({
    name: "renderKey",
    callback: (action) => {
        renderKey(action.element, action.params);
    }
});

Observer.init({
    name: 'render',
    observe: ['addedNodes'],
    target: '[render-selector]',
    callback: function (mutation) {
        init(mutation.target)
    }
})

Observer.init({
    name: 'renderNodesRemoved',
    observe: ['removedNodes'],
    target: '[render-clone]',
    callback: function (mutation) {
        let renderedNode = renderedNodes.get(mutation.target)
        if (renderedNode) {
            renderedNode.template.clones.delete(renderedNode.eid)
            renderedNodes.delete(mutation.target)
        }
    }
})

Observer.init({
    name: 'render',
    observe: ['addedNodes'],
    target: '[render]',
    callback: function (mutation) {
        let element = mutation.target
        if (element.hasAttribute('render-clone'))
            return

        // render({
        //     element
        // });

        // let key = element.getAttribute('render')
        // if (key) {
        //     if (key.includes('parent')) {

        //     }
        //     let parentElement = element.parentElement.closest(['render'])
        //     if (parentElement) {

        //         let data = ''
        //     }
        // }

        // needs to find dertimine if there is a parent render or a source
        // TODO: get parent from renderedNode = renderedNodes.get(el)
        // renderNode.parent.key
        // renderNode.parent.renderKey
        // renderNode.dotNotation
        // let parentElement = element.parentElement.closest(['render'])
        // let parentElement = element.parentElement
        let parentElement
        if (parentElement) {


            // let parentKeys = [];
            // let renderedData = new Map();
            // do {
            //     let data;
            //     el = el.parentElement
            //     if (el) {
            //         let renderedNode = renderedNodes.get(el)
            //         if (renderedNode)
            //             data = renderedNode.data

            //         if (data)
            //             renderedData.set(data, '')

            //         let parentKey = el.getAttribute('parent-key')
            //         if (parentKey && parentKey != null) {
            //             if (/^\d+$/.test(parentKey))
            //                 parentKey = `[${parentKey}]`
            //             parentKeys.push(parentKey)
            //         }
            //     }
            // } while (el)

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

            render({
                element,
                data: obj
            });
        }
    }
});

init()

export default { render, sources, renderedNodes }