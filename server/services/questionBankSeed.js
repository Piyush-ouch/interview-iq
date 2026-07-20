import QuestionBank from "../models/questionBank.model.js";

export const initialQuestionsData = [
  // --- SOFTWARE ENGINEERING ---
  {
    title: "React Virtual DOM & Reconciliation",
    question: "Explain how React's Virtual DOM works and why reconciliation optimizes rendering performance.",
    industry: "Software Engineering",
    role: "Frontend Developer",
    difficulty: "Mid",
    skills: ["React", "JavaScript", "Virtual DOM", "Web Performance"],
    category: "Technical",
    suggestedAnswer:
      "React maintains a lightweight in-memory representation of the real DOM called the Virtual DOM. When state or props change, React creates a new Virtual DOM tree and compares it with the previous tree using a diffing algorithm (Reconciliation). It computes the minimal set of real DOM updates needed and batches them, avoiding expensive full-page re-renders.",
    keyPoints: ["In-memory JavaScript tree", "Diffing algorithm complexity O(n)", "Key prop for list item tracking", "Batch DOM updates"],
  },
  {
    title: "JavaScript Event Loop & Microtasks",
    question: "How does the JavaScript Event Loop handle asynchronous code, Promise microtasks, and setTimeout macrotasks?",
    industry: "Software Engineering",
    role: "Frontend Developer",
    difficulty: "Senior",
    skills: ["JavaScript", "Event Loop", "Promises", "Async/Await"],
    category: "Technical",
    suggestedAnswer:
      "JavaScript uses a single-threaded event loop driven by a Call Stack, Microtask Queue, and Macrotask Queue. Synchronous code executes first on the stack. When the stack clears, the Event Loop drains ALL pending microtasks (Promises, process.nextTick, queueMicrotask) before picking the NEXT macrotask (setTimeout, setInterval, I/O callbacks).",
    keyPoints: ["Call Stack vs Web APIs", "Microtask queue has higher priority than Macrotask queue", "Promises enqueue microtasks", "setTimeout enqueues macrotasks"],
  },
  {
    title: "Node.js Non-Blocking I/O Architecture",
    question: "What makes Node.js event-driven and non-blocking? How does libuv delegate heavy operations?",
    industry: "Software Engineering",
    role: "Backend Developer",
    difficulty: "Mid",
    skills: ["Node.js", "Express", "libuv", "Asynchronous I/O"],
    category: "Technical",
    suggestedAnswer:
      "Node.js runs an event loop using libuv. Asynchronous operations like file system reads, database queries, and network sockets are offloaded to OS kernel mechanisms (epoll/kqueue) or libuv's internal thread pool (4 worker threads default). Upon completion, callbacks are pushed to the event loop's task queue for processing.",
    keyPoints: ["Single-threaded JavaScript execution", "libuv C library abstraction", "Thread pool offloading for fs/crypto/dns", "Non-blocking event loop"],
  },
  {
    title: "Database Indexing & B-Trees",
    question: "How do B-Tree database indexes improve SELECT query performance, and what are the trade-offs on WRITE operations?",
    industry: "Software Engineering",
    role: "Backend Developer",
    difficulty: "Senior",
    skills: ["SQL", "MongoDB", "Database Indexing", "B-Tree"],
    category: "Technical",
    suggestedAnswer:
      "Indexes use B-Tree structures to organize data into sorted nodes, reducing query search complexity from O(N) full table scans to O(log N) tree traversals. However, every INSERT, UPDATE, or DELETE requires adjusting the B-Tree structure and writing to both table data and index pages, introducing write overhead.",
    keyPoints: ["O(log N) lookup time", "Composite indices and column order", "Index scan vs table scan", "Write amplification penalty"],
  },
  {
    title: "Microservices vs Monolith Trade-offs",
    question: "Compare Monolithic and Microservices architectures. When should a team migrate to microservices?",
    industry: "Software Engineering",
    role: "Full Stack Engineer",
    difficulty: "Senior",
    skills: ["Microservices", "System Design", "Architecture", "REST"],
    category: "System Design",
    suggestedAnswer:
      "Monoliths provide simple development, testing, and deployment for small teams. Microservices decouple business domains into independently deployable services, enabling isolated scaling, technology diversity, and autonomous team deployment. Migration is justified when organizational growth causes deployment bottlenecks or specialized scaling requirements.",
    keyPoints: ["Domain-driven design boundaries", "Independent deployments and tech stacks", "Distributed system complexity (tracing, network latency)", "Eventual consistency vs ACID transactions"],
  },

  // --- DATA & AI ---
  {
    title: "Bias-Variance Tradeoff",
    question: "Explain the Bias-Variance tradeoff in Machine Learning and how regularization helps prevent overfitting.",
    industry: "Data & AI",
    role: "Data Scientist",
    difficulty: "Junior",
    skills: ["Python", "Machine Learning", "Overfitting", "Regularization"],
    category: "Technical",
    suggestedAnswer:
      "Bias refers to errors from overly simplistic assumptions (underfitting), while Variance refers to sensitivity to training data noise (overfitting). Total Error = Bias² + Variance + Irreducible Error. Regularization techniques (L1 Lasso, L2 Ridge) add a penalty term to loss functions, constraining model weights and controlling variance.",
    keyPoints: ["Underfitting vs Overfitting", "L1 Lasso vs L2 Ridge penalties", "Cross-validation tuning", "Model capacity control"],
  },
  {
    title: "Transformer Architecture & Self-Attention",
    question: "How does the Self-Attention mechanism in Transformer models calculate token relationships compared to RNNs?",
    industry: "Data & AI",
    role: "AI Engineer",
    difficulty: "Senior",
    skills: ["PyTorch", "Transformers", "LLMs", "Deep Learning"],
    category: "Technical",
    suggestedAnswer:
      "RNNs process sequences sequentially, creating computational bottlenecks and vanishing gradient issues over long sequences. Self-Attention computes pairwise Query-Key-Value matrix multiplications across ALL tokens in parallel: Attention(Q,K,V) = softmax(Q Kᵀ / √dₖ) V. This allows direct context capturing regardless of token distance.",
    keyPoints: ["Query, Key, Value vectors", "Parallel training scalability", "Positional encodings", "Scaled dot-product attention formula"],
  },

  // --- DEVOPS & CLOUD ---
  {
    title: "Docker Containerization vs Virtual Machines",
    question: "How do Docker containers differ from traditional Virtual Machines in terms of resource utilization and OS isolation?",
    industry: "DevOps & Cloud",
    role: "DevOps Engineer",
    difficulty: "Junior",
    skills: ["Docker", "Linux", "Containers", "Virtualization"],
    category: "Technical",
    suggestedAnswer:
      "VMs run a full guest Operating System with dedicated virtualized hardware managed by a Hypervisor. Docker containers share the host Linux kernel and isolate application processes using cgroups and namespaces, resulting in megabyte-sized images, sub-second startup times, and minimal memory overhead.",
    keyPoints: ["Shared host kernel", "Linux namespaces (PID, NET, IPC)", "cgroups resource limits", "Hypervisor vs Docker Daemon"],
  },
  {
    title: "Kubernetes Pod Lifecycle & Deployments",
    question: "Explain Rolling Updates and Canary Deployments in Kubernetes. How do Readiness and Liveness Probes prevent downtime?",
    industry: "DevOps & Cloud",
    role: "Site Reliability Engineer (SRE)",
    difficulty: "Senior",
    skills: ["Kubernetes", "CI/CD", "Docker", "Cloud Native"],
    category: "Technical",
    suggestedAnswer:
      "Rolling Updates replace old pods with new pods incrementally. Liveness Probes check if a pod container is running (restarts container if failed). Readiness Probes check if the pod is ready to accept incoming traffic; Kubernetes router stops sending traffic to pods failing readiness checks until they pass, guaranteeing zero-downtime rollouts.",
    keyPoints: ["Liveness vs Readiness probes", "maxSurge and maxUnavailable settings", "Traffic routing via K8s Services", "Automated rollback on failure"],
  },

  // --- CYBERSECURITY ---
  {
    title: "OWASP Top 10: Cross-Site Scripting (XSS)",
    question: "Explain the difference between Stored, Reflected, and DOM-based XSS attacks and how to mitigate them.",
    industry: "Cybersecurity",
    role: "Security Analyst",
    difficulty: "Mid",
    skills: ["Web Security", "OWASP", "XSS", "Penetration Testing"],
    category: "Technical",
    suggestedAnswer:
      "Stored XSS inserts malicious scripts permanently into a database (e.g. comment section). Reflected XSS reflects scripts off HTTP requests (e.g. query strings). DOM XSS occurs client-side in JS processing. Mitigations include strict HTML/context output encoding, Content Security Policy (CSP) headers, and HttpOnly cookie flags.",
    keyPoints: ["Stored vs Reflected vs DOM XSS", "Contextual output encoding", "Content Security Policy (CSP)", "HttpOnly cookies"],
  },

  // --- PRODUCT & DESIGN ---
  {
    title: "Prioritization Frameworks (RICE & Kano)",
    question: "How do you evaluate feature proposals using RICE (Reach, Impact, Confidence, Effort) scoring?",
    industry: "Product & Design",
    role: "Product Manager",
    difficulty: "Mid",
    skills: ["Product Management", "RICE Framework", "Roadmapping", "Agile"],
    category: "Problem Solving",
    suggestedAnswer:
      "RICE Score = (Reach × Impact × Confidence) / Effort. Reach is user count per timeframe; Impact is individual effect (0.5 to 3); Confidence is percentage certainty in data (50% to 100%); Effort is person-months required. High-scoring items maximize ROI and align roadmap trade-offs objectively.",
    keyPoints: ["RICE formula components", "Data-driven confidence factors", "Balancing quick wins vs strategic bets", "Stakeholder communication"],
  },

  // --- BUSINESS & FINANCE ---
  {
    title: "Discounted Cash Flow (DCF) Valuation",
    question: "Walk through the steps of building a DCF model to value a business.",
    industry: "Business & Finance",
    role: "Financial Analyst",
    difficulty: "Mid",
    skills: ["Financial Modeling", "Valuation", "DCF", "WACC"],
    category: "Technical",
    suggestedAnswer:
      "1. Forecast Unlevered Free Cash Flows (UFCF) over a 5-10 year projection period. 2. Calculate Weighted Average Cost of Capital (WACC) as discount rate. 3. Discount forecasted cash flows to Present Value (PV). 4. Calculate Terminal Value (Gordon Growth or Exit Multiple). 5. Sum PV of cash flows + PV of Terminal Value to obtain Enterprise Value.",
    keyPoints: ["Free Cash Flow calculation", "WACC formula", "Terminal Value approaches", "Enterprise Value to Equity Value bridge"],
  },

  // --- HR & TALENT ---
  {
    title: "Behavioral Interviewing & STAR Method",
    question: "How do you structure competency-based behavioral interview questions to evaluate team conflict resolution?",
    industry: "HR & Talent",
    role: "HR Specialist",
    difficulty: "Junior",
    skills: ["Behavioral Interviewing", "STAR Method", "Talent Acquisition", "Conflict Resolution"],
    category: "Behavioral",
    suggestedAnswer:
      "Use open-ended behavioral prompts targeting past actions: 'Tell me about a time you had a strong disagreement with a colleague.' Evaluate responses using the STAR method: Situation context, Task required, Specific Action taken, and Quantifiable Result/learning achieved.",
    keyPoints: ["Past behavior predicts future performance", "STAR framework breakdown", "Probing questions for authenticity", "Objective scoring rubric"],
  },
];

/**
 * Auto-seeds QuestionBank collection if empty.
 */
export const seedQuestionBankIfEmpty = async () => {
  try {
    const count = await QuestionBank.countDocuments();
    if (count === 0) {
      console.log("[QuestionBank Seed] Collection empty. Seeding initial industry question database...");
      await QuestionBank.insertMany(initialQuestionsData);
      console.log(`[QuestionBank Seed] Successfully seeded ${initialQuestionsData.length} industry questions.`);
    }
  } catch (error) {
    console.error("[QuestionBank Seed] Error seeding question bank:", error.message);
  }
};
