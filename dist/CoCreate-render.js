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
/******/ 	return __webpack_require__(__webpack_require__.s = "../CoCreate-components/CoCreate-render/src/CoCreate-render.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../CoCreate-components/CoCreate-render/src/CoCreate-render.js":
/*!*********************************************************************!*\
  !*** ../CoCreate-components/CoCreate-render/src/CoCreate-render.js ***!
  \*********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ \"../node_modules/@babel/runtime/helpers/typeof.js\");\n/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ \"../node_modules/@babel/runtime/helpers/defineProperty.js\");\n/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__);\n\n\n\n/**\n * change name Class\n * add functionality to add value on any attr of each elements into template\n */\nvar CoCreateRender = {\n  __getValueFromObject: function __getValueFromObject(json, path) {\n    try {\n      if (typeof json == 'undefined' || !path) return false;\n      var jsonData = json,\n          subpath = path.split('.');\n\n      for (var i = 0; i < subpath.length; i++) {\n        jsonData = jsonData[subpath[i]];\n        if (!jsonData) return false;\n      }\n\n      return jsonData;\n    } catch (error) {\n      console.log(\"Error in getValueFromObject\", error);\n      return false;\n    }\n  },\n  __getValue: function __getValue(data, attrValue) {\n    var result = /{{\\s*([\\w\\W]+)\\s*}}/g.exec(attrValue);\n\n    if (result) {\n      return this.__getValueFromObject(data, result[1].trim());\n    }\n\n    return false;\n  },\n  __createObject: function __createObject(data, path) {\n    try {\n      if (!path) return data;\n      var keys = path.split('.');\n      var newObject = data;\n\n      for (var i = keys.length - 1; i >= 0; i--) {\n        newObject = _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default()({}, keys[i], newObject);\n      }\n\n      return newObject;\n    } catch (error) {\n      console.log(\"Error in getValueFromObject\", error);\n      return false;\n    }\n  },\n  setArray: function setArray(template, data) {\n    var type = template.getAttribute('data-render_array') || \"data\";\n    var render_key = template.getAttribute('data-render_key') || type;\n    var self = this;\n\n    var arrayData = this.__getValueFromObject(data, type);\n\n    if (type && Array.isArray(arrayData)) {\n      arrayData.forEach(function (item, index) {\n        var cloneEl = template.cloneNode(true);\n        cloneEl.classList.remove('template');\n        cloneEl.classList.add('clone_' + type);\n\n        if (_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(item) !== 'object') {\n          item = {\n            \"--\": item\n          };\n        } else {\n          item['index'] = index;\n        }\n\n        var r_data = self.__createObject(item, render_key);\n\n        self.setValue([cloneEl], r_data);\n        template.insertAdjacentHTML('beforebegin', cloneEl.outerHTML);\n      });\n    }\n  },\n  setValue: function setValue(els, data, passTo, template) {\n    if (!data) return;\n    var that = this;\n    Array.from(els).forEach(function (e) {\n      var passId = e.getAttribute('data-pass_id');\n\n      if (passTo && passId != passTo) {\n        return;\n      }\n\n      Array.from(e.attributes).forEach(function (attr) {\n        var attr_name = attr.name.toLowerCase();\n        var isPass = false;\n        var attrValue = attr.value;\n        var variables = attrValue.match(/{{\\s*(\\S+)\\s*}}/g);\n\n        if (!variables) {\n          return;\n        }\n\n        variables.forEach(function (attr) {\n          var value = that.__getValue(data, attr);\n\n          if (value && _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(value) !== \"object\") {\n            isPass = true;\n            attrValue = attrValue.replace(attr, value);\n          }\n        });\n\n        if (isPass) {\n          if (attr_name == 'value') {\n            var tag = e.tagName.toLowerCase();\n\n            switch (tag) {\n              case 'input':\n                e.setAttribute(attr_name, attrValue);\n                break;\n\n              case 'textarea':\n                e.setAttribute(attr_name, attrValue);\n                e.textContent = attrValue;\n                break;\n\n              default:\n                if (e.children.length === 0) {\n                  e.innerHTML = attrValue;\n                }\n\n            }\n          }\n\n          e.setAttribute(attr_name, attrValue);\n        }\n      });\n\n      if (e.children.length > 0) {\n        that.setValue(e.children, data);\n\n        if (e.classList.contains('template')) {\n          that.setArray(e, data);\n        }\n      }\n    });\n  },\n  data: function data(selector, dataResult) {\n    var template_div = document.querySelector(selector);\n\n    if (!template_div) {\n      return;\n    }\n\n    if (Array.isArray(dataResult)) {\n      template_div.setAttribute('data-render_array', 'test');\n      this.setValue([template_div], {\n        test: dataResult\n      });\n    } else {\n      this.setValue(template_div.children, dataResult);\n    }\n  }\n};\n/* harmony default export */ __webpack_exports__[\"default\"] = (CoCreateRender);//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Db0NyZWF0ZS5yZW5kZXIvLi4vQ29DcmVhdGUtY29tcG9uZW50cy9Db0NyZWF0ZS1yZW5kZXIvc3JjL0NvQ3JlYXRlLXJlbmRlci5qcz9mOGVhIl0sIm5hbWVzIjpbIkNvQ3JlYXRlUmVuZGVyIiwiX19nZXRWYWx1ZUZyb21PYmplY3QiLCJqc29uIiwicGF0aCIsImpzb25EYXRhIiwic3VicGF0aCIsInNwbGl0IiwiaSIsImxlbmd0aCIsImVycm9yIiwiY29uc29sZSIsImxvZyIsIl9fZ2V0VmFsdWUiLCJkYXRhIiwiYXR0clZhbHVlIiwicmVzdWx0IiwiZXhlYyIsInRyaW0iLCJfX2NyZWF0ZU9iamVjdCIsImtleXMiLCJuZXdPYmplY3QiLCJzZXRBcnJheSIsInRlbXBsYXRlIiwidHlwZSIsImdldEF0dHJpYnV0ZSIsInJlbmRlcl9rZXkiLCJzZWxmIiwiYXJyYXlEYXRhIiwiQXJyYXkiLCJpc0FycmF5IiwiZm9yRWFjaCIsIml0ZW0iLCJpbmRleCIsImNsb25lRWwiLCJjbG9uZU5vZGUiLCJjbGFzc0xpc3QiLCJyZW1vdmUiLCJhZGQiLCJyX2RhdGEiLCJzZXRWYWx1ZSIsImluc2VydEFkamFjZW50SFRNTCIsIm91dGVySFRNTCIsImVscyIsInBhc3NUbyIsInRoYXQiLCJmcm9tIiwiZSIsInBhc3NJZCIsImF0dHJpYnV0ZXMiLCJhdHRyIiwiYXR0cl9uYW1lIiwibmFtZSIsInRvTG93ZXJDYXNlIiwiaXNQYXNzIiwidmFsdWUiLCJ2YXJpYWJsZXMiLCJtYXRjaCIsInJlcGxhY2UiLCJ0YWciLCJ0YWdOYW1lIiwic2V0QXR0cmlidXRlIiwidGV4dENvbnRlbnQiLCJjaGlsZHJlbiIsImlubmVySFRNTCIsImNvbnRhaW5zIiwic2VsZWN0b3IiLCJkYXRhUmVzdWx0IiwidGVtcGxhdGVfZGl2IiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwidGVzdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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Q3pCb0MsWUFBSSxDQUFDTCxRQUFMLENBQWNPLENBQUMsQ0FBQ2dCLFFBQWhCLEVBQTBCakQsSUFBMUI7O0FBRUEsWUFBSWlDLENBQUMsQ0FBQ1gsU0FBRixDQUFZNkIsUUFBWixDQUFxQixVQUFyQixDQUFKLEVBQXNDO0FBQ3JDcEIsY0FBSSxDQUFDdkIsUUFBTCxDQUFjeUIsQ0FBZCxFQUFpQmpDLElBQWpCO0FBQ0E7QUFDRDtBQUNELEtBakREO0FBa0RBLEdBNUhxQjtBQThIdEJBLE1BQUksRUFBRyxjQUFTb0QsUUFBVCxFQUFtQkMsVUFBbkIsRUFBK0I7QUFDckMsUUFBSUMsWUFBWSxHQUFHQyxRQUFRLENBQUNDLGFBQVQsQ0FBdUJKLFFBQXZCLENBQW5COztBQUNBLFFBQUksQ0FBQ0UsWUFBTCxFQUFtQjtBQUNsQjtBQUNBOztBQUNELFFBQUl2QyxLQUFLLENBQUNDLE9BQU4sQ0FBY3FDLFVBQWQsQ0FBSixFQUErQjtBQUM5QkMsa0JBQVksQ0FBQ1AsWUFBYixDQUEwQixtQkFBMUIsRUFBK0MsTUFBL0M7QUFDQSxXQUFLckIsUUFBTCxDQUFjLENBQUM0QixZQUFELENBQWQsRUFBOEI7QUFBQ0csWUFBSSxFQUFFSjtBQUFQLE9BQTlCO0FBQ0EsS0FIRCxNQUdPO0FBQ04sV0FBSzNCLFFBQUwsQ0FBYzRCLFlBQVksQ0FBQ0wsUUFBM0IsRUFBcUNJLFVBQXJDO0FBQ0E7QUFDRDtBQXpJcUIsQ0FBdkI7QUE0SWVsRSw2RUFBZiIsImZpbGUiOiIuLi9Db0NyZWF0ZS1jb21wb25lbnRzL0NvQ3JlYXRlLXJlbmRlci9zcmMvQ29DcmVhdGUtcmVuZGVyLmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBjaGFuZ2UgbmFtZSBDbGFzc1xuICogYWRkIGZ1bmN0aW9uYWxpdHkgdG8gYWRkIHZhbHVlIG9uIGFueSBhdHRyIG9mIGVhY2ggZWxlbWVudHMgaW50byB0ZW1wbGF0ZVxuICovXG5jb25zdCBDb0NyZWF0ZVJlbmRlciA9IHtcblxuXHRfX2dldFZhbHVlRnJvbU9iamVjdCA6IGZ1bmN0aW9uKGpzb24sIHBhdGgpIHtcblx0XHR0cnkge1xuXHRcdFx0aWYodHlwZW9mIGpzb24gPT0gJ3VuZGVmaW5lZCcgfHwgIXBhdGgpXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdGxldCBqc29uRGF0YSA9IGpzb24sIHN1YnBhdGggPSBwYXRoLnNwbGl0KCcuJyk7XG5cdFx0XHRcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc3VicGF0aC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRqc29uRGF0YSA9IGpzb25EYXRhW3N1YnBhdGhbaV1dO1xuXHRcdFx0XHRpZiAoIWpzb25EYXRhKSByZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4ganNvbkRhdGE7XG5cdFx0fWNhdGNoKGVycm9yKXtcblx0XHRcdGNvbnNvbGUubG9nKFwiRXJyb3IgaW4gZ2V0VmFsdWVGcm9tT2JqZWN0XCIsIGVycm9yKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdFxuXHRfX2dldFZhbHVlOiBmdW5jdGlvbihkYXRhLCBhdHRyVmFsdWUpIHtcblx0XHRsZXQgcmVzdWx0ID0gL3t7XFxzKihbXFx3XFxXXSspXFxzKn19L2cuZXhlYyhhdHRyVmFsdWUpO1xuXHRcdGlmIChyZXN1bHQpIHtcblx0XHRcdHJldHVybiB0aGlzLl9fZ2V0VmFsdWVGcm9tT2JqZWN0KGRhdGEsIHJlc3VsdFsxXS50cmltKCkpO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XG5cdH0sXG5cdFxuXHRfX2NyZWF0ZU9iamVjdDogZnVuY3Rpb24gKGRhdGEsIHBhdGgpIHtcblx0XHR0cnkge1xuXHRcdFx0aWYgKCFwYXRoKSByZXR1cm4gZGF0YTtcblx0XHRcdFxuXHRcdFx0bGV0IGtleXMgPSBwYXRoLnNwbGl0KCcuJylcblx0XHRcdGxldCBuZXdPYmplY3QgPSBkYXRhO1xuXG5cdFx0XHRmb3IgKHZhciAgaSA9IGtleXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0XHRcdFx0bmV3T2JqZWN0ID0ge1trZXlzW2ldXTogbmV3T2JqZWN0fVx0XHRcdFx0XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbmV3T2JqZWN0O1xuXHRcdFx0XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdGNvbnNvbGUubG9nKFwiRXJyb3IgaW4gZ2V0VmFsdWVGcm9tT2JqZWN0XCIsIGVycm9yKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdFxuXHRzZXRBcnJheTogZnVuY3Rpb24odGVtcGxhdGUsIGRhdGEpIHtcblx0XHRjb25zdCB0eXBlID0gdGVtcGxhdGUuZ2V0QXR0cmlidXRlKCdkYXRhLXJlbmRlcl9hcnJheScpIHx8IFwiZGF0YVwiO1xuXHRcdGNvbnN0IHJlbmRlcl9rZXkgPSB0ZW1wbGF0ZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcmVuZGVyX2tleScpIHx8IHR5cGU7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0Y29uc3QgYXJyYXlEYXRhID0gdGhpcy5fX2dldFZhbHVlRnJvbU9iamVjdChkYXRhLCB0eXBlKTtcblxuXHRcdGlmICh0eXBlICYmIEFycmF5LmlzQXJyYXkoYXJyYXlEYXRhKSkge1xuXHRcdFx0YXJyYXlEYXRhLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG5cdFx0XHRcdFxuXHRcdFx0XHRsZXQgY2xvbmVFbCA9IHRlbXBsYXRlLmNsb25lTm9kZSh0cnVlKTtcblx0XHRcdFx0Y2xvbmVFbC5jbGFzc0xpc3QucmVtb3ZlKCd0ZW1wbGF0ZScpO1xuXHRcdFx0XHRjbG9uZUVsLmNsYXNzTGlzdC5hZGQoJ2Nsb25lXycgKyB0eXBlKTtcblx0XHRcdFx0aWYgKHR5cGVvZiBpdGVtICE9PSAnb2JqZWN0Jykge1xuXHRcdFx0XHRcdGl0ZW0gPSB7XCItLVwiOiBpdGVtfTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpdGVtWydpbmRleCddID0gaW5kZXg7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGV0IHJfZGF0YSA9IHNlbGYuX19jcmVhdGVPYmplY3QoaXRlbSwgcmVuZGVyX2tleSk7XG5cblx0XHRcdFx0c2VsZi5zZXRWYWx1ZShbY2xvbmVFbF0sIHJfZGF0YSk7XG5cdFx0XHRcdHRlbXBsYXRlLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlYmVnaW4nLCBjbG9uZUVsLm91dGVySFRNTCk7XG5cdFx0XHR9KVxuXHRcdH1cblx0fSxcbiBcblx0c2V0VmFsdWU6ZnVuY3Rpb24oZWxzLCBkYXRhLCBwYXNzVG8sIHRlbXBsYXRlKXtcblx0XHRpZiAoIWRhdGEpIHJldHVybjtcblx0XHRjb25zdCB0aGF0ID0gdGhpcztcblx0XHRBcnJheS5mcm9tKGVscykuZm9yRWFjaChlID0+IHtcblx0XHRcdGxldCBwYXNzSWQgPSBlLmdldEF0dHJpYnV0ZSgnZGF0YS1wYXNzX2lkJyk7XG5cdFx0XHRpZiAocGFzc1RvICYmIHBhc3NJZCAhPSBwYXNzVG8pIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0QXJyYXkuZnJvbShlLmF0dHJpYnV0ZXMpLmZvckVhY2goYXR0cj0+e1xuXHRcdFx0XHRsZXQgYXR0cl9uYW1lID0gYXR0ci5uYW1lLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRcdGxldCAgaXNQYXNzID0gZmFsc2U7XG5cdFx0XHRcdGxldCBhdHRyVmFsdWUgPSBhdHRyLnZhbHVlO1xuXHRcdFx0XHRsZXQgdmFyaWFibGVzID0gYXR0clZhbHVlLm1hdGNoKC97e1xccyooXFxTKylcXHMqfX0vZyk7XG5cdFx0XHRcdGlmICghdmFyaWFibGVzKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHR2YXJpYWJsZXMuZm9yRWFjaCgoYXR0cikgPT4ge1xuXHRcdFx0XHRcdGxldCB2YWx1ZSA9IHRoYXQuX19nZXRWYWx1ZShkYXRhLCBhdHRyKVxuXHRcdFx0XHRcdGlmICh2YWx1ZSAmJiB0eXBlb2YodmFsdWUpICE9PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0XHRpc1Bhc3MgPSB0cnVlO1xuXHRcdFx0XHRcdFx0YXR0clZhbHVlID0gYXR0clZhbHVlLnJlcGxhY2UoYXR0ciwgdmFsdWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdFx0aWYgKGlzUGFzcykge1xuXHRcdFx0XHRcdGlmKGF0dHJfbmFtZSA9PSAndmFsdWUnKXtcblx0XHRcdFx0XHRcdGxldCB0YWcgPSBlLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0XHRcdHN3aXRjaCAodGFnKSB7XG5cdFx0XHRcdFx0XHRcdGNhc2UgJ2lucHV0Jzpcblx0XHRcdFx0XHRcdFx0XHQgZS5zZXRBdHRyaWJ1dGUoYXR0cl9uYW1lLCBhdHRyVmFsdWUpO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRjYXNlICd0ZXh0YXJlYSc6XG5cdFx0XHRcdFx0XHRcdFx0ZS5zZXRBdHRyaWJ1dGUoYXR0cl9uYW1lLCBhdHRyVmFsdWUpO1xuXHRcdFx0XHRcdFx0XHRcdGUudGV4dENvbnRlbnQgPSBhdHRyVmFsdWU7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGUuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRlLmlubmVySFRNTCA9ICBhdHRyVmFsdWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlLnNldEF0dHJpYnV0ZShhdHRyX25hbWUsIGF0dHJWYWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHRpZihlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0dGhhdC5zZXRWYWx1ZShlLmNoaWxkcmVuLCBkYXRhKVxuXHRcdFx0XHRcblx0XHRcdFx0aWYgKGUuY2xhc3NMaXN0LmNvbnRhaW5zKCd0ZW1wbGF0ZScpKSB7XG5cdFx0XHRcdFx0dGhhdC5zZXRBcnJheShlLCBkYXRhKTtcblx0XHRcdFx0fSBcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0XG5cdGRhdGEgOiBmdW5jdGlvbihzZWxlY3RvciwgZGF0YVJlc3VsdCkge1xuXHRcdGxldCB0ZW1wbGF0ZV9kaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxuXHRcdGlmICghdGVtcGxhdGVfZGl2KSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmIChBcnJheS5pc0FycmF5KGRhdGFSZXN1bHQpKSB7XG5cdFx0XHR0ZW1wbGF0ZV9kaXYuc2V0QXR0cmlidXRlKCdkYXRhLXJlbmRlcl9hcnJheScsICd0ZXN0Jyk7XG5cdFx0XHR0aGlzLnNldFZhbHVlKFt0ZW1wbGF0ZV9kaXZdLCB7dGVzdDogZGF0YVJlc3VsdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNldFZhbHVlKHRlbXBsYXRlX2Rpdi5jaGlsZHJlbiwgZGF0YVJlc3VsdCk7XG5cdFx0fVxuXHR9XG5cbn1cbmV4cG9ydCBkZWZhdWx0IENvQ3JlYXRlUmVuZGVyOyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///../CoCreate-components/CoCreate-render/src/CoCreate-render.js\n");

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/defineProperty.js":
/*!****************************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/defineProperty.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function _defineProperty(obj, key, value) {\n  if (key in obj) {\n    Object.defineProperty(obj, key, {\n      value: value,\n      enumerable: true,\n      configurable: true,\n      writable: true\n    });\n  } else {\n    obj[key] = value;\n  }\n\n  return obj;\n}\n\nmodule.exports = _defineProperty;//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Db0NyZWF0ZS5yZW5kZXIvLi4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZGVmaW5lUHJvcGVydHkuanM/M2FmMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBOztBQUVBIiwiZmlsZSI6Ii4uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2RlZmluZVByb3BlcnR5LmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5IGluIG9iaikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgb2JqW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2RlZmluZVByb3BlcnR5OyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///../node_modules/@babel/runtime/helpers/defineProperty.js\n");

/***/ }),

/***/ "../node_modules/@babel/runtime/helpers/typeof.js":
/*!********************************************************!*\
  !*** ../node_modules/@babel/runtime/helpers/typeof.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function _typeof(obj) {\n  \"@babel/helpers - typeof\";\n\n  if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") {\n    module.exports = _typeof = function _typeof(obj) {\n      return typeof obj;\n    };\n  } else {\n    module.exports = _typeof = function _typeof(obj) {\n      return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj;\n    };\n  }\n\n  return _typeof(obj);\n}\n\nmodule.exports = _typeof;//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Db0NyZWF0ZS5yZW5kZXIvLi4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mLmpzPzdiZTEiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBIiwiZmlsZSI6Ii4uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZi5qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gIFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjtcblxuICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmo7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBfdHlwZW9mKG9iaik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3R5cGVvZjsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///../node_modules/@babel/runtime/helpers/typeof.js\n");

/***/ })

/******/ })["default"];
});