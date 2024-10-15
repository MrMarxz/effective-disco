"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "~/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Loader2 } from "lucide-react"
import { type FAQ } from '@prisma/client';
import { type CustomResponse } from '~/lib/types';

const FAQPage: React.FC = () => {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                const response = await axios.get<CustomResponse>('/api/getFAQ');
                const data = response.data.data as FAQ[];
                console.log('API response:', response.data.data); // Debug log
                if (data) {
                    setFaqs(data);
                }
            } catch (err) {
                console.error('Error fetching FAQs:', err);
                setError('Failed to fetch FAQs. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        void fetchFAQs();
    }, []);

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Frequently Asked Questions</h1>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-center text-gray-700">Have a question? Find your answer here!</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 p-4">{error}</div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full">
                            {faqs?.map((faq, index) => (
                                <AccordionItem key={index} value={index.toString()} className="border-b border-gray-200 last:border-b-0">
                                    <AccordionTrigger className="text-left font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-gray-600 pt-2 pb-4">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default FAQPage;