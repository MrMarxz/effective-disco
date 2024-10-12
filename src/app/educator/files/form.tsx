"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Input } from "~/components/ui/input";
import { Loader2, User, Users } from 'lucide-react';
import { type FileUploads } from '@prisma/client';


import { type CustomResponse } from '~/lib/types';
import toast from 'react-hot-toast';
import { useDebounce } from 'use-debounce';
import { Label } from '~/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select"
import EducatorFileCard from '~/components/educator/FileCard';

interface UserFilesPageProps {
    userId: string;
}

const UserFilesPage: React.FC<UserFilesPageProps> = ({ userId }) => {
    const [files, setFiles] = useState<FileUploads[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

    const searchFiles = useCallback(async (query: string) => {
        if (!query) {
            void handleOptionClick("all")
        }

        setIsLoading(true);
        try {
            const response = await axios.get<CustomResponse>('/api/searchFile', {
                params: { query }
            });
            const data = response.data.data as FileUploads[];
            if (data) setFiles(data);
        } catch (error) {
            console.error('Error searching files:', error);
            toast.error('Failed to search files. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleOptionClick = async (status: "all" | "pending" | "approved" | "rejected") => {

        setIsLoading(true);
        try {
            const response = await axios.get<CustomResponse>(`/api/getFilteredFiles?filter=${status}`);
            if (response.data.success === true) {
                const data = response.data.data as FileUploads[];
                if (data) setFiles(data);
            }
            else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error searching files:', error);
            toast.error('Failed to search files. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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

    useEffect(() => {
        void handleOptionClick("all")
    }, []);

    useEffect(() => {
        void searchFiles(debouncedSearchTerm);
    }, [debouncedSearchTerm, searchFiles]);

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold mb-6 text-white">JaKaMa</h1>

            <div className="flex items-center space-x-4">
                <Input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow"
                />


                <Label htmlFor="filter" className="text-white">Filter</Label>
                <Select name="filter" onValueChange={handleOptionClick}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select file status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all" onClick={() => handleOptionClick("all")}>
                            All Files
                        </SelectItem>
                        <SelectItem value="approved" onClick={() => handleOptionClick("approved")}>
                            Approved Files
                        </SelectItem>
                        <SelectItem value="rejected" onClick={() => handleOptionClick("rejected")}>
                            Rejected Files
                        </SelectItem>
                        <SelectItem value="pending" onClick={() => handleOptionClick("pending")}>
                            Pending Files
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
            ) : files.length > 0 ? (
                <EducatorFileCard
                    files={files}
                    onDownload={handleDownload}
                    onToggleDisplay={handleToggleDisplay}
                    onReport={handleReport}
                />
            ) : (
                <div className="text-center py-12">
                    <p className="text-xl text-white">No files found. Try uploading some!</p>
                </div>
            )}
        </div>
    );
};

export default UserFilesPage;
