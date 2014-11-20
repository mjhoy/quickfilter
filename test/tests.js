module("sanity");

// noop
function xtest() {}

test("preserves old root QF object", function () {
  equal(QF.old_qf, "old qf");
});

module("nodes");

test("finds nodes and stores elements", function() {
  var qf = QF.create({
    selector: "#container",
  });

  var node_headings = [];
  for(var i = 0; i < qf.nodes.length; i++) {
    var node = $(qf.nodes[i]);
    node_headings.push($(node).find('h2').text());
  }
  deepEqual(node_headings, ["Node A", "Node B"]);
});

module("filters");

test("finds filters, filter sets", function() {
  var qf = QF.create({
    selector: "#container",
  });

  var keys = [];
  var key;
  for(key in qf.filterSets)
    keys.push(key);
  deepEqual(keys, ["color", "gender"]);
});

test("sets filter set data on nodes", function() {
  var qf = QF.create({selector: "#container"});

  deepEqual([ "g-1" ], $('#node-1').data('qf-fs-gender'));
});

test("sets empty filter sets if nodes have none", function() {
  var qf = QF.create({selector: "#container"});

  deepEqual([], $('#node-2').data('qf-fs-gender'));
});

test("sets multiple filter set data correctly", function () {
  var qf = QF.create({selector: "#container"});

  deepEqual([ "c-1", "c-2" ], $('#node-1').data('qf-fs-color'));
});

test("sets current filter arrays", function () {
  var qf = QF.create({selector: "#container"});
  deepEqual([], qf.currentFilters.color);
  deepEqual([], qf.currentFilters.gender);
});

test("sets filter set for each filter", function () {
  var qf = QF.create({selector: "#container"});

  equal("color", $('#c-1').data('qs-filterSet'));
});

test("setting a filter", function () {
  var qf = QF.create({selector: "#container"});
  qf.activate($("#c-1"));
  deepEqual(["c-1"], qf.currentFilters.color);
});

test("toggling a filter", function () {
  var qf = QF.create({selector: "#container"});
  qf.activate($("#c-1"));
  qf.activate($("#c-1"));

  deepEqual([], qf.currentFilters.color);
});

test("deactivated projects", function () {
  var deactivated = [];
  var qf = QF.create({
    selector: "#container",
    deactivateNode: function (node) {
      deactivated.push(node.attr('id'));
    }
  });

  deepEqual([], deactivated);
  qf.activate($("#c-1"));
  deepEqual(["node-2"], deactivated);

});
