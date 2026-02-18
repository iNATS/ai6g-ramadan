import React, { useState, useRef } from 'react';
import { Upload, Users, Download, Sparkles, CheckCircle, Image as ImageIcon, X, Plus, RefreshCw, Trash2, FileText, Share2 } from 'lucide-react';
import { Button } from './components/Button';
import { Editor } from './components/Editor';
import { TextConfig, EmployeeCard } from './types';
import { generateCard, loadImage } from './utils/canvasUtils';

function App() {
  const [step, setStep] = useState<number>(1);
  const [templateImage, setTemplateImage] = useState<string | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [manualName, setManualName] = useState('');
  const [config, setConfig] = useState<TextConfig>({
    x: 0.5,
    y: 0.75, // Approximate position for the box in the provided image
    fontSize: 48,
    color: '#000000'
  });
  const [generatedCards, setGeneratedCards] = useState<EmployeeCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const namesFileInputRef = useRef<HTMLInputElement>(null);

  // Handle Template Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTemplateImage(event.target?.result as string);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  // Change existing image (reset to step 1)
  const handleChangeImage = () => {
    setTemplateImage(null);
    setStep(1);
    setGeneratedCards([]);
  };

  // Handle Names List Upload (Text or CSV)
  const handleNamesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        // Split by new line, filter empty
        const nameList = text.split(/\r?\n/).map(n => n.trim()).filter(n => n.length > 0);
        setNames(prev => [...prev, ...nameList]);
        // Reset input
        if (namesFileInputRef.current) {
          namesFileInputRef.current.value = '';
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle Manual Name Add
  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualName.trim()) {
      setNames(prev => [...prev, manualName.trim()]);
      setManualName('');
    }
  };

  // Remove a name from the list
  const removeName = (index: number) => {
    setNames(prev => prev.filter((_, i) => i !== index));
  };

  // Process Generation
  const handleGenerate = async () => {
    if (!templateImage || names.length === 0) return;
    
    setIsGenerating(true);
    setStep(3);
    
    // Initialize cards array
    const cards: EmployeeCard[] = names.map((name, index) => ({
      id: `card-${index}`,
      name,
      imageDataUrl: null,
      status: 'pending'
    }));
    
    setGeneratedCards(cards);

    try {
      const imgElement = await loadImage(templateImage);
      
      const newCards = [...cards];
      
      for (let i = 0; i < newCards.length; i++) {
        const card = newCards[i];
        card.status = 'generating';
        setGeneratedCards([...newCards]); // Update UI
        
        // Generate
        const dataUrl = await generateCard(imgElement, card.name, config);
        
        card.imageDataUrl = dataUrl;
        card.status = 'done';
        setGeneratedCards([...newCards]); // Update UI
      }
    } catch (error) {
      console.error("Error generating cards", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCard = (dataUrl: string, name: string) => {
    const link = document.createElement('a');
    link.download = `Ramadan-Card-${name}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleShare = async (dataUrl: string, name: string) => {
    if (!navigator.share) {
      alert('المشاركة غير مدعومة في هذا المتصفح. يرجى تحميل الصورة ثم مشاركتها يدوياً.');
      return;
    }

    try {
      // Convert Data URL to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `Ramadan-Card-${name}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'تهنئة رمضان',
          text: `بطاقة تهنئة للموظف: ${name}`,
        });
      } else {
        alert('مشاركة الملفات غير مدعومة في هذا الجهاز/المتصفح.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('حدث خطأ أثناء محاولة المشاركة.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-violet-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">بطاقات رمضان</h1>
              <p className="text-xs text-gray-500 font-medium tracking-widest">AI6G Generator</p>
            </div>
          </div>
          <div className="flex gap-2">
             <div className="hidden sm:flex items-center gap-1 text-sm font-medium text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
               <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse"></span>
               جاهز للاستخدام
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Step Indicators */}
        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-1/2 right-0 left-0 h-1 bg-gray-200 -z-10 rounded-full"></div>
          {[
            { id: 1, label: 'رفع التصميم', icon: ImageIcon },
            { id: 2, label: 'البيانات والإعداد', icon: Users },
            { id: 3, label: 'التصدير', icon: Download }
          ].map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2 bg-gray-50 px-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 
                ${step >= s.id ? 'bg-violet-600 border-violet-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}
              >
                <s.icon size={18} />
              </div>
              <span className={`text-sm font-medium ${step >= s.id ? 'text-violet-700' : 'text-gray-400'}`}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          
          {/* Step 1: Upload Template */}
          {step === 1 && (
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-6 shadow-sm">
              <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto text-violet-600">
                <ImageIcon size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">اختر تصميم البطاقة</h2>
                <p className="text-gray-500 mt-2">يرجى رفع صورة التصميم المرفقة في الطلب للبدء</p>
              </div>
              
              <div className="flex justify-center">
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <div className="flex items-center gap-2 px-8 py-4 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 hover:shadow-violet-300 font-bold text-lg">
                    <Upload size={20} />
                    رفع الصورة
                  </div>
                </label>
              </div>
              
              <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-sm text-yellow-800 inline-block text-right">
                💡 نصيحة: استخدم صورة عالية الجودة بصيغة PNG أو JPG للحصول على أفضل النتائج.
              </div>
            </div>
          )}

          {/* Step 2: Configure & Data */}
          {step === 2 && templateImage && (
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Left Column: Visual Editor */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-violet-600" />
                      معاينة وضبط المكان
                    </h3>
                    <button 
                      onClick={handleChangeImage}
                      className="text-sm text-violet-600 hover:text-violet-800 hover:bg-violet-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-transparent hover:border-violet-100"
                    >
                      <RefreshCw size={14} />
                      تغيير الصورة
                    </button>
                  </div>
                  <Editor 
                    imageSrc={templateImage} 
                    config={config} 
                    onConfigChange={setConfig} 
                  />
                </div>
              </div>

              {/* Right Column: Data Input */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-violet-600" />
                    إدارة الأسماء
                  </h3>

                  {/* Manual Entry */}
                  <form onSubmit={handleManualAdd} className="flex gap-2 mb-6">
                    <input
                      type="text"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="اكتب اسم الموظف..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!manualName.trim()}
                      className="bg-violet-600 text-white px-3 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="إضافة اسم"
                    >
                      <Plus size={20} />
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative flex py-2 items-center mb-6">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium">أو رفع ملف</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  {/* File Upload Button */}
                  <div className="mb-6">
                    <input
                      type="file"
                      accept=".txt,.csv"
                      onChange={handleNamesUpload}
                      className="hidden"
                      ref={namesFileInputRef}
                    />
                    <button 
                      onClick={() => namesFileInputRef.current?.click()}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-500 hover:text-violet-600 hover:bg-violet-50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <FileText size={18} />
                      <span>رفع ملف أسماء (TXT/CSV)</span>
                    </button>
                  </div>

                  {/* Names List */}
                  <div className="flex-1 min-h-0 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">القائمة ({names.length})</span>
                      {names.length > 0 && (
                        <button 
                          onClick={() => setNames([])} 
                          className="text-xs text-red-500 hover:text-red-700 hover:underline"
                        >
                          حذف الكل
                        </button>
                      )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto border border-gray-100 rounded-lg bg-gray-50 divide-y divide-gray-100 max-h-[300px]">
                      {names.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center text-sm">
                          <Users size={24} className="mb-2 opacity-20" />
                          <p>لا توجد أسماء مضافة حالياً</p>
                        </div>
                      ) : (
                        names.map((name, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-2 bg-white hover:bg-gray-50 group transition-colors">
                            <span className="text-sm text-gray-800 truncate pl-2">{name}</span>
                            <button 
                              onClick={() => removeName(i)}
                              className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                              aria-label="حذف الاسم"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Button fullWidth onClick={handleGenerate} disabled={isGenerating || names.length === 0}>
                      {isGenerating ? 'جاري الإنشاء...' : 'بدء الإنشاء الآن'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">البطاقات الجاهزة</h2>
                  <p className="text-gray-500 mt-1">تم إنشاء {generatedCards.filter(c => c.status === 'done').length} من {generatedCards.length} بطاقة</p>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setStep(2);
                    setGeneratedCards([]);
                  }}
                >
                  إنشاء مجموعة جديدة
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {generatedCards.map((card) => (
                  <div key={card.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm transition-all hover:shadow-md">
                    <div className="aspect-square bg-gray-100 relative group">
                      {card.status === 'done' && card.imageDataUrl ? (
                        <>
                          <img src={card.imageDataUrl} alt={card.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                             <button 
                               onClick={() => downloadCard(card.imageDataUrl!, card.name)}
                               className="bg-white text-gray-900 px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-1.5 hover:bg-gray-100 transition-colors"
                             >
                               <Download size={16} />
                               تحميل
                             </button>
                             <button 
                               onClick={() => handleShare(card.imageDataUrl!, card.name)}
                               className="bg-violet-600 text-white px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-1.5 hover:bg-violet-700 transition-colors"
                             >
                               <Share2 size={16} />
                               مشاركة
                             </button>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 truncate">{card.name}</h3>
                      {card.status === 'done' && <CheckCircle className="text-green-500 w-5 h-5" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 text-sm">
        <p>Created by AI6G - Get your invitation for free</p>
      </footer>
    </div>
  );
}

export default App;