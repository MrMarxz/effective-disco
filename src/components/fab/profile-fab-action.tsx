import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { RefreshCw, UserIcon } from 'lucide-react';
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { type User, type Role } from '@prisma/client';
import { type CustomResponse } from '~/lib/types';
import toast from 'react-hot-toast';

interface ExtendedUser extends User {
    role: Role;
}

type ProfileFormData = {
    name: string;
    surname: string;
    email: string;
    affiliation: string;
    credentials: string;
};

const ProfileUpdateDialog: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState("")
    const form = useForm<ProfileFormData>({
        defaultValues: {
            name: '',
            surname: '',
            email: '',
            affiliation: '',
            credentials: '',
        },
    });

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            void fetchProfile();
        }
    };

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get<CustomResponse>('/api/getProfile');
            const data = response.data.data as ExtendedUser;
            const { id, roleId, role, ...formData } = data;
            form.reset({
                ...formData,
                affiliation: formData.affiliation ?? '',
                credentials: formData.credentials ?? '',
            });
        } catch (error) {
            console.error("Failed to fetch profile", error);
            // Implement proper error handling here
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: ProfileFormData) => {

        if (newPassword !== confirmPassword) {
            toast.error("Please make sure the passwords match.");
            return;
        }

        setIsLoading(true);
        try {
            const sendingData = {
                ...data,
                affiliation: data.affiliation ?? "No affiliation",
                credentials: data.credentials ?? "No credentials",
                ...(newPassword && { newPassword }),
                ...(confirmPassword && { confirmPassword }),
            }
            const res = await axios.post<CustomResponse>('/api/editProfile', sendingData);
            if (res.data.success === true) {
                toast.success("Profile updated successfully");
                handleOpenChange(false);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="w-10 h-10 rounded-full shadow-lg transition-all duration-300 ease-in-out bg-primary text-white hover:text-white bg-[#007F7F] hover:bg-[#007F7F] hover:scale-110"
                >
                    <UserIcon className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="surname"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Surname</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="email" disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="affiliation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Affiliation</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="credentials"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Credentials</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Change password */}
                            <div className="text-xl">Change Password</div>
                            <div className="text-sm">Leave the passwords empty if you do not want to change it.</div>
                            <Input
                                type="password"
                                placeholder="New password"
                                disabled={isLoading}
                                onChange={(e) => setNewPassword(e.target.value)}
                                value={newPassword}
                            />
                            <Input
                                type="password"
                                placeholder="Confirm new password"
                                disabled={isLoading}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                value={confirmPassword}
                            />

                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Updating..." : "Update Profile"}
                            </Button>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog >
    );
};

export default ProfileUpdateDialog;