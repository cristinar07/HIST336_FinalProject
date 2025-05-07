let keyframes = [
    {
      activeVerse: 0,
      activeLines: [],
    },
    {
      activeVerse: 1,
      activeLines: [1, 2, 3, 4],
    },
    {
      activeVerse: 2,
      activeLines: [1, 2, 3, 4],
    },
    {
      activeVerse: 3,
      activeLines: [1, 2, 3, 4],
    },
    {
      activeVerse: 4,
      activeLines: [1, 2, 3, 4],
    },
    {
      activeVerse: 5,
      activeLines: [1, 2, 3, 4],
    },
    {
      activeVerse: 6,
      activeLines: [1, 2, 3, 4],
    },
    {
      activeVerse: 7,
      activeLines: [1, 2, 3, 4],
    },
    {
      activeVerse: 8,
      activeLines: [1, 2, 3, 4],
    }
  ];
  
  let keyframeIndex = 0;
  
  function drawKeyframe(index) {
    const kf = keyframes[index];
    keyframeIndex = index;
  
    // Remove previous highlights
    document.querySelectorAll(".poem-box p").forEach(p => p.classList.remove("active-line"));
  
    // Highlight current lines
    kf.activeLines.forEach(lineNum => {
      const lineId = `line${lineNum}-verse${kf.activeVerse}`;
      const line = document.getElementById(lineId);
      if (line) line.classList.add("active-line");
    });
  
    // Scroll to current verse
    const verse = document.getElementById(`verse${kf.activeVerse}`);
    if (verse) verse.scrollIntoView({ behavior: "smooth", block: "center" });
  
    // Update timeline progress
    document.querySelectorAll(".timeline-node").forEach(n => n.classList.remove("active"));
    const activeNode = document.querySelector(`.timeline-node[data-slide="${kf.activeVerse + 1}"]`);
    if (activeNode) activeNode.classList.add("active");
  }
  
  // Timeline node click
  document.querySelectorAll(".timeline-node").forEach(node => {
    node.addEventListener("click", () => {
      const slideNum = parseInt(node.getAttribute("data-slide"));
      const frameIndex = keyframes.findIndex(kf => kf.activeVerse === slideNum - 1);
      if (frameIndex !== -1) drawKeyframe(frameIndex);
    });
  });
  
  // Scroll indicator
  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", () => drawKeyframe(1));
  }
  
  // Scroll-based verse detection
  const verseSections = document.querySelectorAll(".full-slide");
  
  const observerOptions = {
    root: null,
    threshold: 0.5
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const verseId = entry.target.id;
        const verseNum = parseInt(verseId.replace("verse", ""));
        const frameIndex = keyframes.findIndex(kf => kf.activeVerse === verseNum);
        if (frameIndex !== -1 && frameIndex !== keyframeIndex) {
          drawKeyframe(frameIndex);
        }
      }
    });
  }, observerOptions);
  
  verseSections.forEach(section => observer.observe(section));

// Photo‐essay click → caption + lightbox
const captionBox = document.getElementById('photo-caption');
const modal      = document.getElementById('photo-modal');
const modalImg   = document.getElementById('modal-img');
const modalCap   = document.getElementById('modal-caption');
const modalClose = document.querySelector('.modal-close');

document.querySelectorAll('.photo-gallery figure').forEach(fig => {
  fig.addEventListener('click', () => {
    const imgEl    = fig.querySelector('img');
    const src      = imgEl.src;
    const caption  = fig.dataset.caption;

    // update thumbnail caption
    // captionBox.textContent = caption;

    // open lightbox
    modal.style.display = 'flex';
    modalImg.src        = src;
    modalCap.textContent = caption;
  });
});

// close lightbox on × click
modalClose.addEventListener('click', () => {
  modal.style.display = 'none';
});

// close lightbox when clicking outside the image
modal.addEventListener('click', e => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// --- Vis #1: Los Caminos: Migration Pathways & Timeline ---

// 1) Country → [lon,lat]
const originCoords = {
  Mexico:       [-99.1332, 19.4326],
  ElSalvador:   [-88.8965, 13.7942],
  Honduras:     [-86.2419, 14.0723],
  Guatemala:    [-90.2308, 15.7835],
  Nicaragua:    [-85.2072, 12.8654],
  CostaRica:    [-84.0739, 9.9333],
  Panama:       [-79.5167, 8.9833],
  Colombia:     [-74.0721, 4.7110],
  Venezuela:    [-66.9036, 10.4806],
  Ecuador:      [-78.4678, -0.1807],
  Peru:         [-77.0428, -12.0464],
  Chile:        [-70.6693, -33.4489],
  Argentina:    [-58.4173, -34.6118],
  Brazil:       [-47.8825, -15.7942],
  Cuba:         [-82.3666, 23.1136],
  DomRepublic:  [-69.9312, 18.4861],
  PuertoRico:   [-66.1057, 18.4655]
};

// 2) Core map setup
const arcColor  = "#542831";
const container = d3.select("#los-caminos");
const width     = container.node().clientWidth;
const height    = container.node().clientHeight;
const atlanta   = [-84.3880, 33.7490];

const svg = d3.select("#map")
  .attr("viewBox", `0 0 ${width} ${height}`);

const projection = d3.geoMercator()
  .center([-55, 10])
  .scale(300)
  .translate([width/2, height/2]);

const path = d3.geoPath().projection(projection);

// Tooltip div (absolute, starts invisible)
const tooltip = d3.select("#tooltip")
  .style("position", "absolute")
  .style("pointer-events", "none")
  .style("background", "rgba(0,0,0,0.75)")
  .style("color", "#fff")
  .style("padding", "4px 8px")
  .style("border-radius", "4px")
  .style("font-size", "0.8rem")
  .style("opacity", 0);

let widthScale;  // will be our stroke‐width scale

// 3) Load CSV and kick off drawing
d3.csv("los_caminos_msa.csv", d => {
  d.year = +d.year;
  for (let k in originCoords) d[k] = +d[k];
  return d;
}).then(rows => {
  // Flatten: one object per (country,year)
  const arcData = [];
  rows.forEach(r => {
    for (let country in originCoords) {
      const cnt = r[country];
      if (cnt && cnt > 0) {
        arcData.push({
          year:    r.year,
          origin:  originCoords[country],
          count:   cnt,
          country: country
        });
      }
    }
  });

  // Build stroke‐width scale (6–24px)
  const counts = arcData.map(d=>d.count);
  widthScale = d3.scaleSqrt()
    .domain(d3.extent(counts))
    .range([6, 15]);

  // Draw the static map & origin dots, then arcs for year=2009
  drawBaseMap(() => {
    // origin points
    svg.selectAll(".origin-point")
      .data(Object.entries(originCoords))
      .enter().append("circle")
        .attr("class","origin-point")
        .attr("r",4)
        .attr("fill",arcColor)
        .attr("transform", d => {
          const p = projection(d[1]);
          return `translate(${p[0]},${p[1]})`;
        });

    // initial arcs
    updateArcs(2009);
  });

  // Slider interaction
  d3.select("#year-slider").on("input", function() {
    const y = +this.value;
    d3.select("#year-label").text(y);
    updateArcs(y);
  });

  // Play / Pause
  let playing = false, timer;
  d3.select("#play-pause").on("click", () => {
    playing = !playing;
    d3.select("#play-pause").text(playing ? "⏸️" : "▶️");
    if (playing) {
      timer = setInterval(() => {
        let y = +d3.select("#year-slider").property("value");
        y = y >= 2023 ? 2009 : y + 1;
        d3.select("#year-slider").property("value",y).dispatch("input");
      }, 800);
    } else {
      clearInterval(timer);
    }
  });

  // updateArcs: draws the flows for a given year
  function updateArcs(year) {
    const slice = arcData.filter(d => d.year === year);

    // JOIN
    const sel = svg.selectAll(".arc")
      .data(slice, d => d.country + "_" + d.year);

    // EXIT
    sel.exit().remove();

    // ENTER
    const enter = sel.enter().append("path")
      .attr("class","arc")
      .attr("fill",arcColor)
      .attr("stroke",arcColor)
      .style("opacity",0.8)            // fully opaque
      .attr("stroke-linecap","round")
      .on("mouseover",(event,d)=>{
        /* hover shows: d.count migrants from d.country */
        tooltip
          .style("left", (event.pageX+10)+"px")
          .style("top",  (event.pageY+10)+"px")
          .html(`<strong>${d.country}</strong><br/>${d.count.toLocaleString()} migrants`)
          .transition().duration(100).style("opacity",1);
      })
      .on("mouseout",()=>{
        tooltip.transition().duration(100).style("opacity",0);
      });

    // ENTER + UPDATE
    enter.merge(sel)
      .raise()                      // draw arcs over dots
      .transition().duration(500)
        .attrTween("d", d => {
          const s = projection(d.origin),
                t = projection(atlanta),
                m = [(s[0]+t[0])/2, (s[1]+t[1])/2 - 60];
          const line = d3.line().curve(d3.curveBasis)([s,m,t]);
          return () => line;
        })
        .style("stroke-width", d => widthScale(d.count));
  }
});

// 4) Draw the world baseline
function drawBaseMap(done) {
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then(world => {
      svg.append("path")
        .datum(topojson.feature(world, world.objects.countries))
        .attr("d", path)
        .attr("fill", "#f5f5f5")
        .attr("stroke","#bbb")
        .attr("stroke-width",0.3);
      if (done) done();
    });
}


// --- Visualization 2: Latinx Atlanta (28-county MSA) ---

// 1) list of the 28-county MSA FIPS codes (as strings)
// 28-county Atlanta MSA (exact list you provided)
const msaFips = [
  '13013','13025','13045','13097','13051','13067','13057','13085',
  '13089','13115','13117','13121','13135','13139','13155','13149',
  '13171','13199','13215','13217','13223','13229','13239','13245',
  '13247','13297'
];

// 2) fake data store
const fakePct = {};

// 3) dimensions
const cont2  = document.getElementById('latinx-atlanta');
const w2     = cont2.clientWidth;
const h2     = cont2.clientHeight * 0.8;
const svg2   = d3.select('#map2')
                 .attr('width', w2)
                 .attr('height', h2);

// 4) projection
const projection2 = d3.geoMercator()
  .center([-84.4, 32.8])
  .scale(6000)
  .translate([w2/2, h2/2]);
const path2 = d3.geoPath().projection(projection2);

// 5) color scale
const color2 = d3.scaleSequential(d3.interpolateOrRd).domain([0,100]);

let metroCounties; 

// 6) load and filter
d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json')
  .then(us => {
    // all Georgia counties
    const allGa = topojson.feature(us, us.objects.counties).features
      .filter(d => d.id.startsWith('13'));

    // keep only MSA
    metroCounties = allGa.filter(d => msaFips.includes(d.id));

    // seed fake values
    metroCounties.forEach(d => fakePct[d.id] = Math.random()*100);

    // draw
    drawMap(metroCounties);
    drawLegend();
  });

function drawMap(features) {
  const sel = svg2.selectAll('.county').data(features, d=>d.id);
  sel.exit().remove();

  const enter = sel.enter()
    .append('path')
      .attr('class','county')
      .attr('d', path2)
      .attr('fill', d => color2(fakePct[d.id]));

  enter.merge(sel)
    .transition().duration(500)
    .attr('fill', d => color2(fakePct[d.id]));
}

function drawLegend() {
  const legendVals = [0,20,40,60,80,100];
  const legend = d3.select('#legend2')
    .selectAll('.legend-item')
    .data(legendVals).enter()
    .append('div').attr('class','legend-item');

  legend.append('div')
    .attr('class','legend-swatch')
    .style('background', d=>color2(d));

  legend.append('div')
    .text(d=>d + '%');
}

// 7) origin-filter just re-colors for now
d3.select('#origin-filter').on('change', () => {
  metroCounties.forEach(d => fakePct[d.id] = Math.random()*100);
  drawMap(metroCounties);
});


// --- Visualization 3: Working Atlanta (Bar Chart) ---
;(function(){
  const svg    = d3.select("#wa-chart"),
        margin = {top:40, right:20, bottom:100, left:120},
        width  = +svg.attr("width")  - margin.left - margin.right,
        height = +svg.attr("height") - margin.top  - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().range([0, width]).padding(0.2);
  const y = d3.scaleLinear().range([height, 0]);

  const xAxisG = g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${height})`);
  const yAxisG = g.append("g")
    .attr("class", "axis axis--y");

  const tooltip = d3.select("#wa-tooltip");

  let nestedData;

  // load your cleaned CSV
  d3.csv("working_atlanta_data.csv", d => {
    d.year  = +d.year;
    d.count = +d.count;
    return d;
  }).then(data => {
    // nest by year → nativity
    nestedData = d3.group(data, d => d.year, d => d.nativity);

    // initial draw
    updateChart(2023, "foreign-born");

    // controls
    d3.select("#wa-year-slider").on("input", function() {
      const yr = +this.value;
      d3.select("#wa-year-label").text(yr);
      updateChart(yr, d3.select("#wa-nativity").property("value"));
    });
    d3.select("#wa-nativity").on("change", function() {
      const yr = +d3.select("#wa-year-slider").property("value");
      updateChart(yr, this.value);
    });
  });

  function updateChart(year, nativity) {
    // grab the right slice
    const slice = nestedData.get(year).get(nativity)
      .sort((a, b) => d3.ascending(a.industry, b.industry));

    // update scales
    x.domain(slice.map(d => d.industry));
    y.domain([0, d3.max(slice, d => d.count) * 1.1]).nice();

    // DATA JOIN
    const bars = g.selectAll(".bar")
      .data(slice, d => d.industry);

    // EXIT
    bars.exit().remove();

    // ENTER
    const barsEnter = bars.enter().append("rect")
      .attr("class", "bar")
      .attr("x",     d => x(d.industry))
      .attr("width", x.bandwidth())
      .attr("y",     height)
      .attr("height", 0)
      .attr("fill", "#542831")
      .on("mouseover", (e, d) => {
        tooltip
          .style("left",  (e.pageX + 10) + "px")
          .style("top",   (e.pageY + 10) + "px")
          .html(`<strong>${d.industry}</strong><br/>${d.count.toLocaleString()}`)
          .transition().duration(50).style("opacity", 1);
      })
      .on("mouseout", () =>
        tooltip.transition().duration(50).style("opacity", 0)
      );

    // ENTER + UPDATE
    barsEnter.merge(bars)
      .transition().duration(600)
        .attr("x",      d => x(d.industry))
        .attr("width",  x.bandwidth())
        .attr("y",      d => y(d.count))
        .attr("height", d => height - y(d.count));

    // update axes
    xAxisG.transition().duration(600)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("text-anchor","end")
        .attr("transform",   "rotate(-20)")
        .attr("dx",          "-0.6em")
        .attr("dy",          "0.3em");

    yAxisG.transition().duration(600)
      .call(d3.axisLeft(y).ticks(8).tickFormat(d3.format(",")));
  }
})();


  // --- Visualization 4: Speaking Across Borders ---

// fake language‐at‐home shares by age group
const langDataByAge = {
  all:      [ {lang:"Spanish",count:55}, {lang:"English",count:35}, {lang:"Other",count:10} ],
  under18:  [ {lang:"Spanish",count:60}, {lang:"English",count:30}, {lang:"Other",count:10} ],
  "18to34":[ {lang:"Spanish",count:50}, {lang:"English",count:40}, {lang:"Other",count:10} ],
  "35to64":[ {lang:"Spanish",count:45}, {lang:"English",count:45}, {lang:"Other",count:10} ],
  "65plus": [ {lang:"Spanish",count:40}, {lang:"English",count:50}, {lang:"Other",count:10} ]
};

// fake LEP households by age (total dots = count/10)
const lepByAge = {
  all:      200,
  under18:  50,
  "18to34": 60,
  "35to64": 70,
  "65plus": 20
};

// dimensions for pie
function drawPie(ageKey) {
  // clear existing
  d3.select("#pie-language").selectAll("*").remove();

  const data = langDataByAge[ageKey];
  const width  = document.getElementById("pie-language").clientWidth;
  const height = document.getElementById("pie-language").clientHeight;
  const radius = Math.min(width, height) / 2 - 20;

  const svg = d3.select("#pie-language")
    .append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", `translate(${width/2},${height/2})`);

  const color = d3.scaleOrdinal()
    .domain(data.map(d=>d.lang))
    .range(["#98abc5","#8a89a6","#7b6888"]);

  const pie = d3.pie().value(d=>d.count);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);

  svg.selectAll("path")
    .data(pie(data))
    .enter().append("path")
      .attr("d", arc)
      .attr("fill", d=> color(d.data.lang))
      .attr("stroke","white")
      .style("stroke-width","1px");

  // labels
  svg.selectAll("text")
    .data(pie(data))
    .enter().append("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("dy","0.35em")
      .attr("font-size","0.8rem")
      .attr("text-anchor","middle")
      .text(d => d.data.lang);
}

// dimensions for dot map
function drawDotMap(ageKey) {
  // clear existing
  d3.select("#dotmap-proficiency").selectAll("*").remove();

  const count = lepByAge[ageKey];
  const width  = document.getElementById("dotmap-proficiency").clientWidth;
  const height = document.getElementById("dotmap-proficiency").clientHeight;

  const svg = d3.select("#dotmap-proficiency")
    .append("svg")
      .attr("width", width)
      .attr("height", height);

  // fake boundary rectangle
  svg.append("rect")
    .attr("x",20).attr("y",20)
    .attr("width", width-40).attr("height", height-40)
    .attr("fill","none")
    .attr("stroke","#ccc");

  // scatter random dots
  const dots = d3.range(count).map(() => ({
    x: 20 + Math.random()*(width-40),
    y: 20 + Math.random()*(height-40)
  }));

  svg.selectAll("circle")
    .data(dots)
    .enter().append("circle")
      .attr("cx", d=>d.x)
      .attr("cy", d=>d.y)
      .attr("r", 3)
      .attr("fill", "#de2d26")
      .attr("opacity", 0.6);
}

// initial draw
drawPie("all");
drawDotMap("all");

// redraw on age‐group change
d3.select("#age-group").on("change", function() {
  const key = this.value;
  drawPie(key);
  drawDotMap(key);
});


  function initialise() {
    drawKeyframe(0); // Start at intro
  }
  
  initialise();
  