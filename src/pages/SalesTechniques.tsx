import React, { useState } from 'react';
import { Lightbulb, MessageSquare, Target, TrendingUp, BookOpen, Star, Heart, X, User, Briefcase, Store, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const officeWorkerData = [
  {
    category: '一、上班者（职场人士）常见问题',
    items: [
      { q: '1. 职场不顺、总遇小人', a: '八字看流年+化小人。避坑、防小人。' },
      { q: '2. 晋升难、涨薪慢', a: '流年看事业运+文昌布局。把握时机，顺势而为。' },
      { q: '3. 压力大、焦虑失眠', a: '八字看情绪+卧室风水。睡得着、稳得住。' },
      { q: '4. 不敢辞职、怕选错', a: '奇门决策。该不该走、什么时候走。' },
      { q: '5. 该不该换工作还是转行？哪个方向？不敢停，有房贷，有孩子，没存款', a: '十年大运，流年，迁移宫看方向，奇门看时机，择吉行动。' },
      { q: '6. 适合单干还是上班？', a: '看天赋（销售后勤，冲杀维稳，领导军师，技术讲师）。' },
      { q: '7. 如何升职？怎么突破职场瓶颈？看不到头升不上去', a: '官禄宫紫微当领导，天府二把手，太阳学会表现，流年化权升职机会；文昌布局，左高右低，后有靠。' },
      { q: '8. 有创业想法，时机成不成熟？', a: '看能力、风险、时机，流年动还是稳。' },
      { q: '9. 如何成为销冠？', a: '销售天赋、合作、流量。' },
      { q: '10. 跟人发生纠纷，结果会如何？', a: '判断继续还是结束。' },
      { q: '11. 有个项目（招标，合作，开店，品牌授权）能不能做，有机会吗', a: '看风险、机会，奇门决策。' },
      { q: '12. 为什么总是存不住钱？', a: '性格、运势，财帛宫分析，财位布局，开源节流，聚财。田宅宫七杀天生守不住，家里财位在厕所钱被冲走。' },
      { q: '13. 今年工作能不能保住？', a: '看公司变动、领导不满、行业不景气。' },
      { q: '14. 工作没方向，不知道做什么，混一天是天', a: '命宫主星——紫微管理，天机策划，武曲金融，太阳教育；八字五行——木文化，火销售，土管理，金技术，水贸易。' },
      { q: '15. 缺钱，赚不到，留不住，投资亏', a: '财从哪个方向来，财帛宫定财源。武曲正财专业技能，贪狼偏财社交投资，太阴慢财长期积累。正财主业，偏财副业，食伤技术。' },
      { q: '16. 工资不涨，干得多，拿得少', a: '财帛宫看上限。武曲、太阴稳定；贪狼、七杀起伏大但有机会突破。' },
      { q: '17. 35岁年龄危机，怕被裁', a: '大运定危机。差运提前布局第二技能，走文昌学什么都快，没文昌走管理，靠经验吃饭。' },
      { q: '18. 技能单一，怕被替代，收入单一，想搞副业没方向', a: '只会自己这一摊，AI来了更慌。文昌可学新技能，没有就走管理路线。财帛有偏财星可搞副业投资销售，没有就深耕主业。食伤旺做技术、创意。' },
      { q: '19. 选错行业赛道，怎么办？', a: '官禄宫看适合行业。火旺做销售，土旺做管理。' },
      { q: '20. 同事内卷，卷不动内耗，没意义', a: '福德宫空宫，找精神寄托。太阳付出有意义，天梁价值，太阴陷需艺术灵性寄托。风水化小人。' },
      { q: '21. 办公室人际关系，领导不喜欢自己，同事难相处', a: '交友宫有煞星，座位无靠、冲门。看人际模式，换自己还是换环境。' },
      { q: '22. 没有成就感', a: '事不匹配天赋。看命宫主星：官权，财钱，印认可，食伤成就。' },
      { q: '23. 没有人帮，孤立无援', a: '迁移宫吉星动时遇贵人。有禄存、天马多出差、交友，看贵人在哪个方向。' },
      { q: '24. 没时间陪家人，没生活，没健康，没自己', a: '工具人，疾厄宫亮红灯，家居调作息，先保命。' },
      { q: '25. 马戏团费用大这场赚不赚钱？去哪个城市接活旺', a: '奇门看财运，迁移宫定方位。' },
      { q: '26. 负债累累，如何翻身？', a: '大运转机，补财位、补财库。' },
      { q: '27. 自己是晚上11点多出生，按第一天还是第二天算？', a: '11点后按第二天算。' },
    ]
  },
  {
    category: '二、管理者常见问题',
    items: [
      { q: '1. 怎么招到合适的人？', a: '紫微斗数——命宫主星定天赋，官禄宫定岗位。看命盘就知道适合做什么。国学解法——八字看忠诚度+能力方向，比肩旺忠诚，财星旺务实。效果：招对人，省心一半。' },
      { q: '2. 核心员工想走怎么办？', a: '紫微斗数——大运流年看员工运势走向，是运势到了还是对公司不满。国学解法——八字合盘看缘分深浅。效果：知道该留还是该放。' },
      { q: '3. 团队内耗严重怎么破？', a: '紫微斗数——兄弟宫看内部关系，交友宫看外部。国学解法——八字合盘调座位，谁和谁相冲调开。效果：化解矛盾，减少内耗。' },
      { q: '4. 谁该重用？谁该防？', a: '紫微斗数——命宫+官禄宫看能力，交友宫看人品。国学解法——八字看诚信+忠诚。效果：用对人，防错人。' },
      { q: '5. 这个项目能不能投？', a: '紫微斗数——财帛宫吉凶+官禄宫运势看项目前景。国学解法——奇门起局看合作方人品、时机。效果：提前避坑，不瞎投钱。' },
      { q: '6. 公司要不要转型？', a: '紫微斗数——大运走势定行业方向。国学解法——八字看五行匹配。效果：知道该不该转、往哪转。' },
      { q: '7. 怎么提升话语权？', a: '紫微斗数——官禄宫+迁移宫看权位。国学解法——风水催官贵，办公位背后有靠，左高右低。效果：说话有人听。' },
      { q: '8. 总有小人使绊子？', a: '紫微斗数——交友宫有煞星易招小人。国学解法——风水化小人+八字看小人。效果：提前防，少被坑。' },
      { q: '9. 怎么管好00后员工？', a: '紫微斗数——子女宫看新生代特征。国学解法——八字看性格+沟通模式。效果：知道怎么管、怎么留。' },
      { q: '10. 自己太累，什么事都扛？', a: '紫微斗数——命宫有紫微易亲力亲为。国学解法——八字看领导风格+授权。效果：学会放权，轻松管。' },
    ]
  }
];

const TECHNIQUES = [
  {
    title: '销售话术分类',
    description: '针对不同职业背景的学员，提供精准的沟通方案。',
    icon: MessageSquare,
    color: 'bg-rose-100 text-rose-600',
    details: [
      { label: '自由职业', icon: User, content: '重点在于自由时间的管理和个人品牌的建立。' },
      { label: '上班族', icon: Briefcase, content: officeWorkerData },
      { label: '个体户', icon: Store, content: '重点在于生意的稳健经营和财富的持续增长。' },
      { label: '企业家', icon: Building2, content: '重点在于战略眼光的开拓和企业文化的传承。' },
    ]
  },
  {
    title: '挖掘核心需求',
    description: '深入了解学员学习国学的初衷，精准匹配最适合的课程。',
    icon: Target,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: '价值传递技巧',
    description: '不仅是卖课程，更是传递国学智慧对人生的积极影响。',
    icon: Lightbulb,
    color: 'bg-amber-100 text-amber-600',
  },
  {
    title: '异议处理话术',
    description: '针对学员的顾虑（如时间、价格等），提供专业的解答方案。',
    icon: MessageSquare,
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    title: '案例分享力量',
    description: '分享往期学员的真实成长案例，增强课程的说服力。',
    icon: Star,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    title: '持续跟进策略',
    description: '制定科学的跟进计划，在合适的时机提供必要的关怀。',
    icon: TrendingUp,
    color: 'bg-indigo-100 text-indigo-600',
  },
];

interface AccordionItemProps {
  question: string;
  answer: string;
}

function AccordionItem({ question, answer }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="bg-surface-container-low rounded-2xl border border-outline-variant/5 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-container-high transition-colors"
      >
        <span className="font-medium text-on-surface text-sm pr-4 leading-relaxed">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-secondary shrink-0" /> : <ChevronDown className="w-5 h-5 text-secondary shrink-0" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 text-sm text-secondary border-t border-outline-variant/5 mt-2">
              <div className="pt-3 leading-relaxed">
                <span className="font-bold text-primary mr-2">话术:</span>
                {answer}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailContent({ details }: { details: any[] }) {
  const [activeTab, setActiveTab] = useState(0);
  const activeContent = details[activeTab].content;
  
  return (
    <div className="flex flex-col h-full max-h-[60vh]">
      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-3 mb-4 border-b border-outline-variant/10 shrink-0 scrollbar-hide">
        {details.map((detail, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === idx 
                ? 'bg-primary text-white font-bold shadow-md shadow-primary/20' 
                : 'bg-surface-container-low text-secondary hover:bg-surface-container-high'
            }`}
          >
            <detail.icon className="w-4 h-4" />
            {detail.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="overflow-y-auto pr-2 space-y-4 flex-1 custom-scrollbar">
        {typeof activeContent === 'string' ? (
          <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5">
            <p className="text-sm text-secondary leading-relaxed">{activeContent}</p>
          </div>
        ) : (
          <div className="space-y-8 pb-4">
            {activeContent.map((section: any, idx: number) => (
              <div key={idx} className="space-y-4">
                <h4 className="font-bold text-primary text-lg sticky top-0 bg-surface-container-highest py-2 z-10">
                  {section.category}
                </h4>
                <div className="space-y-3">
                  {section.items.map((item: any, itemIdx: number) => (
                    <div key={itemIdx}>
                      <AccordionItem question={item.q} answer={item.a} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SalesTechniques() {
  const [selectedTech, setSelectedTech] = useState<typeof TECHNIQUES[0] | null>(null);

  return (
    <div className="space-y-10 pb-20">
      <section className="relative bg-primary rounded-3xl p-10 text-center shadow-2xl shadow-primary/20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="tech-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#tech-grid)" />
          </svg>
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex p-3 bg-white/20 rounded-2xl backdrop-blur-md mb-2">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-headline text-4xl font-black text-white tracking-widest">销售技巧</h2>
          <p className="text-white/80 max-w-md mx-auto text-sm font-medium">
            提升专业素养，掌握沟通艺术，助力每一位学子开启国学智慧之门。
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TECHNIQUES.map((tech, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 hover:shadow-xl hover:shadow-primary/5 transition-all group"
          >
            <div className={`w-14 h-14 ${tech.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <tech.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">{tech.title}</h3>
            <p className="text-sm text-secondary leading-relaxed font-medium">
              {tech.description}
            </p>
            <div className="mt-6 pt-6 border-t border-outline-variant/5 flex justify-end">
              <button 
                onClick={() => setSelectedTech(tech)}
                className="text-xs font-black text-primary uppercase tracking-widest hover:underline"
              >
                查看详情 →
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedTech && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface-container-highest w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-outline-variant/10 flex flex-col max-h-[90vh]"
            >
              <div className="p-8 pb-4 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${selectedTech.color} rounded-2xl`}>
                      <selectedTech.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-on-surface tracking-tight">{selectedTech.title}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedTech(null)}
                    className="p-2 hover:bg-surface-container-low rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-secondary" />
                  </button>
                </div>
                <p className="text-secondary font-medium leading-relaxed mt-4">
                  {selectedTech.description}
                </p>
              </div>

              <div className="px-8 pb-8 flex-1 overflow-hidden flex flex-col">
                {selectedTech.details ? (
                  <DetailContent details={selectedTech.details} />
                ) : (
                  <div className="bg-surface-container-low p-10 rounded-3xl border border-outline-variant/5 text-center">
                    <p className="text-secondary italic">更多详细内容正在整理中...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quote Section */}
      <section className="bg-surface-container-highest/30 p-10 rounded-3xl border border-outline-variant/10 text-center italic">
        <p className="text-lg text-secondary font-medium max-w-2xl mx-auto">
          "销售不是卖出，而是帮助。帮助他人解决问题，成就他人的同时，也成就了自己。"
        </p>
      </section>
    </div>
  );
}
