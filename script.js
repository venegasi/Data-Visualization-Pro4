// URLs de los datos
const educationUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const countyUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

// Dimensiones del SVG
const width = 960;
const height = 600;

// Colores para el mapa
const colors = d3.scaleThreshold()
    .domain([10, 20, 30, 40, 50])
    .range(d3.schemeBlues[5]);

// Crear SVG
const svg = d3.select('#choropleth')
    .attr('width', width)
    .attr('height', height);

// Crear tooltip
const tooltip = d3.select('#tooltip')
    .style('opacity', 0);

// Cargar datos y dibujar el mapa
d3.json(countyUrl).then(countyData => {
    d3.json(educationUrl).then(educationData => {
        // Crear mapa de educación por fips
        const educationMap = {};
        educationData.forEach(d => educationMap[d.fips] = d);

        // Crear paths para los condados
        svg.append('g')
            .selectAll('path')
            .data(topojson.feature(countyData, countyData.objects.counties).features)
            .enter().append('path')
            .attr('class', 'county')
            .attr('d', d3.geoPath())
            .attr('fill', d => {
                const education = educationMap[d.id];
                return colors(education ? education.bachelorsOrHigher : 0);
            })
            .attr('data-fips', d => d.id)
            .attr('data-education', d => {
                const education = educationMap[d.id];
                return education ? education.bachelorsOrHigher : 0;
            })
            .on('mouseover', (event, d) => {
                const education = educationMap[d.id];
                tooltip.transition().duration(200).style('opacity', 0.9);
                tooltip.html(education.area_name + ', ' + education.state + ': ' + education.bachelorsOrHigher + '%')
                    .attr('data-education', education.bachelorsOrHigher)
                    .style('left', (event.pageX + 5) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', () => tooltip.transition().duration(500).style('opacity', 0));

        // Agregar leyenda
        const legend = svg.append('g')
            .attr('id', 'legend')
            .attr('transform', 'translate(600,20)');

        const legendWidth = 300;
        const legendHeight = 20;

        const legendX = d3.scaleLinear()
            .domain([10, 50])
            .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendX)
            .tickSize(legendHeight)
            .tickValues(colors.domain());

        legend.selectAll('rect')
            .data(colors.range().map(color => {
                const d = colors.invertExtent(color);
                return [d[0], d[1]];
            }))
            .enter().append('rect')
            .attr('height', legendHeight)
            .attr('x', d => legendX(d[0]))
            .attr('width', d => legendX(d[1]) - legendX(d[0]))
            .attr('fill', d => colors(d[0]));

        legend.append('g')
            .call(legendAxis)
            .select('.domain').remove();
    });
});
