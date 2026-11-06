import en from './en';
import { withFallback } from './fallback';

// Vietnamese. UNREVIEWED DRAFT: drafted by AI using the project glossary
// (glossary-zh-vi-draft-v0); not yet checked by a fluent clinician. Where northern and
// southern usage differ, northern forms are used for now (e.g. lợi, not nướu); the
// reviewer should confirm. Only the site frame, model controls and disclaimer are
// translated; everything else falls back to English.

const vi = withFallback(en, {
  meta: {
    title: 'Vivatheca — Mô hình lâm sàng dễ hiểu',
    description: 'Mô hình 3D miễn phí về nha khoa và phẫu thuật miệng, mỗi mô hình bệnh đều có mô hình bình thường để so sánh, giúp nhân viên y tế làm tài liệu giáo dục bệnh nhân. Xem, tải về và in.',
    socialDescription: 'Mô hình y học 3D miễn phí trên trình duyệt, giúp trao đổi lâm sàng rõ ràng hơn.',
    createTitle: 'Soạn tài liệu cho bệnh nhân — Vivatheca',
    createDescription: 'Soạn, kiểm tra và hoàn thiện tài liệu giáo dục bệnh nhân đi kèm mô hình 3D của Vivatheca.',
  },
  language: { label: 'Ngôn ngữ' },
  common: {
    skip: 'Chuyển đến nội dung chính',
    home: 'Trang chủ Vivatheca',
    aiIllustration: 'Hình minh họa do AI tạo.',
  },
  nav: {
    primary: 'Điều hướng chính',
    browse: 'Duyệt',
    howItWorks: 'Cách sử dụng',
    publications: 'Ấn phẩm',
    contribute: 'Đóng góp',
    create: 'Soạn',
    sponsor: 'Tài trợ mô hình',
    open: 'Mở menu',
    close: 'Đóng menu',
    mobile: 'Điều hướng trên điện thoại',
    browseCollection: 'Duyệt bộ sưu tập',
    createInfo: 'Soạn tài liệu cho bệnh nhân',
    models: 'Bộ sưu tập mô hình',
    evidence: 'Bằng chứng',
    about: 'Giới thiệu',
    report: 'Báo lỗi',
    modelLibrary: 'Thư viện mô hình',
    tryViewer: 'Dùng thử trình xem 3D',
    students: 'Sinh viên',
    studentsMobile: 'Học tập cho sinh viên',
  },
  footer: {
    backToTop: 'Về đầu trang Vivatheca',
    about: 'Mô hình 3D miễn phí về bệnh răng miệng và hàm mặt, mỗi mô hình đều có mô hình bình thường để so sánh, giúp nhân viên y tế làm tài liệu giáo dục bệnh nhân.',
    badge: 'Phi lợi nhuận · Giấy phép mở',
    library: 'Thư viện mô hình',
    wisdomTooth: 'Răng khôn mọc ngầm',
    development: 'Sự phát triển của răng từ 6 đến 12 tuổi',
    orthognathic: 'Phẫu thuật xương hàm để chỉnh khớp cắn',
    report: 'Báo lỗi',
    aboutGroup: { label: 'Giới thiệu', about: 'Về Vivatheca', privacy: 'Quyền riêng tư', contact: 'Liên hệ' },
    explore: {
      label: 'Khám phá',
      featured: 'Xem mô hình nổi bật',
      how: 'Cách sử dụng',
      publications: 'Ấn phẩm',
      trust: 'Độ tin cậy và thẩm định',
      students: 'Dành cho sinh viên nha khoa và y khoa',
      templates: 'Mẫu tờ rơi và bài trình chiếu',
      print: 'In 3D mô hình',
      impact: 'Cách các mô hình được sử dụng',
    },
    participate: {
      label: 'Tham gia',
      request: 'Đề xuất mô hình mới',
      used: 'Chia sẻ cách bạn đã dùng mô hình',
      contribute: 'Đóng góp mô hình',
      review: 'Tham gia thẩm định lâm sàng',
      sponsor: 'Tài trợ mô hình',
    },
    connect: {
      label: 'Kết nối',
      partnerships: 'Hợp tác với tổ chức',
      contact: 'Liên hệ Vivatheca',
      accessibility: 'Góp ý về khả năng tiếp cận',
    },
    legal: 'Pháp lý và khả năng tiếp cận',
    privacy: 'Quyền riêng tư',
    accessibility: 'Góp ý về khả năng tiếp cận',
  },
  contact: {
    heading: 'Liên hệ',
    intro: 'Bạn có câu hỏi, cần đính chính hoặc có ý tưởng về mô hình? Hãy theo dõi Vivatheca hoặc liên hệ với chúng tôi.',
    email: 'Email',
    linkLabel: 'Liên hệ Vivatheca qua {name}',
  },
  model: {
    pause: 'Tạm dừng xoay',
    resume: 'Tiếp tục xoay',
    fullscreen: 'Xem mô hình toàn màn hình',
    loading: 'Đang tải mô hình tương tác…',
    help: 'Kéo để xoay · Cuộn hoặc chụm hai ngón để phóng to · Dùng phím mũi tên sau khi chọn mô hình',
    level: 'Mức độ giải thích',
    plain: 'Ngôn ngữ dễ hiểu',
    clinical: 'Chi tiết lâm sàng',
    stepOf: '{label} · {n} trên {total}',
    sources: 'Nguồn tài liệu và cách làm mô hình',
    sourceLabel: 'Nguồn {n}',
  },
  disclaimer: {
    title: 'Tuyên bố miễn trừ trách nhiệm — Vivatheca',
    description: 'Mô hình và thông tin của Vivatheca chỉ nhằm mục đích giáo dục chung, không phải lời khuyên y tế.',
    heading: 'Tuyên bố miễn trừ trách nhiệm',
    updated: 'Cập nhật lần cuối: {date}',
    date: '5 tháng 11 năm 2026',
    site: 'Vivatheca chỉ nhằm mục đích giáo dục chung. Đây không phải lời khuyên y tế và không được dùng để chẩn đoán, lập kế hoạch điều trị hoặc hướng dẫn phẫu thuật. Hãy hỏi nhân viên y tế có chuyên môn về sức khỏe của chính bạn.',
    model: 'Chỉ là mô hình giáo dục. Mô hình thể hiện giải phẫu hoặc bệnh điển hình, không phải của bệnh nhân thật nào, đã được đơn giản hóa và có thể có sai sót. Không dùng để chẩn đoán, lập kế hoạch điều trị, làm máng hướng dẫn phẫu thuật hoặc dùng trong hay trên cơ thể.',
    translationNote: 'Bản tiếng Việt này là bản nháp do AI soạn, mới dịch một phần trang và chưa được bác sĩ nói tiếng Việt thẩm định. Nếu có khác biệt, bản tiếng Anh là bản chính thức.',
    notReviewed: 'Chưa được thẩm định lâm sàng.',
    full: 'Toàn văn tuyên bố miễn trừ trách nhiệm',
    readFull: 'Đọc toàn văn tuyên bố miễn trừ trách nhiệm.',
    nav: 'Miễn trừ trách nhiệm',
    reviewNote: 'Đây là bản dịch tham khảo do AI soạn và chưa được thẩm định. Nếu có khác biệt với bản tiếng Anh, bản tiếng Anh được ưu tiên.',
    sections: [
      {
        heading: 'Chỉ nhằm mục đích giáo dục',
        paragraphs: [
          'Vivatheca cung cấp mô hình 3D, hình ảnh và thông tin bằng chữ để giáo dục chung và giúp nhân viên y tế giải thích bệnh cho bệnh nhân. Không có nội dung nào trên Vivatheca là lời khuyên về y tế, nha khoa hay sức khỏe.',
          'Việc sử dụng Vivatheca không tạo ra mối quan hệ giữa thầy thuốc và bệnh nhân. Hãy luôn hỏi nhân viên y tế có chuyên môn về sức khỏe của chính bạn, và đừng bao giờ trì hoãn hay bỏ qua lời khuyên chuyên môn vì điều bạn thấy ở đây.',
        ],
      },
      {
        heading: 'Mô hình là hình minh họa, không phải hồ sơ bệnh nhân',
        paragraphs: [
          'Mỗi mô hình thể hiện giải phẫu điển hình hoặc một ví dụ điển hình của bệnh. Các mô hình đã được đơn giản hóa, không được làm từ bất kỳ bệnh nhân nào có thể nhận dạng, và giải phẫu thật khác nhau giữa mỗi người. Mô hình có thể có sai sót, kể cả sau khi đã được thẩm định.',
          'Mỗi trang mô hình đều ghi rõ tình trạng thẩm định. "Chưa được thẩm định lâm sàng" nghĩa là chưa có người thẩm định có chuyên môn nào kiểm tra mô hình đó. Thẩm định lâm sàng chỉ kiểm tra độ chính xác về mặt giáo dục; điều đó không làm cho mô hình phù hợp để dùng trong lâm sàng.',
        ],
      },
      {
        heading: 'Không dùng cho lâm sàng',
        paragraphs: [
          'Không dùng mô hình, số đo hoặc tệp của Vivatheca để chẩn đoán, lập kế hoạch điều trị hoặc phẫu thuật, làm máng hướng dẫn phẫu thuật, vật cấy ghép, máng nẹp, hoặc bất kỳ thiết bị nào dùng trong hay trên cơ thể. Mô hình của Vivatheca không phải là trang thiết bị y tế và chưa được đăng ký với Cơ quan Quản lý Hàng hóa Trị liệu Úc (TGA) hay bất kỳ cơ quan quản lý nào khác.',
        ],
      },
      {
        heading: 'Dành cho nhân viên y tế và nhà giáo dục',
        paragraphs: [
          'Bạn vẫn chịu trách nhiệm về đánh giá lâm sàng của mình và phải kiểm tra mọi tài liệu bạn tạo bằng Vivatheca trước khi đưa cho bệnh nhân, kể cả việc tuân thủ các quy định về đồng thuận và quản lý tại nơi bạn làm việc.',
          'Bản nháp tạo bằng công cụ soạn tài liệu cho bệnh nhân là do AI tạo ra. AI có thể mắc lỗi, kể cả bịa ra sự kiện, con số hoặc nguồn tài liệu, và Vivatheca không thẩm định những gì bạn tạo. Không bao giờ nhập thông tin của bệnh nhân.',
        ],
      },
      {
        heading: 'In 3D',
        paragraphs: [
          'Bạn tự chịu rủi ro khi in mô hình. Chất lượng in, tỉ lệ và độ an toàn của vật liệu phụ thuộc vào máy in, cài đặt và vật liệu của bạn. Các chi tiết nhỏ có thể gây hóc nghẹn; hãy để xa tầm tay trẻ nhỏ. Mô hình in không vô trùng và không được đặt vào miệng hay cơ thể.',
        ],
      },
      {
        heading: 'Nguồn tài liệu và các trang web khác',
        paragraphs: [
          'Vivatheca có liên kết đến các dịch vụ y tế công cộng, nghiên cứu và các trang web khác để bạn tìm hiểu thêm. Chúng tôi không kiểm soát và không chịu trách nhiệm về nội dung của các trang đó.',
        ],
      },
      {
        heading: 'Không bảo đảm và giới hạn trách nhiệm',
        paragraphs: [
          'Vivatheca cùng các mô hình và thông tin được cung cấp miễn phí và "nguyên trạng", không có bất kỳ bảo đảm nào rằng chúng chính xác, đầy đủ hoặc phù hợp cho một mục đích cụ thể. Trong phạm vi pháp luật cho phép, Vivatheca cùng các giám đốc, tình nguyện viên và người đóng góp không chịu trách nhiệm về bất kỳ tổn thất hay thiệt hại nào phát sinh từ việc sử dụng hoặc dựa vào chúng.',
          'Không nội dung nào trong tuyên bố này loại trừ, hạn chế hay thay đổi bất kỳ quyền hoặc biện pháp khắc phục nào của bạn theo Luật Người tiêu dùng Úc hoặc luật khác không thể bị loại trừ.',
        ],
      },
      {
        heading: 'Giấy phép',
        paragraphs: [
          'Các mô hình được chia sẻ theo giấy phép ghi trên từng trang mô hình (thường là CC BY-SA 4.0). Giấy phép cho phép bạn sử dụng lại và chỉnh sửa tệp; điều đó không làm cho tệp phù hợp để dùng trong lâm sàng.',
        ],
      },
      {
        heading: 'Trường hợp khẩn cấp',
        paragraphs: [
          'Nếu bạn nghĩ mình đang gặp tình trạng cấp cứu y tế, hãy gọi ngay số cấp cứu tại nơi bạn ở (115 tại Việt Nam, 000 tại Úc).',
        ],
      },
      {
        heading: 'Liên hệ',
        paragraphs: [
          'Câu hỏi hoặc lỗi trong mô hình: vivatheca@gmail.com. Tuyên bố này chịu sự điều chỉnh của pháp luật bang Nam Úc.',
        ],
      },
    ],
  },
  notFound: {
    title: 'Không tìm thấy trang — Vivatheca',
    heading: 'Chúng tôi không tìm thấy trang này.',
    intro: 'Liên kết có thể đã cũ hoặc bị gõ sai. Hãy xem bộ sưu tập mô hình hoặc quay lại trang chủ.',
    models: 'Xem các mô hình',
    home: 'Trang chủ Vivatheca',
  },
});

export default vi;
