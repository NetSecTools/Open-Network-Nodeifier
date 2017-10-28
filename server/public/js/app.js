var Graph = {
    template: `
    <div align='center' id="d3_selectable_force_directed_graph" style="width: 960px; height: 500px; margin: auto; margin-bottom: 12px">
    <svg></svg>
    </div>`
}

new Vue({
    el: '#app',
    components: {
        // <graph> will only be available in parent's template
        'graph': Graph
    }
})