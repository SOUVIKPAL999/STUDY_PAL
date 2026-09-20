import { StudyMode } from '../types';

export interface DemoEntry {
  keywords: string[];
  title: string;
  response: string;
}

export const DEMO_RESPONSES: Record<StudyMode, DemoEntry[]> = {
  'concept-explainer': [
    {
      keywords: ['attention', 'transformer', 'query', 'key', 'value', 'scaled dot'],
      title: 'Scaled Dot-Product Attention in Transformers',
      response: `### 1. Intuition in Plain Language
Imagine you are at a university library looking for research papers.
- **Query ($Q$)**: The research topic written on your index card (e.g., *"gradient descent optimization"*).
- **Key ($K$)**: The title label on each book spine on the library shelf.
- **Value ($V$)**: The actual chapter contents inside each book.

You compare your query card against every book's title to calculate how relevant each book is (the *attention score*). You then take a weighted combination of their contents based on those scores.

---

### 2. Formal Mathematical Definition
The Scaled Dot-Product Attention is formulated as:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

Where:
- $Q \\in \\mathbb{R}^{n \\times d_k}$ (queries for $n$ tokens)
- $K \\in \\mathbb{R}^{m \\times d_k}$ (keys for $m$ tokens)
- $V \\in \\mathbb{R}^{m \\times d_v}$ (values with dimension $d_v$)
- $\\sqrt{d_k}$ is the temperature scaling factor.

> **Why scale by $\\frac{1}{\\sqrt{d_k}}$?**
> For large values of $d_k$, the dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients (vanishing gradient problem). Dividing by $\\sqrt{d_k}$ stabilizes the variance to $1$.

---

### 3. Step-by-Step Matrix Computation (Python PyTorch snippet)
\`\`\`python
import torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    # Step 1: Compute raw similarity scores
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
    
    # Step 2: Apply optional causal mask (for autoregressive decoder)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
        
    # Step 3: Softmax probabilities along last dimension
    attention_weights = F.softmax(scores, dim=-1)
    
    # Step 4: Weighted sum of values
    output = torch.matmul(attention_weights, V)
    return output, attention_weights
\`\`\`

---

### 4. Summary & Key Takeaways
- **Self-Attention** allows words to interact with all other words in a sentence simultaneously ($O(n^2)$ complexity vs $O(n)$ sequential recurrence in RNNs).
- It enables direct long-range dependencies without information bottleneck.
- **Multi-Head Attention** projects queries, keys, and values $h$ times with different learned linear projections, allowing the model to jointly attend to information at different representation subspaces.

---

### 💡 Check Your Understanding
*Question*: If the sequence length $n = 512$ and projection dimension $d_k = 64$, what are the dimensions of the score matrix $QK^T$ before softmax?
*Hint*: Does it depend on $d_k$ or purely on sequence length?`,
    },
    {
      keywords: ['b-tree', 'b+ tree', 'indexing', 'dbms', 'database'],
      title: 'B-Tree vs B+ Tree Indexing in Relational Databases',
      response: `### 1. Intuition in Plain Language
Think of a dictionary:
- In a **B-Tree**, words and their full definitions are scattered across every page, from the top index tabs down to the leaf pages.
- In a **B+ Tree**, the internal pages contain *only page markers and guideposts*, while **all actual definitions reside on the bottom-most leaf level**, neatly linked with a ribbon so you can flip through consecutive words effortlessly.

---

### 2. Core Structural Differences

| Feature | B-Tree | B+ Tree |
| :--- | :--- | :--- |
| **Data Storage** | Keys and satellite record pointers stored in **both internal and leaf nodes** | Satellite records stored **exclusively in leaf nodes**; internal nodes contain keys only |
| **Leaf Node Linking**| Leaf nodes are independent | Leaf nodes are connected as a **doubly linked list** |
| **Range Queries** | Requires multi-level tree traversals (In-order traversal with disk seeks) | Extremely fast: locate start key in $O(\\log N)$, then sequentially scan linked leaves |
| **Node Capacity (Fan-out)**| Lower fan-out because records take up block space | **High fan-out**: internal nodes hold many more keys per disk block |
| **Height of Tree** | Typically taller for identical number of records | Shorter tree height $\\rightarrow$ fewer I/O disk seeks |

---

### 3. Why DBMS Engines (Postgres, MySQL InnoDB) Default to B+ Trees
Disk access is thousands of times slower than RAM. Since DBMS index blocks are matched to disk block sizes (typically 4KB to 16KB):
1. **Dramatically higher branching factor**: An internal B+ tree node storing only 8-byte keys and 8-byte pointers can hold roughly $1000+$ keys per block.
2. A B+ Tree with height $h=3$ can index over $1,000,000,000$ rows with at most **3 disk I/O reads**!
3. **Continuous Range Scans**: Queries like \`SELECT * FROM grades WHERE gpa BETWEEN 3.5 AND 4.0\` find $3.5$ in $O(\\log N)$ and then iterate pointers directly across disk pages without re-traversing internal tree nodes.

---

### 💡 Check Your Understanding
*Question*: Why is duplicate key storage present in B+ Trees (a key appears in an internal guide node and also in a leaf node), and why is this redundancy an acceptable trade-off?`,
    },
  ],
  'code-debugger': [
    {
      keywords: ['python', 'asyncio', 'race', 'counter', 'concurrency', 'lock'],
      title: 'Asyncio Concurrent Task Race Condition Fix',
      response: `### 🔍 Bug Identification & Diagnosis
**Defect**: Shared State Race Condition on global variable \`counter\`.
In Python's \`asyncio\`, cooperative multitasking yields control at every \`await\` expression. The statement:
\`\`\`python
temp = counter
await asyncio.sleep(0.0001)  # Context switch occurs here!
counter = temp + 1
\`\`\`
Causes all 10 worker coroutines to read the **stale value** of \`counter\` before any worker writes the updated value back. The updates are clobbered, resulting in a count far lower than $10,000$.

---

### 🛠️ Root Cause Explanation
Even though Python has the Global Interpreter Lock (GIL), \`asyncio\` switches tasks whenever an \`await\` point is encountered. Because reading \`temp = counter\` and writing \`counter = temp + 1\` is non-atomic across an \`await\` boundary, it creates a classic interleaving hazard.

---

### ✅ Corrected Code with \`asyncio.Lock\`
\`\`\`python
import asyncio

counter = 0
# Create a shared asyncio Lock
counter_lock = asyncio.Lock()

async def worker():
    global counter
    for _ in range(1000):
        # Acquire the lock to guarantee mutual exclusion
        async with counter_lock:
            temp = counter
            # Even if asynchronous I/O occurs, no other coroutine can enter
            await asyncio.sleep(0)  # Yielding safely inside critical section
            counter = temp + 1

async def main():
    global counter
    counter = 0
    # Run 10 concurrent workers
    await asyncio.gather(*(worker() for _ in range(10)))
    print("Final counter (Guaranteed):", counter)

if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

---

### 🧪 Edge-Case & Verification Test Suite
\`\`\`python
import pytest

@pytest.mark.asyncio
async def test_concurrent_counter():
    # Setup test runner with 50 concurrent tasks
    test_counter = 0
    lock = asyncio.Lock()
    
    async def task():
        nonlocal test_counter
        for _ in range(100):
            async with lock:
                test_counter += 1

    await asyncio.gather(*(task() for _ in range(50)))
    assert test_counter == 5000, f"Expected 5000, got {test_counter}"
\`\`\`

---

### 📌 Assumptions & Runtime Notes
- Requires Python 3.7+ with standard \`asyncio\`.
- If CPU-bound computation is involved instead of I/O, prefer \`multiprocessing\` with an IPC \`Value\` or \`Manager().Lock()\`.`,
    },
    {
      keywords: ['cpp', 'c++', 'pointer', 'destructor', 'double free', 'dangling'],
      title: 'C++ Dangling Pointer & Double Free Bug Resolution',
      response: `### 🔍 Bug Identification
**Defect**: **Violation of the Rule of Three / Five** causing a **Double Free** crash.
When \`DynamicArray b = a;\` executes, the compiler invokes the default **shallow copy constructor**, copying the raw pointer address \`data\`. When \`a\` and \`b\` go out of scope at the end of \`main()\`, both destructors call \`delete[] data\` on the exact same memory address.

---

### 🛠️ Root Cause
1. Shallow copy of raw pointer \`int* data\` means both \`a.data\` and \`b.data\` point to identical heap memory.
2. Destructor of \`b\` runs first and successfully deallocates the block.
3. Destructor of \`a\` runs second and attempts to free already-deallocated memory $\\rightarrow$ **SIGABRT / Heap Corruption**.

---

### ✅ Corrected Modern C++ Implementation (RAII & Rule of 5)
\`\`\`cpp
#include <iostream>
#include <utility>
#include <algorithm>

class DynamicArray {
private:
    int* data_;
    std::size_t size_;

public:
    // 1. Parameterized Constructor
    explicit DynamicArray(std::size_t size) 
        : size_(size), data_(size > 0 ? new int[size]() : nullptr) {}

    // 2. Destructor
    ~DynamicArray() noexcept {
        delete[] data_;
    }

    // 3. Deep Copy Constructor
    DynamicArray(const DynamicArray& other) 
        : size_(other.size_), data_(other.size_ > 0 ? new int[other.size_] : nullptr) {
        std::copy(other.data_, other.data_ + size_, data_);
    }

    // 4. Copy Assignment Operator (Copy-and-Swap idiom)
    DynamicArray& operator=(DynamicArray other) noexcept {
        swap(*this, other);
        return *this;
    }

    // 5. Move Constructor
    DynamicArray(DynamicArray&& other) noexcept 
        : data_(std::exchange(other.data_, nullptr)), size_(std::exchange(other.size_, 0)) {}

    friend void swap(DynamicArray& first, DynamicArray& second) noexcept {
        using std::swap;
        swap(first.data_, second.data_);
        swap(first.size_, second.size_);
    }

    void print() const {
        if (data_ && size_ > 0) std::cout << "First elem: " << data_[0] << std::endl;
    }
};

int main() {
    DynamicArray a(5);
    DynamicArray b = a; // Safe deep copy!
    b.print();
    return 0; // Exits cleanly with zero leaks or double frees
}
\`\`\`

> **Best Practice Recommendation**: In modern C++, prefer \`std::vector<int>\` or \`std::unique_ptr<int[]>\` to completely eliminate manual \`new\` and \`delete\` operations.`,
    },
  ],
  'math-solver': [
    {
      keywords: ['bayes', 'posterior', 'disease', 'probability', 'sensitivity', 'specificity'],
      title: 'Bayesian Posterior Probability Calculation',
      response: `### 1. Restatement of the Problem
We are given the following diagnostic parameters for a medical screening:
- **Prevalence of disease ($D$)**: $P(D) = 0.5\\% = 0.005$
- **Probability of no disease ($D^c$)**: $P(D^c) = 1 - 0.005 = 0.995$
- **Sensitivity ($T^+ \\mid D$)**: $P(T^+ \\mid D) = 99\\% = 0.99$
- **Specificity ($T^- \\mid D^c$)**: $P(T^- \\mid D^c) = 95\\% = 0.95$
- **False Positive Rate ($T^+ \\mid D^c$)**: $P(T^+ \\mid D^c) = 1 - 0.95 = 0.05$

**Goal**: Compute the posterior probability $P(D \\mid T^+)$ that a patient who tests positive actually has the disease.

---

### 2. Method Selection: Bayes' Theorem with Total Probability
Bayes' Theorem states:
$$P(D \\mid T^+) = \\frac{P(T^+ \\mid D) \\cdot P(D)}{P(T^+)}$$

By the Law of Total Probability:
$$P(T^+) = P(T^+ \\mid D) \\cdot P(D) + P(T^+ \\mid D^c) \\cdot P(D^c)$$

---

### 3. Step-by-Step Analytical Derivation

#### Step 3.1: Calculate the Numerator (True Positive Joint Probability)
$$\\text{Numerator} = P(T^+ \\mid D) \\cdot P(D) = 0.99 \\times 0.005 = 0.00495$$

#### Step 3.2: Calculate the Denominator (Total Probability of Testing Positive)
$$\\text{False Positive Joint} = P(T^+ \\mid D^c) \\cdot P(D^c) = 0.05 \\times 0.995 = 0.04975$$

$$P(T^+) = 0.00495 + 0.04975 = 0.05470$$

#### Step 3.3: Calculate the Posterior Probability
$$P(D \\mid T^+) = \\frac{0.00495}{0.05470} \\approx 0.0904936$$

---

### 4. Final Answer & Academic Interpretation
$$\\mathbf{P(D \\mid T^+) \\approx 9.05\\%}$$

> **Key Insight (The Base Rate Fallacy)**:
> Even with a high 99% test sensitivity, a person testing positive only has about a **9% chance** of actually having the disease! This happens because the condition is rare ($0.5\\%$ base rate), so the absolute number of false positives ($4.98\\%$) vastly outnumbers the true positives ($0.495\\%$).`,
    },
    {
      keywords: ['backprop', 'gradient', 'derivation', 'matrix', 'sigmoid', 'loss'],
      title: 'Matrix Gradient Derivation for Backpropagation',
      response: `### 1. Problem Formulation
Consider a single dense neural network layer with:
- Input vector: $x \\in \\mathbb{R}^{d}$
- Weight matrix: $W \\in \\mathbb{R}^{m \\times d}$, bias vector $b \\in \\mathbb{R}^{m}$
- Pre-activation linear output: $z = Wx + b \\in \\mathbb{R}^{m}$
- Activation function: $\\hat{y} = \\sigma(z)$ where $\\sigma(u) = \\frac{1}{1 + e^{-u}}$ (element-wise sigmoid)
- Target label: $y \\in \\mathbb{R}^{m}$
- Loss function (MSE): $\\mathcal{L} = \\frac{1}{2} \\|\\hat{y} - y\\|^2 = \\frac{1}{2} \\sum_{i=1}^m (\\hat{y}_i - y_i)^2$

**Goal**: Derive the gradient $\\frac{\\partial \\mathcal{L}}{\\partial W}$ and $\\frac{\\partial \\mathcal{L}}{\\partial x}$.

---

### 2. Multivariate Chain Rule Steps

#### Step 1: Derivative of Loss w.r.t Activation $\\hat{y}$
$$\\frac{\\partial \\mathcal{L}}{\\partial \\hat{y}} = (\\hat{y} - y)$$

#### Step 2: Derivative of Sigmoid w.r.t Pre-activation $z$
Recall that $\\frac{d\\sigma(z_i)}{dz_i} = \\sigma(z_i)(1 - \\sigma(z_i)) = \\hat{y}_i(1 - \\hat{y}_i)$.
Using Hadamard (element-wise) product $\\odot$:
$$\\delta = \\frac{\\partial \\mathcal{L}}{\\partial z} = (\\hat{y} - y) \\odot \\hat{y} \\odot (1 - \\hat{y}) \\in \\mathbb{R}^{m}$$

#### Step 3: Gradient with respect to Weight Matrix $W$
Since $z_i = \\sum_{j=1}^d W_{ij} x_j + b_i$, we have:
$$\\frac{\\partial z_i}{\\partial W_{ij}} = x_j$$

Applying the chain rule:
$$\\frac{\\partial \\mathcal{L}}{\\partial W_{ij}} = \\frac{\\partial \\mathcal{L}}{\\partial z_i} \\frac{\\partial z_i}{\\partial W_{ij}} = \\delta_i x_j$$

Expressing in outer product matrix form:
$$\\mathbf{\\frac{\\partial \\mathcal{L}}{\\partial W} = \\delta x^T = \\Big((\\hat{y} - y) \\odot \\sigma'(z)\\Big) x^T \\in \\mathbb{R}^{m \\times d}}$$

#### Step 4: Gradient with respect to Input $x$ (for multi-layer chaining)
$$\\mathbf{\\frac{\\partial \\mathcal{L}}{\\partial x} = W^T \\delta \\in \\mathbb{R}^{d}}$$

---

### 3. Dimensional Verification Check
- $\\delta$ is $m \\times 1$
- $x^T$ is $1 \\times d$
- $\\delta x^T$ is $m \\times d$, which matches dimensions of $W$. Dimension consistency confirmed! ✅`,
    },
  ],
  'exam-revision': [
    {
      keywords: ['deadlock', 'coffman', 'operating system', 'os', 'banker'],
      title: 'Exam Revision Sheet: OS Deadlocks & Prevention',
      response: `### 📌 High-Yield Topic Summary: Operating System Deadlocks

A **Deadlock** is a state where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process.

---

### ⚡ The 4 Coffman Conditions (Simultaneous Requirement)
*All four must hold simultaneously for a deadlock to exist:*
1. **Mutual Exclusion**: At least one non-shareable resource held by a process.
2. **Hold and Wait**: Process holding $\\ge 1$ resource is waiting to acquire additional resources held by other processes.
3. **No Preemption**: Resources cannot be forcibly revoked from a process; they can only be released voluntarily.
4. **Circular Wait**: A closed chain of processes $\\{P_0, P_1, \\dots, P_n\\}$ exists such that $P_i$ waits for $P_{i+1}$ and $P_n$ waits for $P_0$.

---

### 🛡️ Strategies for Deadlock Handling

| Method | Approach | Cost / Real-world Usage |
| :--- | :--- | :--- |
| **Deadlock Prevention** | Invalidate at least one of the 4 Coffman conditions | High resource under-utilization (e.g., impose global resource ordering to break Circular Wait) |
| **Deadlock Avoidance** | Dynamically check system state before grant (**Banker's Algorithm**) | Requires *a priori* knowledge of maximum resource claim; high runtime overhead |
| **Detection & Recovery** | Allow deadlock to occur, periodically detect cycle in Wait-For Graph, terminate processes or preempt resources | Used in DBMS transactions; abort victim process |
| **Ostrich Algorithm** | Stick head in sand: ignore the problem if deadlocks are rare | **Default for Unix/Windows/Linux** (user terminates hung process) |

---

### ⚠️ Top 3 Exam Traps & Pitfalls
1. **Cycle in Resource Allocation Graph (RAG)**:
   - If *single instance* per resource type: Cycle $\\iff$ Deadlock (Necessary AND Sufficient).
   - If *multiple instances* per resource type: Cycle is **Necessary but NOT Sufficient** (cycle can exist without deadlock!).
2. **Safe State vs Deadlock State**:
   - Every deadlock state is unsafe.
   - **NOT every unsafe state is deadlocked!** An unsafe state merely *may* lead to deadlock if worst-case claims occur.
3. **Banker's Formula Check**: Always remember the matrix relation:
   $$\\text{Need}[i][j] = \\text{Max}[i][j] - \\text{Allocation}[i][j]$$

---

### ⏱️ 60-Second Self-Test Practice
*Question*: System has 12 tape drives and 3 processes ($P_0, P_1, P_2$).
- $P_0$: Max 10, Allocated 5
- $P_1$: Max 4, Allocated 2
- $P_2$: Max 9, Allocated 2

*Task*: Is the current system state Safe? What is a valid safe execution sequence?
*Answer*: Available $= 12 - (5 + 2 + 2) = 3$.
- $P_1$ Needs $4 - 2 = 2 \\le 3$. $P_1$ finishes, releasing $2 \\rightarrow$ Available $= 3 + 2 = 5$.
- $P_0$ Needs $10 - 5 = 5 \\le 5$. $P_0$ finishes, releasing $5 \\rightarrow$ Available $= 5 + 5 = 10$.
- $P_2$ Needs $9 - 2 = 7 \\le 10$. $P_2$ finishes.
Safe sequence exists: $\\mathbf{\\langle P_1, P_0, P_2 \\rangle}$. The state is **SAFE**!`,
    },
    {
      keywords: ['normalization', 'dbms', '1nf', '2nf', '3nf', 'bcnf', 'dependency'],
      title: 'Exam Revision Sheet: DBMS Normalization (1NF to BCNF)',
      response: `### 📌 High-Yield Topic Summary: Relational Database Normalization

Normalization decomposes relations with anomalies (insertion, deletion, update) into smaller, well-structured relations with minimal redundancy while preserving dependencies and lossless join.

---

### 🎯 Quick Decision Hierarchy (Highest Normal Form Test)

1. **1NF (First Normal Form)**:
   - All attribute values must be **atomic** (no multi-valued or composite attributes).
   - Each record must be uniquely identifiable.

2. **2NF (Second Normal Form)**:
   - Must be in **1NF**.
   - **No Partial Dependency**: No non-prime attribute should depend on a proper subset of any candidate key.
   - *Exam Rule*: If all candidate keys consist of a single attribute, the relation is automatically in 2NF!

3. **3NF (Third Normal Form)**:
   - Must be in **2NF**.
   - **No Transitive Dependency**: For every non-trivial FD $X \\to A$:
     - Either $X$ is a **Super Key**, OR
     - $A$ is a **Prime Attribute** (part of some candidate key).

4. **BCNF (Boyce-Codd Normal Form)**:
   - Strictly stronger than 3NF.
   - For every non-trivial FD $X \\to A$:
     - $X$ **MUST be a Super Key** (no exceptions for prime attributes).

---

### ⚖️ Comparison Matrix

| Property | 3NF | BCNF |
| :--- | :--- | :--- |
| **Eliminates Redundancy** | Good | Maximum |
| **Lossless Join Guaranteed** | Yes | Yes |
| **Dependency Preserving** | **Always Guaranteed** | **Not Always Possible** |

---

### ⏱️ Rapid Fire Practice
*Given*: Relation $R(A, B, C, D)$ with FDs:
$$AB \\to C, \\quad C \\to D, \\quad D \\to A$$
1. Candidate Keys: $(AB)^+ = \\{A, B, C, D\\}$, $(CB)^+ = \\{C, D, A, B\\}$, $(DB)^+ = \\{D, A, B, C\\}$. Candidate keys are $\\mathbf{AB, BC, BD}$.
2. Prime attributes: $A, B, C, D$ (all attributes are prime!).
3. Since every right-hand side attribute is a Prime Attribute, condition for **3NF** holds for all FDs.
4. For $C \\to D$, $C$ is NOT a super key $\\rightarrow$ Fails BCNF.
5. **Highest Normal Form: 3NF**!`,
    },
  ],
};

export function getDemoResponse(mode: StudyMode, query: string): { title: string; answer: string } {
  const modePool = DEMO_RESPONSES[mode] || DEMO_RESPONSES['concept-explainer'];
  const lowerQuery = query.toLowerCase();

  // Try keyword match
  for (const entry of modePool) {
    if (entry.keywords.some((kw) => lowerQuery.includes(kw))) {
      return { title: entry.title, answer: entry.response };
    }
  }

  // If no direct keyword match in this mode, pick the first entry of the requested mode
  if (modePool.length > 0) {
    return { title: modePool[0].title, answer: modePool[0].response };
  }

  // Fallback
  return {
    title: 'Academic Explanation',
    answer: `### Academic Solution & Guided Explanation\n\nHere is an analysis of your query regarding: **"${query}"**\n\n1. **Theoretical Formulation**: In engineering and computing curricula, this concept rests on structured mathematical foundations.\n2. **Analysis**: Breaking down the input reveals modular sub-problems.\n3. **Practical Application**: In industry software systems, robust error boundaries and invariant assertions safeguard against runtime failures.\n\n*Demo response generated by AI Study Pal offline knowledge bank.*`,
  };
}
