import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Check, ChevronDown, Globe, Monitor, Search, Smartphone, X } from 'lucide-react';
import { getLayoutModeStrings } from '../i18n/metallicTranslations';
import {
  ALL_LANGUAGES,
  getLanguageMeta,
  getTranslations,
  SupportedLanguage,
} from '../i18n/translations';
import { LayoutMode } from '../types/element';

export type AppView = 'table' | 'flashcards' | 'index';

interface TopBarProps {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
  selectedCount: number;
  onStartQuiz: () => void;
  language: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  layoutMode: LayoutMode;
  onToggleLayoutMode: () => void;
  emptySelectionNotice?: boolean;
  onDismissEmptyNotice?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onChangeView,
  selectedCount,
  onStartQuiz,
  language,
  onChangeLanguage,
  layoutMode,
  onToggleLayoutMode,
  emptySelectionNotice = false,
  onDismissEmptyNotice,
}) => {
  const bundle = getTranslations(language);
  const t = bundle.nav;
  const tableText = bundle.table;
  const flashcardText = bundle.flashcards;
  const layoutText = getLayoutModeStrings(language);
  const activeLangMeta = getLanguageMeta(language);
  const isMobileLayout = layoutMode === 'mobile';

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [langQuery, setLangQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isLangOpen) return;
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 10);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLangOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLangOpen]);

  const filteredLanguages = useMemo(() => {
    const q = langQuery.trim().toLowerCase();
    if (!q) return ALL_LANGUAGES;
    return ALL_LANGUAGES.filter(
      (lang) =>
        lang.nativeName.toLowerCase().includes(q) ||
        lang.englishName.toLowerCase().includes(q) ||
        lang.id.toLowerCase().includes(q)
    );
  }, [langQuery]);

  const handleSelectLanguage = (langId: SupportedLanguage) => {
    onChangeLanguage(langId);
    setIsLangOpen(false);
    setLangQuery('');
  };

  const renderLanguagePicker = () => (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsLangOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isLangOpen}
        aria-label={t.languageLabel}
        title={t.languageLabel}
        className={`inline-flex items-center gap-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
          isMobileLayout
            ? 'border-cyan-400/45 bg-[#141C29] px-2.5 py-1.5 text-slate-50 shadow-sm shadow-black/40 hover:border-cyan-300/70 hover:bg-[#192334]'
            : 'border-slate-800 bg-[#10151E] px-3 py-1.5 gap-2 text-slate-200 hover:border-slate-700 hover:bg-[#161D2A]'
        }`}
      >
        <Globe className="h-3.5 w-3.5 text-cyan-300 shrink-0" aria-hidden="true" />
        <span className="max-w-[115px] truncate">
          {activeLangMeta.nativeName}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-300 transition-transform duration-150 shrink-0 ${
            isLangOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isLangOpen && (
        <div
          className={`absolute ${
            activeLangMeta.rtl ? 'left-0' : 'right-0'
          } mt-2 rounded-xl border border-slate-700/90 bg-[#111722] shadow-2xl overflow-hidden z-50 ${
            isMobileLayout ? 'w-[min(360px,calc(100vw-24px))]' : 'w-80'
          }`}
        >
          <div dir="ltr">
            {/* Search Input Inside Language Popover */}
            <div className="border-b border-slate-800/80 p-2.5">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={langQuery}
                  onChange={(e) => setLangQuery(e.target.value)}
                  placeholder={t.searchLanguagePlaceholder}
                  aria-label={t.searchLanguagePlaceholder}
                  className="w-full rounded-lg border border-slate-700 bg-[#080B10] py-1.5 pl-8 pr-7 text-xs text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
                />
                {langQuery && (
                  <button
                    type="button"
                    onClick={() => setLangQuery('')}
                    aria-label="Clear language search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Language List */}
            <ul
              role="listbox"
              aria-label={t.languageLabel}
              className="max-h-72 overflow-y-auto divide-y divide-slate-800/40 p-1"
            >
              {filteredLanguages.length === 0 ? (
                <li className="px-3 py-6 text-center text-xs text-slate-300">
                  {t.noLanguageResults}
                </li>
              ) : (
                filteredLanguages.map((lang) => {
                  const isActive = lang.id === language;
                  return (
                    <li key={lang.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => handleSelectLanguage(lang.id)}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-100'
                            : 'text-slate-100 hover:bg-[#182130]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate">
                            {lang.nativeName}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {lang.englishName}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-[10px] uppercase text-slate-400">
                            {lang.id}
                          </span>
                          {isActive && (
                            <Check className="h-3.5 w-3.5 text-cyan-400" />
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <header
      className={`sticky top-0 z-40 border-b border-slate-800/80 bg-[#080B10]/95 backdrop-blur-md ${
        isMobileLayout ? 'sm:rounded-t-2xl' : ''
      }`}
    >
      <div
        className={`mx-auto flex max-w-[1440px] items-center justify-between ${
          isMobileLayout ? 'h-12 gap-2 px-3' : 'h-14 gap-4 lg:gap-8 px-4 lg:px-6'
        }`}
      >
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => onChangeView('table')}
          className={`font-display font-bold tracking-tight text-slate-50 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded ${
            isMobileLayout ? 'text-lg' : 'text-lg'
          }`}
        >
          Elementa
        </button>

        {/* Zone 2: Concise single-line navigation links (PC row) */}
        {!isMobileLayout && (
          <nav className="flex items-center gap-4 lg:gap-6 text-sm font-medium" aria-label="Primary navigation">
            <button
              type="button"
              onClick={() => onChangeView('table')}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-t ${
                activeView === 'table'
                  ? 'border-cyan-400 text-slate-50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.periodicTable}
            </button>
            <button
              type="button"
              onClick={() => onChangeView('index')}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-t ${
                activeView === 'index'
                  ? 'border-cyan-400 text-slate-50'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.elementIndex}
            </button>
          </nav>
        )}

        {/* Zone 3: PC/Mobile Mode Switcher + Language Picker (PC) + Primary CTA */}
        <div className={`flex items-center min-w-0 ${isMobileLayout ? 'gap-2' : 'gap-2 lg:gap-2.5 shrink-0'}`}>
          <button
            type="button"
            onClick={onToggleLayoutMode}
            aria-pressed={isMobileLayout}
            aria-label={isMobileLayout ? layoutText.switchToPc : layoutText.switchToMobile}
            title={isMobileLayout ? layoutText.switchToPc : layoutText.switchToMobile}
            className={`inline-flex items-center gap-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              isMobileLayout
                ? 'border-slate-700 bg-[#141C29] px-2.5 py-1.5 text-slate-50 hover:border-cyan-400/60 hover:bg-[#192334]'
                : 'border-slate-800 bg-[#10151E] px-2.5 py-1.5 text-slate-200 hover:border-cyan-400/50 hover:bg-[#161D2A]'
            }`}
          >
            {isMobileLayout ? (
              <Smartphone className="h-3.5 w-3.5 text-cyan-300 shrink-0" aria-hidden="true" />
            ) : (
              <Monitor className="h-3.5 w-3.5 text-cyan-300 shrink-0" aria-hidden="true" />
            )}
            <span>{isMobileLayout ? layoutText.mobile : layoutText.pc}</span>
          </button>

          {!isMobileLayout && renderLanguagePicker()}

          {activeView === 'flashcards' ? (
            <button
              type="button"
              onClick={() => onChangeView('table')}
              className={`text-xs font-semibold text-slate-50 bg-[#161D2A] border border-slate-700/90 rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                isMobileLayout ? 'px-3 py-1.5 max-w-[185px] truncate' : 'px-3.5 py-1.5 shrink-0'
              }`}
            >
              {t.editSelection}
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartQuiz}
              className={`text-xs font-bold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors whitespace-nowrap tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B10] ${
                isMobileLayout ? 'px-3 py-1.5 max-w-[185px] truncate shadow-sm shadow-cyan-500/20' : 'px-3.5 py-1.5 shrink-0'
              }`}
            >
              {selectedCount > 0 ? t.startFlashcardsCount(selectedCount) : t.startFlashcards}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation + Visible Language Settings Row */}
      {isMobileLayout && (
        <div className="flex h-11 items-center justify-between gap-2 border-t border-slate-800/80 bg-[#0B1018] px-3">
          <nav
            className="flex items-center gap-3.5 min-w-0 flex-1 overflow-x-auto text-[13px] font-semibold"
            aria-label="Primary navigation"
          >
            <button
              type="button"
              onClick={() => onChangeView('table')}
              className={`whitespace-nowrap shrink-0 py-0.5 transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-t ${
                activeView === 'table'
                  ? 'border-cyan-400 text-white'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              {t.periodicTable}
            </button>
            <button
              type="button"
              onClick={() => onChangeView('index')}
              className={`whitespace-nowrap shrink-0 py-0.5 transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-t ${
                activeView === 'index'
                  ? 'border-cyan-400 text-white'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              {t.elementIndex}
            </button>
          </nav>

          {renderLanguagePicker()}
        </div>
      )}

      {emptySelectionNotice && (
        <div
          role="alert"
          aria-live="assertive"
          className="pointer-events-none absolute inset-x-0 top-full z-50 flex justify-center px-3 pt-2"
        >
          <div className="pointer-events-auto flex w-full max-w-md items-start gap-2.5 rounded-xl border border-amber-400/60 bg-[#1B160B]/95 px-3.5 py-2.5 text-amber-100 shadow-2xl shadow-black/70 backdrop-blur-md">
            <AlertCircle className="mt-0.5 h-4 w-4 text-amber-300 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-amber-200">
                {tableText.selectAtLeastOne}
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-amber-100/85">
                {flashcardText.emptyBody}
              </p>
            </div>
            {onDismissEmptyNotice && (
              <button
                type="button"
                onClick={onDismissEmptyNotice}
                aria-label="Dismiss notification"
                className="rounded p-0.5 text-amber-200/80 hover:bg-amber-400/15 hover:text-amber-100 transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
