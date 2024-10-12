/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { useController, useForm, type SubmitHandler } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import toast from 'react-hot-toast';
import { RefreshCw, Upload } from 'lucide-react';
import { CustomResponse } from '~/lib/types';

interface FormData {
    files: FileList;
    subject: string;
    grade: string;
    tags: string;
}

const FileUploadDialog: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { register, handleSubmit, reset, control } = useForm<FormData>();

    const { field: gradeField } = useController({
        name: 'grade',
        control,
        defaultValue: '',
    });

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const formData = new FormData();
        if (data.files?.[0]) {
            formData.append('files', data.files[0]);
        }
        formData.append('subject', data.subject);
        formData.append('grade', data.grade);

        console.log("Grade: ", data.grade);

        data.tags.split(',').forEach(tag => formData.append('tags', tag.trim()));

        setIsLoading(true);

        try {
            const res = await axios.post<CustomResponse>('/api/createFileRecord', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success === true) {
                toast.success('File uploaded successfully!');
                reset();
                setIsOpen(false);
                window.location.reload();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Error uploading file. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New File
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload File</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="files">File</Label>
                        <Input id="files" type="file" {...register('files')} required />
                    </div>
                    <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" {...register('subject')} required />
                    </div>
                    <div>
                        <Label htmlFor="grade">Grade</Label>
                        <Select onValueChange={gradeField.onChange} value={gradeField.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                                    <SelectItem key={grade} value={grade.toString()}>{grade}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input id="tags" {...register('tags')} />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <RefreshCw className="animate-spin h-4 w-4 mr-2" />}
                        Upload
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default FileUploadDialog;