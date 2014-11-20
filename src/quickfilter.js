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
    this.currentFilters = {};

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
    filterId: 'filter-id',

    processNode: function (node) {
      node = $(node);
      // Initialize all filtersets on this node
      _.each(this.filterSets, function(__, key) {
        var list = [];

        if (node.data(key))
          list = (node.data(key)+'').split(',');

        node.data('qf-fs-'+key, list);
      });
    },

    processFilterSet: function (filterSet) {
      filterSet = $(filterSet);
      var name = filterSet.data('filter-set-id');
      this.currentFilters[name] = [];

      var q = this;

      $(this.filterSelector, filterSet).each(function (filter) {
        $(this).data('qs-filterSet', name);
        $(this).data('qs-filterId', $(this).data(q.filterId));
      });

      return({
        name: name
      });
    },

    init: function () {
      var q = this;

      $(this.filterSetSelector, this.selector).each(function() {
        var data = q.processFilterSet(this);
        q.filterSets[data.name] = data;
      });

      var nodes = $(this.nodeSelector, this.selector).each(function() {
        q.processNode(this);
      });
      q.nodes = nodes;
    },

    // Set filter element `ln` as active
    activate: function (ln) {
      var filterSet = ln.data('qs-filterSet');
      var filterId =  ln.data('qs-filterId');
      var currentSet = this.currentFilters[filterSet];
      if (_.indexOf(currentSet, filterId) === -1) {
        // Filter not active
        currentSet.push(filterId);
      } else {
        // Filter active
        this.currentFilters[filterSet] = _.without(currentSet, filterId);
      }
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
