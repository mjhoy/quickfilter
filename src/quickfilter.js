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

    deactivateNode: function (node) {
      node.addClass('disabled');
    },

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
    toggleFilter: function (ln) {
      var filterSet = ln.data('qs-filterSet');
      var filterId =  ln.data('qs-filterId');
      var currentSet = this.currentFilters[filterSet];
      var restrictOnly = true;
      if (_.indexOf(currentSet, filterId) === -1) {
        // Filter not active
        currentSet.push(filterId);
      } else {
        // Filter active
        restrictOnly = false;
        this.currentFilters[filterSet] = _.without(currentSet, filterId);
      }
      this.filter(restrictOnly);
    },

    // Run the current filter list
    filter: function (restrictOnly) {
      var q = this;
      $(this.nodeSelector, this.selector).each(function () {
        var node = $(this);
        var included = true;
        _.find(q.filterSets, function (__, set) {
          var filters = q.currentFilters[set];
          if (filters.length) {
            var nodeFilters = node.data('qf-fs-'+set);
            if (_.intersection(filters, nodeFilters).length != filters.length) {
              included = false;
              return true;
            }
          }
          return false;
        });
        if (!included)
          q.deactivateNode(node);
      });
    },
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
