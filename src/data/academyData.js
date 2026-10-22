export const academyLevels = [
  {
    id: 1,
    title: "Level 1: Wellness Awareness",
    description: "Foundational knowledge about women's health and wellness.",
    color: "#ff69b4",
    courses: [
      { id: 101, title: "Basics of Nutrition", duration: "2 hours", lessons: 5, enrolled: 1200 },
      { id: 102, title: "Menstrual Health 101", duration: "1.5 hours", lessons: 4, enrolled: 850 },
    ]
  },
  {
    id: 2,
    title: "Level 2: Health Professional",
    description: "Deep dive into clinical aspects and professional wellness coaching.",
    color: "#9b59b6",
    courses: [
      { id: 201, title: "Advanced Nutrition & Dietetics", duration: "5 hours", lessons: 12, enrolled: 450 },
      { id: 202, title: "Hormonal Balance Mastery", duration: "4 hours", lessons: 10, enrolled: 300 },
    ]
  },
  {
    id: 3,
    title: "Level 3: Diploma in Holistic Wellness",
    description: "Comprehensive certification for holistic health practitioners.",
    color: "#3498db",
    courses: [
      { id: 301, title: "Ayurveda & Modern Science", duration: "10 hours", lessons: 20, enrolled: 150 },
      { id: 302, title: "Therapeutic Yoga Practitioner", duration: "12 hours", lessons: 25, enrolled: 120 },
    ]
  },
  {
    id: 4,
    title: "Level 4: Certified Wellness Trainer",
    description: "Train the trainer program for leadership in wellness.",
    color: "#e67e22",
    courses: [
      { id: 401, title: "Wellness Leadership", duration: "15 hours", lessons: 30, enrolled: 50 },
      { id: 402, title: "Business of Wellness", duration: "8 hours", lessons: 15, enrolled: 80 },
    ]
  }
];

export const myCourses = [
  {
    id: 101,
    title: "Basics of Nutrition",
    progress: 75,
    status: "ongoing",
    thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400",
    lastAccessed: "2 days ago"
  },
  {
    id: 102,
    title: "Menstrual Health 101",
    progress: 100,
    status: "completed",
    thumbnail: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=400",
    lastAccessed: "1 week ago",
    certificateId: "CERT-102-XYZ"
  },
  {
    id: 103,
    title: "Mental Wellness Foundation",
    progress: 100,
    status: "completed",
    quizPassed: false,
    thumbnail: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=400",
    lastAccessed: "Just now"
  }
];

export const courseContent = {
  101: {
    id: 101,
    title: "Basics of Nutrition",
    description: "Learn the fundamentals of balanced diet, macronutrients, and how they affect women's health throughout different life stages.",
    longDescription: "This course is designed for anyone looking to improve their relationship with food and understand the science behind nutrition. We cover everything from calorie counting to mindful eating and specific nutritional needs for women.",
    instructor: "Dr. Ananya Rao",
    rating: 4.8,
    reviews: 156,
    syllabus: [
      { title: "Introduction to Nutrients", duration: "15 mins" },
      { title: "Understanding Macronutrients", duration: "30 mins" },
      { title: "Micronutrients & Supplements", duration: "25 mins" },
      { title: "Meal Planning for Women", duration: "40 mins" },
      { title: "Final Assessment", duration: "10 mins" }
    ],
    requirements: ["Basic understanding of biology", "Interest in wellness"]
  }
};

export const quizData = {
  101: {
    title: "Nutrition Basics Quiz",
    questions: [
      {
        id: 1,
        question: "What are the three main macronutrients?",
        options: [
          "Vitamins, Minerals, Water",
          "Carbohydrates, Proteins, Fats",
          "Calcium, Iron, Zinc",
          "Fiber, Sugar, Salt"
        ],
        correct: 1
      },
      {
        id: 2,
        question: "Which vitamin is essential for calcium absorption?",
        options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"],
        correct: 2
      }
    ]
  }
};
