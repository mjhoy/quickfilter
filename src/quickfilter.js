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
      if(selector)
        this.selector = selector;
      this.init();
    }
  };

  QF.prototype = {
    // Selector that will scope all DOM queries.
    selector: undefined,

    // Selector for `node` elements
    nodeSelector: '.node',

    // Selector for `filterSet` elements
    filterSetSelector: '.filter-set',

    // Data attribute on filterSet elements that provide a unique ID
    // string
    filterSetId: 'filter-set-id',

    // Selector for `filter` elements
    filterSelector: '.filter',

    // Data attribute on filter elements that provide a unique ID
    // string
    filterId: 'filter-id',

    // Enable persistance via location hash
    persist: false,

    // Array of "exclusive" filter sets (string IDs)
    //
    // An exclusive filter set automatically disables all non-active
    // filters when the user picks a filter
    exclusiveFilterSets: [],

    // a map of filter IDs -> hash IDs, and back
    //
    // structure:
    //
    // {
    //   [filterSetName]: {
    //     hashes: { [hashId]: [filterId] },
    //     ids:    { [filterId]: [hashId] },
    //   },
    // }
    hashIDmap: false,

    disableNode: function (node) {
      node.addClass('disabled');
    },

    activateNode: function (node) {
      node.removeClass('disabled');
    },


    // Filters can have three states. Available but unset, available
    // and set, and unavailable. Filters are unavailable if no
    // currently active nodes are tagged by them (meaning enabling the
    // filter would reduce the active node set to nothing).
    setFilter: function (filter) {
      filter.addClass('active');
    },

    unsetFilter: function (filter) {
      filter.removeClass('active');
    },

    // Internal functions
    _disableNode: function (node) {
      this.activeNodes = this.activeNodes.not(node);
      this.disabledNodes = this.disabledNodes.add(node);
      this.disableNode(node);
    },

    _activateNode: function (node) {
      this.activeNodes = this.activeNodes.add(node);
      this.disabledNodes = this.disabledNodes.not(node);
      this.activateNode(node);
    },

    processNode: function (node) {
      node = $(node);
      // Initialize all filtersets on this node
      _.each(this.filterSets, function(__, key) {
        var list = [];

        if (node.data(key))
          list = _.map((node.data(key)+'').split(','), function (s) {
            return $.trim(s);
          });

        node.data('qf-fs-'+key, list);
      });
    },

    processFilterSet: function (filterSet) {
      filterSet = $(filterSet);
      var name = filterSet.data('filter-set-id');
      this.currentFilters[name] = [];

      var q = this;

      var filters = $(this.filterSelector, filterSet).each(function (filter) {
        $(this).data('qf-filterSet', name);
        // TODO: older jquerys may have different behavior in
        // extracting numeric strings as data attributes (so
        // explicitly convert to string), make a test for this later
        $(this).data('qf-filterId', $(this).data(q.filterId)+'');
      });

      filterSet.on('click', this.filterSelector, function() {
        q.toggleFilter($(this));
        return false;
      });

      this.filterSets[name] = {
        name: name,
        el: filterSet,
        filters: filters
      };
    },

    scoped: function (selector) {
      return $(selector, this.selector);
    },

    init: function () {
      var q = this;

      // Process filter sets
      this.scoped(this.filterSetSelector).each(function () {
        q.processFilterSet(this);
      });

      var nodes = this.scoped(this.nodeSelector).each(function() {
        q.processNode(this);
        q.activateNode($(this));
      });

      this.nodes = nodes;
      this.activeNodes = nodes;
      this.disabledNodes = $();
    },

    // reset all filters
    reset: function () {
      var f;
      for (var key in this.currentFilters) {
        f = this.currentFilters[key];
        for (var i = 0; i < f.length; i++) {
          this.toggleFilter(
            this.scoped('[data-filter-set-id="'+key+'"] [data-filter-id="'+f[i]+'"]')
          );
        }
      }
    },

    trigger: function (name, args) {
      return $(this.selector).trigger(name, args);
    },

    // Set filter element `ln` as active
    toggleFilter: function (ln) {
      var filterSet = ln.data('qf-filterSet');
      var filterId =  ln.data('qf-filterId');
      var currentSet = this.currentFilters[filterSet];
      var restrict;
      if (_.indexOf(currentSet, filterId) === -1) {
        // Filter not active, turn it on
        currentSet.push(filterId);
        this.setFilter(ln);
        restrict = "active";
      } else {
        // Filter active, turn it off
        this.currentFilters[filterSet] = _.without(currentSet, filterId);
        this.unsetFilter(ln);
        restrict = "disabled";
      }
      this.trigger('qf-filter-toggled', [ ln ]);
      this.filter(restrict);
    },

    // Run the current filter list
    //
    // `restrict` is optional and purely for optimization. If it falsey,
    // check over the entire node collection. If it is "active", check only
    // active nodes. If it is "disabled", check only the disabled nodes.
    filter: function (restrict) {
      var q = this;
      var set;
      switch(restrict) {
      case "active":
        set = this.activeNodes;
        break;
      case "disabled":
        set = this.disabledNodes;
        break;
      default:
        set = this.nodes;
      }
      set.each(function () {
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
        if (!included) {
          q._disableNode(node);
        } else {
          q._activateNode(node);
        }
      });
      this.checkFilters();
      if (this.persist)
        this.updateHash();
      this.trigger('qf-filter');
    },

    checkFilters: function () {
      var q = this;
      var filtersToEnable = {};
      var fset, _key;
      for (var key in q.filterSets) {
        fset = q.filterSets[key];
        filtersToEnable[key] = $();
        fset.filters.addClass('disabled');
      }
      var nodeFilters;
      var filterFn = function () {
        return _.contains(nodeFilters, $(this).data('qf-filterId'));
      };
      var exclusiveFilterFn = function () {
        return _.contains(q.currentFilters[_key], $(this).data('qf-filterId'));
      };
      this.activeNodes.each(function () {
        var node = $(this);
        var key, set;
        var _af;
        for (key in q.filterSets) {
          set = q.filterSets[key];
          _key = key;
          if (_.contains(q.exclusiveFilterSets, key) &&
             q.currentFilters[key].length > 0) {
            // Only enable the filter if it is active
            _af = set.filters.filter(exclusiveFilterFn);
            filtersToEnable[key] = filtersToEnable[key].add(_af);
          } else {
            nodeFilters = node.data('qf-fs-'+key);
            _af = set.filters.filter(filterFn);
            filtersToEnable[key] = filtersToEnable[key].add(_af);
          }
        }
      });
      for (key in filtersToEnable) {
        filtersToEnable[key].removeClass('disabled');
        if (filtersToEnable[key].length === 0) {
          this.filterSets[key].el.addClass('disabled');
        } else {
          this.filterSets[key].el.removeClass('disabled');
        }
      }
    },

    updateHash: function () {
      var fs, cfs, str, _key;
      var r = []; // the array to build up for the hash
      var q = this;
      var hashMapFn = function (id) {
        return q.hashIDmap[key].ids[id];
      };
      for (var key in this.filterSets) {
        _key = key;
        fs = this.filterSets[key];
        cfs = this.currentFilters[key];
        if (cfs.length > 0) {
          if(this.hashIDmap && this.hashIDmap[key])
            cfs = _.map(cfs, hashMapFn);
          r.push(key+"="+cfs.join(","));
        }
      }
      if(r.length > 0) {
        window.location.hash = r.join("&");
      } else {
        window.location.hash = "r";
      }
    },

    checkHash: function() {
      var _key;
      var h = window.location.hash.split("&");
      var q = this;
      var activateFn = function(s) {
        var id = s;
        if(q.hashIDmap && q.hashIDmap[_key]) {
          id = q.hashIDmap[_key].hashes[s];
        }
        if(id) {
          q.toggleFilter(q.scoped('[data-filter-set-id="'+_key+'"] [data-filter-id="'+id+'"]'));
        }
      };
      if(h.length > 0) {
        h[0] = h[0].slice(1);
        _.each(h, function(s) {
          for (var key in q.filterSets) {
            _key = key;
            if (s.indexOf(key+'=') === 0) {
              _.each(s.slice(key.length + 1).split(','), activateFn);
            }
          }
        });
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

  // jQuery extension
  //
  // $(selector).qf({ option1: value ... });
  $.fn.qf = function (options) {
    options = options || {};
    return this.each(function () {
      var optionsWithSelector = _.clone(options);
      optionsWithSelector.selector = this;
      var qf = QF.create(optionsWithSelector);
      $(this).data('qf', qf);
    });
  };

  QF.version = version;
  QF.old_qf = _old_qf;

  root.QF = QF;

})(jQuery, this);
