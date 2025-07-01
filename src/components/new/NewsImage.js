import React from 'react';

function NewsImage({ image, name }) {
  if (!image) return null;

  return (
    <div className="mb-8">
      <img 
        src={image} 
        alt={name}
        className="w-full h-64 lg:h-96 object-cover rounded-lg"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    </div>
  );
}

export default NewsImage;
