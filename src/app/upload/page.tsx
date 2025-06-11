'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FastLink } from '@/components/ui/FastLink';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft,
  Download,
  HelpCircle
} from 'lucide-react';

interface UploadStatus {
  status: 'idle' | 'uploading' | 'success' | 'error';
  message?: string;
  progress?: number;
}

export default function UploadPage() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ status: 'idle' });
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.json', '.csv', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      setUploadStatus({
        status: 'error',
        message: 'Please upload a JSON, CSV, or Excel file.'
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus({
        status: 'error',
        message: 'File size must be less than 5MB.'
      });
      return;
    }

    setUploadStatus({ status: 'uploading', progress: 0 });

    try {
      // Simulate upload process
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadStatus({ status: 'uploading', progress: i });
      }

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadStatus({
        status: 'success',        message: `Successfully imported data from ${file.name}`
      });
    } catch {
      setUploadStatus({
        status: 'error',
        message: 'Failed to upload file. Please try again.'
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const downloadTemplate = () => {
    // In a real app, this would download an actual template file
    const template = {
      sprint: {
        name: "Example Sprint",
        startDate: "2024-01-15",
        endDate: "2024-01-29",
        goals: [
          "Complete project setup",
          "Implement core features"
        ]
      },
      tasks: [
        {
          title: "Setup development environment",
          description: "Install dependencies and configure tooling",
          priority: "high",
          status: "completed"
        },
        {
          title: "Design user interface",
          description: "Create wireframes and mockups",
          priority: "medium",
          status: "in-progress"
        }
      ]
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sprint-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 elevatr-animate-fade-in">
        <FastLink href="/sprint">
          <ElevatrButton variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </ElevatrButton>
        </FastLink>
        <div>
          <h1 className="text-3xl font-bold elevatr-gradient-text flex items-center gap-3">
            <Upload className="w-8 h-8 text-primary" />
            Import Sprint Data
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload your existing sprint data from JSON, CSV, or Excel files
          </p>
        </div>
      </div>      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <ElevatrCard variant="glass" className="p-4 elevatr-animate-fade-in elevatr-animate-delay-1">
          <div className="elevatr-card-header">
            <h2 className="text-xl font-semibold">Upload File</h2>
          </div>
          <div className="elevatr-card-content">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/10' 
                  : 'border-muted-foreground/25'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadStatus.status === 'idle' && (
                <>
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Drop your file here
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    or click to browse files
                  </p>
                  <input
                    type="file"
                    accept=".json,.csv,.xlsx"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <ElevatrButton variant="motivation" className="cursor-pointer">
                      Select File
                    </ElevatrButton>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports JSON, CSV, and Excel files up to 5MB
                  </p>
                </>
              )}              {uploadStatus.status === 'uploading' && (
                <>
                  <LoadingSpinner size="lg" />
                  <h3 className="text-lg font-medium mb-2 mt-4">
                    Uploading...
                  </h3>
                  <div className="w-full bg-muted rounded-full h-2 mt-4">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadStatus.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {uploadStatus.progress}%
                  </p>
                </>
              )}

              {uploadStatus.status === 'success' && (
                <>
                  <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Upload Successful!
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {uploadStatus.message}
                  </p>
                  <div className="space-x-2">
                    <ElevatrButton onClick={() => setUploadStatus({ status: 'idle' })}>
                      Upload Another
                    </ElevatrButton>
                    <FastLink href="/sprint">
                      <ElevatrButton variant="secondary">
                        View Sprints
                      </ElevatrButton>
                    </FastLink>
                  </div>
                </>
              )}

              {uploadStatus.status === 'error' && (
                <>
                  <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Upload Failed
                  </h3>
                  <p className="text-destructive mb-4">
                    {uploadStatus.message}
                  </p>
                  <ElevatrButton onClick={() => setUploadStatus({ status: 'idle' })}>
                    Try Again
                  </ElevatrButton>
                </>
              )}
            </div>
          </div>
        </ElevatrCard>        {/* Help & Templates */}
        <div className="space-y-6">
          {/* Template Download */}
          <ElevatrCard variant="glass" className="elevatr-animate-fade-in elevatr-animate-delay-2">
            <div className="elevatr-card-header">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Download Template
              </h2>
            </div>
            <div className="elevatr-card-content">
              <p className="text-muted-foreground mb-4">
                Download a sample file format to see how your data should be structured.
              </p>
              <ElevatrButton onClick={downloadTemplate} variant="secondary" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download JSON Template
              </ElevatrButton>
            </div>
          </ElevatrCard>          {/* Supported Formats */}
          <ElevatrCard variant="glass" className="elevatr-animate-fade-in elevatr-animate-delay-3">
            <div className="elevatr-card-header">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Supported Formats
              </h2>
            </div>
            <div className="elevatr-card-content">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">JSON</h4>
                    <p className="text-sm text-muted-foreground">
                      Structured data format
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-success/20 rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <h4 className="font-medium">CSV</h4>
                    <p className="text-sm text-muted-foreground">
                      Comma-separated values
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-badge/20 rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-badge" />
                  </div>
                  <div>
                    <h4 className="font-medium">Excel</h4>
                    <p className="text-sm text-muted-foreground">
                      .xlsx spreadsheet files
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ElevatrCard>          {/* Help */}
          <ElevatrCard variant="glass" className="elevatr-animate-fade-in elevatr-animate-delay-4">
            <div className="elevatr-card-header">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Need Help?
              </h2>
            </div>
            <div className="elevatr-card-content">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Files must be under 5MB</p>
                <p>• Supported formats: JSON, CSV, Excel</p>
                <p>• Download the template for correct structure</p>
                <p>• Data includes sprints, tasks, and goals</p>
              </div>
              <ElevatrButton variant="secondary" className="w-full mt-4">
                View Documentation
              </ElevatrButton>
            </div>
          </ElevatrCard>
        </div>
      </div>
    </div>
  );
}
