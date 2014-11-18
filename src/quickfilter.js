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
    this.filterSets = {};
    
    if(!_initializing) {
      this.selector = selector;
      this.init();
    }
  };

  QF.prototype = {
    selector: undefined,
    nodeSelector: '.node',
    filterSetSelector: '.filter-set',
    filterSetId: 'filter-set-id',
    filterSelector: '.filter',


    /* process a node (dom element), returns data object */
    processNode: function (node) {
      return({
        element: node
      });
    },

    /* process a filter set (dom element), return data object */
    processFilterSet: function (filterSet) {
      return({
        name: $(filterSet).data('filter-set-id')
      });
    },
    
    init: function () {
      var q = this;
      $(this.nodeSelector, this.selector).each(function() {
        var data = q.processNode(this);
        q.nodes.push(data);
      });


      $(this.filterSetSelector, this.selector).each(function() {
        var data = q.processFilterSet(this);
        q.filterSets[data.name] = data;
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
