/*

  quickfilter.js

  (c) 2014 Michael Hoy <michael.john.hoy@gmail.com>

  quickfilter may be freely distributed under the MIT license.

*/

(function ($, root) {

  "use strict";

  var version = "0.0.1";

  var _initializing = false;

  var _hasProp = {}.hasOwnProperty;

  var _old_qf = root.QF;

  var QF = function(selector) {
    this.nodes = [];
    
    if(!_initializing) {
      this.selector = selector;
      this.init();
    }
  };

  QF.prototype = {
    selector: undefined,
    nodeSelector: '.node',

    /* process a node (dom element), returns data object */
    processNode: function (node) {
      return({
        element: node
      });
    },
    
    init: function () {
      var q = this;
      $(this.nodeSelector, this.selector).each(function() {
        var data = q.processNode(this);
        q.nodes.push(data);
      });
    }
  };

  QF.extend = function(prop) {
    _initializing = true;
    var prototype = new QF();
    _initializing = false;
    for (var key in prop)
      if (_hasProp.call(prop, key))
        prototype[key] = prop[key];
    function K() {
      QF.apply(this, arguments);
    }
    K.prototype = prototype;
    K.prototype.constructor = K;

    return K;
  };

  QF.create = function(proto) {
    return new (QF.extend(proto))();
  };

  QF.version = version;
  QF.old_qf = _old_qf;

  root.QF = QF;

})(jQuery, this);
