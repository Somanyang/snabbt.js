'use strict';
/* global window */

var Engine = require('./engine.js');
var preprocessOptions = require('./properties.js').preprocessOptions;
var utils = require('./utils.js');
var createMatrix = require('./matrix.js');
var updateElementTransform = require('./utils.js').updateElementTransform;

function snabbt(elements, arg2, arg3) {
  if (!elements.length) {
    if (typeof arg2 === 'string')
      return Engine.initializeAnimation(elements, arg2, preprocessOptions(arg3, 0, 1));
    return Engine.initializeAnimation(elements, preprocessOptions(arg2, 0, 1), arg3);
  }

  var chainers = [];
  var aggregateChainer = {
    snabbt(opts) {
      var len = chainers.length;
      chainers.forEach(function(chainer, index) {
        chainer.snabbt(preprocessOptions(opts, index, len));
      });
      return aggregateChainer;
    },
    setValue(value) {
      chainers.forEach(function(chainer) {
        chainer.setValue(value);
      });
      return aggregateChainer;
    },
    finish(callback) {
      chainers.forEach(function(chainer, index) {
        if (utils.isFunction(callback))
          return chainer.finish(() => {
            callback(index, chainers.length);
          });
        chainer.finish();
      });
      return aggregateChainer;
    },
    rollback(callback) {
      chainers.forEach(function(chainer, index) {
        if (utils.isFunction(callback))
          return chainer.rollback(() => {
            callback(index, chainers.length);
          });
        chainer.rollback();
      });
      return aggregateChainer;
    }
  };

  for (var i = 0, len = elements.length; i < len; ++i) {
    if (typeof arg2 === 'string')
      chainers.push(Engine.initializeAnimation(elements[i], arg2, preprocessOptions(arg3, i, len)));
    else
      chainers.push(Engine.initializeAnimation(elements[i], preprocessOptions(arg2, i, len), arg3));
  }
  return aggregateChainer;
}

//if (typeof window !== 'undefined') {
//  window.snabbt = function(element, arg2, arg3) {
//    return snabbt(element, arg2, arg3);
//  };
//  window.snabbt.createMatrix = createMatrix;
//  window.snabbt.setElementTransform = updateElementTransform;
//
//  if (window.jQuery) {
//    (function ($) {
//      $.fn.snabbt = function(arg1, arg2) {
//        return snabbt(this.get(), arg1, arg2);
//      };
//    })(window.jQuery);
//  }
//} else {

module.exports = function(element, arg2, arg3) {
  return snabbt(element, arg2, arg3);
};
module.exports.createMatrix = createMatrix;
module.exports.setElementTransform = updateElementTransform;

if (typeof window !== 'undefined' && window.jQuery) {
  (function ($) {
    $.fn.snabbt = function(arg1, arg2) {
      return snabbt(this.get(), arg1, arg2);
    };
  })(window.jQuery);
}

//}

Engine.init();
