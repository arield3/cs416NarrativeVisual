const svg = d3.select('#mainsvg');
const margin = {top: 50, right: 200, bottom: 200, left: 130};
const width = +svg.attr('width')- margin.left - margin.right;
const height = +svg.attr('height')- margin.top - margin.bottom;
const chartGroup = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

let tmpval = 1;

// function compare(a, b) {
//     if (a.value < b.value) {
//       return -1;
//     }
//     if (a.value > b.value) {
//       return 1;
//     }
//     return 0;
//   }
let temprad=0;

async function init(){
    const dataset = await d3.csv(
        'data3.csv'
    );

    const seriesCodes = Array.from(new Set(dataset.map(d => d.SeriesCode)));
    const countries =  Array.from(new Set(dataset.map(d => d.CountryCode)));
    const tmpData = dataset.filter(d => d.CountryCode === 'WLD');
    const tmpData2 = dataset.filter(d => d.SeriesCode === 'SP.DYN.CBRT.IN');


    // Define the scales
    const xScale = d3.scaleLinear().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);
    const rScale = d3.scaleLinear().range([3, 15]);
    const colorScale = d3.scaleOrdinal().domain(countries).range(d3.schemeCategory10);

    // Define the selectors
    const xSelect = d3.select('#xSelect').on('change', updateChart);
    const ySelect = d3.select('#ySelect').on('change', updateChart);
    const countrySelect = d3.select('#countrySelect').on('change', updateChart);

    xSelect.selectAll('option').data(seriesCodes).enter().append('option').text(d => tmpData.find(p => p.SeriesCode === d).SeriesName);
    ySelect.selectAll('option').data(seriesCodes).enter().append('option').text(d => tmpData.find(p => p.SeriesCode === d).SeriesName);
    countrySelect.selectAll('option').data(countries).enter().append('option').text(d => tmpData2.find(p => p.CountryCode === d).CountryName);

    // Define the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // // x
    // chartGroup.append('g')
    // .attr('transform', `translate(0, ${height})`)
    // .attr('id', 'xAxis')
    // .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.format("d")))
    // .style("font-size", "18px");

    // // y
    // chartGroup.append('g')
    // .attr('id', 'yAxis')
    // .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format("d")))
    // .style("font-size", "18px");

    // Draw x-axis
    chartGroup.append("g")
    .attr('id', 'xAxis')
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.format("d")))
    .style("font-size", "18px");

    // Draw y-axis
    chartGroup.append("g")
    .attr('id', 'yAxis')
    .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format("d")))
    .style("font-size", "18px");

    

    // tooltip
    const tooltip = d3.select('#chart-section').append('div').attr('class', 'tooltip').style('opacity', 0);

    // update charts
    function updateChart() {
        // Get the selected options
        
        
        let xCode = tmpData.find(p => p.SeriesName === xSelect.property('value')).SeriesCode;
        let yCode = tmpData.find(p => p.SeriesName === ySelect.property('value')).SeriesCode;
        let country = tmpData2.find(p => p.CountryName === countrySelect.property('value')).CountryCode;

        // if(tmpval===1){
        //     xCode = "Death rate, crude (per 1,000 people)";
        //     yCode = "Birth rate, crude (per 1,000 people)";
        //     country = "World";
        //     // d3.select('#xSelect').property('value','Death rate, crude (per 1,000 people)')
        //     // d3.select('#ySelect').property('value','Birth rate, crude (per 1,000 people)')
        //     // d3.select('#countrySelect').property('value','World')
        //     tmpval = tmpval+1;
        // }
        // console.log("tmpval", tmpval)

        // Filter data
        const filteredData = dataset.filter(d => d.CountryCode === country);
        const xData = filteredData.filter(d => d.SeriesCode === xCode).sort((a, b) => a.value - b.value);;
        const yData = filteredData.filter(d => d.SeriesCode === yCode).sort((a, b) => a.value - b.value);;

        // Update the scales
        xScale.domain(d3.extent(xData, d => Math.abs(d.value) ));
        yScale.domain(d3.extent(yData, d => Math.abs(d.value)));

        // d3.select("#chartGroup").selectAll("text").remove();
        d3.select("#x").remove();
        d3.select("#y").remove();
        // Add labels and title
        chartGroup.append("text")
        .attr("id","x")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom /2 )
        .style("text-anchor", "middle")
        .style("font-size", "22px")
        .style("font-weight", "bold")
        .text(`${xData.find(p => p.SeriesCode === xCode).SeriesName}`);

        chartGroup.append("text")
        .attr("id","y")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 70)
        .style("text-anchor", "middle")
        .style("font-size", "22px")
        .style("font-weight", "bold")
        .text(`${yData.find(p => p.SeriesCode === yCode).SeriesName}`);

        // Update the axes
        chartGroup.select('#xAxis').call(xAxis);
        chartGroup.select('#yAxis').call(yAxis);

        const cbrtData = filteredData.filter(d => d.SeriesCode === 'SP.DYN.CBRT.IN' );
        const cdrtData = filteredData.filter(d => d.SeriesCode === 'SP.DYN.CDRT.IN' );

        const points = chartGroup.selectAll('.point').data(xData);


        points.enter().append('circle')
            .attr('class', 'point')
            .attr('r', d => {
                const cbrtPoint = cbrtData.find(p => p.year === d.year && p.CountryCode === d.CountryCode);
                // console.log("cbrtPoint.value", cbrtPoint.value)
                const cdrtPoint = cdrtData.find(p => p.year === d.year && p.CountryCode === d.CountryCode);
                // console.log("cdrtPoint.value", cdrtPoint.value)
                // console.log("cbrtPoint", (cbrtPoint.value - cdrtPoint.value).toFixed(2) )
                if(cbrtPoint && cdrtPoint) {
                    temprad= rScale(Math.abs(cbrtPoint.value - cdrtPoint.value).toFixed(2));
                     return temprad;
                    
                } else {
                    return 0;  // Default radius if matching data is not found
                }
            })
            .attr('fill', d => colorScale(d.CountryCode))
            .merge(points)
            .attr('cx', d => xScale(d.value))
            .attr('cy', d => yScale(yData.find(p => p.year === d.year).value))
            .on('mouseover', function(event,d) {
                let x = xScale(d.value);
                let y = yScale(yData.find(p => p.year === d.year).value);
                let textWidth = tooltip.node().width;
                if (x + textWidth > innerWidth) {
                    x = innerWidth - textWidth - 2;
                }
                let svgBound = d3.select("#mainsvg").node().getBoundingClientRect();

                const yPoint = yData.find(p => p.year === d.year);
                const yValue = yPoint ? yPoint.value : 'N/A';
                tooltip.transition().duration(200).style('opacity', 0.9);
                tooltip.html(`Year: ${d.year}<br/>${xData.find(p => p.SeriesCode === xCode).SeriesName}: ${d.value}<br/>${yData.find(p => p.SeriesCode === yCode).SeriesName}: ${yData.find(p => p.year === d.year).value}<br>Diff (=abs(BR - DR)): ${temprad.toFixed(2)}`)
                    .style("left",  50 + "em")
                    .style("top",  26 + "em");
            })
            .on('mouseout', function(event,d) { tooltip.transition().duration(500).style('opacity', 0); });
        points.exit().remove();
    }
    updateChart();
}