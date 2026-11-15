export const defaultContent = {
  name: 'Luigi', handle: 'Devdogfish', role: 'Design & code at', company: 'Your studio', email: 'hello@example.com',
  pressEyebrow: 'Press', pressSource: 'Microsoft Design', pressDate: 'Apr 2026', pressTitle: 'Self-portraits: You Zhang',
  pressDescription: 'A former motion storyteller turns to design systems and prototyping, using AI to sketch wireframes and make widgets feel real.',
  pressUrl: 'https://microsoft.design/articles/self-potraits-you-zhang/', visitors: '24,630', commits: '7',
  intro: 'I’m drawn to the space between ideas and the things people actually use. This is where I collect my work, side projects, and small experiments.',
  practice: 'My practice connects thoughtful design with hands-on building. I care about how something feels, how clearly it communicates, and the details that make it useful every day.',
  approach: 'I like starting with a working prototype: something to explore, question, and improve. The process is iterative, and the most interesting discoveries usually happen while making.',
  workIntro: 'Recent explorations span digital experiences, visual identities, and creative tools. A few selected pieces are collected below.',
  motionIntro: 'Movement adds another dimension to the work. These studies explore rhythm, texture, and the moments where an interface becomes a story.',
  background: 'The best projects bring different disciplines together. I’m interested in tools that invite exploration, systems that stay coherent, and ideas that reward a closer look.',
  openIntro: 'I enjoy sharing the process as much as the finished result. Here you’ll find notes on what I’m building, useful resources, and ideas worth returning to.',
  brandsIntro: 'On the side, I explore visual identities and expressive systems. A few marks and identities from the sketchbook.',
  musicIntro: 'Off the clock, there’s usually a record playing. Music, games, and small creative detours keep the ideas moving.',
  filmsIntro: 'I collect films with a strong sense of place, a distinctive visual world, or something unexpected to say.',
  contactIntro: 'Based in Southern California. Always happy to meet thoughtful people and talk about design, code, and ideas over coffee.',
};
export type PortfolioContent = typeof defaultContent;
export function readContent():PortfolioContent {
  try {
    const parsed:unknown=JSON.parse(localStorage.getItem('portfolio-v2-content')||'{}');
    if(!parsed||typeof parsed!=='object')return defaultContent;
    return Object.fromEntries(Object.entries(defaultContent).map(([key,value])=>[key,typeof (parsed as Record<string,unknown>)[key]==='string'?(parsed as Record<string,string>)[key]:value])) as PortfolioContent;
  }catch{return defaultContent}
}
