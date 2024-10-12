import React, { useState } from 'react';
import { File, Table } from 'lucide-react';
import { Button } from "~/components/ui/button";
import { useRouter } from 'next/navigation';

const FilesAction: React.FC = () => {
    const router = useRouter();
    const onRedirect = () => {
        router.push('/admin/files');
    };

    return (
        <Button
            variant="outline"
            size="icon"
            className="w-10 h-10 rounded-full shadow-lg transition-all duration-300 ease-in-out bg-primary text-white hover:text-white bg-blue-500 hover:bg-blue-500 hover:scale-110"
            onClick={onRedirect}
        >
            <File className="h-5 w-5" />
        </Button>
    );
};

export default FilesAction;