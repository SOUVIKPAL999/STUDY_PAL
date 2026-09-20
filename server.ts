import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

// Mode-specific system instructions designed for Semester 3 CSE (AI/ML/DS) students
const SYSTEM_PROMPTS: Record<string, string> = {
  'concept-explainer': `You are "AI Study Pal" in Concept Explainer mode, acting as an elite, patient university professor and mentor in Computer Science, Artificial Intelligence, and Data Science.
Your response MUST strictly adhere to this pedagogical structure:
1. **Plain-Language Intuition & Analogy**: Start with an intuitive, jargon-free real-world analogy to build immediate conceptual grasp.
2. **Core Academic Definitions**: Clearly define the essential technical terms, notation, and structural prerequisites.
3. **Rigorous Technical & Theoretical Explanation**: Provide in-depth technical mechanics, architecture, mathematical equations (using LaTeX formatting like $x$ or $$\\sum$$), and time/space complexity analysis where applicable.
4. **Concrete Technical Example**: Provide a clear, practical Computer Science example or short code snippet (Python, C++, Java, or pseudo-code).
5. **Concise Summary Recap**: 3-4 bullet points highlighting high-yield takeaways.
6. **Check Your Understanding**: Conclude with 1 thought-provoking review question with a brief hint.`,

  'code-debugger': `You are "AI Study Pal" in Code Debugger mode, an expert software architect and systems programmer.
You analyze student programming code with absolute precision.
Your response MUST strictly adhere to this structure:
1. **Bug Identification & Symptoms**: Pinpoint the precise bug, line location, and failure symptom (e.g. segmentation fault, off-by-one, race condition, gradient explosion).
2. **Root Cause Analysis**: Explain *why* the bug happens conceptually and in runtime memory/execution.
3. **Corrected Code**: Provide clean, idiomatic, fully corrected code with clear comments highlighting the changes.
4. **Assumptions & Runtime Constraints**: Explicitly state language standard (e.g. C++17, Python 3.10), environment assumptions, and library dependencies.
5. **Edge-Case Test Suite**: Provide 2-3 verification unit tests or edge-case input test examples to ensure regression prevention.
Never execute untrusted code or suggest hazardous actions.`,

  'math-solver': `You are "AI Study Pal" in Math Solver mode, an expert mathematician specializing in Discrete Mathematics, Linear Algebra, Multivariable Calculus, Probability, Statistics, and Optimization for AI/ML.
Your response MUST strictly adhere to this structure:
1. **Problem Restatement & Notation**: Clarify the givens, domain variables, and what needs to be proven or computed.
2. **Method & Theorem Selection**: State the relevant theorems, formulas, or algebraic identities to be used.
3. **Step-by-Step Analytical Derivation**: Show detailed mathematical steps using clean standard LaTeX notation (inline with $...$ and display equations with $$...$$). Do not skip non-trivial steps.
4. **Final Answer Display**: Highlight the final answer distinctly (e.g. \\mathbf{...} or bold text).
5. **Sanity Check & Verification**: Check units, dimension consistency, limits, signs, or boundary conditions.`,

  'exam-revision': `You are "AI Study Pal" in Exam Revision mode, a veteran university examiner for undergraduate CSE, AI, and Data Science subjects.
Your response MUST strictly adhere to this structure:
1. **High-Yield Syllabus Summary**: Crisp, high-retention summary of the core exam topic.
2. **Formula & Definition Cheat Sheet**: High-density bulleted cheat-sheet of critical definitions, formulas, and time/space complexities.
3. **Common Exam Traps & Pitfalls**: Top 3 classic tricky questions, misconceptions, or false assumptions students make in semester exams.
4. **Rapid-Fire Practice Questions**: 2-3 realistic exam-style questions with short model answers.
5. **60-Second Self-Quiz**: A quick question to test immediate retention.`,
};

// Internal Demo Knowledge Bank fallback for offline / demo mode
const DEMO_FALLBACKS: Record<string, string> = {
  'concept-explainer': `### 1. Intuition in Plain Language
Imagine you are in a large library looking for a specific theorem:
- **Query ($Q$)**: The research topic written on your notepad (e.g., *"gradient descent"*).
- **Key ($K$)**: The label printed on each book's spine.
- **Value ($V$)**: The actual chapter contents inside each book.

You compare your query card against every book's title to calculate an **attention score**, then blend the contents according to how relevant each book is.

---

### 2. Formal Mathematical Definition
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

Where:
- $Q, K \\in \\mathbb{R}^{n \\times d_k}$ and $V \\in \\mathbb{R}^{n \\times d_v}$
- $\\sqrt{d_k}$ is the scaling factor that prevents dot products from growing excessively large, which would cause the softmax gradient to vanish.

---

### 3. PyTorch Implementation Snippet
\`\`\`python
import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    weights = F.softmax(scores, dim=-1)
    return torch.matmul(weights, V), weights
\`\`\`

---

### 4. Summary Takeaways
- Enables $O(1)$ sequential path length between arbitrary tokens compared to $O(n)$ in RNNs.
- Foundation for Transformer architectures (BERT, GPT, Gemini).
- Self-attention computational complexity is $O(n^2 \\cdot d)$ where $n$ is sequence length.

---

### 💡 Check Your Understanding
*Question*: If the sequence length doubles from $512$ to $1024$, by what factor does the raw $QK^T$ attention matrix computation increase?`,

  'code-debugger': `### 🔍 Bug Identification & Cause
**Defect**: **Shallow Copy & Double Free** in manual resource management.
When an object is copied without a user-defined copy constructor, C++ performs a member-wise shallow copy of raw pointers. When both instances exit their scope, both destructors invoke \`delete[]\` on identical heap memory $\\rightarrow$ **Heap Corruption / SIGABRT**.

---

### 🛠️ Corrected Implementation (Rule of 3 / RAII)
\`\`\`cpp
#include <iostream>
#include <algorithm>

class DynamicBuffer {
    int* data_;
    std::size_t size_;
public:
    explicit DynamicBuffer(std::size_t size) 
        : size_(size), data_(new int[size]()) {}

    // Destructor
    ~DynamicBuffer() noexcept { delete[] data_; }

    // Deep Copy Constructor
    DynamicBuffer(const DynamicBuffer& other) 
        : size_(other.size_), data_(new int[other.size_]) {
        std::copy(other.data_, other.data_ + size_, data_);
    }

    // Copy Assignment Operator (Copy-and-Swap)
    DynamicBuffer& operator=(DynamicBuffer other) noexcept {
        std::swap(data_, other.data_);
        std::swap(size_, other.size_);
        return *this;
    }
};
\`\`\`

---

### 🧪 Edge-Case Verification Test
\`\`\`cpp
int main() {
    DynamicBuffer buf1(10);
    DynamicBuffer buf2 = buf1; // Verified deep copy
    std::cout << "Buffer safely copied without double-free errors!" << std::endl;
    return 0;
}
\`\`\``,

  'math-solver': `### 1. Problem Formulation & Restatement
Given a binary classification diagnostic test:
- Prevalence of condition $C$: $P(C) = 0.5\\% = 0.005$
- Prior probability of no condition $C^c$: $P(C^c) = 0.995$
- Sensitivity: $P(T^+ \\mid C) = 99\\% = 0.99$
- Specificity: $P(T^- \\mid C^c) = 95\\% = 0.95$ $\\implies P(T^+ \\mid C^c) = 0.05$

**Goal**: Compute the posterior probability $P(C \\mid T^+)$ that an individual testing positive truly has the condition.

---

### 2. Method: Bayes' Theorem with Total Probability
$$P(C \\mid T^+) = \\frac{P(T^+ \\mid C) P(C)}{P(T^+ \\mid C) P(C) + P(T^+ \\mid C^c) P(C^c)}$$

---

### 3. Step-by-Step Derivation
1. True positive joint numerator:
   $$0.99 \\times 0.005 = 0.00495$$
2. False positive joint term:
   $$0.05 \\times 0.995 = 0.04975$$
3. Total probability denominator:
   $$P(T^+) = 0.00495 + 0.04975 = 0.05470$$
4. Posterior probability:
   $$P(C \\mid T^+) = \\frac{0.00495}{0.05470} \\approx 0.09049$$

---

### 4. Final Answer
$$\\mathbf{P(C \\mid T^+) \\approx 9.05\\%}$$

*(Base Rate Fallacy: because the condition is rare, false positives vastly outnumber true positives).*`,

  'exam-revision': `### 📌 High-Yield Exam Revision: Operating System Deadlocks

A **Deadlock** is a state where processes are permanently blocked because each holds a resource while waiting for another resource held by another process.

---

### ⚡ The 4 Coffman Conditions (Must Hold Simultaneously)
1. **Mutual Exclusion**: Resource can only be held by one process at a time.
2. **Hold and Wait**: Process holds $\\ge 1$ resource and requests others.
3. **No Preemption**: Resources can only be released voluntarily by the holding process.
4. **Circular Wait**: A closed chain $\\{P_0, P_1, \\dots, P_n\\}$ where $P_i$ waits for $P_{i+1}$ and $P_n$ waits for $P_0$.

---

### ⚠️ Top 3 Exam Traps
1. **RAG Cycle Trap**: A cycle in a Resource Allocation Graph is **necessary and sufficient ONLY for single-instance resources**. For multi-instance resources, a cycle does NOT guarantee deadlock!
2. **Safe State vs Deadlock State**: An unsafe state is NOT necessarily deadlocked; it simply has the potential to deadlock under worst-case requests.
3. **Banker's Formula**: Always calculate $\\text{Need}[i] = \\text{Max}[i] - \\text{Allocation}[i]$.

---

### ⏱️ 60-Second Practice
*Question*: How does imposing a strict global numerical ordering on all resources ($R_1 < R_2 < \\dots < R_m$) prevent deadlock?
*Answer*: It mathematically prevents **Circular Wait**, because no process can request a lower-numbered resource while holding a higher-numbered one.`,
};

// 1. Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    ok: true,
    isDemo: !hasKey,
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    version: '1.0.0',
    academicTrack: 'Semester 3 CSE (AI/ML/DS)',
  });
});

// 2. Chat completion endpoint
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  try {
    const { query, mode = 'concept-explainer', messages = [] } = req.body;

    // Validation
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({
        ok: false,
        error: 'Query cannot be empty. Please provide a question or topic.',
      });
      return;
    }

    if (query.length > 12000) {
      res.status(400).json({
        ok: false,
        error: 'Query is too large (maximum 12,000 characters allowed).',
      });
      return;
    }

    const selectedMode = typeof mode === 'string' && SYSTEM_PROMPTS[mode] ? mode : 'concept-explainer';
    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');

    // Live AI branch via @google/genai SDK
    if (hasValidKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const systemInstruction = SYSTEM_PROMPTS[selectedMode];
        const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

        // Format recent messages for context
        const contextHistory = Array.isArray(messages)
          ? messages
              .slice(-6)
              .map((m: any) => `${m.role === 'user' ? 'Student' : 'AI Study Pal'}: ${m.content}`)
              .join('\n\n')
          : '';

        const fullPrompt = contextHistory
          ? `Recent Conversation Context:\n${contextHistory}\n\nCurrent Student Query:\n${query}`
          : query;

        const response = await ai.models.generateContent({
          model: modelName,
          contents: fullPrompt,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.3,
          },
        });

        const answerText = response.text || '';
        const durationMs = Date.now() - startTime;

        res.json({
          ok: true,
          answer: answerText,
          mode: selectedMode,
          isDemo: false,
          model: modelName,
          durationMs,
        });
        return;
      } catch (geminiError: any) {
        console.warn('[AI Study Pal] Live AI call failed, gracefully falling back to Demo Mode:', geminiError?.message);
        // Fallback to high-quality academic response rather than crashing
        const fallbackText = DEMO_FALLBACKS[selectedMode] || DEMO_FALLBACKS['concept-explainer'];
        const durationMs = Date.now() - startTime;
        res.json({
          ok: true,
          answer: fallbackText,
          mode: selectedMode,
          isDemo: true,
          model: 'demo-academic-engine (fallback)',
          durationMs,
        });
        return;
      }
    }

    // Demo Mode branch (when GEMINI_API_KEY is absent)
    const fallbackText = DEMO_FALLBACKS[selectedMode] || DEMO_FALLBACKS['concept-explainer'];
    const durationMs = Date.now() - startTime;

    res.json({
      ok: true,
      answer: fallbackText,
      mode: selectedMode,
      isDemo: true,
      model: 'demo-academic-engine',
      durationMs,
    });
  } catch (error: any) {
    console.error('[AI Study Pal] Server error in /api/chat:', error);
    res.status(500).json({
      ok: false,
      error: 'An internal error occurred while processing your study request. Please retry.',
    });
  }
});

// 3. Feedback endpoint
app.post('/api/feedback', (req: Request, res: Response) => {
  const { messageId, rating, feedback } = req.body;
  // Non-sensitive logging
  console.log(`[AI Study Pal] Student feedback received for message ${messageId}: Rating = ${rating}`);
  res.json({
    ok: true,
    message: 'Thank you for your feedback! It helps improve study recommendations.',
  });
});

async function startServer() {
  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Study Pal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
