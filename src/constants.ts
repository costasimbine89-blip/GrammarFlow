import { Level, Question } from './types';
import { BEGINNER_QUESTIONS, INTERMEDIATE_QUESTIONS, ADVANCED_QUESTIONS, EXPERT_QUESTIONS } from './questions_bank';

export const STATIC_QUESTIONS: Record<Level, Question[]> = {
  Beginner: [
    {
      id: 'b1',
      text: "I ___ to the gym every morning.",
      options: ["go", "goes", "going", "gone"],
      correctAnswer: "go",
      topic: "Present Simple"
    },
    {
      id: 'b2',
      text: "She ___ a book right now.",
      options: ["read", "reads", "is reading", "reading"],
      correctAnswer: "is reading",
      topic: "Present Continuous"
    },
    {
      id: 'b3',
      text: "They ___ at the party yesterday.",
      options: ["was", "were", "are", "be"],
      correctAnswer: "were",
      topic: "Past Simple (To Be)"
    },
    {
      id: 'b4',
      text: "I saw ___ elephant at the zoo.",
      options: ["a", "an", "the", "some"],
      correctAnswer: "an",
      topic: "Articles"
    },
    {
      id: 'b5',
      text: "There are three ___ in the park.",
      options: ["child", "childs", "children", "childrens"],
      correctAnswer: "children",
      topic: "Plurals"
    },
    {
      id: 'b6',
      text: "My birthday is ___ October.",
      options: ["in", "on", "at", "to"],
      correctAnswer: "in",
      topic: "Prepositions of Time"
    },
    {
      id: 'b7',
      text: "This is my brother. ___ name is Paul.",
      options: ["He", "His", "Him", "He's"],
      correctAnswer: "His",
      topic: "Possessive Adjectives"
    },
    {
      id: 'b8',
      text: "___ do you live?",
      options: ["What", "Who", "Where", "When"],
      correctAnswer: "Where",
      topic: "Question Words"
    },
    {
      id: 'b9',
      text: "This pizza is ___ than the one I had yesterday.",
      options: ["good", "gooder", "better", "best"],
      correctAnswer: "better",
      topic: "Comparatives"
    },
    {
      id: 'b10',
      text: "Can you help ___ with my homework?",
      options: ["I", "me", "my", "mine"],
      correctAnswer: "me",
      topic: "Object Pronouns"
    },
    ...BEGINNER_QUESTIONS
  ],
  Intermediate: [
    {
      id: 'i1',
      text: "If I ___ you, I would take the job.",
      options: ["am", "was", "were", "be"],
      correctAnswer: "were",
      topic: "Second Conditional"
    },
    {
      id: 'i2',
      text: "I have ___ in London for five years.",
      options: ["live", "lived", "living", "lives"],
      correctAnswer: "lived",
      topic: "Present Perfect"
    },
    {
      id: 'i3',
      text: "The cake ___ by my grandmother.",
      options: ["made", "was made", "is making", "has made"],
      correctAnswer: "was made",
      topic: "Passive Voice"
    },
    {
      id: 'i4',
      text: "You ___ smoke in the hospital.",
      options: ["don't have to", "mustn't", "shouldn't to", "can't to"],
      correctAnswer: "mustn't",
      topic: "Modals of Prohibition"
    },
    {
      id: 'i5',
      text: "He said that he ___ coming to the party.",
      options: ["is", "was", "will be", "has been"],
      correctAnswer: "was",
      topic: "Reported Speech"
    },
    {
      id: 'i6',
      text: "The man ___ lives next door is a doctor.",
      options: ["which", "who", "whom", "whose"],
      correctAnswer: "who",
      topic: "Relative Clauses"
    },
    {
      id: 'i7',
      text: "I enjoy ___ to music in my free time.",
      options: ["listen", "to listen", "listening", "listened"],
      correctAnswer: "listening",
      topic: "Gerunds"
    },
    {
      id: 'i8',
      text: "If he had studied harder, he ___ the exam.",
      options: ["passed", "would pass", "would have passed", "will pass"],
      correctAnswer: "would have passed",
      topic: "Third Conditional"
    },
    {
      id: 'i9',
      text: "I need to ___ my room before the guests arrive.",
      options: ["tidy up", "tidy down", "tidy in", "tidy off"],
      correctAnswer: "tidy up",
      topic: "Phrasal Verbs"
    },
    {
      id: 'i10',
      text: "I ___ play the piano when I was a child.",
      options: ["use to", "used to", "was used to", "get used to"],
      correctAnswer: "used to",
      topic: "Used to"
    },
    ...INTERMEDIATE_QUESTIONS
  ],
  Advanced: [
    {
      id: 'a1',
      text: "Hardly ___ the office when it started to rain.",
      options: ["I had left", "had I left", "I left", "did I leave"],
      correctAnswer: "had I left",
      topic: "Inversion"
    },
    {
      id: 'a2',
      text: "It's high time you ___ looking for a job.",
      options: ["start", "started", "starting", "to start"],
      correctAnswer: "started",
      topic: "Subjunctive/Unreal Past"
    },
    {
      id: 'a3',
      text: "Were it ___ for his help, I wouldn't have finished.",
      options: ["not", "no", "none", "without"],
      correctAnswer: "not",
      topic: "Conditional Inversion"
    },
    {
      id: 'a4',
      text: "___ I want is a little peace and quiet.",
      options: ["That", "Which", "What", "It"],
      correctAnswer: "What",
      topic: "Cleft Sentences"
    },
    {
      id: 'a5',
      text: "If I hadn't missed the bus, I ___ here now.",
      options: ["would be", "would have been", "will be", "am"],
      correctAnswer: "would be",
      topic: "Mixed Conditionals"
    },
    {
      id: 'a6',
      text: "___ the report, he went home.",
      options: ["Finished", "Having finished", "Being finished", "To finish"],
      correctAnswer: "Having finished",
      topic: "Participle Clauses"
    },
    {
      id: 'a7',
      text: "I don't know ___ he is coming or not.",
      options: ["if", "whether", "that", "weather"],
      correctAnswer: "whether",
      topic: "Nominal Clauses"
    },
    {
      id: 'a8',
      text: "I ___ visit my aunt, but I didn't have time.",
      options: ["was going to", "will", "would", "have been going to"],
      correctAnswer: "was going to",
      topic: "Future in the Past"
    },
    {
      id: 'a9',
      text: "He is said ___ the richest man in the world.",
      options: ["being", "to be", "that he is", "to being"],
      correctAnswer: "to be",
      topic: "Complex Passives"
    },
    {
      id: 'a10',
      text: "I don't like coffee, and ___.",
      options: ["neither does my wife", "so does my wife", "my wife doesn't too", "neither my wife does"],
      correctAnswer: "neither does my wife",
      topic: "Ellipsis and Substitution"
    },
    ...ADVANCED_QUESTIONS
  ],
  Expert: [
    ...EXPERT_QUESTIONS
  ]
};
