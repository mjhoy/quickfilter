module("sanity");

// noop
function xtest() {}

test("preserves old root QF object", function () {
  equal(QF.old_qf, "old qf");
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

  ok(_.contains(keys, "color"));
  ok(_.contains(keys, "gender"));
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
  qf.toggleFilter($("#c-1"));
  deepEqual(["c-1"], qf.currentFilters.color);
});

test("toggling a filter", function () {
  var qf = QF.create({selector: "#container"});
  qf.toggleFilter($("#c-1"));
  qf.toggleFilter($("#c-1"));

  deepEqual([], qf.currentFilters.color);
});

test("disableNode: called on disable", function () {
  var disabled = [];
  var qf = QF.create({
    selector: "#container",
    disableNode: function (node) {
      disabled.push(node.attr('id'));
    }
  });

  deepEqual([], disabled);
  qf.toggleFilter($("#c-1"));
  ok(_.contains(disabled, "node-2"));
  ok(!_.contains(disabled, "node-1"));
});


test("activateNode: all enabled by default", function () {
  var activated = [];
  var qf = QF.create({
    selector: "#container",
    activateNode: function (node) {
      activated.push(node.attr('id'));
    }
  });

  ok(_.contains(activated, "node-1"));
  ok(_.contains(activated, "node-2"));
  ok(qf.nodes.is(qf.activeNodes));
});

test("activeNodes after filter", function () {
  var qf = QF.create({
    selector: "#container"
  });
  
  qf.toggleFilter($("#c-1"));
  ok(qf.activeNodes.is($("#node-1")));
  ok(!qf.activeNodes.is($("#node-2")));     
});

test("activeNodes after toggling filter", function () {
  var qf = QF.create({
    selector: "#container"
  });
  
  qf.toggleFilter($("#c-1"));
  qf.toggleFilter($("#c-1"));
  
  ok(qf.activeNodes.is($("#node-1")));
  ok(qf.activeNodes.is($("#node-2")));     
});

test("activeNodes after multiple filters", function () {
  var qf = QF.create({
    selector: "#container"
  });

  ok(qf.activeNodes.is('#node-1'));
  ok(qf.activeNodes.is('#node-2'));
  ok(qf.activeNodes.is('#node-3'));

  qf.toggleFilter($('#c-2'));
  ok(!qf.activeNodes.is('#node-3'));
  ok(qf.activeNodes.is('#node-1'));
  ok(qf.activeNodes.is('#node-2'));
});

module("jquery extension");

test("jquery extensions works properly", function () {
  var active = [];

  var qf = $('#container').qf({
    activateNode: function (node) {
      active.push(node.attr('id'));
    },
  }).data('qf');

  ok(_.contains(active, "node-1"));
  ok(_.contains(active, "node-2"));
});
