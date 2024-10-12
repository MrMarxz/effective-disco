"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Loader2, RefreshCw, Upload, User, Users } from 'lucide-react';
import { type FileUploads } from '@prisma/client';
import FileCard from '~/components/FileCard';
import { type CustomResponse } from '~/lib/types';
import toast from 'react-hot-toast';
import FileUploadDialog from '~/components/upload-dialog';

interface UserFilesPageProps {
    userId: string;
}

const UserFilesPage: React.FC<UserFilesPageProps> = ({ userId }) => {
    const [isShowingUserFiles, setIsShowingUserFiles] = useState(true);
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
            setIsShowingUserFiles(true)
        }
    };

    const fetchCommunityFiles = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get<CustomResponse>('/api/getCommunityFiles');
            const data = response.data.data as FileUploads[];
            if (data) setFiles(data);
        } catch (error) {
            console.error('Error fetching community files:', error);
        } finally {
            setIsLoading(false);
            setIsShowingUserFiles(false);
        }
    }

    useEffect(() => {
        void fetchUserFiles();
    }, []);

    const handleDownload = (file: FileUploads) => {
        // Open the file in a new tab
        window.open(file.url, '_blank');

    };

    const handleToggleDisplay = async (file: FileUploads) => {
        try {
            await axios.post("/api/toggleVisibility", { fileId: file.id });
            setFiles(files.map(f => f.id === file.id ? { ...f, display: !f.display } : f));
            toast.success(`${file.name} is now ${file.display ? 'hidden' : 'visible'}.`);
        } catch (error) {
            console.error('Error toggling file display:', error);
            toast.error('Failed to update file visibility. Please try again.');
        }
    };

    const handleReport = async (file: FileUploads) => {
        try {
            await axios.post("/api/reportFile", { fileId: file.id });
            setFiles(files.map(f => f.id === file.id ? { ...f, reported: true } : f));
            toast.success(`File ${file.name} has been reported`);
        } catch (error) {
            console.error('Error reporting file:', error);
            toast.error('Failed to report file. Please try again.');
        }
    };

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold mb-6">All Files</h1>

            <div className="flex items-center space-x-4">
                <Input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow"
                />
                {!isShowingUserFiles ? (
                    <Button onClick={fetchUserFiles}>
                        <User className="h-4 w-4 mr-2" />
                        View My Files
                    </Button>
                ) : (
                    <Button onClick={fetchCommunityFiles}>
                        <Users className="h-4 w-4 mr-2" />
                        View Community Files
                    </Button>
                )}
                <FileUploadDialog />
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
