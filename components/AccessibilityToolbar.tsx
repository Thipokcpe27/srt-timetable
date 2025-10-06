'use client';

import { useState, useEffect } from 'react';
import { Type, Palette, RotateCcw } from 'lucide-react';

type FontSize = 'normal' | 'large' | 'x-large';
type ColorMode = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'high-contrast';

export default function AccessibilityToolbar() {
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [colorMode, setColorMode] = useState<ColorMode>('normal');
  const [srAnnouncement, setSrAnnouncement] = useState('');

  const announceToScreenReader = (message: string) => {
    setSrAnnouncement(message);
    setTimeout(() => setSrAnnouncement(''), 1000);
  };

  useEffect(() => {
    // Load saved preferences
    const savedFontSize = localStorage.getItem('fontSize') as FontSize;
    const savedColorMode = localStorage.getItem('colorMode') as ColorMode;

    if (savedFontSize) {
      setFontSize(savedFontSize);
      applyFontSize(savedFontSize);
    }
    if (savedColorMode) {
      setColorMode(savedColorMode);
      applyColorMode(savedColorMode);
    }
  }, []);

  const applyFontSize = (size: FontSize) => {
    document.documentElement.classList.remove('font-normal', 'font-large', 'font-x-large');
    document.documentElement.classList.add(`font-${size}`);
  };

  const applyColorMode = (mode: ColorMode) => {
    document.documentElement.classList.remove(
      'color-normal',
      'color-protanopia',
      'color-deuteranopia',
      'color-tritanopia',
      'color-high-contrast'
    );
    document.documentElement.classList.add(`color-${mode}`);
  };

  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size);
    applyFontSize(size);
    localStorage.setItem('fontSize', size);

    // Announce change to screen readers
    const sizeLabel = size === 'normal' ? 'ปกติ' : size === 'large' ? 'ใหญ่' : 'ใหญ่มาก';
    announceToScreenReader(`เปลี่ยนขนาดตัวอักษรเป็น ${sizeLabel}`);
  };

  const handleColorModeChange = (mode: ColorMode) => {
    setColorMode(mode);
    applyColorMode(mode);
    localStorage.setItem('colorMode', mode);

    // Announce change to screen readers
    announceToScreenReader(`เปลี่ยนโหมดสีเป็น ${getColorModeLabel(mode)}`);
  };

  const getColorModeLabel = (mode: ColorMode) => {
    switch (mode) {
      case 'normal': return 'ปกติ';
      case 'protanopia': return 'แดง-เขียว';
      case 'deuteranopia': return 'เขียว-แดง';
      case 'tritanopia': return 'น้ำเงิน-เหลือง';
      case 'high-contrast': return 'ความคมชัด';
    }
  };

  const resetSettings = () => {
    setFontSize('normal');
    setColorMode('normal');
    applyFontSize('normal');
    applyColorMode('normal');
    localStorage.removeItem('fontSize');
    localStorage.removeItem('colorMode');
    announceToScreenReader('รีเซ็ตการตั้งค่าการเข้าถึงเป็นค่าเริ่มต้น');
  };

  const cycleFontSize = () => {
    const sizes: FontSize[] = ['normal', 'large', 'x-large'];
    const currentIndex = sizes.indexOf(fontSize);
    const nextSize = sizes[(currentIndex + 1) % sizes.length];
    handleFontSizeChange(nextSize);
  };

  const cycleColorMode = () => {
    const modes: ColorMode[] = ['normal', 'protanopia', 'deuteranopia', 'tritanopia', 'high-contrast'];
    const currentIndex = modes.indexOf(colorMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    handleColorModeChange(nextMode);
  };

  const getFontSizeLabel = () => {
    switch (fontSize) {
      case 'normal': return 'A';
      case 'large': return 'A+';
      case 'x-large': return 'A++';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Screen reader announcement area */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {srAnnouncement}
      </div>

      {/* Font Size Button */}
      <button
        onClick={cycleFontSize}
        aria-label={`ขนาดตัวอักษร: ${fontSize === 'normal' ? 'ปกติ' : fontSize === 'large' ? 'ใหญ่' : 'ใหญ่มาก'} - กดเพื่อเปลี่ยน`}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 hover:bg-white transition-all border border-gray-200 shadow-sm"
        title={`ขนาดตัวอักษร: ${fontSize === 'normal' ? 'ปกติ' : fontSize === 'large' ? 'ใหญ่' : 'ใหญ่มาก'}`}
      >
        <Type className="w-5 h-5 text-gray-700" aria-hidden="true" />
        <span className="text-sm font-bold text-gray-700">{getFontSizeLabel()}</span>
      </button>

      {/* Color Mode Button */}
      <button
        onClick={cycleColorMode}
        aria-label={`โหมดสี: ${getColorModeLabel(colorMode)} - กดเพื่อเปลี่ยน`}
        aria-describedby="color-mode-desc"
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 hover:bg-white transition-all border border-gray-200 shadow-sm"
        title={`โหมดสี: ${getColorModeLabel(colorMode)}`}
      >
        <Palette className="w-5 h-5 text-gray-700" aria-hidden="true" />
        <span className="text-xs font-semibold text-gray-700 hidden md:inline">{getColorModeLabel(colorMode)}</span>
        <span id="color-mode-desc" className="sr-only">
          เปลี่ยนโหมดสีสำหรับผู้มีปัญหาการมองเห็นสี รวมถึงโหมดความคมชัดสูง
        </span>
      </button>

      {/* Reset Button */}
      {(fontSize !== 'normal' || colorMode !== 'normal') && (
        <button
          onClick={resetSettings}
          aria-label="รีเซ็ตการตั้งค่าการเข้าถึง"
          className="flex items-center gap-1 px-2 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all border border-gray-200"
          title="รีเซ็ตการตั้งค่า"
        >
          <RotateCcw className="w-4 h-4 text-gray-700" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
