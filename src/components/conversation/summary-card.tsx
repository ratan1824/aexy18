"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, BarChart, Mic, BookOpen } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export interface SummaryProps {
    totalMessages: number;
    duration: number; // in seconds
    scores: {
      fluency: number;
      grammar: number;
      pronunciation: number;
    }
}

interface ConversationSummaryProps {
    summary: SummaryProps;
}

const ScoreItem = ({ icon, label, score }: { icon: React.ReactNode, label: string, score: number }) => (
    <div className="space-y-1">
        <div className="flex justify-between items-center text-sm font-medium">
            <div className="flex items-center gap-2 text-muted-foreground">
                {icon}
                <span>{label}</span>
            </div>
            <span className="font-bold text-foreground">{score}%</span>
        </div>
        <Progress value={score} className="h-2" />
    </div>
);

export function ConversationSummary({ summary }: ConversationSummaryProps) {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0">
            <Card className="w-full max-w-md animate-in zoom-in-95">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-2xl">
                        <Award className="text-accent" />
                        Conversation Summary
                    </CardTitle>
                    <CardDescription>Great work! Here's your performance breakdown.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center p-4 bg-secondary rounded-lg">
                        <div>
                            <p className="font-bold text-lg">{summary.totalMessages}</p>
                            <p className="text-sm text-muted-foreground">Messages</p>
                        </div>
                        <div>
                            <p className="font-bold text-lg">{(summary.duration / 60).toFixed(1)} min</p>
                            <p className="text-sm text-muted-foreground">Duration</p>
                        </div>
                    </div>
                    <div className="space-y-4 pt-4">
                        <ScoreItem icon={<BarChart className="h-4 w-4" />} label="Fluency" score={summary.scores.fluency} />
                        <ScoreItem icon={<BookOpen className="h-4 w-4" />} label="Grammar" score={summary.scores.grammar} />
                        <ScoreItem icon={<Mic className="h-4 w-4" />} label="Pronunciation" score={summary.scores.pronunciation} />
                    </div>
                     <Button asChild className="w-full mt-6">
                        <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
