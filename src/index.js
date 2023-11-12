/********************************************************************************
 * Copyright (C) 2023 CoCreate and Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ********************************************************************************/

// Commercial Licensing Information:
// For commercial use of this software without the copyleft provisions of the AGPLv3,
// you must obtain a commercial license from CoCreate LLC.
// For details, visit <https://cocreate.app/licenses/> or contact us at sales@cocreate.app.

/*globals CustomEvent*/
import Actions from '@cocreate/actions';
import Observer from '@cocreate/observer';
import uuid from '@cocreate/uuid';
import { queryElements, getValueFromObject, dotNotationToObject, ObjectId } from '@cocreate/utils';
import '@cocreate/element-prototype';
import './index.css';

const sources = new Map()
const renderedNodes = new Map()
const elementSelector = '[render-selector], [render-closest], [render-parent], [render-next], [render-previous]'

function init(element) {
    if (element && !(element instanceof HTMLCollection) && !Array.isArray(element))
        element = [element]
    else if (!element)
        element = document.querySelectorAll(elementSelector)

    for (let i = 0; i < element.length; i++) {
        let source = sources.get(element[i])
        if (!source) {
            sources.set(element[i], { element: element[i] })
            element[i].renderValue = async (data) => await render({ source: element[i], data })
            element[i].getData = () => sources.get(element[i]).data
        }
    }
}

async function render({ source, element, selector, data, key, index, currentIndex, update, remove }) {
    if (!element) {
        if (source) {
            element = queryElements({ element: source, prefix: 'render' })
            if (!element && source.children.length > 0) {
                for (const child of source.children) {
                    if (child.matches('template, [template], .template, [render]')) {
                        element = child;
                        break; // Found the desired element, no need to continue the loop
                    }
                }
            }

            if (!element) {
                element = source.querySelector('template, [template], .template, [render]');
            }
        } else if (selector)
            element = queryElements({ selector })

        if (!element) return;
    }

    if (source) {
        if (!key)
            key = source.getAttribute('render') || source.getAttribute('key')

        let sourceData = sources.get(source)
        if (!sourceData) {
            sourceData = { element: source, data }
            sources.set(source, sourceData)
        }

        source = sourceData
        if (!source.data)
            source.data = data

    } else if (data)
        source = { data }

    if (data.$filter) {
        index = index || data.$filter.index
        update = update || data.$filter.update
        remove = remove || data.$filter.remove
    }

    let type = data.type
    if (!type && data.method) {
        type = data.method.split('.')[0]
    } else if (type == 'key')
        type = 'object'


    if (!Array.isArray(element) && !(element instanceof HTMLCollection) && !(element instanceof NodeList))
        element = [element]

    for (let i = 0; i < element.length; i++) {
        key = element[i].getAttribute('render') || key || type

        let renderedNode = renderedNodes.get(element[i])
        if (source) {
            if (!renderedNode) {
                renderedNode = { element: element[i], source, clones: new Map(), renderAs: new Map() }
                renderedNodes.set(element[i], renderedNode)
            }
        }

        if (remove) {
            for (let j = 0; j < data[type].length; j++) {
                let cloneKey
                if (type === 'object') {
                    cloneKey = data[type][j]._id;
                } else {
                    cloneKey = data[type][j].name;
                }

                let clone = renderedNode.clones.get(cloneKey)
                if (!clone) return

                renderedNode.clones.delete(cloneKey)
                renderedNodes.delete(clone)
                clone.remove()
            }
        } else if (key || Array.isArray(data)) {
            if (update) {
                for (let j = 0; j < data[type].length; j++) {
                    let clone
                    if (type === 'object') {
                        clone = renderedNode.clones.get(data[type][j]._id);
                    } else {
                        clone = renderedNode.clones.get(data[type][j].name);
                    }

                    if (!currentIndex)
                        currentIndex = data.$filter.currentIndex

                    if (!clone) return

                    await renderValues(clone, { object: data[type][j] });
                    if (currentIndex >= 0)
                        insertElement(renderedNode, clone, index, currentIndex)
                }
            } else {

                // TODO: if $auto here every subsequent clone will have same value, not replacing here will apply unique value to each clone
                if (key === '$auto')
                    key = key.replace(/\$auto/g, uuid.generate(6));

                if (key)
                    element[i].setAttribute('render', key);

                await renderTemplate(element[i], data, key, index);
            }
        } else
            await renderValues(element[i], data);

    }

}

async function renderTemplate(template, data, key, index, keyPath) {
    // if (!key)
    //     key = template.getAttribute('render')

    let templateData = renderedNodes.get(template)
    if (!templateData) {
        templateData = { element: template, clones: new Map() }
        renderedNodes.set(template, templateData)
    }

    templateData.parent = template.parentElement.closest('[render]')
    if (templateData.parent)
        templateData.parent = renderedNodes.get(templateData.parent)

    if (!templateData.keyPath) {
        if (keyPath)
            templateData.keyPath = keyPath
        else if (templateData.parent && templateData.parent.keyPath)
            templateData.keyPath = templateData.parent.keyPath
        else if (key)
            templateData.keyPath = key
    }

    template = templateData

    let renderData
    if (key)
        renderData = getRenderValue(template.element, data, key)
    else if (Array.isArray(data))
        renderData = data

    if (!renderData && data)
        if (Array.isArray(data))
            renderData = data
        else
            renderData = [data]

    else if (!renderData)
        return


    let isInsert = data.$filter && (data.$filter.create || data.$filter.update)
    if (!isInsert && index === 0) {
        for (const [key, element] of template.clones) {
            renderedNodes.delete(element)
            element.remove()
            template.clones.delete(key)
        }
        // template.data = renderData
    }
    // else if (index) {
    // updates data that has already been rendered
    // template.data = dotNotationToObject(renderData, template.data)
    // }

    let renderAs = template.element.getAttribute('render-as') || key;
    template.renderAs = renderAs

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

            if (Array.isArray(value))
                type = 'array'
            else if (typeof (value) == "object")
                type = 'object'

            let Data = { [renderAs]: { key: keys[i], value, type } }

            let clone = cloneTemplate(template);
            let renderedKey = key.split('.')
            renderedKey = renderedKey[renderedKey.length - 1];
            //renderedKey needs to remove the parent.renderAs/key

            clone.key = keys[i]
            clone.keyPath = template.keyPath + '.' + renderedKey
            clone.parentKey = renderedKey
            clone.renderKey = key
            clone.element.setAttribute('renderedKey', keys[i])
            await renderValues(clone.element, Data, keys[i], renderAs);
            insertElement(template, clone.element, index);

        }
    } else {
        if (!key && !Array.isArray(renderData)) {
            key = 'data'
            renderData = getValueFromObject(renderData, key);
            if (!renderAs)
                renderAs = key
        }

        if (!renderData) {
            let clone = cloneTemplate(template);
            clone.keyPath = template.keyPath
            await renderValues(clone.element, data, key, renderAs);
            insertElement(template, clone.element, index);
        } else {
            if (!Array.isArray(renderData))
                renderData = [renderData]

            for (let i = 0; i < renderData.length; i++) {
                let clone = cloneTemplate(template);
                clone.keyPath = template.keyPath || '' + `[${i}]`

                let object
                if (renderAs) {
                    object = { [renderAs]: renderData[i] }
                    if (renderAs.includes('.'))
                        object = dotNotationToObject(object);
                } else
                    object = renderData[i]

                await renderValues(clone.element, object, key, renderAs);
                insertElement(template, clone.element, index);
            }
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

    let renderAs = clone.getAttribute('render-as')
    if (renderAs) {
        clone = clone.outerHTML.replace(/\$auto/g, renderAs);
    } else {
        clone = clone.outerHTML;
    }

    if (typeof clone === 'string') {
        let container = document.createElement('tbody');
        container.innerHTML = clone;
        clone = container.firstChild
        container.remove()
    }
    let renderedNode = { template, element: clone }
    renderedNodes.set(clone, renderedNode)
    return renderedNode;
}

function insertElement(template, element, index, currentIndex) {
    let eid = element.getAttribute('eid')
    if (!eid)
        console.log('attribute eid not found')

    if (index !== null && index >= 0) {
        if (!template.clones)
            template = template.template
        const clones = Array.from(template.clones);

        let item
        if (currentIndex) {
            item = clones.splice(currentIndex, 1)[0];
        } else {
            item = [eid, element];
        }

        clones.splice(index, 0, item);
        if (clones[index + 1] && clones[index][1] !== element)
            clones[index][1].insertAdjacentElement('beforebegin', element);
        else if (clones[index] && clones[index][1] !== element)
            clones[index][1].insertAdjacentElement('afterend', element);
        else
            template.element.insertAdjacentElement('beforebegin', element);
        template.clones = new Map(clones);
    } else {
        template.clones.set(eid, element)
        template.element.insertAdjacentElement('beforebegin', element);
    }
}

async function renderValues(node, data, key, renderAs, keyPath, parent) {
    if (!data) return;

    let renderedNode = renderedNodes.get(node)
    if (!renderedNode)
        renderedNode = { key, renderAs }

    if (!renderedNode.key)
        renderedNode.key = key
    else if (!key)
        key = renderedNode.key

    if (!renderedNode.renderAs)
        renderedNode.renderAs = renderAs
    else if (!renderAs)
        renderAs = renderedNode.renderAs

    if (keyPath)
        renderedNode.keyPath = keyPath
    else if (renderedNode.keyPath)
        keyPath = renderedNode.keyPath

    if (parent)
        renderedNode.parent = parent

    if (node.nodeType == 1) {
        if (node.hasAttribute('render-clone')) {
            parent = renderedNode

            for (let eid of ['_id', 'name', 'key']) {
                if (renderAs)
                    eid = data[renderAs][eid]
                else
                    eid = data[eid]

                if (!eid) continue

                let oldEid = renderedNode.eid
                let temp = renderedNode.template
                if (!temp) {
                    console.log('temp could not be found')
                } else if (!temp.clones) {
                    if (temp.template)
                        temp = temp.template
                    else
                        console.log(temp)

                    if (oldEid && oldEid !== eid)
                        temp.clones.delete(oldEid)

                    temp.clones.set(eid, node)
                }

                renderedNode.eid = eid

                node.setAttribute('eid', eid)
                break;
            }
        }

        // Array.from(node.attributes).forEach(attr => {
        for (let attr of node.attributes) {
            let name = attr.name;
            let value = attr.value;

            let renderedAttribute = renderedNodes.get(attr)
            if (!renderedAttribute) {
                renderedAttribute = { placeholder: { name, value }, key, renderAs, parent: renderedNode }
            }

            let namePlaceholder = renderedAttribute.placeholder.name || name;
            let valuePlaceholder = renderedAttribute.placeholder.value || value;

            name = await renderValue(attr, data, namePlaceholder, renderAs, renderedAttribute);
            value = await renderValue(attr, data, valuePlaceholder, renderAs, renderedAttribute);

            if (name === undefined && name === null) {
                renderedNodes.delete(attr)
                node.removeAttribute(attr.name);
            } else if ((value || value === "") && (name !== attr.name || value !== attr.value))
                node.setAttribute(name, value);
        }
        // });

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
            // Array.from(node.childNodes).forEach(childNode => {
            for (let childNode of node.childNodes) {
                await renderValues(childNode, data, key, renderAs, keyPath, parent);
            }
            // });
        }


    } else if (node.nodeType == 3) {
        let valueType = node.parentElement.getAttribute('value-type')

        let textContent, text;

        if (!renderedNode.placeholder && node.textContent.match(/{{(.*?)}}/))
            renderedNode.placeholder = node.textContent

        if (!renderedNode.placeholder)
            return
        textContent = renderedNode.placeholder || node.textContent;

        text = await renderValue(node, data, textContent, renderAs, renderedNode);

        if (text || text == "") {
            if (text != renderedNode.text) {
                renderedNode.text = text

                if (valueType == 'text' || valueType == 'string' || valueType != "html") {
                    node.textContent = text;
                } else {
                    const newNode = document.createElement('div');
                    newNode.innerHTML = text;
                    let parentElement = node.parentElement

                    let renderedParent = renderedNodes.get(parentElement)
                    if (!renderedParent) {
                        renderedParent = { placeholder: textContent, key, renderAs }
                    }
                    renderedParent.text = text
                    for (let newChild of newNode.childNodes) {
                        renderedNode.element = newChild
                        renderedNodes.set(newChild, renderedNode)
                    }
                    renderedNodes.delete(node)
                    node.replaceWith(...newNode.childNodes)
                }

                if (node.childNodes.length > 0) {
                    // Array.from(node.childNodes).forEach(childNode => {
                    for (let childNode of node.childNodes) {
                        await renderValues(childNode, data, key, renderAs, keyPath, parent);
                    }
                    // });
                }
            }
        }
    }
}

async function renderValue(node, data, placeholder, renderAs, renderedNode) {
    let output = placeholder;

    if (placeholder.match(/{{(.*?)}}/)) {
        if (renderedNode) {
            renderedNodes.set(node, renderedNode)
        }

        let match
        do {
            match = output.match(/{{([A-Za-z0-9_.,\[\]\- ]*)}}/); // works by getting inner matches first
            // match = output.match(/{{([^}]*)}}/);
            // match = output.match(/{{(.*?)}}/);
            if (match) {
                let value
                try {
                    let Data = JSON.parse('{' + match[1].replace(/'/g, '"') + '}');
                    if (Data.storage || Data.database || Data.array || Data.object || Data.index) {
                        Data.method = 'object.read'
                        value = await CoCreate.crud.send(Data)
                        value = value.object[0][Data.key]
                    }
                } catch (error) {
                    value = getRenderValue(node, data, match[1], renderAs)
                }

                if (value || value === "") {
                    if (typeof value === "object")
                        value = JSON.stringify(value, null, 2)

                    output = output.replace(match[0], value);
                } else if (renderAs) {
                    if (match[0].startsWith(`{{${renderAs}.`)) {
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

function getRenderValue(node, data, key, renderAs) {
    let value = getValueFromObject(data, key);

    if (!value && value !== '' && node) {

        let parentTemplate = node
        do {
            let parentNode = renderedNodes.get(parentTemplate)
            if (parentNode) {

                if (!value && (parentNode.parent || parentNode.template)) {
                    let Data, eid, parent = parentNode.parent || parentNode.template
                    do {
                        if (key.includes('keyPath'))
                            value = parentNode.keyPath || parent.keyPath
                        else if (key.includes('parentKey')) {
                            value = parentNode.parentKey || parent.parentKey || parent.parent.parentKey
                        } else if (key.includes('renderAs')) {
                            value = renderAs
                        } else if (key === 'object' || key === '_id')
                            value = ObjectId().toString()
                        else if (key === 'uuid')
                            value = uuid.generate(6)
                        else if (parent.source)
                            Data = parent.source.data
                        else if (parent.parent)
                            parent = parent.parent
                        else if (parent.template)
                            parent = parent.template
                        else
                            parent = undefined

                        if (!Data && parent && parent.eid)
                            eid = parent.eid


                    } while (!value && parent && !Data)

                    if (!value && Data)
                        value = getValueFromObject(Data, key);

                    if (!value && key.includes('.')) {
                        let renderedData = getValueFromObject(Data, key.split('.')[0]);
                        if (renderedData) {
                            let index
                            if (!parent.clones.size || parent.clones.size === 1)
                                index = 0
                            else if (eid)
                                index = Array.from(parent.clones.keys()).indexOf(eid);
                            else
                                console.log('eid not found')

                            if (index >= 0)
                                Data = { [key.split('.')[0]]: renderedData[index] }

                            value = getValueFromObject(Data, key);
                        }

                    }
                }
            }

            if (!value && parentTemplate.parentElement)
                parentTemplate = parentTemplate.parentElement.closest('[render]')
            else
                parentTemplate = undefined

        } while (!value && parentTemplate)
    }
    return value
}

async function renderKey(element, params) {
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
            data[attribute] = await el.getValue()
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
    target: elementSelector,
    callback: function (mutation) {
        init(mutation.target)
    }
})

Observer.init({
    name: 'fileRender',
    observe: ['attributes'],
    attributeName: ['render-selector', 'render-closest', 'render-parent', 'render-next', 'render-previous'],
    callback: async function (mutation) {
        render({
            element: mutation.target, data: await mutation.target.getValue()
        });
    }
});


Observer.init({
    name: 'render',
    observe: ['addedNodes'],
    target: '[render]',
    callback: function (mutation) {
        if (mutation.target.hasAttribute('render-clone'))
            return
        let parentElement = mutation.target.parentElement.closest(['render'])
        if (!parentElement) return

        let renderedNode = renderedNodes.get(parentElement)
        let data = renderedNode.source.data

        render({ element: mutation.target, data });

    }
});

// Observer.init({
//     name: 'render',
//     observe: ['addedNodes'],
//     target: '[render-clone]',
//     callback: function (mutation) {
//         let renderedNode = renderedNodes.get(mutation.target)
//         if (!renderedNode) return

// render({ source, element, data, key, index, currentIndex, update, remove })

// let nextElement = mutation.target.nextElementSibling
// if (!nextElement) return

// let nextRenderedNode = renderedNodes.get(nextElement)
// if (!nextRenderedNode) return

// let clones
// if (nextRenderedNode.template)
//     clones = nextRenderedNode.template.clones
// else if (nextRenderedNode.clones)
//     clones = nextRenderedNode.clones

// const cloneValueArray = Array.from(clones.values())
// let index = cloneValueArray.indexOf(nextElement);

// const cloneArray = Array.from(clones)

// cloneArray.splice(index, 0, [renderedNode.eid, mutation.target]);
// clones = new Map(cloneArray);

//     }
// })

Observer.init({
    name: 'renderNodesRemoved',
    observe: ['removedNodes'],
    target: '[render-clone]',
    callback: function (mutation) {
        if (mutation.target.parentElement) return
        let renderedNode = renderedNodes.get(mutation.target)
        if (!renderedNode) return
        renderedNode.template.clones.delete(renderedNode.eid)
        renderedNodes.delete(mutation.target)
    }
})

init()

export default { render, sources, renderedNodes }