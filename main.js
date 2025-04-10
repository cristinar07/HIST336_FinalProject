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
    },
    {
      activeVerse: 9,
      activeLines: [1, 2, 3, 4],
    },
    {
      activeVerse: 10,
      activeLines: [1, 2, 3, 4],
    },
    {
      activeVerse: 11,
      activeLines: [1, 2, 3, 4, 5],
    },
    {
      activeVerse: 12,
      activeLines: [1, 2, 3, 4, 5, 6],
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
  
  function initialise() {
    drawKeyframe(0); // Start at intro
  }
  
  initialise();
  