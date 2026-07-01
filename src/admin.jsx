import { useState, useEffect, useRef, useCallback, useMemo, Component } from 'react';
import { createRoot } from 'react-dom/client';
import { profile as _profileModule } from './data/profile';

// ============================================================
// Schema Validation
// ============================================================
const PROFILE_SCHEMA = {
  name: 'string',
  nameEn: 'string',
  roles: 'array',
  bio: 'string',
  stats: 'array',
  expertise: 'array',
  experience: 'object',
  projects: 'array',
  tools: 'array',
  contact: 'object',
};

function validateProfile(data) {
  if (!data || typeof data !== 'object') return { valid: false, error: '数据格式错误：需要对象' };
  const errors = [];
  for (const [key, type] of Object.entries(PROFILE_SCHEMA)) {
    if (!(key in data)) {
      errors.push(`缺少字段: ${key}`);
      continue;
    }
    const val = data[key];
    if (type === 'array' && !Array.isArray(val)) errors.push(`${key}: 需要数组`);
    if (type === 'object' && (typeof val !== 'object' || val === null || Array.isArray(val))) errors.push(`${key}: 需要对象`);
    if (type === 'string' && typeof val !== 'string') errors.push(`${key}: 需要字符串`);
  }
  return { valid: errors.length === 0, error: errors.join('; ') };
}

// ============================================================
// Safe JS Object Literal Parser
// Extracts and parses JS object literals from profile.js source
// ============================================================

/**
 * Parse a JS module-style profile file into a plain object.
 * Uses JSON.parse on JSON.stringify output for safety,
 * with fallback to controlled Function() evaluation.
 */
function parseProfileFromSource(sourceText) {
  // Try multiple extraction strategies for different profile.js formats
  let raw = null;

  // Strategy A: New format — const _baseProfile = { ... } (with preview override)
  const matchBase = sourceText.match(/const\s+_baseProfile\s*=\s*(\{[\s\S]*?\n\})/);
  if (matchBase) {
    raw = matchBase[1];
  }

  // Strategy B: Legacy format — export const profile = { ... }
  if (!raw) {
    const matchLegacy = sourceText.match(/export\s+const\s+profile\s*=\s*(\{[\s\S]*?\n\})\s*export\s+const\s+navItems/);
    if (matchLegacy) {
      raw = matchLegacy[1];
    }
  }

  if (!raw) {
    throw new Error(
      '无法从源文件中提取 profile 对象。\n' +
      '请确保 profile.js 格式为以下之一：\n' +
      '  ① export const profile = { ... }\n' +
      '  ② const _baseProfile = { ... } + export const profile = ...\n' +
      '  且对象字面量完整存在。'
    );
  }

  // Normalize: single→double quotes, quote unquoted property names, escape internal quotes, remove trailing commas
  const normalized = normalizeJSToJSON(raw);

  // Try JSON.parse (strict, safe)
  try {
    return JSON.parse(normalized);
  } catch (parseErr) {
    throw new Error(
      'profile.js 解析失败：数据格式不正确。\n' +
      '请检查 profile.js 是否包含不支持的语法（如模板字符串 `...`）。\n' +
      '技术细节: ' + parseErr.message
    );
  }
}

/**
 * Convert JS object literal syntax to strict JSON.
 *
 * Handles:
 * - Unquoted keys → quoted keys
 * - Single-quoted strings → double-quoted, with proper escape handling
 * - Double-quoted strings → preserved (already JSON-compatible)
 * - Template strings → NOT supported (will throw clear error)
 * - Trailing commas → removed
 * - Escape sequences: \\, \', \", \n, \t, \r, \uXXXX
 */
function normalizeJSToJSON(text) {
  let result = '';
  let i = 0;
  const len = text.length;

  while (i < len) {
    const ch = text[i];

    // Template string: not supported, skip (will cause parse error with clear message)
    if (ch === '`') {
      throw new Error(
        'profile.js 格式错误：不支持模板字符串（`）。请改用普通字符串（单引号或双引号）。'
      );
    }

    // Single-quoted string: 'content'
    // Insert comma if this follows another value (array elements, consecutive props)
    if (ch === "'") {
      const lastChar = result.trimEnd().slice(-1);
      if (lastChar && !'{[:,'.includes(lastChar)) {
        result += ',';
      }
      i++;
      let content = '';
      while (i < len && text[i] !== "'") {
        if (text[i] === '\\' && i + 1 < len) {
          // Handle escape sequences properly
          const next = text[i + 1];
          if (next === "'" || next === '\\' || next === '"') {
            // Pass through the escaped character
            content += next;
          } else if (next === 'n') {
            content += '\n';
          } else if (next === 't') {
            content += '\t';
          } else if (next === 'r') {
            content += '\r';
          } else if (next === 'u') {
            // Unicode escape \uXXXX — pass through as \uXXXX (valid in JSON)
            content += '\\u';
            i++; // skip the \
            // skip 'u', copy 4 hex digits
            for (let k = 0; k < 4 && i + 1 < len; k++) {
              content += text[i + 1];
              i++;
            }
          } else {
            // Unknown escape — pass through
            content += '\\' + next;
          }
          i += 2;
        } else {
          // Escape internal double quotes for JSON
          if (text[i] === '"') content += '\\"';
          else content += text[i];
          i++;
        }
      }
      i++; // skip closing '
      result += '"' + content + '"';
      continue;
    }

    // Double-quoted string: already JSON-compatible, but validate escapes
    if (ch === '"') {
      const lastChar = result.trimEnd().slice(-1);
      if (lastChar && !'{[:,'.includes(lastChar)) {
        result += ',';
      }
      i++;
      result += '"';
      while (i < len && text[i] !== '"') {
        if (text[i] === '\\' && i + 1 < len) {
          const next = text[i + 1];
          // Only allow valid JSON escapes
          if (['"', '\\', '/', 'b', 'f', 'n', 'r', 't'].includes(next)) {
            result += '\\' + next;
          } else if (next === 'u') {
            // Unicode escape — copy as-is (valid in JSON)
            result += '\\u';
            i++;
            for (let k = 0; k < 4 && i + 1 < len; k++) {
              result += text[i + 1];
              i++;
            }
          } else {
            // Invalid escape in JSON — pass through (may cause parse error with clear message)
            result += '\\' + next;
          }
          i += 2;
        } else {
          result += text[i];
          i++;
        }
      }
      if (i < len) { result += '"'; i++; }
      continue;
    }

    // Identifier: could be property name, JS keyword, or number start
    // Distinguish by looking ahead for ':' (property name) vs other tokens
    if (/[a-zA-Z_$]/.test(ch)) {
      // Save position and read the full word
      const saved = i;
      while (i < len && (text[i] === ' ' || text[i] === '\t')) i++;
      let word = '';
      while (i < len && /[a-zA-Z0-9_$]/.test(text[i])) {
        word += text[i];
        i++;
      }
      // Skip whitespace after word
      let j = i;
      while (j < len && (text[j] === ' ' || text[j] === '\t' || text[j] === '\n')) j++;

      // Check what follows to determine role
      const followsColonOrComma = j < len && (text[j] === ':' || text[j] === ',');
      const isKeyword = ['true', 'false', 'null', 'undefined'].includes(word);
      const prevChar = result.trimEnd().slice(-1);

      if (followsColonOrComma && !isKeyword) {
        // This is a property name → quote it + add comma before if needed
        if (prevChar && !'{[,'.includes(prevChar)) {
          result += ',';
        }
        result += '"' + word + '"';
      } else {
        // This is a value (keyword or number-like) → pass through as JSON literal
        // Add comma before if needed
        if (!isKeyword && prevChar && !'{[:,'.includes(prevChar)) {
          // Could be a number or unknown identifier used as value
          result += ',';
        } else if (isKeyword && prevChar && !'{[:,'.includes(prevChar)) {
          result += ',';
        }
        result += word;
      }
      continue;
    }

    // Number literal (starts with digit or minus sign)
    if (/\d/.test(ch) || (ch === '-' && i + 1 < len && /\d/.test(text[i + 1]))) {
      const prevChar = result.trimEnd().slice(-1);
      if (prevChar && !'{[:,'.includes(prevChar)) {
        result += ',';
      }
      while (i < len && /[\d.eE+\-]/.test(text[i])) {
        result += text[i];
        i++;
      }
      continue;
    }

    // Trailing comma before } or ]
    if (ch === ',' && i + 1 < len && /[\s}\]]/.test(text[i + 1])) {
      i++;
      continue;
    }

    // Single-line JS comment: // ... → strip entirely (JSON has no comments)
    if (ch === '/' && i + 1 < len && text[i + 1] === '/') {
      // Skip until end of line
      while (i < len && text[i] !== '\n') i++;
      continue;
    }

    // Multi-line JS comment: /* ... */ → strip entirely
    if (ch === '/' && i + 1 < len && text[i + 1] === '*') {
      i += 2; // skip /*
      while (i < len - 1 && !(text[i] === '*' && text[i + 1] === '/')) i++;
      i += 2; // skip */
      continue;
    }

    // Insert comma before array/object values (after previous value)
    // Covers: { [ strings that follow another value
    if ((ch === '{' || ch === '[') && !'[{'.includes(result.trimEnd().slice(-1))) {
      const prev = result.trimEnd().slice(-1);
      if (prev && !'{[:,'.includes(prev)) {
        result += ',';
      }
    }

    result += ch;
    i++;
  }

  return result;
}

// ============================================================
// Toast Component
// ============================================================
function Toast({ message, type, onDone }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(onDone, 2200);
    return () => clearTimeout(timerRef.current);
  }, [onDone]);

  const bg = type === 'success' ? 'rgba(34,197,94,0.15)' : type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(255,107,0,0.15)';
  const border = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#FF6B00';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

  return (
    <div style={{
      position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
      padding: '12px 28px', borderRadius: 10, border: `1px solid ${border}`, background: bg,
      color: '#fff', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10,
      backdropFilter: 'blur(12px)', animation: 'toastIn 0.3s ease-out',
    }}>
      <span style={{ fontWeight: 700, color: border }}>{icon}</span>
      <span>{message}</span>
    </div>
  );
}

// ============================================================
// ErrorBoundary
// ============================================================
class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444', marginBottom: 16 }}>编辑器崩溃</h2>
          <p style={{ color: '#999', marginBottom: 8 }}>{this.state.error.message}</p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{ padding: '8px 24px', background: '#FF6B00', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
          >
            重新加载
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================
// Reusable TagsInput — handles comma-separated editing without
// split/join on every keystroke
// ============================================================
function TagsInput({ value, onChange, placeholder }) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);

  // Sync external value → text only when not focused
  useEffect(() => {
    if (!focused) {
      const arr = Array.isArray(value) ? value : [];
      setText(arr.join(', '));
    }
  }, [value, focused]);

  const commit = useCallback(() => {
    const tags = text.split(',').map((s) => s.trim()).filter(Boolean);
    onChange(tags);
  }, [text, onChange]);

  return (
    <input
      style={styles.input}
      value={focused ? text : (Array.isArray(value) ? value.join(', ') : '')}
      onFocus={() => setFocused(true)}
      onBlur={() => { commit(); setFocused(false); }}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') { commit(); e.target.blur(); } }}
      placeholder={placeholder || '标签1, 标签2, 标签3'}
    />
  );
}

// ============================================================
// Styles
// ============================================================
const styles = {
  container: { minHeight: '100vh', background: '#080808', color: '#fff', fontFamily: "'Inter','PingFang SC','Microsoft YaHei',sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid #1a1a1a', background: '#0a0a0a', position: 'sticky', top: 0, zIndex: 100 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
  logo: { fontSize: 18, fontWeight: 700, color: '#FF6B00' },
  headerRight: { display: 'flex', gap: 10 },
  btn: { padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'all 0.2s' },
  btnPrimary: { background: '#FF6B00', color: '#fff' },
  btnOutline: { background: 'transparent', border: '1px solid #333', color: '#ccc' },
  btnDanger: { background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' },
  btnSuccess: { background: '#16a34a', color: '#fff' },
  btnSmall: { padding: '4px 12px', borderRadius: 6, fontSize: 11 },
  tabs: { display: 'flex', gap: 2, justifyContent: 'center', borderBottom: '1px solid #1a1a1a', background: '#0a0a0a', position: 'sticky', top: 57, zIndex: 90, overflowX: 'auto' },
  tab: (active) => ({ padding: '12px 20px', fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#FF6B00' : '#999', cursor: 'pointer', borderBottom: active ? '2px solid #FF6B00' : '2px solid transparent', background: 'none', whiteSpace: 'nowrap', transition: 'all 0.2s' }),
  main: { display: 'flex', height: 'calc(100vh - 113px)', overflow: 'hidden' },
  editor: { flex: 1, padding: '24px 32px 24px 32px', overflowY: 'auto', height: '100%', maxWidth: 960, margin: '0 auto' },
  fieldGroup: { marginBottom: 20 },
  label: { display: 'block', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input: { width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #222', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none', transition: 'border 0.2s', fontFamily: 'inherit' },
  textarea: { width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #222', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 80, fontFamily: 'inherit', lineHeight: 1.6 },
  card: { background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: 10, padding: 16, marginBottom: 12 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: 600 },
  tag: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#1a1a1a', borderRadius: 20, fontSize: 12, color: '#ccc', marginRight: 6, marginBottom: 6 },
  tagRemove: { cursor: 'pointer', color: '#666', fontSize: 14, fontWeight: 700, marginLeft: 2 },
  row: { display: 'flex', gap: 12, marginBottom: 12 },
  col: (flex) => ({ flex: flex || 1 }),
  divider: { border: 'none', borderTop: '1px solid #1a1a1a', margin: '20px 0' },
  empty: { padding: '40px 0', textAlign: 'center', color: '#555', fontSize: 14 },
  desc: { fontSize: 12, color: '#666', marginTop: 4, lineHeight: 1.5 },
  thumbWrap: { display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 8, cursor: 'pointer' },
  thumbImg: { width: 80, height: 50, objectFit: 'cover', borderRadius: 6, border: '1px solid #222', background: '#080808' },
  thumbInfo: { flex: 1, minWidth: 0 },
  thumbUrl: { fontSize: 11, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
};

// ============================================================
// Helpers
// ============================================================
function updateNested(obj, path, value) {
  const clone = structuredClone(obj);
  const keys = path.split('.');
  let current = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
  return clone;
}

function arrayUpdate(arr, index, updates) {
  const clone = structuredClone(arr);
  clone[index] = { ...clone[index], ...updates };
  return clone;
}

function arrayRemove(arr, index) {
  const clone = structuredClone(arr);
  clone.splice(index, 1);
  return clone;
}

function arrayAdd(arr, template) {
  return [...structuredClone(arr), structuredClone(template)];
}

function arrayPrepend(arr, template) {
  return [structuredClone(template), ...structuredClone(arr)];
}

// ============================================================
// Tab Editors
// ============================================================

// --- Info Tab ---
function InfoTab({ data, onChange }) {
  return (
    <div>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>中文名</label>
        <input style={styles.input} value={data.name || ''} onChange={(e) => onChange(updateNested(data, 'name', e.target.value))} placeholder="马守坤" />
      </div>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>英文名</label>
        <input style={styles.input} value={data.nameEn || ''} onChange={(e) => onChange(updateNested(data, 'nameEn', e.target.value))} placeholder="Ma Shoukun" />
      </div>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>角色标签（逗号分隔）</label>
        <TagsInput
          value={Array.isArray(data.roles) ? data.roles : []}
          onChange={(tags) => onChange(updateNested(data, 'roles', tags))}
          placeholder="视觉设计师, AI设计师, 品牌设计师"
        />
        <div style={styles.desc}>用逗号分隔多个角色，编辑完成后按回车或点击其他字段确认</div>
      </div>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>个人简介</label>
        <textarea style={styles.textarea} value={data.bio || ''} onChange={(e) => onChange(updateNested(data, 'bio', e.target.value))} placeholder="介绍自己..." />
      </div>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>个人头像</label>
        <MediaFileInput
          value={data.avatar || ''}
          onChange={(v) => onChange(updateNested(data, 'avatar', v || null))}
          accept="image/*"
          placeholder="/images/avatar.jpg"
          hint="📁 请将头像图片放到 public/images/ 目录。留空则显示默认占位图标。"
        />
        {data.avatar && (
          <div style={{ marginTop: 8, width: 80, height: 100, borderRadius: 8, overflow: 'hidden', border: '1px solid #333' }}>
            <img src={data.avatar} alt="头像预览" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}
      </div>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Hero 视频背景</label>
        <MediaFileInput
          value={data.heroVideo || ''}
          onChange={(v) => onChange(updateNested(data, 'heroVideo', v || null))}
          accept="video/*"
          placeholder="/videos/hero-bg.mp4"
          hint="📁 请将视频文件放到 public/videos/ 目录。留空则使用默认视频。"
        />
      </div>
    </div>
  );
}

// --- Stats Tab ---
function StatsTab({ data, onChange }) {
  const stats = Array.isArray(data.stats) ? data.stats : [];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: '#999' }}>{stats.length} 项数据</span>
        <button
          style={{ ...styles.btn, ...styles.btnOutline, ...styles.btnSmall }}
          onClick={() => onChange(updateNested(data, 'stats', arrayAdd(stats, { value: '0', numericValue: 0, suffix: '+', label: '新指标' })))}
        >
          + 添加
        </button>
      </div>
      {stats.map((item, i) => (
        <div key={i} style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>指标 {i + 1}</span>
            <button style={{ ...styles.btn, ...styles.btnDanger, ...styles.btnSmall }} onClick={() => onChange(updateNested(data, 'stats', arrayRemove(stats, i)))}>删除</button>
          </div>
          <div style={styles.row}>
            <div style={styles.col()}>
              <label style={styles.label}>显示值</label>
              <input style={styles.input} value={item.value || ''} onChange={(e) => onChange(updateNested(data, 'stats', arrayUpdate(stats, i, { value: e.target.value })))} />
            </div>
            <div style={styles.col()}>
              <label style={styles.label}>数值（用于动画）</label>
              <input style={styles.input} type="number" value={item.numericValue ?? 0} onChange={(e) => onChange(updateNested(data, 'stats', arrayUpdate(stats, i, { numericValue: parseFloat(e.target.value) || 0 })))} />
            </div>
          </div>
          <div style={styles.row}>
            <div style={styles.col()}>
              <label style={styles.label}>后缀</label>
              <input style={styles.input} value={item.suffix || ''} onChange={(e) => onChange(updateNested(data, 'stats', arrayUpdate(stats, i, { suffix: e.target.value })))} />
            </div>
            <div style={styles.col(2)}>
              <label style={styles.label}>标签</label>
              <input style={styles.input} value={item.label || ''} onChange={(e) => onChange(updateNested(data, 'stats', arrayUpdate(stats, i, { label: e.target.value })))} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Experience Tab ---
function ExperienceTab({ data, onChange }) {
  const exp = data.experience || {};
  const work = Array.isArray(exp.work) ? exp.work : [];
  const edu = exp.education || {};

  const updateWork = (idx, updates) => {
    const newWork = structuredClone(work);
    newWork[idx] = { ...newWork[idx], ...updates };
    onChange(updateNested(data, 'experience.work', newWork));
  };

  const updateWorkRole = (workIdx, roleIdx, updates) => {
    const newWork = structuredClone(work);
    newWork[workIdx].roles[roleIdx] = { ...newWork[workIdx].roles[roleIdx], ...updates };
    onChange(updateNested(data, 'experience.work', newWork));
  };

  const addWorkRole = (workIdx) => {
    const newWork = structuredClone(work);
    if (!Array.isArray(newWork[workIdx].roles)) newWork[workIdx].roles = [];
    newWork[workIdx].roles.push({ title: '新职位', description: '' });
    onChange(updateNested(data, 'experience.work', newWork));
  };

  const removeWorkRole = (workIdx, roleIdx) => {
    const newWork = structuredClone(work);
    newWork[workIdx].roles.splice(roleIdx, 1);
    onChange(updateNested(data, 'experience.work', newWork));
  };

  return (
    <div>
      {/* Education */}
      <h3 style={{ fontSize: 13, fontWeight: 600, color: '#FF6B00', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>教育</h3>
      <div style={styles.card}>
        <div style={styles.row}>
          <div style={styles.col(2)}>
            <label style={styles.label}>学校</label>
            <input style={styles.input} value={edu.school || ''} onChange={(e) => onChange(updateNested(data, 'experience.education.school', e.target.value))} />
          </div>
          <div style={styles.col()}>
            <label style={styles.label}>专业</label>
            <input style={styles.input} value={edu.degree || ''} onChange={(e) => onChange(updateNested(data, 'experience.education.degree', e.target.value))} />
          </div>
          <div style={styles.col(0.5)}>
            <label style={styles.label}>年份</label>
            <input style={styles.input} value={edu.year || ''} onChange={(e) => onChange(updateNested(data, 'experience.education.year', e.target.value))} />
          </div>
        </div>
      </div>

      <hr style={styles.divider} />

      {/* Work */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#FF6B00', textTransform: 'uppercase', letterSpacing: 1 }}>工作经历</h3>
        <button
          style={{ ...styles.btn, ...styles.btnOutline, ...styles.btnSmall }}
          onClick={() => onChange(updateNested(data, 'experience.work', arrayAdd(work, { company: '新公司', period: '2024 — 至今', duration: '1 年', roles: [{ title: '职位', description: '' }] })))}
        >
          + 添加公司
        </button>
      </div>
      {work.map((job, wi) => (
        <div key={wi} style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>{job.company || '未命名公司'}</span>
            <button style={{ ...styles.btn, ...styles.btnDanger, ...styles.btnSmall }} onClick={() => onChange(updateNested(data, 'experience.work', arrayRemove(work, wi)))}>删除公司</button>
          </div>
          <div style={styles.row}>
            <div style={styles.col(2)}>
              <label style={styles.label}>公司名</label>
              <input style={styles.input} value={job.company || ''} onChange={(e) => updateWork(wi, { company: e.target.value })} />
            </div>
            <div style={styles.col()}>
              <label style={styles.label}>时间段</label>
              <input style={styles.input} value={job.period || ''} onChange={(e) => updateWork(wi, { period: e.target.value })} />
            </div>
            <div style={styles.col(0.5)}>
              <label style={styles.label}>时长</label>
              <input style={styles.input} value={job.duration || ''} onChange={(e) => updateWork(wi, { duration: e.target.value })} />
            </div>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #111', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#888' }}>职位 ({Array.isArray(job.roles) ? job.roles.length : 0})</span>
            <button style={{ ...styles.btn, ...styles.btnOutline, ...styles.btnSmall }} onClick={() => addWorkRole(wi)}>+ 添加职位</button>
          </div>
          {(Array.isArray(job.roles) ? job.roles : []).map((role, ri) => (
            <div key={ri} style={{ background: '#111', borderRadius: 8, padding: 12, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <input style={{ ...styles.input, flex: 1, marginRight: 8 }} value={role.title || ''} onChange={(e) => updateWorkRole(wi, ri, { title: e.target.value })} placeholder="职位名称" />
                <button style={{ ...styles.btn, ...styles.btnDanger, ...styles.btnSmall }} onClick={() => removeWorkRole(wi, ri)}>×</button>
              </div>
              <textarea style={{ ...styles.textarea, minHeight: 60 }} value={role.description || ''} onChange={(e) => updateWorkRole(wi, ri, { description: e.target.value })} placeholder="职位描述..." />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// --- Expertise Tab ---
function ExpertiseTab({ data, onChange }) {
  const items = Array.isArray(data.expertise) ? data.expertise : [];
  const updateItem = (idx, updates) => onChange(updateNested(data, 'expertise', arrayUpdate(items, idx, updates)));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: '#999' }}>{items.length} 项能力</span>
        <button
          style={{ ...styles.btn, ...styles.btnOutline, ...styles.btnSmall }}
          onClick={() => onChange(updateNested(data, 'expertise', arrayAdd(items, { id: crypto.randomUUID().slice(0, 8), title: '新能力', icon: '●', description: '', tags: [] })))}
        >
          + 添加
        </button>
      </div>
      {items.map((item, i) => (
        <div key={item.id || i} style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>{item.title || '未命名'}</span>
            <button style={{ ...styles.btn, ...styles.btnDanger, ...styles.btnSmall }} onClick={() => onChange(updateNested(data, 'expertise', arrayRemove(items, i)))}>删除</button>
          </div>
          <div style={styles.row}>
            <div style={styles.col(2)}>
              <label style={styles.label}>标题</label>
              <input style={styles.input} value={item.title || ''} onChange={(e) => updateItem(i, { title: e.target.value })} />
            </div>
          </div>

          {/* Icon section — redesigned */}
          <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <label style={{ ...styles.label, marginBottom: 12 }}>图标</label>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {/* Preview */}
              <div style={{
                width: 48, height: 48, flexShrink: 0,
                background: item.icon ? '#111' : '#0a0a0a',
                border: item.icon ? '1px solid #333' : '2px dashed #222',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, color: '#ccc',
                transition: 'all 0.2s',
              }}>
                {item.icon ? (item.icon.startsWith('/') ? (
                  <img src={item.icon} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                ) : (
                  item.icon
                )) : (
                  <span style={{ color: '#444' }}>—</span>
                )}
                <span style={{ display: item.icon ? 'none' : 'none' }}>🖼</span>
              </div>
              {/* Controls */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    style={{ ...styles.input, flex: 1 }}
                    value={item.icon || ''}
                    onChange={(e) => updateItem(i, { icon: e.target.value || null })}
                    placeholder="输入 emoji 或图标路径，例如：🎨   /images/icon.svg"
                  />
                  <button
                    type="button"
                    style={{ ...styles.btn, ...styles.btnOutline, ...styles.btnSmall, whiteSpace: 'nowrap' }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = e.target.files?.[0];
                        if (file) updateItem(i, { icon: '/images/' + file.name });
                      };
                      input.click();
                    }}
                  >📁</button>
                  {item.icon && (
                    <button
                      title="不显示图标"
                      style={{ ...styles.btn, ...styles.btnDanger, ...styles.btnSmall, padding: '4px 8px' }}
                      onClick={() => updateItem(i, { icon: null })}
                    >✕</button>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#555', lineHeight: 1.5 }}>
                  支持 emoji 或自定义图标（SVG/PNG）。图标文件请放到 <code style={{ color: '#FF8A33', background: '#111', padding: '1px 4px', borderRadius: 3 }}>public/images/</code>。留空则不显示图标。
                </div>
              </div>
            </div>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>描述</label>
            <textarea style={styles.textarea} value={item.description || ''} onChange={(e) => updateItem(i, { description: e.target.value })} />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>标签（逗号分隔）</label>
            <TagsInput
              value={Array.isArray(item.tags) ? item.tags : []}
              onChange={(tags) => updateItem(i, { tags })}
            />
          </div>
          <div style={styles.desc}>ID: {item.id || '(自动生成)'}</div>
        </div>
      ))}
    </div>
  );
}

// --- Tools Tab ---
function ToolsTab({ data, onChange }) {
  const items = Array.isArray(data.tools) ? data.tools : [];
  const updateItem = (idx, updates) => onChange(updateNested(data, 'tools', arrayUpdate(items, idx, updates)));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: '#999' }}>{items.length} 个分类</span>
        <button
          style={{ ...styles.btn, ...styles.btnOutline, ...styles.btnSmall }}
          onClick={() => onChange(updateNested(data, 'tools', arrayAdd(items, { category: '新分类', items: [] })))}
        >
          + 添加分类
        </button>
      </div>
      {items.map((tool, i) => (
        <div key={i} style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>{tool.category || '未命名'}</span>
            <button style={{ ...styles.btn, ...styles.btnDanger, ...styles.btnSmall }} onClick={() => onChange(updateNested(data, 'tools', arrayRemove(items, i)))}>删除分类</button>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>分类名</label>
            <input style={styles.input} value={tool.category || ''} onChange={(e) => updateItem(i, { category: e.target.value })} />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>工具列表（逗号分隔）</label>
            <TagsInput
              value={Array.isArray(tool.items) ? tool.items : []}
              onChange={(items) => updateItem(i, { items })}
            />
          </div>
          {Array.isArray(tool.items) && tool.items.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {tool.items.map((t, ti) => (
                <span key={ti} style={styles.tag}>{t}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// --- Media File Input Component ---
function MediaFileInput({ value, onChange, accept, placeholder, hint }) {
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Generate the expected path under public/
    const path = `${accept === 'video/*' ? '/videos/' : '/images/'}${file.name}`;
    onChange(path);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="file"
          ref={fileRef}
          onChange={handleFile}
          accept={accept}
          style={{ display: 'none' }}
        />
        <input
          style={{ ...styles.input, flex: 1 }}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <button
          type="button"
          style={{ ...styles.btn, ...styles.btnOutline, ...styles.btnSmall, whiteSpace: 'nowrap' }}
          onClick={() => fileRef.current?.click()}
        >
          📁 选择文件
        </button>
      </div>
      {hint && (
        <div style={{ fontSize: 11, color: '#555', marginTop: 4, lineHeight: 1.5 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// --- Projects Tab ---
function ProjectsTab({ data, onChange }) {
  const items = Array.isArray(data.projects) ? data.projects : [];
  const updateItem = (idx, updates) => onChange(updateNested(data, 'projects', arrayUpdate(items, idx, updates)));
  const maxId = items.reduce((m, p) => Math.max(m, p.id || 0), 0);
  const allCategories = useMemo(() => {
    const cats = new Set();
    items.forEach((p) => { if (p.category) cats.add(p.category.trim()); });
    return [...cats].sort();
  }, [items]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: '#999' }}>{items.length} 个项目</span>
        <button
          style={{ ...styles.btn, ...styles.btnOutline, ...styles.btnSmall }}
          onClick={() => onChange(updateNested(data, 'projects', arrayPrepend(items, { id: maxId + 1, title: '新项目', category: allCategories[0] || '视觉设计', date: '2026-01', description: '', image: null, tags: [], gallery: [] })))}
        >
          + 添加项目
        </button>
      </div>
      {/* Media assets hint */}
      <div style={{ padding: '10px 14px', background: 'rgba(255,107,0,0.06)', borderRadius: 8, marginBottom: 16, border: '1px solid rgba(255,107,0,0.12)', fontSize: 12, color: '#888', lineHeight: 1.8 }}>
        <div style={{ color: '#FF8A33', fontWeight: 600, marginBottom: 4 }}>📁 媒体素材存放说明</div>
        图片请放置到 <code style={{ color: '#FF8A33', background: '#111', padding: '2px 6px', borderRadius: 4 }}>public/images/</code> 目录<br />
        视频请放置到 <code style={{ color: '#FF8A33', background: '#111', padding: '2px 6px', borderRadius: 4 }}>public/videos/</code> 目录<br />
        路径填写规则：<code style={{ color: '#aaa', background: '#111', padding: '2px 6px', borderRadius: 4 }}>/images/文件名.jpg</code> 或 <code style={{ color: '#aaa', background: '#111', padding: '2px 6px', borderRadius: 4 }}>/videos/文件名.mp4</code>
      </div>
      {items.map((proj, i) => {
        const tags = Array.isArray(proj.tags) ? proj.tags : [];
        const gallery = Array.isArray(proj.gallery) ? proj.gallery : [];
        const catOptions = [...allCategories];
        if (proj.category && !catOptions.includes(proj.category.trim())) {
          catOptions.push(proj.category.trim());
        }
        return (
          <div key={proj.id || i} style={{ ...styles.card, borderLeft: '3px solid #FF6B00' }}>
            <div style={styles.cardHeader}>
              <div>
                <span style={styles.cardTitle}>{proj.title || '未命名项目'}</span>
                {proj.category && (
                  <span style={{
                    display: 'inline-block', marginLeft: 10, padding: '2px 10px',
                    background: 'rgba(255,107,0,0.12)', borderRadius: 10, fontSize: 11,
                    color: '#FF8A33', fontWeight: 500,
                  }}>{proj.category}</span>
                )}
              </div>
              <button style={{ ...styles.btn, ...styles.btnOutline, ...styles.btnSmall }} onClick={() => onChange(updateNested(data, 'projects', arrayRemove(items, i)))}>删除</button>
            </div>
            <div style={styles.row}>
              <div style={styles.col(2)}>
                <label style={styles.label}>标题</label>
                <input style={styles.input} value={proj.title || ''} onChange={(e) => updateItem(i, { title: e.target.value })} />
              </div>
              <div style={styles.col()}>
                <label style={styles.label}>分类</label>
                <select style={{ ...styles.input, cursor: 'pointer' }} value={proj.category || ''} onChange={(e) => updateItem(i, { category: e.target.value })}>
                  <option value="">-- 选择分类 --</option>
                  {catOptions.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div style={styles.col(0.5)}>
                <label style={styles.label}>日期</label>
                <input style={styles.input} value={proj.date || ''} onChange={(e) => updateItem(i, { date: e.target.value })} />
              </div>
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>描述</label>
              <textarea style={styles.textarea} value={proj.description || ''} onChange={(e) => updateItem(i, { description: e.target.value })} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>标签（逗号分隔）</label>
              <TagsInput value={tags} onChange={(newTags) => updateItem(i, { tags: newTags })} />
            </div>
            {tags.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                {tags.map((t, ti) => <span key={ti} style={styles.tag}>{t}</span>)}
              </div>
            )}

            {/* ── Gallery section with clear hierarchy ── */}
            <div style={{ borderTop: '2px solid #222', marginTop: 16, paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#aaa' }}>📁 项目媒体</span>
                  <span style={{ fontSize: 11, color: '#555', background: '#111', padding: '1px 8px', borderRadius: 8 }}>{gallery.length} 项</span>
                </div>
                <button style={{ ...styles.btn, ...styles.btnOutline, ...styles.btnSmall }} onClick={() => updateItem(i, { gallery: [...structuredClone(gallery), { image: '', caption: '' }] })}>+ 添加媒体</button>
              </div>

              {gallery.length === 0 ? (
                <div style={{ margin: '12px 0 16px 0', padding: '28px', background: '#0a0a0a', borderRadius: 8, border: '1px dashed #1a1a1a', textAlign: 'center', color: '#444', fontSize: 12 }}>暂无媒体内容，点击上方添加</div>
              ) : gallery.map((g, gi) => (
                <div key={gi} style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderLeft: '2px solid #444', borderRadius: 8, padding: 14, marginBottom: 10, marginLeft: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: g.video ? '#FF6B00' : '#888' }}>{g.video ? '🎬 视频' : g.aspect === 'portrait' ? '📱 竖版图片' : '🖼 横版图片'}</span>
                      <span style={{ fontSize: 11, color: '#555' }}>#{gi + 1}</span>
                    </div>
                    <button style={{ ...styles.btn, ...styles.btnDanger, ...styles.btnSmall }} onClick={() => { const ng = structuredClone(gallery); ng.splice(gi, 1); updateItem(i, { gallery: ng }); }}>删除</button>
                  </div>
                  <div style={styles.row}>
                    <div style={{ ...styles.col(2), display: 'flex', flexDirection: 'column' }}>
                      <label style={styles.label}>图片文件 {g.image ? '✅ 已设置' : ''}</label>
                      <MediaFileInput
                        value={g.image || ''}
                        onChange={(v) => { const ng = structuredClone(gallery); ng[gi] = { ...ng[gi], image: v }; updateItem(i, { gallery: ng }); }}
                        accept="image/*"
                        placeholder="例如 /images/project-01.jpg"
                        hint="📁 请将图片文件放到 public/images/ 目录，左侧路径相对于 public 根目录"
                      />
                      {g.image && (
                        <div style={styles.thumbWrap} onClick={() => window.open(g.image, '_blank')} title="点击查看大图">
                          <img src={g.image} alt="" style={styles.thumbImg} />
                          <div style={styles.thumbInfo}>
                            <div style={styles.thumbUrl}>{g.image}</div>
                            <div style={{ fontSize: 10, color: '#444' }}>{g.aspect === 'portrait' ? '竖版' : '横版'}{g.video ? ' · 含视频' : ''}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={styles.col()}>
                      <label style={styles.label}>类型</label>
                      <select style={{ ...styles.input, cursor: 'pointer' }} value={g.aspect || 'landscape'} onChange={(e) => { const ng = structuredClone(gallery); ng[gi] = { ...ng[gi], aspect: e.target.value }; updateItem(i, { gallery: ng }); }}>
                        <option value="landscape">横版</option>
                        <option value="portrait">竖版</option>
                      </select>
                    </div>
                  </div>
                  {g.video && (
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>视频文件</label>
                      <MediaFileInput
                        value={g.video || ''}
                        onChange={(v) => { const ng = structuredClone(gallery); ng[gi] = { ...ng[gi], video: v }; updateItem(i, { gallery: ng }); }}
                        accept="video/*"
                        placeholder="例如 /videos/hero-bg.mp4"
                        hint="📁 请将视频文件放到 public/videos/ 目录"
                      />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {!g.video && <button style={{ ...styles.btn, ...styles.btnOutline, ...styles.btnSmall }} onClick={() => { const ng = structuredClone(gallery); ng[gi] = { ...ng[gi], video: '' }; updateItem(i, { gallery: ng }); }}>+ 添加视频</button>}
                    {g.video !== undefined && <button style={{ ...styles.btn, ...styles.btnOutline, ...styles.btnSmall }} onClick={() => { const ng = structuredClone(gallery); const { video, ...rest } = ng[gi]; ng[gi] = rest; updateItem(i, { gallery: ng }); }}>移除视频</button>}
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>说明</label>
                    <input style={styles.input} value={g.caption || ''} onChange={(e) => { const ng = structuredClone(gallery); ng[gi] = { ...ng[gi], caption: e.target.value }; updateItem(i, { gallery: ng }); }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Contact Tab ---
function ContactTab({ data, onChange }) {
  const contact = data.contact || {};
  const items = Array.isArray(contact.items) ? contact.items : [];
  const updateContact = (path, value) => onChange(updateNested(data, 'contact.' + path, value));
  const updateItem = (idx, updates) => {
    const newItems = items.map((item, index) => (index === idx ? { ...item, ...updates } : item));
    updateContact('items', newItems);
  };
  const addItem = () => {
    const newItems = [...structuredClone(items), { type: '', mode: 'link', value: '' }];
    updateContact('items', newItems);
  };
  const removeItem = (idx) => {
    updateContact('items', items.filter((_, index) => index !== idx));
  };

  const contactTypes = [
    { value: 'wechat', label: '💬 微信' },
    { value: 'qq', label: '🐧 QQ' },
    { value: 'behance', label: '🎨 Behance' },
    { value: 'zcool', label: '🔥 站酷' },
    { value: 'weibo', label: '📢 微博' },
    { value: 'dribbble', label: '🏀 Dribbble' },
    { value: 'github', label: '🐙 GitHub' },
    { value: 'official', label: '📱 公众号' },
    { value: 'link', label: '🔗 网站' },
  ];

  return (
    <div>
      <div style={{ padding: 14, background: '#0f0f0f', borderRadius: 8, marginBottom: 16, border: '1px solid #1a1a1a' }}>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>📁 联系方式说明</div>
        <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>
          • <strong>邮箱</strong>：始终显示为「复制邮箱」卡片<br />
          • <strong>链接模式</strong>：点击跳转外部链接（Behance、GitHub 等）<br />
          • <strong>二维码模式</strong>：点击弹出二维码弹窗（微信、公众号等），需要上传本地二维码图片<br />
          • 留空 value 的项自动隐藏
        </div>
      </div>

      {/* Email field */}
      <div style={styles.fieldGroup}>
        <label style={styles.label}>邮箱地址（点击可复制）</label>
        <input
          style={styles.input}
          value={contact.email || ''}
          onChange={(e) => updateContact('email', e.target.value || null)}
          placeholder="your@email.com"
        />
      </div>

      <hr style={{ ...styles.divider, borderColor: '#1a1a1a' }} />

      {/* Dynamic contact items */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 14, color: '#999' }}>其他联系方式 ({items.length} 项)</span>
        <button style={{ ...styles.btn, ...styles.btnOutline, ...styles.btnSmall }} onClick={addItem}>+ 添加联系方式</button>
      </div>

      {items.map((item, idx) => {
        const mode = item.mode || 'link';
        const isQR = mode === 'qrcode';
        return (
          <div key={idx} style={{ ...styles.card, borderLeft: isQR ? '3px solid #FF6B00' : '2px solid #333', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#aaa' }}>
                {isQR ? '📱 二维码' : '🔗 链接'} · {item.type || '未设置'}
              </span>
              <button style={{ ...styles.btn, ...styles.btnDanger, ...styles.btnSmall }} onClick={() => removeItem(idx)}>删除</button>
            </div>

            {/* Type + Mode row */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1.2 }}>
                <label style={styles.label}>类型</label>
                <select
                  style={{ ...styles.input, cursor: 'pointer' }}
                  value={item.type || ''}
                  onChange={(e) => updateItem(idx, { type: e.target.value })}
                >
                  <option value="">-- 选择 --</option>
                  {contactTypes.map((ct) => (
                    <option key={ct.value} value={ct.value}>{ct.label}</option>
                  ))}
                  {item.type && !contactTypes.find((ct) => ct.value === item.type) && (
                    <option value={item.type}>{item.type} (自定义)</option>
                  )}
                </select>
              </div>
              <div style={{ flex: 0.8 }}>
                <label style={styles.label}>模式</label>
                <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #222' }}>
                  <button
                    type="button"
                    onClick={() => updateItem(idx, { mode: 'link' })}
                    style={{
                      flex: 1, padding: '8px 12px', fontSize: 12, fontWeight: mode === 'link' ? 600 : 400,
                      color: mode === 'link' ? '#FF6B00' : '#666', background: mode === 'link' ? '#1a1000' : '#0d0d0d',
                      border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >🔗 链接</button>
                  <button
                    type="button"
                    onClick={() => updateItem(idx, { mode: 'qrcode' })}
                    style={{
                      flex: 1, padding: '8px 12px', fontSize: 12, fontWeight: mode === 'qrcode' ? 600 : 400,
                      color: mode === 'qrcode' ? '#FF6B00' : '#666', background: mode === 'qrcode' ? '#1a1000' : '#0d0d0d',
                      border: 'none', borderLeft: '1px solid #222', cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >📱 二维码</button>
                </div>
              </div>
            </div>

            {/* Value field: depends on mode */}
            {isQR ? (
              <div>
                <label style={styles.label}>二维码图片</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <MediaFileInput
                      value={item.value || ''}
                      onChange={(v) => updateItem(idx, { value: v || null })}
                      accept="image/*"
                      placeholder="/images/wechat-qr.png"
                      hint="📁 请将二维码图片放到 public/images/ 目录"
                    />
                  </div>
                  {item.value && (
                    <div style={{
                      width: 56, height: 56, flexShrink: 0, borderRadius: 8, overflow: 'hidden',
                      border: '1px solid #222', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <img src={item.value} alt="QR" style={{ width: 48, height: 48, objectFit: 'contain' }} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>链接地址</label>
                <input
                  style={styles.input}
                  value={item.value || ''}
                  onChange={(e) => updateItem(idx, { value: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            )}
          </div>
        );
      })}

      {items.length === 0 && (
        <div style={{ padding: 28, background: '#0a0a0a', borderRadius: 8, border: '1px dashed #1a1a1a', textAlign: 'center', color: '#444', fontSize: 12 }}>
          暂无其他联系方式，点击上方按钮添加
        </div>
      )}
    </div>
  );
}

// --- Categories Tab ---
function CategoriesTab({ data, onChange }) {
  const projects = Array.isArray(data.projects) ? data.projects : [];

  // Derive category list with project counts
  const categoryMap = useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      const cat = (p.category || '').trim();
      if (!cat) return;
      if (!map[cat]) map[cat] = [];
      map[cat].push(p.title);
    });
    return map;
  }, [projects]);

  const categories = useMemo(() => Object.keys(categoryMap).sort(), [categoryMap]);

  const [newCategory, setNewCategory] = useState('');
  const [editingCat, setEditingCat] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const addCategory = () => {
    const name = newCategory.trim();
    if (!name || categories.includes(name)) { setNewCategory(''); return; }
    // No projects to update, category is managed implicitly via project.category
    setNewCategory('');
  };

  const renameCategory = (oldName) => {
    const newName = editingValue.trim();
    if (!newName || newName === oldName || categories.includes(newName)) { setEditingCat(null); return; }
    const updatedProjects = structuredClone(projects).map((p) => {
      if ((p.category || '').trim() === oldName) return { ...p, category: newName };
      return p;
    });
    onChange(updateNested(data, 'projects', updatedProjects));
    setEditingCat(null);
  };

  const deleteCategory = (catName) => {
    const updatedProjects = structuredClone(projects).map((p) => {
      if ((p.category || '').trim() === catName) return { ...p, category: '' };
      return p;
    });
    onChange(updateNested(data, 'projects', updatedProjects));
  };

  return (
    <div>
      {/* Add new category */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          style={{ ...styles.input, flex: 1 }}
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { addCategory(); } }}
          placeholder="输入新分类名称，回车添加"
        />
        <button style={{ ...styles.btn, ...styles.btnPrimary, ...styles.btnSmall }} onClick={addCategory}>添加</button>
      </div>
      <div style={styles.desc}>注意：分类是项目的属性，此处修改将影响对应项目的 category 字段。新增分类需在项目编辑中手动分配给项目。</div>

      <hr style={styles.divider} />

      {/* Category list */}
      {categories.length === 0 ? (
        <div style={styles.empty}>暂无分类</div>
      ) : (
        categories.map((cat) => (
          <div key={cat} style={styles.card}>
            <div style={styles.cardHeader}>
              {editingCat === cat ? (
                <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                  <input
                    style={{ ...styles.input, flex: 1 }}
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') renameCategory(cat); if (e.key === 'Escape') setEditingCat(null); }}
                    autoFocus
                  />
                  <button style={{ ...styles.btn, ...styles.btnSuccess, ...styles.btnSmall }} onClick={() => renameCategory(cat)}>保存</button>
                  <button style={{ ...styles.btn, ...styles.btnOutline, ...styles.btnSmall }} onClick={() => setEditingCat(null)}>取消</button>
                </div>
              ) : (
                <div>
                  <span style={styles.cardTitle}>{cat}</span>
                  <span style={{ fontSize: 11, color: '#666', marginLeft: 10 }}>
                    {(categoryMap[cat] || []).length} 个项目
                  </span>
                </div>
              )}
              {editingCat !== cat && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={{ ...styles.btn, ...styles.btnOutline, ...styles.btnSmall }} onClick={() => { setEditingCat(cat); setEditingValue(cat); }}>重命名</button>
                  <button style={{ ...styles.btn, ...styles.btnDanger, ...styles.btnSmall }} onClick={() => deleteCategory(cat)}>删除</button>
                </div>
              )}
            </div>
            {/* Show projects in this category */}
            {(categoryMap[cat] || []).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {(categoryMap[cat] || []).map((title) => (
                  <span key={title} style={styles.tag}>{title}</span>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// --- JSON Tab ---
function JsonTab({ data, onChange }) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) {
      setJsonText(JSON.stringify(data, null, 2));
      setError(null);
    }
  }, [data, dirty]);

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const result = validateProfile(parsed);
      if (!result.valid) {
        setError(result.error);
        return;
      }
      onChange(parsed);
      // Write to sessionStorage so / (front page) picks up changes immediately
      try {
        sessionStorage.setItem('admin_preview_profile', JSON.stringify(parsed));
      } catch { /* sessionStorage may be unavailable */ }
      setError(null);
      setDirty(false);
    } catch (err) {
      setError('JSON 解析错误: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <button style={{ ...styles.btn, ...styles.btnSuccess, ...styles.btnSmall }} onClick={handleApply}>应用更改</button>
        <button style={{ ...styles.btn, ...styles.btnOutline, ...styles.btnSmall }} onClick={() => { setJsonText(JSON.stringify(data, null, 2)); setError(null); setDirty(false); }}>重置</button>
      </div>
      {error && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 8 }}>{error}</div>}
      <textarea
        style={{ ...styles.textarea, minHeight: 500, fontFamily: "'JetBrains Mono', 'Consolas', monospace", fontSize: 13, lineHeight: 1.5 }}
        value={jsonText}
        onChange={(e) => { setJsonText(e.target.value); setDirty(true); setError(null); }}
      />
    </div>
  );
}

// ============================================================
// Generate profile.js export string
// ============================================================
function generateProfileJS(data) {
  // Preserve all fields in stats, ensuring required fields exist
  const stats = (data.stats || []).map((s) => ({
    ...s,
    value: s.value || '0',
    numericValue: s.numericValue ?? 0,
    suffix: s.suffix || '',
    label: s.label || '',
  }));
  const navItems = [
    { id: 'about', label: 'About', labelZh: '关于' },
    { id: 'projects', label: 'Work', labelZh: '作品' },
    { id: 'expertise', label: 'Expertise', labelZh: '能力' },
    { id: 'contact', label: 'Contact', labelZh: '联系' },
  ];

  const profileJSON = JSON.stringify({ ...data, stats }, null, 2);

  return `// Allow admin preview to override profile data via sessionStorage
const _previewData = typeof window !== 'undefined' && window.sessionStorage
  ? (() => {
      try {
        const raw = sessionStorage.getItem('admin_preview_profile');
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    })()
  : null;

const _baseProfile = ${profileJSON};

export const profile = _previewData || _baseProfile;

export const navItems = ${JSON.stringify(navItems, null, 2)};
`;
}

// ============================================================
// Main Admin Component
// ============================================================
const TABS = [
  { id: 'info', label: '信息' },
  { id: 'stats', label: '数据' },
  { id: 'experience', label: '经历' },
  { id: 'expertise', label: '能力' },
  { id: 'tools', label: '工具' },
  { id: 'projects', label: '项目' },
  { id: 'categories', label: '分类' },
  { id: 'contact', label: '联系' },
  { id: 'json', label: 'JSON' },
];

function Admin() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // --- Initial load ---
  // Use bundled module import directly (works in both dev and production)
  useEffect(() => {
    if (_profileModule && _profileModule.contact) {
      setData(structuredClone(_profileModule));
    } else {
      setLoadError('数据加载失败 — profile 模块导入异常');
    }
    setLoading(false);
  }, []);

  // --- Handlers ---
  const handleDataChange = useCallback((newData) => {
    setData(newData);
  }, []);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.js';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target.result;
        try {
          const parsed = parseProfileFromSource(text);
          const result = validateProfile(parsed);
          if (!result.valid) throw new Error(result.error);
          setData(parsed);
          setToast({ message: '导入成功', type: 'success' });
        } catch (err) {
          setToast({ message: '导入失败: ' + err.message, type: 'error' });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  const handleExport = useCallback(() => {
    if (!data) return;
    const content = generateProfileJS(data);
    const blob = new Blob([content], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'profile.js';
    document.body.appendChild(a);
    a.click();
    // Delay revocation to ensure browser completes the download
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
    setToast({ message: 'profile.js 已下载', type: 'success' });
  }, [data]);

  // --- Loading / Error states ---
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#999', fontSize: 14 }}>
          加载数据中...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
          <div style={{ color: '#ef4444', fontSize: 16, fontWeight: 600 }}>数据加载失败</div>
          <div style={{ color: '#666', fontSize: 13, maxWidth: 500, textAlign: 'center' }}>{loadError}</div>
          <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => window.location.reload()}>重新加载</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const tabContent = (() => {
    switch (activeTab) {
      case 'info': return <InfoTab data={data} onChange={handleDataChange} />;
      case 'stats': return <StatsTab data={data} onChange={handleDataChange} />;
      case 'experience': return <ExperienceTab data={data} onChange={handleDataChange} />;
      case 'expertise': return <ExpertiseTab data={data} onChange={handleDataChange} />;
      case 'tools': return <ToolsTab data={data} onChange={handleDataChange} />;
      case 'projects': return <ProjectsTab data={data} onChange={handleDataChange} />;
      case 'categories': return <CategoriesTab data={data} onChange={handleDataChange} />;
      case 'contact': return <ContactTab data={data} onChange={handleDataChange} />;
      case 'json': return <JsonTab data={data} onChange={handleDataChange} />;
      default: return null;
    }
  })();

  return (
    <div style={styles.container}>
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logo}>⚙ 后台管理</span>
          <span style={{ fontSize: 12, color: '#555' }}>马守坤 Portfolio CMS</span>
        </div>
        <div style={styles.headerRight}>
          <button style={{ ...styles.btn, ...styles.btnSuccess }} onClick={() => { /* sync sessionStorage then open preview */ try { sessionStorage.setItem('admin_preview_profile', JSON.stringify(data)); } catch {} window.open('/', '_blank'); }}>👁 实时预览</button>
          <button style={{ ...styles.btn, ...styles.btnOutline }} onClick={handleImport}>📂 导入</button>
          <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={handleExport}>⬇ 导出 profile.js</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map((t) => (
          <button key={t.id} style={styles.tab(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.editor}>
          {tabContent}
        </div>
      </div>

      {/* Toast animation style */}
      <style>{`
        @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(-12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>
    </div>
  );
}

// ============================================================
// Mount
// ============================================================
const AdminWithErrorBoundary = () => (
  <AdminErrorBoundary>
    <Admin />
  </AdminErrorBoundary>
);

createRoot(document.getElementById('root')).render(<AdminWithErrorBoundary />);
