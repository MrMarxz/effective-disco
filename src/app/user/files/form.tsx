"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Loader2, RefreshCw, Upload } from 'lucide-react';
import { type FileUploads } from '@prisma/client';
import FileCard from '~/components/FileCard';
import { type CustomResponse } from '~/lib/types';

interface UserFilesPageProps {
    userId: string;
}

const UserFilesPage: React.FC<UserFilesPageProps> = ({ userId }) => {
    const [files, setFiles] = useState<FileUploads[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUserFiles = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get<CustomResponse>(`/api/getUserFiles?userId=${userId}`);
            const data = response.data.data as FileUploads[];
            if (data) setFiles(data);
        } catch (error) {
            console.error('Error fetching user files:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchUserFiles();
    }, []);

    const handleDownload = (file: FileUploads) => {
        // Implement download logic here
        console.log('Downloading file:', file.name);
    };

    const handleToggleDisplay = async (file: FileUploads) => {
        try {
            await axios.put(`/api/toggleFileDisplay/${file.id}`, { display: !file.display });
            setFiles(files.map(f => f.id === file.id ? { ...f, display: !f.display } : f));
            // toast({
            //     title: file.display ? "File Hidden" : "File Visible",
            //     description: `${file.name} is now ${file.display ? 'hidden' : 'visible'}.`,
            // });
        } catch (error) {
            console.error('Error toggling file display:', error);
            // toast({
            //     title: "Error",
            //     description: "Failed to update file visibility. Please try again.",
            //     variant: "destructive",
            // });
        }
    };

    const handleReport = async (file: FileUploads) => {
        try {
            await axios.post(`/api/reportFile/${file.id}`);
            setFiles(files.map(f => f.id === file.id ? { ...f, reported: true } : f));
            // toast({
            //     title: "File Reported",
            //     description: `${file.name} has been reported.`,
            // });
        } catch (error) {
            console.error('Error reporting file:', error);
            // toast({
            //     title: "Error",
            //     description: "Failed to report file. Please try again.",
            //     variant: "destructive",
            // });
        }
    };

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold mb-6">Your Files</h1>

            <div className="flex items-center space-x-4">
                <Input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow"
                />
                <Button onClick={fetchUserFiles}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
                <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New File
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : filteredFiles.length > 0 ? (
                <FileCard
                    files={filteredFiles}
                    onDownload={handleDownload}
                    onToggleDisplay={handleToggleDisplay}
                    onReport={handleReport}
                />
            ) : (
                <div className="text-center py-12">
                    <p className="text-xl text-gray-500">No files found. Try uploading some!</p>
                </div>
            )}
        </div>
    );
};

export default UserFilesPage;
