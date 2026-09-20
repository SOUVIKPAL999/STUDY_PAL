import { StudyMode, StudyModeConfig } from '../types';

export const STUDY_MODE_KEYS: StudyMode[] = [
  'concept-explainer',
  'code-debugger',
  'math-solver',
  'exam-revision',
];

export const STUDY_MODES: Record<StudyMode, StudyModeConfig> = {
  'concept-explainer': {
    id: 'concept-explainer',
    name: 'Concept Explainer',
    tagline: 'Deep academic understanding with analogies & rigour',
    description: 'Breaks down complex CSE & AI/DS theoretical concepts from first principles into intuitive, structured knowledge.',
    placeholder: 'Ask me to explain a difficult concept (e.g. Transformer Self-Attention, B-Trees, Dynamic Programming)...',
    icon: 'BookOpen',
    badgeColor: 'from-blue-500 to-indigo-600',
    suggestedPrompts: [
      {
        title: 'Transformer Attention Mechanism',
        prompt: 'Explain the Scaled Dot-Product Attention mechanism in Transformers with the Query, Key, and Value matrices analogy.',
        subject: 'Deep Learning',
      },
      {
        title: 'B-Tree vs B+ Tree Indexing',
        prompt: 'What is the structural difference between B-Trees and B+ Trees, and why do relational databases prefer B+ Trees for range queries?',
        subject: 'DBMS',
      },
      {
        title: 'Paxos vs Raft Consensus',
        prompt: 'Explain how distributed consensus works in Raft vs Paxos, specifically leader election and log replication safety.',
        subject: 'Distributed Systems',
      },
      {
        title: 'Dynamic Programming Subproblems',
        prompt: 'How do you identify optimal substructure and overlapping subproblems in dynamic programming problems like 0/1 Knapsack?',
        subject: 'Algorithms',
      },
    ],
  },
  'code-debugger': {
    id: 'code-debugger',
    name: 'Code Debugger',
    tagline: 'Root-cause analysis, bug fixes & edge-case test suites',
    description: 'Pinpoints software defects, memory leaks, concurrency issues, and algorithm bottlenecks with clean corrected code.',
    placeholder: 'Paste code and describe the problem (e.g. segmentation fault, off-by-one, race condition)...',
    icon: 'Bug',
    badgeColor: 'from-emerald-500 to-teal-600',
    suggestedPrompts: [
      {
        title: 'Python Asyncio Race Condition',
        prompt: `Debug this Python concurrent task code that loses counter updates:
\`\`\`python
import asyncio

counter = 0

async def worker():
    global counter
    for _ in range(1000):
        temp = counter
        await asyncio.sleep(0.0001)
        counter = temp + 1

async def main():
    await asyncio.gather(*(worker() for _ in range(10)))
    print("Final counter:", counter)

asyncio.run(main())
\`\`\`
Why is the final count less than 10000 and how to fix it properly?`,
        subject: 'Python / Concurrency',
      },
      {
        title: 'C++ Dangling Pointer & Double Free',
        prompt: `Find the undefined behavior in this custom vector implementation:
\`\`\`cpp
#include <iostream>

class DynamicArray {
    int* data;
    int size;
public:
    DynamicArray(int s) : size(s), data(new int[s]) {}
    ~DynamicArray() { delete[] data; }
    void print() { std::cout << data[0] << std::endl; }
};

int main() {
    DynamicArray a(5);
    DynamicArray b = a;
    b.print();
    return 0;
}
\`\`\`
Why does it crash on exit and how do we apply the Rule of 5?`,
        subject: 'C++ Systems',
      },
      {
        title: 'PyTorch Gradient Vanishing / None',
        prompt: `My PyTorch model outputs NaN losses during training loop:
\`\`\`python
for epoch in range(10):
    for x, y in dataloader:
        optimizer.zero_grad()
        out = model(x)
        loss = criterion(out, y)
        loss.backward()
        # Missing clipping / detachment logic
        optimizer.step()
\`\`\`
Can you analyze why gradients might explode or vanish and provide a hardened training step?`,
        subject: 'PyTorch / ML',
      },
    ],
  },
  'math-solver': {
    id: 'math-solver',
    name: 'Math Solver',
    tagline: 'Formal mathematical derivations with LaTeX clarity',
    description: 'Solves linear algebra, multivariable calculus, probability, statistics, and discrete math problems step by step.',
    placeholder: 'Enter a mathematical problem (e.g. Eigenvalue decomposition, Bayes theorem, Gradient descent step)...',
    icon: 'Sigma',
    badgeColor: 'from-amber-500 to-orange-600',
    suggestedPrompts: [
      {
        title: 'Backprop Gradient Derivation',
        prompt: 'Derive the gradient of Mean Squared Error loss with respect to weight matrix $W$ in a single hidden layer MLP with sigmoid activation: $L = \\frac{1}{2} ||y - \\sigma(Wx + b)||^2$. Show matrix calculus steps.',
        subject: 'ML Math',
      },
      {
        title: 'Bayesian Posterior Calculation',
        prompt: 'A diagnostic test for a rare disease has 99% sensitivity and 95% specificity. The disease prevalence in population is 0.5%. If a random student tests positive, compute the posterior probability that they actually have the disease using Bayes Theorem.',
        subject: 'Probability',
      },
      {
        title: 'Eigenvalue & PCA Projection',
        prompt: 'Given covariance matrix $\\Sigma = \\begin{pmatrix} 4 & 2 \\\\ 2 & 1 \\end{pmatrix}$, compute the eigenvalues and normalized eigenvectors. State which principal component captures maximum variance.',
        subject: 'Linear Algebra',
      },
      {
        title: 'Recurrence Relation using Master Theorem',
        prompt: 'Solve the recurrence $T(n) = 3T(n/2) + n \\log n$ using the Master Theorem or Akra-Bazzi method, and derive the tight asymptotic bound $\\Theta(g(n))$.',
        subject: 'Discrete Math',
      },
    ],
  },
  'exam-revision': {
    id: 'exam-revision',
    name: 'Exam Revision',
    tagline: 'High-yield cheat sheets, flash practice & common traps',
    description: 'Compresses semester syllabus into high-yield summaries, formula cheat sheets, common exam pitfalls, and self-quizzes.',
    placeholder: 'Enter a topic to revise (e.g. Operating Systems Deadlocks, Convolutional Neural Networks, SQL Normalization)...',
    icon: 'GraduationCap',
    badgeColor: 'from-purple-500 to-pink-600',
    suggestedPrompts: [
      {
        title: 'Deadlocks & Coffman Conditions',
        prompt: 'Create an exam revision crash sheet for Operating System Deadlocks: 4 Coffman conditions, Resource Allocation Graph cycles, Banker\'s Algorithm safety check, and 3 frequent exam traps.',
        subject: 'Operating Systems',
      },
      {
        title: 'Relational Database Normalization',
        prompt: 'Generate an Exam Revision guide for 1NF, 2NF, 3NF, and BCNF. Provide practical checklist rules to determine the highest normal form and how to eliminate partial vs transitive dependencies.',
        subject: 'DBMS',
      },
      {
        title: 'CNN Architectures & Calculations',
        prompt: 'Provide a revision summary of Convolutional Neural Networks: convolution output dimension formula $(W - F + 2P)/S + 1$, receptive field growth, vanishing gradients in deep nets, and pooling trade-offs.',
        subject: 'Computer Vision',
      },
      {
        title: 'Sorting Algorithms Complexities',
        prompt: 'High-yield exam comparison table: QuickSort, MergeSort, HeapSort, and TimSort. Detail best/average/worst time, auxiliary space, stability, and typical exam tricky scenarios.',
        subject: 'Data Structures',
      },
    ],
  },
};
