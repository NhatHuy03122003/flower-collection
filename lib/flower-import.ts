// Import hoa hàng loạt từ CSV/JSON.
// Logic thuần, dùng chung cho cả client (preview) và server (commit).
// KHÔNG import Prisma ở đây để tránh lôi database vào bundle phía client.

export const IMPORT_MAX_ROWS = 1000;
export const IMPORT_MAX_BYTES = 1024 * 1024; // 1MB

const NAME_MAX_LENGTH = 100;
const IMAGE_URL_MAX_LENGTH = 500;
const COLOR_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 1000;

export type FlowerImportFormat = "csv" | "json";

// Dữ liệu một dòng đã chuẩn hoá, sẵn sàng ghi xuống DB.
export type FlowerImportData = {
  name: string;
  imageUrl: string;
  color: string | null;
  description: string | null;
};

// Dữ liệu thô đọc từ file, chưa validate.
export type FlowerImportRawRow = {
  name: string;
  imageUrl: string;
  color: string;
  description: string;
};

export type FlowerImportFieldErrors = Partial<
  Record<"name" | "imageUrl" | "color" | "description", string>
>;

export type FlowerImportRowStatus = "valid" | "invalid" | "duplicate";

export type FlowerImportRow = {
  rowNumber: number;
  status: FlowerImportRowStatus;
  name: string;
  data: FlowerImportData | null;
  errors: FlowerImportFieldErrors | null;
  note: string | null;
};

export type FlowerImportPreview = {
  totalRows: number;
  rows: FlowerImportRow[];
  importable: FlowerImportData[];
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
};

export type FlowerImportParseResult =
  | { rows: FlowerImportRawRow[]; error: null }
  | { rows: null; error: string };

/**
 * Suy ra định dạng import từ tên file. Chỉ hỗ trợ .csv và .json.
 */
export function getFlowerImportFormat(
  fileName: string,
): FlowerImportFormat | null {
  const lower = fileName.trim().toLowerCase();

  if (lower.endsWith(".csv")) {
    return "csv";
  }

  if (lower.endsWith(".json")) {
    return "json";
  }

  return null;
}

/**
 * Đọc nội dung file thành danh sách dòng thô theo định dạng.
 * Trả về lỗi mức file (rỗng / sai định dạng / quá số dòng) nếu có.
 */
export function parseFlowerImportContent(
  content: string,
  format: FlowerImportFormat,
): FlowerImportParseResult {
  if (typeof content !== "string" || !content.trim()) {
    return { rows: null, error: "File rỗng." };
  }

  // Bỏ BOM nếu có (file Excel xuất ra thường kèm BOM).
  const text = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;

  const parsed = format === "csv" ? parseCsv(text) : parseJson(text);

  if (parsed.error) {
    return { rows: null, error: parsed.error };
  }

  if (parsed.rows.length === 0) {
    return { rows: null, error: "Không tìm thấy dòng dữ liệu nào." };
  }

  if (parsed.rows.length > IMPORT_MAX_ROWS) {
    return {
      rows: null,
      error: `Tối đa ${IMPORT_MAX_ROWS} dòng mỗi lần import.`,
    };
  }

  return { rows: parsed.rows, error: null };
}

/**
 * Validate + dedup danh sách dòng thô.
 * - Dedup trong file: so sánh name theo trim + không phân biệt hoa thường,
 *   giữ dòng đầu tiên, bỏ qua các dòng trùng phía sau.
 * - Dedup với bộ sưu tập: chỉ tính các hoa đang hoạt động (existingNames).
 */
export function analyzeFlowerImportRows(
  rows: FlowerImportRawRow[],
  existingNames: Iterable<string>,
): FlowerImportPreview {
  const takenNames = new Set<string>();

  for (const name of existingNames) {
    const key = normalizeName(name);

    if (key) {
      takenNames.add(key);
    }
  }

  const seenInFile = new Set<string>();
  const resultRows: FlowerImportRow[] = [];
  const importable: FlowerImportData[] = [];
  let validCount = 0;
  let invalidCount = 0;
  let duplicateCount = 0;

  rows.forEach((raw, index) => {
    const rowNumber = index + 1;
    const validation = validateImportRow(raw);

    if (!validation.data) {
      invalidCount += 1;
      resultRows.push({
        rowNumber,
        status: "invalid",
        name: raw.name,
        data: null,
        errors: validation.errors,
        note: null,
      });
      return;
    }

    const key = normalizeName(validation.data.name);

    if (seenInFile.has(key)) {
      duplicateCount += 1;
      resultRows.push({
        rowNumber,
        status: "duplicate",
        name: validation.data.name,
        data: null,
        errors: null,
        note: "Trùng tên với dòng phía trên trong file.",
      });
      return;
    }

    if (takenNames.has(key)) {
      duplicateCount += 1;
      resultRows.push({
        rowNumber,
        status: "duplicate",
        name: validation.data.name,
        data: null,
        errors: null,
        note: "Tên đã tồn tại trong bộ sưu tập.",
      });
      return;
    }

    seenInFile.add(key);
    validCount += 1;
    importable.push(validation.data);
    resultRows.push({
      rowNumber,
      status: "valid",
      name: validation.data.name,
      data: validation.data,
      errors: null,
      note: null,
    });
  });

  return {
    totalRows: rows.length,
    rows: resultRows,
    importable,
    validCount,
    invalidCount,
    duplicateCount,
  };
}

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateImportRow(
  raw: FlowerImportRawRow,
):
  | { data: FlowerImportData; errors: null }
  | { data: null; errors: FlowerImportFieldErrors } {
  const errors: FlowerImportFieldErrors = {};

  if (!raw.name) {
    errors.name = "Thiếu tên hoa.";
  } else if (raw.name.length > NAME_MAX_LENGTH) {
    errors.name = `Tên hoa tối đa ${NAME_MAX_LENGTH} ký tự.`;
  }

  if (!raw.imageUrl) {
    errors.imageUrl = "Thiếu đường dẫn ảnh.";
  } else if (raw.imageUrl.length > IMAGE_URL_MAX_LENGTH) {
    errors.imageUrl = `Đường dẫn ảnh tối đa ${IMAGE_URL_MAX_LENGTH} ký tự.`;
  } else if (!isHttpUrl(raw.imageUrl)) {
    errors.imageUrl = "Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://";
  }

  if (raw.color.length > COLOR_MAX_LENGTH) {
    errors.color = `Màu tối đa ${COLOR_MAX_LENGTH} ký tự.`;
  }

  if (raw.description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `Mô tả tối đa ${DESCRIPTION_MAX_LENGTH} ký tự.`;
  }

  if (Object.keys(errors).length > 0) {
    return { data: null, errors };
  }

  return {
    data: {
      name: raw.name,
      imageUrl: raw.imageUrl,
      color: raw.color || null,
      description: raw.description || null,
    },
    errors: null,
  };
}

function parseCsv(text: string): {
  rows: FlowerImportRawRow[];
  error: string | null;
} {
  const table = parseCsvTable(text);

  // Bỏ dòng header nếu khớp name,imageUrl,...
  let start = 0;

  if (table.length > 0) {
    const header = table[0].map((cell) => cell.trim().toLowerCase());

    if (header[0] === "name" && (header[1] ?? "") === "imageurl") {
      start = 1;
    }
  }

  const rows: FlowerImportRawRow[] = [];

  for (let index = start; index < table.length; index += 1) {
    const cells = table[index];

    rows.push({
      name: (cells[0] ?? "").trim(),
      imageUrl: (cells[1] ?? "").trim(),
      color: (cells[2] ?? "").trim(),
      description: (cells[3] ?? "").trim(),
    });
  }

  return { rows, error: null };
}

// Parser CSV tối giản: hỗ trợ field bọc trong dấu " và escape "" bên trong.
function parseCsvTable(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let index = 0;

  while (index < text.length) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 2;
          continue;
        }

        inQuotes = false;
        index += 1;
        continue;
      }

      field += char;
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      index += 1;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      index += 1;
      continue;
    }

    if (char === "\r" || char === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];

      if (char === "\r" && text[index + 1] === "\n") {
        index += 2;
      } else {
        index += 1;
      }

      continue;
    }

    field += char;
    index += 1;
  }

  row.push(field);
  rows.push(row);

  // Bỏ các dòng trống (thường do xuống dòng cuối file).
  return rows.filter(
    (cells) => !(cells.length === 1 && cells[0].trim() === ""),
  );
}

function parseJson(text: string): {
  rows: FlowerImportRawRow[];
  error: string | null;
} {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    return { rows: [], error: "File JSON không hợp lệ." };
  }

  if (!Array.isArray(parsed)) {
    return { rows: [], error: "File JSON phải là một mảng các hoa." };
  }

  const rows = parsed.map((item) => {
    const record = (item && typeof item === "object" ? item : {}) as Record<
      string,
      unknown
    >;

    return {
      name: toText(record.name),
      imageUrl: toText(record.imageUrl),
      color: toText(record.color),
      description: toText(record.description),
    };
  });

  return { rows, error: null };
}

function toText(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}
