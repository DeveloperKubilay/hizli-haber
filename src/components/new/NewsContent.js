import React from 'react';
import ReactMarkdown from 'react-markdown';

function NewsContent({ news }) {
  const content = news.des || news.content || news.description || news.minides || 'İçerik mevcut değil.';
  
  return (
    <div className="prose prose-lg max-w-none mb-8">
      {/* Ayırıcı çizgi */}
      <div className="border-t-2 border-secondary/30 mb-6"></div>
      
      <div className="text-textPrimary leading-relaxed markdown-content">
        <ReactMarkdown 
          components={{
            // Markdown elementleri için özel stil
            // eslint-disable-next-line jsx-a11y/heading-has-content
            h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-textHeading mb-4" {...props} />,
            // eslint-disable-next-line jsx-a11y/heading-has-content
            h2: ({node, ...props}) => <h2 className="text-xl font-bold text-textHeading mb-3" {...props} />,
            // eslint-disable-next-line jsx-a11y/heading-has-content
            h3: ({node, ...props}) => <h3 className="text-lg font-bold text-textHeading mb-2" {...props} />,
            p: ({node, ...props}) => <p className="mb-4 text-textPrimary leading-relaxed" {...props} />,
            strong: ({node, ...props}) => <strong className="font-bold text-textHeading" {...props} />,
            em: ({node, ...props}) => <em className="italic" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />,
            li: ({node, ...props}) => <li className="text-textPrimary" {...props} />,
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-secondary pl-4 italic mb-4" {...props} />,
            // eslint-disable-next-line jsx-a11y/anchor-has-content
            a: ({node, ...props}) => <a className="text-secondary hover:underline" {...props} />,
            code: ({node, ...props}) => <code className="bg-primaryBG px-2 py-1 rounded text-sm" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default NewsContent;
