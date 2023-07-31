const svg = d3.select('#mainsvg');
const margin = {top: 50, right: 200, bottom: 200, left: 130};
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
    // const subtitle = d3.select('#subtitle').attr('class','textstyle1')



    // graph

    const birthratedata = data.filter(d => d.SeriesCode==='SP.DYN.CBRT.IN' && d.CountryCode==='WLD')
    console.log(birthratedata);

    // Axis:
    const chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    const seriesNames = Array.from(new Set(birthratedata.map(d => d.SeriesName)));

    
    const crossLineX = chartGroup.append('line').attr('class', 'crossLine'), crossLineY = chartGroup.append('line').attr('class', 'crossLine'); 
    d3.selectAll('.crossLine').attr('stroke', '#959998');

    // Define scales
    const xScale = d3.scaleLinear()
    .domain(d3.extent(birthratedata, d => d.year))
    .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
    .domain([d3.min(birthratedata, d => d.value), d3.max(birthratedata, d => d.value)])
    // .domain([0, d3.max(birthratedata, d => d.value)])
    .range([innerHeight, 0]);

    // Draw x-axis
    chartGroup.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale).ticks(11).tickFormat(d3.format("d")))
    .style("font-size", "18px");

    // Draw y-axis
    chartGroup.append("g")
    .call(d3.axisLeft(yScale).ticks(10).tickFormat(d3.format("d")))
    .style("font-size", "18px");

    // Define the line generator
    const line = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.value));

    // Draw lines for each series
    const seriesGroups = chartGroup.selectAll(".series")
    .data(seriesNames)
    .enter()
    .append("g")
    .attr("class", "series");

    seriesGroups.append("path")
    .attr("class", "line")
    .attr("d", d => line(birthratedata.filter(data => data.SeriesName === d)))
    .attr('fill', 'none')
    .style("stroke", (d, i) => d3.schemeCategory10[i % 10])
    .style("stroke-width","3"); // Use different colors for each series

    // Add labels and title
    chartGroup.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + margin.bottom /2 )
    .style("text-anchor", "middle")
    .style("font-size", "22px")
    .style("font-weight", "bold")
    .text("Year");

    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -margin.left + 80)
    .style("text-anchor", "middle")
    .style("font-size", "22px")
    .style("font-weight", "bold")
    .text("Birth Rate");

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
    .attr('stroke-width', 2).attr('stroke', '#364747').attr('fill', '#364747').attr('opacity', 0.6)
    .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke', '#38eff2');
        // let [x, y] = d3.pointer(event, this);
        let x = xScale(d.year);
        let y = yScale(d.value);
        let svgBound = d3.select("#mainsvg").node().getBoundingClientRect();
        // Show tooltip on mouseover
        tooltip.transition()
            .duration(500)
            .style("opacity", 1);
        tooltip.html("Year: " + d.year + "<br/>" + "Birth Rate: " + d.value)
            .style("left", 15 + "em")
            .style("top", 25 + "em");

        crossLineX.attr('x1', 0).attr('y1', y).attr('x2', x).attr('y2', y); 
        crossLineY.attr('x1', x).attr('y1', y).attr('x2', x).attr('y2', innerHeight);
    })
    .on('mouseout', function(event,d) {
        // Hide tooltip on mouseout
        d3.select(this).attr('stroke', '#364747');
        tooltip.transition()
            .duration(500)
            .style("opacity", 0.3);
    });

    // document.addEventListener('mousemove', function(event){
    //     let x = event.clientX, y = event.clientY; 
    //     if(x <= margin.left || x >= width - margin.right || y <= margin.top || y >= height-margin.bottom){return;}
    //     crossLineX.attr('x1', x).attr('y1', y).attr('x2', margin.left).attr('y2', y); 
    //     crossLineY.attr('x1', x).attr('y1', y).attr('x2', x).attr('y2', height-margin.bottom);
    // }, true);



    // Add an annotation for the year 2012
    const annotationData = birthratedata.find(d => d.year === '2012');  
    // console.log(annotationData);
    if(annotationData) {
        const annotations = [
            {
                note: {
                    label: `After a transient augmentation, the birth rate underwent a more accelerated decline.`,
                    title: "Year 2012",
                    wrap: 270,
                    color: ["red"]
                },
                x: xScale(annotationData.year),
                y: yScale(annotationData.value),
                dy: -60,
                dx: 40
            }
        ];
        
        const makeAnnotations = d3.annotation()
            .annotations(annotations);

        chartGroup.append("g")
        .attr("id","annotation0")
            .call(makeAnnotations);

            d3.select("#annotation0 g.annotation text")
            .style("font-size", '22px').style("fill","red");
    }

    









    


    

}