import en from './en';
import { withFallback } from './fallback';

// Traditional Chinese (Taiwan usage). UNREVIEWED DRAFT: drafted by AI using the project
// glossary (glossary-zh-vi-draft-v0); not yet checked by a fluent clinician. Hong Kong
// usage differs and needs its own review. Only the site frame, model controls and
// disclaimer are translated; everything else falls back to English.

const zhHant = withFallback(en, {
  meta: {
    title: 'Vivatheca: 讓臨床模型一目了然',
    description: '免費的牙科與口腔顎顏面外科3D模型，每個病例都附有正常對照模型，供醫師製作衛教資料。可線上檢視、下載與列印。',
    socialDescription: '免費的瀏覽器3D醫學模型，讓醫病溝通更清楚。',
    createTitle: '製作衛教資料 - Vivatheca',
    createDescription: '草擬、檢查並完善與Vivatheca 3D模型搭配的衛教資料。',
  },
  language: { label: '語言' },
  common: {
    skip: '跳至主要內容',
    home: 'Vivatheca 首頁',
    aiIllustration: 'AI生成的插圖。',
  },
  nav: {
    primary: '主要導覽',
    browse: '瀏覽',
    howItWorks: '使用方式',
    publications: '出版品',
    contribute: '參與貢獻',
    create: '製作',
    sponsor: '贊助模型',
    open: '開啟導覽',
    close: '關閉導覽',
    mobile: '行動版導覽',
    browseCollection: '瀏覽模型庫',
    createInfo: '製作衛教資料',
    models: '模型庫',
    evidence: '實證',
    about: '關於',
    report: '回報錯誤',
    modelLibrary: '模型庫',
    tryViewer: '試用3D檢視器',
    students: '學生',
    studentsMobile: '學生學習',
  },
  footer: {
    backToTop: '回到 Vivatheca 頁面頂端',
    about: '免費的牙科及口腔顎顏面疾病3D模型，每個都附有正常對照模型，供醫師製作衛教資料。',
    badge: '非營利 · 開放授權',
    library: '模型庫',
    wisdomTooth: '阻生智齒',
    development: '6至12歲牙齒發育',
    orthognathic: '矯正咬合的正顎手術',
    report: '回報錯誤',
    aboutGroup: { label: '關於', about: '關於 Vivatheca', privacy: '隱私', contact: '聯絡' },
    explore: {
      label: '探索',
      featured: '瀏覽精選模型',
      how: '使用方式',
      publications: '出版品',
      trust: '可信度與審查',
      students: '給牙醫系與醫學系學生',
      templates: '衛教單張與簡報範本',
      print: '3D列印模型',
      impact: '模型的使用情形',
    },
    use: '使用模型',
    disciplines: { label: '依專科瀏覽模型庫', all: '全部模型', showing: '正在顯示：{name}', items: { 'oral-surgery': '口腔顎面外科', 'head-neck': '頭頸部', 'cleft': '唇顎裂治療', 'orthodontics': '齒顎矯正', 'paediatric': '兒童牙科', 'endodontics': '牙髓病', 'periodontics': '牙周病', 'prosthodontics': '補綴' } },
    participate: {
      label: '參與',
      request: '申請新模型',
      used: '分享模型的使用經驗',
      contribute: '貢獻模型',
      review: '參與臨床審查',
      sponsor: '贊助模型',
    },
    connect: {
      label: '聯絡',
      partnerships: '機構合作',
      contact: '聯絡 Vivatheca',
      accessibility: '無障礙意見回饋',
    },
    legal: '法律與無障礙',
    privacy: '隱私',
    accessibility: '無障礙意見回饋',
  },
  contact: {
    heading: '聯絡我們',
    intro: '對模型有疑問、更正或建議嗎？歡迎追蹤 Vivatheca 或與我們聯絡。',
    email: '電子郵件',
    linkLabel: '透過{name}聯絡 Vivatheca',
  },
  model: {
    pause: '暫停旋轉',
    resume: '繼續旋轉',
    fullscreen: '全螢幕檢視模型',
    loading: '正在載入互動模型…',
    help: '拖曳以旋轉 · 捲動或雙指縮放 · 選取模型後可使用方向鍵',
    level: '說明深度',
    plain: '淺白說明',
    clinical: '臨床細節',
    stepOf: '{label} · 第{n}步，共{total}步',
    sources: '資料來源與模型製作方式',
    sourceLabel: '來源 {n}',
  },
  disclaimer: {
    title: '免責聲明 - Vivatheca',
    description: 'Vivatheca 的模型與資訊僅供一般教育用途，不構成醫療建議。',
    heading: '免責聲明',
    updated: '最後更新：{date}',
    date: '2026年11月5日',
    site: 'Vivatheca 僅供一般教育用途。它不是醫療建議，不得用於診斷、治療計畫或手術指引。關於您自身的健康，請諮詢合格的醫療專業人員。',
    model: '僅為教育模型。它呈現典型的解剖構造或疾病，並非任何真實病人；模型經過簡化，可能有誤。不得用於診斷、治療計畫、手術導板，亦不得用於人體內或人體表面。',
    translationNote: '此中文譯文為AI草擬的草稿，僅部分頁面已翻譯，尚未經以中文為母語的臨床醫師審查。如內容有出入，以英文版為準。',
    notReviewed: '尚未經過臨床審查。',
    full: '完整免責聲明',
    readFull: '閱讀完整免責聲明。',
    nav: '免責聲明',
    reviewNote: '本譯文為AI草擬的參考譯文，尚未經過審查。如與英文版內容不一致，以英文版為準。',
    sections: [
      {
        heading: '僅供教育用途',
        paragraphs: [
          'Vivatheca 提供3D模型、圖片與文字資訊，用於一般教育，並協助醫療專業人員向病人說明病情。Vivatheca 上的任何內容都不是醫療、牙科或其他健康建議。',
          '使用 Vivatheca 並不會建立醫病關係。關於您自身的健康，請務必諮詢合格的醫療專業人員，切勿因在本網站看到的內容而延誤或忽略專業建議。',
        ],
      },
      {
        heading: '模型是示意圖，而非病人紀錄',
        paragraphs: [
          '每個模型呈現的是典型的解剖構造或典型的病例範例。模型經過簡化，並非依據任何可識別的病人製作，而真實的解剖構造因人而異。即使經過審查，模型仍可能有誤。',
          '每個模型頁面都會顯示其審查狀態。「尚未經過臨床審查」表示尚無合格的審查人員檢查過該模型。臨床審查只檢查教育內容的正確性，並不代表模型適合臨床使用。',
        ],
      },
      {
        heading: '不得用於臨床',
        paragraphs: [
          '請勿將 Vivatheca 的模型、測量數據或檔案用於診斷、治療或手術規劃、手術導板、植入物、咬合板，或任何用於人體內或人體表面的器材。Vivatheca 的模型不是醫療器材，未向澳洲醫療用品管理局（TGA）或任何其他主管機關登記。',
        ],
      },
      {
        heading: '給醫師與教育工作者',
        paragraphs: [
          '您仍需為自己的臨床判斷負責，並在將使用 Vivatheca 製作的任何資料交給病人之前加以確認，包括遵守當地的知情同意與管理規範。',
          '以衛教資料產生工具製作的草稿由AI生成。AI可能出錯，包括捏造事實、數字或來源，而 Vivatheca 不會審查您製作的內容。切勿輸入病人資訊。',
        ],
      },
      {
        heading: '3D列印',
        paragraphs: [
          '列印模型的風險由您自行承擔。列印品質、比例與材料安全性取決於您的印表機、設定與材料。小零件可能造成窒息，請遠離幼兒。列印的模型未經滅菌，不得放入口中或體內。',
        ],
      },
      {
        heading: '資料來源與其他網站',
        paragraphs: [
          'Vivatheca 連結至公共衛生服務、研究及其他網站，以提供更多資訊。我們無法控制這些網站的內容，亦不對其負責。',
        ],
      },
      {
        heading: '不提供保證及責任限制',
        paragraphs: [
          'Vivatheca 及其模型與資訊皆免費並依「現狀」提供，不保證其正確、完整或適合特定用途。在法律允許的範圍內，Vivatheca 及其董事、志工與貢獻者對因使用或依賴這些內容所造成的任何損失或傷害不負責任。',
          '本免責聲明的任何內容均不排除、限制或修改您依《澳洲消費者法》或其他不可排除之法律所享有的任何權利或救濟。',
        ],
      },
      {
        heading: '授權',
        paragraphs: [
          '模型依各模型頁面所示的授權（通常為 CC BY-SA 4.0）分享。該授權允許您重複使用與改作檔案，但並不代表這些檔案適合臨床使用。',
        ],
      },
      {
        heading: '緊急情況',
        paragraphs: [
          '如果您認為自己正面臨醫療緊急情況，請立即撥打當地緊急電話（台灣為119，香港為999，澳洲為000）。',
        ],
      },
      {
        heading: '聯絡方式',
        paragraphs: [
          '如有疑問或發現模型錯誤，請寄信至 vivatheca@gmail.com。本免責聲明受南澳洲法律管轄。',
        ],
      },
    ],
  },
  notFound: {
    title: '找不到頁面 - Vivatheca',
    heading: '找不到這個頁面。',
    intro: '此連結可能已過期或輸入錯誤。請瀏覽模型庫或回到首頁。',
    models: '瀏覽模型',
    home: 'Vivatheca 首頁',
  },
});

export default zhHant;
