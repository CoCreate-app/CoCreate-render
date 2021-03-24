(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["render"] = factory();
	else
		root["CoCreate"] = root["CoCreate"] || {}, root["CoCreate"]["render"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "../CoCreate-components/CoCreate-render/src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../CoCreate-components/CoCreate-render/src/index.js":
/*!***********************************************************!*\
  !*** ../CoCreate-components/CoCreate-render/src/index.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = void 0;\n\n/**\n * change name Class\n * add functionality to add value on any attr of each elements into template\n */\nconst CoCreateRender = {\n  __getValueFromObject: function (json, path) {\n    try {\n      if (typeof json == 'undefined' || !path) return false;\n      let jsonData = json,\n          subpath = path.split('.');\n\n      for (let i = 0; i < subpath.length; i++) {\n        jsonData = jsonData[subpath[i]];\n        if (!jsonData) return false;\n      }\n\n      return jsonData;\n    } catch (error) {\n      console.log(\"Error in getValueFromObject\", error);\n      return false;\n    }\n  },\n  __getValue: function (data, attrValue) {\n    let result = /{{\\s*([\\w\\W]+)\\s*}}/g.exec(attrValue);\n\n    if (result) {\n      return this.__getValueFromObject(data, result[1].trim());\n    }\n\n    return false;\n  },\n  __createObject: function (data, path) {\n    try {\n      if (!path) return data;\n      let keys = path.split('.');\n      let newObject = data;\n\n      for (var i = keys.length - 1; i >= 0; i--) {\n        newObject = {\n          [keys[i]]: newObject\n        };\n      }\n\n      return newObject;\n    } catch (error) {\n      console.log(\"Error in getValueFromObject\", error);\n      return false;\n    }\n  },\n  __replaceValue: function (data, inputValue) {\n    let isPass = false;\n    let self = this;\n    let resultValue = null; // let variables = inputValue.match(/{{\\s*(\\S+)\\s*}}/g);\n\n    let variables = inputValue.match(/{{([A-Za-z0-9_.,\\- ]*)}}/g);\n\n    if (variables) {\n      variables.forEach(attr => {\n        let value = self.__getValue(data, attr);\n\n        if (value && typeof value !== \"object\") {\n          isPass = true;\n          inputValue = inputValue.replace(attr, value);\n        }\n      });\n\n      if (isPass) {\n        resultValue = inputValue;\n      }\n    }\n\n    return resultValue;\n  },\n  setArray: function (template, data) {\n    const type = template.getAttribute('data-render_array') || \"data\";\n    const render_key = template.getAttribute('data-render_key') || type;\n    const self = this;\n\n    const arrayData = this.__getValueFromObject(data, type);\n\n    if (type && Array.isArray(arrayData)) {\n      arrayData.forEach((item, index) => {\n        let cloneEl = template.cloneNode(true);\n        cloneEl.classList.remove('template');\n        cloneEl.classList.add('clone_' + type);\n\n        if (typeof item !== 'object') {\n          item = {\n            \"--\": item\n          };\n        } else {\n          item['index'] = index;\n        }\n\n        let r_data = self.__createObject(item, render_key);\n\n        self.setValue([cloneEl], r_data);\n        template.insertAdjacentHTML('beforebegin', cloneEl.outerHTML);\n      });\n    }\n  },\n  setValue: function (els, data, passTo, template) {\n    if (!data) return;\n    const that = this;\n    Array.from(els).forEach(e => {\n      let passId = e.getAttribute('data-pass_id');\n\n      if (passTo && passId != passTo) {\n        return;\n      }\n\n      Array.from(e.attributes).forEach(attr => {\n        let attr_name = attr.name.toLowerCase();\n        let isPass = false;\n        let attrValue = attr.value;\n        attrValue = that.__replaceValue(data, attrValue);\n\n        if (attrValue) {\n          if (attr_name == 'value') {\n            let tag = e.tagName.toLowerCase();\n\n            switch (tag) {\n              case 'input':\n                e.setAttribute(attr_name, attrValue);\n                break;\n\n              case 'textarea':\n                e.setAttribute(attr_name, attrValue);\n                e.textContent = attrValue;\n                break;\n\n              default:\n                if (e.children.length === 0) {\n                  e.innerHTML = attrValue;\n                }\n\n            }\n          }\n\n          e.setAttribute(attr_name, attrValue);\n        }\n      });\n\n      if (e.children.length == 0 && e.textContent) {\n        let textContent = e.textContent;\n        textContent = that.__replaceValue(data, textContent);\n\n        if (textContent) {\n          e.textContent = textContent;\n        }\n      }\n\n      if (e.children.length > 0) {\n        that.setValue(e.children, data);\n\n        if (e.classList.contains('template')) {\n          that.setArray(e, data);\n        }\n      }\n    });\n  },\n  data: function ({\n    selector,\n    data,\n    elements,\n    passTo\n  }) {\n    if (selector) {\n      this.render(selector, data);\n    } else if (elements) {\n      this.setValue(elements, data, passTo);\n    }\n  },\n  render: function (selector, dataResult) {\n    let template_div = document.querySelector(selector);\n\n    if (!template_div) {\n      return;\n    }\n\n    if (Array.isArray(dataResult)) {\n      template_div.setAttribute('data-render_array', 'test');\n      this.setValue([template_div], {\n        test: dataResult\n      });\n    } else {\n      this.setValue(template_div.children, dataResult);\n    }\n  }\n};\nvar _default = CoCreateRender;\nexports.default = _default;//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Db0NyZWF0ZS5yZW5kZXIvLi4vQ29DcmVhdGUtY29tcG9uZW50cy9Db0NyZWF0ZS1yZW5kZXIvc3JjL2luZGV4LmpzPzdmZDgiXSwibmFtZXMiOlsiQ29DcmVhdGVSZW5kZXIiLCJfX2dldFZhbHVlRnJvbU9iamVjdCIsImpzb24iLCJwYXRoIiwianNvbkRhdGEiLCJzdWJwYXRoIiwic3BsaXQiLCJpIiwibGVuZ3RoIiwiZXJyb3IiLCJjb25zb2xlIiwibG9nIiwiX19nZXRWYWx1ZSIsImRhdGEiLCJhdHRyVmFsdWUiLCJyZXN1bHQiLCJleGVjIiwidHJpbSIsIl9fY3JlYXRlT2JqZWN0Iiwia2V5cyIsIm5ld09iamVjdCIsIl9fcmVwbGFjZVZhbHVlIiwiaW5wdXRWYWx1ZSIsImlzUGFzcyIsInNlbGYiLCJyZXN1bHRWYWx1ZSIsInZhcmlhYmxlcyIsIm1hdGNoIiwiZm9yRWFjaCIsImF0dHIiLCJ2YWx1ZSIsInJlcGxhY2UiLCJzZXRBcnJheSIsInRlbXBsYXRlIiwidHlwZSIsImdldEF0dHJpYnV0ZSIsInJlbmRlcl9rZXkiLCJhcnJheURhdGEiLCJBcnJheSIsImlzQXJyYXkiLCJpdGVtIiwiaW5kZXgiLCJjbG9uZUVsIiwiY2xvbmVOb2RlIiwiY2xhc3NMaXN0IiwicmVtb3ZlIiwiYWRkIiwicl9kYXRhIiwic2V0VmFsdWUiLCJpbnNlcnRBZGphY2VudEhUTUwiLCJvdXRlckhUTUwiLCJlbHMiLCJwYXNzVG8iLCJ0aGF0IiwiZnJvbSIsImUiLCJwYXNzSWQiLCJhdHRyaWJ1dGVzIiwiYXR0cl9uYW1lIiwibmFtZSIsInRvTG93ZXJDYXNlIiwidGFnIiwidGFnTmFtZSIsInNldEF0dHJpYnV0ZSIsInRleHRDb250ZW50IiwiY2hpbGRyZW4iLCJpbm5lckhUTUwiLCJjb250YWlucyIsInNlbGVjdG9yIiwiZWxlbWVudHMiLCJyZW5kZXIiLCJkYXRhUmVzdWx0IiwidGVtcGxhdGVfZGl2IiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9y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QVlGLFFBQVosRUFBc0J2RCxJQUF0QjtBQUNBLEtBRkQsTUFFTyxJQUFJd0QsUUFBSixFQUFjO0FBQ3BCLFdBQUtyQixRQUFMLENBQWNxQixRQUFkLEVBQXdCeEQsSUFBeEIsRUFBOEJ1QyxNQUE5QjtBQUNBO0FBQ0QsR0ExSnFCO0FBNEp0QmtCLFFBQU0sRUFBRyxVQUFTRixRQUFULEVBQW1CRyxVQUFuQixFQUErQjtBQUN2QyxRQUFJQyxZQUFZLEdBQUdDLFFBQVEsQ0FBQ0MsYUFBVCxDQUF1Qk4sUUFBdkIsQ0FBbkI7O0FBQ0EsUUFBSSxDQUFDSSxZQUFMLEVBQW1CO0FBQ2xCO0FBQ0E7O0FBQ0QsUUFBSWxDLEtBQUssQ0FBQ0MsT0FBTixDQUFjZ0MsVUFBZCxDQUFKLEVBQStCO0FBQzlCQyxrQkFBWSxDQUFDVCxZQUFiLENBQTBCLG1CQUExQixFQUErQyxNQUEvQztBQUNBLFdBQUtmLFFBQUwsQ0FBYyxDQUFDd0IsWUFBRCxDQUFkLEVBQThCO0FBQUNHLFlBQUksRUFBRUo7QUFBUCxPQUE5QjtBQUNBLEtBSEQsTUFHTztBQUNOLFdBQUt2QixRQUFMLENBQWN3QixZQUFZLENBQUNQLFFBQTNCLEVBQXFDTSxVQUFyQztBQUNBO0FBQ0Q7QUF2S3FCLENBQXZCO2VBMEtldkUsYyIsImZpbGUiOiIuLi9Db0NyZWF0ZS1jb21wb25lbnRzL0NvQ3JlYXRlLXJlbmRlci9zcmMvaW5kZXguanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIGNoYW5nZSBuYW1lIENsYXNzXG4gKiBhZGQgZnVuY3Rpb25hbGl0eSB0byBhZGQgdmFsdWUgb24gYW55IGF0dHIgb2YgZWFjaCBlbGVtZW50cyBpbnRvIHRlbXBsYXRlXG4gKi9cbmNvbnN0IENvQ3JlYXRlUmVuZGVyID0ge1xuXG5cdF9fZ2V0VmFsdWVGcm9tT2JqZWN0IDogZnVuY3Rpb24oanNvbiwgcGF0aCkge1xuXHRcdHRyeSB7XG5cdFx0XHRpZih0eXBlb2YganNvbiA9PSAndW5kZWZpbmVkJyB8fCAhcGF0aClcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0bGV0IGpzb25EYXRhID0ganNvbiwgc3VicGF0aCA9IHBhdGguc3BsaXQoJy4nKTtcblx0XHRcdFxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzdWJwYXRoLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGpzb25EYXRhID0ganNvbkRhdGFbc3VicGF0aFtpXV07XG5cdFx0XHRcdGlmICghanNvbkRhdGEpIHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBqc29uRGF0YTtcblx0XHR9Y2F0Y2goZXJyb3Ipe1xuXHRcdFx0Y29uc29sZS5sb2coXCJFcnJvciBpbiBnZXRWYWx1ZUZyb21PYmplY3RcIiwgZXJyb3IpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fSxcblx0XG5cdF9fZ2V0VmFsdWU6IGZ1bmN0aW9uKGRhdGEsIGF0dHJWYWx1ZSkge1xuXHRcdGxldCByZXN1bHQgPSAve3tcXHMqKFtcXHdcXFddKylcXHMqfX0vZy5leGVjKGF0dHJWYWx1ZSk7XG5cdFx0aWYgKHJlc3VsdCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX19nZXRWYWx1ZUZyb21PYmplY3QoZGF0YSwgcmVzdWx0WzFdLnRyaW0oKSk7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0XHRcblx0fSxcblx0XG5cdF9fY3JlYXRlT2JqZWN0OiBmdW5jdGlvbiAoZGF0YSwgcGF0aCkge1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAoIXBhdGgpIHJldHVybiBkYXRhO1xuXHRcdFx0XG5cdFx0XHRsZXQga2V5cyA9IHBhdGguc3BsaXQoJy4nKVxuXHRcdFx0bGV0IG5ld09iamVjdCA9IGRhdGE7XG5cblx0XHRcdGZvciAodmFyICBpID0ga2V5cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdFx0XHRuZXdPYmplY3QgPSB7W2tleXNbaV1dOiBuZXdPYmplY3R9XHRcdFx0XHRcblx0XHRcdH1cblx0XHRcdHJldHVybiBuZXdPYmplY3Q7XG5cdFx0XHRcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0Y29uc29sZS5sb2coXCJFcnJvciBpbiBnZXRWYWx1ZUZyb21PYmplY3RcIiwgZXJyb3IpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fSxcblx0XG5cdF9fcmVwbGFjZVZhbHVlOiBmdW5jdGlvbihkYXRhLCBpbnB1dFZhbHVlKSB7XG5cdFx0bGV0IGlzUGFzcyA9IGZhbHNlO1xuXHRcdGxldCBzZWxmID0gdGhpcztcblx0XHRsZXQgcmVzdWx0VmFsdWUgPSBudWxsO1xuXHRcdC8vIGxldCB2YXJpYWJsZXMgPSBpbnB1dFZhbHVlLm1hdGNoKC97e1xccyooXFxTKylcXHMqfX0vZyk7XG5cdFx0bGV0IHZhcmlhYmxlcyA9IGlucHV0VmFsdWUubWF0Y2goL3t7KFtBLVphLXowLTlfLixcXC0gXSopfX0vZyk7XG5cdFx0aWYgKHZhcmlhYmxlcykge1xuXHRcdFx0dmFyaWFibGVzLmZvckVhY2goKGF0dHIpID0+IHtcblx0XHRcdFx0bGV0IHZhbHVlID0gc2VsZi5fX2dldFZhbHVlKGRhdGEsIGF0dHIpXG5cdFx0XHRcdGlmICh2YWx1ZSAmJiB0eXBlb2YodmFsdWUpICE9PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0aXNQYXNzID0gdHJ1ZTtcblx0XHRcdFx0XHRpbnB1dFZhbHVlID0gaW5wdXRWYWx1ZS5yZXBsYWNlKGF0dHIsIHZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdFxuXHRcdFx0aWYgKGlzUGFzcykge1xuXHRcdFx0XHRyZXN1bHRWYWx1ZSA9IGlucHV0VmFsdWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHRWYWx1ZTtcblx0fSxcblx0XG5cdHNldEFycmF5OiBmdW5jdGlvbih0ZW1wbGF0ZSwgZGF0YSkge1xuXHRcdGNvbnN0IHR5cGUgPSB0ZW1wbGF0ZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcmVuZGVyX2FycmF5JykgfHwgXCJkYXRhXCI7XG5cdFx0Y29uc3QgcmVuZGVyX2tleSA9IHRlbXBsYXRlLmdldEF0dHJpYnV0ZSgnZGF0YS1yZW5kZXJfa2V5JykgfHwgdHlwZTtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRjb25zdCBhcnJheURhdGEgPSB0aGlzLl9fZ2V0VmFsdWVGcm9tT2JqZWN0KGRhdGEsIHR5cGUpO1xuXG5cdFx0aWYgKHR5cGUgJiYgQXJyYXkuaXNBcnJheShhcnJheURhdGEpKSB7XG5cdFx0XHRhcnJheURhdGEuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcblx0XHRcdFx0XG5cdFx0XHRcdGxldCBjbG9uZUVsID0gdGVtcGxhdGUuY2xvbmVOb2RlKHRydWUpO1xuXHRcdFx0XHRjbG9uZUVsLmNsYXNzTGlzdC5yZW1vdmUoJ3RlbXBsYXRlJyk7XG5cdFx0XHRcdGNsb25lRWwuY2xhc3NMaXN0LmFkZCgnY2xvbmVfJyArIHR5cGUpO1xuXHRcdFx0XHRpZiAodHlwZW9mIGl0ZW0gIT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdFx0aXRlbSA9IHtcIi0tXCI6IGl0ZW19O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGl0ZW1bJ2luZGV4J10gPSBpbmRleDtcblx0XHRcdFx0fVxuXHRcdFx0XHRsZXQgcl9kYXRhID0gc2VsZi5fX2NyZWF0ZU9iamVjdChpdGVtLCByZW5kZXJfa2V5KTtcblxuXHRcdFx0XHRzZWxmLnNldFZhbHVlKFtjbG9uZUVsXSwgcl9kYXRhKTtcblx0XHRcdFx0dGVtcGxhdGUuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmViZWdpbicsIGNsb25lRWwub3V0ZXJIVE1MKTtcblx0XHRcdH0pXG5cdFx0fVxuXHR9LFxuIFxuXHRzZXRWYWx1ZTpmdW5jdGlvbihlbHMsIGRhdGEsIHBhc3NUbywgdGVtcGxhdGUpe1xuXHRcdGlmICghZGF0YSkgcmV0dXJuO1xuXHRcdGNvbnN0IHRoYXQgPSB0aGlzO1xuXHRcdEFycmF5LmZyb20oZWxzKS5mb3JFYWNoKGUgPT4ge1xuXHRcdFx0bGV0IHBhc3NJZCA9IGUuZ2V0QXR0cmlidXRlKCdkYXRhLXBhc3NfaWQnKTtcblx0XHRcdGlmIChwYXNzVG8gJiYgcGFzc0lkICE9IHBhc3NUbykge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRBcnJheS5mcm9tKGUuYXR0cmlidXRlcykuZm9yRWFjaChhdHRyPT57XG5cdFx0XHRcdGxldCBhdHRyX25hbWUgPSBhdHRyLm5hbWUudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0bGV0ICBpc1Bhc3MgPSBmYWxzZTtcblx0XHRcdFx0bGV0IGF0dHJWYWx1ZSA9IGF0dHIudmFsdWU7XG5cdFx0XHRcdGF0dHJWYWx1ZSA9IHRoYXQuX19yZXBsYWNlVmFsdWUoZGF0YSwgYXR0clZhbHVlKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChhdHRyVmFsdWUpIHtcblx0XHRcdFx0XHRpZihhdHRyX25hbWUgPT0gJ3ZhbHVlJyl7XG5cdFx0XHRcdFx0XHRsZXQgdGFnID0gZS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdFx0XHRzd2l0Y2ggKHRhZykge1xuXHRcdFx0XHRcdFx0XHRjYXNlICdpbnB1dCc6XG5cdFx0XHRcdFx0XHRcdFx0IGUuc2V0QXR0cmlidXRlKGF0dHJfbmFtZSwgYXR0clZhbHVlKTtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0Y2FzZSAndGV4dGFyZWEnOlxuXHRcdFx0XHRcdFx0XHRcdGUuc2V0QXR0cmlidXRlKGF0dHJfbmFtZSwgYXR0clZhbHVlKTtcblx0XHRcdFx0XHRcdFx0XHRlLnRleHRDb250ZW50ID0gYXR0clZhbHVlO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdGlmIChlLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZS5pbm5lckhUTUwgPSAgYXR0clZhbHVlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZS5zZXRBdHRyaWJ1dGUoYXR0cl9uYW1lLCBhdHRyVmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdFx0aWYgKGUuY2hpbGRyZW4ubGVuZ3RoID09IDAgJiYgZS50ZXh0Q29udGVudCkge1xuXHRcdFx0XHRsZXQgdGV4dENvbnRlbnQgPSBlLnRleHRDb250ZW50O1xuXHRcdFx0XHR0ZXh0Q29udGVudCA9IHRoYXQuX19yZXBsYWNlVmFsdWUoZGF0YSwgdGV4dENvbnRlbnQpO1xuXHRcdFx0XHRpZiAodGV4dENvbnRlbnQpIHtcblx0XHRcdFx0XHRlLnRleHRDb250ZW50ID0gdGV4dENvbnRlbnQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0XG5cdFx0XHRcblx0XHRcdGlmKGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHR0aGF0LnNldFZhbHVlKGUuY2hpbGRyZW4sIGRhdGEpXG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoZS5jbGFzc0xpc3QuY29udGFpbnMoJ3RlbXBsYXRlJykpIHtcblx0XHRcdFx0XHR0aGF0LnNldEFycmF5KGUsIGRhdGEpO1xuXHRcdFx0XHR9IFxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHRcblx0ZGF0YTogZnVuY3Rpb24oe3NlbGVjdG9yLCBkYXRhLCBlbGVtZW50cywgcGFzc1RvfSkge1xuXHRcdGlmIChzZWxlY3Rvcikge1xuXHRcdFx0dGhpcy5yZW5kZXIoc2VsZWN0b3IsIGRhdGEpO1xuXHRcdH0gZWxzZSBpZiAoZWxlbWVudHMpIHtcblx0XHRcdHRoaXMuc2V0VmFsdWUoZWxlbWVudHMsIGRhdGEsIHBhc3NUbyk7XG5cdFx0fVxuXHR9LFxuXHRcblx0cmVuZGVyIDogZnVuY3Rpb24oc2VsZWN0b3IsIGRhdGFSZXN1bHQpIHtcblx0XHRsZXQgdGVtcGxhdGVfZGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcilcblx0XHRpZiAoIXRlbXBsYXRlX2Rpdikge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoQXJyYXkuaXNBcnJheShkYXRhUmVzdWx0KSkge1xuXHRcdFx0dGVtcGxhdGVfZGl2LnNldEF0dHJpYnV0ZSgnZGF0YS1yZW5kZXJfYXJyYXknLCAndGVzdCcpO1xuXHRcdFx0dGhpcy5zZXRWYWx1ZShbdGVtcGxhdGVfZGl2XSwge3Rlc3Q6IGRhdGFSZXN1bHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSh0ZW1wbGF0ZV9kaXYuY2hpbGRyZW4sIGRhdGFSZXN1bHQpO1xuXHRcdH1cblx0fVxuXG59XG5leHBvcnQgZGVmYXVsdCBDb0NyZWF0ZVJlbmRlcjsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///../CoCreate-components/CoCreate-render/src/index.js\n");

/***/ })

/******/ })["default"];
});