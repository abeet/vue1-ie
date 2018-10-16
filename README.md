# vue1-ie8
Vue1适配IE8，Vue1兼容IE8。  
判断当前浏览器为IE8后，会对Vue的实现作许多调整（vue和vue组件实例换成VBScript对象），在非IE8浏览器，仍然是原来的Vue的实现。
所以在IE9+及其他现代浏览器下和原Vue没有任何区别。  

感谢以下项目提供的IE6/7/8下实现setter/getter的思路：  
https://github.com/dojo/dojox/blob/master/lang/observable.js  
https://github.com/RubyLouvre/avalon/blob/1.6/src/model/defineProperties.js  