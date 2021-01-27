(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["CoCreateRender"] = factory();
	else
		root["CoCreateRender"] = factory();
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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/CoCreate-render.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/CoCreate-render.js":
/*!********************************!*\
  !*** ./src/CoCreate-render.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nfunction _typeof(obj) { \"@babel/helpers - typeof\"; if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n/**\n * change name Class\n * add functionality to add value on any attr of each elements into template\n */\nvar CoCreateRender = {\n  __getValueFromObject: function __getValueFromObject(json, path) {\n    try {\n      if (typeof json == 'undefined' || !path) return false;\n      var jsonData = json,\n          subpath = path.split('.');\n\n      for (var i = 0; i < subpath.length; i++) {\n        jsonData = jsonData[subpath[i]];\n        if (!jsonData) return false;\n      }\n\n      return jsonData;\n    } catch (error) {\n      console.log(\"Error in getValueFromObject\", error);\n      return false;\n    }\n  },\n  __getValue: function __getValue(data, attrValue) {\n    var result = /{{\\s*([\\w\\W]+)\\s*}}/g.exec(attrValue);\n\n    if (result) {\n      return this.__getValueFromObject(data, result[1].trim());\n    }\n\n    return false;\n  },\n  __createObject: function __createObject(data, path) {\n    try {\n      if (!path) return data;\n      var keys = path.split('.');\n      var newObject = data;\n\n      for (var i = keys.length - 1; i >= 0; i--) {\n        newObject = _defineProperty({}, keys[i], newObject);\n      }\n\n      return newObject;\n    } catch (error) {\n      console.log(\"Error in getValueFromObject\", error);\n      return false;\n    }\n  },\n  setArray: function setArray(template, data) {\n    var type = template.getAttribute('data-render_array') || \"data\";\n    var render_key = template.getAttribute('data-render_key') || type;\n    var self = this;\n\n    var arrayData = this.__getValueFromObject(data, type);\n\n    if (type && Array.isArray(arrayData)) {\n      arrayData.forEach(function (item, index) {\n        var cloneEl = template.cloneNode(true);\n        cloneEl.classList.remove('template');\n        cloneEl.classList.add('clone_' + type);\n\n        if (_typeof(item) !== 'object') {\n          item = {\n            \"--\": item\n          };\n        } else {\n          item['index'] = index;\n        }\n\n        var r_data = self.__createObject(item, render_key);\n\n        self.setValue([cloneEl], r_data);\n        template.insertAdjacentHTML('beforebegin', cloneEl.outerHTML);\n      });\n    }\n  },\n  setValue: function setValue(els, data, passTo, template) {\n    if (!data) return;\n    var that = this;\n    Array.from(els).forEach(function (e) {\n      var passId = e.getAttribute('data-pass_id');\n\n      if (passTo && passId != passTo) {\n        return;\n      }\n\n      Array.from(e.attributes).forEach(function (attr) {\n        var attr_name = attr.name.toLowerCase();\n        var isPass = false;\n        var attrValue = attr.value;\n        var variables = attrValue.match(/{{\\s*(\\S+)\\s*}}/g);\n\n        if (!variables) {\n          return;\n        }\n\n        variables.forEach(function (attr) {\n          var value = that.__getValue(data, attr);\n\n          if (value && _typeof(value) !== \"object\") {\n            isPass = true;\n            attrValue = attrValue.replace(attr, value);\n          }\n        });\n\n        if (isPass) {\n          if (attr_name == 'value') {\n            var tag = e.tagName.toLowerCase();\n\n            switch (tag) {\n              case 'input':\n                e.setAttribute(attr_name, attrValue);\n                break;\n\n              case 'textarea':\n                e.setAttribute(attr_name, attrValue);\n                e.textContent = attrValue;\n                break;\n\n              default:\n                if (e.children.length === 0) {\n                  e.innerHTML = attrValue;\n                }\n\n            }\n          }\n\n          e.setAttribute(attr_name, attrValue);\n        }\n      });\n\n      if (e.children.length > 0) {\n        that.setValue(e.children, data);\n\n        if (e.classList.contains('template')) {\n          that.setArray(e, data);\n        }\n      }\n    });\n  },\n  render: function render(selector, dataResult) {\n    var template_div = document.querySelector(selector);\n\n    if (!template_div) {\n      return;\n    }\n\n    if (Array.isArray(dataResult)) {\n      template_div.setAttribute('data-render_array', 'test');\n      this.setValue([template_div], {\n        test: dataResult\n      });\n    } else {\n      this.setValue(template_div.children, dataResult);\n    }\n  }\n};\n/* harmony default export */ __webpack_exports__[\"default\"] = (CoCreateRender);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Db0NyZWF0ZVJlbmRlci8uL3NyYy9Db0NyZWF0ZS1yZW5kZXIuanM/M2QwZSJdLCJuYW1lcyI6WyJDb0NyZWF0ZVJlbmRlciIsIl9fZ2V0VmFsdWVGcm9tT2JqZWN0IiwianNvbiIsInBhdGgiLCJqc29uRGF0YSIsInN1YnBhdGgiLCJzcGxpdCIsImkiLCJsZW5ndGgiLCJlcnJvciIsImNvbnNvbGUiLCJsb2ciLCJfX2dldFZhbHVlIiwiZGF0YSIsImF0dHJWYWx1ZSIsInJlc3VsdCIsImV4ZWMiLCJ0cmltIiwiX19jcmVhdGVPYmplY3QiLCJrZXlzIiwibmV3T2JqZWN0Iiwic2V0QXJyYXkiLCJ0ZW1wbGF0ZSIsInR5cGUiLCJnZXRBdHRyaWJ1dGUiLCJyZW5kZXJfa2V5Iiwic2VsZiIsImFycmF5RGF0YSIsIkFycmF5IiwiaXNBcnJheSIsImZvckVhY2giLCJpdGVtIiwiaW5kZXgiLCJjbG9uZUVsIiwiY2xvbmVOb2RlIiwiY2xhc3NMaXN0IiwicmVtb3ZlIiwiYWRkIiwicl9kYXRhIiwic2V0VmFsdWUiLCJpbnNlcnRBZGphY2VudEhUTUwiLCJvdXRlckhUTUwiLCJlbHMiLCJwYXNzVG8iLCJ0aGF0IiwiZnJvbSIsImUiLCJwYXNzSWQiLCJhdHRyaWJ1dGVzIiwiYXR0ciIsImF0dHJfbmFtZSIsIm5hbWUiLCJ0b0xvd2VyQ2FzZSIsImlzUGFzcyIsInZhbHVlIiwidmFyaWFibGVzIiwibWF0Y2giLCJyZXBsYWNlIiwidGFnIiwidGFnTmFtZSIsInNldEF0dHJpYnV0ZSIsInRleHRDb250ZW50IiwiY2hpbGRyZW4iLCJpbm5lckhUTUwiLCJjb250YWlucyIsInJlbmRlciIsInNlbGVjdG9yIiwiZGF0YVJlc3VsdCIsInRlbXBsYXRlX2RpdiIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsInRlc3QiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFNQSxjQUFjLEdBQUc7QUFFdEJDLHNCQUFvQixF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LFFBQWhCLEVBQTBCakQsSUFBMUI7O0FBRUEsWUFBSWlDLENBQUMsQ0FBQ1gsU0FBRixDQUFZNkIsUUFBWixDQUFxQixVQUFyQixDQUFKLEVBQXNDO0FBQ3JDcEIsY0FBSSxDQUFDdkIsUUFBTCxDQUFjeUIsQ0FBZCxFQUFpQmpDLElBQWpCO0FBQ0E7QUFDRDtBQUNELEtBakREO0FBa0RBLEdBNUhxQjtBQThIdEJvRCxRQUFNLEVBQUcsZ0JBQVNDLFFBQVQsRUFBbUJDLFVBQW5CLEVBQStCO0FBQ3ZDLFFBQUlDLFlBQVksR0FBR0MsUUFBUSxDQUFDQyxhQUFULENBQXVCSixRQUF2QixDQUFuQjs7QUFDQSxRQUFJLENBQUNFLFlBQUwsRUFBbUI7QUFDbEI7QUFDQTs7QUFDRCxRQUFJeEMsS0FBSyxDQUFDQyxPQUFOLENBQWNzQyxVQUFkLENBQUosRUFBK0I7QUFDOUJDLGtCQUFZLENBQUNSLFlBQWIsQ0FBMEIsbUJBQTFCLEVBQStDLE1BQS9DO0FBQ0EsV0FBS3JCLFFBQUwsQ0FBYyxDQUFDNkIsWUFBRCxDQUFkLEVBQThCO0FBQUNHLFlBQUksRUFBRUo7QUFBUCxPQUE5QjtBQUNBLEtBSEQsTUFHTztBQUNOLFdBQUs1QixRQUFMLENBQWM2QixZQUFZLENBQUNOLFFBQTNCLEVBQXFDSyxVQUFyQztBQUNBO0FBQ0Q7QUF6SXFCLENBQXZCO0FBNEllbkUsNkVBQWYiLCJmaWxlIjoiLi9zcmMvQ29DcmVhdGUtcmVuZGVyLmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBjaGFuZ2UgbmFtZSBDbGFzc1xuICogYWRkIGZ1bmN0aW9uYWxpdHkgdG8gYWRkIHZhbHVlIG9uIGFueSBhdHRyIG9mIGVhY2ggZWxlbWVudHMgaW50byB0ZW1wbGF0ZVxuICovXG5jb25zdCBDb0NyZWF0ZVJlbmRlciA9IHtcblxuXHRfX2dldFZhbHVlRnJvbU9iamVjdCA6IGZ1bmN0aW9uKGpzb24sIHBhdGgpIHtcblx0XHR0cnkge1xuXHRcdFx0aWYodHlwZW9mIGpzb24gPT0gJ3VuZGVmaW5lZCcgfHwgIXBhdGgpXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdGxldCBqc29uRGF0YSA9IGpzb24sIHN1YnBhdGggPSBwYXRoLnNwbGl0KCcuJyk7XG5cdFx0XHRcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3VicGF0aC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRqc29uRGF0YSA9IGpzb25EYXRhW3N1YnBhdGhbaV1dO1xuXHRcdFx0XHRpZiAoIWpzb25EYXRhKSByZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4ganNvbkRhdGE7XG5cdFx0fWNhdGNoKGVycm9yKXtcblx0XHRcdGNvbnNvbGUubG9nKFwiRXJyb3IgaW4gZ2V0VmFsdWVGcm9tT2JqZWN0XCIsIGVycm9yKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdFxuXHRfX2dldFZhbHVlOiBmdW5jdGlvbihkYXRhLCBhdHRyVmFsdWUpIHtcblx0XHRsZXQgcmVzdWx0ID0gL3t7XFxzKihbXFx3XFxXXSspXFxzKn19L2cuZXhlYyhhdHRyVmFsdWUpO1xuXHRcdGlmIChyZXN1bHQpIHtcblx0XHRcdHJldHVybiB0aGlzLl9fZ2V0VmFsdWVGcm9tT2JqZWN0KGRhdGEsIHJlc3VsdFsxXS50cmltKCkpO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XG5cdH0sXG5cdFxuXHRfX2NyZWF0ZU9iamVjdDogZnVuY3Rpb24gKGRhdGEsIHBhdGgpIHtcblx0XHR0cnkge1xuXHRcdFx0aWYgKCFwYXRoKSByZXR1cm4gZGF0YTtcblx0XHRcdFxuXHRcdFx0bGV0IGtleXMgPSBwYXRoLnNwbGl0KCcuJylcblx0XHRcdGxldCBuZXdPYmplY3QgPSBkYXRhO1xuXG5cdFx0XHRmb3IgKHZhciAgaSA9IGtleXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0XHRcdFx0bmV3T2JqZWN0ID0ge1trZXlzW2ldXTogbmV3T2JqZWN0fVx0XHRcdFx0XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbmV3T2JqZWN0O1xuXHRcdFx0XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdGNvbnNvbGUubG9nKFwiRXJyb3IgaW4gZ2V0VmFsdWVGcm9tT2JqZWN0XCIsIGVycm9yKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdFxuXHRzZXRBcnJheTogZnVuY3Rpb24odGVtcGxhdGUsIGRhdGEpIHtcblx0XHRjb25zdCB0eXBlID0gdGVtcGxhdGUuZ2V0QXR0cmlidXRlKCdkYXRhLXJlbmRlcl9hcnJheScpIHx8IFwiZGF0YVwiO1xuXHRcdGNvbnN0IHJlbmRlcl9rZXkgPSB0ZW1wbGF0ZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcmVuZGVyX2tleScpIHx8IHR5cGU7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0Y29uc3QgYXJyYXlEYXRhID0gdGhpcy5fX2dldFZhbHVlRnJvbU9iamVjdChkYXRhLCB0eXBlKTtcblxuXHRcdGlmICh0eXBlICYmIEFycmF5LmlzQXJyYXkoYXJyYXlEYXRhKSkge1xuXHRcdFx0YXJyYXlEYXRhLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG5cdFx0XHRcdFxuXHRcdFx0XHRsZXQgY2xvbmVFbCA9IHRlbXBsYXRlLmNsb25lTm9kZSh0cnVlKTtcblx0XHRcdFx0Y2xvbmVFbC5jbGFzc0xpc3QucmVtb3ZlKCd0ZW1wbGF0ZScpO1xuXHRcdFx0XHRjbG9uZUVsLmNsYXNzTGlzdC5hZGQoJ2Nsb25lXycgKyB0eXBlKTtcblx0XHRcdFx0aWYgKHR5cGVvZiBpdGVtICE9PSAnb2JqZWN0Jykge1xuXHRcdFx0XHRcdGl0ZW0gPSB7XCItLVwiOiBpdGVtfTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpdGVtWydpbmRleCddID0gaW5kZXg7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGV0IHJfZGF0YSA9IHNlbGYuX19jcmVhdGVPYmplY3QoaXRlbSwgcmVuZGVyX2tleSk7XG5cblx0XHRcdFx0c2VsZi5zZXRWYWx1ZShbY2xvbmVFbF0sIHJfZGF0YSk7XG5cdFx0XHRcdHRlbXBsYXRlLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlYmVnaW4nLCBjbG9uZUVsLm91dGVySFRNTCk7XG5cdFx0XHR9KVxuXHRcdH1cblx0fSxcbiBcblx0c2V0VmFsdWU6ZnVuY3Rpb24oZWxzLCBkYXRhLCBwYXNzVG8sIHRlbXBsYXRlKXtcblx0XHRpZiAoIWRhdGEpIHJldHVybjtcblx0XHRjb25zdCB0aGF0ID0gdGhpcztcblx0XHRBcnJheS5mcm9tKGVscykuZm9yRWFjaChlID0+IHtcblx0XHRcdGxldCBwYXNzSWQgPSBlLmdldEF0dHJpYnV0ZSgnZGF0YS1wYXNzX2lkJyk7XG5cdFx0XHRpZiAocGFzc1RvICYmIHBhc3NJZCAhPSBwYXNzVG8pIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0QXJyYXkuZnJvbShlLmF0dHJpYnV0ZXMpLmZvckVhY2goYXR0cj0+e1xuXHRcdFx0XHRsZXQgYXR0cl9uYW1lID0gYXR0ci5uYW1lLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdGxldCAgaXNQYXNzID0gZmFsc2U7XG5cdFx0XHRcdGxldCBhdHRyVmFsdWUgPSBhdHRyLnZhbHVlO1xuXHRcdFx0XHRsZXQgdmFyaWFibGVzID0gYXR0clZhbHVlLm1hdGNoKC97e1xccyooXFxTKylcXHMqfX0vZyk7XG5cdFx0XHRcdGlmICghdmFyaWFibGVzKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHR2YXJpYWJsZXMuZm9yRWFjaCgoYXR0cikgPT4ge1xuXHRcdFx0XHRcdGxldCB2YWx1ZSA9IHRoYXQuX19nZXRWYWx1ZShkYXRhLCBhdHRyKVxuXHRcdFx0XHRcdGlmICh2YWx1ZSAmJiB0eXBlb2YodmFsdWUpICE9PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0XHRpc1Bhc3MgPSB0cnVlO1xuXHRcdFx0XHRcdFx0YXR0clZhbHVlID0gYXR0clZhbHVlLnJlcGxhY2UoYXR0ciwgdmFsdWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdFx0aWYgKGlzUGFzcykge1xuXHRcdFx0XHRcdGlmKGF0dHJfbmFtZSA9PSAndmFsdWUnKXtcblx0XHRcdFx0XHRcdGxldCB0YWcgPSBlLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0XHRcdHN3aXRjaCAodGFnKSB7XG5cdFx0XHRcdFx0XHRcdGNhc2UgJ2lucHV0Jzpcblx0XHRcdFx0XHRcdFx0XHQgZS5zZXRBdHRyaWJ1dGUoYXR0cl9uYW1lLCBhdHRyVmFsdWUpO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRjYXNlICd0ZXh0YXJlYSc6XG5cdFx0XHRcdFx0XHRcdFx0ZS5zZXRBdHRyaWJ1dGUoYXR0cl9uYW1lLCBhdHRyVmFsdWUpO1xuXHRcdFx0XHRcdFx0XHRcdGUudGV4dENvbnRlbnQgPSBhdHRyVmFsdWU7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGUuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRlLmlubmVySFRNTCA9ICBhdHRyVmFsdWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlLnNldEF0dHJpYnV0ZShhdHRyX25hbWUsIGF0dHJWYWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHRpZihlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0dGhhdC5zZXRWYWx1ZShlLmNoaWxkcmVuLCBkYXRhKVxuXHRcdFx0XHRcblx0XHRcdFx0aWYgKGUuY2xhc3NMaXN0LmNvbnRhaW5zKCd0ZW1wbGF0ZScpKSB7XG5cdFx0XHRcdFx0dGhhdC5zZXRBcnJheShlLCBkYXRhKTtcblx0XHRcdFx0fSBcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0XG5cdHJlbmRlciA6IGZ1bmN0aW9uKHNlbGVjdG9yLCBkYXRhUmVzdWx0KSB7XG5cdFx0bGV0IHRlbXBsYXRlX2RpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG5cdFx0aWYgKCF0ZW1wbGF0ZV9kaXYpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoZGF0YVJlc3VsdCkpIHtcblx0XHRcdHRlbXBsYXRlX2Rpdi5zZXRBdHRyaWJ1dGUoJ2RhdGEtcmVuZGVyX2FycmF5JywgJ3Rlc3QnKTtcblx0XHRcdHRoaXMuc2V0VmFsdWUoW3RlbXBsYXRlX2Rpdl0sIHt0ZXN0OiBkYXRhUmVzdWx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2V0VmFsdWUodGVtcGxhdGVfZGl2LmNoaWxkcmVuLCBkYXRhUmVzdWx0KTtcblx0XHR9XG5cdH1cblxufVxuZXhwb3J0IGRlZmF1bHQgQ29DcmVhdGVSZW5kZXI7Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./src/CoCreate-render.js\n");

/***/ })

/******/ })["default"];
});