var svg = d3.select('#d3_selectable_force_directed_graph');
d3.json('js/sampledata.json', function (error, graph) {
    if (!error) {
        //console.log('graph', graph);
        createV4SelectableForceDirectedGraph(svg, graph);
    } else {
        console.error(error);
    }
});