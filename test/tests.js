module("sanity");

test("preserves old root QF object", function () {
  equal(QF.old_qf, "old qf");
});

module("nodes");

test("finds nodes and stores elements", function() {
  var qf = QF.create({
    selector: "#container",
    nodeSelector: ".node"
  });

  var node_headings = [];
  for(var i = 0; i < qf.nodes.length; i++) {
    var node = $(qf.nodes[i].element);
    node_headings.push(node.find('h2').text());
  }
  deepEqual(node_headings, ["Node A", "Node B"]);
});

module("filters");

test("finds filters, filter sets", function() {

  var qf = QF.create({
    selector: "#container",
    filterSetSelector: ".filter-set",
    filterSelector: ".filter"
  });

  var keys = [];
  var key;
  for(key in qf.filterSets) {
    keys.push(key);
  }
  deepEqual(keys, ["color", "gender"]);
});
