const svg = d3.select('#mainsvg');
const margin = {top: 50, right: 200, bottom: 200, left: 130};
const width = +svg.attr('width')- margin.left - margin.right;
const height = +svg.attr('height')- margin.top - margin.bottom;
// const innerWidth = width - margin.left - margin.right;
// const innerHeight = height - margin.top - margin.bottom;

const chartGroup = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

// let dataset;

// // load data
// d3.csv('data2.csv').then(data => {
//     data.forEach(d => {
//         d.year = +d.year;
//         d.value = +d.value;
//     });

//     dataset = data;
//     init();
// });



// init()
async function init(){
    const dataset = await d3.csv(
        'data3.csv'
    );
    // console.log(data);

    // graph

    const seriesCodes = Array.from(new Set(dataset.map(d => d.SeriesCode)));
    const countries =  Array.from(new Set(dataset.map(d => d.CountryCode)));






    // const birthratedata = data.filter(d => (d.SeriesCode==='SP.DYN.CBRT.IN' || d.SeriesCode==='SP.DYN.CDRT.IN') && d.CountryCode==='WLD')
    // console.log(birthratedata);
    // const chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    // const SeriesCodes = Array.from(new Set(birthratedata.map(d => d.SeriesCode)));
    // const partitionedData = SeriesCodes.map(code => birthratedata.filter(d => d.SeriesCode === code));
    // console.log(partitionedData)

    // Define the scales
    const xScale = d3.scaleLinear().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);
    const rScale = d3.scaleLinear().range([3, 15]);
    const colorScale = d3.scaleOrdinal().domain(countries).range(d3.schemeCategory10);


    // Define the selectors
    const xSelect = d3.select('#xSelect').on('change', updateChart);
    const ySelect = d3.select('#ySelect').on('change', updateChart);
    const countrySelect = d3.select('#countrySelect').on('change', updateChart);

    // const xSelect = d3.select('#xSelect');
    // xSelect.selectAll('option')
    //     .data(seriesCodes)
    //     .enter()
    //     .append('option')
    //     .text(d => d);
    // xSelect.property('value', 'SP.DYN.CDRT.IN');

    // const ySelect = d3.select('#ySelect');
    // ySelect.selectAll('option')
    //     .data(seriesCodes)
    //     .enter()
    //     .append('option')
    //     .text(d => d);
    // ySelect.property('value', 'SP.DYN.CBRT.IN');

    // const countrySelect = d3.select('#countrySelect');
    // countrySelect.selectAll('option')
    //     .data(countries)
    //     .enter()
    //     .append('option')
    //     .text(d => d);
    // countrySelect.property('value', 'WLD');

    // updateChart();

    xSelect.selectAll('option').data(seriesCodes).enter().append('option').text(d => d);
    ySelect.selectAll('option').data(seriesCodes).enter().append('option').text(d => d);
    countrySelect.selectAll('option').data(countries).enter().append('option').text(d => d);

    // xSelect.property('value', 'SP.DYN.CDRT.IN');
    // ySelect.property('value', 'SP.DYN.CBRT.IN');
    // countrySelect.property('value', 'WLD');

    // Define the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // x
    chartGroup.append('g')
    .attr('transform', `translate(0,${height})`)
    .attr('id', 'xAxis')
    .call(d3.axisBottom(xScale).ticks(11).tickFormat(d3.format("d")))
    .style("font-size", "18px");

    // y
    chartGroup.append('g')
    .attr('id', 'yAxis')
    .call(d3.axisLeft(yScale).ticks(10).tickFormat(d3.format("d")))
    .style("font-size", "18px");

    // tooltip
    const tooltip = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0.3);


    // update charts
    function updateChart() {
        // Get the selected options
        const xCode = xSelect.property('value');
        const yCode = ySelect.property('value');
        const country = countrySelect.property('value');

        
    
        // Filter data
        const filteredData = dataset.filter(d => d.CountryCode === country);
        const xData = filteredData.filter(d => d.SeriesCode === xCode);
        const yData = filteredData.filter(d => d.SeriesCode === yCode);

        // Update the scales
        xScale.domain(d3.extent(xData, d => d.value));
        yScale.domain(d3.extent(yData, d => d.value));

        // Update the axes
        chartGroup.select('#xAxis').call(xAxis);
        chartGroup.select('#yAxis').call(yAxis);

        const cbrtData = filteredData.filter(d => d.SeriesCode === 'SP.DYN.CBRT.IN' );
        const cdrtData = filteredData.filter(d => d.SeriesCode === 'SP.DYN.CDRT.IN' );

        const points = chartGroup.selectAll('.point').data(xData);

        points.enter().append('circle')
            .attr('class', 'point')
            .attr('r', d => {
                const cbrtPoint = cbrtData.find(p => p.year === d.year);
                const cdrtPoint = cdrtData.find(p => p.year === d.year);
                if(cbrtPoint && cdrtPoint) {
                    return rScale(Math.abs(cbrtPoint.value - cdrtPoint.value));
                } else {
                    return 0;  // Default radius if matching data is not found
                }
            })
            .attr('fill', d => colorScale(d.CountryCode))
            .merge(points)
            .attr('cx', d => xScale(d.value))
            .attr('cy', d => yScale(yData.find(p => p.year === d.year).value))
            .on('mouseover', function(event,d) {
                const yPoint = yData.find(p => p.year === d.year);
                const yValue = yPoint ? yPoint.value : 'N/A';
                tooltip.transition().duration(200).style('opacity', 0.9);
                tooltip.html(`Year: ${d.year}<br/>${xData.find(p => p.SeriesCode === xCode).SeriesName}: ${d.value}<br/>${yData.find(p => p.SeriesCode === yCode).SeriesName}: ${yData.find(p => p.year === d.year).value}`)
                    .style("left", 15 + "em")
                    .style("top", 26 + "em");
            })
            .on('mouseout', function(event,d) { tooltip.transition().duration(500).style('opacity', 0); });

        // const points = chartGroup.selectAll('.point').data(xData);

        // points.enter().append('circle')
        //         .attr('class', 'point')
        //         .attr('r', d => rScale(Math.abs(d.value - yData.find(p => p.year === d.year).value)))
        //         .merge(points)
        //         .attr('cx', d => xScale(d.value))
        //         .attr('cy', d => yScale(yData.find(p => p.year === d.year).value))
        //         .attr('stroke-width', 2).attr('stroke', '#364747').attr('fill', '#364747').attr('opacity', 0.6)
        //         .on('mouseover', function(d) {
        //             tooltip.transition().duration(200).style('opacity', 0.9);
        //             const yPoint = yData.find(p => p.year === d.year);
        //             const yValue = yPoint ? yPoint.value : 'N/A';
        //             tooltip.html(`X: ${d.value}<br/>Y: ${yValue}`)
        //             .style("left", 15 + "em")
        //             .style("top", 26 + "em");
        //                 // .style('left', `${d3.event.pageX}px`).style('top', `${d3.event.pageY - 28}px`);
        //         })
        //         .on('mouseout', function() { tooltip.transition().duration(500).style('opacity', 0); });
        // console("d.value",d.value)    
        // console("d",d)  
        // console("yValue",yValue)    
        // console("yPoint",yPoint)  
        
        points.exit().remove();
    



    }




    updateChart();




    // // Define the line generator
    // const line = d3.line()
    // .x(d => xScale(d.year))
    // .y(d => yScale(d.value));
    // console.log(SeriesCodes)

    // // Draw lines for each series
    // const seriesGroups = chartGroup.selectAll(".series")
    // .data(SeriesCodes)
    // .enter()
    // .append("g")
    // .attr("class", "series");

    // seriesGroups.append("path")
    // .attr("class", "line")
    // .attr("d", d => line(birthratedata.filter(data => data.SeriesCode === d)))
    // .attr('fill', 'none')
    // .style("stroke", (d, i) => d3.schemeCategory10[i % 10])
    // .style("stroke-width","3"); // Use different colors for each series


    // // Add labels and title
    // chartGroup.append("text")
    // .attr("x", innerWidth / 2)
    // .attr("y", innerHeight + margin.bottom /2 )
    // .style("text-anchor", "middle")
    // .style("font-size", "22px")
    // .style("font-weight", "bold")
    // .text("Year");

    // chartGroup.append("text")
    // .attr("transform", "rotate(-90)")
    // .attr("x", -innerHeight / 2)
    // .attr("y", -margin.left + 80)
    // .style("text-anchor", "middle")
    // .style("font-size", "22px")
    // .style("font-weight", "bold")
    // .text("Rate");




    









    


    

}