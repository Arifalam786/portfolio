/* ==========================================================================
   ARIF ALAM ANSARI - PORTFOLIO INTERACTIVITY & 3D ENGINE
   Three.js 3D Swarm, Parallax Tilt, Agent Simulation Lab, CLI Terminal
   ========================================================================== */

(function () {
  'use strict';

  // --- Sound FX Engine (Web Audio API) ---
  const audioCtx = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext))
    ? new (window.AudioContext || window.webkitAudioContext)()
    : null;

  let audioEnabled = false;

  function playTone(freq, type = 'sine', duration = 0.08, vol = 0.04) {
    if (!audioEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio fallback fail silently
    }
  }

  function playCyberChime() {
    if (!audioEnabled) return;
    playTone(520, 'sine', 0.1, 0.03);
    setTimeout(() => playTone(880, 'triangle', 0.15, 0.03), 60);
  }

  function playTerminalBeep() {
    if (!audioEnabled) return;
    playTone(420, 'sine', 0.04, 0.02);
  }

  // --- Custom Cursor ---
  const cursorDot = document.getElementById('custom-cursor');
  const cursorFollower = document.getElementById('custom-cursor-follower');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  });

  function updateCursorFollower() {
    followerX += (mouseX - followerX) * 0.18;
    followerY += (mouseY - followerY) * 0.18;
    if (cursorFollower) {
      cursorFollower.style.left = `${followerX}px`;
      cursorFollower.style.top = `${followerY}px`;
    }
    requestAnimationFrame(updateCursorFollower);
  }
  updateCursorFollower();

  // Add hover class to cursor on interactive elements
  document.querySelectorAll('a, button, input, textarea, .project-card, .preset-chip, .skill-card').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover');
      playTone(600, 'sine', 0.03, 0.015);
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });

  // --- Scroll Progress Bar & Nav Scroll State ---
  const progressBar = document.getElementById('scroll-progress');
  const navDock = document.getElementById('nav-dock');
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalScroll > 0 ? (window.scrollY / totalScroll) * 100 : 0;
    if (progressBar) progressBar.style.width = `${progress}%`;

    if (window.scrollY > 50) {
      navDock?.classList.add('scrolled');
    } else {
      navDock?.classList.remove('scrolled');
    }

    if (window.scrollY > 400) {
      backToTopBtn?.classList.add('visible');
    } else {
      backToTopBtn?.classList.remove('visible');
    }
  });

  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    playCyberChime();
  });

  // --- Audio Toggle Handler ---
  const audioToggleBtn = document.getElementById('audio-toggle');
  audioToggleBtn?.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    if (audioEnabled) {
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      audioToggleBtn.classList.add('active');
      audioToggleBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      `;
      showToast('🔊 Audio feedback activated');
      playCyberChime();
    } else {
      audioToggleBtn.classList.remove('active');
      audioToggleBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      `;
      showToast('🔇 Audio muted');
    }
  });

  // --- Mobile Drawer Toggle ---
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileClose = document.getElementById('mobile-drawer-close');

  mobileToggle?.addEventListener('click', () => {
    mobileDrawer?.classList.add('open');
  });
  mobileClose?.addEventListener('click', () => {
    mobileDrawer?.classList.remove('open');
  });
  document.querySelectorAll('.mobile-nav-drawer .nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      mobileDrawer?.classList.remove('open');
    });
  });

  // --- Three.js 3D WebGL Neural Swarm Background ---
  function initThreeBg() {
    const container = document.getElementById('bg-canvas-container');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 220;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particle nodes geometry
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 450;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 350;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      velocities.push({
        x: (Math.random() - 0.5) * 0.25,
        y: (Math.random() - 0.5) * 0.25,
        z: (Math.random() - 0.5) * 0.2,
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle Material with Soft Glow
    const pMaterial = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 3.5,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(geometry, pMaterial);
    scene.add(particleSystem);

    // Dynamic Neural Line Connections
    const linesMaterial = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
    });

    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(particleCount * particleCount * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, linesMaterial);
    scene.add(lines);

    // Interactive 3D Icosahedron Swarm Core in Hero Background
    const coreGeo = new THREE.IcosahedronGeometry(42, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(120, -10, -60);
    scene.add(coreMesh);

    // Outer aura ring
    const ringGeo = new THREE.TorusGeometry(60, 1.2, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.18,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    ringMesh.position.set(120, -10, -60);
    scene.add(ringMesh);

    // Mouse movement target
    let targetX = 0;
    let targetY = 0;
    window.addEventListener('mousemove', (e) => {
      targetX = (e.clientX - window.innerWidth / 2) * 0.05;
      targetY = (e.clientY - window.innerHeight / 2) * 0.05;
    });

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);

      // Smooth camera parallax
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (-targetY - camera.position.y) * 0.04;
      camera.lookAt(scene.position);

      // Core rotation
      coreMesh.rotation.x += 0.003;
      coreMesh.rotation.y += 0.005;
      ringMesh.rotation.z += 0.004;

      // Update particle positions
      const posArray = geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += velocities[i].x;
        posArray[i * 3 + 1] += velocities[i].y;
        posArray[i * 3 + 2] += velocities[i].z;

        // Boundaries bounce
        if (Math.abs(posArray[i * 3]) > 250) velocities[i].x *= -1;
        if (Math.abs(posArray[i * 3 + 1]) > 200) velocities[i].y *= -1;
        if (Math.abs(posArray[i * 3 + 2]) > 120) velocities[i].z *= -1;
      }
      geometry.attributes.position.needsUpdate = true;

      // Connect nearby particles with glowing lines
      let vertexPos = 0;
      const maxDistance = 65;
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = posArray[i * 3] - posArray[j * 3];
          const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
          const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxDistance) {
            linePositions[vertexPos++] = posArray[i * 3];
            linePositions[vertexPos++] = posArray[i * 3 + 1];
            linePositions[vertexPos++] = posArray[i * 3 + 2];
            linePositions[vertexPos++] = posArray[j * 3];
            linePositions[vertexPos++] = posArray[j * 3 + 1];
            linePositions[vertexPos++] = posArray[j * 3 + 2];
          }
        }
      }
      lines.geometry.attributes.position.needsUpdate = true;
      lines.geometry.setDrawRange(0, vertexPos / 3);

      renderer.render(scene, camera);
    }
    animate();

    // Window Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  window.addEventListener('DOMContentLoaded', initThreeBg);

  // --- Dynamic Typewriter Effect ---
  const typedEl = document.getElementById('hero-typed-text');
  const roles = [
    'LangGraph & AutoGen Architect',
    'Enterprise Multi-Agent Swarm Engineer',
    'Production RAG & SLM Specialist',
    'Model Context Protocol (MCP) Expert',
    'Offline Containerized AI Deployer',
  ];
  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typeSpeed = 80;

  function typeRole() {
    if (!typedEl) return;
    const current = roles[roleIdx];
    if (isDeleting) {
      typedEl.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      typeSpeed = 40;
    } else {
      typedEl.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      typeSpeed = 80;
    }

    if (!isDeleting && charIdx === current.length) {
      isDeleting = true;
      typeSpeed = 1800; // Hold at end
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typeSpeed = 400;
    }

    setTimeout(typeRole, typeSpeed);
  }
  setTimeout(typeRole, 500);

  // --- 3D Card Tilt Physics ---
  function setupTiltCards() {
    const isHoverDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isHoverDevice || window.innerWidth < 768) return;

    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const maxAngle = card.dataset.tiltMax ? parseFloat(card.dataset.tiltMax) : 12;
        const rotateX = ((centerY - y) / centerY) * maxAngle;
        const rotateY = ((x - centerX) / centerX) * maxAngle;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;

        // Specular highlight if element has card glow
        const glare = card.querySelector('.specular-glare');
        if (glare) {
          glare.style.opacity = '1';
          glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 240, 255, 0.22), transparent 60%)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        const glare = card.querySelector('.specular-glare');
        if (glare) glare.style.opacity = '0';
      });
    });
  }
  setupTiltCards();

  // --- Parallax on Hero Photo Stage & Floating Badges ---
  const heroStage = document.getElementById('hero-stage');
  const heroCard = document.getElementById('hero-card');
  const floatingBadges = document.querySelectorAll('.floating-badge');

  if (heroStage && heroCard && window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth >= 768) {
    heroStage.addEventListener('mousemove', (e) => {
      const rect = heroStage.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      heroCard.style.transform = `rotateY(${(x * 0.05).toFixed(2)}deg) rotateX(${(-y * 0.05).toFixed(2)}deg)`;

      floatingBadges.forEach((badge, idx) => {
        const factor = (idx + 1) * 0.08;
        badge.style.transform = `translate3d(${(x * factor).toFixed(1)}px, ${(y * factor).toFixed(1)}px, 40px)`;
      });
    });

    heroStage.addEventListener('mouseleave', () => {
      heroCard.style.transform = 'rotateY(0deg) rotateX(0deg)';
      floatingBadges.forEach((badge) => {
        badge.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }


  // --- Interactive Multi-Agent Swarm Simulation Lab ---
  const swarmPresets = {
    sales: {
      name: 'Alliant Group Sales Acceleration',
      description: 'Prioritizing CRM deal flow, autonomous deep research on top 40 opportunities & executive briefing generation.',
      metric1: '80% Research Time Saved',
      metric2: '40 Daily Prioritized Opportunities',
      nodes: [
        { title: 'Salesforce Ingestion', role: 'Input Agent', status: 'Ready' },
        { title: 'LangGraph Supervisor', role: 'State Graph Router', status: 'Standby' },
        { title: 'Deep Web Researcher', role: 'MCP Tool Caller', status: 'Standby' },
        { title: 'Opportunity Synthesizer', role: 'Executive Delivery', status: 'Standby' },
      ],
      steps: [
        { node: 0, log: '📥 Ingesting 250+ Salesforce CRM opportunities across Relationship Directors...' },
        { node: 1, log: '🧠 LangGraph Supervisor: Filtering by business rules, value tiers, and urgency score...' },
        { node: 2, log: '🌐 Deep Web Agent: Invoking MCP tools for internet company intelligence & recent filings...' },
        { node: 3, log: '⚡ Synthesizer: Generating personalized executive opportunity digests & routing emails. Done!' },
      ],
    },
    medassist: {
      name: 'Johnson & Johnson MedEdge FHIR Pipeline',
      description: 'Audio transcription in offline hospital network to FHIR clinical reports with zero cloud dependency & HITL verification.',
      metric1: 'Zero Internet Dependency',
      metric2: '90% Accuracy with HITL',
      nodes: [
        { title: 'Audio Ingestion Node', role: 'Medical Audio Agent', status: 'Ready' },
        { title: 'Offline LLM Container', role: 'Edge Reasoning Engine', status: 'Standby' },
        { title: 'MCP FHIR Validator', role: 'Interoperability Protocol', status: 'Standby' },
        { title: 'HITL Clinical Guardrail', role: 'Human Doctor Approval', status: 'Standby' },
      ],
      steps: [
        { node: 0, log: '🎙️ Capturing surgical procedure audio stream in air-gapped hospital environment...' },
        { node: 1, log: '🔒 Offline Docker Container: Transcribing and structuring medical entities via local SLM...' },
        { node: 2, log: '📋 MCP FHIR Validator: Formatting observations into standardized HL7/FHIR JSON schema...' },
        { node: 3, log: '✅ Clinical Review: Human-in-the-loop approved with 90% accuracy boost. Dispatched!' },
      ],
    },
    agro: {
      name: 'Plant Diagnosing Expert with CNN & AutoGen',
      description: 'End-to-end plant disease computer vision classifier paired with AutoGen conversational diagnosis & treatment agents.',
      metric1: '95% CNN Model Accuracy',
      metric2: 'Instant AI Farmer Advisory',
      nodes: [
        { title: 'Leaf Vision Ingestion', role: 'Image Processor', status: 'Ready' },
        { title: 'TensorFlow CNN Core', role: '95% Accuracy Classifier', status: 'Standby' },
        { title: 'AutoGen Diagnosis Swarm', role: 'Multi-Agent Advisory', status: 'Standby' },
        { title: 'Treatment Dispatcher', role: 'Actionable Insights', status: 'Standby' },
      ],
      steps: [
        { node: 0, log: '📸 Ingesting potato leaf specimen photo (512x512 RGB)...' },
        { node: 1, log: '🧬 TensorFlow CNN: Detected Phytophthora infestans (Late Blight) with 95.4% confidence...' },
        { node: 2, log: '🤖 AutoGen Agent: Consulting agronomy vector DB for fungicide dosage and soil mitigation...' },
        { node: 3, log: '🌾 Dispatched localized recovery regimen and preventive alerts to farmer dashboard!' },
      ],
    },
  };

  let activePresetKey = 'sales';
  let isSimulating = false;

  const presetChips = document.querySelectorAll('.preset-chip');
  const runSimBtn = document.getElementById('run-sim-btn');
  const simTelemetryLog = document.getElementById('sim-telemetry-log');
  const simMetric1 = document.getElementById('sim-metric-1');
  const simMetric2 = document.getElementById('sim-metric-2');
  const agentNodes = [
    document.getElementById('swarm-node-0'),
    document.getElementById('swarm-node-1'),
    document.getElementById('swarm-node-2'),
    document.getElementById('swarm-node-3'),
  ];

  function loadPreset(key) {
    activePresetKey = key;
    const preset = swarmPresets[key];
    if (!preset) return;

    if (simMetric1) simMetric1.textContent = preset.metric1;
    if (simMetric2) simMetric2.textContent = preset.metric2;

    preset.nodes.forEach((nodeData, idx) => {
      const nodeEl = agentNodes[idx];
      if (nodeEl) {
        nodeEl.querySelector('.agent-node-title').textContent = nodeData.title;
        nodeEl.querySelector('.agent-node-role').textContent = nodeData.role;
        const statusEl = nodeEl.querySelector('.agent-node-status');
        if (statusEl) statusEl.textContent = nodeData.status;
        nodeEl.className = 'swarm-agent-node';
      }
    });

    if (simTelemetryLog) {
      simTelemetryLog.innerHTML = `<span style="color: #64748b;">Preset loaded: <strong>${preset.name}</strong>. Press "Run Agent Swarm Simulation" to trigger live execution.</span>`;
    }
  }

  presetChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      if (isSimulating) return;
      presetChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      playTone(680, 'sine', 0.05, 0.03);
      loadPreset(chip.dataset.preset);
    });
  });

  runSimBtn?.addEventListener('click', () => {
    if (isSimulating) return;
    runSimulation();
  });

  function runSimulation() {
    isSimulating = true;
    runSimBtn.disabled = true;
    runSimBtn.innerHTML = `
      <svg class="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="2" x2="12" y2="6"></line>
        <line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line>
        <line x1="18" y1="12" x2="22" y2="12"></line>
      </svg>
      Orchestrating Swarm...
    `;

    const preset = swarmPresets[activePresetKey];
    let stepIdx = 0;

    // Reset node classes
    agentNodes.forEach((node) => {
      node.className = 'swarm-agent-node';
      const st = node.querySelector('.agent-node-status');
      if (st) st.textContent = 'Processing...';
    });

    function executeNextStep() {
      if (stepIdx < preset.steps.length) {
        const step = preset.steps[stepIdx];
        const currentNode = agentNodes[step.node];

        // Highlight active node
        agentNodes.forEach((n, i) => {
          if (i === step.node) {
            n.className = 'swarm-agent-node active-node';
            n.querySelector('.agent-node-status').textContent = 'ACTIVE';
          } else if (i < step.node) {
            n.className = 'swarm-agent-node completed-node';
            n.querySelector('.agent-node-status').textContent = 'DONE';
          } else {
            n.className = 'swarm-agent-node';
            n.querySelector('.agent-node-status').textContent = 'STANDBY';
          }
        });

        // Update log
        if (simTelemetryLog) {
          simTelemetryLog.innerHTML = `
            <div style="color: #00f0ff; margin-bottom: 4px;">[Agent-Step ${stepIdx + 1}/4] -> ${agentNodes[step.node].querySelector('.agent-node-title').textContent}</div>
            <div style="color: #f8fafc;">${step.log}</div>
          `;
        }

        playTone(400 + stepIdx * 120, 'triangle', 0.1, 0.04);
        stepIdx++;
        setTimeout(executeNextStep, 1300);
      } else {
        // Completed
        agentNodes.forEach((n) => {
          n.className = 'swarm-agent-node completed-node';
          n.querySelector('.agent-node-status').textContent = 'COMPLETED';
        });

        if (simTelemetryLog) {
          simTelemetryLog.innerHTML = `
            <div style="color: #10b981; font-weight: 700;">✔ WORKFLOW FINISHED: All agents synchronized successfully. Results synthesized & dispatched.</div>
            <div style="color: #94a3b8; font-size: 0.78rem; margin-top: 4px;">Latency: 840ms | Protocol: MCP 1.0 + LangGraph StateGraph | Zero hallucination guardrails enforced</div>
          `;
        }

        playCyberChime();
        showToast('🚀 Agent Swarm Execution Completed!');

        isSimulating = false;
        runSimBtn.disabled = false;
        runSimBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Re-run Agent Swarm
        `;
      }
    }

    executeNextStep();
  }

  // --- Skills Filtering ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      playTone(550, 'sine', 0.04, 0.02);

      const category = btn.dataset.filter;
      skillCards.forEach((card) => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'block';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- Projects Data & Architecture Modals ---
  const projectsData = {
    sales: {
      title: 'Sales Acceleration Engine',
      client: 'Alliant Group (April 2025 - Present)',
      role: 'Generative AI & Agentic Workflow Architect',
      stack: ['Python', 'LangGraph', 'LangChain', 'Azure Logic Apps', 'Salesforce API', 'Deep Web Research'],
      metric: '80% Reduction in Opportunity Research Time',
      problem:
        'Relationship Directors (RDs) at Alliant Group handle hundreds of simultaneous enterprise opportunities, making it easy to miss crucial follow-up windows and client updates.',
      solution:
        'Architected an autonomous multi-agent pipeline integrated with Salesforce. Using business logic and opportunity scoring rules, the system prioritizes deal pipelines every morning and spawns deep web search agents for the top 40 accounts, synthesizing concise intelligence briefings into daily actionable digests.',
      innovation:
        'Custom LangGraph state machine routing opportunities dynamically based on deal stage, coupled with automated fact-checking and anti-hallucination verification.',
      codeSnippet: `# LangGraph State Routing for Sales Opportunity Intelligence
from langgraph.graph import StateGraph, END
from typing import TypedDict, List

class AgentState(TypedDict):
    opportunities: List[dict]
    prioritized_opps: List[dict]
    research_dossiers: List[dict]
    daily_digest_html: str

builder = StateGraph(AgentState)
builder.add_node("crm_ingest", fetch_salesforce_opportunities)
builder.add_node("prioritizer", score_and_rank_opportunities)
builder.add_node("mcp_researcher", crawl_market_intelligence)
builder.add_node("briefing_synth", generate_executive_digest)

builder.set_entry_point("crm_ingest")
builder.add_edge("crm_ingest", "prioritizer")
builder.add_edge("prioritizer", "mcp_researcher")
builder.add_edge("mcp_researcher", "briefing_synth")
builder.add_edge("briefing_synth", END)

sales_swarm = builder.compile()`,
    },
    mededge: {
      title: 'Strava MedEdge — Offline Clinical Swarm',
      client: 'Johnson & Johnson (Jul 2025 - Jan 2026)',
      role: 'Multi-Agent Systems Engineer',
      stack: ['Python', 'LangGraph', 'Raspberry Pi / Edge', 'Docker', 'ACP Protocol', 'MCP', 'FHIR / HL7'],
      metric: 'Zero Internet Dependency + 90% Accuracy with HITL',
      problem:
        'Hospitals require strictly air-gapped, zero-cloud architectures for patient data privacy. Doctors spend extensive hours manually synthesizing surgical audio notes into standardized medical records.',
      solution:
        'Engineered an air-gapped, containerized multi-agent system running entirely on local edge hardware (Raspberry Pi & offline Docker). Converts surgical audio into standardized FHIR-compliant clinical reports using ACP (Agent Communication Protocol) and Model Context Protocol (MCP) toolchain standardizations with a Human-in-the-Loop review portal.',
      innovation:
        'Achieved 90% clinical report accuracy improvement through active physician feedback loops without a single packet leaving the local hospital LAN.',
      codeSnippet: `# Offline Air-Gapped MCP Tool Integration for FHIR Synthesis
from mcp.server.fastmcp import FastMCP
import fhir.resources.observation as fhir_obs

mcp = FastMCP("MedEdge-FHIR-Server")

@mcp.tool()
def structure_clinical_observation(audio_transcript: str) -> dict:
    """Structures raw doctor verbalizations into strict FHIR format."""
    parsed_entities = local_slm_extract(audio_transcript)
    fhir_bundle = {
        "resourceType": "Bundle",
        "type": "transaction",
        "entry": [build_fhir_record(e) for e in parsed_entities]
    }
    return fhir_bundle

# Run in offline container
if __name__ == "__main__":
    mcp.run(transport="stdio")`,
    },
    medassist: {
      title: 'Med Assist — Automated Jira Sprint Orchestrator',
      client: 'Johnson & Johnson (Jan 2026 - March 2026)',
      role: 'Autonomous Workflow Engineer',
      stack: ['Python', 'LangGraph', 'LangChain', 'Jira REST API', 'Raspberry Pi', 'Edge Logic'],
      metric: '40% Reduction in Project Documentation Effort',
      problem:
        'Project managers and tech leads spend up to 15 hours a week manually translating complex software requirements into Jira epics, user stories, subtasks, and acceptance criteria.',
      solution:
        'Built an autonomous LangGraph assistant that connects to Jira via REST API. Ingests raw functional specifications, parses acceptance criteria, and generates complete hierarchies of epics, stories, and QA test cases with standardized labels and story point estimations.',
      innovation:
        'Automated edge documentation generator maintaining cross-team traceability and slashing sprint planning overhead by 40%.',
      codeSnippet: `# Automated Jira User Story & Subtask Graph Generator
from langchain_community.agent_toolkits.jira.toolkit import JiraToolkit
import langgraph

def decompose_requirements_node(state):
    doc = state["requirements_doc"]
    epics = extract_epics(doc)
    return {"epics": epics}

def jira_dispatch_node(state):
    for epic in state["epics"]:
        epic_key = jira_client.create_issue(fields=epic)
        for story in epic["stories"]:
            jira_client.create_issue(fields=story, parent=epic_key)
    return {"status": "SUCCESS"}`,
    },
    framework: {
      title: 'Autonomous Multi-Agent System Framework',
      client: 'Open Source / Enterprise (Aug 2024 - Jul 2025)',
      role: 'Lead Architect',
      stack: ['Python', 'AutoGen Agents', 'FastAPI', 'SQL Database', 'MCP Protocol', 'Computer Vision'],
      metric: 'Universal No-Code Swarm Deployment Platform',
      problem:
        'Non-technical teams struggled to leverage multi-agent architectures due to complex Python orchestration frameworks, lack of standard tool interfaces, and fragmented access control.',
      solution:
        'Designed a modular no-code platform with an intuitive API layer where users can visually chain AutoGen agents, connect external tools via Model Context Protocol (MCP), query vector databases with RAG, and protect agent actions with OpenCV facial recognition authentication.',
      innovation:
        'Biometric authentication gates combined with plug-and-play MCP client connectors, allowing instant tool sharing across any LLM backend.',
      codeSnippet: `# Multi-Agent Swarm with MCP Standardized Protocol
import autogen
from mcp_client import MCPToolProvider

# Initialize MCP Standardized Tools
mcp_tools = MCPToolProvider.load_server_tools("config/mcp_servers.json")

user_proxy = autogen.UserProxyAgent(
    name="Admin_Proxy",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=10
)

analyst_agent = autogen.AssistantAgent(
    name="Market_Analyst",
    llm_config={"config_list": [{"model": "gpt-4o", "api_key": "..."}]},
    tools=mcp_tools
)

# Start multi-agent group chat
groupchat = autogen.GroupChat(agents=[user_proxy, analyst_agent], messages=[])
manager = autogen.GroupChatManager(groupchat=groupchat)`,
    },
    plant: {
      title: 'Plant Diagnosing Expert with CNN & AutoGen',
      client: 'AgroTech AI Innovation (Jan 2025)',
      role: 'Deep Learning & Agent Developer',
      stack: ['Python', 'TensorFlow CNN', 'AutoGen', 'Flask', 'SQL', 'OpenCV'],
      metric: '95% CNN Disease Classification Accuracy',
      problem:
        'Smallholder farmers lose significant yields to preventable potato plant diseases due to delayed diagnosis and lack of access to expert agronomy advice.',
      solution:
        'Built an AI-powered agro-assistant combining a custom Convolutional Neural Network (CNN) trained with TensorFlow (achieving 95% classification accuracy on leaf diseases) with an AutoGen multi-agent conversational system. Delivers instant disease identification alongside step-by-step treatment protocols and interactive natural language Q&A.',
      innovation:
        'Synergy between deep vision feature extraction and multi-agent reasoning: computer vision results feed directly as structured context to the agronomist agent.',
      codeSnippet: `# CNN Vision Classifier + AutoGen Advisory Synergy
import tensorflow as tf
from PIL import Image

def diagnose_leaf_pathology(image_path: str):
    # 1. Run Computer Vision inference
    model = tf.keras.models.load_model("models/potato_disease_cnn.h5")
    processed_img = preprocess_leaf(image_path)
    predictions = model.predict(processed_img)
    class_idx = np.argmax(predictions)
    confidence = float(np.max(predictions))
    
    # 2. Hand off to AutoGen agronomy agent
    context = {"disease": LABELS[class_idx], "confidence": f"{confidence * 100:.2f}%"}
    treatment_plan = agro_agent.generate_remedy(context)
    return {"diagnosis": context, "treatment": treatment_plan}`,
    },
  };

  const projectModal = document.getElementById('project-modal');
  const projectModalBody = document.getElementById('project-modal-body');
  const modalCloseBtns = document.querySelectorAll('.modal-close-btn');

  document.querySelectorAll('.open-project-modal').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projKey = btn.dataset.project;
      const data = projectsData[projKey];
      if (!data || !projectModalBody) return;

      projectModalBody.innerHTML = `
        <div style="margin-bottom: 24px;">
          <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--cyan); text-transform: uppercase; margin-bottom: 6px;">
            ${data.client}
          </div>
          <h2 style="font-size: 2rem; margin-bottom: 8px;">${data.title}</h2>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
            ${data.stack.map((t) => `<span class="tech-chip">${t}</span>`).join('')}
          </div>
          <div class="project-metrics-badge" style="display: inline-flex;">
            <span class="metrics-icon">★</span>
            <span class="metrics-text">${data.metric}</span>
          </div>
        </div>

        <div class="modal-challenge-grid">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px;">
            <h4 style="color: #f87171; margin-bottom: 8px; font-size: 0.95rem;">⚠ Challenge & Problem</h4>
            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.6;">${data.problem}</p>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px;">
            <h4 style="color: #34d399; margin-bottom: 8px; font-size: 0.95rem;">⚡ Agentic Solution</h4>
            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.6;">${data.solution}</p>
          </div>
        </div>

        <div style="background: rgba(0, 240, 255, 0.05); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: var(--radius-md); padding: 18px; margin-bottom: 24px;">
          <h4 style="color: var(--cyan); font-size: 0.95rem; margin-bottom: 6px;">✦ Core Technical Innovation</h4>
          <p style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.6;">${data.innovation}</p>
        </div>

        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-dim);">IMPLEMENTATION CODE ARCHITECTURE</span>
            <button class="copy-code-btn btn-sm btn-secondary" style="font-size: 0.72rem; padding: 4px 10px;">Copy Snippet</button>
          </div>
          <pre style="background: #040711; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px; overflow-x: auto; font-family: var(--font-mono); font-size: 0.82rem; color: #38bdf8; line-height: 1.6;"><code>${escapeHtml(data.codeSnippet)}</code></pre>
        </div>
      `;

      // Copy code button handler
      projectModalBody.querySelector('.copy-code-btn')?.addEventListener('click', (e) => {
        navigator.clipboard.writeText(data.codeSnippet);
        e.target.textContent = 'Copied!';
        setTimeout(() => (e.target.textContent = 'Copy Snippet'), 1800);
        showToast('📋 Architecture code copied to clipboard');
      });

      projectModal?.classList.add('open');
      playCyberChime();
    });
  });

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  modalCloseBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-backdrop').forEach((m) => m.classList.remove('open'));
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop').forEach((m) => m.classList.remove('open'));
    }
  });

  // Close when clicking modal backdrop
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
      }
    });
  });

  // --- Resume Preview Modal ---
  const resumeModal = document.getElementById('resume-modal');
  const openResumeBtns = document.querySelectorAll('.open-resume-modal');
  const printResumeBtn = document.getElementById('print-resume-btn');

  openResumeBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      resumeModal?.classList.add('open');
      playCyberChime();
    });
  });

  printResumeBtn?.addEventListener('click', () => {
    window.print();
  });

  // --- Interactive "Arif-CLI" Terminal ---
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  const promptChips = document.querySelectorAll('.prompt-chip');

  const cliCommands = {
    help: () => `
<div style="color: #38bdf8;">Available commands:</div>
  <span style="color: #00f0ff;">about</span>           - Executive bio and focus areas
  <span style="color: #00f0ff;">skills</span>          - Full list of multi-agent and AI capabilities
  <span style="color: #00f0ff;">projects</span>        - Production systems built at Alliant & Capgemini
  <span style="color: #00f0ff;">experience</span>      - Professional engineering timeline
  <span style="color: #00f0ff;">certs</span>           - Microsoft Azure AI certifications
  <span style="color: #00f0ff;">contact</span>         - Email, phone, GitHub, LinkedIn
  <span style="color: #00f0ff;">hire</span>            - Request direct collaboration or booking
  <span style="color: #00f0ff;">cat resume.txt</span>  - Quick text snapshot of resume
  <span style="color: #00f0ff;">clear</span>           - Clear the terminal screen
`,
    about: () => `
<div style="color: #f8fafc;"><strong>Arif Alam Ansari</strong> - Generative AI Engineer</div>
<div style="color: #94a3b8; margin-top: 4px;">
  2+ years hands-on experience architecting scalable multi-agent systems using LangGraph,
  AutoGen, and CrewAI. Skilled in RAG pipelines, SLM fine-tuning, Model Context Protocol (MCP),
  and containerized offline AI architectures.
</div>
`,
    skills: () => `
<div style="color: #00f0ff;">── FRAMEWORKS & AGENTS ──</div>
  LangGraph, AutoGen, CrewAI, LangChain, ACP Protocol, MCP (Model Context Protocol)
<div style="color: #00f0ff; margin-top: 6px;">── AI / ML & VISION ──</div>
  RAG Pipelines, SLMs, GPT-4o, Claude 3.5, Vector DBs, TensorFlow, CNNs, Computer Vision, OpenCV, Unsloth
<div style="color: #00f0ff; margin-top: 6px;">── BACKEND & CLOUD ──</div>
  Python, JavaScript/TypeScript, FastAPI, Flask, Docker, Raspberry Pi, Azure AI Studio, SQL
`,
    projects: () => `
<div style="color: #34d399;">1. Sales Acceleration Engine (Alliant Group)</div>
  - CRM opportunity prioritization + automated deep web research on top 40 accounts daily.
  - Slashed client research time by 80%.
<div style="color: #34d399; margin-top: 6px;">2. Strava MedEdge (Johnson & Johnson)</div>
  - Offline hospital containerized multi-agent system synthesizing audio into FHIR clinical reports.
  - 90% accuracy with Human-in-the-Loop governance.
<div style="color: #34d399; margin-top: 6px;">3. Med Assist (Johnson & Johnson)</div>
  - Autonomous Jira sprint planning assistant; 40% reduction in documentation effort.
<div style="color: #34d399; margin-top: 6px;">4. Plant Diagnosing CNN & AutoGen</div>
  - 95% CNN potato leaf disease classifier + conversational treatment agent.
`,
    experience: () => `
<div style="color: #c084fc;">★ Alliant Group | AI Engineer (April 2026 - Present)</div>
  Building production multi-agent systems and enterprise agentic automation.
<div style="color: #c084fc; margin-top: 6px;">★ Sogeti (Part of Capgemini) | Analyst A4 (Aug 2024 - March 2026)</div>
  Built enterprise medical transcription multi-agent systems using LLMs, ACP, and LangGraph.
`,
    certs: () => `
<div style="color: #38bdf8;">Microsoft Azure AI Credentials:</div>
  ✔ Azure AI Engineer Associate
  ✔ Azure AI Fundamentals (AI-900)
  ✔ Azure Fundamentals (AZ-900)
  ✔ Natural Language Processing Solution with Azure AI Language
  ✔ Azure AI Vision Solution
  ✔ Intelligent Document Processing with Azure AI Document Intelligence
`,
    contact: () => `
<div style="color: #f8fafc;">Get in touch with Arif:</div>
  📧 Email:    <a href="mailto:arifalam3101@gmail.com" style="color: #00f0ff;">arifalam3101@gmail.com</a>
  📞 Phone:    <a href="tel:+917678328092" style="color: #00f0ff;">+91 7678328092</a>
  🐙 GitHub:   <a href="https://github.com/Arifalam786" target="_blank" style="color: #00f0ff;">github.com/Arifalam786</a>
  💼 LinkedIn: <a href="https://www.linkedin.com" target="_blank" style="color: #00f0ff;">ARIF ALAM ANSARI</a>
`,
    hire: () => `
<div style="color: #10b981; font-weight: 700;">🤝 Available for AI Engineering & Multi-Agent Swarm Engagements!</div>
<div style="color: #cbd5e1; margin-top: 4px;">
  Send a direct proposal to <span style="color: #00f0ff;">arifalam3101@gmail.com</span> or call <span style="color: #00f0ff;">+91 7678328092</span>.
</div>
`,
    'cat resume.txt': () => `
========================================
ARIF ALAM ANSARI - GENERATIVE AI ENGINEER
========================================
Experience: Alliant Group, Sogeti (Capgemini)
Education:  B.Tech NIET (2020-2024)
Specialty:  LangGraph, AutoGen, CrewAI, MCP, RAG
Email:      arifalam3101@gmail.com
Phone:      +91 7678328092
========================================
`,
  };

  function handleTerminalCommand(cmdRaw) {
    const cmd = cmdRaw.trim().toLowerCase();
    if (!terminalOutput) return;

    if (cmd === 'clear') {
      terminalOutput.innerHTML = '';
      return;
    }

    const commandEntry = document.createElement('div');
    commandEntry.className = 'terminal-output-line';
    commandEntry.innerHTML = `<span style="color: #10b981;">arif@agent-swarm:~$</span> <span style="color: #fff;">${escapeHtml(cmdRaw)}</span>`;
    terminalOutput.appendChild(commandEntry);

    const responseEntry = document.createElement('div');
    responseEntry.className = 'terminal-output-line';

    if (cliCommands[cmd]) {
      responseEntry.innerHTML = cliCommands[cmd]();
      playTerminalBeep();
    } else if (cmd === '') {
      // Empty input
      return;
    } else {
      responseEntry.innerHTML = `<span style="color: #f87171;">Command not found: "${escapeHtml(cmd)}". Type <strong style="color: #00f0ff;">help</strong> for available commands.</span>`;
      playTone(280, 'sawtooth', 0.08, 0.03);
    }

    terminalOutput.appendChild(responseEntry);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  terminalInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = terminalInput.value;
      terminalInput.value = '';
      handleTerminalCommand(val);
    }
  });

  promptChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const cmd = chip.dataset.cmd;
      if (terminalInput) terminalInput.value = cmd;
      handleTerminalCommand(cmd);
      if (terminalInput) terminalInput.value = '';
    });
  });

  // --- Copy to Clipboard Handlers & Toast Notification ---
  const copyButtons = document.querySelectorAll('.copy-trigger');
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.dataset.copy;
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied "${textToCopy}" to clipboard!`);
          playCyberChime();
        });
      }
    });
  });

  // --- Contact Form Submission Handler ---
  const contactForm = document.getElementById('contact-form');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('form-name')?.value;
    const email = document.getElementById('form-email')?.value;
    const subject = document.getElementById('form-subject')?.value;
    const message = document.getElementById('form-message')?.value;

    if (!name || !email || !message) {
      showToast('⚠️ Please fill out all required fields.');
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Connecting with Arif...';
    }

    // Launch mailto fallback so visitor can directly send the composed email
    setTimeout(() => {
      showToast('🚀 Thank you! Opening your email client to dispatch message...');
      playCyberChime();

      const mailtoLink = `mailto:arifalam3101@gmail.com?subject=${encodeURIComponent(
        subject || `Inquiry from ${name} (Portfolio)`
      )}&body=${encodeURIComponent(`Hi Arif,\n\n${message}\n\nFrom: ${name}\nEmail: ${email}`)}`;

      window.location.href = mailtoLink;

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Message Dispatched ✔';
      }
      contactForm.reset();
    }, 900);
  });

  // --- Global Toast Notification Helper ---
  function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'opacity 0.3s, transform 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  window.showToast = showToast;
})();
