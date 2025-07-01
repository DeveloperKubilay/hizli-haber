import React from 'react';
import { Brain } from 'lucide-react';

function AIPanel({ 
  news,
  aiSummary,
  isLoadingAi,
  aiQuestion,
  setAiQuestion,
  aiAnswer,
  generateAiSummary,
  askAiQuestion
}) {
  return (
    <div className="bg-primary p-6 rounded-lg mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="text-secondary" size={24} />
        <h3 className="text-xl font-bold text-textHeading">AI Asistanı</h3>
      </div>
      
      <div className="space-y-4">
        {/* Özet oluştur */}
        <div>
          <button
            onClick={generateAiSummary}
            disabled={isLoadingAi}
            className="bg-secondary hover:bg-secondaryHover text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoadingAi ? 'Özet oluşturuluyor...' : 'Haberi Özetle'}
          </button>
          
          {aiSummary && (
            <div className="mt-4 p-4 bg-primaryBG rounded-lg">
              <h4 className="font-semibold text-textHeading mb-2">AI Özeti:</h4>
              <p className="text-textPrimary">{aiSummary}</p>
            </div>
          )}
        </div>

        {/* Soru sor */}
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="Bu haber hakkında bir soru sorun..."
              className="flex-1 px-4 py-2 bg-primaryBG text-textPrimary rounded-lg border border-primaryBG focus:border-secondary focus:outline-none"
            />
            <button
              onClick={askAiQuestion}
              disabled={isLoadingAi || !aiQuestion.trim()}
              className="bg-secondary hover:bg-secondaryHover text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              Sor
            </button>
          </div>
          
          {aiAnswer && (
            <div className="mt-4 p-4 bg-primaryBG rounded-lg">
              <h4 className="font-semibold text-textHeading mb-2">AI Cevabı:</h4>
              <p className="text-textPrimary">{aiAnswer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIPanel;
