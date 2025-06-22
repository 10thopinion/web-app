"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Stethoscope,
  Shield,
  AlertTriangle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Microscope,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useExpandable } from "@/hooks/use-expandable";
import { AgentOpinion } from "@/types/medical";
import { Mascot } from "@/components/mascot";

interface AgentOpinionCardProps {
  opinion: AgentOpinion;
  agentNumber: number;
  onAskAboutOpinion: (opinion: AgentOpinion) => void;
}

const agentIcons: Record<string, React.ElementType> = {
  "Pattern Recognition": Brain,
  "Differential Diagnosis": Microscope,
  "Rare Disease Specialist": Eye,
  "Holistic Assessment": Stethoscope,
  "Consensus Builder": Shield,
  "Devil's Advocate": AlertTriangle,
  "Evidence Validator": CheckCircle,
  "Hallucination Detector": XCircle,
  "Bias Auditor": Shield,
  "Final Authority": Brain,
};

const getAgentColor = (agentType: string) => {
  switch (agentType) {
    case 'blind':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    case 'informed':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
    case 'scrutinizer':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
    case 'final':
      return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
  }
};

export function AgentOpinionCard({
  opinion,
  agentNumber,
  onAskAboutOpinion,
}: AgentOpinionCardProps) {
  const { isExpanded, toggleExpand, animatedHeight } = useExpandable();
  const contentRef = useRef<HTMLDivElement>(null);
  const Icon = agentIcons[opinion.specialization] || Brain;

  useEffect(() => {
    if (contentRef.current) {
      animatedHeight.set(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, animatedHeight]);

  const handleAskAboutOpinion = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAskAboutOpinion(opinion);
  };

  return (
    <Card
      className="w-full cursor-pointer transition-all duration-300 hover:shadow-lg"
      onClick={toggleExpand}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start w-full">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <Mascot
                variant={agentNumber as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}
                size="sm"
                animate={false}
              />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{opinion.agentName}</h3>
                <Badge 
                  variant="secondary" 
                  className={getAgentColor(opinion.agentType)}
                >
                  {opinion.agentType}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {opinion.specialization}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAskAboutOpinion}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ask about this opinion</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="text-muted-foreground">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Primary diagnosis and confidence - always visible */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Primary Diagnosis</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(opinion.confidence * 100)}% confidence
              </span>
            </div>
            <div className="space-y-1">
              <Progress value={opinion.confidence * 100} className="h-2" />
              <p className="text-sm font-medium">{opinion.diagnosis[0]}</p>
              {opinion.diagnosis.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  + {opinion.diagnosis.length - 1} alternative{opinion.diagnosis.length > 2 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Expandable content */}
          <motion.div
            style={{ height: animatedHeight }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div ref={contentRef}>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 pt-2"
                  >
                    {/* Full diagnosis list */}
                    {opinion.diagnosis.length > 1 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">All Diagnoses</h4>
                        <ul className="space-y-1">
                          {opinion.diagnosis.map((diag, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              {index + 1}. {diag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Reasoning */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Reasoning</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {opinion.reasoning}
                      </p>
                    </div>

                    {/* Red flags */}
                    {opinion.redFlags && opinion.redFlags.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                          Red Flags
                        </h4>
                        <ul className="space-y-1">
                          {opinion.redFlags.map((flag, index) => (
                            <li
                              key={index}
                              className="text-sm text-orange-600 dark:text-orange-400"
                            >
                              • {flag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {opinion.recommendations && opinion.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Recommendations</h4>
                        <ul className="space-y-1">
                          {opinion.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              • {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Ask button - prominent when expanded */}
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleAskAboutOpinion}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Ask about {opinion.agentName}&apos;s opinion
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}