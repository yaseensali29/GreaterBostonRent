// Load the CSV data
d3.csv("data/affordability.csv").then(function(data) {
    // Convert numbers from text into actual numbers
    data.forEach(function(d) {
      d.year = +d.year;
      d.median_rent = +d.median_rent;
      d.median_income = +d.median_income;
      d.rent_burden = +d.rent_burden;
    });
  
    drawRentLineChart(data);
    drawRentIncomeChart(data);
    drawRentBurdenChart(data);
  });
  
  // Chart 1: Median rent over time
  function drawRentLineChart(data) {
    const margin = { top: 40, right: 120, bottom: 60, left: 80 };
    const width = 850 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const svg = d3.select("#rent-line-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const cities = Array.from(new Set(data.map(d => d.city)));
  
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, width]);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.median_rent) + 300])
      .range([height, 0]);
  
    const color = d3.scaleOrdinal()
      .domain(cities)
      .range(d3.schemeTableau10);
  
    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.median_rent));
  
    // X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  
    // Y axis
    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d => "$" + d));
  
    // Axis labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 45)
      .attr("text-anchor", "middle")
      .text("Year");
  
    svg.append("text")
      .attr("x", -height / 2)
      .attr("y", -55)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Median Monthly Rent");
  
    // Draw one line for each city
    cities.forEach(function(city) {
      const cityData = data.filter(d => d.city === city);
  
      svg.append("path")
        .datum(cityData)
        .attr("fill", "none")
        .attr("stroke", color(city))
        .attr("stroke-width", 3)
        .attr("d", line);
  
      // Add city label at the end of each line
      const lastPoint = cityData[cityData.length - 1];
  
      svg.append("text")
        .attr("x", x(lastPoint.year) + 8)
        .attr("y", y(lastPoint.median_rent))
        .attr("alignment-baseline", "middle")
        .attr("fill", color(city))
        .text(city);
    });
  
    // Chart title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text("Median Rent Over Time");
  }
  
  // Chart 2: Rent burden by city for the latest year
  function drawRentBurdenChart(data) {
    const latestYear = d3.max(data, d => d.year);
    const latestData = data.filter(d => d.year === latestYear);
  
    const margin = { top: 40, right: 30, bottom: 60, left: 80 };
    const width = 850 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const svg = d3.select("#rent-burden-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const x = d3.scaleBand()
      .domain(latestData.map(d => d.city))
      .range([0, width])
      .padding(0.3);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(latestData, d => d.rent_burden) + 10])
      .range([height, 0]);
  
    // X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
  
    // Y axis
    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d => d + "%"));
  
    // Bars
    svg.selectAll("rect")
      .data(latestData)
      .enter()
      .append("rect")
      .attr("x", d => x(d.city))
      .attr("y", d => y(d.rent_burden))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.rent_burden))
      .attr("fill", "#4f46e5");
  
    // Data labels
    svg.selectAll(".label")
      .data(latestData)
      .enter()
      .append("text")
      .attr("x", d => x(d.city) + x.bandwidth() / 2)
      .attr("y", d => y(d.rent_burden) - 8)
      .attr("text-anchor", "middle")
      .text(d => d.rent_burden + "%");
  
    // Axis label
    svg.append("text")
      .attr("x", -height / 2)
      .attr("y", -55)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Rent Burden");
  
    // Chart title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text(`Rent Burden by City in ${latestYear}`);
  }

  // Chart 3: Rent compared to monthly income by city for the latest year
function drawRentIncomeChart(data) {
    const latestYear = d3.max(data, d => d.year);
    const latestData = data.filter(d => d.year === latestYear);
  
    latestData.forEach(d => {
      d.monthly_income = d.median_income / 12;
    });
  
    const margin = { top: 40, right: 30, bottom: 70, left: 90 };
    const width = 850 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    const svg = d3.select("#rent-income-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const subgroups = ["median_rent", "monthly_income"];
    const cities = latestData.map(d => d.city);
  
    const x = d3.scaleBand()
      .domain(cities)
      .range([0, width])
      .padding(0.2);
  
    const xSubgroup = d3.scaleBand()
      .domain(subgroups)
      .range([0, x.bandwidth()])
      .padding(0.08);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(latestData, d => d.monthly_income) + 1000])
      .range([height, 0]);
  
    const color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(["#2563eb", "#f97316"]);
  
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
  
    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d => "$" + d3.format(",")(d)));
  
    svg.append("text")
      .attr("x", -height / 2)
      .attr("y", -65)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .text("Monthly Dollars");
  
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text(`Median Rent vs Monthly Income in ${latestYear}`);
  
    svg.append("g")
      .selectAll("g")
      .data(latestData)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x(d.city)},0)`)
      .selectAll("rect")
      .data(d => [
        { key: "median_rent", value: d.median_rent },
        { key: "monthly_income", value: d.monthly_income }
      ])
      .enter()
      .append("rect")
      .attr("x", d => xSubgroup(d.key))
      .attr("y", d => y(d.value))
      .attr("width", xSubgroup.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => color(d.key));
  
    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 190}, 0)`);
  
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "#2563eb");
  
    legend.append("text")
      .attr("x", 22)
      .attr("y", 12)
      .text("Median Monthly Rent");
  
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 25)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "#f97316");
  
    legend.append("text")
      .attr("x", 22)
      .attr("y", 37)
      .text("Monthly Income");
  }