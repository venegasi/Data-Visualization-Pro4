// Configuración inicial
const width = 1000;
const height = 500;
const padding = 60;

const svg = d3.select("#chart")
    .attr("width", width)
    .attr("height", height);

const tooltip = d3.select("#tooltip");

// Cargar datos
d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
    .then(data => {
        const baseTemp = data.baseTemperature;
        const dataset = data.monthlyVariance;

        // Escalas
        const xScale = d3.scaleBand()
            .domain(dataset.map(d => d.year))
            .range([padding, width - padding]);

        const yScale = d3.scaleBand()
            .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
            .range([height - padding, padding]);

        const colorScale = d3.scaleQuantile()
            .domain(d3.extent(dataset, d => baseTemp + d.variance))
            .range(["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"]);

        // Ejes
        const xAxis = d3.axisBottom(xScale)
            .tickValues(xScale.domain().filter(year => year % 10 === 0));

        const yAxis = d3.axisLeft(yScale)
            .tickFormat(month => {
                const date = new Date();
                date.setMonth(month - 1);
                return d3.timeFormat("%B")(date);
            });

        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", `translate(0, ${height - padding})`)
            .call(xAxis);

        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", `translate(${padding}, 0)`)
            .call(yAxis);

        // Celdas
        svg.selectAll(".cell")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("class", "cell")
            .attr("data-month", d => d.month - 1)
            .attr("data-year", d => d.year)
            .attr("data-temp", d => baseTemp + d.variance)
            .attr("x", d => xScale(d.year))
            .attr("y", d => yScale(d.month))
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScale(baseTemp + d.variance))
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible")
                    .attr("data-year", d.year)
                    .html(`Year: ${d.year}<br>Month: ${d3.timeFormat("%B")(new Date(0, d.month - 1))}<br>Temp: ${(baseTemp + d.variance).toFixed(2)}℃`);
            })
            .on("mousemove", (event) => {
                tooltip.style("top", (event.pageY - 50) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", () => tooltip.style("visibility", "hidden"));

        // Leyenda
        const legend = d3.select("#legend");
        const legendWidth = 300;
        const legendHeight = 20;

        const legendScale = d3.scaleLinear()
            .domain(d3.extent(dataset, d => baseTemp + d.variance))
            .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
            .tickValues(colorScale.quantiles())
            .tickFormat(d3.format(".1f"));

        legend.selectAll("rect")
            .data(colorScale.range().map(color => {
                const d = colorScale.invertExtent(color);
                if (!d[0]) d[0] = legendScale.domain()[0];
                if (!d[1]) d[1] = legendScale.domain()[1];
                return d;
            }))
            .enter()
            .append("rect")
            .attr("height", legendHeight)
            .attr("x", d => legendScale(d[0]))
            .attr("width", d => legendScale(d[1]) - legendScale(d[0]))
            .attr("fill", d => colorScale(d[0]));

        legend.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(legendAxis);
    });
