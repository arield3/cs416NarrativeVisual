const svg = d3.select('#mainsvg');
const margin = {top: 50, right: 50, bottom: 200, left: 100};
const width = +svg.attr('width');
const height = +svg.attr('height');
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;




// init()
async function init(){
    const data = await d3.csv(
        'data2.csv'
    );
    console.log(data);

    // text
    const subtitle = d3.select('#subtitle').attr('class','textstyle1')



    // graph

    const birthratedata = data.filter(d => (d.SeriesCode==='SP.DYN.CBRT.IN' || d.SeriesCode==='SP.DYN.CDRT.IN') && d.CountryCode==='WLD')
    console.log(birthratedata);
    // const minVal = d3.min(birthratedata, data => data.value);
    // const maxVal = d3.max(birthratedata, data => data.value);

    


    // Axis:
    const chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    const SeriesCodes = Array.from(new Set(birthratedata.map(d => d.SeriesCode)));
    const partitionedData = SeriesCodes.map(code => birthratedata.filter(d => d.SeriesCode === code));
    console.log(partitionedData)

    // const minVal = d3.min(partitionedData);
    // const maxVal = d3.max(partitionedData);

    
    const crossLineX = chartGroup.append('line').attr('class', 'crossLine'), crossLineY = chartGroup.append('line').attr('class', 'crossLine'); 
    d3.selectAll('.crossLine').attr('stroke', 'black');

    // Define scales
    const xScale = d3.scaleLinear()
    .domain(d3.extent(birthratedata, d => d.year))
    .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
    .domain([6,23])
    // .domain([0, d3.max(birthratedata, d => d.value)])
    .range([innerHeight, 0]);

    // Draw x-axis
    chartGroup.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale).ticks(11).tickFormat(d3.format("d")))
    .style("font-size", "20px");

    // Draw y-axis
    chartGroup.append("g")
    .call(d3.axisLeft(yScale))
    .style("font-size", "20px");

    // Define the line generator
    const line = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.value));
    console.log(SeriesCodes)

    // Draw lines for each series
    const seriesGroups = chartGroup.selectAll(".series")
    .data(SeriesCodes)
    .enter()
    .append("g")
    .attr("class", "series");

    seriesGroups.append("path")
    .attr("class", "line")
    .attr("d", d => line(birthratedata.filter(data => data.SeriesCode === d)))
    .attr('fill', 'none')
    .style("stroke", (d, i) => d3.schemeCategory10[i % 10]); // Use different colors for each series

    // seriesGroups.append("path")
    // .attr("class", "line")
    // .attr("d", d => line(d))
    // .attr('fill', 'none')
    // .style("stroke", (d, i) => d3.schemeCategory10[i % 10]);

    // Add labels and title
    chartGroup.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + margin.bottom /2 )
    .style("text-anchor", "middle")
    .style("font-size", "30px")
    .text("Year");

    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -margin.left + 20)
    .style("text-anchor", "middle")
    .style("font-size", "30px")
    .text("Value");

    // chartGroup.append("text")
    // .attr("x", innerWidth / 2)
    // .attr("y", -margin.top+30)
    // .style("class", "textstyle2")
    // .text("Global Birth Rate from 1999 to 2020");
    // let voronoi = d3.Delaunay.from(data.map(d => [x(d.year), y(d.value)]));

    let tooltip = d3.select("#chart-section").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

    // Add circles for each data point
    seriesGroups.selectAll("dataCircles")
    .data(birthratedata)
    .join('circle')
    // .enter().append("circle")
    // .attr("class", "dot")
    .attr("cx", d => xScale(d.year))
    .attr("cy", d => yScale(d.value))
    .attr("r", 9)
    // .style('fill', (d, i) => d3.schemeCategory10[i % 10]);
    .attr('stroke-width', 5).attr('stroke', '#364747').attr('fill', '#364747').attr('opacity', 0.6)
    .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke', '#38eff2');
        // let [x, y] = d3.pointer(event, this);
        let x = xScale(d.year);
        let y = yScale(d.value);
        let svgBound = d3.select("#mainsvg").node().getBoundingClientRect();

        let correspondingData = birthratedata.find(data => data.year === d.year && data.SeriesCode !== d.SeriesCode);
        let difference = Math.abs(d.value - (correspondingData ? correspondingData.value : 0));

        // Show tooltip on mouseover
        tooltip.transition()
            .duration(500)
            .style("opacity", 1);
        let seriesName = d.SeriesCode === 'SP.DYN.CBRT.IN' ? 'Birth Rate' : (d.SeriesCode === 'SP.DYN.CDRT.IN' ? 'Death Rate' : 'Value');
        tooltip.html("Year: " + d.year + "<br/>" + seriesName + ": " + d.value)
            .style("left", (svgBound.right -100) + "px")
            .style("top", (svgBound.top) + "px");
    
        crossLineX.attr('x1', 0).attr('y1', y).attr('x2', x).attr('y2', y); 
        crossLineY.attr('x1', x).attr('y1', y).attr('x2', x).attr('y2', innerHeight);

        // Add the difference text
        chartGroup.append('text')
        .attr('x', x + 10)  // Offset from the line
        .attr('y', innerHeight/2)
        .attr('id', 'differenceText')  // To select and remove it later
        .text("Difference: " + difference.toFixed(2))  // You can format it as needed
        .attr('font-size', '20px')
        .attr('fill', 'red');
        })
    .on('mouseout', function(event,d) {
        // Hide tooltip on mouseout
        d3.select(this).attr('stroke', '#364747');
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
            d3.select('#differenceText').remove();
    });

    // document.addEventListener('mousemove', function(event){
    //     let x = event.clientX, y = event.clientY; 
    //     if(x <= margin.left || x >= width - margin.right || y <= margin.top || y >= height-margin.bottom){return;}
    //     crossLineX.attr('x1', x).attr('y1', y).attr('x2', margin.left).attr('y2', y); 
    //     crossLineY.attr('x1', x).attr('y1', y).attr('x2', x).attr('y2', height-margin.bottom);
    // }, true);



    // Add an annotation for the year 2012
    const annotationData = birthratedata.find(d => d.year === '2012');  
    console.log(annotationData);
    if(annotationData) {
        const annotations = [
            {
                note: {
                    label: `Subsequent to a transient augmentation, the birth rate undergoes a more accelerated decline.`,
                    title: "Year 2012",
                    wrap: 270,
                    color: ["black"]
                },
                x: xScale(annotationData.year),
                y: yScale(annotationData.value),
                dy: -40,
                dx: 40
            }
        ];
        
        const makeAnnotations = d3.annotation()
            .annotations(annotations);

        chartGroup.append("g")
            .call(makeAnnotations);

            d3.selectAll("g.annotation text")
            .style("font-size", '25px');
    }

    // Define legend
    let legend = chartGroup.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${innerWidth - 100}, ${margin.top})`);

    // Define legend items
    let legendItems = legend.selectAll('.legend-item')
    .data(SeriesCodes)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    // Draw legend rectangles
    legendItems.append('rect')
    .attr('width', 10)
    .attr('height', 10)
    .style('fill', (d, i) => d3.schemeCategory10[i % 10]);

    // Add legend texts
    legendItems.append('text')
    .attr('x', 15)
    .attr('y', 10)
    .text(d => d === 'SP.DYN.CBRT.IN' ? 'Birth Rate' : 'Death Rate')
    .style('font-size', '15px')
    .attr('alignment-baseline', 'middle');

    









    


    

}