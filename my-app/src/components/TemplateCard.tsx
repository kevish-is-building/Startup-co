"use client"

import { Download, FileText } from 'lucide-react';
import { Template } from '../lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from '../components/ui/badge';
import { jsPDF } from "jspdf";

interface TemplateCardProps {
  template: Template;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const handleDownload = () => {
    const doc = new jsPDF();
    
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxLineWidth = 170;
    const lineHeight = 7;
    let cursorY = margin;

    // Add title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    
    // Handle title wrapping if it's too long
    const titleLines = doc.splitTextToSize(template.title, maxLineWidth);
    titleLines.forEach((line: string) => {
        doc.text(line, margin, cursorY);
        cursorY += 10;
    });
    
    cursorY += 5; // Extra space after title
    
    // Add content
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    const splitText = doc.splitTextToSize(template.content, maxLineWidth);
    
    // Iterate through lines to handle pagination
    // splitText can be string or string[], force it to array if needed, though splitTextToSize usually returns array for long text
    const lines = Array.isArray(splitText) ? splitText : [splitText];

    lines.forEach((line: string) => {
      if (cursorY + lineHeight > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });
    
    doc.save(`${template.title.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{template.title}</CardTitle>
            <CardDescription className="mt-1">{template.description}</CardDescription>
          </div>
          <FileText className="h-8 w-8 text-teal-600" />
        </div>
      </CardHeader>
      
      <CardContent>
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          {template.category}
        </Badge>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleDownload}
          className="w-full gap-2 bg-teal-600 hover:bg-teal-700"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </CardFooter>
    </Card>
  );
}