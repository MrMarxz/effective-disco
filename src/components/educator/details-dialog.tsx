/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogTrigger } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Check, Eye, ListCollapse, Loader2, X } from "lucide-react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { type CustomResponse } from '~/lib/types';
import { FileUploadStatus } from '@prisma/client';
import { Star } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select"
import { Label } from '../ui/label';

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

interface FileRatingSelectProps {
    onRatingChange: (rating: number) => void;
    defaultValue?: string;
}

interface FileDetailsDialogProps {
    fileId: string;
}

const EducatorFileDetailsDialog: React.FC<FileDetailsDialogProps> = ({ fileId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [defaultValue, setDefaultValue] = useState('3');

    const handleValueChange = (value: string) => {
        console.log(value);
        setDefaultValue(value);
    };

    useEffect(() => {
        const fetchFileData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get<CustomResponse>("/api/getFile", {
                    params: { id: fileId }
                });
                const data = response.data.data as FileData;
                console.log(data);
                setFileData(data);
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
    }, [fileId, isOpen]);

    const submitReview = async (status: "approved" | "rejected") => {

        // make sure rating is given and between 1 and 5
        if (!defaultValue) {
            toast.error("Please provide a rating for the file.");
            return;
        }

        const rating = parseInt(defaultValue);
        if (rating < 1 || rating > 5) {
            toast.error("Invalid rating. Please provide a rating between 1 and 5");
            return;
        }

        setIsSaving(true);
        try {
            const data = {
                fileId: fileId,
                rating: rating,
                status: status === "approved" ? FileUploadStatus.APPROVED : FileUploadStatus.REJECTED
            }
            const response = await axios.put<CustomResponse>('/api/rateFile', data);
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
                        File Details
                        <AlertDialogCancel className="outline-none border-none">
                            <X className="h-6 w-6" />
                        </AlertDialogCancel>
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogDescription>
                    View the file details below
                </AlertDialogDescription>
                <div className="mt-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : fileData ? (
                        <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
                            {fileData?.url && (
                                <Button onClick={() => { window.open(fileData?.url, "_blank") }} className="bg-green-500 hover:bg-green-600 text-white rounded-full h-[30px]">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View File
                                </Button>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem label="Name" value={fileData.name} />
                                <DetailItem label="Type" value={fileData.type} />
                                <DetailItem label="Size" value={formatFileSize(fileData.size)} />
                                <DetailItem label="Status" value={fileData.status} />
                                <DetailItem label="Comments" value={fileData.comments ?? 'No comments'} className="col-span-full" />

                                {/* Reported */}
                                <DetailItem label="Reported" value={fileData.reported ? 'Yes' : 'No'} />

                                {fileData.metaData && (
                                    <>
                                        <DetailItem label="Subject" value={fileData.metaData.subject} />
                                        <DetailItem label="Grade" value={fileData.metaData.grade} />
                                        <DetailItem
                                            label="Tags"
                                            value={fileData.metaData.tags.join(', ')}
                                            className="col-span-full"
                                        />
                                    </>
                                )}

                                {fileData.status === FileUploadStatus.PENDING && (
                                    <div>
                                        <Label htmlFor="rating">Rate this file</Label>
                                        <Select name="rating" onValueChange={handleValueChange} defaultValue={defaultValue}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Rate this file" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 3, 4, 5].map((rating) => (
                                                    <SelectItem key={rating} value={rating.toString()}>
                                                        <div className="flex items-center">
                                                            {[...Array(rating)].map((_, index) => (
                                                                <Star key={index} className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                                                            ))}
                                                            {[...Array(5 - rating)].map((_, index) => (
                                                                <Star key={index + rating} className="w-4 h-4 text-gray-300 mr-1" />
                                                            ))}
                                                            <span className="ml-2">{rating}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {(fileData.status !== FileUploadStatus.PENDING && fileData.metaData?.rating) && (
                                    <DetailItem label="Rating" value={fileData.metaData.rating} />
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">No file data available</p>
                    )}
                </div>
                <AlertDialogFooter>
                    {fileData?.status === FileUploadStatus.PENDING && (
                        <>
                            <Button
                                className="bg-green-500 w-full"
                                onClick={() => submitReview("approved")}
                                disabled={isSaving}
                            >
                                {isSaving && <Loader2 className="h-6 w-6 animate-spin mr-2" />}
                                Approve
                            </Button>
                            <Button
                                className="bg-red-500 w-full"
                                onClick={() => submitReview("rejected")}
                                disabled={isSaving}
                            >
                                {isSaving && <Loader2 className="h-6 w-6 animate-spin mr-2" />}
                                Reject
                            </Button>
                        </>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

interface DetailItemProps {
    label: string;
    value: string | number;
    className?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, className = '' }) => (
    <div className={`space-y-1 ${className}`}>
        <label className="block text-sm font-semibold text-gray-600">{label}</label>
        <p className="text-base text-gray-800 bg-gray-50 p-2 rounded">{value}</p>
    </div>
);

export default EducatorFileDetailsDialog;