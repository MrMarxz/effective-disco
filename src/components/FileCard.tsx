"use client";

import React from 'react';
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Download, AlertTriangle, Eye, EyeOff, File, Image, FilmIcon, Music, Archive, ListCollapse } from 'lucide-react';
import { FileUploadStatus, type FileUploads } from '@prisma/client';
import FileDetailsDialog from './details-dialog';


interface FileCardProps {
  files: FileUploads[];
  onDownload: (file: FileUploads) => void;
  onToggleDisplay: (file: FileUploads) => void;
  onReport: (file: FileUploads) => void;
}

const FileCard: React.FC<FileCardProps> = ({
  files,
  onDownload,
  onToggleDisplay,
  onReport,
}) => {
  const formatFileSize = (size: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let fileSize = size;

    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }

    return `${fileSize.toFixed(2)} ${units[unitIndex]}`;
  };

  const getStatusColor = (status: FileUploadStatus) => {
    switch (status) {
      case FileUploadStatus.PENDING:
        return 'bg-yellow-500';
      case FileUploadStatus.APPROVED:
        return 'bg-green-500';
      case FileUploadStatus.REJECTED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-12 w-12" />;
    if (type.startsWith('video/')) return <FilmIcon className="h-12 w-12" />;
    if (type.startsWith('audio/')) return <Music className="h-12 w-12" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-12 w-12" />;
    return <File className="h-12 w-12" />;
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <Card key={file.id} className="flex flex-col">
            <CardContent className="flex-grow p-4">
              <div className="flex items-center space-x-4">
                {getFileIcon(file.type)}
                <div className="w-full">
                  <div className="flex flex-row justify-between">
                    <h3 className="font-semibold text-lg truncate" title={file.name}>{file.name}</h3>
                    <FileDetailsDialog fileId={file.id} />
                  </div>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)} • {file.type}</p>
                </div>
              </div>
              <Badge className={`mt-2 ${getStatusColor(file.status)}`}>
                {file.status}
              </Badge>
            </CardContent>
            <CardFooter className="flex justify-between p-4 bg-gray-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(file)}
              >
                <Download className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleDisplay(file)}
              >
                {file.display ? (
                  <Eye className="h-4 w-4 mr-2" />
                ) : (
                  <EyeOff className="h-4 w-4 mr-2" />
                )}
                {file.display ? 'Hide' : 'Show'}
              </Button>
              {!file.reported && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReport(file)}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FileCard;