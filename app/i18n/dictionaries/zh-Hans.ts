import en from './en';
import { withFallback } from './fallback';

// Simplified Chinese (mainland). UNREVIEWED DRAFT: drafted by AI using the project
// glossary (glossary-zh-vi-draft-v0); not yet checked by a fluent clinician. Only the
// site frame, model controls and disclaimer are translated; everything else falls back
// to English. Terms follow 全国科学技术名词审定委员会 usage where known (下颌骨, 牙槽骨).

const zhHans = withFallback(en, {
  meta: {
    title: 'Vivatheca: 让临床模型一目了然',
    description: '免费的口腔与口腔颌面外科3D模型，每个病例都配有正常对照模型，供医生制作患者教育资料。可在线查看、下载和打印。',
    socialDescription: '免费的浏览器3D医学模型，让医患沟通更清楚。',
    createTitle: '制作患者教育资料 - Vivatheca',
    createDescription: '起草、检查和完善与Vivatheca 3D模型配套的患者教育资料。',
  },
  language: { label: '语言' },
  common: {
    skip: '跳到主要内容',
    home: 'Vivatheca 首页',
    aiIllustration: 'AI生成的插图。',
  },
  nav: {
    primary: '主导航',
    browse: '浏览',
    howItWorks: '使用方法',
    publications: '出版物',
    contribute: '参与贡献',
    create: '制作',
    sponsor: '赞助模型',
    open: '打开导航',
    close: '关闭导航',
    mobile: '移动端导航',
    browseCollection: '浏览模型库',
    createInfo: '制作患者教育资料',
    models: '模型库',
    evidence: '证据',
    about: '关于',
    report: '报告错误',
    modelLibrary: '模型库',
    tryViewer: '试用3D查看器',
    students: '学生',
    studentsMobile: '学生学习',
  },
  footer: {
    backToTop: '返回 Vivatheca 页面顶部',
    about: '免费的口腔及口腔颌面疾病3D模型，每个都配有正常对照模型，供医生制作患者教育资料。',
    badge: '非营利 · 开放许可',
    library: '模型库',
    wisdomTooth: '阻生智齿',
    development: '6至12岁牙齿发育',
    orthognathic: '矫正咬合的正颌手术',
    report: '报告错误',
    aboutGroup: { label: '关于', about: '关于 Vivatheca', privacy: '隐私', contact: '联系' },
    explore: {
      label: '探索',
      featured: '浏览精选模型',
      how: '使用方法',
      publications: '出版物',
      trust: '可信度与审核',
      students: '供口腔医学和医学学生使用',
      templates: '宣教单和幻灯片模板',
      print: '3D打印模型',
      impact: '模型的使用情况',
    },
    participate: {
      label: '参与',
      request: '申请新模型',
      used: '分享模型的使用经验',
      contribute: '贡献模型',
      review: '参与临床审核',
      sponsor: '赞助模型',
    },
    connect: {
      label: '联系',
      partnerships: '机构合作',
      contact: '联系 Vivatheca',
      accessibility: '无障碍反馈',
    },
    legal: '法律与无障碍',
    privacy: '隐私',
    accessibility: '无障碍反馈',
  },
  contact: {
    heading: '联系我们',
    intro: '对模型有疑问、更正或建议？欢迎关注 Vivatheca 或与我们联系。',
    email: '电子邮件',
    linkLabel: '通过{name}联系 Vivatheca',
  },
  model: {
    pause: '暂停旋转',
    resume: '继续旋转',
    fullscreen: '全屏查看模型',
    loading: '正在加载交互模型…',
    help: '拖动旋转 · 滚动或双指缩放 · 选中模型后可用方向键',
    level: '说明深度',
    plain: '通俗说明',
    clinical: '临床细节',
    stepOf: '{label} · 第{n}步，共{total}步',
    sources: '资料来源及模型制作方法',
    sourceLabel: '来源 {n}',
  },
  disclaimer: {
    title: '免责声明 - Vivatheca',
    description: 'Vivatheca 的模型和信息仅供一般教育用途，不构成医疗建议。',
    heading: '免责声明',
    updated: '最后更新：{date}',
    date: '2026年11月5日',
    site: 'Vivatheca 仅供一般教育用途。它不是医疗建议，不得用于诊断、治疗计划或手术指导。有关您自身的健康问题，请咨询合格的医疗专业人员。',
    model: '仅为教育模型。它展示的是典型的解剖结构或疾病，并非任何真实患者；模型经过简化，可能存在错误。不得用于诊断、治疗计划、手术导板，也不得在人体内或体表使用。',
    translationNote: '此中文译文为AI起草的草稿，仅部分页面已翻译，尚未经过以中文为母语的临床医生审核。如内容有出入，以英文版为准。',
    notReviewed: '尚未经过临床审核。',
    full: '完整免责声明',
    readFull: '阅读完整免责声明。',
    nav: '免责声明',
    reviewNote: '本译文为AI起草的参考译文，尚未经过审核。如与英文版内容不一致，以英文版为准。',
    sections: [
      {
        heading: '仅供教育用途',
        paragraphs: [
          'Vivatheca 提供3D模型、图片和文字信息，用于一般教育，并帮助医疗专业人员向患者解释病情。Vivatheca 上的任何内容都不是医疗、口腔或其他健康建议。',
          '使用 Vivatheca 不会建立医患关系。有关您自身的健康问题，请始终咨询合格的医疗专业人员，切勿因在本网站看到的内容而延误或忽视专业建议。',
        ],
      },
      {
        heading: '模型是示意图，而非患者记录',
        paragraphs: [
          '每个模型展示的是典型的解剖结构或典型的病例示例。模型经过简化，并非依据任何可识别的患者制作，而真实的解剖结构因人而异。即使经过审核，模型仍可能存在错误。',
          '每个模型页面都会显示其审核状态。“尚未经过临床审核”表示尚无合格的审核人员检查过该模型。临床审核只检查教育内容的准确性，并不意味着模型适合临床使用。',
        ],
      },
      {
        heading: '不得用于临床',
        paragraphs: [
          '请勿将 Vivatheca 的模型、测量数据或文件用于诊断、治疗或手术规划、手术导板、植入物、夹板，或任何在人体内或体表使用的器械。Vivatheca 的模型不是医疗器械，未在澳大利亚治疗用品管理局（TGA）或任何其他监管机构注册。',
        ],
      },
      {
        heading: '致医生和教育工作者',
        paragraphs: [
          '您仍需对自己的临床判断负责，并在将使用 Vivatheca 制作的任何资料交给患者之前进行核查，包括遵守当地的知情同意和管理规定。',
          '使用患者资料生成工具制作的草稿由AI生成。AI可能出错，包括编造事实、数字或来源，而 Vivatheca 不会审核您制作的内容。切勿输入患者信息。',
        ],
      },
      {
        heading: '3D打印',
        paragraphs: [
          '打印模型的风险由您自行承担。打印质量、比例和材料安全性取决于您的打印机、设置和材料。小部件可能导致窒息，请远离幼儿。打印的模型未经消毒，不得放入口腔或体内。',
        ],
      },
      {
        heading: '资料来源和其他网站',
        paragraphs: [
          'Vivatheca 链接到公共卫生服务、研究和其他网站，以提供更多信息。我们无法控制这些网站的内容，也不对其负责。',
        ],
      },
      {
        heading: '不提供保证及责任限制',
        paragraphs: [
          'Vivatheca 及其模型和信息均免费并按“现状”提供，不保证其准确、完整或适合特定用途。在法律允许的范围内，Vivatheca 及其董事、志愿者和贡献者对因使用或依赖这些内容而造成的任何损失或伤害不承担责任。',
          '本免责声明中的任何内容均不排除、限制或修改您根据《澳大利亚消费者法》或其他不可排除的法律所享有的任何权利或救济。',
        ],
      },
      {
        heading: '许可',
        paragraphs: [
          '模型按照各模型页面所示的许可（通常为 CC BY-SA 4.0）共享。该许可允许您重复使用和改编文件，但并不意味着这些文件适合临床使用。',
        ],
      },
      {
        heading: '紧急情况',
        paragraphs: [
          '如果您认为自己正处于医疗紧急情况，请立即拨打当地急救电话（中国大陆为120，澳大利亚为000）。',
        ],
      },
      {
        heading: '联系方式',
        paragraphs: [
          '如有疑问或发现模型错误，请发送邮件至 vivatheca@gmail.com。本免责声明受南澳大利亚州法律管辖。',
        ],
      },
    ],
  },
  notFound: {
    title: '找不到页面 - Vivatheca',
    heading: '找不到该页面。',
    intro: '该链接可能已过期或输入有误。请浏览模型库或返回首页。',
    models: '浏览模型',
    home: 'Vivatheca 首页',
  },
});

export default zhHans;
