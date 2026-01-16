export interface Post {
  id: string;
  date: string;
  title: string;
  emoji: string;
  whatItMeans: string;
  whyItMatters: string;
  fieldsImpacted: {
    icon: string;
    name: string;
  }[];
  theme?: 'coral' | 'teal' | 'purple';
}

export const posts: Post[] = [
  {
    id: "1",
    date: new Date().toISOString().split('T')[0],
    title: "Apple's AI Just Got a Brain Upgrade",
    emoji: "🧠",
    whatItMeans: "Apple Intelligence now runs more tasks on your device instead of sending data to the cloud. This means Siri can help you faster and keeps your personal info right where it belongs — on your phone.",
    whyItMatters: "Privacy-first AI is becoming the new standard. Big tech companies are racing to prove they can be smart AND respectful of your data. This could change how all apps handle your information.",
    fieldsImpacted: [
      { icon: "📱", name: "Smartphone Users" },
      { icon: "🔒", name: "Privacy Advocates" },
      { icon: "💼", name: "App Developers" },
      { icon: "🏥", name: "Healthcare" },
    ],
    theme: 'coral',
  },
  {
    id: "2",
    date: "2025-01-15",
    title: "TikTok's Algorithm Goes Open Source",
    emoji: "📖",
    whatItMeans: "TikTok revealed the basic rules behind how it decides what videos to show you. It's like getting a peek behind the curtain of the world's most addictive app.",
    whyItMatters: "Understanding recommendation algorithms helps us be smarter about what content we consume. It also pushes other platforms to be more transparent about their 'secret sauce'.",
    fieldsImpacted: [
      { icon: "📹", name: "Content Creators" },
      { icon: "📊", name: "Marketers" },
      { icon: "🎓", name: "Researchers" },
    ],
    theme: 'teal',
  },
  {
    id: "3",
    date: "2025-01-14",
    title: "Quantum Computing Breaks Encryption Record",
    emoji: "⚛️",
    whatItMeans: "A new quantum computer solved a problem in 4 minutes that would take regular computers 47 years. Think of it as a calculator that can do millions of math problems at once.",
    whyItMatters: "This is both exciting and scary — quantum computers could eventually crack the security protecting your bank account and messages. The race to build 'quantum-safe' encryption is heating up.",
    fieldsImpacted: [
      { icon: "🏦", name: "Banking" },
      { icon: "🛡️", name: "Cybersecurity" },
      { icon: "🔬", name: "Scientific Research" },
      { icon: "🏛️", name: "Government" },
    ],
    theme: 'purple',
  },
];

export const getTodayPost = (): Post | undefined => {
  const today = new Date().toISOString().split('T')[0];
  return posts.find(post => post.date === today) || posts[0];
};

export const getArchivedPosts = (): Post[] => {
  const today = new Date().toISOString().split('T')[0];
  return posts.filter(post => post.date !== today);
};
