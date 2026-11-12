/**
 * Chuẩn hoá chuỗi để tìm kiếm phía client:
 * - Bỏ dấu tiếng Việt (NFD + xoá combining marks, xử lý riêng đ/Đ).
 * - Không phân biệt chữ hoa/thường.
 */
export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim();
}

/**
 * Trả về true nếu query rỗng, hoặc nếu một trong các giá trị chứa query
 * (không phân biệt dấu và chữ hoa/thường).
 */
export function matchesSearchText(
  query: string,
  values: (string | null | undefined)[],
) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return true;
  }

  return values.some((value) =>
    value ? normalizeSearchText(value).includes(normalizedQuery) : false,
  );
}
