'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export default function SimpleTemplateEditor({ 
  template, 
  imageUrl, 
  onSave 
}) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Preview */}
      <div className="bg-gray-100 rounded-xl p-8 aspect-square flex items-center justify-center">
        <div className="text-center">
          <img src={imageUrl} alt="Product" className="max-h-64 mb-4" />
          {title && <h3 className="text-2xl font-bold mb-2">{title}</h3>}
          {text && <p className="text-gray-700">{text}</p>}
        </div>
      </div>

      {/* Editor */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold">
          Edit {template.name} Template
        </h3>

        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title..."
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Enter description..."
          />
        </div>

        <Button onClick={() => onSave({ title, text })} className="w-full">
          Save Template
        </Button>
      </div>
    </div>
  );
}