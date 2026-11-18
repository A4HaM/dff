import React, { useMemo, useState } from 'react';
import { ArrowUpDown, Check, Search } from 'lucide-react';
import { CATEGORY_META, ELEMENTS, getCasGroupLabel, getMetallicType } from '../data/elements';
import { getMetallicStrings } from '../i18n/metallicTranslations';
import {
  getElementName,
  getTranslations,
  SupportedLanguage,
} from '../i18n/translations';
import { ChemicalElement, ElementCategory, MetallicType } from '../types/element';

interface ElementIndexViewProps {
  selectedNumbers: Set<number>;
  onToggleElement: (num: number) => void;
  onSelectBatch: (nums: number[], mode: 'add' | 'remove') => void;
  onStartQuiz: () => void;
  language: SupportedLanguage;
  isMobileLayout?: boolean;
}

type SortKey = 'number' | 'name' | 'symbol' | 'metallic' | 'period' | 'group';

export const ElementIndexView: React.FC<ElementIndexViewProps> = ({
  selectedNumbers,
  onToggleElement,
  onSelectBatch,
  onStartQuiz,
  language,
  isMobileLayout = false,
}) => {
  const t = getTranslations(language);
  const m = getMetallicStrings(language);

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ElementCategory | 'all'>('all');
  const [metallicFilter, setMetallicFilter] = useState<MetallicType | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('number');
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ELEMENTS.filter((el) => {
      if (categoryFilter !== 'all' && el.category !== categoryFilter) {
        return false;
      }
      if (metallicFilter !== 'all' && getMetallicType(el.category) !== metallicFilter) {
        return false;
      }
      if (!q) return true;
      const localizedName = getElementName(el, language).toLowerCase();
      return (
        localizedName.includes(q) ||
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase().includes(q) ||
        String(el.number) === q
      );
    }).sort((a: ChemicalElement, b: ChemicalElement) => {
      let cmp = 0;
      if (sortKey === 'number') cmp = a.number - b.number;
      else if (sortKey === 'name') {
        cmp = getElementName(a, language).localeCompare(
          getElementName(b, language),
          language
        );
      } else if (sortKey === 'metallic') {
        const ma = m.labels[getMetallicType(a.category)];
        const mb = m.labels[getMetallicType(b.category)];
        cmp = ma.localeCompare(mb, language) || a.number - b.number;
      } else if (sortKey === 'period') {
        cmp = a.period - b.period || a.number - b.number;
      } else if (sortKey === 'group') {
        cmp = a.group - b.group || a.number - b.number;
      } else {
        cmp = a.symbol.localeCompare(b.symbol);
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [query, categoryFilter, metallicFilter, sortKey, sortAsc, language, m.labels]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((el) => selectedNumbers.has(el.number));

  const toggleAllFiltered = () => {
    const nums = filtered.map((e) => e.number);
    onSelectBatch(nums, allFilteredSelected ? 'remove' : 'add');
  };

  const metallicTextClass = (type: MetallicType) => {
    if (type === 'metal') return 'text-sky-300';
    if (type === 'nonmetal') return 'text-amber-300';
    return 'text-teal-300';
  };

  return (
    <section
      className={`mx-auto max-w-[1440px] ${
        isMobileLayout ? 'px-3 py-3.5 space-y-3.5' : 'px-4 lg:px-6 py-4 space-y-4'
      }`}
    >
      <div
        className={`flex gap-3 ${
          isMobileLayout
            ? 'flex-col'
            : 'flex-row items-end justify-between'
        }`}
      >
        <div>
          <h1
            className={`font-display font-semibold tracking-tight text-slate-50 ${
              isMobileLayout ? 'text-xl font-bold text-white' : 'text-2xl'
            }`}
          >
            {t.index.title}
          </h1>
          <p
            className={`mt-1 ${
              isMobileLayout ? 'text-[13px] text-slate-300' : 'text-xs lg:text-sm text-slate-400'
            }`}
          >
            {t.index.subtitle}
          </p>
        </div>

        <div className={`flex flex-wrap items-center ${isMobileLayout ? 'gap-2' : 'gap-2.5'}`}>
          <div className={`relative ${isMobileLayout ? 'w-full' : ''}`}>
            <Search
              className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                isMobileLayout ? 'text-slate-400' : 'text-slate-500'
              }`}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.index.searchPlaceholder}
              aria-label={t.index.searchPlaceholder}
              className={`rounded-lg border py-2 pl-9 pr-3 text-sm focus:border-cyan-400 focus:outline-none ${
                isMobileLayout
                  ? 'w-full border-slate-700 bg-[#121824] text-white placeholder:text-slate-400'
                  : 'w-48 lg:w-56 border-slate-800 bg-[#10151E] text-slate-100 placeholder:text-slate-500'
              }`}
            />
          </div>

          <select
            value={metallicFilter}
            onChange={(e) => setMetallicFilter(e.target.value as MetallicType | 'all')}
            aria-label={m.allTypes}
            className={`rounded-lg border px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none ${
              isMobileLayout
                ? 'flex-1 min-w-[140px] border-slate-700 bg-[#121824] text-slate-100'
                : 'border-slate-800 bg-[#10151E] text-slate-200'
            }`}
          >
            <option value="all">{m.allTypes}</option>
            <option value="metal">{m.metals}</option>
            <option value="nonmetal">{m.nonmetals}</option>
            <option value="metalloid">{m.metalloids}</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ElementCategory | 'all')}
            aria-label={t.index.colCategory}
            className={`rounded-lg border px-3 py-2 text-sm focus:border-cyan-400 focus:outline-none ${
              isMobileLayout
                ? 'flex-1 min-w-[140px] border-slate-700 bg-[#121824] text-slate-100'
                : 'border-slate-800 bg-[#10151E] text-slate-200'
            }`}
          >
            <option value="all">{t.index.allCategories}</option>
            {(Object.keys(CATEGORY_META) as ElementCategory[]).map((catKey) => (
              <option key={catKey} value={catKey}>
                {t.categories[catKey].label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={toggleAllFiltered}
            disabled={filtered.length === 0}
            className={`rounded-lg border px-3.5 py-2 text-xs font-semibold disabled:opacity-40 transition-colors whitespace-nowrap shrink-0 ${
              isMobileLayout
                ? 'border-slate-700 bg-[#162030] text-slate-100 hover:bg-[#1E2B40]'
                : 'border-slate-700/80 bg-[#161D2A] text-slate-200 hover:bg-slate-800'
            }`}
          >
            {allFilteredSelected ? t.index.deselectShown : t.index.selectShown(filtered.length)}
          </button>

          {selectedNumbers.size > 0 && (
            <button
              type="button"
              onClick={onStartQuiz}
              className="rounded-lg bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-300 transition-colors whitespace-nowrap shrink-0 tabular-nums"
            >
              {t.index.quizSelected(selectedNumbers.size)}
            </button>
          )}
        </div>
      </div>

      {isMobileLayout ? (
        <div className="space-y-3">
          {/* Mobile Sort Controls */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-700/80 bg-[#101622] p-2">
            {(
              [
                { key: 'number', label: '#' },
                { key: 'symbol', label: t.index.colSymbol },
                { key: 'name', label: t.index.colName },
                { key: 'metallic', label: m.colType },
                { key: 'period', label: m.colPeriod },
                { key: 'group', label: m.colGroup },
              ] as const
            ).map((opt) => {
              const active = sortKey === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleSort(opt.key)}
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-100'
                      : 'border-slate-800 bg-[#0B0F17] text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  <ArrowUpDown className="h-3 w-3 opacity-80" />
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-slate-700/80 bg-[#121824] px-4 py-10 text-center text-sm text-slate-300">
              {t.index.noMatches(query)}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((el) => {
                const isSelected = selectedNumbers.has(el.number);
                const cat = CATEGORY_META[el.category];
                const metallicType = getMetallicType(el.category);
                return (
                  <button
                    key={el.number}
                    type="button"
                    onClick={() => onToggleElement(el.number)}
                    aria-pressed={isSelected}
                    className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                      isSelected
                        ? 'border-cyan-400/75 bg-cyan-950/30 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.2)]'
                        : 'border-slate-700/80 bg-[#121824] hover:border-slate-600 hover:bg-[#172030]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`inline-flex h-5 w-5 items-center justify-center rounded border shrink-0 transition-colors ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                              : 'border-slate-600 bg-[#080B10] text-transparent'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        </span>
                        <span className="font-mono text-xs font-semibold text-cyan-300 tabular-nums shrink-0">
                          #{el.number}
                        </span>
                        <span className={`font-display text-2xl font-bold shrink-0 ${cat.accentText}`}>
                          {el.symbol}
                        </span>
                        <span className="text-base font-bold text-white truncate">
                          {getElementName(el, language)}
                        </span>
                      </div>

                      <span className="font-mono text-xs font-medium text-slate-200 tabular-nums shrink-0">
                        {el.atomicMass} u
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 pl-8 text-xs">
                      <span className={`font-semibold ${metallicTextClass(metallicType)}`}>
                        {m.labels[metallicType]}
                      </span>
                      <span aria-hidden="true" className="text-slate-500">·</span>
                      <span className={`font-medium ${cat.accentText}`}>
                        {t.categories[el.category].label}
                      </span>
                      <span aria-hidden="true" className="text-slate-500">·</span>
                      <span className="text-slate-200 font-mono tabular-nums">
                        {t.table.periodLabel(el.period)} · {t.table.groupLabel(getCasGroupLabel(el.group))}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-[#10151E]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-[#0C1017] text-xs font-medium text-slate-400">
                  <th className="w-11 px-3 py-2.5 text-center">{t.index.colDeck}</th>
                  <th className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => handleSort('number')}
                      className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors"
                    >
                      <span>#</span>
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => handleSort('symbol')}
                      className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors"
                    >
                      <span>{t.index.colSymbol}</span>
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors"
                    >
                      <span>{t.index.colName}</span>
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => handleSort('metallic')}
                      className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors"
                    >
                      <span>{m.colType}</span>
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="px-3 py-2.5">{t.index.colCategory}</th>
                  <th className="px-2.5 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleSort('period')}
                      className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors"
                    >
                      <span>{m.colPeriod}</span>
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="px-2.5 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleSort('group')}
                      className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors"
                    >
                      <span>{m.colGroup}</span>
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="px-3 py-2.5 text-right">{t.index.colMass}</th>
                  <th className="px-3 py-2.5 hidden xl:table-cell">{t.index.colConfig}</th>
                  <th className="px-3 py-2.5 hidden lg:table-cell">{t.index.colState}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-10 text-center text-slate-400">
                      {t.index.noMatches(query)}
                    </td>
                  </tr>
                ) : (
                  filtered.map((el) => {
                    const isSelected = selectedNumbers.has(el.number);
                    const cat = CATEGORY_META[el.category];
                    const metallicType = getMetallicType(el.category);
                    return (
                      <tr
                        key={el.number}
                        onClick={() => onToggleElement(el.number)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-cyan-950/25 hover:bg-cyan-950/35'
                            : 'hover:bg-[#161D2A]/70'
                        }`}
                      >
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`inline-flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                              isSelected
                                ? 'border-cyan-400 bg-cyan-400 text-slate-950'
                                : 'border-slate-700 bg-[#080B10] text-transparent'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-slate-400 tabular-nums">
                          {el.number}
                        </td>
                        <td className="px-3 py-2 font-display text-base font-bold text-slate-50">
                          {el.symbol}
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-100">
                          {getElementName(el, language)}
                        </td>
                        <td className={`px-3 py-2 text-xs font-medium ${metallicTextClass(metallicType)}`}>
                          {m.labels[metallicType]}
                        </td>
                        <td className={`px-3 py-2 text-xs ${cat.accentText}`}>
                          {t.categories[el.category].label}
                        </td>
                        <td className="px-2.5 py-2 text-center font-mono text-xs text-slate-300 tabular-nums">
                          {el.period}
                        </td>
                        <td className="px-2.5 py-2 text-center font-mono text-xs text-slate-300 tabular-nums">
                          {getCasGroupLabel(el.group)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-xs text-slate-300 tabular-nums">
                          {el.atomicMass}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-slate-400 hidden xl:table-cell">
                          {el.electronConfig}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-400 hidden lg:table-cell">
                          {t.states[el.state]}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
