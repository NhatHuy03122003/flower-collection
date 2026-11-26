export type GuideStep = {
  id: string;
  number: number;
  title: string;
  summary: string;
  bullets: string[];
  note?: string;
  screenshotLabel: string;
  screenshotPath: string;
};

export type GuideFaqItem = {
  question: string;
  answer: string;
};

export const GUIDE_STEPS: GuideStep[] = [
  {
    id: "buoc-1",
    number: 1,
    title: "Đăng nhập hoặc đăng ký tài khoản",
    summary:
      "Bạn cần đăng nhập tài khoản để chọn thành viên và đánh dấu các bông hoa đã sở hữu.",
    bullets: [
      "Giao diện đăng nhập của trang website.",
      "Nhập Tên đăng nhập và Mật khẩu, sau đó bấm Đăng nhập.",
      "Nếu chưa có tài khoản, bấm Đăng ký, điền Họ tên, Tên đăng nhập, Mật khẩu (tối thiểu 6 ký tự) và Xác nhận mật khẩu rồi bấm Đăng ký.",
    ],
    note: "Lưu ý: Việc đăng ký tài khoản mới chỉ tạo tài khoản đăng nhập, không tự động cấp quyền thành viên. Sau khi đăng ký, bạn cần liên hệ quản trị viên (Admin) để được gắn với thành viên của mình.",
    screenshotLabel:
      "Ảnh minh họa: Nút Đăng nhập / Đăng ký trên thanh trên cùng và màn hình đăng nhập.",
    screenshotPath: "public/guide/step-1-login.png",
  },
  {
    id: "buoc-2",
    number: 2,
    title: "Chọn thành viên được Admin cấp quyền",
    summary:
      "Trước khi đánh dấu hoa, bạn hãy chọn đúng thành viên đã được quản trị viên gắn cho tài khoản của mình.",
    bullets: [
      "Sau khi đăng nhập, nhìn lên thanh trên cùng (bên cạnh tên hiển thị của bạn).",
      "Bấm vào ô Chọn thành viên… và chọn tên thành viên muốn thao tác.",
      "Hệ thống tự động ghi nhớ lựa chọn này khi bạn chuyển giữa các trang.",
    ],
    note: "Bạn chỉ nhìn thấy và chọn được những thành viên đang hoạt động mà Admin đã cấp quyền cho tài khoản của bạn.",
    screenshotLabel: "Ảnh minh họa: Ô Chọn thành viên… trên thanh trên cùng.",
    screenshotPath: "public/guide/step-2-select-member.png",
  },
  {
    id: "buoc-3",
    number: 3,
    title: "Xem và tìm kiếm hoa tại Danh sách hoa",
    summary:
      "Trang chủ Danh sách hoa hiển thị toàn bộ các loài hoa của hội, được chia thành từng nhóm màu sắc.",
    bullets: [
      "Bấm vào tab Danh sách hoa trên thanh menu.",
      "Gõ tên hoa hoặc màu sắc vào ô Tìm theo tên hoa... để lọc nhanh.",
      "Mỗi thẻ hoa hiển thị ảnh, tên hoa, mô tả, nhãn màu và danh sách các thành viên đang sở hữu (bên dưới biểu tượng 👤).",
    ],
    screenshotLabel:
      "Ảnh minh họa: Trang Danh sách hoa với ô tìm kiếm và các nhóm màu.",
    screenshotPath: "public/guide/step-3-search-flowers.png",
  },
  {
    id: "buoc-4",
    number: 4,
    title: "Đánh dấu (tick) và bỏ đánh dấu hoa",
    summary:
      "Ghi nhận những loài hoa mà thành viên của bạn đã sưu tầm được trong game.",
    bullets: [
      "Đảm bảo bạn đã chọn thành viên của mình ở Bước 2.",
      "Tìm bông hoa cần đánh dấu và bấm vào nút tròn có dấu ✓ ở góc phải thẻ hoa.",
      "Khi nút chuyển sang màu hồng đậm (dấu ✓ trắng) là đã lưu thành công.",
      "Nếu muốn bỏ đánh dấu, bấm lại vào nút ✓ đó một lần nữa.",
    ],
    note: "Bạn chỉ có thể tick hoặc bỏ tick cho thành viên đã được Admin cấp quyền cho tài khoản của mình.",
    screenshotLabel:
      "Ảnh minh họa: Hai trạng thái nút tick tròn (chưa chọn và đã chọn).",
    screenshotPath: "public/guide/step-4-tick-flower.png",
  },
  {
    id: "buoc-5",
    number: 5,
    title: "Xem riêng bộ sưu tập tại Tick hoa của tôi",
    summary:
      "Xem gọn toàn bộ những bông hoa mà thành viên đang chọn đã sở hữu.",
    bullets: [
      "Bấm vào tab Tick hoa của tôi trên thanh menu.",
      "Tất cả hoa bạn đã đánh dấu sẽ hiển thị tách riêng theo từng nhóm màu.",
      "Bạn cũng có thể bấm bỏ tick trực tiếp ngay tại trang này nếu cần.",
    ],
    screenshotLabel:
      "Ảnh minh họa: Trang Tick hoa của tôi hiển thị các hoa đã sở hữu.",
    screenshotPath: "public/guide/step-5-my-flowers.png",
  },
  {
    id: "buoc-6",
    number: 6,
    title: "Xem danh sách thành viên và tiến độ sưu tầm",
    summary:
      "Theo dõi số lượng hoa và phần trăm hoàn thành bộ sưu tập của các thành viên trong hội.",
    bullets: [
      "Bấm vào tab Thành viên trên thanh menu.",
      "Dùng ô Tìm thành viên... để tìm nhanh theo tên hiển thị.",
      "Bấm nút Chi tiết trên thẻ thành viên (hoặc bấm vào tên thành viên ở dưới một thẻ hoa) để xem bộ sưu tập của người đó.",
    ],
    note: "Phân biệt quyền: Bạn có thể xem bộ sưu tập của các thành viên khác ở chế độ chỉ xem, nhưng chỉ tick hoặc bỏ tick được cho thành viên mà Admin đã cấp quyền cho bạn.",
    screenshotLabel:
      "Ảnh minh họa: Trang Thành viên với nút Chi tiết trên từng thẻ.",
    screenshotPath: "public/guide/step-6-members.png",
  },
];

export const FAQ_ITEMS: GuideFaqItem[] = [
  {
    question: "Vì sao nút tick bị mờ và không bấm được?",
    answer:
      "Nút tick bị mờ khi bạn chưa đăng nhập hoặc chưa chọn thành viên ở thanh trên cùng. Hãy bấm vào ô Chọn thành viên… ở góc trên bên phải để chọn tên thành viên của bạn rồi thử lại.",
  },
  {
    question:
      "Vì sao không có thành viên nào để chọn hoặc trang Tick hoa của tôi báo chưa được cấp quyền?",
    answer:
      "Tài khoản mới đăng ký chưa được gắn với thành viên nào trong hội. Bạn hãy gửi tên đăng nhập của mình cho quản trị viên (Admin) để được cấp quyền vào thành viên tương ứng.",
  },
  {
    question:
      "Vì sao có thông báo quyền truy cập thành viên đã thay đổi hoặc không còn hợp lệ?",
    answer:
      "Quản trị viên vừa cập nhật hoặc thu hồi quyền thành viên khỏi tài khoản của bạn (hoặc thành viên đó tạm thời bị ẩn). Hệ thống sẽ tự làm mới danh sách; bạn chỉ cần chọn lại thành viên hợp lệ ở thanh trên cùng.",
  },
  {
    question: "Vì sao đang dùng lại bị chuyển về trang Đăng nhập?",
    answer:
      "Phiên đăng nhập của bạn đã hết hạn sau 7 ngày hoặc bạn vừa đăng xuất ở một tab khác. Bạn chỉ cần đăng nhập lại để tiếp tục sử dụng.",
  },
  {
    question: "Vì sao tôi tìm kiếm nhưng không thấy hoa hoặc thành viên?",
    answer:
      "Hãy kiểm tra lại từ khóa trong ô tìm kiếm (tránh dư khoảng trắng hoặc gõ nhầm dấu) và xóa sạch nội dung ô tìm kiếm để hiển thị lại toàn bộ danh sách.",
  },
  {
    question: "Tôi có thể tự thêm hoa mới hoặc sửa thông tin thành viên không?",
    answer:
      "Không. Chức năng thêm, sửa, ẩn hoa và quản lý thành viên chỉ dành cho quản trị viên để giữ dữ liệu chung của hội chính xác. Nếu cần bổ sung hoa hoặc chỉnh sửa thông tin, hãy nhắn cho quản trị viên hỗ trợ.",
  },
];

export const GUEST_FAQ_ITEMS: GuideFaqItem[] = [
  {
    question: "Tôi chưa đăng nhập thì có thể xem được gì?",
    answer:
      "Bạn có thể xem toàn bộ danh sách hoa tại trang chủ (/), xem bộ sưu tập của các thành viên tại mục Thành viên (/members), tìm kiếm và lọc hoa theo nhu cầu.",
  },
  {
    question: "Làm sao để đăng nhập hoặc tạo tài khoản mới?",
    answer:
      "Nhấn nút Đăng nhập ở góc trên bên phải để mở trang đăng nhập (/login), hoặc chuyển sang mục đăng ký (/signup) để tạo tài khoản bằng tên đăng nhập và mật khẩu.",
  },
  {
    question: "Vì sao tôi không thấy nút tick hoa hoặc ô chọn thành viên?",
    answer:
      "Chức năng đánh dấu (tick) hoa và trang Tích Hoa của Tôi chỉ hiển thị sau khi bạn đăng nhập và được quản trị viên cấp quyền thành viên.",
  },
  {
    question: "Tài khoản mới đăng ký có thể tick hoa ngay không?",
    answer:
      "Chưa. Sau khi đăng ký tài khoản mới, bạn cần gửi tên đăng nhập của mình cho quản trị viên (Admin) để được gán quyền vào thành viên tương ứng.",
  },
  {
    question: "Vì sao tìm kiếm nhưng không thấy hoa hoặc thành viên?",
    answer:
      "Hãy kiểm tra lại từ khóa trong ô tìm kiếm (tránh dư khoảng trắng hoặc gõ nhầm dấu) và xóa sạch nội dung ô tìm kiếm hoặc đặt lại bộ lọc để xem lại toàn bộ danh sách.",
  },
];

export const ADMIN_FAQ_ITEMS: GuideFaqItem[] = [
  {
    question: "Tài khoản ADMIN có cần được gán thành viên mới tích hoa được không?",
    answer:
      "Không. ADMIN mặc định có quyền truy cập tất cả thành viên đang hoạt động mà không cần gán thủ công trong bảng phân quyền.",
  },
  {
    question: "Làm sao để cấp quyền thành viên cho tài khoản USER?",
    answer:
      "Mở trang Quản trị tài khoản (/admin/users) từ menu tài khoản ở góc trên bên phải, tìm tài khoản USER cần cấp quyền và chọn các thành viên mà tài khoản đó được phép quản lý.",
  },
  {
    question: "Cách thu hồi quyền thành viên và điều gì xảy ra với USER?",
    answer:
      "Tại trang Quản trị tài khoản (/admin/users), bỏ chọn thành viên khỏi tài khoản USER. Hệ thống kiểm tra quyền trên máy chủ ở mỗi thao tác nên USER sẽ lập tức không còn thấy hoặc tích hoa cho thành viên đó được nữa.",
  },
  {
    question: "Thành viên bị ẩn ảnh hưởng thế nào đến USER?",
    answer:
      "Khi thành viên bị ẩn, tài khoản USER không còn nhìn thấy hoặc thao tác tích hoa trên thành viên đó. Tuy nhiên dữ liệu hoa đã tích trước đó vẫn được giữ nguyên và sẽ hiện lại nếu Admin khôi phục.",
  },
  {
    question: "Cách thêm, sửa và ẩn hoặc khôi phục thành viên?",
    answer:
      "Vào tab Thành viên (/members) trên thanh công cụ để tạo thành viên mới, chỉnh sửa tên hiển thị hoặc thực hiện ẩn/khôi phục thành viên khi cần.",
  },
  {
    question: "Cách thêm, sửa, ẩn hoặc khôi phục hoa?",
    answer:
      "Vào tab Quản lý hoa (/flowers) — tab này chỉ hiển thị với ADMIN — để thêm hoa mới, cập nhật thông tin hoa, ẩn hoa khỏi danh sách hoặc khôi phục hoa đã ẩn.",
  },
  {
    question: "Cách import dữ liệu hoa hàng loạt như thế nào?",
    answer:
      "Tại trang Quản lý hoa (/flowers), sử dụng chức năng nhập dữ liệu (Import) để tải lên hoặc dán danh sách nhiều loại hoa cùng lúc theo mẫu mà hệ thống hỗ trợ.",
  },
  {
    question: "USER có thể tự mở /flowers hoặc /admin/users bằng cách nhập URL không?",
    answer:
      "Không. Cả giao diện lẫn các thao tác trên máy chủ đều kiểm tra quyền ADMIN, nên tài khoản USER hoặc khách sẽ bị chặn truy cập.",
  },
];
