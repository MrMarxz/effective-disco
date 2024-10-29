/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogTrigger } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Check, Eye, ListCollapse, Loader2, ThumbsUp } from "lucide-react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { type CustomResponse } from '~/lib/types';

interface FileData {
    id: string;
    status: string;
    url: string;
    size: number;
    type: string;
    name: string;
    comments?: string;
    reported: boolean;
    display: boolean;
    userId: string;
    metaData?: {
        subject: string;
        grade: number;
        tags: string[];
        rating: number;
        likes: number;
    };
}

interface FileDetailsDialogProps {
    fileId: string;
}

const FileDetailsDialog: React.FC<FileDetailsDialogProps> = ({ fileId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [hasLiked, setHasLiked] = useState(false);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const { register, handleSubmit, reset } = useForm<FileData>();

    useEffect(() => {
        const fetchFileData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get<CustomResponse>("/api/getFile", {
                    params: { id: fileId }
                });
                const data = response.data.data as FileData;
                setFileData(data);
                reset(data);
            } catch (error) {
                console.error('Error fetching file data:', error);
                toast.error('Failed to load file details');
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            void fetchFileData();
        }
    }, [fileId, isOpen, reset]);

    const handleLike = async () => {
        console.log("like")

        setIsLikeLoading(true);

        try {
            const response = await axios.put<CustomResponse>('/api/likeFile', { fileId });
            
            if (response.data.success === true) {
                setHasLiked(true);
                toast.success('File liked successfully');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error liking file:', error);
            toast.error('Failed to like file');
        } finally {
            setIsLikeLoading(false);
        }
    }

    const onSubmit = async (data: FileData) => {
        setIsSaving(true);
        try {
            const response = await axios.put<CustomResponse>('/api/editFileRecord', data);
            if (response.data.success === true) {
                window.location.reload();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error updating file data:', error);
            toast.error('Failed to update file details');
        } finally {
            setIsSaving(false);
        }
    };

    const formatFileSize = (size: number) => {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let i = 0;
        while (size >= 1024 && i < units.length - 1) {
            size /= 1024;
            i++;
        }
        return `${size.toFixed(2)} ${units[i]}`;
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button className="flex flex-row gap-x-2 h-[28px] rounded-full px-3 py-1 text-xs font-bold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200">
                    <ListCollapse className="h-4 w-4" />
                    Details
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-3xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex justify-between items-center w-full text-2xl font-bold text-gray-900">
                        {isEditing ? 'Edit File Details' : 'File Details'}
                        <div className="flex flex-row items-center gap-x-2">
                            {fileData?.url && (
                                <Button onClick={() => { window.open(fileData?.url, "_blank") }} className="bg-green-500 hover:bg-green-600 text-white rounded-full h-[30px]">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View File
                                </Button>
                            )}
                            <Button
                                className="rounded-full border border-green-300 hover:text-accent-foreground bg-green-200 hover:bg-green-300 w-[60px] text-xs text-black sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                                size="sm"
                                disabled={hasLiked}
                                onClick={handleLike}
                            >
                                <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            </Button>
                        </div>
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                    {isEditing ? 'Update the file details below' : 'View the file details below'}
                </AlertDialogDescription>
                <div className="mt-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : fileData ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Name</label>
                                    {isEditing ? (
                                        <Input {...register('name')} defaultValue={fileData.name} className="w-full" />
                                    ) : (
                                        <p className="text-gray-900">{fileData.name}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Type</label>
                                    <p className="text-gray-900">{fileData.type}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Size</label>
                                    <p className="text-gray-900">{formatFileSize(fileData.size)}</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Status</label>
                                    <p className="text-gray-900">{fileData.status}</p>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="block text-sm font-bold text-gray-700">Comments</label>
                                    {isEditing ? (
                                        <Textarea {...register('comments')} defaultValue={fileData.comments ?? ''} className="w-full" />
                                    ) : (
                                        <p className="text-gray-900">{fileData.comments ?? 'No comments'}</p>
                                    )}
                                </div>
                                {fileData.metaData && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700">Subject</label>
                                            {isEditing ? (
                                                <Input {...register('metaData.subject')} defaultValue={fileData.metaData.subject} className="w-full" />
                                            ) : (
                                                <p className="text-gray-900">{fileData.metaData.subject}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-700">Grade</label>
                                            {isEditing ? (
                                                <Input type="number" {...register('metaData.grade')} defaultValue={fileData.metaData.grade} className="w-full" />
                                            ) : (
                                                <p className="text-gray-900">{fileData.metaData.grade}</p>
                                            )}
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="block text-sm font-bold text-gray-700">Tags</label>
                                            {isEditing ? (
                                                <Input {...register('metaData.tags')} defaultValue={fileData.metaData.tags.join(', ')} className="w-full" />
                                            ) : (
                                                <p className="text-gray-900">{fileData.metaData.tags.join(', ')}</p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                            {isEditing && (
                                <div className="flex space-x-2">
                                    <Button type="submit" disabled={isSaving} className="bg-green-500 hover:bg-green-600 text-white">
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="mr-2 h-4 w-4" />
                                                Save
                                            </>
                                        )}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </form>
                    ) : (
                        <p className="text-center text-gray-500">No file data available</p>
                    )}
                </div>
                <AlertDialogFooter>
                    {!isEditing && !isLoading && (
                        <>
                            <Button onClick={() => setIsEditing(true)} className="bg-teal-500 hover:bg-green-600 text-white">
                                Edit
                            </Button>
                        </>
                    )}
                    <AlertDialogCancel>Close</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default FileDetailsDialog;