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
    d3.selectAll('.crossLine').attr('stroke', '#959998');

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
    .style("font-size", "18px");

    // Draw y-axis
    chartGroup.append("g")
    .call(d3.axisLeft(yScale).ticks(10).tickFormat(d3.format("d")))
    .style("font-size", "18px");

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
    .style("stroke", (d, i) => d3.schemeCategory10[i % 10])
    .style("stroke-width","3"); // Use different colors for each series

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
    .text("Rate");

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
    .attr('stroke-width', 2).attr('stroke', '#364747').attr('fill', '#364747').attr('opacity', 0.6)
    .on('mouseover', function(event, d) {
        d3.select('#differenceText').remove();
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
        .style("left", 15 + "em")
        .style("top", 26 + "em");

        let yendpointannotate = y;
    
        crossLineX.attr('x1', 0).attr('y1', y).attr('x2', x).attr('y2', y); 
        if(d.SeriesCode === 'SP.DYN.CDRT.IN'){
            y=yScale(correspondingData.value)
        }
        crossLineY.attr('x1', x).attr('y1', y).attr('x2', x).attr('y2', innerHeight);
        

        // console.log("pos:", (innerWidth/2-x)*0.1)
        // Add the difference text
        let textElement = chartGroup.append('text')
        .attr('x', x)  // Offset from the line
        .attr('y', innerHeight/2+100)
        .attr('id', 'differenceText')  // To select and remove it later
        .text("Difference: " + difference.toFixed(2))  // You can format it as needed
        .attr('font-size', '20px')
        .attr('fill', 'red');

        let textWidth = textElement.node().getBBox().width;
        // console.log("textWidth",textWidth)
        // console.log("x + textWidth",x + textWidth)


        // make sure the text fits within the SVG
        if (x + textWidth > innerWidth) {
            x = innerWidth - textWidth - 2;
        }

        // apply the x position to the text
        textElement.attr('x', x);

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
    // Calculate the year with smallest difference
        let minDifferenceYear = birthratedata[0].year;
        let minDifference = Infinity;
        for(let i = 0; i < birthratedata.length; i++) {
        const birthRateData = birthratedata[i];
        const deathRateData = birthratedata.find(d => d.year === birthRateData.year && d.SeriesCode !== birthRateData.SeriesCode);
        if (deathRateData) {
            let difference = Math.abs(birthRateData.value - deathRateData.value);
            if (difference < minDifference) {
            minDifference = difference;
            minDifferenceYear = birthRateData.year;
            }
        }
        }

        const birthRateData = birthratedata.find(d => d.year === minDifferenceYear && d.SeriesCode === 'SP.DYN.CBRT.IN');
        const deathRateData = birthratedata.find(d => d.year === minDifferenceYear && d.SeriesCode === 'SP.DYN.CDRT.IN');

        chartGroup.append('line')
        .attr('x1', xScale(minDifferenceYear))
        .attr('y1', yScale(birthRateData.value))
        .attr('x2', xScale(minDifferenceYear))
        .attr('y2', yScale(deathRateData.value))
        .attr('stroke', '#CB1810')  
        .attr('stroke-width', 1);

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
                    color: ["black"]
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
            .style("font-size", '22px');
    }

    const annotationData2 = birthratedata.find(d => d.year === minDifferenceYear && d.SeriesCode === 'SP.DYN.CBRT.IN');
    if(annotationData2) {
        const annotations = [
            {
                note: {
                    label: `This year had the smallest difference between birth and death rates.`,
                    title: `Year ${minDifferenceYear}`,
                    wrap: 230
                },
                x: (xScale(minDifferenceYear)),
                // y: yScale.range()[0] / 2 + yScale.range()[1] / 2,
                y: yScale(birthRateData.value),
                dy: 20,
                dx: -40
            }
        ];
        
        const makeAnnotations = d3.annotation()
            .annotations(annotations);
      
        chartGroup.append("g")
        .attr("id", "annotation1")
        .call(makeAnnotations);

      
        d3.select("#annotation1 text")
            .style("font-size", '22px')
            .style("fill","red");
      }

    // Define legend
    let legend = chartGroup.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${30}, ${-50})`);

    // Define legend items
    let legendItems = legend.selectAll('.legend-item')
    .data(SeriesCodes)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    // Draw legend rectangles
    legendItems.append('rect')
    .attr('width', 15)
    .attr('height', 15)
    .style('fill', (d, i) => d3.schemeCategory10[i % 10]);

    // Add legend texts
    legendItems.append('text')
    .attr('x', 1.5+"em")
    .attr('y', 0.5+"em")
    .text(d => d === 'SP.DYN.CBRT.IN' ? 'Birth Rate' : 'Death Rate')
    .style('font-size', '16px')
    .attr('alignment-baseline', 'middle');

    









    


    

}