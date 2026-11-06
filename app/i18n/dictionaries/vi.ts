import en from './en';
import { withFallback } from './fallback';

// Vietnamese. UNREVIEWED DRAFT: the whole app was drafted by AI using the project
// glossary (glossary-zh-vi-draft-v0); not yet checked by a fluent clinician. Where
// northern and southern usage differ, northern forms are used for now (e.g. lợi, not
// nướu); the reviewer should confirm. English prevails where the two differ.
// Generated from en.ts plus translations; new en.ts keys fall back to English until
// translated.

const vi = withFallback(en, {
  "meta": {
    "title": "Vivatheca — Mô hình lâm sàng dễ hiểu",
    "description": "Mô hình 3D miễn phí về nha khoa và phẫu thuật miệng, mỗi mô hình bệnh đều có mô hình bình thường để so sánh, giúp nhân viên y tế làm tài liệu giáo dục bệnh nhân. Xem, tải về và in.",
    "socialDescription": "Mô hình y học 3D miễn phí trên trình duyệt, giúp trao đổi lâm sàng rõ ràng hơn.",
    "createTitle": "Soạn tài liệu cho bệnh nhân — Vivatheca",
    "createDescription": "Soạn, kiểm tra và hoàn thiện tài liệu giáo dục bệnh nhân đi kèm mô hình 3D của Vivatheca."
  },
  "language": {
    "label": "Ngôn ngữ",
    "furigana": "Furigana",
    "furiganaHint": "Show or hide readings above kanji",
    "comingSoon": "Sắp ra mắt"
  },
  "common": {
    "skip": "Chuyển đến nội dung chính",
    "home": "Trang chủ Vivatheca",
    "aiIllustration": "Hình minh họa do AI tạo."
  },
  "nav": {
    "primary": "Điều hướng chính",
    "browse": "Duyệt",
    "howItWorks": "Cách sử dụng",
    "publications": "Ấn phẩm",
    "contribute": "Đóng góp",
    "create": "Soạn",
    "sponsor": "Tài trợ mô hình",
    "open": "Mở menu",
    "close": "Đóng menu",
    "mobile": "Điều hướng trên điện thoại",
    "browseCollection": "Duyệt bộ sưu tập",
    "createInfo": "Soạn tài liệu cho bệnh nhân",
    "models": "Bộ sưu tập mô hình",
    "evidence": "Bằng chứng",
    "about": "Giới thiệu",
    "report": "Báo lỗi",
    "modelLibrary": "Thư viện mô hình",
    "tryViewer": "Dùng thử trình xem 3D",
    "students": "Sinh viên",
    "search": "Tìm kiếm",
    "studentsMobile": "Học tập cho sinh viên"
  },
  "audiences": {
    "label": "Vivatheca dành cho ai",
    "heading": "Hai cách sử dụng Vivatheca.",
    "clinicians": {
      "eyebrow": "Dành cho nhân viên y tế",
      "title": "Giải thích cho bệnh nhân",
      "text": "Mô hình và trang viết bằng ngôn ngữ dễ hiểu để giải thích một bệnh hoặc thủ thuật, cùng công cụ soạn tài liệu cho bệnh nhân đi kèm.",
      "primary": "Xem các mô hình",
      "secondary": "Soạn tài liệu cho bệnh nhân"
    },
    "students": {
      "eyebrow": "Dành cho sinh viên nha khoa và y khoa",
      "title": "Học giải phẫu và bằng chứng",
      "text": "Cùng các mô hình đó, kèm thuật ngữ chuyên môn, hệ thống phân giai đoạn và phân loại, và các nghiên cứu gốc làm cơ sở.",
      "primary": "Đến phần học tập cho sinh viên"
    },
    "note": "Trang cho bệnh nhân và trang cho sinh viên được tách riêng, để lời văn cho bệnh nhân luôn đơn giản và lời văn cho sinh viên có thể chính xác."
  },
  "learn": {
    "metaTitle": "Dành cho sinh viên nha khoa và y khoa — Vivatheca",
    "metaDescription": "Tài liệu học tập dùng mô hình 3D của Vivatheca, kèm thuật ngữ chuyên môn, hệ thống phân giai đoạn và nghiên cứu gốc, tách riêng khỏi trang cho bệnh nhân.",
    "sectionNav": "Các phần của trang web",
    "forClinicians": "Dành cho nhân viên y tế",
    "forStudents": "Dành cho sinh viên",
    "eyebrow": "Dành cho sinh viên nha khoa và y khoa",
    "heading": "Học từ các mô hình",
    "lead": "Các mô hình của Vivatheca được làm để trao đổi với bệnh nhân. Phần này của trang web dùng cùng các mô hình đó để học tập: thuật ngữ chuyên môn, các hệ thống phân giai đoạn và phân loại có tên gọi, nghiên cứu gốc, và mô tả rõ ràng những gì mỗi mô hình đơn giản hóa.",
    "differHeading": "Trang cho sinh viên khác trang cho bệnh nhân thế nào",
    "patientPages": {
      "title": "Trang cho bệnh nhân",
      "text": "Ngôn ngữ dễ hiểu, mỗi lần một ý, để nhân viên y tế dùng với bệnh nhân và gia đình."
    },
    "studentPages": {
      "title": "Trang cho sinh viên",
      "text": "Thuật ngữ chuyên môn, hệ thống phân giai đoạn và phân loại, các nghiên cứu đứng sau mỗi con số, và chỗ bằng chứng còn chưa chắc chắn."
    },
    "differNote": "Hai loại trang được tách riêng để lời văn cho bệnh nhân luôn đơn giản và lời văn cho sinh viên có thể chính xác. Cả hai dùng cùng các mô hình.",
    "audienceHeading": "Dành cho ai",
    "dental": "Sinh viên nha khoa: giải phẫu răng, sinh trưởng và phát triển, nha khoa trẻ em, chỉnh nha và phẫu thuật miệng.",
    "medical": "Sinh viên y khoa: giải phẫu đầu cổ và phẫu thuật hàm mặt.",
    "guidesHeading": "Tài liệu học tập",
    "guides": {
      "development": {
        "status": "Đã có tài liệu cho sinh viên",
        "title": "Sự phát triển của răng, từ 6 đến 12 tuổi",
        "text": "Bộ răng hỗn hợp, các hệ thống phân giai đoạn Nolla, Moorrees và Demirjian, sự tăng trưởng xương hàm, và ước tính tuổi răng khác nhau thế nào giữa các quần thể."
      },
      "cracked": {
        "status": "Đã có tài liệu cho sinh viên",
        "title": "Răng nứt: mão răng hay miếng trám",
        "text": "Nứt răng theo chiều dọc, vì sao mất gờ bên làm múi răng bị uốn, và bằng chứng về kết quả của việc phủ múi, kèm mức độ chưa chắc chắn."
      },
      "periodontitis": {
        "status": "Đã có tài liệu cho sinh viên",
        "title": "Viêm nha chu: phân giai đoạn và phân độ",
        "text": "Các giai đoạn và phân độ theo AAP/EFP 2017, mức xương dùng trong từng mô hình, và hướng dẫn điều trị từng bước của EFP."
      },
      "orthognathic": {
        "status": "Đã có tài liệu cho sinh viên",
        "title": "Phẫu thuật chỉnh hình xương hàm: loại I, II và III",
        "text": "Phân loại Angle và phân loại xương, phẫu thuật chẻ dọc cành lên (BSSO) và cắt xương Le Fort I, và thứ bậc độ ổn định khi cố định vững chắc, kèm nguồn tài liệu."
      },
      "wisdom": {
        "status": "Chi tiết lâm sàng ngay trên mô hình",
        "title": "Răng khôn hàm dưới mọc ngầm",
        "text": "Chuyển mô hình sang “Chi tiết lâm sàng” để xem thuật ngữ độ nghiêng theo Winter và liên quan của răng với dây thần kinh huyệt răng dưới, kèm nguồn tài liệu."
      },
      "oroantral": {
        "status": "Đã có tài liệu cho sinh viên",
        "title": "Thông và rò xoang hàm - miệng (OAC và OAF)",
        "text": "Giải phẫu chân răng và xoang, yếu tố nguy cơ, phân biệt OAC với OAF, và các cách đóng lỗ thông kèm bằng chứng so sánh."
      },
      "steelCrown": {
        "status": "Đã có tài liệu cho sinh viên",
        "title": "Mão kim loại làm sẵn trên răng hàm sữa",
        "text": "Chỉ định theo AAPD, mài răng thông thường so với kỹ thuật Hall, và bằng chứng về kết quả so với miếng trám."
      },
      "headNeck": {
        "status": "Đã có tài liệu cho sinh viên",
        "title": "Đầu và cổ: bốn ca bệnh đã công bố",
        "text": "Cắt đoạn và cắt bờ xương hàm dưới, phân loại Brown, vạt tự do, và bằng chứng về tái phát của u nguyên bào men, nang sừng và ung thư nhầy - biểu bì ở vòm miệng."
      }
    },
    "openGuide": "Mở tài liệu cho sinh viên",
    "openModel": "Mở mô hình 3D",
    "statusLabel": "Tình trạng thẩm định:",
    "usingHeading": "Dùng Vivatheca trong học tập",
    "using": [
      "Đối chiếu những gì bạn học ở đây với chương trình, giáo trình và người hướng dẫn. Bài giảng của trường bạn được ưu tiên.",
      "Mọi mô hình đều đã được đơn giản hóa. Hãy đọc “Về mô hình này” và các nguồn trên từng trang trước khi dựa vào một chi tiết.",
      "Có thể dùng lại các mô hình kèm ghi công theo giấy phép ghi trên từng trang mô hình (thường là CC BY-SA 4.0), kể cả trong bài tập và bài thuyết trình.",
      "Không bao giờ dùng mô hình để ra quyết định lâm sàng, kể cả khi đi thực tập."
    ],
    "toolsHeading": "Công cụ học tập",
    "tools": {
      "slices": {
        "title": "Đọc lát cắt CBCT đối chiếu với mô hình",
        "text": "Các lát cắt ngang, đứng ngang và đứng dọc của phim chụp ảo tạo từ mô hình, kèm hình dựng 3D, để luyện đối chiếu hình ảnh với giải phẫu.",
        "link": "Mở trình xem lát cắt"
      }
    },
    "patientsHeading": "Bạn muốn giải thích cho bệnh nhân?",
    "patientsText": "Phần dành cho nhân viên y tế của Vivatheca có các trang mô hình bằng ngôn ngữ dễ hiểu và công cụ soạn tài liệu cho bệnh nhân.",
    "patientsLink": "Đến các trang cho nhân viên y tế",
    "sourcesHeading": "Nguồn tài liệu",
    "citeLabel": "Nguồn {n}"
  },
  "learnDev": {
    "metaTitle": "Sự phát triển của răng, từ 6 đến 12 tuổi: tài liệu cho sinh viên — Vivatheca",
    "metaDescription": "Bộ răng hỗn hợp, phân giai đoạn hình thành răng (Nolla, Moorrees, Demirjian), biểu đồ mọc răng và sự tăng trưởng xương hàm, kèm nguồn tài liệu, cho sinh viên nha khoa và y khoa.",
    "eyebrow": "Tài liệu cho sinh viên",
    "heading": "Sự phát triển của răng, từ 6 đến 12 tuổi",
    "lead": "Tài liệu học đi kèm mô hình phát triển răng. Trang mô hình được viết cho phụ huynh; trang này dùng thuật ngữ chuyên môn và các nghiên cứu làm cơ sở cho mô hình.",
    "openModel": "Mở mô hình 3D (trang cho bệnh nhân)",
    "objectivesHeading": "Mục tiêu học tập",
    "objectives": [
      "Mô tả sự chuyển đổi từ bộ răng sữa sang bộ răng hỗn hợp rồi bộ răng vĩnh viễn trong khoảng 6 đến 12 tuổi.",
      "Phân biệt răng vĩnh viễn thay thế với răng vĩnh viễn mọc thêm.",
      "Kể tên và so sánh các hệ thống Nolla, Moorrees và Demirjian dùng để phân giai đoạn hình thành răng.",
      "Giải thích vì sao ước tính tuổi răng khác nhau giữa các phương pháp và các quần thể.",
      "Chỉ ra chỗ mô hình này đơn giản hóa hình dạng răng và sự tăng trưởng xương hàm."
    ],
    "termsHeading": "Thuật ngữ chính",
    "terms": [
      {
        "term": "Bộ răng hỗn hợp",
        "text": "Giai đoạn mà răng sữa và răng vĩnh viễn cùng có trong miệng. Trên các biểu đồ chuẩn, giai đoạn này bắt đầu khi răng hàm lớn thứ nhất và răng cửa vĩnh viễn mọc, khoảng 6 tuổi, và kết thúc khi những răng sữa cuối cùng rụng, khoảng 12 tuổi.[8][9]"
      },
      {
        "term": "Răng thay thế và răng mọc thêm",
        "text": "Răng cửa, răng nanh và răng hàm nhỏ vĩnh viễn phát triển bên dưới và thay thế răng sữa (răng thay thế). Răng hàm lớn vĩnh viễn mọc phía sau bộ răng sữa và không thay răng nào (răng mọc thêm).[1]"
      },
      {
        "term": "Mọc răng và nhú răng",
        "text": "Mọc răng là một chuyển động liên tục, nên mỗi nghiên cứu ghi nhận nó tại một mốc. London Atlas chấm điểm mọc răng so với mức xương ổ răng,[1] còn biểu đồ của ADA và AAPD cho biết tuổi răng mọc vào trong miệng.[8][9] Vì vậy tuổi lấy từ các nguồn khác nhau không thể thay thế trực tiếp cho nhau."
      },
      {
        "term": "Tiêu chân răng sinh lý",
        "text": "Chân răng sữa bị tiêu bởi các hủy cốt bào răng, liên quan với răng vĩnh viễn thay thế đang mọc, dẫn đến răng sữa rụng.[10]"
      }
    ],
    "stagingHeading": "Phân giai đoạn hình thành răng",
    "stagingIntro": "Các giai đoạn hình thành được chấm trên phim X-quang, từng răng một, và là cơ sở của hầu hết các phương pháp ước tính tuổi răng. Ba hệ thống dưới đây thuộc số được trích dẫn nhiều nhất.[3][4][5]",
    "stagingColumns": [
      "Hệ thống",
      "Các giai đoạn",
      "Cách dùng và bằng chứng"
    ],
    "staging": [
      {
        "system": "Nolla (1960)[4]",
        "stages": "Mười giai đoạn, từ khi có túi mầm răng (1) đến khi chóp chân răng đóng kín (10), với 0 là chưa có túi mầm. Thân răng và chân răng được chấm theo từng phần ba.",
        "use": "Điểm giai đoạn của từng răng được cộng lại và so với bảng tham chiếu để ước tính tuổi răng.[4]"
      },
      {
        "system": "Moorrees, Fanning và Hunt (1963)[3]",
        "stages": "Mười bốn giai đoạn: thân răng (Ci, Cco, Coc, Cr½, Cr¾, Crc), chân răng (Ri, Cli với răng nhiều chân, R¼, R½, R¾, Rc) và chóp (A½, Ac).",
        "use": "Chuẩn tuổi cho từng giai đoạn của mười răng vĩnh viễn.[3] London Atlas dùng các giai đoạn này.[1]"
      },
      {
        "system": "Demirjian, Goldstein và Tanner (1973)[5]",
        "stages": "Tám giai đoạn (A đến H) cho mỗi răng trong bảy răng vĩnh viễn hàm dưới bên trái.",
        "use": "Các giai đoạn được đổi thành điểm trưởng thành rồi thành tuổi răng.[5] Các phân tích gộp cho thấy phương pháp này ước tính tuổi cao hơn thực tế, trung bình khoảng nửa năm hoặc hơn.[6][7]"
      }
    ],
    "chartsHeading": "Biểu đồ và atlas",
    "charts": [
      "Biểu đồ Schour và Massler (1941) minh họa bộ răng đang phát triển ở các độ tuổi liên tiếp và đến nay vẫn được in lại rộng rãi.[2] Màu sắc trên các mô hình phát triển của Vivatheca (răng sữa màu xanh, răng vĩnh viễn màu vàng) theo biểu đồ này.[2]",
      "London Atlas (2010) được xây dựng từ hài cốt đã biết tuổi và phim X-quang răng của 528 người sống, từ 28 tuần trong bụng mẹ đến 23 tuổi. Atlas cho thấy giai đoạn hình thành (theo Moorrees) và giai đoạn mọc trung vị của từng nhóm tuổi. Sự hình thành răng ít biến thiên nhất ở tuổi nhũ nhi và biến thiên nhiều nhất ở răng hàm lớn thứ ba sau 16 tuổi.[1]",
      "Niên biểu của AAPD, dựa theo Logan và Kronfeld (1933), và biểu đồ mọc răng của ADA cho biết khoảng tuổi mọc và rụng của từng răng.[8][9] Thời điểm trong mô hình đã được đối chiếu với các biểu đồ này và London Atlas.[1][8][9]"
    ],
    "growthHeading": "Sự tăng trưởng xương hàm",
    "growth": [
      "Xương hàm dưới không tăng trưởng đồng đều. Trong một nghiên cứu CT 3D trên 51 người từ 1 đến 19 tuổi, các kích thước theo chiều ngang chủ yếu theo kiểu tăng trưởng sớm dạng thần kinh, còn kích thước theo chiều đứng theo kiểu thân thể (xương); khác biệt giới tính xuất hiện trở lại trong và sau tuổi dậy thì.[12]",
      "Theo dữ liệu đo sọ theo dõi dọc, khoảng sau răng hàm dưới tăng trung bình 8,73 mm từ 8 đến 18 tuổi, khoảng 1,38 mm mỗi năm quanh tuổi dậy thì.[13]",
      "Chuẩn kích thước sọ mặt theo tuổi và giới lấy từ các nghiên cứu tăng trưởng theo dõi dọc, như nghiên cứu tăng trưởng của Đại học Michigan, được xuất bản thành atlas.[14] Theo dõi 58 người tham gia đến cuối độ tuổi 40 cho thấy chiều dài xương hàm dưới, chiều dài tầng giữa mặt và chiều cao mặt vẫn tiếp tục tăng sau tuổi vị thành niên, cùng với răng tiếp tục mọc.[15]"
    ],
    "uncertainHeading": "Chỗ bằng chứng còn chưa chắc chắn",
    "uncertain": [
      "Khoảng bình thường của mỗi răng kéo dài từ một đến vài năm, nên mọi độ tuổi trên mô hình là giá trị điển hình, không phải chuẩn cho một trẻ cụ thể.[8][9] Chậm rõ rệt, chẳng hạn một răng mọc muộn hơn răng cùng tên bên đối diện quá sáu tháng, là một dấu hiệu được mô tả của chậm mọc răng.[11]",
      "Các phương pháp tuổi răng không khớp với tuổi thật và không khớp với nhau. Phương pháp Demirjian ước tính tuổi cao hơn 0,48 năm ở bé gái và 0,51 năm ở bé trai trong một phân tích gộp các nghiên cứu từ 1973 đến 2020,[6] và một phân tích gộp khác khuyến nghị dùng chuẩn riêng cho từng quần thể.[7]",
      "Hầu hết chuẩn tăng trưởng lấy từ phim X-quang 2D của trẻ em Bắc Mỹ và có thể không đại diện cho các quần thể khác.[13][14][15]"
    ],
    "simplifyHeading": "Những gì mô hình đơn giản hóa",
    "simplify": [
      "Các độ tuổi hiển thị là giá trị điển hình (trung vị hoặc trung bình) lấy từ London Atlas và các biểu đồ mọc răng.[1][8][9]",
      "Răng sữa được tạo bằng cách thu nhỏ hình dạng răng vĩnh viễn theo chiều rộng và chiều dài điển hình của răng sữa, nên hình dạng thân và chân răng không đúng hình thái răng sữa thật.[16]",
      "Xương hàm là xương hàm người lớn được điều chỉnh để gần giống của trẻ. Cách làm cụ thể, và giá trị nào là ước tính của Vivatheca chứ không có nguồn, được liệt kê ở mục “Về mô hình này” trên trang mô hình.",
      "Răng nằm ở vị trí điển hình; vị trí và độ nghiêng thật khác nhau ở mỗi người. Mô hình là hình minh họa 3D, không phải phim X-quang."
    ],
    "questionsHeading": "Tự kiểm tra",
    "questions": [
      {
        "q": "Những răng vĩnh viễn nào trên mô hình là răng mọc thêm?",
        "a": "Các răng hàm lớn vĩnh viễn. Chúng mọc phía sau bộ răng sữa và không thay thế răng sữa nào.[1]"
      },
      {
        "q": "Giai đoạn R½ theo Moorrees có nghĩa gì với răng nanh hàm dưới?",
        "a": "Chân răng đã đạt khoảng một nửa chiều dài cuối cùng.[3]"
      },
      {
        "q": "Vì sao tuổi răng theo Demirjian có thể lớn hơn tuổi thật của trẻ?",
        "a": "Các nghiên cứu gộp cho thấy phương pháp này ước tính tuổi cao hơn khoảng nửa năm ở nhiều quần thể, và độ chính xác phụ thuộc vào quần thể tham chiếu dùng để đổi điểm trưởng thành ra tuổi.[6][7]"
      }
    ]
  },
  "learnOrtho": {
    "metaTitle": "Phẫu thuật chỉnh hình xương hàm: loại I, II và III — tài liệu cho sinh viên — Vivatheca",
    "metaDescription": "Phân loại Angle, bất hài hòa xương, phẫu thuật BSSO và Le Fort I, thứ bậc độ ổn định và cách làm các mô hình Vivatheca, kèm nguồn tài liệu, cho sinh viên nha khoa và y khoa.",
    "eyebrow": "Tài liệu cho sinh viên",
    "heading": "Phẫu thuật chỉnh hình xương hàm: loại I, II và III",
    "lead": "Tài liệu học đi kèm các mô hình phẫu thuật chỉnh hình xương hàm. Trang mô hình được viết cho bệnh nhân; trang này dùng thuật ngữ phân loại, các phẫu thuật và bằng chứng về độ ổn định làm cơ sở cho mô hình.",
    "openModel": "Mở các mô hình 3D (trang cho bệnh nhân)",
    "objectivesHeading": "Mục tiêu học tập",
    "objectives": [
      "Phân biệt các loại khớp cắn răng theo Angle với bất hài hòa xương loại II hoặc loại III.",
      "Mô tả các đường cắt của phẫu thuật chẻ dọc cành lên xương hàm dưới hai bên (BSSO) và cắt xương Le Fort I, và ai mô tả chúng đầu tiên.",
      "Giải thích vì sao điều trị thường phối hợp chỉnh nha trước và sau phẫu thuật, và chờ đến khi hết tăng trưởng.",
      "Xếp các di chuyển xương hàm thường gặp theo độ ổn định sau mổ.",
      "Chỉ ra chỗ các mô hình Vivatheca đơn giản hóa giải phẫu và phẫu thuật."
    ],
    "termsHeading": "Thuật ngữ chính",
    "terms": [
      {
        "term": "Phân loại Angle",
        "text": "Phân loại khớp cắn răng theo tương quan giữa răng hàm lớn thứ nhất hàm trên và hàm dưới: loại I bình thường, loại II răng hàm dưới lùi về phía xa, loại III răng hàm dưới ra phía gần.[1]"
      },
      {
        "term": "Phân loại xương và góc ANB",
        "text": "Loại II hoặc III về xương nghĩa là chính nền xương hàm bị lệch nhau. Một số đo phim sọ nghiêng thông dụng là góc ANB; Steiner cho giá trị trung bình khoảng 2 độ ở khuôn mặt hài hòa.[2]"
      },
      {
        "term": "IOFTN",
        "text": "Chỉ số Nhu cầu Điều trị Chức năng Chỉnh hình Xương hàm (IOFTN) chấm nhu cầu phẫu thuật về chức năng theo thang năm điểm, từ 1 (không cần) đến 5 (rất cần), với 23 phân nhóm. Các yếu tố lâm sàng và tâm lý khác được đánh giá riêng.[10]"
      },
      {
        "term": "Cố định vững chắc",
        "text": "Nẹp và vít titan giữ các đoạn xương đã di chuyển trong lúc chúng lành.[7][9]"
      }
    ],
    "mechanicsHeading": "Các phẫu thuật trong mô hình",
    "mechanics": [
      "Phẫu thuật chẻ dọc cành lên xương hàm dưới hai bên (BSSO): Trauner và Obwegeser mô tả đường chẻ dọc trong miệng năm 1957.[3] Dal Pont đưa đường cắt phía má ra trước vùng răng hàm năm 1961,[4] và Hunsuck rút ngắn đường chẻ phía lưỡi năm 1968.[5] Đường chẻ để lồi cầu ở đoạn gần và các răng cùng dây thần kinh huyệt răng dưới ở đoạn xa, đoạn này có thể đưa ra trước (loại II) hoặc lùi ra sau (loại III).",
      "Cắt xương Le Fort I: một đường cắt ngang phía trên chóp chân răng, từ lỗ hình lê đến sau răng hàm cuối, giải phóng phần xương hàm trên mang răng để có thể đưa ra trước, ra sau, lên trên hoặc xuống dưới. Bell mô tả cách dùng phẫu thuật này cho biến dạng xương hàm trên năm 1975.[6]",
      "Quy trình: chỉnh nha đơn thuần không thể sửa bất hài hòa xương nặng. Điều trị thường chờ hết tăng trưởng và phối hợp chỉnh nha trước và sau phẫu thuật; Orthodontics Australia cho biết tổng cộng khoảng 2 năm, đeo mắc cài thêm khoảng 6 đến 9 tháng sau mổ.[8][9]"
    ],
    "evidenceHeading": "Độ ổn định: những di chuyển nào bị tái phát",
    "evidenceColumns": [
      "Nhóm",
      "Các di chuyển",
      "Thay đổi trong năm đầu"
    ],
    "evidence": [
      {
        "study": "Rất ổn định[7]",
        "design": "Xương hàm trên đưa lên; xương hàm dưới đưa ra trước (tại UNC chỉ ở bệnh nhân có chiều cao mặt ngắn hoặc bình thường); chỉnh vị trí cằm",
        "finding": "Ít thay đổi trong năm đầu sau mổ."
      },
      {
        "study": "Ổn định[7]",
        "design": "Xương hàm trên đưa ra trước",
        "finding": "Ít hoặc không thay đổi ở khoảng 80% bệnh nhân; tái phát 2 đến 4 mm ở 20%."
      },
      {
        "study": "Chỉ ổn định khi cố định vững chắc[7]",
        "design": "Phẫu thuật hai hàm loại II (hàm trên đưa lên, hàm dưới ra trước) hoặc loại III (hàm trên ra trước, hàm dưới lùi sau); chỉnh mặt lệch",
        "finding": "Ổn định khi dùng nẹp vít; chỉnh mặt lệch vẫn có tái phát theo chiều ngang hơn 2 mm ở khoảng một phần ba bệnh nhân."
      },
      {
        "study": "Có vấn đề[7]",
        "design": "Chỉ lùi xương hàm dưới; đưa xương hàm trên xuống; nong rộng xương hàm trên",
        "finding": "Không có cố định đặc biệt thì tới 50% thay đổi hơn 2 mm; 30% mất hơn 3 mm độ nong ở vùng răng hàm."
      }
    ],
    "uncertainHeading": "Chỗ bằng chứng còn chưa chắc chắn",
    "uncertain": [
      "Thứ bậc độ ổn định được tổng hợp từ một trung tâm: cơ sở dữ liệu của Đại học North Carolina gồm 2.264 bệnh nhân, hầu hết do một phẫu thuật viên mổ. Nó mô tả thay đổi trong năm đầu sau mổ.[7]",
      "Các con số nguy cơ đưa cho bệnh nhân trên trang mô hình lấy từ tờ thông tin đồng thuận của một bệnh viện (khoảng 10 trên 100 người bị tê môi hoặc cằm vài tuần; dưới 1 trên 100 người còn thay đổi cảm giác sau một năm), không phải từ tổng quan hệ thống.[11]",
      "Chính sách của NHS được trích dẫn cho quy trình điều trị là chính sách tạm thời từ năm 2013; hãy kiểm tra xem có phiên bản mới hơn không.[8]"
    ],
    "simplifyHeading": "Những gì các mô hình đơn giản hóa",
    "simplify": [
      "Cả bảy mô hình dùng một hộp sọ và xương hàm dưới người lớn từ Z-Anatomy, không có răng hàm lớn thứ ba. Các biến dạng được tạo bằng cách uốn hộp sọ này, không lấy từ phim chụp bệnh nhân.",
      "Mức di chuyển (loại II: hàm dưới lùi 6 mm; loại III: hàm trên lùi 3 mm và hàm dưới ra trước 5 mm) là giá trị giảng dạy chọn cho mô hình, không lấy từ một nghiên cứu nào. Phẫu thuật đảo ngược chính xác các mức này, nên mọi mô hình sau mổ đều trở về khớp cắn bình thường.",
      "Đường cắt xương là mặt phẳng; đường cắt thật cong và khác nhau tùy phẫu thuật viên. Mô mềm, dây thần kinh huyệt răng dưới, vị trí lồi cầu và sự xoay mặt phẳng cắn không được thể hiện. Cằm của Z-Anatomy được làm cao hơn ở mọi mô hình theo chuẩn đã công bố (bờ cắn răng cửa đến điểm Menton 44,78 mm; lỗ cằm cách bờ dưới 14,98 mm), nhờ đó phẫu thuật tạo hình cằm tùy chọn (đưa ra trước 5 mm ở loại II, lùi 4 mm ở loại III) có thể cắt dưới chân răng và thấp hơn hẳn lỗ cằm."
    ],
    "questionsHeading": "Tự kiểm tra",
    "questions": [
      {
        "q": "Mô hình loại II dùng BSSO đưa hàm ra trước. Di chuyển này nằm ở đâu trong thứ bậc độ ổn định?",
        "a": "Rất ổn định, dù tại UNC chỉ áp dụng cho bệnh nhân có chiều cao mặt ngắn hoặc bình thường.[7]"
      },
      {
        "q": "Vì sao mô hình loại III cần cả Le Fort I và BSSO?",
        "a": "Loại III của mô hình gồm xương hàm trên lùi và xương hàm dưới nhô, nên hàm trên được đưa ra trước (Le Fort I) và hàm dưới được lùi ra sau (BSSO). Phẫu thuật hai hàm loại III ổn định khi cố định vững chắc, còn chỉ lùi hàm dưới thuộc nhóm có vấn đề.[7]"
      },
      {
        "q": "Hunsuck đã thay đổi gì trong đường chẻ dọc?",
        "a": "Ông rút ngắn đường chẻ phía lưỡi để nó kết thúc ngay sau lưỡi gà xương hàm dưới, thay vì chạy tới bờ sau cành lên.[5]"
      }
    ]
  },
  "learnOac": {
    "metaTitle": "Thông và rò xoang hàm - miệng (OAC và OAF) — tài liệu cho sinh viên — Vivatheca",
    "metaDescription": "Giải phẫu chân răng và xoang, yếu tố nguy cơ, phân biệt OAC với OAF, các cách đóng lỗ thông và bằng chứng so sánh, kèm nguồn tài liệu, cho sinh viên nha khoa và y khoa.",
    "eyebrow": "Tài liệu cho sinh viên",
    "heading": "Thông và rò xoang hàm - miệng (OAC và OAF)",
    "lead": "Tài liệu học đi kèm mô hình thông xoang hàm - miệng. Trang mô hình được viết cho bệnh nhân; trang này dùng thuật ngữ chuyên môn, quy tắc ra quyết định và các nghiên cứu làm cơ sở cho mô hình.",
    "openModel": "Mở mô hình 3D (trang cho bệnh nhân)",
    "objectivesHeading": "Mục tiêu học tập",
    "objectives": [
      "Mô tả liên quan giữa chóp chân các răng sau hàm trên với sàn xoang, và cách chẩn đoán hình ảnh.",
      "Phân biệt thông xoang hàm - miệng (OAC) với rò xoang hàm - miệng (OAF).",
      "Kể các yếu tố nguy cơ của OAC sau nhổ răng.",
      "Chọn giữa bảo vệ cục máu đông, vạt trượt niêm mạc má, vạt mỡ má và vạt xoay khẩu cái, và nêu giới hạn của từng cách.",
      "Tóm tắt bằng chứng so sánh và chỗ các nguồn không thống nhất."
    ],
    "termsHeading": "Thuật ngữ chính",
    "terms": [
      {
        "term": "Thông xoang hàm - miệng (OAC)",
        "text": "Lỗ thông mới, chưa có biểu mô phủ, giữa khoang miệng và xoang hàm trên, thường xảy ra sau nhổ một răng sau hàm trên.[1]"
      },
      {
        "term": "Rò xoang hàm - miệng (OAF)",
        "text": "OAC tồn tại kéo dài và được biểu mô phủ, tạo thành đường rò vĩnh viễn; xoang thường bị nhiễm khuẩn.[1]"
      },
      {
        "term": "Vạt trượt niêm mạc má (vạt Rehrmann)",
        "text": "Vạt niêm mạc - màng xương phía má được kéo trượt phủ lên chỗ khuyết. Phù hợp với khuyết nhỏ và vừa; làm nông ngách tiền đình.[1]"
      },
      {
        "term": "Vạt mỡ má",
        "text": "Khối mỡ má có cuống được kéo vào chỗ khuyết, được Egyedi mô tả lần đầu để đóng lỗ thông xoang năm 1977.[5] Phù hợp với vùng phía sau và có thể phối hợp với vạt niêm mạc má.[1]"
      },
      {
        "term": "Vạt xoay khẩu cái",
        "text": "Vạt dày, giàu mạch máu, có cuống phía sau là động mạch khẩu cái lớn, được xoay phủ lên chỗ khuyết. Vạt để lại xương khẩu cái lộ ra, lành bằng biểu mô hóa thì hai.[2]"
      }
    ],
    "mechanicsHeading": "Giải phẫu, nguy cơ và chẩn đoán",
    "mechanics": [
      "Chóp chân răng hàm lớn thứ nhất và thứ hai nằm gần sàn xoang nhất. Các nghiên cứu CT và CBCT ghi nhận khoảng cách trung bình khoảng 0 đến 4 mm ở các răng này, và một số chân răng nhô vào trong xoang.[6][7][8]",
      "Trong các loạt ca bệnh, răng hàm lớn thứ nhất là răng liên quan nhiều nhất.[1][9] Các yếu tố nguy cơ được báo cáo còn gồm tuổi cao, gãy chân răng khi nhổ, nhiễm khuẩn quanh chóp và chân răng trông như nằm trong xoang trên phim.[1][10]",
      "Phim toàn cảnh là đủ khi chân răng và sàn xoang tách biệt rõ; khi chúng có vẻ chạm hoặc chồng lên nhau, CBCT cho thấy liên quan chính xác hơn.[11]",
      "Dấu hiệu gồm nước đi từ miệng lên mũi cùng bên, thoát hơi, và mủ, nghẹt mũi hoặc đau do viêm xoang. Lỗ thông rất nhỏ có thể không gây dấu hiệu gì.[1][3]"
    ],
    "evidenceHeading": "Xử trí và bằng chứng",
    "evidenceColumns": [
      "Tình huống hoặc nghiên cứu",
      "Cách xử trí",
      "Kết quả hoặc quy tắc"
    ],
    "evidence": [
      {
        "study": "OAC dưới 2 mm, chưa có biểu mô, không viêm xoang[1]",
        "design": "Bảo vệ cục máu đông",
        "finding": "Có thể tự lành sau khi hình thành cục máu đông. Khuyết trên 5 mm, hoặc tồn tại quá 3 tuần, hiếm khi tự lành."
      },
      {
        "study": "OAC lớn hơn[1]",
        "design": "Đóng trong vòng 24 đến 48 giờ",
        "finding": "Lỗ thông kéo dài làm tăng khả năng viêm xoang hàm. Bờ vạt nên tựa trên xương lành cách chỗ khuyết ít nhất 5 mm, không bị căng."
      },
      {
        "study": "OAF[1]",
        "design": "Cắt bỏ đường rò có biểu mô, làm sạch, rồi đóng",
        "finding": "Đóng khi xoang đã hết bệnh, bơm rửa và dùng kháng sinh trước nếu có nhiễm khuẩn."
      },
      {
        "study": "Oliva 2024[4]",
        "design": "Phân tích gộp mạng lưới 9 thử nghiệm ngẫu nhiên có đối chứng",
        "finding": "Ưu tiên vạt mỡ má hơn vạt trượt niêm mạc má và vạt xoay khẩu cái về đóng lỗ thông và tái phát."
      },
      {
        "study": "Dipalma 2025[3]",
        "design": "Tổng quan hệ thống",
        "finding": "Báo cáo xử trí bảo tồn với khuyết dưới 5 mm và đóng bằng phẫu thuật với khuyết trên 5 mm."
      }
    ],
    "uncertainHeading": "Chỗ bằng chứng còn chưa chắc chắn",
    "uncertain": [
      "Các nguồn không thống nhất về lỗ thông nào có thể để tự lành: Parvini và cộng sự cho là dưới 2 mm, còn một tổng quan năm 2025 báo cáo xử trí bảo tồn cho lỗ dưới 5 mm.[1][3]",
      "Phân tích gộp mạng lưới chỉ gộp 9 thử nghiệm ngẫu nhiên, nên thứ hạng các vạt dựa trên ít nghiên cứu.[4]",
      "Khoảng cách giữa chân răng và xoang khác nhau giữa các quần thể và nghiên cứu, nên giá trị trung bình dùng trong mô hình có thể không khớp với từng bệnh nhân.[6][7][8]"
    ],
    "simplifyHeading": "Những gì mô hình đơn giản hóa",
    "simplify": [
      "Xương và các răng hàm lớn thứ nhất, thứ hai lấy từ hộp sọ Z-Anatomy, có xương hàm trên chỉ có xoang nhỏ, nên xoang được khoét bên trong, giữ thành dày 1,5 mm.",
      "Chiều cao sàn xoang được đặt trong khoảng đã công bố: 3 mm xương phủ trên chóp chân răng ở giai đoạn bình thường, và chóp chân răng nằm trong xoang 4 mm (phủ 0,5 mm xương) ở các giai đoạn khác.[6][7][8]",
      "Độ dày lợi (2,25 mm) là giá trị ước tính. Lỗ thông, đường rò (rộng 3,2 mm), cục máu đông, các vạt và vạt mỡ được vẽ để minh họa ý tưởng, không đo từ bệnh nhân.",
      "Vạt xoay khẩu cái được thể hiện ở vùng răng hàm lớn để so sánh, dù vạt này chủ yếu khả thi ở vùng răng hàm nhỏ.[2]"
    ],
    "questionsHeading": "Tự kiểm tra",
    "questions": [
      {
        "q": "Phát hiện OAC 1,5 mm sau nhổ răng hàm lớn thứ nhất, không có dấu hiệu viêm xoang. Cách xử trí ban đầu hợp lý là gì?",
        "a": "Bảo vệ cục máu đông: lỗ thông dưới khoảng 2 mm, chưa có biểu mô và không viêm xoang có thể tự lành.[1]"
      },
      {
        "q": "Vì sao vạt xoay khẩu cái ít phù hợp với vùng răng hàm lớn?",
        "a": "Ở vùng răng hàm lớn, độ xoay cần thiết tạo lực căng có thể gây thiếu máu, và xoay quá mức có thể gây hoại tử vạt.[2]"
      },
      {
        "q": "Phải làm gì với OAF trước khi đóng?",
        "a": "Cắt bỏ đường rò có biểu mô, làm sạch đến mô được tưới máu tốt và điều trị nhiễm khuẩn xoang trước.[1]"
      }
    ]
  },
  "learnSsc": {
    "metaTitle": "Mão kim loại làm sẵn trên răng hàm sữa — tài liệu cho sinh viên — Vivatheca",
    "metaDescription": "Chỉ định mão thép không gỉ, mài răng thông thường so với kỹ thuật Hall, và bằng chứng về kết quả so với phục hồi trong thân răng, kèm nguồn tài liệu, cho sinh viên nha khoa.",
    "eyebrow": "Tài liệu cho sinh viên",
    "heading": "Mão kim loại làm sẵn trên răng hàm sữa",
    "lead": "Tài liệu học đi kèm mô hình mão thép. Trang mô hình được viết cho phụ huynh; trang này dùng thuật ngữ chuyên môn, các chỉ định và nghiên cứu về kết quả làm cơ sở cho mô hình.",
    "openModel": "Mở mô hình 3D (trang cho bệnh nhân)",
    "objectivesHeading": "Mục tiêu học tập",
    "objectives": [
      "Kể các chỉ định theo AAPD của mão kim loại làm sẵn (mão thép không gỉ, SSC) trên răng hàm sữa.",
      "So sánh mài răng làm mão thông thường với kỹ thuật Hall.",
      "Tóm tắt bằng chứng về kết quả của mão so với phục hồi trong thân răng, và mức độ tin cậy.",
      "Chỉ ra chỗ mô hình đơn giản hóa răng và cách mài."
    ],
    "termsHeading": "Thuật ngữ chính",
    "terms": [
      {
        "term": "Mão kim loại làm sẵn (SSC)",
        "text": "Mão thép không gỉ làm sẵn, bao toàn bộ răng hàm sữa và được gắn xi măng sau khi mài.[1][4]"
      },
      {
        "term": "Kỹ thuật Hall",
        "text": "Mão được gắn chụp lên răng hàm sữa bị sâu mà không gây tê, không lấy sâu và không mài răng, bịt kín phần sâu răng bên trong.[3]"
      },
      {
        "term": "Thất bại lớn và thất bại nhỏ",
        "text": "Các nhóm kết quả dùng trong thử nghiệm: thất bại lớn gồm viêm tủy không hồi phục, áp xe hoặc mất răng; thất bại nhỏ là vấn đề xử trí được mà không mất tủy hay mất răng, như viêm tủy có hồi phục hoặc phục hồi cần sửa.[2][3]"
      }
    ],
    "mechanicsHeading": "Chỉ định và kỹ thuật",
    "mechanics": [
      "Chỉ định theo AAPD gồm tổn thương sâu nhiều mặt hoặc lớn, răng sau lấy tủy buồng hoặc lấy tủy toàn bộ, khiếm khuyết phát triển, răng gãy và nguy cơ sâu răng cao, nhất là khi điều trị dưới an thần hoặc gây mê toàn thân.[1][4]",
      "Lý do: phục hồi trong thân răng chỉ thay phần mô răng đã mất và để lại thành mỏng quanh lỗ sâu lớn, còn mão bao toàn bộ răng, giữ răng liền khối và không để lại bờ hở nào nơi sâu răng mới có thể bắt đầu.[1][4]",
      "Trong kỹ thuật thông thường, răng được gây tê, lấy sâu và mài mặt nhai cùng các mặt bên trước khi thử và gắn mão.[2] Trong kỹ thuật Hall không làm bước nào trong số này.[3]"
    ],
    "evidenceHeading": "Kết quả: các nghiên cứu cho thấy gì",
    "evidenceColumns": [
      "Nghiên cứu",
      "Thiết kế",
      "Kết quả chính"
    ],
    "evidence": [
      {
        "study": "Innes 2015 (Cochrane)[2]",
        "design": "Tổng quan hệ thống các thử nghiệm ngẫu nhiên có đối chứng",
        "finding": "Mão so với miếng trám, dài hạn: thất bại lớn RR 0,18 (KTC 95% 0,06 đến 0,56; 3 thử nghiệm, 346 răng, độ tin cậy trung bình); đau RR 0,15 (0,04 đến 0,67; 2 thử nghiệm, 312 răng). Không có thử nghiệm ngẫu nhiên nào so sánh Hall với mão thông thường."
      },
      {
        "study": "Innes 2011[3]",
        "design": "Thử nghiệm ngẫu nhiên, kỹ thuật Hall so với phục hồi do nha sĩ tổng quát thực hiện, 5 năm",
        "finding": "Thất bại lớn 3% so với 16,5%; thất bại nhỏ 5% so với 42%."
      },
      {
        "study": "Wu 2021[6]",
        "design": "Nghiên cứu hồi cứu chia hai nửa miệng, 988 răng hàm",
        "finding": "Tỉ lệ tồn tại sau 2 năm 92,8% với SSC so với 80,0% với phục hồi trong thân răng nhiều mặt; khác biệt lớn nhất ở trẻ từ 4 tuổi trở xuống."
      },
      {
        "study": "Randall 2000[5]",
        "design": "Tổng quan hệ thống, 10 nghiên cứu (phần lớn hồi cứu)",
        "finding": "Thất bại 1,9 đến 30,3% với mão kim loại làm sẵn so với 11,6 đến 88,7% với amalgam."
      }
    ],
    "uncertainHeading": "Chỗ bằng chứng còn chưa chắc chắn",
    "uncertain": [
      "AAPD lưu ý rằng phần lớn bằng chứng về mão kim loại làm sẵn đến từ nghiên cứu không ngẫu nhiên và hồi cứu.[1]",
      "Tổng quan Cochrane đánh giá so sánh chính ở mức độ tin cậy trung bình và không tìm thấy thử nghiệm nào so sánh kỹ thuật Hall với mão thông thường.[2]",
      "Các so sánh cũ hơn được làm với amalgam, và tỉ lệ thất bại rất khác nhau giữa các nghiên cứu.[5]"
    ],
    "simplifyHeading": "Những gì mô hình đơn giản hóa",
    "simplify": [
      "Răng là răng hàm lớn thứ nhất hàm dưới vĩnh viễn và tủy của Z-Anatomy, thu nhỏ theo kích thước điển hình của răng hàm sữa thứ hai (thân răng 9,9 mm gần - xa, 8,7 mm ngoài - trong, chiều cao thân 5,5 mm, chân 9,8 mm), với chân răng được làm thẳng và loe ra.[7]",
      "Cách mài chỉ mang tính minh họa: mài mặt nhai 1,5 mm theo các múi, mài mặt gần và mặt xa 1,0 mm, không mài mặt ngoài và mặt trong, bờ nằm dưới đường nối men - xê măng 0,5 mm. Đây là giá trị giảng dạy, không lấy từ một nguồn nào.",
      "Thành mão dày 0,35 mm, dày hơn mão thật để in được. Lợi và xương là khối giảng dạy. Kỹ thuật Hall được mô tả nhưng không làm thành một giai đoạn riêng."
    ],
    "questionsHeading": "Tự kiểm tra",
    "questions": [
      {
        "q": "Kể ba chỉ định theo AAPD của mão kim loại làm sẵn trên răng hàm sữa.",
        "a": "Ba trong số: tổn thương nhiều mặt hoặc lớn, sau lấy tủy buồng hoặc lấy tủy toàn bộ, khiếm khuyết phát triển, răng gãy, nguy cơ sâu răng cao (nhất là dưới an thần hoặc gây mê toàn thân).[1]"
      },
      {
        "q": "Trong thử nghiệm 5 năm về kỹ thuật Hall, thất bại lớn so với phục hồi thông thường thế nào?",
        "a": "3% với kỹ thuật Hall so với 16,5% với phục hồi do nha sĩ tổng quát thực hiện.[3]"
      },
      {
        "q": "Tổng quan Cochrane nói gì về Hall so với mão thông thường?",
        "a": "Không có thử nghiệm ngẫu nhiên nào so sánh hai cách này, nên chưa biết từ thử nghiệm ngẫu nhiên cách nào tốt hơn.[2]"
      }
    ]
  },
  "learnHn": {
    "metaTitle": "Đầu và cổ: cắt bỏ và tái tạo trong bốn ca bệnh — tài liệu cho sinh viên — Vivatheca",
    "metaDescription": "Cắt đoạn và cắt bờ xương hàm dưới, phân loại khuyết hổng theo Brown, tái tạo bằng vạt tự do, và bằng chứng về tái phát của u nguyên bào men, nang sừng do răng và ung thư biểu mô nhầy - biểu bì ở vòm miệng, kèm nguồn tài liệu.",
    "eyebrow": "Tài liệu cho sinh viên",
    "heading": "Đầu và cổ: cắt bỏ và tái tạo trong bốn ca bệnh",
    "lead": "Tài liệu học đi kèm bốn mô hình ca bệnh đầu và cổ. Mỗi mô hình theo một bệnh nhân đã được công bố. Các trang ca bệnh được viết cho bệnh nhân; trang này dùng thuật ngữ phẫu thuật, bằng chứng về tái phát và các lựa chọn khi làm mô hình.",
    "openModel": "Mở các ca bệnh 3D (trang cho bệnh nhân)",
    "objectivesHeading": "Mục tiêu học tập",
    "objectives": [
      "Phân biệt cắt đoạn với cắt bờ xương hàm dưới, và mô tả khuyết hổng xương hàm dưới theo phân loại Brown.",
      "Kể tên các vạt tự do dùng để tái tạo xương và mô mềm vùng hàm, và ai đã đưa chúng vào sử dụng.",
      "So sánh tái phát sau điều trị bảo tồn và điều trị triệt để u nguyên bào men và nang sừng do răng.",
      "Giải thích vì sao ung thư biểu mô nhầy - biểu bì độ thấp ở vòm miệng, chưa xâm lấn xương, có thể được điều trị mà không cắt xương.",
      "Chỉ ra chỗ mô hình dựa trên ca bệnh đơn giản hóa hoặc khác với ca đã công bố."
    ],
    "termsHeading": "Thuật ngữ chính",
    "terms": [
      {
        "term": "Cắt đoạn và cắt bờ xương hàm dưới",
        "text": "Cắt đoạn lấy đi một đoạn xương hàm dưới hết chiều cao và làm gián đoạn xương. Cắt bờ lấy phần xương ổ răng và giữ lại bờ dưới, nên xương vẫn liên tục.[3][5]"
      },
      {
        "term": "Phân loại Brown (xương hàm dưới)",
        "text": "Brown và cộng sự phân loại khuyết hổng xương hàm dưới theo việc cắt bỏ góc nào trong bốn góc (hai góc hàm và hai răng nanh), thêm hậu tố c khi lấy cả lồi cầu.[3] Mô hình SCC là khuyết hổng loại IIc.[1][3]"
      },
      {
        "term": "Vạt xương mác tự do",
        "text": "Một đoạn xương mác có mạch nuôi, được cắt thành nhiều đoạn để theo đường cong của xương hàm. Hidalgo đưa vạt này vào tái tạo xương hàm dưới năm 1989.[2]"
      },
      {
        "term": "Vạt cẳng tay quay tự do",
        "text": "Vạt cân - da mỏng, mềm dẻo lấy từ cẳng tay, được Soutar và cộng sự đưa vào tái tạo trong miệng năm 1983.[4]"
      }
    ],
    "mechanicsHeading": "Bốn ca bệnh",
    "mechanics": [
      "Ung thư biểu mô tế bào vảy: bạch sản sùi tăng sinh ở lợi chuyển dạng ác tính, với ung thư biểu mô tế bào vảy ở lợi phía má bên phải vùng 45–47 xâm lấn xương hàm dưới. Điều trị gồm cắt đoạn xương hàm dưới bên phải, tái tạo bằng vạt xương mác tự do chia ba đoạn, và xạ trị bổ trợ.[1]",
      "U nguyên bào men: nam 32 tuổi, vùng thấu quang nhiều hốc ở 32–35. Cắt bờ xương hàm dưới giữ lại khoảng 6 mm bờ dưới, gia cố bằng nẹp tái tạo titan.[5]",
      "Nang sừng do răng: nam 54 tuổi, vùng thấu quang một hốc ở chân răng 34 và 35. Bóc nang, cắt chóp cả hai răng và mài xương ngoại vi bằng siêu âm piezo giúp giữ được răng; không tái phát sau 36 tháng.[7]",
      "Ung thư biểu mô nhầy - biểu bì: nam 42 tuổi, khối u độ thấp (AFIP) 6 mm ở khẩu cái cứng bên phải. Cắt rộng tại chỗ kèm màng xương, không cắt xương, đặt máng che khẩu cái; diện cắt ngoại vi trên 5 mm và diện cắt sâu 0,2 mm với lớp màng xương sạch u.[11]"
    ],
    "evidenceHeading": "Tái phát: các nghiên cứu cho thấy gì",
    "evidenceColumns": [
      "Bệnh và nghiên cứu",
      "Thiết kế",
      "Kết quả"
    ],
    "evidence": [
      {
        "study": "U nguyên bào men: Almeida 2016[6]",
        "design": "Tổng quan hệ thống và phân tích gộp",
        "finding": "Với u nguyên bào men thể đặc hoặc nhiều nang, tái phát sau điều trị bảo tồn cao hơn khoảng 3 lần so với sau cắt bỏ."
      },
      {
        "study": "Nang sừng: Al-Moraissi 2017[8]",
        "design": "Tổng quan hệ thống và phân tích gộp",
        "finding": "Tái phát 23,1% sau bóc nang đơn thuần, 11,5% khi dùng dung dịch Carnoy, 32,3% sau mở thông nang đơn thuần, 8,4% sau cắt bỏ."
      },
      {
        "study": "Nang sừng: Chrcanovic và Gomez 2017[9]",
        "design": "Phân tích gộp, 6.427 ca",
        "finding": "Tái phát 22,5% sau bóc nang đơn thuần, 18,6% khi mài xương ngoại vi, 5,3% khi dùng dung dịch Carnoy, 2,2% sau cắt bỏ."
      },
      {
        "study": "Nang sừng: Jacobs 2024[10]",
        "design": "Nghiên cứu so sánh, 5-fluorouracil so với Carnoy cải tiến",
        "finding": "Không tái phát ở 99 ca dùng 5-FU so với 27 trên 114 ca dùng Carnoy cải tiến; tổn thương thần kinh 7% so với 18%."
      },
      {
        "study": "Ung thư nhầy - biểu bì vòm miệng: Ellam 2026, trích dẫn Ord[11]",
        "design": "Báo cáo ca bệnh kèm tổng quan y văn",
        "finding": "Với ung thư nhầy - biểu bì độ thấp ở vòm miệng chưa xâm lấn xương trên phim, cắt niêm mạc đơn thuần không làm tăng tái phát tại chỗ trong 5 năm; độ mô học, giai đoạn và diện cắt quan trọng hơn việc cắt xương thường quy."
      }
    ],
    "uncertainHeading": "Chỗ bằng chứng còn chưa chắc chắn",
    "uncertain": [
      "Tỉ lệ tái phát nang sừng được gộp từ các nghiên cứu khác nhau về cỡ mẫu, thời gian theo dõi và loại ca, và hai tổng quan lớn cho số liệu khác nhau với cùng một cách điều trị.[8][9]",
      "Phân độ ung thư nhầy - biểu bì phụ thuộc vào hệ thống: khối u vòm miệng là độ thấp theo AFIP nhưng độ trung bình theo tiêu chí Brandwein.[11]",
      "Mỗi mô hình theo một báo cáo ca bệnh. Báo cáo ca bệnh cho thấy những gì đã làm cho một bệnh nhân, không phải điều tốt nhất cho đa số bệnh nhân.[1][5][7][11]"
    ],
    "simplifyHeading": "Những gì các mô hình đơn giản hóa",
    "simplify": [
      "Cả bốn ca dùng một hộp sọ và xương hàm dưới Z-Anatomy, không dùng phim chụp của bệnh nhân. Tổn thương là các hình đơn giản; khi bài báo không cho kích thước, kích thước do chúng tôi chọn và được ghi trên trang ca bệnh.",
      "Phạm vi SCC lấy từ phim toàn cảnh sau một tháng vì bài báo không mô tả chi tiết phẫu thuật; ca bệnh dùng xương mác trái, mô hình dùng lưới xương mác phải.[1]",
      "Mô mềm, dây thần kinh và cơ không được làm, trừ chỗ mô bị cắt bỏ, và vùng cổ không được thể hiện, dù phẫu thuật vùng cổ thường là một phần của điều trị ung thư."
    ],
    "questionsHeading": "Tự kiểm tra",
    "questions": [
      {
        "q": "Vì sao u nguyên bào men có thể điều trị bằng cắt bờ thay vì cắt đoạn?",
        "a": "Có thể giữ đủ bờ dưới (khoảng 6 mm) để duy trì sự liên tục của xương, gia cố bằng nẹp.[5]"
      },
      {
        "q": "Trong Al-Moraissi 2017, cách điều trị nang sừng đơn lẻ nào có tỉ lệ tái phát gộp cao nhất?",
        "a": "Mở thông nang đơn thuần, 32,3%.[8]"
      },
      {
        "q": "Khuyết hổng từ lồi cầu đến vùng răng cửa bên ở một bên thuộc loại Brown nào?",
        "a": "Loại IIc: gồm một răng nanh và lồi cầu.[3]"
      }
    ]
  },
  "learnSlices": {
    "metaTitle": "Đọc lát cắt CBCT đối chiếu với mô hình 3D — công cụ cho sinh viên — Vivatheca",
    "metaDescription": "Các lát cắt ngang, đứng ngang và đứng dọc của phim CT chùm tia hình nón ảo tạo từ chính các mô hình 3D của Vivatheca, kèm hình dựng khối, cho sinh viên học đọc hình ảnh răng và xương hàm.",
    "eyebrow": "Công cụ cho sinh viên",
    "heading": "Đọc lát cắt đối chiếu với mô hình",
    "lead": "CT chùm tia hình nón (CBCT) được đọc theo từng lát cắt, nhưng giải phẫu là ba chiều. Ở đây mỗi phim là một CBCT ảo của một mô hình Vivatheca, để bạn đi qua các lát cắt và đối chiếu những gì thấy được với cùng mô hình đó ở dạng 3D.[3]",
    "notPatient": "Các phim này không phải của người thật nào. Mỗi phim được tính từ lưới mô hình: mọi voxel nằm trong xương, răng, dây thần kinh hoặc nẹp được gán một giá trị CT điển hình của mô đó, còn lại là không khí. Không có nhiễu máy chụp, không có tán xạ và không có bệnh nhân.",
    "volumeLabel": "Phim",
    "viewLabel": "Chế độ xem",
    "windowLabel": "Cửa sổ",
    "loading": "Đang tải phim…",
    "failed": "Không khởi động được trình xem. Trình xem cần WebGL2; hãy thử trình duyệt khác.",
    "position": "Tâm ngắm (mm, giá trị):",
    "volumes": {
      "wisdom-tooth": {
        "label": "Răng cối lớn thứ ba hàm dưới mọc ngầm nghiêng gần"
      },
      "scc-before": {
        "label": "Ung thư biểu mô tế bào vảy nướu hàm dưới, trước phẫu thuật cắt bỏ"
      },
      "scc-after": {
        "label": "Xương hàm dưới sau cắt đoạn và tái tạo bằng vạt xương mác tự do"
      }
    },
    "views": {
      "multiplanar": "Cả ba mặt phẳng + 3D",
      "axial": "Cắt ngang",
      "coronal": "Đứng ngang",
      "sagittal": "Đứng dọc",
      "render": "Hình dựng 3D"
    },
    "windows": {
      "bone": "Xương",
      "soft": "Mô mềm",
      "metal": "Kim loại"
    },
    "readingHeading": "Cách sử dụng",
    "reading": [
      "Nhấp hoặc kéo trong một lát cắt để di chuyển tâm ngắm; hai lát cắt còn lại sẽ đi theo. Hình dựng khối cho thấy tâm ngắm nằm ở đâu trong không gian 3D.",
      "Lát cắt ngang được nhìn từ dưới lên, bên phải bệnh nhân nằm bên trái màn hình, như trong phần mềm CBCT lâm sàng. Lát cắt đứng ngang được nhìn từ phía trước.",
      "Cửa sổ xương cho thấy xương vỏ, xương xốp và răng; cửa sổ mô mềm làm rõ ống thần kinh và khối u; cửa sổ kim loại cho thấy nẹp và vít mà không bị lóa.",
      "Trong phim răng khôn, hãy theo ống thần kinh răng dưới (rãnh màu xám đậm hơn) qua các lát cắt ngang cho đến khi gặp chân răng mọc ngầm.",
      "Trong ca ung thư, so sánh phim trước mổ với phim sau mổ: đoạn xương bị cắt, ba đoạn xương mác, và nẹp bắc qua các khoảng hở."
    ],
    "valuesHeading": "Giá trị dùng cho từng mô",
    "valuesIntro": "CT y khoa dùng đơn vị Hounsfield (HU), trong đó nước là 0 và không khí là −1000.[2] Giá trị xám của CBCT nha khoa không phải đơn vị Hounsfield đã hiệu chuẩn và khác nhau giữa các máy, trường chụp và vị trí trong phim, nên các con số ở đây chỉ là quy ước cho mô hình.[1]",
    "valuesPart": "Phần của mô hình",
    "valuesHu": "Giá trị (gần như HU)",
    "values": [
      {
        "part": "Không khí (mọi thứ bên ngoài mô hình)",
        "hu": "−1000"
      },
      {
        "part": "Mô mềm và khối u",
        "hu": "40 đến 60"
      },
      {
        "part": "Dây thần kinh huyệt răng dưới",
        "hu": "150"
      },
      {
        "part": "Xương (xương hàm dưới, xương mác)",
        "hu": "1100 đến 1200"
      },
      {
        "part": "Răng",
        "hu": "2200"
      },
      {
        "part": "Nẹp và vít titan",
        "hu": "3000"
      }
    ],
    "valuesNote": "Xương vỏ thật khoảng 1000 đến 1500 HU, xương xốp thấp hơn nhiều, ngà răng khoảng 1500 đến 2000 và men răng cao hơn nữa; titan thật làm bão hòa hầu hết máy chụp và gây nhiễu ảnh dạng vệt.[2][4]",
    "simplifyHeading": "Những gì phim ảo bỏ qua",
    "simplify": [
      "Không có nhiễu, tán xạ, hiện tượng cứng hóa chùm tia hay nhiễu ảnh do kim loại, những thứ mà trên CBCT thật che khuất chính các vùng quanh nẹp và răng đặc vốn quan trọng nhất.[4]",
      "Mỗi phần chỉ có một giá trị đồng nhất: không có xương vỏ và xương xốp, không có tủy hay dây chằng nha chu, và không có khác biệt giữa men và ngà.",
      "Không có các mô mềm quanh xương hàm (cơ, niêm mạc, da, tuyến), nên phim không giống cả một cái đầu.",
      "Ca ung thư thể hiện khối u như một khối mô mềm đơn thuần; khối u thật được nhận ra chủ yếu qua phần xương bị phá hủy và qua ngấm thuốc cản quang trên CT hoặc MRI, không chỉ bằng CBCT.",
      "Kích thước voxel 0,4 đến 0,5 mm, nằm trong khoảng của CBCT nha khoa (khoảng 0,08 đến 0,4 mm), nhưng bề mặt mô hình mịn hơn mọi giải phẫu thật.[3]"
    ],
    "howHeading": "Cách tạo các phim",
    "how": "Lưới GLB của mỗi mô hình được lấy mẫu lên lưới voxel 0,4 đến 0,5 mm (tools/cbct/voxelize.py), mỗi phần được gán giá trị trong bảng, rồi ghi thành khối NIfTI. Trình xem là NiiVue, một trình xem ảnh y khoa WebGL2 mã nguồn mở.[5][6]"
  },
  "learnPerio": {
    "metaTitle": "Viêm nha chu: phân giai đoạn và phân độ — tài liệu cho sinh viên — Vivatheca",
    "metaDescription": "Phân giai đoạn và phân độ viêm nha chu theo AAP/EFP 2017, cách làm các mô hình giai đoạn của Vivatheca, và hướng dẫn điều trị từng bước của EFP, kèm nguồn tài liệu, cho sinh viên nha khoa.",
    "eyebrow": "Tài liệu cho sinh viên",
    "heading": "Viêm nha chu: phân giai đoạn và phân độ",
    "lead": "Tài liệu học đi kèm các mô hình giai đoạn viêm nha chu. Trang mô hình được viết cho bệnh nhân; trang này dùng thuật ngữ của phân loại 2017, các ngưỡng làm cơ sở cho từng mô hình và nguồn gốc của chúng.",
    "openModel": "Mở các mô hình 3D (trang cho bệnh nhân)",
    "objectivesHeading": "Mục tiêu học tập",
    "objectives": [
      "Mô tả những thay đổi chính của phân loại AAP/EFP 2017 so với năm 1999.",
      "Xếp giai đoạn (I đến IV) dựa trên mất bám dính kẽ răng, tiêu xương trên phim, mất răng và các yếu tố phức tạp.",
      "Xếp độ (A đến C) dựa trên bằng chứng trực tiếp hoặc gián tiếp về tiến triển, và áp dụng yếu tố điều chỉnh hút thuốc và đái tháo đường.",
      "Nêu bốn bước của hướng dẫn S3 của EFP cho viêm nha chu giai đoạn I đến III.",
      "Chỉ ra chỗ các mô hình Vivatheca đơn giản hóa bệnh."
    ],
    "termsHeading": "Thuật ngữ chính",
    "terms": [
      {
        "term": "Viêm nha chu (2017)",
        "text": "Hội thảo Thế giới 2017 gộp các thể trước đây gọi là viêm nha chu mạn tính và viêm nha chu tiến triển nhanh thành một nhóm duy nhất, viêm nha chu, được mô tả theo giai đoạn và độ. Bệnh nha chu hoại tử và viêm nha chu là biểu hiện của bệnh toàn thân là các thể riêng.[2][3]"
      },
      {
        "term": "Giai đoạn",
        "text": "Mức độ nặng và độ phức tạp của điều trị, xác định chủ yếu bằng mất bám dính lâm sàng (CAL) kẽ răng ở vị trí nặng nhất, hoặc tiêu xương trên phim nếu không có CAL, rồi nâng lên theo mất răng và các yếu tố phức tạp.[1]"
      },
      {
        "term": "Độ",
        "text": "Tốc độ tiến triển và đáp ứng điều trị dự kiến. Bác sĩ bắt đầu ở độ B và chuyển sang A hoặc C dựa trên bằng chứng trực tiếp hoặc gián tiếp; hút thuốc và đái tháo đường có thể nâng độ.[1]"
      },
      {
        "term": "Phạm vi",
        "text": "Ghi thêm vào giai đoạn: khu trú (dưới 30% số răng bị ảnh hưởng), toàn thể, hoặc kiểu răng hàm/răng cửa.[1]"
      }
    ],
    "mechanicsHeading": "Giai đoạn I đến IV",
    "mechanics": [
      "CAL kẽ răng ở vị trí nặng nhất: giai đoạn I 1 đến 2 mm, giai đoạn II 3 đến 4 mm, giai đoạn III và IV từ 5 mm trở lên. Tiêu xương trên phim: một phần ba thân răng phía cổ (dưới 15%) ở giai đoạn I, một phần ba phía cổ (15 đến 33%) ở giai đoạn II, lan tới một phần ba giữa chân răng và hơn nữa ở giai đoạn III và IV.[1][7]",
      "Mất răng do viêm nha chu: không mất răng ở giai đoạn I và II, từ 4 răng trở xuống ở giai đoạn III, từ 5 răng trở lên ở giai đoạn IV.[1]",
      "Độ phức tạp: giai đoạn I có độ sâu thăm dò tối đa từ 4 mm trở xuống và chủ yếu tiêu xương ngang; giai đoạn II từ 5 mm trở xuống. Giai đoạn III có thêm độ sâu thăm dò từ 6 mm, tiêu xương dọc từ 3 mm, tổn thương chẽ chân răng độ II hoặc III, hoặc khuyết sống hàm mức vừa. Giai đoạn IV có thêm nhu cầu phục hồi chức năng phức tạp, ví dụ sang chấn khớp cắn thứ phát (lung lay độ 2 trở lên), sụp khớp cắn, răng di lệch hoặc thưa xòe, hoặc còn dưới 20 răng (10 cặp đối diện).[1][7]",
      "Độ, bằng chứng gián tiếp: tỉ lệ phần trăm tiêu xương chia cho tuổi dưới 0,25 là độ A, 0,25 đến 1,0 là độ B và trên 1,0 là độ C. Yếu tố điều chỉnh: hút dưới 10 điếu mỗi ngày gợi ý độ B và từ 10 điếu trở lên gợi ý độ C; đái tháo đường có HbA1c dưới 7,0% gợi ý độ B và từ 7,0% trở lên gợi ý độ C.[1][7]"
    ],
    "evidenceHeading": "Điều trị: hướng dẫn S3 của EFP (giai đoạn I đến III)",
    "evidenceColumns": [
      "Bước",
      "Mục tiêu",
      "Nội dung"
    ],
    "evidence": [
      {
        "study": "Bước 1[4]",
        "design": "Thay đổi hành vi và kiểm soát yếu tố nguy cơ",
        "finding": "Hướng dẫn vệ sinh răng miệng, lấy mảng bám và cao răng trên lợi, kiểm soát các yếu tố lưu giữ mảng bám, và kiểm soát yếu tố nguy cơ như cai thuốc lá và kiểm soát đái tháo đường."
      },
      {
        "study": "Bước 2[4]",
        "design": "Điều trị nguyên nhân",
        "finding": "Làm sạch dưới lợi bằng dụng cụ, có hoặc không có biện pháp hỗ trợ, để giảm màng sinh học và cao răng dưới lợi."
      },
      {
        "study": "Bước 3[4]",
        "design": "Các vị trí không đáp ứng",
        "finding": "Làm sạch lại bằng dụng cụ, phẫu thuật lật vạt, hoặc phẫu thuật cắt bỏ hay tái sinh cho túi sâu còn sót, kể cả khuyết trong xương và tổn thương chẽ chân răng."
      },
      {
        "study": "Bước 4[4]",
        "design": "Chăm sóc nha chu hỗ trợ",
        "finding": "Tái khám định kỳ để giữ nha chu ổn định, tiếp tục kiểm soát mảng bám và yếu tố nguy cơ."
      }
    ],
    "uncertainHeading": "Chỗ bằng chứng còn chưa chắc chắn",
    "uncertain": [
      "Các tác giả trình bày phân giai đoạn và phân độ như một khung và đề xuất, sẽ được hoàn thiện khi có thêm bằng chứng về tiến triển và nguy cơ.[1]",
      "Phân độ dựa vào bằng chứng trực tiếp về tiến triển khi có. Dùng tỉ lệ tiêu xương chia cho tuổi là gián tiếp, và một phim đơn lẻ không cho biết xương mất nhanh đến đâu.[1]",
      "Tiêu xương trên phim phụ thuộc vào vị trí mào xương được giả định khi khỏe mạnh. Trong một nghiên cứu phim cắn cánh, khoảng cách từ đường nối men - xê măng đến mào xương khi khỏe mạnh dao động từ 0,4 đến 1,9 mm, nên khó tách mức tiêu xương nhỏ khỏi biến thiên bình thường.[5]"
    ],
    "simplifyHeading": "Những gì các mô hình đơn giản hóa",
    "simplify": [
      "Cả năm mô hình dùng cùng một xương hàm dưới người lớn và 14 răng từ Z-Anatomy, không có răng khôn. Đường nối men - xê măng của mỗi răng được đặt theo chiều dài thân và chân răng điển hình.[6]",
      "Mào xương khỏe mạnh nằm dưới đường nối men - xê măng 1,5 mm, trong khoảng được báo cáo cho tình trạng khỏe mạnh.[5] Mỗi giai đoạn hạ xương xuống một tỉ lệ cố định của chiều dài chân răng (giai đoạn I 10%, II 25%, III 40%, IV 60%), chọn để nằm trong khoảng của từng giai đoạn.[1]",
      "Tiêu xương gần như đều quanh cung hàm (toàn thể). Viêm nha chu thật thường không đều, với khuyết xương dọc ở từng vị trí.",
      "Lợi và bám dính không được làm, nên mô hình không thể hiện được CAL hay độ sâu thăm dò, là các số đo chính để phân giai đoạn. Không thể mô hình hóa phân độ."
    ],
    "questionsHeading": "Tự kiểm tra",
    "questions": [
      {
        "q": "CAL kẽ răng nặng nhất của bệnh nhân là 4 mm, tiêu xương ở một phần ba phía cổ, chưa mất răng nào và túi sâu nhất 5 mm. Đây là giai đoạn nào?",
        "a": "Giai đoạn II: CAL 3 đến 4 mm, tiêu xương ở một phần ba phía cổ (15 đến 33%), không mất răng, độ sâu thăm dò tối đa từ 5 mm trở xuống.[1]"
      },
      {
        "q": "Một người 30 tuổi có tiêu xương 40% ở răng nặng nhất. Bằng chứng gián tiếp gợi ý độ nào?",
        "a": "40 ÷ 30 = 1,33, lớn hơn 1,0, nên là độ C. Phân độ thật còn dùng bằng chứng trực tiếp, kiểu hình ca bệnh và yếu tố nguy cơ.[1]"
      },
      {
        "q": "Theo hướng dẫn của EFP, khi nào cân nhắc phẫu thuật nha chu?",
        "a": "Ở bước 3, cho những vị trí không đáp ứng với bước 1 và 2, như túi sâu còn sót kèm khuyết trong xương hoặc tổn thương chẽ chân răng.[4]"
      }
    ]
  },
  "learnCracked": {
    "metaTitle": "Răng nứt: mão răng hay phục hồi trực tiếp — tài liệu cho sinh viên — Vivatheca",
    "metaDescription": "Nứt răng theo chiều dọc, sự uốn của múi răng, và bằng chứng về phủ múi cho răng nứt, kèm nguồn tài liệu, cho sinh viên nha khoa.",
    "eyebrow": "Tài liệu cho sinh viên",
    "heading": "Răng nứt: mão răng hay phục hồi trực tiếp",
    "lead": "Tài liệu học đi kèm mô hình răng nứt. Trang mô hình được viết cho bệnh nhân; trang này dùng thuật ngữ chuyên môn, cơ sinh học và các nghiên cứu làm cơ sở cho mô hình.",
    "openModel": "Mở mô hình 3D (trang cho bệnh nhân)",
    "objectivesHeading": "Mục tiêu học tập",
    "objectives": [
      "Kể tên năm loại nứt răng theo chiều dọc mà AAE phân biệt, và xác định vị trí của răng nứt trong số đó.",
      "Giải thích vì sao mất sự toàn vẹn của gờ bên làm giảm độ cứng của múi răng.",
      "So sánh phục hồi trong thân răng với phủ múi cho răng nứt.",
      "Tóm tắt bằng chứng về mão toàn phần, phục hồi trực tiếp và theo dõi, và mức độ tin cậy.",
      "Chỉ ra chỗ mô hình này đơn giản hóa hoặc phóng đại."
    ],
    "termsHeading": "Thuật ngữ chính",
    "terms": [
      {
        "term": "Răng nứt",
        "text": "Bảng thuật ngữ của AAE định nghĩa là “a thin surface disruption of enamel and dentin, and possibly cementum, of unknown depth or extension” (một đường gián đoạn mảnh trên bề mặt men và ngà, có thể cả xê măng, chưa rõ độ sâu hay độ lan).[2] Với bệnh nhân, AAE mô tả đó là vết nứt chạy từ mặt nhai theo chiều dọc về phía chân răng, răng chưa tách thành nhiều mảnh.[1]"
      },
      {
        "term": "Nứt răng theo chiều dọc",
        "text": "AAE phân biệt đường rạn men, vỡ múi, răng nứt, răng tách đôi và nứt chân răng theo chiều dọc.[1] Răng tách đôi không thể giữ nguyên vẹn.[1]"
      },
      {
        "term": "Phủ múi",
        "text": "Phục hồi che phủ các múi răng, như mão toàn phần hoặc onlay, thay vì chỉ nằm trong thân răng.[5]"
      },
      {
        "term": "Gờ bên",
        "text": "Các gờ men ở bờ gần và bờ xa của mặt nhai. Mất các gờ này ảnh hưởng nhiều nhất đến độ cứng của múi răng trong một nghiên cứu phòng thí nghiệm.[4]"
      }
    ],
    "mechanicsHeading": "Vì sao phủ múi quan trọng",
    "mechanics": [
      "Ở răng hàm nhỏ hàm trên đã nhổ, chịu tải trong giới hạn đàn hồi, lỗ trám mặt nhai làm giảm độ cứng tương đối của múi 20%, lỗ mở tủy chỉ 5%, và lỗ trám MOD trung bình 63%. Mức giảm lớn nhất đi kèm với mất sự toàn vẹn của gờ bên.[4]",
      "Múi răng kém cứng sẽ uốn nhiều hơn dưới lực nhai. Phục hồi trong thân răng không giằng các múi lại với nhau, nên vết nứt chạy bên dưới vẫn có thể mở ra mỗi lần chịu lực. Phủ múi giằng các múi và che vết nứt khỏi môi trường miệng.[5][7]",
      "Mô hình thể hiện điều này bằng độ nghiêng phóng đại 6 độ của nửa phía má và nửa phía lưỡi quanh đáy vết nứt. Độ uốn múi thật quá nhỏ để nhìn thấy."
    ],
    "evidenceHeading": "Kết quả: các nghiên cứu cho thấy gì",
    "evidenceColumns": [
      "Nghiên cứu",
      "Thiết kế",
      "Kết quả chính"
    ],
    "evidence": [
      {
        "study": "Zhang 2024[6]",
        "design": "Tổng quan hệ thống và phân tích gộp, 27 nghiên cứu (gộp 26)",
        "finding": "Răng nứt còn tủy sống: phục hồi trực tiếp không phủ múi so với mão toàn phần, RR 3,2 (KTC 95% 1,51 đến 6,82) với biến chứng tủy và RR 8,1 (1,05 đến 62,5) với nhổ răng. Răng nứt đã điều trị tủy mà không có mão toàn phần: nguy cơ nhổ răng gấp 11,3 lần. Theo dõi không phục hồi: thành công 80% sau 3 năm."
      },
      {
        "study": "Wu 2019[7]",
        "design": "Nghiên cứu thuần tập hồi cứu, 199 răng viêm tủy có hồi phục",
        "finding": "29,1% tiến triển thành viêm tủy không hồi phục hoặc hoại tử trong 3 năm. Không có mão phủ toàn bộ: OR 8,74 với biến chứng tủy."
      },
      {
        "study": "Krell và Rivera 2007[8]",
        "design": "Loạt ca, 127 răng viêm tủy có hồi phục, tất cả đều dự kiến làm mão",
        "finding": "Khoảng 20% cần điều trị tủy, phần lớn trong vòng 6 tháng."
      },
      {
        "study": "Hilton 2020[3]",
        "design": "Nghiên cứu thuần tập tại phòng khám, 2.858 răng",
        "finding": "46% có đau (với lạnh 1.055, khi cắn 459, tự phát 367). Khoảng một phần ba được đề nghị điều trị; sâu răng, đau khi cắn và vết nứt thấy trên phim là các yếu tố dự báo mạnh nhất cho đề nghị phục hồi."
      },
      {
        "study": "Olivieri 2020[9]",
        "design": "Tổng quan hệ thống, 7 nghiên cứu thuần tập về răng nứt đã điều trị tủy",
        "finding": "Tỉ lệ tồn tại sau 1 năm 88% và thành công 82%. Túi nha chu liên quan đến vết nứt làm tăng nguy cơ mất răng."
      }
    ],
    "uncertainHeading": "Chỗ bằng chứng còn chưa chắc chắn",
    "uncertain": [
      "Các nghiên cứu là quan sát. Răng được làm mão có thể khác răng không được làm, và khoảng tin cậy rộng (ví dụ RR 8,1, KTC 95% 1,05 đến 62,5) cho thấy một số so sánh dựa trên rất ít biến cố.[6]",
      "Một tổng quan năm 2026 về răng nứt đã điều trị tủy đánh giá mọi nghiên cứu được đưa vào có nguy cơ sai lệch nghiêm trọng và độ tin cậy của bằng chứng rất thấp; thiếu phủ múi hoàn chỉnh là một trong nhiều chỉ điểm nguy cơ.[11]",
      "Mão răng bảo vệ tối đa nhưng không bảo đảm thành công.[1] Vết nứt không triệu chứng thường được theo dõi thay vì phục hồi.[3][6]"
    ],
    "simplifyHeading": "Những gì mô hình đơn giản hóa",
    "simplify": [
      "Một răng hàm lớn thứ nhất hàm dưới từ Z-Anatomy; đường nối men - xê măng đặt thấp hơn đỉnh múi cao nhất 7,5 mm, là chiều dài thân răng điển hình.[10] Độ dày men là giá trị ước tính.",
      "Vết nứt được vẽ rộng 0,24 mm và chạy theo chiều gần - xa qua cả hai gờ bên, dừng ở trên đường nối men - xê măng 0,8 đến 2,6 mm. Vết nứt thật hẹp hơn nhiều và khác nhau về đường đi và độ sâu.",
      "Kích thước lỗ trám và cách mài làm mão là giá trị giảng dạy điển hình chọn cho mô hình, không lấy từ một nguồn nào. Chúng được liệt kê trong phần ghi chú trên trang mô hình.",
      "Chuyển động khi cắn được phóng đại nhiều lần và chỉ thể hiện ở răng nứt và răng đã trám."
    ],
    "questionsHeading": "Tự kiểm tra",
    "questions": [
      {
        "q": "Kiểu lỗ trám nào gây mất độ cứng múi răng nhiều nhất trong nghiên cứu của Reeh và cộng sự?",
        "a": "Lỗ trám MOD, mất trung bình 63%, vì nó lấy đi cả hai gờ bên.[4]"
      },
      {
        "q": "Với răng nứt còn tủy sống, phân tích gộp năm 2024 thấy gì khi so phục hồi trực tiếp không phủ múi với mão toàn phần?",
        "a": "Nguy cơ biến chứng tủy (RR 3,2) và nhổ răng (RR 8,1) cao hơn, từ các nghiên cứu quan sát.[6]"
      },
      {
        "q": "Nêu một kết quả cho thấy không nên điều trị mọi vết nứt ngay lập tức.",
        "a": "Trong phân tích gộp năm 2024, theo dõi không phục hồi thành công 80% sau 3 năm, và trong mạng lưới phòng khám ở Mỹ chỉ khoảng một phần ba răng nứt được đề nghị điều trị.[3][6]"
      }
    ]
  },
  "hero": {
    "line1": "Mô hình lâm sàng",
    "line2": "dễ hiểu.",
    "lede": "Thư viện mô hình 3D miễn phí, phi lợi nhuận về nha khoa và phẫu thuật miệng. Mỗi bệnh đều có mô hình bình thường tương ứng, để nhân viên y tế cho bệnh nhân thấy điểm khác biệt, trên màn hình hoặc bằng bản in 3D.",
    "explore": "Xem các mô hình",
    "how": "Dùng thử trình xem 3D",
    "accessLabel": "Cam kết tiếp cận",
    "access": [
      "Dùng miễn phí",
      "Truy cập mở",
      "Xem trên máy hoặc in ra",
      "Có mô hình bình thường để so sánh"
    ],
    "imageAlt": "Mô hình 3D hàm dưới bên trái có răng khôn mọc ngầm nghiêng vào răng hàm lớn thứ hai, chân răng nằm gần dây thần kinh màu vàng.",
    "caption": "Răng khôn hàm dưới mọc ngầm, dây thần kinh màu vàng. Ảnh chụp màn hình mô hình Vivatheca."
  },
  "origin": {
    "label": "Xuất xứ Úc",
    "flagLink": "Quốc kỳ Úc — nguồn hình ảnh chính thức của Chính phủ Úc",
    "flagAlt": "Quốc kỳ Úc",
    "text": "Thành lập và hoạt động tại Úc."
  },
  "mission": {
    "label": "Sứ mệnh của Vivatheca",
    "text": "Mô hình 3D mở cho những cuộc trao đổi rõ ràng hơn.",
    "links": [
      "Xem dạng 3D",
      "Chia sẻ bằng liên kết",
      "In ra khi có thể"
    ]
  },
  "collection": {
    "heading": "Xem lời giải thích từ mọi góc độ.",
    "text": "Xoay hàm trên của một trẻ qua ba giai đoạn ghép xương khe hở cung hàm, ẩn lợi để thấy xương, và chuyển giữa ngôn ngữ dễ hiểu và chi tiết lâm sàng.",
    "label": "Mô hình tương tác",
    "moreHeading": "Mô hình thử nghiệm",
    "moreHeadNeck": "Đầu và cổ: bốn ca bệnh thật dạng 3D, kèm phim X-quang và ảnh chụp",
    "allModels": "Xem tất cả mô hình trong thư viện"
  },
  "showcase": {
    "heading": "Thêm từ bộ sưu tập.",
    "text": "Một số mô hình bạn có thể mở ngay hôm nay, từ sự phát triển răng của trẻ đến phẫu thuật xương hàm. Mỗi mô hình đều đi kèm giải phẫu bình thường hoặc được trình bày theo từng giai đoạn.",
    "label": "Các mô hình trong bộ sưu tập",
    "open": "Mở mô hình"
  },
  "understanding": {
    "heading": "Một mô hình. Nhiều cách để hiểu.",
    "text": "Nền tảng Vivatheca kết nối thời điểm giải thích với mọi việc có thể diễn ra sau đó.",
    "explore": {
      "title": "Khám phá dạng 3D",
      "text": "Xoay, phóng to và theo dõi phần hướng dẫn có chú thích bằng bàn phím hoặc cảm ứng."
    },
    "explain": {
      "title": "Giải thích rõ ràng",
      "text": "Chuyển giữa phần hướng dẫn bằng ngôn ngữ dễ hiểu và chi tiết lâm sàng sâu hơn."
    },
    "further": {
      "title": "Đi xa hơn",
      "text": "Chia sẻ mô hình, xem bằng AR trên điện thoại, hoặc tải tệp STL để in."
    }
  },
  "print": {
    "imageAlt": "Mặt phía má của mô hình răng khôn mọc ngầm: bên trái là mô hình số, bên phải là ảnh chụp chính mô hình đó đã in 3D, kèm thước kẻ. Cả hai đều có xương và răng màu be xám, dây thần kinh màu đỏ.",
    "imageAltLingual": "Mặt phía lưỡi của cùng mô hình số và bản in 3D, kèm thước kẻ.",
    "caption": "Trên: phía má. Dưới: phía lưỡi. Trái: mô hình số, hiển thị theo màu của bản in (be xám, dây thần kinh màu đỏ). Phải: cùng mô hình đó đã in 3D (phiên bản 10.1). Ảnh: Luke Seifert, Vivatheca.",
    "heading": "Từ màn hình đến vật cầm được trong tay.",
    "text": "Hầu hết các mô hình có kèm tệp STL miễn phí tính bằng milimét, tỉ lệ in ghi trên trang mô hình, để bạn in bằng máy in 3D để bàn, giúp lời giải thích đi từ màn hình đến tay bệnh nhân. Tệp in cho các mô hình phẫu thuật xương hàm và vòm miệng sẽ có khi các mô hình đó hoàn thiện.",
    "download": "Tải cả hai tệp STL"
  },
  "trust": {
    "heading": "Sự tin cậy cần được thấy rõ, không chỉ được ngầm hiểu.",
    "text": "Mỗi mô hình đều liệt kê nguồn đã công bố, những điểm được đơn giản hóa, phiên bản và nhật ký thay đổi, và cho biết đã có nhân viên y tế thẩm định hay chưa.",
    "report": "Báo lỗi",
    "reportAfter": "và phần sửa sẽ được ghi vào nhật ký thay đổi.",
    "checkable": {
      "title": "Nguồn tài liệu bạn có thể kiểm tra",
      "text": "Mỗi mô hình liệt kê các nguồn đã bình duyệt dùng để đối chiếu, kèm liên kết, những điểm được đơn giản hóa và nhật ký mọi lần sửa."
    },
    "status": {
      "title": "Tình trạng thẩm định ai cũng đọc được",
      "text": "Mỗi mô hình cho biết đã được thẩm định lâm sàng hay chưa. Khi bắt đầu thẩm định, các mô hình được duyệt sẽ ghi danh xưng, chữ cái đầu tên, nghề nghiệp và quốc gia hành nghề của người thẩm định; việc xác minh danh tính được giữ kín."
    },
    "corrections": {
      "title": "Sửa lỗi công khai",
      "text": "Ai cũng có thể báo lỗi. Các báo cáo được đối chiếu với nguồn đã công bố, và phần sửa được ghi vào nhật ký thay đổi của mô hình."
    },
    "privacy": {
      "title": "Xác minh kín, ghi danh công khai có giới hạn",
      "text": "Danh tính và tư cách thẩm định của nhân viên y tế được xác minh kín. Thông tin công khai chỉ gồm danh xưng, chữ cái đầu tên, nghề nghiệp và quốc gia hành nghề của người thẩm định."
    },
    "focus": {
      "title": "Đánh giá tập trung vào mục đích giáo dục",
      "text": "Người thẩm định sẽ không được hỏi ý kiến y tế hay tư vấn sức khỏe. Vai trò của họ chỉ là kiểm tra xem mô hình có thể hiện bệnh được nêu đủ tốt để giáo dục bệnh nhân hay không."
    },
    "sources": {
      "title": "Thông tin công khai có nguồn truy được",
      "text": "Thông tin về bệnh và thủ thuật chỉ lấy từ nghiên cứu đã bình duyệt, hướng dẫn của hội chuyên ngành và thông tin y tế công của chính phủ có giấy phép phù hợp. Mỗi nhận định đều ghi nguồn (tác giả, năm, tổ chức và liên kết), và các trang nói rõ khi mô hình đơn giản hóa bằng chứng hoặc khi bằng chứng chưa chắc chắn."
    },
    "warningLabel": "Tình trạng thẩm định hiện nay:",
    "warning": "chưa có mô hình nào được thẩm định độc lập, và mỗi trang mô hình đều ghi rõ điều đó. Hiện đang mời người thẩm định."
  },
  "publications": {
    "heading": "Bằng chứng về việc nhìn và cầm giải phẫu trong tay.",
    "text": "Các nghiên cứu độc lập, đã bình duyệt đã kiểm tra cách mô hình 3D thật và ảo có thể giúp bệnh nhân hiểu biết, trao đổi và hiểu rõ hơn. Kết quả phụ thuộc vào bối cảnh lâm sàng và không nên coi là bằng chứng áp dụng cho mọi trường hợp.",
    "note": "Các bài báo này là bằng chứng độc lập và không liên quan đến Vivatheca.",
    "read": "Đọc bài báo đã bình duyệt",
    "orthopedic": {
      "journal": "Cureus · 2024;16(10):e70822 · Thử nghiệm lâm sàng ngẫu nhiên (46 bệnh nhân)",
      "finding": "Trong các buổi khám có dùng mô hình giải phẫu 3D, 76% bệnh nhân cho biết hiểu bệnh của mình hơn, so với 52% khi không có mô hình, và 14 trên 15 chỉ số giao tiếp tốt hơn. Đây là thử nghiệm nhỏ, tại một cơ sở.",
      "alt": "Bác sĩ và bệnh nhân dùng mô hình khớp gối ba chiều trong buổi khám chỉnh hình."
    },
    "mohs": {
      "journal": "Journal of the American Academy of Dermatology · 2019;81(6):1339-1345 · Thử nghiệm đối chứng ngẫu nhiên (82 bệnh nhân)",
      "finding": "Thêm mô hình thủ thuật in 3D vào phần giáo dục chuẩn giúp điểm kiến thức cao hơn một chút (93% so với 86% trả lời đúng). Mức giảm lo âu lớn hơn chỉ gần đạt ý nghĩa thống kê (P = .052), và các tác giả lưu ý nghiên cứu chưa đủ cỡ mẫu.",
      "alt": "Bác sĩ da liễu và bệnh nhân trao đổi bên mô hình da ba chiều nhiều lớp, không gây khó chịu khi nhìn."
    },
    "thyroid": {
      "journal": "Cancers · 2026;18(2):241 · Thử nghiệm đối chứng ngẫu nhiên (94 bệnh nhân)",
      "finding": "Bệnh nhân được tư vấn bằng mô hình 3D ảo của tuyến giáp xác định dây thần kinh thanh quản quặt ngược và phạm vi nạo vét hạch chính xác hơn, và hiểu rõ hơn nguyên nhân của các biến chứng chính. Việc xác định vị trí tổn thương và nhận biết tuyến cận giáp không khác biệt đáng kể.",
      "alt": "Bác sĩ và bệnh nhân xem mô hình tuyến giáp ba chiều tương tác trên máy tính bảng."
    }
  },
  "contribute": {
    "heading": "Cùng xây dựng bộ sưu tập.",
    "text": "Nhân viên y tế giúp thư viện luôn chính xác và quyết định mô hình nào được làm tiếp theo.",
    "learn": "Tìm hiểu cách tham gia",
    "openForm": "Mở biểu mẫu",
    "emailUs": "Gửi email cho chúng tôi",
    "report": {
      "title": "Báo lỗi",
      "text": "Thấy giải phẫu hoặc nhãn chưa đúng? Hãy cho chúng tôi biết điều gì và ở đâu, kèm nguồn nếu bạn có."
    },
    "join": {
      "title": "Tham gia thẩm định lâm sàng",
      "text": "Nha sĩ, bác sĩ chuyên khoa và nhân viên chăm sóc răng miệng có thể đối chiếu mô hình với thực hành của mình và với y văn."
    },
    "request": {
      "title": "Đề xuất hoặc gửi mô hình",
      "text": "Cho chúng tôi biết bệnh nào bạn sẽ dùng để giải thích cho bệnh nhân, hoặc chia sẻ một mô hình kèm nguồn tài liệu."
    },
    "caption": "Ảnh chụp màn hình bộ mô hình phát triển răng, 9,5 tuổi.",
    "openSeries": "Mở bộ mô hình",
    "submit": {
      "title": "Gửi mô hình",
      "text": "Chia sẻ mô hình giải phẫu xem được trên trình duyệt, tài liệu và thông tin nguồn để được thẩm định."
    },
    "review": {
      "title": "Thẩm định độ chính xác lâm sàng",
      "text": "Nhân viên y tế có thể đánh giá giải phẫu, giới hạn và mức hữu ích cho việc giáo dục bệnh nhân."
    },
    "imageAlt": "Mô hình phát triển răng lúc 9,5 tuổi: hàm trên và hàm dưới bên phải với răng sữa màu xanh và răng vĩnh viễn màu vàng đang hình thành bên dưới."
  },
  "sponsor": {
    "heading": "Giúp mô hình đến được với nhiều người hơn.",
    "text": "Tài trợ có thể hỗ trợ phát triển mô hình và sau này gửi mô hình in tới các phòng khám không tự in được. Vivatheca chưa phải là tổ chức từ thiện đã đăng ký, nên khoản tài trợ không được khấu trừ thuế.",
    "cta": "Bắt đầu trao đổi về tài trợ"
  },
  "footer": {
    "backToTop": "Về đầu trang Vivatheca",
    "about": "Mô hình 3D miễn phí về bệnh răng miệng và hàm mặt, mỗi mô hình đều có mô hình bình thường để so sánh, giúp nhân viên y tế làm tài liệu giáo dục bệnh nhân.",
    "badge": "Phi lợi nhuận · Giấy phép mở",
    "library": "Thư viện mô hình",
    "wisdomTooth": "Răng cối lớn thứ ba hàm dưới mọc ngầm",
    "development": "Sự phát triển của bộ răng hỗn hợp",
    "orthognathic": "Phẫu thuật chỉnh hình xương hàm",
    "report": "Báo lỗi",
    "aboutGroup": {
      "label": "Giới thiệu",
      "about": "Về Vivatheca",
      "privacy": "Quyền riêng tư",
      "contact": "Liên hệ"
    },
    "explore": {
      "label": "Khám phá",
      "featured": "Xem mô hình nổi bật",
      "how": "Cách sử dụng",
      "publications": "Ấn phẩm",
      "trust": "Độ tin cậy và thẩm định",
      "students": "Dành cho sinh viên nha khoa và y khoa",
      "templates": "Mẫu tờ rơi và bài trình chiếu",
      "print": "In 3D mô hình",
      "impact": "Cách các mô hình được sử dụng"
    },
    "participate": {
      "label": "Tham gia",
      "request": "Đề xuất mô hình mới",
      "used": "Chia sẻ cách bạn đã dùng mô hình",
      "survey": "Khảo sát nhân viên y tế",
      "contribute": "Đóng góp mô hình",
      "review": "Tham gia thẩm định lâm sàng",
      "sponsor": "Tài trợ mô hình"
    },
    "connect": {
      "label": "Kết nối",
      "partnerships": "Hợp tác với tổ chức",
      "contact": "Liên hệ Vivatheca",
      "accessibility": "Góp ý về khả năng tiếp cận"
    },
    "legal": "Pháp lý và khả năng tiếp cận",
    "privacy": "Quyền riêng tư",
    "accessibility": "Góp ý về khả năng tiếp cận"
  },
  "contact": {
    "heading": "Liên hệ",
    "intro": "Bạn có câu hỏi, cần đính chính hoặc có ý tưởng về mô hình? Hãy theo dõi Vivatheca hoặc liên hệ với chúng tôi.",
    "email": "Email",
    "linkLabel": "Liên hệ Vivatheca qua {name}"
  },
  "model": {
    "pause": "Tạm dừng xoay",
    "resume": "Tiếp tục xoay",
    "fullscreen": "Xem mô hình toàn màn hình",
    "loading": "Đang tải mô hình tương tác…",
    "help": "Kéo để xoay · Cuộn hoặc chụm hai ngón để phóng to · Dùng phím mũi tên sau khi chọn mô hình",
    "level": "Mức độ giải thích",
    "plain": "Ngôn ngữ dễ hiểu",
    "clinical": "Chi tiết lâm sàng",
    "stepOf": "{label} · {n} trên {total}",
    "sources": "Nguồn tài liệu và cách làm mô hình",
    "sourceLabel": "Nguồn {n}"
  },
  "abg": {
    "status": "Ví dụ tương tác",
    "stagesLabel": "Giai đoạn ghép xương",
    "gumOff": "Ẩn lợi",
    "gumOn": "Hiện lại lợi",
    "bracesOff": "Tháo mắc cài",
    "bracesOn": "Gắn lại mắc cài",
    "labelsHide": "Ẩn nhãn",
    "labelsShow": "Hiện nhãn",
    "viewsLabel": "Góc nhìn mô hình",
    "views": {
      "whole": "Toàn bộ hàm",
      "below": "Nhìn từ dưới",
      "left": "Bên trái"
    },
    "optionsLabel": "Các cách lấp khoảng trống",
    "options": [
      {
        "label": "Khoảng trống",
        "text": "Chỗ trống nơi chiếc răng nhỏ (răng cửa bên) không bao giờ mọc. Khi bạn đã hết tuổi phát triển, nha sĩ có thể lấp chỗ này lâu dài."
      },
      {
        "label": "Cấy ghép implant",
        "text": "Một trụ nhỏ trong xương mới, phía trên có răng giả (mão răng)."
      },
      {
        "label": "Cầu răng",
        "text": "Một răng giả có một cánh dán vào mặt sau của răng cửa."
      },
      {
        "label": "Hàm giả tháo lắp từng phần",
        "text": "Một tấm hàm nhỏ có thể tháo ra. Hàm nằm phía sau các răng và giữ răng giả bằng móc ẩn."
      },
      {
        "label": "Di chuyển răng nanh",
        "text": "Mắc cài đưa răng nanh vào chỗ của răng bị thiếu. Sau đó nha sĩ chỉnh hình dạng răng nanh cho giống răng bị thiếu. Nhiều nhóm điều trị dùng cách này cho trẻ bị khe hở."
      }
    ],
    "hotspots": {
      "gum": [
        "Lợi",
        "có thể ẩn đi"
      ],
      "gap": [
        "Khe hở trong xương",
        "khe hở cung hàm"
      ],
      "window": [
        "Răng nanh",
        "nhìn qua một cửa sổ trên xương"
      ],
      "front": [
        "Răng cửa",
        "răng cửa giữa"
      ],
      "missing": [
        "Răng bị thiếu",
        "răng cửa bên"
      ],
      "palate": [
        "Vòm miệng",
        "khẩu cái"
      ],
      "graft": [
        "Xương mới",
        "xương ghép"
      ],
      "canine": [
        "Răng nanh",
        "đã mọc qua xương mới"
      ],
      "braces": [
        "Mắc cài",
        "có thể tháo ra"
      ],
      "healed": [
        "Xương mới",
        "xương ghép đã lành"
      ],
      "space": [
        "Răng bị thiếu",
        "chọn cách lấp bên dưới"
      ],
      "moved": [
        "Răng nanh",
        "đã đưa vào chỗ trống và chỉnh hình dạng"
      ],
      "next": [
        "Răng bên cạnh",
        "đưa ra trước để thế chỗ"
      ]
    },
    "made": "Do Vivatheca làm cho một nghiên cứu về giáo dục bệnh nhân. Mô hình giữ màu sắc của nghiên cứu đó. Được tải, in và chỉnh sửa miễn phí theo giấy phép CC BY-SA 4.0 nếu ghi công Vivatheca.",
    "downloadsLink": "Tải xuống và giấy phép",
    "downloadsTitle": "Tải xuống",
    "fileStages": [
      "Giai đoạn 1 · Trước khi ghép",
      "Giai đoạn 2 · Sau khi ghép, có mắc cài",
      "Giai đoạn 3 · Nhiều năm sau, các cách lấp khoảng trống",
      "Giai đoạn 3 · Nhiều năm sau, răng nanh đã đưa vào chỗ trống"
    ],
    "glb": "GLB (web và AR)",
    "stl": "STL để in, mm (tệp ZIP kèm hướng dẫn)",
    "filesNote": "Các phần STL lấy từ mô hình web. Chúng không có khớp nối để in, nên hãy sửa trong phần mềm cắt lớp trước khi in. Ở giai đoạn 3, mỗi lần chỉ in một cách lấp khoảng trống, vì các phần đó chồng lên nhau.",
    "licence": "Giấy phép:",
    "licenceText": "Bạn có thể dùng, chỉnh sửa và in các mô hình này, kể cả trong tài liệu cho bệnh nhân của mình, nếu ghi công Vivatheca. Nếu bạn thay đổi mô hình hoặc hình ảnh của nó, hãy chia sẻ bản đã thay đổi theo giấy phép CC BY-SA 4.0.",
    "credit": "Mô hình do Luke Seifert, Vivatheca, thực hiện.",
    "citeHeading": "Cách ghi công",
    "simplified": "Một ví dụ: khe hở bên trái, không có răng cửa bên ở bên đó. Khe hở thật khác nhau về độ rộng và răng nào bị thiếu, và kết quả ghép xương cũng khác nhau. Tuổi và vị trí răng theo các nguồn bên dưới; màu sắc chỉ để phân biệt các phần, không phải màu thật của mô.",
    "stages": [
      {
        "label": "Trước",
        "when": "Khoảng 9 đến 10 tuổi",
        "title": "Khe hở trong xương hàm trên",
        "alt": "Mô hình 3D hàm trên của một trẻ có khe hở trong xương bên trái, thiếu một răng cạnh răng cửa, và phần lợi màu hồng có thể ẩn đi.",
        "text": "Trẻ này sinh ra đã có khe hở ở bên trái. Có một khe hở trong phần xương giữ răng. Lợi màu hồng che phủ nó. Hãy ẩn lợi để thấy khe hở. Ghép xương sẽ lấp khe hở này bằng xương.",
        "clinical": "Khe hở cung hàm một bên trái ở giai đoạn răng hỗn hợp (khoảng 9 đến 10 tuổi), thiếu răng cửa bên vĩnh viễn bên khe hở, điều xảy ra ở khoảng một nửa số bệnh nhân này. Răng nanh vĩnh viễn chưa mọc đã hình thành khoảng một nửa chân răng. Thời điểm ghép xương ổ răng thì hai dựa vào sự phát triển của răng nanh (chân răng hình thành khoảng 1/4 đến 2/3) hơn là tuổi, thường lúc 8 đến 11 tuổi."
      },
      {
        "label": "Sau khi ghép",
        "when": "Khoảng 12 đến 13 tuổi",
        "title": "Xương mới, và mắc cài để sắp thẳng răng",
        "alt": "Mô hình 3D của cùng hàm trên đó 2 đến 3 năm sau khi ghép. Răng nanh đã mọc qua xương mới, và răng đã được gắn mắc cài.",
        "text": "Đây là cùng hàm đó 2 đến 3 năm sau khi ghép xương. Xương giờ đã nối hai phần của hàm. Răng nanh đã mọc xuống qua xương mới. Mắc cài sắp thẳng các răng.",
        "clinical": "Hai đến ba năm sau ghép xương ổ răng thì hai, thường dùng xương xốp lấy từ mào chậu. Xương ghép bắc qua khe hở cung hàm và răng nanh đã mọc qua đó; khí cụ cố định sắp thẳng cung răng và giữ khoảng cho răng cửa bên. Răng nanh tự mọc qua xương ghép được dùng như một chỉ số lâm sàng về thành công của ca ghép."
      },
      {
        "label": "Nhiều năm sau",
        "when": "Cuối tuổi thiếu niên",
        "title": "Các cách lấp chỗ trống nơi răng không bao giờ mọc",
        "alt": "Mô hình 3D của cùng hàm trên đó ở cuối tuổi thiếu niên. Mắc cài đã tháo. Các nút cho thấy những cách khác nhau để lấp chỗ trống cạnh răng cửa.",
        "text": "Mắc cài đã tháo, và xương giữ các răng ở chỗ trước đây là khe hở. Giờ nha sĩ có thể lấp chỗ trống nơi chiếc răng nhỏ không bao giờ mọc. Chọn một cách bên dưới để xem trên mô hình. Nhóm điều trị khe hở sẽ giúp bạn chọn.",
        "clinical": "Cuối tuổi vị thành niên sau ghép xương ổ răng thì hai và chỉnh nha. Nhìn chung xương ghép ổn định lâu dài tốt, dù xương ghép có thể tiêu một phần. Khoảng răng cửa bên ở bên khe hở có thể xử trí bằng implant đường kính nhỏ trong xương ghép, cầu răng dán bằng nhựa, hàm giả tháo lắp từng phần, hoặc đóng khoảng bằng chỉnh nha và thay thế bằng răng nanh; lựa chọn phụ thuộc vào khoảng trống, thể tích xương và yếu tố của bệnh nhân."
      }
    ]
  },
  "clinical": {
    "heading": "Răng khôn mọc kẹt (mọc ngầm) trên phim X-quang và phim chụp thật",
    "note": "Những hình này là của người thật. Các tác giả đã chia sẻ chúng theo giấy phép mở. Giấy phép của từng hình ghi bên dưới hình đó, không phải giấy phép của mô hình.",
    "images": {
      "opgLow": {
        "alt": "Phim X-quang toàn cảnh. Răng khôn hàm dưới bên trái nằm sâu trong xương hàm, thấp phía sau răng hàm lớn thứ hai.",
        "caption": "Hình 1. Một răng khôn hàm dưới nằm sâu trong xương hàm, sát chân của răng phía trước. Răng nằm ở bên phải hình, tức là bên trái của người bệnh."
      },
      "ctCanal": {
        "alt": "Bốn lát cắt CT ngang qua hàm dưới, cho thấy răng khôn nằm sâu trong xương.",
        "caption": "Hình 2. Cùng chiếc răng đó trên phim CT, một loại X-quang 3D. Các tác giả cho biết răng nằm ngay trên ống thần kinh, giống như trong mô hình 3D."
      },
      "cbctNerve": {
        "alt": "Lưới các lát cắt CBCT qua một răng khôn hàm dưới. Ở một số lát cắt, ống thần kinh đi giữa các chân răng.",
        "caption": "Hình 3. Phim chụp 3D (CBCT) của một người khác. Ở đây ống thần kinh chạy giữa các chân của răng khôn."
      }
    },
    "credit": "Ghi công",
    "licence": "Giấy phép",
    "changes": "Thay đổi"
  },
  "disclaimer": {
    "title": "Tuyên bố miễn trừ trách nhiệm — Vivatheca",
    "description": "Mô hình và thông tin của Vivatheca chỉ nhằm mục đích giáo dục chung, không phải lời khuyên y tế.",
    "heading": "Tuyên bố miễn trừ trách nhiệm",
    "updated": "Cập nhật lần cuối: {date}",
    "date": "5 tháng 11 năm 2026",
    "site": "Vivatheca chỉ nhằm mục đích giáo dục chung. Đây không phải lời khuyên y tế và không được dùng để chẩn đoán, lập kế hoạch điều trị hoặc hướng dẫn phẫu thuật. Hãy hỏi nhân viên y tế có chuyên môn về sức khỏe của chính bạn.",
    "model": "Chỉ là mô hình giáo dục. Mô hình thể hiện giải phẫu hoặc bệnh điển hình, không phải của bệnh nhân thật nào, đã được đơn giản hóa và có thể có sai sót. Không dùng để chẩn đoán, lập kế hoạch điều trị, làm máng hướng dẫn phẫu thuật hoặc dùng trong hay trên cơ thể.",
    "translationNote": "Bản tiếng Việt này là bản nháp do AI soạn và chưa được nhân viên y tế nói tiếng Việt thẩm định. Nếu có khác biệt, bản tiếng Anh là bản chính thức.",
    "notReviewed": "Chưa được thẩm định lâm sàng.",
    "full": "Toàn văn tuyên bố miễn trừ trách nhiệm",
    "readFull": "Đọc toàn văn tuyên bố miễn trừ trách nhiệm.",
    "nav": "Miễn trừ trách nhiệm",
    "reviewNote": "Đây là bản dịch tham khảo do AI soạn và chưa được thẩm định. Nếu có khác biệt với bản tiếng Anh, bản tiếng Anh được ưu tiên.",
    "sections": [
      {
        "heading": "Chỉ nhằm mục đích giáo dục",
        "paragraphs": [
          "Vivatheca cung cấp mô hình 3D, hình ảnh và thông tin bằng chữ để giáo dục chung và giúp nhân viên y tế giải thích bệnh cho bệnh nhân. Không có nội dung nào trên Vivatheca là lời khuyên về y tế, nha khoa hay sức khỏe.",
          "Việc sử dụng Vivatheca không tạo ra mối quan hệ giữa thầy thuốc và bệnh nhân. Hãy luôn hỏi nhân viên y tế có chuyên môn về sức khỏe của chính bạn, và đừng bao giờ trì hoãn hay bỏ qua lời khuyên chuyên môn vì điều bạn thấy ở đây."
        ]
      },
      {
        "heading": "Mô hình là hình minh họa, không phải hồ sơ bệnh nhân",
        "paragraphs": [
          "Mỗi mô hình thể hiện giải phẫu điển hình hoặc một ví dụ điển hình của bệnh. Các mô hình đã được đơn giản hóa, không được làm từ bất kỳ bệnh nhân nào có thể nhận dạng, và giải phẫu thật khác nhau giữa mỗi người. Mô hình có thể có sai sót, kể cả sau khi đã được thẩm định.",
          "Mỗi trang mô hình đều ghi rõ tình trạng thẩm định. \"Chưa được thẩm định lâm sàng\" nghĩa là chưa có người thẩm định có chuyên môn nào kiểm tra mô hình đó. Thẩm định lâm sàng chỉ kiểm tra độ chính xác về mặt giáo dục; điều đó không làm cho mô hình phù hợp để dùng trong lâm sàng."
        ]
      },
      {
        "heading": "Không dùng cho lâm sàng",
        "paragraphs": [
          "Không dùng mô hình, số đo hoặc tệp của Vivatheca để chẩn đoán, lập kế hoạch điều trị hoặc phẫu thuật, làm máng hướng dẫn phẫu thuật, vật cấy ghép, máng nẹp, hoặc bất kỳ thiết bị nào dùng trong hay trên cơ thể. Mô hình của Vivatheca không phải là trang thiết bị y tế và chưa được đăng ký với Cơ quan Quản lý Hàng hóa Trị liệu Úc (TGA) hay bất kỳ cơ quan quản lý nào khác."
        ]
      },
      {
        "heading": "Dành cho nhân viên y tế và nhà giáo dục",
        "paragraphs": [
          "Bạn vẫn chịu trách nhiệm về đánh giá lâm sàng của mình và phải kiểm tra mọi tài liệu bạn tạo bằng Vivatheca trước khi đưa cho bệnh nhân, kể cả việc tuân thủ các quy định về đồng thuận và quản lý tại nơi bạn làm việc.",
          "Bản nháp tạo bằng công cụ soạn tài liệu cho bệnh nhân là do AI tạo ra. AI có thể mắc lỗi, kể cả bịa ra sự kiện, con số hoặc nguồn tài liệu, và Vivatheca không thẩm định những gì bạn tạo. Không bao giờ nhập thông tin của bệnh nhân."
        ]
      },
      {
        "heading": "In 3D",
        "paragraphs": [
          "Bạn tự chịu rủi ro khi in mô hình. Chất lượng in, tỉ lệ và độ an toàn của vật liệu phụ thuộc vào máy in, cài đặt và vật liệu của bạn. Các chi tiết nhỏ có thể gây hóc nghẹn; hãy để xa tầm tay trẻ nhỏ. Mô hình in không vô trùng và không được đặt vào miệng hay cơ thể."
        ]
      },
      {
        "heading": "Nguồn tài liệu và các trang web khác",
        "paragraphs": [
          "Vivatheca có liên kết đến các dịch vụ y tế công cộng, nghiên cứu và các trang web khác để bạn tìm hiểu thêm. Chúng tôi không kiểm soát và không chịu trách nhiệm về nội dung của các trang đó."
        ]
      },
      {
        "heading": "Không bảo đảm và giới hạn trách nhiệm",
        "paragraphs": [
          "Vivatheca cùng các mô hình và thông tin được cung cấp miễn phí và \"nguyên trạng\", không có bất kỳ bảo đảm nào rằng chúng chính xác, đầy đủ hoặc phù hợp cho một mục đích cụ thể. Trong phạm vi pháp luật cho phép, Vivatheca cùng các giám đốc, tình nguyện viên và người đóng góp không chịu trách nhiệm về bất kỳ tổn thất hay thiệt hại nào phát sinh từ việc sử dụng hoặc dựa vào chúng.",
          "Không nội dung nào trong tuyên bố này loại trừ, hạn chế hay thay đổi bất kỳ quyền hoặc biện pháp khắc phục nào của bạn theo Luật Người tiêu dùng Úc hoặc luật khác không thể bị loại trừ."
        ]
      },
      {
        "heading": "Giấy phép",
        "paragraphs": [
          "Các mô hình được chia sẻ theo giấy phép ghi trên từng trang mô hình (thường là CC BY-SA 4.0). Giấy phép cho phép bạn sử dụng lại và chỉnh sửa tệp; điều đó không làm cho tệp phù hợp để dùng trong lâm sàng."
        ]
      },
      {
        "heading": "Trường hợp khẩn cấp",
        "paragraphs": [
          "Nếu bạn nghĩ mình đang gặp tình trạng cấp cứu y tế, hãy gọi ngay số cấp cứu tại nơi bạn ở (115 tại Việt Nam, 000 tại Úc)."
        ]
      },
      {
        "heading": "Liên hệ",
        "paragraphs": [
          "Câu hỏi hoặc lỗi trong mô hình: vivatheca@gmail.com. Tuyên bố này chịu sự điều chỉnh của pháp luật bang Nam Úc."
        ]
      }
    ]
  },
  "create": {
    "back": "Quay lại các mô hình",
    "eyebrow": "Thử nghiệm · Dành cho nhân viên y tế",
    "heading": "Soạn tài liệu cho bệnh nhân",
    "guidanceHeading": "Hướng dẫn mà công cụ này tuân theo",
    "guidanceIntro": "Các quy tắc soạn thảo và bước kiểm tra dựa trên những nguồn đã công bố này. Giới hạn về cấp độ đọc và độ dài câu là các mục tiêu thông dụng rút ra từ hướng dẫn đó, không phải ngưỡng đã được thẩm định, và công thức đo độ dễ đọc chỉ ước tính văn bản dễ đọc đến đâu.",
    "intro": "Soạn tờ rơi, trang A4, phần đồng thuận hoặc lời thuyết minh đi kèm một mô hình Vivatheca. Kiểm tra theo hướng dẫn về ngôn ngữ dễ hiểu và truyền đạt nguy cơ, chỉnh sửa và xuất ra để in."
  },
  "builder": {
    "verification": [
      "Tôi đã kiểm tra mọi thông tin dựa trên bằng chứng hiện hành và kiến thức lâm sàng của mình.",
      "Mọi con số về nguy cơ đều có nguồn, và các nguồn đã được liệt kê.",
      "Mọi dấu [CHECK] đã được xử lý và công cụ kiểm tra không báo lỗi, hoặc tôi chấp nhận các lỗi còn lại.",
      "Tài liệu không chứa thông tin có thể nhận diện bệnh nhân."
    ],
    "materials": {
      "leaflet": "Trang hoặc tờ thông tin cho bệnh nhân",
      "sheet": "Tờ thông tin một trang A4",
      "consent": "Phần nguy cơ và lựa chọn (hỗ trợ đồng thuận)",
      "narration": "Lời thuyết minh cho bản in 3D hoặc video"
    },
    "audiences": {
      "adult": "Người lớn được điều trị",
      "carer": "Cha mẹ hoặc người chăm sóc của trẻ được điều trị",
      "teen": "Thiếu niên (12 đến 17 tuổi) được điều trị"
    },
    "models": {
      "impacted-molar": "Răng khôn hàm dưới mọc ngầm",
      "none": "Chủ đề khác (chưa có mô hình Vivatheca)"
    },
    "draftNotice": "BẢN NHÁP: có hỗ trợ của AI, chưa được kiểm chứng lâm sàng. Có thể có sai sót. Không phải lời khuyên y khoa.",
    "defaultTopic": "Nhổ răng khôn hàm dưới",
    "ack": {
      "heading": "Trước khi bắt đầu",
      "items": [
        "**Bản nháp do AI tạo và không đảm bảo chính xác.** AI có thể mắc lỗi, kể cả bịa ra thông tin, con số hoặc nguồn trông rất thuyết phục.",
        "Không có gì ở đây là lời khuyên y khoa, và Vivatheca không thẩm định hay kiểm chứng những gì bạn tạo ra.",
        "**Bạn chịu trách nhiệm** kiểm tra mọi thông tin, con số và nguồn trước khi đưa tài liệu cho bệnh nhân, và tuân theo quy định về đồng thuận và quản lý tại nơi bạn làm việc.",
        "**Không nhập thông tin bệnh nhân.** Chỉ dùng thông tin chung. Nội dung yêu cầu và bản nháp chỉ lưu trong trình duyệt này; yêu cầu AI được gửi đến Anthropic để xử lý và Vivatheca không lưu lại.",
        "Công cụ kiểm tra độ dễ đọc chỉ là bước lọc đầu tiên, không chứng minh chất lượng. Hãy thử tài liệu với những người thuộc nhóm đối tượng dự kiến."
      ],
      "accept": "Tôi hiểu và chấp nhận những giới hạn này.",
      "continue": "Tiếp tục đến công cụ soạn"
    },
    "bannerStrong": "AI có thể mắc lỗi.",
    "banner": "Mọi bản nháp đều chưa được kiểm chứng cho đến khi bạn kiểm tra. Không nhập thông tin bệnh nhân.",
    "brief": "Yêu cầu",
    "model": "Mô hình Vivatheca",
    "material": "Loại tài liệu",
    "audience": "Đối tượng",
    "topic": "Chủ đề",
    "keyPoints": "Các ý chính cần nêu",
    "keyPointsHint": "Mỗi dòng một ý. Chỉ thông tin chung.",
    "keyPointsPlaceholder": "VD: Vì sao có thể cần nhổ răng; điều gì diễn ra trong ngày điều trị; mất bao lâu để hồi phục",
    "riskNumbers": "Số liệu nguy cơ",
    "riskNumbersHint": "Chỉ những con số bạn có nguồn, kèm số thứ tự nguồn. AI được yêu cầu không bịa ra con số nào.",
    "riskNumbersPlaceholder": "VD: Tê môi hoặc cằm kéo dài: khoảng 1 trên 100 khi chân răng gần dây thần kinh [1]",
    "sources": "Nguồn",
    "sourcesHint": "Đánh số, đúng như sẽ xuất hiện trong danh mục tài liệu tham khảo.",
    "sourcesPlaceholder": "[1] Tác giả, Tên bài, Tạp chí, Năm. DOI",
    "patientDetails": "Nội dung này có thể chứa thông tin bệnh nhân ({details}). Hãy xóa trước khi tiếp tục.",
    "drafting": "Đang soạn…",
    "draftWithAi": "Soạn bằng AI",
    "copyPrompt": "Sao chép câu lệnh cho AI chat của bạn",
    "aiOff": "Chức năng soạn bằng AI một chạm chưa được bật. Hãy sao chép câu lệnh vào bất kỳ AI chat nào bạn đang dùng (ví dụ Claude hoặc ChatGPT), rồi dán câu trả lời vào ô bản nháp bên dưới.",
    "showPrompt": "Hiện toàn bộ câu lệnh",
    "draftAndRefine": "Soạn và chỉnh sửa",
    "draftLabel": "Bản nháp (Markdown)",
    "draftPlaceholder": "Bản nháp của bạn hiện ở đây. Bạn cũng có thể tự dán hoặc viết.",
    "checker": "Kiểm tra",
    "checkerEnglishOnly": "Điểm và gợi ý về độ dễ đọc được thiết kế cho văn bản tiếng Anh. Với bản nháp tiếng Việt, chỉ nên xem để tham khảo.",
    "readingGrade": "Cấp độ đọc",
    "smog": "SMOG",
    "readingEase": "Độ dễ đọc",
    "words": "Số từ",
    "target": "mục tiêu",
    "spoken": "≈ {seconds} giây khi đọc",
    "toFix": "cần sửa",
    "toConsider": "nên xem xét",
    "possibleDetails": "Có thể có thông tin bệnh nhân: {details}.",
    "exportBlocked": "Không thể xuất vì bản nháp có thể chứa thông tin bệnh nhân ({details}). Hãy xóa chúng để in hoặc tải xuống.",
    "checksSource": "Các kiểm tra lấy từ bộ công cụ mã nguồn mở patient-education-toolkit, dựa trên các hướng dẫn liệt kê bên dưới công cụ soạn (NHS, ISO 24495-1, CDC, PEMAT, IPDAS). Điểm số chỉ là ước tính.",
    "simplifying": "Đang đơn giản hóa…",
    "simplify": "Viết đơn giản hơn (AI)",
    "reviewing": "Đang đánh giá…",
    "review": "Đánh giá theo PEMAT và CDC (AI)",
    "copySimplify": "Sao chép câu lệnh “viết đơn giản hơn”",
    "aiReview": "Đánh giá của AI",
    "aiReviewHint": "Chưa được kiểm chứng. Chỉ dùng làm gợi ý.",
    "checkAndExport": "Kiểm tra và xuất",
    "viewHelp": "Xoay mô hình đến góc nhìn bạn muốn trên tờ A4, rồi lưu lại. Tờ thông tin cũng có mã QR để mở mô hình.",
    "useView": "Dùng góc nhìn này trên tờ thông tin",
    "savedView": "Góc nhìn mô hình đã lưu cho tờ thông tin",
    "modelAlt": "Mô hình 3D: {name}",
    "clinicianCheck": "Nhân viên y tế kiểm tra",
    "verifyHint": "Cho đến khi mọi ô được đánh dấu, bản xuất sẽ kèm thông báo “{notice}”. Chỉnh sửa bản nháp sẽ xóa các dấu đã đánh.",
    "checkedBy": "Người kiểm tra (họ tên và chức danh, không bắt buộc)",
    "checkedByPlaceholder": "VD: BS. Nguyễn Văn A, bác sĩ phẫu thuật hàm mặt",
    "print": "In hoặc lưu tờ A4 dạng PDF",
    "downloadHtml": "Tải HTML",
    "downloadMarkdown": "Tải Markdown",
    "preview": "Xem trước",
    "previewHint": "Xem trước. Phần “Ghi chú cho nhân viên y tế” không có trong bản xuất.",
    "checkedByFooter": "Người kiểm tra: {name}.",
    "treatingClinician": "nhân viên y tế điều trị",
    "exportFooter": "Được {name} kiểm tra ngày {date}. Soạn với sự hỗ trợ của AI trên Vivatheca. Hãy trao đổi với nha sĩ hoặc bác sĩ về trường hợp của riêng bạn.",
    "scanQr": "Quét để mở mô hình 3D",
    "modelView": "Góc nhìn mô hình 3D: {name}",
    "status": {
      "drafting": "Đang soạn bằng Claude. Có thể mất đến một phút.",
      "draftReady": "Bản nháp đã xong. Hãy kiểm tra mọi thông tin trước khi dùng.",
      "simplifying": "Đang đơn giản hóa bản nháp.",
      "reviewing": "Đang đánh giá theo PEMAT và Chỉ số Truyền thông Rõ ràng của CDC.",
      "done": "Xong. Hãy kiểm tra các thay đổi trước khi dùng.",
      "failed": "Yêu cầu AI không thành công.",
      "copied": "Đã sao chép {label}. Dán vào AI chat của bạn, rồi dán câu trả lời vào ô bản nháp.",
      "prompt": "Câu lệnh",
      "simplifyPrompt": "Câu lệnh đơn giản hóa",
      "copyBlocked": "Trình duyệt này chặn sao chép. Hãy chọn đoạn câu lệnh và sao chép thủ công.",
      "viewSaved": "Đã lưu góc nhìn mô hình cho tờ A4.",
      "popupBlocked": "Cửa sổ bật lên bị chặn. Hãy dùng \"Tải HTML\" và in tệp đó."
    }
  },
  "video": {
    "badge": "Video",
    "heading": "Xem: video ngắn về mô hình này",
    "meta": "{s} giây · giọng máy tính · có phụ đề",
    "says": "Nội dung video",
    "voice": "Giọng đọc do máy tính tạo ra (chuyển văn bản thành giọng nói Kokoro-82M). Video dùng cùng mô hình 3D với trang này, và được làm theo cùng cách với video có thuyết minh của mô hình răng khôn Vivatheca.",
    "sources": "Nguồn tài liệu của video",
    "label": "Video có thuyết minh: ",
    "noVideo": "Trình duyệt của bạn không phát được video này.",
    "english": "Xem bằng tiếng Anh"
  },
  "library": {
    "title": "Thư viện mô hình — Vivatheca",
    "description": "Mô hình 3D miễn phí về các bệnh lý răng miệng và hàm mặt, mỗi mô hình đi kèm giải phẫu bình thường, có tải GLB và STL.",
    "eyebrow": "Thư viện mô hình",
    "heading": "Mô hình có bản bình thường để so sánh.",
    "intro": "Mỗi bệnh lý đều đi kèm giải phẫu bình thường tương ứng, để bạn cho bệnh nhân thấy điều gì khác biệt và vì sao điều đó quan trọng. Tất cả mô hình đều miễn phí để xem, tải, in và chỉnh sửa theo giấy phép",
    "licenceOther": "Các mô hình làm từ BodyParts3D dùng giấy phép CC BY 4.0, cho phép bạn chia sẻ những gì bạn làm theo bất kỳ giấy phép nào. Mỗi thẻ đều ghi rõ.",
    "reviewLead": "Tình trạng thẩm định được ghi trên từng mô hình.",
    "listLabel": "Mô hình",
    "factsLabel": "Thông tin mô hình",
    "version": "Phiên bản {v}",
    "nextHeading": "Sắp ra mắt",
    "nextText": "Thư viện đang mở rộng để bao quát từng chuyên ngành nha khoa, cùng phẫu thuật miệng và hàm mặt, luôn có bản bình thường tương ứng. Tiếp theo: hàm mất răng teo xương.",
    "askText": "Bạn muốn có một mô hình cụ thể, hoặc có mô hình muốn chia sẻ?",
    "askLink": "Hãy cho chúng tôi biết",
    "askGap": " ",
    "askEnd": ".",
    "termsLabel": "Tên gọi và phân loại:",
    "notReviewed": "Chưa được thẩm định lâm sàng",
    "videoBadge": "Video",
    "watchVideo": "Xem video {s} giây",
    "items": {
      "averaged-jaw": {
        "title": "Xương hàm dưới và cung răng dưới trung bình của người trưởng thành: trung bình thống kê từ các phim CT công khai"
      },
      "fixation": {
        "title": "Cố định trong xương hàm dưới: kết hợp xương bằng nẹp nhỏ và nẹp tái tạo"
      },
      "impacted-wisdom-tooth": {
        "title": "Răng cối lớn thứ ba hàm dưới mọc ngầm nghiêng gần",
        "specialty": "Phẫu thuật miệng và hàm mặt",
        "summary": "Răng khôn hàm dưới bên trái nghiêng ra trước vào răng hàm lớn thứ hai, chân răng ôm quanh dây thần kinh huyệt răng dưới. So sánh với cùng xương hàm đó khi răng khôn mọc bình thường.",
        "pairing": "Bệnh lý + bản bình thường tương ứng"
      },
      "dental-development": {
        "title": "Bộ răng hỗn hợp: sự phát triển và mọc của răng vĩnh viễn, 6,5 đến 12,5 tuổi",
        "specialty": "Chỉnh nha và răng trẻ em",
        "summary": "Bảy giai đoạn, mỗi năm một giai đoạn từ 6,5 đến 12,5 tuổi, cho thấy răng sữa (xanh dương) được thay bằng răng vĩnh viễn (vàng) ở hàm trên và hàm dưới bên phải.",
        "pairing": "Chuỗi phát triển bình thường"
      },
      "periodontitis": {
        "title": "Viêm nha chu giai đoạn I đến IV (phân loại AAP/EFP 2017)",
        "specialty": "Nha chu",
        "summary": "Tiêu xương quanh các răng hàm dưới ở từng giai đoạn viêm nha chu, bên cạnh xương hàm khỏe mạnh. Trong ảnh: khỏe mạnh (trái) và giai đoạn III (phải).",
        "pairing": "Các giai đoạn bệnh + bản bình thường khỏe mạnh"
      },
      "oroantral": {
        "title": "Thông thương miệng – xoang hàm và rò miệng – xoang hàm sau nhổ răng cối lớn hàm trên",
        "specialty": "Phẫu thuật miệng và hàm mặt",
        "summary": "Thông miệng xoang và rò miệng xoang, cách đóng chúng, và sàn xoang bình thường phía trên răng hàm trên. Trong ảnh: bình thường (trái) và lỗ thông sau nhổ răng (phải).",
        "pairing": "Bệnh lý + bản bình thường tương ứng"
      },
      "cracked-tooth": {
        "title": "Nứt răng cối lớn thứ nhất hàm dưới: phục hồi trực tiếp so với mão phủ múi",
        "specialty": "Nha khoa phục hồi và phục hình",
        "summary": "Một răng hàm khỏe mạnh và một răng hàm bị nứt dưới lực cắn, và cách miếng trám hoặc mão răng giữ đường nứt lại. Trong ảnh: khỏe mạnh (trái) và bị nứt (phải), cắt mở.",
        "pairing": "Bệnh lý + bản bình thường khỏe mạnh + các cách điều trị"
      },
      "alveolar-bone-graft": {
        "title": "Ghép xương ổ răng thì hai cho khe hở ổ răng một bên",
        "specialty": "Điều trị khe hở: phẫu thuật miệng và hàm mặt và chỉnh nha",
        "summary": "Hàm trên của một trẻ có khe hở cung hàm bên trái, qua ba giai đoạn: trước khi ghép xương, sau ghép có mắc cài, và nhiều năm sau khi răng nanh đã được đưa vào chỗ trống. Trong ảnh: trước (trái) và nhiều năm sau (phải).",
        "pairing": "Các giai đoạn điều trị"
      },
      "vpi": {
        "title": "Thiểu năng vòm hầu sau phẫu thuật khe hở vòm miệng, so với đóng vòm hầu bình thường",
        "specialty": "Điều trị khe hở môi vòm miệng và âm ngữ trị liệu",
        "summary": "Họng được cắt dọc ở giữa. Khi nói bình thường, vòm miệng mềm đóng đường lên mũi; khi có VPI, một khe hở để không khí thoát lên mũi. Mô hình cho thấy ba phẫu thuật đóng khe hở và vì sao cần trị liệu ngôn ngữ trước và sau phẫu thuật. Trong ảnh: đóng bình thường (trái) và VPI (phải).",
        "pairing": "Bệnh lý + bản bình thường khỏe mạnh + các cách điều trị"
      },
      "endodontic": {
        "title": "Hoại tử tủy kèm áp xe quanh chóp mạn tính ở răng cối lớn thứ nhất hàm dưới, so với răng lành",
        "specialty": "Nội nha",
        "summary": "Một răng cối lớn thứ nhất hàm dưới có tủy đã chết do sâu răng sâu, nhiễm trùng ở cả hai chóp chân răng và đường rò ra lợi, đặt cạnh chính răng đó khi lành. Cắt mở để so sánh. Trong ảnh: răng lành (trái) và áp xe (phải), đã cắt mở.",
        "pairing": "Bệnh lý + răng bình thường lành mạnh"
      },
      "stainless-steel-crown": {
        "title": "Mão kim loại làm sẵn (mão thép không gỉ) trên răng cối sữa thứ hai hàm dưới",
        "specialty": "Răng trẻ em",
        "summary": "Năm giai đoạn từ răng hàm sữa khỏe mạnh, qua sâu răng và mài răng, đến khi gắn mão thép không gỉ. Trong ảnh: sâu răng (trái) và mão răng (phải).",
        "pairing": "Bản bình thường khỏe mạnh + các giai đoạn điều trị"
      },
      "head-neck": {
        "title": "Đầu và cổ",
        "specialty": "Phẫu thuật miệng và hàm mặt (đầu và cổ)",
        "summary": "Bốn ca thật đã công bố được dựng lại bằng 3D, mỗi ca có trang riêng, phim X-quang và ảnh, cùng hai mô hình vòm miệng điển hình. Trong ảnh: bốn mô hình ca bệnh.",
        "pairing": "Bốn ca thật và hai mô hình điển hình"
      },
      "head-neck-scc": {
        "title": "Ung thư biểu mô tế bào vảy nướu hàm dưới: cắt đoạn xương hàm dưới và tái tạo bằng vạt xương mác tự do",
        "specialty": "Phẫu thuật miệng và hàm mặt (đầu và cổ)",
        "summary": "Một ca đã công bố: ung thư lợi hàm dưới bên phải đã lan vào xương. Nửa phải xương hàm được cắt bỏ và tái tạo bằng xương mác ở chân, chia ba đoạn, đúng như trên phim X-quang của bệnh nhân.",
        "pairing": "Trước phẫu thuật, phần được cắt bỏ, khuyết hổng và xương hàm đã tái tạo"
      },
      "head-neck-ameloblastoma": {
        "title": "U nguyên bào men xương hàm dưới: cắt bờ xương hàm dưới",
        "specialty": "Phẫu thuật miệng và hàm mặt (đầu và cổ)",
        "summary": "Một ca đã công bố: khối u ở phía trước hàm dưới bên trái. Phần trên xương hàm được cắt bỏ cùng bốn răng, và một nẹp giữ cho bờ dưới mỏng còn lại vững chắc.",
        "pairing": "Trước phẫu thuật, phần được cắt bỏ, phần còn lại và nẹp"
      },
      "head-neck-okc": {
        "title": "Nang sừng do răng xương hàm dưới: bóc nang và mài xương ngoại vi",
        "specialty": "Phẫu thuật miệng và hàm mặt (đầu và cổ)",
        "summary": "Một ca đã công bố: nang ở chóp chân của hai răng hàm dưới bên trái, được lấy bỏ và mài thành xương. Sơ đồ tám cách điều trị và tỷ lệ tái phát của từng cách.",
        "pairing": "Trước phẫu thuật, phần được lấy bỏ, khoang trống và quá trình lành"
      },
      "head-neck-mec": {
        "title": "Ung thư biểu mô nhầy – biểu bì độ thấp ở khẩu cái cứng: cắt rộng tại chỗ",
        "specialty": "Phẫu thuật miệng và hàm mặt (đầu và cổ)",
        "summary": "Một ca đã công bố: ung thư biểu bì nhầy độ thấp ở vòm miệng bên phải, được cắt bỏ cùng một viền niêm mạc nhưng giữ lại xương, rồi lành dưới một tấm che.",
        "pairing": "Trước phẫu thuật, phần được cắt bỏ, vùng hở và quá trình lành"
      },
      "orthognathic": {
        "title": "Sai khớp cắn xương loại II và loại III: phẫu thuật chỉnh hình xương hàm (cắt xương Le Fort I, BSSO và tạo hình cằm)",
        "specialty": "Chỉnh nha và phẫu thuật miệng và hàm mặt",
        "summary": "Tương quan hàm loại II và loại III trước và sau phẫu thuật chỉnh hình xương hàm, bên cạnh loại I bình thường. Có thể thêm phẫu thuật cằm (tạo hình cằm) trên các mô hình sau phẫu thuật. Trong ảnh: loại II trước phẫu thuật (trái) và sau phẫu thuật có tạo hình cằm (phải).",
        "pairing": "Bệnh lý + bản bình thường"
      }
    }
  },
  "wisdom": {
    "title": "Răng cối lớn thứ ba hàm dưới mọc ngầm nghiêng gần và mô hình bình thường tương ứng — Vivatheca",
    "description": "Mô hình 3D miễn phí của răng khôn hàm dưới mọc ngầm gần dây thần kinh huyệt răng dưới, kèm xương hàm bình thường tương ứng. Tải GLB và STL, nguồn tài liệu và giấy phép.",
    "breadcrumb": "Đường dẫn",
    "impactedAlt": "Hàm dưới bên trái có răng khôn mọc ngầm nghiêng ra trước vào răng hàm lớn thứ hai. Chân răng ôm quanh dây thần kinh huyệt răng dưới, màu vàng.",
    "normalAlt": "Cùng hàm dưới bên trái đó với răng khôn đã mọc thẳng, thẳng hàng với các răng hàm khác. Dây thần kinh huyệt răng dưới màu vàng nằm dưới các chân răng.",
    "download": "Tải xuống",
    "files": [
      "Mọc ngầm · GLB (web và AR)",
      "Mọc ngầm · STL để in, mm (tệp ZIP kèm hướng dẫn)",
      "Bình thường · GLB (web và AR)",
      "Bình thường · STL để in, mm (tệp ZIP kèm hướng dẫn)"
    ],
    "licence": "Giấy phép:",
    "licenceText": "Bạn có thể dùng, chỉnh sửa và in các mô hình này, kể cả trong tài liệu cho bệnh nhân của mình, nếu ghi công Vivatheca. Nếu bạn thay đổi mô hình hoặc hình ảnh của nó, hãy chia sẻ bản đã thay đổi theo giấy phép CC BY-SA 4.0.",
    "makeInfo": "Soạn tài liệu cho bệnh nhân với mô hình này",
    "details": "Chi tiết mô hình",
    "versionLabel": "Phiên bản",
    "versionValue": "{v}, cập nhật {date}",
    "statusLabel": "Tình trạng thẩm định",
    "statusValue": "Chưa được thẩm định lâm sàng. Chưa có nhân viên y tế độc lập nào kiểm tra.",
    "pairLabel": "Cặp mô hình",
    "showsHeading": "Mô hình thể hiện gì",
    "shows": [
      "Nửa trái hàm dưới, phần xương phía má được cắt bỏ để thấy chân răng và dây thần kinh.",
      "Răng hàm lớn thứ ba hàm dưới bên trái (răng 38) mọc ngầm nghiêng gần, tựa vào mặt xa của răng hàm lớn thứ hai.[1]",
      "Dây thần kinh huyệt răng dưới (màu vàng) trong ống thần kinh răng dưới, đi giữa các chân của răng hàm lớn thứ ba.[2][6] Đây là kiểu sắp xếp ít gặp hơn và nguy cơ cao hơn; thường thì ống nằm dưới hoặc cạnh chân răng.[3][7][8] Trong một phân tích gộp ba nghiên cứu, CBCT thể hiện liên quan này chính xác hơn phim toàn cảnh,[5] nhưng một thử nghiệm ngẫu nhiên cho thấy chụp CBCT trước khi nhổ không làm giảm tổn thương thần kinh.[9]",
      "Dây thần kinh đi lên để vào ống thần kinh răng dưới ở mặt trong cành lên, gần lưỡi gà xương hàm dưới.[2][4]"
    ],
    "normalHeading": "Cách làm mô hình bình thường",
    "normalMethod": "Mô hình bình thường tương ứng dùng cùng xương hàm, răng và dây thần kinh. Chỉ răng khôn được thay đổi: nó được thay bằng một răng hàm lớn thứ ba mọc thẳng, thẳng hàng với răng hàm lớn thứ hai, cùng mức khớp cắn. Hình dạng là răng hàm lớn thứ hai thu nhỏ còn 92%, chân răng ngắn hơn 20%, để chân răng cách dây thần kinh ít nhất 1,5 mm. Đây là cách làm gần đúng: răng hàm lớn thứ ba thật thường nhỏ hơn răng hàm lớn thứ hai, thân răng biến đổi nhiều hơn và chân răng thường dính nhau,[10] và bờ trước cành lên vẫn hơi chồng lên phía sau thân răng. Răng khôn đã mọc vẫn có thể có chân gần dây thần kinh; mô hình bình thường này thể hiện một kiểu sắp xếp điển hình.",
    "simplifiedHeading": "Những gì được đơn giản hóa",
    "simplifications": [
      "Một xương hàm điển hình, không phải phim chụp của bệnh nhân. Xương hàm, chân răng và đường đi của dây thần kinh thật rất khác nhau.[2][7]",
      "Không thể hiện lợi, dây thần kinh lưỡi, mạch máu và hàm trên.",
      "Xương đặc. Ống thần kinh răng dưới và các ổ răng không được làm rỗng.",
      "Dây thần kinh là một ống đơn giản hóa. Đoạn ra ở lỗ cằm được thể hiện như một mảnh ngắn riêng, và nhánh răng cửa không được thể hiện.",
      "Tệp STL tính bằng milimét, lớn khoảng 1,7 lần kích thước thật (dài 166 mm), để chân răng và dây thần kinh dễ thấy hơn. Hãy thu nhỏ còn khoảng 60% trong phần mềm cắt lớp để có kích thước thật. Tệp chưa được kiểm tra là khối kín, nên hãy sửa trong phần mềm cắt lớp trước khi in."
    ],
    "sourcesHeading": "Nguồn đã công bố",
    "citeLabel": "Nguồn {n}",
    "sourcesNote": "Được Luke Seifert, người sáng lập Vivatheca, dựng từ đầu; không dùng lưới mô hình của bên thứ ba hay thư viện nào. Các nguồn dưới đây hỗ trợ giải phẫu và thuật ngữ mà mô hình thể hiện; mô hình không được làm từ phim chụp bệnh nhân hay từ số đo trong các nghiên cứu này.",
    "changelogHeading": "Nhật ký thay đổi",
    "changelog": [
      {
        "version": "1.3",
        "text": "Răng nay có màu trắng như răng thật và dây thần kinh huyệt răng dưới màu vàng. Màu xương không đổi."
      },
      {
        "version": "1.2",
        "text": "Răng nay có màu răng, sáng hơn xương một chút, như mọi mô hình Vivatheca khác. Tệp STL nay nằm trong tệp ZIP kèm hướng dẫn ghi tình trạng thẩm định, tuyên bố miễn trừ trách nhiệm và giấy phép."
      },
      {
        "version": "1.1",
        "text": "Thêm xương hàm bình thường tương ứng và tệp STL cho cả hai mô hình."
      },
      {
        "version": "1.0",
        "text": "Cập nhật sang mô hình có màu với dây thần kinh màu đỏ, từ dự án thông tin bệnh nhân về răng khôn của Vivatheca."
      }
    ],
    "creditHeading": "Cách ghi công",
    "copyCitation": "Sao chép trích dẫn",
    "copied": "Đã sao chép",
    "citationCopied": "Đã sao chép trích dẫn",
    "reportHeading": "Bạn thấy điều gì chưa đúng?",
    "reportText": "Nếu bất cứ điều gì trong mô hình này không khớp với giải phẫu hoặc với bệnh, hãy cho chúng tôi biết. Mọi báo cáo đều được đọc và nhật ký thay đổi ở trên ghi lại từng lần sửa."
  },
  "parts": {
    "heading": "Tháo rời mô hình",
    "hint": "Chạm vào một phần để ẩn. Chạm lần nữa để hiện lại.",
    "group": "Các phần của mô hình",
    "all": "Hiện tất cả các phần",
    "names": {
      "bone": "Xương",
      "teeth": "Răng",
      "canine": "Răng nanh",
      "graft": "Xương mới (xương ghép)",
      "nerve red": "Dây thần kinh",
      "wisdom tooth": "Răng khôn"
    }
  },
  "compare": {
    "which": "Mô hình cần hiển thị",
    "both": "Cạnh nhau",
    "impacted": "Mọc ngầm",
    "normal": "Bình thường",
    "together": "Xoay cả hai cùng lúc",
    "diffLead": "Chỉ có răng khôn là khác nhau.",
    "diff": "Mọc ngầm: nghiêng về phía trước vào răng hàm lớn thứ hai, chân răng ôm quanh dây thần kinh (màu vàng). Bình thường: mọc thẳng và đã lên, thẳng hàng với các răng hàm khác.",
    "impactedCaption": "Mọc ngầm (nghiêng gần)",
    "normalCaption": "Bình thường tương ứng (đã mọc)",
    "failed": "Không tải được trình xem 3D. Hãy dùng các liên kết tải xuống bên dưới để mở mô hình.",
    "loading": "Đang tải mô hình 3D…",
    "help": "Kéo để xoay · Cuộn hoặc chụm hai ngón để phóng to · Trên điện thoại, chạm biểu tượng AR để đặt mô hình lên bàn"
  },
  "search": {
    "title": "Tìm kiếm | Vivatheca",
    "description": "Tìm trong mọi mô hình, trang ca bệnh và trang cho sinh viên của Vivatheca.",
    "heading": "Tìm kiếm",
    "intro": "Tìm mô hình, bệnh, trang ca bệnh hoặc trang cho sinh viên. Kết quả lấy từ các trang ở ngôn ngữ bạn đang dùng.",
    "placeholder": "Tìm, ví dụ \"xương mác\" hoặc \"răng khôn\"",
    "clear": "Xóa",
    "zero": "Không có kết quả cho [SEARCH_TERM]",
    "many": "[COUNT] kết quả cho [SEARCH_TERM]",
    "one": "[COUNT] kết quả cho [SEARCH_TERM]",
    "more": "Tải thêm kết quả",
    "searching": "Đang tìm [SEARCH_TERM]...",
    "note": "Chỉ mục tìm kiếm được tạo khi trang web được xuất bản, nên trang thêm hôm nay sẽ xuất hiện sau lần xuất bản tiếp theo."
  },
  "about": {
    "title": "Giới thiệu — Vivatheca",
    "description": "Vì sao Vivatheca ra đời, ai điều hành và cách tổ chức phi lợi nhuận này được quản lý.",
    "eyebrow": "Giới thiệu",
    "heading": "Mô hình 3D rõ ràng cho cuộc trò chuyện bên ghế nha.",
    "intro": "Vivatheca là thư viện miễn phí các mô hình 3D về răng miệng và hàm mặt. Nhân viên y tế dùng chúng để giải thích bệnh lý, cho thấy quá trình điều trị, và tự soạn tài liệu giáo dục bệnh nhân, trên màn hình hoặc dưới dạng bản in 3D.",
    "whyHeading": "Vì sao Vivatheca ra đời",
    "whyEvidence": "Xem các thử nghiệm, kèm đường dẫn, trong phần Bằng chứng",
    "why": [
      "Các thử nghiệm ở những chuyên ngành phẫu thuật khác cho thấy mô hình 3D có thể giúp bệnh nhân hiểu rõ hơn và giao tiếp tốt hơn, dù bằng chứng trong nha khoa còn hạn chế. Mô hình tốt thường đắt, khó tìm, hoặc bị gắn với một sản phẩm.",
      "Vivatheca mở các mô hình đó cho mọi người: một nơi để tìm bệnh lý, xem nó bên cạnh giải phẫu bình thường, và tải về cho mọi mục đích giáo dục bệnh nhân."
    ],
    "principlesHeading": "Cách chúng tôi làm việc",
    "principles": [
      {
        "title": "Luôn có bản bình thường tương ứng",
        "text": "Bệnh lý dễ hiểu hơn khi đặt cạnh giải phẫu khỏe mạnh. Mỗi mô hình bệnh lý đều đi kèm một bản bình thường dựng từ cùng một nền, nên điểm khác biệt duy nhất là bệnh lý."
      },
      {
        "title": "Chỉ dùng bằng chứng đã công bố",
        "text": "Chi tiết giải phẫu và bệnh lý lấy từ tài liệu có bình duyệt và hướng dẫn lâm sàng được công nhận. Mỗi mô hình đều liệt kê nguồn."
      },
      {
        "title": "Mở và miễn phí",
        "text": "Mô hình được xem, tải, in và chỉnh sửa miễn phí theo giấy phép mở Creative Commons. Không cần tài khoản, không quảng cáo, không thu phí."
      },
      {
        "title": "Trung thực về giới hạn",
        "text": "Mỗi mô hình ghi rõ những gì được đơn giản hóa, phiên bản, và đã được nhân viên y tế thẩm định hay chưa. Không có gì được ghi là đã thẩm định cho đến khi thực sự đã thẩm định."
      }
    ],
    "reviewLabel": "Tình trạng thẩm định:",
    "reviewText": "chưa có mô hình nào được thẩm định lâm sàng độc lập.",
    "founderHeading": "Ai điều hành",
    "founderName": "Luke Seifert, Nhà sáng lập kiêm Giám đốc.",
    "founder": "Vivatheca được Luke, một người làm nghề nha khoa chuyên dựng mô hình và in 3D giải phẫu, thành lập tại Úc. Luke dựng từng mô hình, đối chiếu với các nguồn đã công bố và in thử trên máy in 3D Bambu P1S. Hiện đây là dự án một người. Các nhân viên y tế đang được mời thẩm định mô hình và đề xuất mô hình mới.",
    "noSponsor": "Vivatheca không có nhà tài trợ thương mại và không thu tiền từ các mô hình.",
    "planHeading": "Kế hoạch phi lợi nhuận",
    "plan": "Vivatheca được điều hành như một dự án phi lợi nhuận. Kế hoạch là thành lập Vivatheca Ltd, một công ty trách nhiệm hữu hạn bằng bảo lãnh tại Úc, và đăng ký làm tổ chức từ thiện với Ủy ban Tổ chức Từ thiện và Phi lợi nhuận Úc (ACNC). Cả hai bước đều chưa hoàn tất. Mọi khoản tài trợ trong tương lai sẽ dùng cho việc phát triển mô hình, lưu trữ web và mô hình in cho phòng khám, không bao giờ vì lợi nhuận.",
    "planUpdate": "Trang này sẽ được cập nhật thông tin đăng ký khi có.",
    "helpHeading": "Tham gia",
    "helpReport": "Báo cáo điểm chưa chính xác",
    "helpReportAfter": "trong bất kỳ mô hình nào.",
    "helpReview": "Tham gia thẩm định lâm sàng",
    "helpReviewAfter": "nếu bạn là nha sĩ, bác sĩ chuyên khoa hoặc người làm nghề chăm sóc sức khỏe răng miệng.",
    "helpRequest": "Đề xuất một mô hình",
    "helpRequestAfter": "mà bạn sẽ dùng với bệnh nhân."
  },
  "privacy": {
    "title": "Quyền riêng tư — Vivatheca",
    "description": "Vivatheca thu thập gì khi bạn dùng trang web, và không thu thập gì.",
    "eyebrow": "Quyền riêng tư",
    "heading": "Quyền riêng tư",
    "intro": "Cập nhật lần cuối ngày 6 tháng 11 năm 2026. Vivatheca được xây dựng để cần càng ít thông tin về bạn càng tốt.",
    "sections": [
      {
        "id": "no-accounts",
        "heading": "Không tài khoản, không cookie theo dõi",
        "text": "Bạn không cần tài khoản để xem hay tải mô hình. Trang web không dùng cookie quảng cáo hay theo dõi. Trang chỉ đặt các cookie nhỏ để nhớ lựa chọn ngôn ngữ và furigana của bạn, và lưu lựa chọn chế độ sáng hoặc tối trong trình duyệt của bạn."
      },
      {
        "id": "analytics",
        "heading": "Đếm lượt truy cập",
        "text": "Chúng tôi có thể dùng Cloudflare Web Analytics để đếm lượt truy cập trang. Công cụ này không dùng cookie, không thu thập thông tin cá nhân và không theo dõi bạn trên các trang khác. Chúng tôi chỉ dùng nó để biết mô hình nào hữu ích."
      },
      {
        "id": "hosting",
        "heading": "Lưu trữ web",
        "text": "Trang web được lưu trữ bởi Cloudflare. Như mọi máy chủ web, Cloudflare xử lý địa chỉ IP và thông tin trình duyệt của bạn để tải trang và bảo vệ trang khỏi bị lạm dụng."
      },
      {
        "id": "on-device",
        "heading": "Chỉ lưu trên thiết bị của bạn",
        "text": "Mục yêu thích đã lưu và bản nháp trong công cụ soạn thông tin cho bệnh nhân được giữ trong trình duyệt của chính bạn và không bao giờ gửi cho chúng tôi. Xóa dữ liệu trình duyệt sẽ xóa chúng. “Lưu để dùng ngoại tuyến” trên trang mô hình giữ một bản sao của trang đó và mô hình của nó trên thiết bị của bạn. Sau đó trang mở được khi không có internet. Xóa dữ liệu trang web trong trình duyệt để gỡ bản sao."
      },
      {
        "id": "builder",
        "heading": "Công cụ soạn thông tin cho bệnh nhân",
        "text": "Nếu bạn dùng chức năng soạn bằng AI, nội dung yêu cầu bạn nhập sẽ được gửi đến Anthropic (Hoa Kỳ) để viết bản nháp. Anthropic có thể lưu nó trong thời gian giới hạn theo điều khoản của họ; Vivatheca không lưu. Không bao giờ nhập họ tên, ngày sinh hoặc thông tin nhận diện khác của bệnh nhân."
      },
      {
        "id": "counts",
        "heading": "Đếm lượt sử dụng mô hình",
        "text": "Các trang mô hình đếm lượt xem, lượt tải, đường dẫn được chia sẻ và các lượt sử dụng tương tự của từng mô hình, để cho thấy mô hình nào hữu ích (xem trang tác động). Mỗi lượt đếm chỉ lưu mô hình, loại sử dụng và ngày. Không dùng cookie và không lưu gì về bạn."
      },
      {
        "id": "posts",
        "heading": "Đề xuất, ủng hộ và bài đăng",
        "text": "Nếu bạn đề xuất một mô hình, ủng hộ một mô hình, hoặc chia sẻ cách bạn đã dùng, nội dung bạn nhập được lưu trên máy chủ của Vivatheca (Cloudflare) và chỉ hiện trên trang sau khi một người kiểm tra. Để mỗi trình duyệt chỉ được tính một lượt ủng hộ, trang đề xuất đặt một cookie chứa một số ngẫu nhiên (vt-voter); chỉ dạng đã mã hóa của nó được lưu. Không ghi thông tin bệnh nhân. Bạn có thể yêu cầu chúng tôi xóa bài đăng của mình bất cứ lúc nào."
      },
      {
        "id": "survey",
        "heading": "Khảo sát nhân viên y tế",
        "text": "Nếu bạn trả lời khảo sát dành cho nhân viên y tế, câu trả lời được lưu trên máy chủ của Vivatheca (Cloudflare) kèm ngày giờ, nhưng không kèm tên, email hay địa chỉ IP. Chỉ Vivatheca đọc chúng, dưới dạng tổng hợp số lượng và trung bình. Bạn có thể yêu cầu xóa câu trả lời bất cứ lúc nào."
      },
      {
        "id": "email",
        "heading": "Khi bạn gửi email cho chúng tôi",
        "text": "Báo cáo và tin nhắn đến qua email. Chúng tôi chỉ giữ chúng để trả lời bạn và sửa mô hình, và không bao giờ chia sẻ. Bạn có thể yêu cầu xóa tin nhắn của mình bất cứ lúc nào."
      }
    ],
    "cloudflarePolicy": "Chính sách quyền riêng tư của Cloudflare",
    "contactHeading": "Liên hệ",
    "contact": "Câu hỏi về quyền riêng tư:"
  },
  "notFound": {
    "title": "Không tìm thấy trang — Vivatheca",
    "heading": "Chúng tôi không tìm thấy trang này.",
    "intro": "Liên kết có thể đã cũ hoặc bị gõ sai. Hãy xem bộ sưu tập mô hình hoặc quay lại trang chủ.",
    "models": "Xem các mô hình",
    "home": "Trang chủ Vivatheca"
  },
  "requests": {
    "title": "Đề xuất mô hình — Vivatheca",
    "description": "Ủng hộ những mô hình bạn sẽ dùng, hoặc đề xuất mô hình mới. Các ý tưởng được ủng hộ nhiều nhất sẽ vào danh sách rút gọn để xem xét.",
    "eyebrow": "Đề xuất mô hình",
    "heading": "Vivatheca nên làm mô hình nào tiếp theo?",
    "intro": "Hãy ủng hộ những mô hình bạn sẽ dùng trong phòng khám hoặc giảng dạy. Các ý tưởng được ủng hộ nhiều nhất sẽ vào danh sách rút gọn. Sau đó mỗi ý tưởng được kiểm tra: có đủ bằng chứng đã công bố tốt để dựng mô hình không, và có phù hợp với phạm vi của Vivatheca không (các chuyên ngành nha khoa và phẫu thuật miệng và hàm mặt, luôn có bản bình thường tương ứng)? Sự ủng hộ giúp quyết định thứ tự. Nó không đảm bảo sẽ có mô hình.",
    "listHeading": "Các ý tưởng trong danh sách",
    "submittedHeading": "Ý tưởng từ người truy cập",
    "support": "Ủng hộ ý tưởng này",
    "supported": "Bạn đã ủng hộ",
    "supporters": "{n} người ủng hộ",
    "supporter": "1 người ủng hộ",
    "noSupport": "Chưa có người ủng hộ",
    "loading": "Đang tải số lượt ủng hộ…",
    "unavailable": "Chức năng đếm lượt ủng hộ chưa được bật. Bạn vẫn có thể gửi ý tưởng qua email đến vivatheca@gmail.com.",
    "seeds": {
      "prosth-edentulous": {
        "title": "Xương hàm mất răng bị teo (hàm dưới mất răng teo xương) bên cạnh hàm còn răng, với các lựa chọn hàm giả và implant",
        "specialty": "Phục hình"
      },
      "dentigerous-cyst": {
        "title": "Nang quanh một răng chưa mọc (nang thân răng) bên cạnh một răng chưa mọc bình thường",
        "specialty": "Bệnh học miệng và hàm mặt"
      },
      "ectopic-canine": {
        "title": "Răng nanh hàm trên mọc sai chỗ (răng nanh lạc chỗ) bên cạnh quá trình mọc bình thường",
        "specialty": "Chỉnh nha"
      },
      "development-extended": {
        "title": "Sự phát triển của răng từ trước khi sinh đến tuổi trưởng thành (ngoài độ tuổi 6 đến 12)",
        "specialty": "Chỉnh nha và răng trẻ em"
      },
      "ortho-variants": {
        "title": "Thêm các ca phẫu thuật hàm: mặt lệch, cắn hở và phẫu thuật cằm",
        "specialty": "Chỉnh nha và phẫu thuật miệng và hàm mặt"
      },
      "oral-lichen-planus": {
        "title": "Liken phẳng ở miệng bên cạnh niêm mạc miệng khỏe mạnh",
        "specialty": "Bệnh học niêm mạc miệng"
      },
      "cleft": {
        "title": "Khe hở môi và vòm miệng bên cạnh giải phẫu bình thường",
        "specialty": "Phẫu thuật miệng và hàm mặt"
      },
      "cbct-slices": {
        "title": "Trình xem lát cắt CBCT cho một mô hình hiện có",
        "specialty": "X-quang miệng và hàm mặt"
      }
    },
    "suggestHeading": "Đề xuất một mô hình",
    "suggestIntro": "Nêu tên bệnh lý hoặc thủ thuật, và bản bình thường dùng để so sánh. Mỗi đề xuất đều được một người đọc trước khi hiện ở đây.",
    "fieldTitle": "Ý tưởng mô hình",
    "fieldTitlePlaceholder": "Ví dụ: viêm ổ răng khô sau nhổ răng khôn hàm dưới, bên cạnh quá trình lành bình thường",
    "fieldDetail": "Bạn sẽ dùng nó thế nào? (không bắt buộc)",
    "fieldDetailPlaceholder": "Ví dụ: để giải thích vì sao ổ răng bị đau và nó lành như thế nào.",
    "fieldSpecialty": "Chuyên ngành (không bắt buộc)",
    "fieldRole": "Vai trò của bạn (không bắt buộc)",
    "privacyLead": "Không ghi thông tin bệnh nhân",
    "privacy": "như họ tên, ngày sinh hoặc hình ảnh. Các đề xuất được lưu trên máy chủ của Vivatheca (Cloudflare) cho đến khi được duyệt hoặc xóa.",
    "submit": "Gửi đề xuất",
    "sending": "Đang gửi…",
    "thanks": "Cảm ơn bạn. Đề xuất của bạn sẽ hiện ở đây sau khi được kiểm tra.",
    "tooShort": "Vui lòng nêu tên ý tưởng mô hình.",
    "patient": "Nội dung này có thể có thông tin bệnh nhân, chẳng hạn một ngày tháng. Vui lòng xóa đi.",
    "failed": "Chưa gửi được. Vui lòng thử lại, hoặc gửi ý tưởng qua email đến vivatheca@gmail.com.",
    "busy": "Bạn đã thử quá nhiều lần. Vui lòng đợi một phút rồi thử lại.",
    "makeIt": "Bạn đã tự làm một mô hình, hoặc muốn gửi yêu cầu chi tiết?",
    "makeItLink": "Gửi hoặc yêu cầu một mô hình"
  },
  "used": {
    "title": "Cách mọi người dùng mô hình — Vivatheca",
    "description": "Tờ hướng dẫn, bài giảng và mô hình in: cách nhân viên y tế, giảng viên và sinh viên đã dùng mô hình Vivatheca.",
    "eyebrow": "Đã sử dụng",
    "heading": "Cách mọi người dùng mô hình Vivatheca",
    "intro": "Nhân viên y tế, giảng viên và sinh viên chia sẻ cách họ đã dùng một mô hình: một tờ hướng dẫn, một bài giảng, một mô hình in trong phòng khám. Mỗi bài đăng đều được một người kiểm tra trước khi hiện.",
    "note": "Bài đăng giữ nguyên lời của người gửi. Vivatheca chưa kiểm tra độ chính xác lâm sàng của chúng.",
    "filter": "Hiện bài đăng cho",
    "all": "Tất cả mô hình",
    "loading": "Đang tải bài đăng…",
    "empty": "Chưa có bài đăng nào. Hãy là người đầu tiên chia sẻ cách bạn đã dùng một mô hình.",
    "unavailable": "Chức năng bài đăng chưa được bật. Bạn có thể gửi email về cách bạn đã dùng mô hình đến vivatheca@gmail.com.",
    "by": "Chia sẻ bởi {who}",
    "someone": "một người dùng Vivatheca",
    "on": "ngày {date}",
    "see": "Xem những gì họ đã làm",
    "formHeading": "Chia sẻ cách bạn đã dùng một mô hình",
    "model": "Mô hình",
    "role": "Vai trò của bạn (không bắt buộc)",
    "how": "Bạn đã làm gì với mô hình?",
    "howPlaceholder": "Ví dụ: Tôi in các giai đoạn bệnh nha chu ở kích thước thật và dùng chúng bên ghế nha để giải thích tình trạng tiêu xương.",
    "link": "Đường dẫn đến những gì bạn đã làm (không bắt buộc, phải bắt đầu bằng https://)",
    "name": "Tên hoặc chữ viết tắt để hiển thị (không bắt buộc)",
    "country": "Quốc gia (không bắt buộc)",
    "noPatient": "Bài đăng này không có họ tên, ảnh, ngày sinh hoặc thông tin nào khác có thể nhận diện bệnh nhân.",
    "submit": "Gửi để kiểm tra",
    "sending": "Đang gửi…",
    "thanks": "Cảm ơn bạn. Bài đăng của bạn sẽ hiện ở đây sau khi được kiểm tra.",
    "tooShort": "Vui lòng cho biết bạn đã làm gì (ít nhất một câu).",
    "needConsent": "Vui lòng xác nhận bài đăng không có thông tin bệnh nhân.",
    "patient": "Nội dung này có thể có thông tin bệnh nhân, chẳng hạn một ngày tháng. Vui lòng xóa đi.",
    "failed": "Chưa gửi được. Vui lòng thử lại, hoặc gửi email đến vivatheca@gmail.com.",
    "busy": "Bạn đã thử quá nhiều lần. Vui lòng đợi một phút rồi thử lại.",
    "privacy": "Bài đăng được lưu trên máy chủ của Vivatheca (Cloudflare). Bạn có thể yêu cầu xóa bài của mình bất cứ lúc nào."
  },
  "review": {
    "title": "Thẩm định lâm sàng — Vivatheca",
    "description": "Cách bác sĩ có chuyên môn kiểm tra các mô hình Vivatheca, và hồ sơ xác nhận cho từng phiên bản mô hình.",
    "eyebrow": "Thẩm định lâm sàng",
    "heading": "Thẩm định lâm sàng các mô hình",
    "intro": "Mỗi mô hình đều được đối chiếu với nghiên cứu đã công bố trước khi đưa lên trang. Thẩm định lâm sàng là bước kiểm tra thứ hai do một bác sĩ có chuyên môn phù hợp thực hiện. Trang này trình bày cách thẩm định và hồ sơ xác nhận của từng mô hình.",
    "howHeading": "Cách thẩm định",
    "steps": [
      "Một bác sĩ có đăng ký hành nghề trong chuyên khoa của mô hình đề nghị thẩm định qua email.",
      "Họ xem phiên bản hiện tại của mô hình, nội dung trang và các nguồn, theo danh sách kiểm tra bên dưới.",
      "Họ gửi lại những gì đã phát hiện. Lỗi được sửa và mô hình có số phiên bản mới.",
      "Khi đã hài lòng, họ xác nhận phiên bản đó: tên, chuyên môn, ngày và những gì đã kiểm tra. Hồ sơ được thêm vào trang này.",
      "Phiên bản mới của mô hình cần được thẩm định lại. Trước đó, mô hình lại hiện “Chưa được thẩm định lâm sàng”."
    ],
    "checksHeading": "Người thẩm định kiểm tra những gì",
    "checks": {
      "anatomy": "Giải phẫu: hình dạng, kích thước và vị trí khớp với giải phẫu bình thường và các nguồn đã dẫn.",
      "condition": "Bệnh lý: bệnh hoặc vấn đề trông giống biểu hiện điển hình.",
      "treatment": "Điều trị: phương pháp điều trị được thể hiện phù hợp với thực hành hiện nay.",
      "text": "Nội dung cho bệnh nhân: chính xác, dễ hiểu và không gây hoang mang.",
      "sources": "Nguồn: mỗi số liệu trên trang có nguồn phù hợp, chất lượng cao.",
      "translation": "Bản dịch (chỉ người thẩm định thông thạo): bản tiếng Nhật hoặc tiếng Việt có cùng nội dung với bản tiếng Anh."
    },
    "recordHeading": "Hồ sơ xác nhận",
    "model": "Mô hình",
    "version": "Phiên bản hiện tại",
    "statusCol": "Tình trạng thẩm định",
    "none": "Chưa được thẩm định lâm sàng",
    "reviewed": "Thẩm định bởi {name} ({credentials}), {date}",
    "older": "Lần thẩm định trước của phiên bản {v} ({date})",
    "changes": "Yêu cầu chỉnh sửa",
    "status": "Đã được {name} ({credentials}) thẩm định lâm sàng ngày {date}, phiên bản {v}.",
    "limitHeading": "Thẩm định không có nghĩa là gì",
    "joinHeading": "Trở thành người thẩm định",
    "joinText": "Nếu bạn là nha sĩ, bác sĩ phẫu thuật hàm mặt hoặc bác sĩ có đăng ký hành nghề trong lĩnh vực liên quan và muốn thẩm định một mô hình, vui lòng gửi email cho chúng tôi. Tên người thẩm định chỉ được ghi trên trang này nếu họ đồng ý.",
    "joinLink": "Gửi email để tham gia thẩm định lâm sàng"
  },
  "survey": {
    "title": "Khảo sát dành cho nhân viên y tế — Vivatheca",
    "description": "Khảo sát hai phút cho bác sĩ và giảng viên: mô hình Vivatheca có đủ chính xác và hữu ích để dùng với bệnh nhân không?",
    "eyebrow": "Khảo sát nhân viên y tế",
    "heading": "Bạn có dùng các mô hình này với bệnh nhân không?",
    "intro": "Vivatheca miễn phí và do một người làm, nên ý kiến thẳng thắn của nhân viên y tế quyết định điều gì được sửa và làm tiếp. Khảo sát mất khoảng hai phút. Không hỏi tên hay email.",
    "method": "Cách dùng câu trả lời: được tổng hợp (số lượng và trung bình) để cải thiện mô hình và hỗ trợ hồ sơ xin tài trợ. Không công bố riêng câu trả lời nào. Các câu hỏi do Vivatheca soạn, không phải bảng câu hỏi đã được thẩm định.",
    "role": "Vai trò của bạn",
    "rolePick": "Chọn một",
    "country": "Quốc gia nơi bạn làm việc (không bắt buộc)",
    "model": "Bạn xem mô hình nào nhiều nhất?",
    "modelAny": "Nhiều mô hình hoặc không cụ thể",
    "scaleLegend": "Bạn đồng ý đến mức nào?",
    "scale": ["Hoàn toàn không đồng ý", "Không đồng ý", "Trung lập", "Đồng ý", "Hoàn toàn đồng ý"],
    "items": {
      "accurate": "Mô hình trông đủ chính xác để giải thích bệnh cho bệnh nhân.",
      "normal": "Xem mô hình bình thường bên cạnh mô hình bệnh giúp giải thích dễ hơn.",
      "use": "Tôi sẽ dùng các mô hình này với bệnh nhân của mình.",
      "sources": "Nguồn tham khảo và các điểm đơn giản hóa đủ rõ để tôi tin tưởng mô hình.",
      "easy": "Trang web dễ sử dụng."
    },
    "better": "Điều gì sẽ làm mô hình hữu ích hơn cho bạn? (không bắt buộc)",
    "next": "Vivatheca nên làm mô hình nào tiếp theo? (không bắt buộc)",
    "noPatient": "Câu trả lời của tôi không có tên, ngày sinh, ảnh hay thông tin nào có thể nhận ra bệnh nhân.",
    "consent": "Tôi đồng ý để câu trả lời của tôi, không kèm tên, được tổng hợp trong báo cáo và hồ sơ xin tài trợ.",
    "submit": "Gửi câu trả lời",
    "sending": "Đang gửi…",
    "thanks": "Cảm ơn bạn. Câu trả lời đã được lưu.",
    "needRole": "Vui lòng chọn vai trò của bạn.",
    "needAll": "Vui lòng trả lời cả năm câu.",
    "needConsent": "Vui lòng đánh dấu cả hai ô trước khi gửi.",
    "patient": "Nội dung có thể chứa thông tin bệnh nhân, ví dụ một ngày tháng. Vui lòng xóa đi.",
    "failed": "Chưa gửi được. Vui lòng thử lại hoặc email tới vivatheca@gmail.com.",
    "busy": "Thử quá nhiều lần. Vui lòng đợi một phút rồi thử lại.",
    "unavailable": "Khảo sát chưa được bật. Bạn có thể gửi ý kiến tới vivatheca@gmail.com.",
    "privacy": "Câu trả lời được lưu trên máy chủ của Vivatheca (Cloudflare), không kèm tên, email hay địa chỉ IP. Bạn có thể yêu cầu xóa bất cứ lúc nào: chúng tôi tìm theo ngày giờ bạn gửi.",
    "link": "Dành cho nhân viên y tế: đánh giá mô hình (2 phút)"
  },
  "impact": {
    "title": "Lượt sử dụng mô hình — Vivatheca",
    "description": "Mỗi mô hình Vivatheca được xem, tải, chia sẻ và sử dụng bao nhiêu lần.",
    "eyebrow": "Tác động",
    "heading": "Các mô hình được sử dụng thế nào",
    "intro": "Số lần mỗi mô hình được xem, chia sẻ và tải về. Các con số cho thấy mô hình nào hữu ích và sẽ giúp khi xin tài trợ. Việc đếm không dùng cookie và không lưu gì về bạn.",
    "since": "Đếm từ {date}.",
    "loading": "Đang tải số liệu…",
    "unavailable": "Chưa có số liệu.",
    "model": "Mô hình",
    "kinds": {
      "view": "Lượt xem trang",
      "download": "Lượt tải",
      "share": "Đường dẫn đã chia sẻ",
      "image": "Ảnh đã lưu",
      "steps": "Ảnh từng bước",
      "tour": "Lượt bắt đầu hướng dẫn",
      "embed": "Lượt xem nhúng",
      "credit": "Lượt sao chép ghi công",
      "print": "Bản in tùy chỉnh"
    },
    "total": "Tất cả mô hình",
    "method": "Cách đếm: mỗi lượt xem trang được đếm một lần cho mỗi phiên thẻ trình duyệt. Mỗi lần bấm vào đường dẫn tải được đếm một lần. Robot và các lần bấm lặp lại vẫn có thể bị đếm, nên hãy xem các con số là ước lượng."
  },
  "admin": {
    "title": "Kiểm duyệt — Vivatheca",
    "description": "Duyệt hoặc xóa các đề xuất mô hình và bài đăng mới.",
    "heading": "Kiểm duyệt",
    "intro": "Duyệt hoặc xóa các đề xuất mô hình và bài đăng “đã sử dụng” mới trước khi chúng hiện trên trang, và đọc câu trả lời khảo sát nhân viên y tế.",
    "off": "Chức năng kiểm duyệt đang tắt. Để bật, hãy thêm secret ADMIN_TOKEN cho Worker vivatheca trong Cloudflare.",
    "key": "Khóa quản trị",
    "signIn": "Hiện bài đăng đang chờ",
    "signOut": "Quên khóa",
    "wrong": "Khóa đó không đúng.",
    "loading": "Đang tải…",
    "empty": "Không có gì đang chờ.",
    "request": "Đề xuất mô hình",
    "used": "Bài đăng “đã sử dụng”",
    "approve": "Duyệt",
    "remove": "Xóa",
    "check": "Trước khi duyệt: không có thông tin bệnh nhân, không quảng cáo, và đường dẫn (nếu có) dẫn đúng nơi đã nêu.",
    "survey": {
      "heading": "Câu trả lời khảo sát nhân viên y tế",
      "none": "Chưa có câu trả lời nào.",
      "count": "Số câu trả lời: {n}",
      "item": "Nhận định",
      "mean": "Trung bình (1–5)",
      "agree": "Đồng ý hoặc rất đồng ý",
      "roles": "Số câu trả lời theo vai trò",
      "comments": "Câu trả lời viết",
      "csv": "Tải tất cả câu trả lời (CSV)",
      "remove": "Xóa câu trả lời này",
      "note": "Khi còn ít câu trả lời, số trung bình chỉ mang tính tham khảo."
    }
  },
  "templates": {
    "title": "Mẫu tờ hướng dẫn và trang chiếu — Vivatheca",
    "description": "Mẫu tờ hướng dẫn và trang chiếu có thể chỉnh sửa, đã có sẵn hình mô hình Vivatheca, ghi công và tuyên bố miễn trừ trách nhiệm.",
    "eyebrow": "Mẫu",
    "heading": "Mẫu tờ hướng dẫn và trang chiếu",
    "intro": "Các mẫu có thể chỉnh sửa, đã có sẵn hình mô hình, ghi công và tuyên bố miễn trừ trách nhiệm. Mở bằng PowerPoint, Keynote, Google Slides hoặc Canva, thêm nội dung của bạn, và giữ nguyên ghi công và tuyên bố miễn trừ.",
    "builder": "Cần nội dung cho tờ hướng dẫn? Hãy soạn bằng công cụ soạn thông tin cho bệnh nhân.",
    "tipsHeading": "Trước khi chia sẻ tờ hướng dẫn",
    "tips": [
      "Giữ dòng ghi công và tuyên bố miễn trừ. Giấy phép (CC BY-SA 4.0) yêu cầu ghi công, và mọi thứ làm từ mẫu đều dùng cùng giấy phép đó.",
      "Viết cho bệnh nhân: câu ngắn, ưu tiên từ ngữ thông dụng, và nêu nguy cơ dưới dạng “X trên 100”. Công cụ soạn sẽ kiểm tra giúp bạn.",
      "Ghi nguồn cho các thông tin của bạn, và nêu chỗ mô hình được đơn giản hóa.",
      "Không bao giờ thêm ảnh hoặc thông tin của bệnh nhân khi chưa có sự đồng ý được ghi nhận của họ.",
      "Các mẫu dùng hai phông chữ miễn phí, dễ đọc: Atkinson Hyperlegible và BIZ UDPGothic (cho tiếng Nhật). Tải miễn phí từ Google Fonts. Nếu không có, máy tính sẽ dùng phông chữ của chính nó."
    ],
    "handout": "Tờ hướng dẫn A4 (dọc)",
    "slide": "Trang chiếu (16:9)",
    "langs": {
      "en": "Tiếng Anh",
      "ja": "Tiếng Nhật"
    },
    "download": "Tải {format}, {lang} (PPTX, {size})",
    "picture": "Hình mô hình",
    "licence": "Các mẫu được cấp phép theo CC BY-SA 4.0, giống như các mô hình."
  },
  "printing": {
    "title": "In 3D một mô hình — Vivatheca",
    "description": "Tải mô hình Vivatheca dưới dạng tệp 3MF với các phần đã đặt tên và tô màu, hoặc tùy chỉnh bản in với đế, nhãn và lỗ nam châm.",
    "eyebrow": "In 3D",
    "heading": "In 3D một mô hình",
    "intro": "Tạo tệp 3MF với các phần đã được đặt tên và tô màu, sẵn sàng mở trong Bambu Studio, OrcaSlicer hoặc PrusaSlicer. Bạn có thể đổi kích thước, thêm đế có nhãn, và thêm lỗ cho nam châm.",
    "notTested": "Chưa in thử từ các tệp này. Các thiết lập bên dưới chỉ là điểm khởi đầu. Ảnh bản in thử sẽ được thêm cho từng tệp sau khi in.",
    "safety": "Mô hình in không vô khuẩn và không được cho vào miệng. Các phần nhỏ có nguy cơ gây hóc.",
    "settingsHeading": "Thiết lập phần mềm cắt lớp gợi ý (điểm khởi đầu)",
    "settings": [
      "Độ cao lớp 0,12 đến 0,16 mm cho răng và các phần nhỏ; 0,2 mm là đủ cho xương hàm lớn hơn.",
      "Giá đỡ: dạng cây, chỉ chạm bàn in khi có thể, để bề mặt răng sạch.",
      "Thành: 3. Độ đặc: 15% gyroid. Các phần trong tệp chồng lên nhau ở chỗ chân răng nằm trong xương, nên hãy in chúng như một vật thể với mỗi phần một màu riêng.",
      "Với AMS hoặc hệ thống nhiều màu khác, tệp đã gán sẵn mỗi màu vào một khe nhựa in riêng."
    ],
    "model": "Mô hình",
    "set": "Giai đoạn hoặc phiên bản",
    "fileScale": "Các tệp nguồn có kích thước bằng {scale} kích thước thật.",
    "loading": "Đang tải mô hình…",
    "loadFailed": "Không tải được tệp. Hãy tải lại trang để thử lại.",
    "preview": "Xem trước bản in 3D",
    "size": "Kích thước",
    "sizeHint": "{pct}% so với tệp nguồn ({life} kích thước thật).",
    "parts": "Các phần cần in",
    "base": "Thêm tấm đế",
    "label": "Nhãn trên đế (chữ cái, chữ số và dấu câu đơn giản)",
    "labelPlaceholder": "Ví dụ: Stage III",
    "magnets": "Lỗ cho nam châm dưới đế",
    "magnetSize": "Kích thước nam châm",
    "download3mf": "Tải 3MF",
    "downloadStl": "Tải STL (một tệp)",
    "building": "Đang tạo tệp…",
    "done": "Tệp đã sẵn sàng.",
    "failed": "Rất tiếc, không thể tạo tệp trong trình duyệt này.",
    "colours": "Màu sắc",
    "slot": "nhựa in {n}",
    "noFiles": "Mô hình này chưa có tệp in.",
    "credit": "Làm từ mô hình Vivatheca “{title}” (CC BY-SA 4.0, vivatheca.com). Bản in tùy chỉnh vẫn theo giấy phép CC BY-SA 4.0."
  },
  "report": {
    "title": "Báo cáo điểm chưa chính xác — Vivatheca",
    "description": "Báo cho Vivatheca về giải phẫu, nhãn hoặc nội dung trông chưa đúng trong một mô hình.",
    "eyebrow": "Độ chính xác lâm sàng",
    "heading": "Báo cáo điểm chưa chính xác",
    "intro": "Bạn thấy giải phẫu, nhãn hoặc mô tả nào trông chưa đúng? Hãy cho chúng tôi biết đó là gì và ở đâu. Báo cáo của nhân viên y tế được đối chiếu với các nguồn đã công bố, và mỗi lần sửa được ghi trong nhật ký thay đổi của mô hình.",
    "emailNote": "Báo cáo của bạn sẽ mở trong ứng dụng email, gửi đến vivatheca@gmail.com, để bạn kiểm tra trước khi gửi.",
    "model": "Mô hình",
    "issue": "Loại vấn đề?",
    "issues": [
      "Giải phẫu sai",
      "Bệnh lý thể hiện chưa chính xác",
      "Nhãn hoặc nội dung sai",
      "Vấn đề khi tải hoặc in",
      "Khác"
    ],
    "role": "Vai trò của bạn (không bắt buộc)",
    "preferNot": "Không muốn nêu",
    "roles": [
      "Nha sĩ",
      "Bác sĩ chuyên khoa răng hàm mặt",
      "Kỹ thuật viên chăm sóc sức khỏe răng miệng hoặc vệ sinh răng miệng",
      "Kỹ thuật viên điều trị nha khoa",
      "Kỹ thuật viên phục hình răng",
      "Bác sĩ y khoa",
      "Sinh viên",
      "Bệnh nhân hoặc người chăm sóc",
      "Khác"
    ],
    "privacyLead": "Không ghi thông tin bệnh nhân",
    "privacy": "như họ tên, ngày sinh hoặc hình ảnh từ hồ sơ bệnh nhân.",
    "details": "Điều gì sai và ở đâu?",
    "detailsPlaceholder": "Ví dụ: dây thần kinh phải đi bên dưới chân răng hàm lớn thứ hai, không phải đi giữa các chân răng.",
    "source": "Nguồn hỗ trợ (không bắt buộc)",
    "sourcePlaceholder": "DOI, đường dẫn hoặc tài liệu tham khảo",
    "tooShort": "Vui lòng mô tả điều gì sai và ở đâu (ít nhất một câu).",
    "tooLong": "Báo cáo này quá dài để gửi qua đường dẫn email. Hãy dùng “Sao chép nội dung báo cáo” và dán vào email gửi đến vivatheca@gmail.com.",
    "open": "Mở trong ứng dụng email",
    "copy": "Sao chép nội dung báo cáo",
    "copied": "Đã sao chép",
    "copiedLive": "Đã sao chép nội dung báo cáo"
  },
  "submitModel": {
    "board": "Bạn muốn xem những mô hình người khác đã đề xuất và ủng hộ chúng?",
    "boardLink": "Đến bảng đề xuất mô hình",
    "title": "Gửi hoặc yêu cầu một mô hình — Vivatheca",
    "description": "Chia sẻ mô hình 3D bạn đã làm để được xem xét, hoặc đề nghị Vivatheca dựng một mô hình.",
    "eyebrow": "Đóng góp",
    "heading": "Gửi hoặc yêu cầu một mô hình",
    "intro": "Nhân viên y tế, sinh viên và người dựng mô hình có thể chia sẻ mô hình 3D để được xem xét, hoặc cho chúng tôi biết mô hình nào họ sẽ dùng với bệnh nhân. Mô hình được chấp nhận sẽ được đối chiếu với các nguồn đã công bố, ghi công người làm và chia sẻ miễn phí theo giấy phép CC BY-SA 4.0.",
    "acceptHeading": "Những gì chúng tôi có thể nhận",
    "accept": [
      "Mô hình 3D (GLB, glTF, STL, OBJ hoặc 3MF) về một bệnh lý răng miệng hoặc hàm mặt, hoặc về giải phẫu bình thường.",
      "Tốt nhất là kèm một mô hình bình thường tương ứng, để so sánh bệnh lý cạnh nhau. Nếu bạn không làm được, hãy cho biết và chúng tôi có thể dựng.",
      "Nguồn đã công bố cho từng quyết định thiết kế, như kích thước, vị trí và giai đoạn: bài báo có bình duyệt hoặc hướng dẫn của hội chuyên ngành.",
      "Một ghi chú ngắn về những gì mô hình đơn giản hóa hoặc lược bỏ."
    ],
    "cannotHeading": "Những gì chúng tôi không thể nhận",
    "cannot": [
      "Bất cứ thứ gì làm từ phim chụp, ảnh hoặc hồ sơ của bệnh nhân thật, kể cả khi đã xóa tên. Khuôn mặt dựng lại từ phim chụp đầu đã từng được phần mềm nhận diện khuôn mặt thông thường khớp với ảnh của chính người được chụp.",
      "Mô hình bạn không có quyền chia sẻ, hoặc lấy từ nguồn có giấy phép không cho phép chia sẻ theo CC BY-SA.",
      "Mô hình có hình dạng hoặc kích thước không thể đối chiếu với nguồn đã công bố."
    ],
    "stepsHeading": "Điều gì xảy ra sau khi bạn gửi",
    "steps": [
      "Chúng tôi trả lời qua email.",
      "Chúng tôi kiểm tra giấy phép và các nguồn, và kiểm tra tệp mở và in đúng.",
      "Nếu phù hợp với bộ sưu tập, chúng tôi chuẩn bị cho trang web: tên các phần cho trình xem, màu sắc khớp với bộ sưu tập, và nội dung tiếng Anh và tiếng Nhật.",
      "Mô hình được đăng với nhãn “Chưa được thẩm định lâm sàng”, kèm tuyên bố miễn trừ trách nhiệm, cho đến khi một nhân viên y tế có chuyên môn kiểm tra.",
      "Bạn được ghi công trên trang mô hình bằng tên bạn chọn. Chúng tôi có thể đề nghị chỉnh sửa hoặc từ chối một mô hình, và sẽ cho bạn biết lý do."
    ],
    "licenceHeading": "Giấy phép và ghi công",
    "licenceText": "Vivatheca chia sẻ mọi mô hình miễn phí theo giấy phép Creative Commons Ghi công–Chia sẻ tương tự 4.0. Khi gửi, bạn đồng ý rằng bất kỳ ai cũng có thể chia sẻ, chỉnh sửa và in mô hình của bạn theo giấy phép đó, có ghi công bạn. Mô hình dựng từ lưới Z-Anatomy dù sao cũng phải dùng giấy phép này, vì Z-Anatomy dùng nó.",
    "licenceLink": "Đọc giấy phép (CC BY-SA 4.0)",
    "formHeading": "Gửi mô hình hoặc yêu cầu của bạn",
    "kind": "Bạn muốn làm gì?",
    "kinds": [
      "Gửi mô hình tôi đã làm",
      "Yêu cầu một mô hình"
    ],
    "name": "Tên để ghi công (không bắt buộc)",
    "namePlaceholder": "Như bạn muốn hiển thị trên trang mô hình",
    "role": "Vai trò của bạn (không bắt buộc)",
    "preferNot": "Không muốn nêu",
    "roles": [
      "Nha sĩ",
      "Bác sĩ chuyên khoa răng hàm mặt",
      "Kỹ thuật viên chăm sóc sức khỏe răng miệng hoặc vệ sinh răng miệng",
      "Kỹ thuật viên điều trị nha khoa",
      "Kỹ thuật viên phục hình răng",
      "Bác sĩ y khoa",
      "Sinh viên",
      "Người dựng mô hình 3D",
      "Khác"
    ],
    "condition": "Bệnh lý hoặc giải phẫu",
    "conditionPlaceholder": "Ví dụ: áp xe ở chóp chân răng hàm lớn thứ nhất hàm dưới",
    "files": "Đường dẫn đến tệp",
    "filesPlaceholder": "Google Drive, Dropbox, GitHub hoặc tương tự",
    "filesHelp": "Email không gửi được tệp lớn, nên hãy chia sẻ đường dẫn mà ai có đường dẫn cũng mở được.",
    "normal": "Mô hình bình thường tương ứng",
    "normals": [
      "Có kèm theo",
      "Không có, vui lòng dựng giúp",
      "Không chắc"
    ],
    "sources": "Nguồn cho thiết kế",
    "sourcesRequest": "Nguồn (không bắt buộc)",
    "sourcesPlaceholder": "DOI, đường dẫn hoặc tài liệu tham khảo, mỗi dòng một nguồn",
    "simplified": "Những gì mô hình đơn giản hóa (không bắt buộc)",
    "simplifiedPlaceholder": "Ví dụ: ống thần kinh là một ống trơn; ống thật có nhiều biến thể.",
    "why": "Bạn sẽ dùng nó với bệnh nhân thế nào? (không bắt buộc)",
    "whyPlaceholder": "Ví dụ: để giải thích vì sao một răng cần điều trị tủy.",
    "confirmHeading": "Trước khi gửi",
    "confirms": [
      "Tôi đã làm mô hình này, hoặc tôi có quyền chia sẻ nó.",
      "Mô hình không làm từ phim chụp, ảnh hoặc hồ sơ của bất kỳ bệnh nhân thật nào.",
      "Tôi đồng ý mô hình được chia sẻ theo CC BY-SA 4.0, có ghi công tôi."
    ],
    "privacyLead": "Không ghi thông tin bệnh nhân",
    "privacy": "như họ tên, ngày sinh, phim chụp hoặc hình ảnh từ hồ sơ bệnh nhân.",
    "needCondition": "Vui lòng cho biết mô hình thể hiện bệnh lý hoặc giải phẫu nào.",
    "needFiles": "Vui lòng thêm đường dẫn đến tệp mô hình.",
    "needSources": "Vui lòng liệt kê các nguồn mà mô hình dựa vào.",
    "needConfirm": "Vui lòng đánh dấu cả ba ô trước khi gửi.",
    "tooLong": "Tin nhắn này quá dài để gửi qua đường dẫn email. Hãy dùng “Sao chép nội dung tin nhắn” và dán vào email gửi đến vivatheca@gmail.com.",
    "open": "Mở trong ứng dụng email",
    "copy": "Sao chép nội dung tin nhắn",
    "copied": "Đã sao chép",
    "copiedLive": "Đã sao chép nội dung tin nhắn",
    "emailNote": "Tin nhắn của bạn sẽ mở trong ứng dụng email, gửi đến vivatheca@gmail.com, để bạn kiểm tra trước khi gửi.",
    "reviewLead": "Mô hình được chấp nhận bắt đầu với nhãn “Chưa được thẩm định lâm sàng”.",
    "sourcesHeading": "Nguồn"
  }
});

export default vi;
