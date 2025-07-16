'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { Bold, Italic, Link, List, Quote, Code, Image as ImageIcon, Wand2, Loader2 } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { generateImage } from '@/ai/flows/image-generator';
import { useToast } from '@/hooks/use-toast';


marked.setOptions({
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
  breaks: true,
  gfm: true,
});

interface BlogEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const ImageInsertionDialog = ({ onInsertImage }: { onInsertImage: (url: string, alt: string) => void }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [imageAlt, setImageAlt] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState('');
    const { toast } = useToast();

    const handleGenerateImage = async () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        setGeneratedImageUrl('');
        try {
            const result = await generateImage(aiPrompt);
            setGeneratedImageUrl(result.imageDataUri);
            toast({
              title: "Image Generated!",
              description: "You can now insert this image. Note: It's a temporary data URL and won't be saved in the content.",
            });
        } catch (error) {
            console.error('Error generating image for blog content:', error);
            toast({ variant: 'destructive', title: 'Image Generation Failed' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleInsert = () => {
        const finalUrl = generatedImageUrl || imageUrl;
        if (finalUrl) {
            if (finalUrl.startsWith('data:image')) {
                toast({
                    variant: 'destructive',
                    title: 'Insertion Not Allowed',
                    description: 'Please use a hosted image URL. Base64 images cannot be embedded in the post content.',
                });
                return;
            }
            onInsertImage(finalUrl, imageAlt || aiPrompt || 'blog image');
        }
    };
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Insert Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium">From URL</label>
                    <div className="flex gap-2 mt-1">
                        <Input 
                            placeholder="Image URL (e.g., https://...)" 
                            value={imageUrl} 
                            onChange={(e) => {
                                setImageUrl(e.target.value);
                                setGeneratedImageUrl('');
                            }}
                        />
                        <Input 
                            placeholder="Alt text (description)" 
                            value={imageAlt}
                            onChange={(e) => setImageAlt(e.target.value)}
                        />
                    </div>
                </div>
                 <div className="text-center text-xs text-muted-foreground">OR</div>
                 <div>
                    <label className="text-sm font-medium">Generate with AI (for inspiration)</label>
                    <div className="flex gap-2 mt-1">
                        <Input 
                            placeholder="Describe the image you want..." 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                        />
                        <Button variant="outline" size="icon" onClick={handleGenerateImage} disabled={isGenerating} aria-label="Generate Image with AI">
                            {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 />}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Note: AI-generated images are for preview. You must upload them to a hosting service and use the public URL.</p>
                 </div>
                 
                {(isGenerating || generatedImageUrl) && (
                     <div className="w-full aspect-video relative bg-muted rounded-md flex items-center justify-center overflow-hidden">
                        {isGenerating ? (
                                <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                        ) : (
                            <Image src={generatedImageUrl} alt="Generated image preview" fill className="object-cover" />
                        )}
                    </div>
                )}

                 <Button onClick={handleInsert} disabled={!(imageUrl || generatedImageUrl)}>Insert Image</Button>
            </div>
        </DialogContent>
    )
}

const MarkdownToolbar = ({ textareaRef, onContentChange }: { textareaRef: React.RefObject<HTMLTextAreaElement>, onContentChange: (value: string) => void }) => {
  const [isImageDialogOpen, setImageDialogOpen] = useState(false);

  const insertText = (before: string, after: string = '', block: boolean = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let prefix = block && start > 0 && text[start - 1] !== '\n' ? '\n\n' : '';
    let suffix = after;
    
    const newText = `${text.substring(0, start)}${prefix}${before}${selectedText}${suffix}${text.substring(end)}`;
    
    textarea.value = newText;
    textarea.focus();

    if (selectedText) {
        textarea.selectionStart = start + prefix.length + before.length;
        textarea.selectionEnd = end + prefix.length + before.length;
    } else {
        textarea.selectionStart = start + prefix.length + before.length;
        textarea.selectionEnd = start + prefix.length + before.length;
    }


    onContentChange(newText);
  };
  
  const handleInsertImage = (url: string, alt: string) => {
    insertText(`![${alt}](${url})`, '', true);
    setImageDialogOpen(false);
  }

  const toolbarItems = [
    { icon: Bold, tooltip: 'Bold', action: () => insertText('**', '**') },
    { icon: Italic, tooltip: 'Italic', action: () => insertText('*', '*') },
    { icon: Quote, tooltip: 'Blockquote', action: () => insertText('> ', '', true) },
    { icon: List, tooltip: 'Unordered List', action: () => insertText('\n- ', '', true) },
    { icon: Code, tooltip: 'Code Block', action: () => insertText('\n```\n', '\n```\n', true) },
    { icon: Link, tooltip: 'Link', action: () => insertText('[', '](https://)') },
  ];

  return (
    <TooltipProvider delayDuration={100}>
        <div className="flex items-center gap-1 border-b p-2 bg-background rounded-t-md">
        {toolbarItems.map((item, index) => (
            <Tooltip key={index}>
                <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" onClick={item.action} className="h-8 w-8" aria-label={item.tooltip}>
                        <item.icon className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{item.tooltip}</p>
                </TooltipContent>
            </Tooltip>
        ))}
         <Dialog open={isImageDialogOpen} onOpenChange={setImageDialogOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Insert Image">
                            <ImageIcon className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Insert Image</p>
                </TooltipContent>
            </Tooltip>
            <ImageInsertionDialog onInsertImage={handleInsertImage} />
         </Dialog>
        </div>
    </TooltipProvider>
  );
};


export const BlogEditor: React.FC<BlogEditorProps> = ({ value, onChange }) => {
  const [content, setContent] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);
    onChange(newValue);
  };
  
  const handleToolbarChange = (newValue: string) => {
    setContent(newValue);
    onChange(newValue);
  };

  const renderedHtml = useMemo(() => {
    try {
      return marked.parse(content || '');
    } catch (error) {
      console.error("Markdown parsing error:", error);
      return "<p>Error parsing content.</p>";
    }
  }, [content]);


  return (
    <Card className="grid grid-cols-1 md:grid-cols-2 w-full border-0 shadow-none">
      <div className="flex flex-col">
        <MarkdownToolbar textareaRef={textareaRef} onContentChange={handleToolbarChange} />
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          className="w-full h-full min-h-[50vh] p-4 font-mono text-sm bg-background border rounded-b-md focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Write your post content here using Markdown..."
        />
      </div>

      <div className="hidden md:block border-t border-r border-b rounded-r-md bg-secondary/30">
        <div className="p-4 border-b bg-background rounded-tr-md">
            <h3 className="font-semibold text-sm text-muted-foreground">Live Preview</h3>
        </div>
        <div
          className="prose dark:prose-invert max-w-none p-4 h-full"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>
    </Card>
  );
};
