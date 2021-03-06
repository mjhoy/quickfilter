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

  equal("color", $('#c-1').data('qf-filterSet'));
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

module("events");

test("filter event", function () {
  var triggered = [];
  var qf = $('#container').qf().on('qf-filter', function() {
    triggered.push("t");
  }).data('qf');

  deepEqual(triggered, []);

  qf.toggleFilter($('#c-2'));

  deepEqual(triggered, ["t"]);
});

module("filter set/unset");

test("filters are set and unset", function () {
  var qf = QF.create({
    selector: "#container"
  });
  var c1 = $('#c-1');
  var c2 = $('#c-2');

  ok(!c2.hasClass('active'));
  ok(!c1.hasClass('active'));
  qf.toggleFilter($('#c-2'));
  ok(c2.hasClass('active'));
  ok(!c1.hasClass('active'));
});

test("filters are disabled", function () {
  var qf = QF.create({
    selector: "#container"
  });
  var c1 = $('#c-1');
  var c2 = $('#c-2');
  var c3 = $('#c-3');

  ok(!c1.hasClass('disabled'));
  ok(!c2.hasClass('disabled'));
  ok(!c3.hasClass('disabled'));

  qf.toggleFilter($('#c-1'));

  ok(!c1.hasClass('disabled'));
  ok(!c2.hasClass('disabled'));
  ok(c3.hasClass('disabled'));
});

test("empty filer sets are hidden", function () {
  var qf = QF.create({
    selector: "#container"
  });
  ok(!$('#drink-choice').hasClass('disabled'));

  qf.toggleFilter($('#c-1'));

  ok($('#drink-choice').hasClass('disabled'));
  ok(!$('#gender').hasClass('disabled'));
  ok(!$('#color').hasClass('disabled'));
});

module("exclusive filter sets");

test("exclusive filter sets disable non-active filters", function () {
  var qf = QF.create({
    selector: "#container",
    exclusiveFilterSets: [ 'color' ]
  });
  var c1 = $('#c-1');
  var c2 = $('#c-2');
  var c3 = $('#c-3');

  ok(!c1.hasClass('disabled'));
  ok(!c2.hasClass('disabled'));
  ok(!c3.hasClass('disabled'));

  qf.toggleFilter($('#c-1'));

  ok(!c1.hasClass('disabled'));
  ok(c2.hasClass('disabled'));
  ok(c3.hasClass('disabled'));

  qf.toggleFilter($('#c-1'));

  ok(!c1.hasClass('disabled'));
  ok(!c2.hasClass('disabled'));
  ok(!c3.hasClass('disabled'));

});

module("reset");

test("reset resets all filters", function () {
  var qf = QF.create({
    selector: "#container"
  });
  var c1 = $('#c-1');
  var c2 = $('#c-2');
  var c3 = $('#c-3');

  qf.toggleFilter($('#c-1'));
  qf.toggleFilter($('#c-2'));

  qf.reset();

  ok(!c1.hasClass('disabled'));
  ok(!c2.hasClass('disabled'));
  ok(!c3.hasClass('disabled'));

  ok(qf.activeNodes.is(qf.nodes));
});
