'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <FastLink href="/sprint">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </FastLink>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Upload className="w-8 h-8 text-blue-600" />
            Import Sprint Data
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Upload your existing sprint data from JSON, CSV, or Excel files
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {uploadStatus.status === 'idle' && (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Drop your file here
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
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
                    <Button className="cursor-pointer">
                      Select File
                    </Button>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Supports JSON, CSV, and Excel files up to 5MB
                  </p>
                </>
              )}

              {uploadStatus.status === 'uploading' && (
                <>
                  <LoadingSpinner size="lg" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 mt-4">
                    Uploading...
                  </h3>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadStatus.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {uploadStatus.progress}%
                  </p>
                </>
              )}

              {uploadStatus.status === 'success' && (
                <>
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Upload Successful!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {uploadStatus.message}
                  </p>
                  <div className="space-x-2">
                    <Button onClick={() => setUploadStatus({ status: 'idle' })}>
                      Upload Another
                    </Button>
                    <FastLink href="/sprint">
                      <Button variant="outline">
                        View Sprints
                      </Button>
                    </FastLink>
                  </div>
                </>
              )}

              {uploadStatus.status === 'error' && (
                <>
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Upload Failed
                  </h3>
                  <p className="text-red-600 dark:text-red-400 mb-4">
                    {uploadStatus.message}
                  </p>
                  <Button onClick={() => setUploadStatus({ status: 'idle' })}>
                    Try Again
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help & Templates */}
        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Download a sample file format to see how your data should be structured.
              </p>
              <Button onClick={downloadTemplate} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download JSON Template
              </Button>
            </CardContent>
          </Card>

          {/* Supported Formats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Supported Formats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">JSON</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Structured data format
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">CSV</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Comma-separated values
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">Excel</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      .xlsx spreadsheet files
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>• Files must be under 5MB</p>
                <p>• Supported formats: JSON, CSV, Excel</p>
                <p>• Download the template for correct structure</p>
                <p>• Data includes sprints, tasks, and goals</p>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
