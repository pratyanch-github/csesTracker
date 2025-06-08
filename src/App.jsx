import React, { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  writeBatch,
  query,
  getDocs,
} from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- Helper Functions & Data ---

// Initial CSES problem data to seed the database
const csesProblemSet = [
  {
    topic: "Introductory Problems",
    questions: [
      {
        id: "cses_1068",
        name: "Weird Algorithm",
        difficulty: "Easy",
        link: "https://cses.fi/problemset/task/1068",
        approaches: [
          {
            title: "Simulation Approach",
            strategy:
              "The problem asks us to simulate a simple algorithm. If n is even, divide it by 2. If n is odd, multiply by 3 and add 1. Repeat until n is 1. We need to print the sequence of numbers. A `while` loop is perfect for this. We must use a 64-bit integer type (long long in C++) to avoid overflow, as the intermediate values can exceed the capacity of a 32-bit integer.",
            code: `
#include <iostream>

int main() {
    long long n;
    std::cin >> n;
    while (true) {
        std::cout << n << " ";
        if (n == 1) break;
        if (n % 2 == 0) {
            n /= 2;
        } else {
            n = n * 3 + 1;
        }
    }
    std::cout << std::endl;
    return 0;
}`,
          },
        ],
      },
      {
        id: "cses_1083",
        name: "Missing Number",
        difficulty: "Easy",
        link: "https://cses.fi/problemset/task/1083",
        approaches: [
          {
            title: "Summation Formula",
            strategy:
              "We are given n-1 numbers from 1 to n. The most efficient way to find the missing number is to calculate the expected sum of numbers from 1 to n using the formula S = n * (n+1) / 2. Then, we sum the numbers we are given. The difference between the expected sum and the actual sum is the missing number.",
            code: `
#include <iostream>

int main() {
    long long n;
    std::cin >> n;
    long long expected_sum = n * (n + 1) / 2;
    long long actual_sum = 0;
    for (int i = 0; i < n - 1; ++i) {
        int a;
        std::cin >> a;
        actual_sum += a;
    }
    std::cout << expected_sum - actual_sum << std::endl;
    return 0;
}`,
          },
          {
            title: "XOR Approach",
            strategy:
              "A clever alternative is to use the XOR bitwise operator. The XOR of a number with itself is 0. If we XOR all numbers from 1 to n, and then XOR this result with all the given numbers, all pairs will cancel out, leaving only the missing number.",
            code: `
#include <iostream>

int main() {
    long long n;
    std::cin >> n;
    int xor_sum = 0;
    for (int i = 1; i <= n; ++i) {
        xor_sum ^= i;
    }
    for (int i = 0; i < n - 1; ++i) {
        int a;
        std::cin >> a;
        xor_sum ^= a;
    }
    std::cout << xor_sum << std::endl;
    return 0;
}`,
          },
        ],
      },
    ],
  },
  {
    topic: "Sorting and Searching",
    questions: [
      {
        id: "cses_1621",
        name: "Distinct Numbers",
        difficulty: "Easy",
        link: "https://cses.fi/problemset/task/1621",
        approaches: [
          {
            title: "Using a Set",
            strategy:
              "The problem asks for the number of distinct values in a list. The most direct way to solve this in C++ is to use `std::set`. A set is a container that stores unique elements. We can simply insert all numbers from the input into the set, and the size of the set at the end will be our answer.",
            code: `
#include <iostream>
#include <set>

int main() {
    int n;
    std::cin >> n;
    std::set<int> distinct_numbers;
    for (int i = 0; i < n; ++i) {
        int x;
        std::cin >> x;
        distinct_numbers.insert(x);
    }
    std::cout << distinct_numbers.size() << std::endl;
    return 0;
}`,
          },
          {
            title: "Sorting and Counting",
            strategy:
              "An alternative approach without using a set is to first sort the array. After sorting, all identical elements will be adjacent. We can then iterate through the sorted array and count the number of unique elements by comparing adjacent elements.",
            code: `
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    int n;
    std::cin >> n;
    std::vector<int> numbers(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> numbers[i];
    }
    std::sort(numbers.begin(), numbers.end());
    int count = 1;
    if (n == 0) count = 0;
    for (int i = 1; i < n; ++i) {
        if (numbers[i] != numbers[i-1]) {
            count++;
        }
    }
    std::cout << count << std::endl;
    return 0;
}`,
          },
        ],
      },
      {
        id: "cses_1091",
        name: "Concert Tickets",
        difficulty: "Medium",
        link: "https://cses.fi/problemset/task/1091",
        approaches: [
          {
            title: "Using Multiset",
            strategy:
              "The problem requires finding a ticket with price at most `p` for each customer. A `std::multiset` is a perfect data structure. It keeps elements sorted and allows duplicates. For each customer, we use `upper_bound(p)` to find the first ticket price strictly greater than `p`. If we go back one position from there, we find the best available ticket (the most expensive one that is still at most `p`). If such a ticket exists, we assign it to the customer and remove it from the multiset.",
            code: `
#include <iostream>
#include <set>
#include <vector>

int main() {
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);
    int n, m;
    std::cin >> n >> m;
    std::multiset<int> tickets;
    for (int i = 0; i < n; ++i) {
        int h;
        std::cin >> h;
        tickets.insert(h);
    }
    for (int i = 0; i < m; ++i) {
        int p;
        std::cin >> p;
        auto it = tickets.upper_bound(p);
        if (it == tickets.begin()) {
            std::cout << -1 << "\\n";
        } else {
            --it;
            std::cout << *it << "\\n";
            tickets.erase(it);
        }
    }
    return 0;
}`,
          },
        ],
      },
    ],
  },
];

// --- SVG Icons ---
const icons = {
  dashboard: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20V16" />
    </svg>
  ),
  list: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  ),
  check: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  clock: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  todo: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3 10h18" />
    </svg>
  ),
  link: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" />
    </svg>
  ),
  copy: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  ),
  user: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  sparkles: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.69l.34 2.37L15 6.34l-2.37.34L11.31 9l.34-2.37-2.37-.34.34-2.37zM21.66 10l-2.37.34L18 13l.34 2.37L21 16l-2.37.34L18 19l.34 2.37L21 22l-2.37-.34L16 21.31l.34-2.37L14 18l2.37-.34.34-2.37.34 2.37L19 16l-2.37-.34L16 13.31l.34-2.37L14 10l2.37.34.34 2.37.34-2.37L19 10zM2.34 10l2.37.34L6 13l-.34 2.37L3 16l2.37.34L6 19l-.34 2.37L3 22l2.37-.34L8 21.31l-.34-2.37L10 18l-2.37-.34L7.31 16l-.34-2.37L10 13l-2.37-.34L7.31 10l-.34-2.37L10 6l-2.37.34L7.31 4l-.34-2.37L3 2l2.37.34L8 4.69l-.34 2.37L10 8l-2.37-.34z" />
    </svg>
  ),
  close: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
};

// --- Firebase Initialization ---
let db, auth;
const appId = typeof __app_id !== "undefined" ? __app_id : "dsa-tracker-app";
if (typeof __firebase_config !== "undefined") {
  try {
    const firebaseConfig = JSON.parse(__firebase_config);
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (e) {
    console.error("Error initializing Firebase:", e);
  }
} else {
  console.error("Firebase config is not available.");
}

// --- Gemini API Call ---
const callGemini = async (prompt) => {
  const apiKey = ""; // Keep this empty, it will be handled by the environment
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const result = await response.json();

    if (
      result.candidates &&
      result.candidates.length > 0 &&
      result.candidates[0].content &&
      result.candidates[0].content.parts &&
      result.candidates[0].content.parts.length > 0
    ) {
      return result.candidates[0].content.parts[0].text;
    } else {
      console.error("Unexpected response structure:", result);
      if (result.promptFeedback) {
        return `Error: The model blocked the response. Reason: ${result.promptFeedback.blockReason}.`;
      }
      return "Error: Could not get a response from the AI. The response format was unexpected.";
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return `An error occurred: ${error.message}. Please check the console for more details.`;
  }
};

// --- React Components ---

const AIResponseModal = ({ title, content, onClose, isLoading }) => {
  if (!isLoading && !content) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 inline-flex items-center gap-2">
            {React.cloneElement(icons.sparkles, {
              className: "w-6 h-6 text-indigo-500",
            })}{" "}
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            {React.cloneElement(icons.close, {
              className: "w-6 h-6 text-gray-600",
            })}
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">
                Your AI assistant is thinking...
              </p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap font-sans">
              {content}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 text-right">
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusStyles = {
    Solved: "bg-green-100 text-green-800 ring-green-600/20",
    Attempting: "bg-yellow-100 text-yellow-800 ring-yellow-600/20",
    "To-Do": "bg-gray-100 text-gray-600 ring-gray-500/10",
  };
  const statusIcons = {
    Solved: icons.check,
    Attempting: icons.clock,
    "To-Do": icons.todo,
  };
  return (
    <span
      className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
        statusStyles[status] || statusStyles["To-Do"]
      }`}
    >
      {React.cloneElement(statusIcons[status] || statusIcons["To-Do"], {
        className: "h-3 w-3",
      })}
      {status}
    </span>
  );
};

const Dashboard = ({ allProblems, userProgress }) => {
  const [stats, setStats] = useState({
    solved: 0,
    attempting: 0,
    todo: 0,
    total: 0,
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const total = allProblems.reduce(
      (sum, topic) => sum + topic.questions.length,
      0
    );
    const solved = Object.values(userProgress).filter(
      (p) => p.status === "Solved"
    ).length;
    const attempting = Object.values(userProgress).filter(
      (p) => p.status === "Attempting"
    ).length;
    const todo = total - solved - attempting;
    setStats({ solved, attempting, todo, total });

    // Process data for consistency chart (last 7 days)
    const solvedByDate = {};
    Object.values(userProgress)
      .filter((p) => p.status === "Solved" && p.solvedAt)
      .forEach((p) => {
        const date = new Date(p.solvedAt.seconds * 1000)
          .toISOString()
          .split("T")[0];
        solvedByDate[date] = (solvedByDate[date] || 0) + 1;
      });

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      last7Days.push({
        name: dayName,
        solved: solvedByDate[dateStr] || 0,
      });
    }
    setChartData(last7Days);
  }, [allProblems, userProgress]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-semibold text-gray-500">Solved</h3>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {stats.solved} / {stats.total}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-semibold text-gray-500">Attempting</h3>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {stats.attempting}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-semibold text-gray-500">To-Do</h3>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {stats.todo}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Weekly Consistency
        </h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis allowDecimals={false} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.75rem",
                }}
              />
              <Legend />
              <Bar
                dataKey="solved"
                fill="#22c55e"
                name="Questions Solved"
                barSize={30}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const TopicView = ({ topic, onSelectQuestion, userProgress }) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">
        {topic.topic}
      </h1>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <ul role="list" className="divide-y divide-gray-200">
          {topic.questions.map((q) => (
            <li
              key={q.id}
              onClick={() => onSelectQuestion(q)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {q.name}
                  </p>
                  <p className="text-sm text-gray-500">{q.difficulty}</p>
                </div>
                <StatusBadge status={userProgress[q.id]?.status || "To-Do"} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const QuestionDetailView = ({
  question,
  onBack,
  userProgress,
  onStatusChange,
  userId,
}) => {
  const [copied, setCopied] = useState(null);
  const [aiResponse, setAiResponse] = useState("");
  const [aiResponseTitle, setAiResponseTitle] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleCopy = (code, index) => {
    const textArea = document.createElement("textarea");
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      setCopied(index);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
    document.body.removeChild(textArea);
  };

  const handleSetReminder = () => {
    const title = encodeURIComponent(`Solve: ${question.name}`);
    const details = encodeURIComponent(
      `Time to practice a DSA problem!\nProblem Link: ${question.link}`
    );
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
    window.open(googleCalendarUrl, "_blank");
  };

  const handleGetHint = async () => {
    setAiResponseTitle("AI Generated Hint");
    setIsAiLoading(true);
    setAiResponse("");
    const prompt = `I'm a programmer trying to solve the coding problem "${question.name}". Give me a high-level hint to get started. Do not give me the code. Just give one or two sentences to point me in the right direction.`;
    const response = await callGemini(prompt);
    setAiResponse(response);
    setIsAiLoading(false);
  };

  const handleExplainCode = async (code, title) => {
    setAiResponseTitle(`Explanation for: ${title}`);
    setIsAiLoading(true);
    setAiResponse("");
    const prompt = `I'm a programmer learning C++. Please explain the following code for the problem "${question.name}" in a clear, line-by-line format. Explain the purpose of key variables and logic blocks.\n\n\`\`\`cpp\n${code}\n\`\`\``;
    const response = await callGemini(prompt);
    setAiResponse(response);
    setIsAiLoading(false);
  };

  const handleSuggestApproach = async () => {
    setAiResponseTitle("Suggested Alternative Approach");
    setIsAiLoading(true);
    setAiResponse("");
    const existingApproaches = question.approaches
      .map((a) => a.title)
      .join(", ");
    const prompt = `For the coding problem "${question.name}", the current known approaches are: ${existingApproaches}. Suggest a different, valid approach to solve this problem. Describe the strategy and provide a clean, well-commented C++ implementation for this new approach. Format the response with a "Strategy:" section and a "Code:" section.`;
    const response = await callGemini(prompt);
    setAiResponse(response);
    setIsAiLoading(false);
  };

  const currentStatus = userProgress[question.id]?.status || "To-Do";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AIResponseModal
        title={aiResponseTitle}
        content={aiResponse}
        isLoading={isAiLoading}
        onClose={() => setAiResponse("")}
      />
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-x-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      >
        &larr; Back to List
      </button>

      <div className="space-y-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                {question.name}
              </h1>
              <a
                href={question.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 mt-1"
              >
                View Problem on CSES{" "}
                {React.cloneElement(icons.link, { className: "w-4 h-4" })}
              </a>
            </div>
            <div className="flex items-center flex-wrap gap-4">
              <div className="flex items-center rounded-md shadow-sm">
                <button
                  onClick={() => onStatusChange(question.id, "To-Do")}
                  className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold ${
                    currentStatus === "To-Do"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  }`}
                >
                  To-Do
                </button>
                <button
                  onClick={() => onStatusChange(question.id, "Attempting")}
                  className={`relative -ml-px inline-flex items-center px-3 py-2 text-sm font-semibold ${
                    currentStatus === "Attempting"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Attempting
                </button>
                <button
                  onClick={() => onStatusChange(question.id, "Solved")}
                  className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold ${
                    currentStatus === "Solved"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Solved
                </button>
              </div>
              <button
                onClick={handleGetHint}
                title="Get an AI-powered hint"
                className="inline-flex items-center gap-x-2 rounded-md bg-amber-100 px-3.5 py-2.5 text-sm font-semibold text-amber-800 shadow-sm ring-1 ring-inset ring-amber-200 hover:bg-amber-200"
              >
                ✨ Get a Hint
              </button>
              <button
                onClick={handleSetReminder}
                className="inline-flex items-center gap-x-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Set Reminder
              </button>
            </div>
          </div>
        </div>

        {question.approaches.map((approach, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Approach {index + 1}: {approach.title}
              </h2>
              <h3 className="text-md font-semibold text-gray-600 mt-4 mb-2">
                Thought Process & Strategy
              </h3>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p>{approach.strategy}</p>
              </div>
            </div>
            <div className="bg-gray-800 p-4 relative">
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() =>
                    handleExplainCode(approach.code, approach.title)
                  }
                  title="Get an AI-powered explanation"
                  className="bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-400 text-xs inline-flex items-center gap-1"
                >
                  ✨ Explain Code
                </button>
                <button
                  onClick={() => handleCopy(approach.code.trim(), index)}
                  className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-600 text-xs inline-flex items-center gap-1"
                >
                  {React.cloneElement(icons.copy, { className: "w-4 h-4" })}{" "}
                  {copied === index ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre>
                <code className="language-cpp text-sm text-white block whitespace-pre-wrap">
                  {approach.code.trim()}
                </code>
              </pre>
            </div>
          </div>
        ))}
        <div className="text-center">
          <button
            onClick={handleSuggestApproach}
            className="inline-flex items-center gap-x-2 rounded-md bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200 hover:bg-indigo-100"
          >
            {React.cloneElement(icons.sparkles, { className: "w-5 h-5" })}{" "}
            Suggest Another Approach
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeView, setActiveView] = useState("dashboard"); // 'dashboard', 'topic', 'question'
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [problems, setProblems] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);

  const problemsCollectionPath = `artifacts/${appId}/public/data/dsa_problems`;

  // --- Firebase Auth & Data Seeding ---
  useEffect(() => {
    if (!db || !auth) return;

    const seedDatabase = async () => {
      console.log("Seeding database with initial problems...");
      const batch = writeBatch(db);
      csesProblemSet.forEach((topicData) => {
        const docRef = doc(
          db,
          problemsCollectionPath,
          topicData.topic.replace(/\s+/g, "_")
        );
        batch.set(docRef, topicData);
      });
      try {
        await batch.commit();
        console.log("Database seeded successfully.");
      } catch (e) {
        console.error("Error seeding database:", e);
      }
    };

    const checkAndSeed = async () => {
      try {
        const problemsRef = collection(db, problemsCollectionPath);
        const snapshot = await getDocs(problemsRef);
        if (snapshot.empty) {
          await seedDatabase();
        } else {
          console.log("Problems already exist, skipping seed.");
        }
        // Fetch initial problems after potential seeding
        const unsubscribe = onSnapshot(
          collection(db, problemsCollectionPath),
          (snapshot) => {
            const problemData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setProblems(problemData);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching problems:", error);
            setLoading(false);
          }
        );
        return unsubscribe;
      } catch (e) {
        console.error("Error checking/seeding DB:", e);
        setLoading(false);
      }
    };

    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      let finalUser = user;
      if (!user) {
        try {
          if (
            typeof __initial_auth_token !== "undefined" &&
            __initial_auth_token
          ) {
            const userCredential = await signInWithCustomToken(
              auth,
              __initial_auth_token
            );
            finalUser = userCredential.user;
          } else {
            const userCredential = await signInAnonymously(auth);
            finalUser = userCredential.user;
          }
        } catch (error) {
          console.error("Error during sign-in:", error);
          setLoading(false);
          return;
        }
      }
      if (finalUser) {
        const currentUserId = finalUser.uid;
        setUserId(currentUserId);
        setIsAuthReady(true);
        await checkAndSeed();
      }
    });

    return () => {
      if (authUnsubscribe) authUnsubscribe();
    };
  }, []);

  // --- User Progress Listener ---
  useEffect(() => {
    if (!isAuthReady || !userId) return;

    const progressPath = `artifacts/${appId}/users/${userId}/progress`;
    const q = query(collection(db, progressPath));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const progressData = {};
        snapshot.forEach((doc) => {
          progressData[doc.id] = doc.data();
        });
        setUserProgress(progressData);
      },
      (error) => {
        console.error("Error fetching user progress:", error);
      }
    );

    return () => unsubscribe();
  }, [isAuthReady, userId]);

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    setActiveView("topic");
  };

  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question);
    setActiveView("question");
  };

  const handleStatusChange = async (questionId, status) => {
    if (!userId) return;
    const progressPath = `artifacts/${appId}/users/${userId}/progress`;
    const docRef = doc(db, progressPath, questionId);

    const newProgress = {
      status: status,
      updatedAt: new Date(),
    };

    // Add solvedAt timestamp only when status changes to 'Solved'
    if (status === "Solved" && userProgress[questionId]?.status !== "Solved") {
      newProgress.solvedAt = new Date();
    } else if (userProgress[questionId]?.solvedAt) {
      newProgress.solvedAt = userProgress[questionId].solvedAt; // Preserve original solve date
    }

    try {
      await setDoc(docRef, newProgress, { merge: true });
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  const renderContent = () => {
    if (loading && !problems.length) {
      return (
        <div className="flex justify-center items-center h-full p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }
    switch (activeView) {
      case "topic":
        return (
          <TopicView
            topic={selectedTopic}
            onSelectQuestion={handleSelectQuestion}
            userProgress={userProgress}
          />
        );
      case "question":
        return (
          <QuestionDetailView
            question={selectedQuestion}
            onBack={() => setActiveView("topic")}
            userProgress={userProgress}
            onStatusChange={handleStatusChange}
            userId={userId}
          />
        );
      case "dashboard":
      default:
        return <Dashboard allProblems={problems} userProgress={userProgress} />;
    }
  };

  return (
    <div className="h-screen w-full bg-gray-50 font-sans flex antialiased">
      {/* Sidebar */}
      <nav className="flex flex-col w-64 bg-white border-r border-gray-200 p-4 space-y-2">
        <div className="px-3 py-2">
          <h2 className="text-lg font-bold text-gray-800">TCS Pro Coder</h2>
          <p className="text-xs text-gray-500">CSES Tracker</p>
        </div>

        <button
          onClick={() => {
            setActiveView("dashboard");
            setSelectedTopic(null);
          }}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
            activeView === "dashboard"
              ? "bg-indigo-50 text-indigo-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {icons.dashboard} Dashboard
        </button>

        <div className="pt-4">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Topics
          </h3>
          <div className="mt-2 space-y-1">
            {problems.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleSelectTopic(topic)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  selectedTopic?.id === topic.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {icons.list} {topic.topic}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-4">
          <div className="p-3 rounded-lg bg-gray-100">
            <div className="flex items-center gap-2">
              {icons.user}
              <div>
                <p className="text-sm font-medium text-gray-800">Welcome</p>
                <p className="text-xs text-gray-500 truncate" title={userId}>
                  User ID:{" "}
                  {userId ? `${userId.substring(0, 10)}...` : "Loading..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{renderContent()}</main>
    </div>
  );
}
