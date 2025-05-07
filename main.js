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

// --- Los Caminos: Migration Pathways & Timeline ---
const fakeData = [
  { year:1980, origin:[-99.1332,19.4326], count:120 },
  { year:1980, origin:[-87.2073,14.0818], count:60  },
  { year:1980, origin:[-90.5069,14.6349], count:30  },
  { year:1990, origin:[-99.1332,19.4326], count:240 },
  { year:1990, origin:[-87.2073,14.0818], count:120 },
  { year:1990, origin:[-90.5069,14.6349], count:90 },
  { year:2000, origin:[-99.1332,19.4326], count:360 },
  { year:2000, origin:[-87.2073,14.0818], count:180 },
  { year:2000, origin:[-90.5069,14.6349], count:150 },
  { year:2010, origin:[-99.1332,19.4326], count:480 },
  { year:2010, origin:[-87.2073,14.0818], count:240 },
  { year:2010, origin:[-90.5069,14.6349], count:210 },
  { year:2020, origin:[-99.1332,19.4326], count:600 },
  { year:2020, origin:[-87.2073,14.0818], count:300 },
  { year:2020, origin:[-90.5069,14.6349], count:270 }
];

const container = document.getElementById('los-caminos');
const width  = container.clientWidth;
const height = container.clientHeight;
const atlanta = [-84.3880,33.7490];

const svg = d3.select("#map");
const projection = d3.geoMercator()
                     .center([-90,25])
                     .scale(900)
                     .translate([width/2, height/2]);
const path = d3.geoPath().projection(projection);

// Draw base map (US outline)
d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then(us => {
  svg.append("path")
     .datum(topojson.feature(us, us.objects.nation))
     .attr("d", path)
     .attr("fill","#eee");
  updateArcs(+d3.select("#year-slider").property("value"));
});

function updateArcs(year) {
  const pts = fakeData.filter(d => d.year === year);
  const arcs = svg.selectAll(".arc")
    .data(pts, d => d.origin.join(",") + "-" + d.year);

  arcs.exit().remove();

  const enter = arcs.enter()
    .append("path")
    .attr("class","arc")
    .attr("d", d => {
      const s = projection(d.origin);
      const t = projection(atlanta);
      const m = [(s[0]+t[0])/2, (s[1]+t[1])/2 - 100];
      return d3.line().curve(d3.curveBasis)([s,m,t]);
    })
    .style("stroke-width", d => Math.sqrt(d.count)/2)
    .style("opacity", 0);

  enter.transition().duration(500)
       .style("opacity", 0.7);
}

// Year‐slider interaction
d3.select("#year-slider").on("input", function() {
  const y = +this.value;
  d3.select("#year-label").text(y);
  updateArcs(y);
});

// Play/Pause animation
let playing = false, timer;
d3.select("#play-pause").on("click", function() {
  playing = !playing;
  d3.select(this).text(playing ? "⏸️" : "▶️");
  if (playing) {
    timer = setInterval(() => {
      let y = +d3.select("#year-slider").property("value");
      // new:
      y  = y + 1 > 2023 ? 2009 : y + 1;
      d3.select("#year-slider").property("value", y).dispatch("input");
    }, 1500);
  } else {
    clearInterval(timer);
  }
});




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

// --- Visualization 3: Working Atlanta (stacked bar chart) ---

// 1) Fake data: number of workers by industry & nativity
const data3 = [
  { industry: "Construction", foreign: 5000, usborn: 2000 },
  { industry: "Hospitality",   foreign: 3000, usborn: 2500 },
  { industry: "Transportation",foreign: 1500, usborn: 1000 },
  { industry: "Domestic Work", foreign:  800, usborn:  400 },
  { industry: "Healthcare",    foreign: 1200, usborn: 1800 }
];

// 2) Set margins & dimensions
const margin3 = { top: 20, right: 20, bottom: 60, left: 60 };
const svgEl3 = document.getElementById("vis-working-atlanta");
const width3  = svgEl3.clientWidth  - margin3.left - margin3.right;
const height3 = svgEl3.clientHeight - margin3.top  - margin3.bottom;

const svg3 = d3.select("#vis-working-atlanta")
  .attr("width",  width3 + margin3.left + margin3.right)
  .attr("height", height3 + margin3.top  + margin3.bottom)
  .append("g")
    .attr("transform", `translate(${margin3.left},${margin3.top})`);

// 3) Stack layout
const keys3 = ["foreign","usborn"];
const stack3 = d3.stack().keys(keys3);
const series3 = stack3(data3);

// 4) Scales
const x3 = d3.scaleBand()
  .domain(data3.map(d => d.industry))
  .range([0, width3])
  .padding(0.2);

const y3 = d3.scaleLinear()
  .domain([0, d3.max(data3, d => d.foreign + d.usborn)])
  .nice()
  .range([height3, 0]);

const color3 = d3.scaleOrdinal()
  .domain(keys3)
  .range(["#6b486b", "#a05d56"]);

// 5) Draw bars
svg3.selectAll("g.layer")
  .data(series3)
  .enter().append("g")
    .attr("class","layer")
    .attr("fill", d => color3(d.key))
  .selectAll("rect")
  .data(d => d)
  .enter().append("rect")
    .attr("x", d => x3(d.data.industry))
    .attr("y", d => y3(d[1]))
    .attr("height", d => y3(d[0]) - y3(d[1]))
    .attr("width", x3.bandwidth());

// 6) Axes
svg3.append("g")
    .attr("class","axis")
    .attr("transform", `translate(0,${height3})`)
    .call(d3.axisBottom(x3))
    .selectAll("text")
      .attr("transform","rotate(-40)")
      .attr("text-anchor","end")
      .attr("dx","-0.8em")
      .attr("dy","0.15em");

svg3.append("g")
    .attr("class","axis")
    .call(d3.axisLeft(y3).ticks(5));

// 7) Legend
const legendData3 = [
  { key: "foreign", label: "Foreign-born" },
  { key: "usborn",  label: "U.S.-born" }
];

const legend3 = d3.select("#legend-working")
  .selectAll(".legend-working")
  .data(legendData3)
  .enter().append("div")
    .attr("class","legend-working");

legend3.append("span")
    .attr("class","legend-swatch")
    .style("background", d => color3(d.key));

legend3.append("span")
    .text(d => d.label);




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
  