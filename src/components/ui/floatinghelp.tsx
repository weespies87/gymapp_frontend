import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Settings, Dumbbell } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";

interface Position {
    x: number;
    y: number;
}

type AIState = 'on' | 'off';

export default function FloatingHelp() {
    const [position, setPosition] = useState<Position>({ x: 100, y: 100 });
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
    const [aiState, setAiState] = useState<AIState>('off');
    const elementRef = useRef<HTMLDivElement>(null);

    const fetchAISuggestion = async () => {
        try {
            const response = await fetch(`/api/GetSuggestedRoutines`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) {
                throw new Error("Failed to get workouts");
            }
            const data = await response.json();
            console.log("Set ready status success:", data);
        } catch (error) {
            console.error("Error setting status:", error);
        }
    };

    // Keep element within viewport bounds
    const constrainPosition = (newPosition: Position): Position => {
        const element = elementRef.current;
        if (!element) return newPosition;

        const rect = element.getBoundingClientRect();
        const padding = 10; // Distance from edge
        
        const maxX = window.innerWidth - rect.width - padding;
        const maxY = window.innerHeight - rect.height - padding;
        
        return {
            x: Math.max(padding, Math.min(newPosition.x, maxX)),
            y: Math.max(padding, Math.min(newPosition.y, maxY))
        };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        e.preventDefault();
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            e.preventDefault();
            const newPosition = {
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            };
            setPosition(constrainPosition(newPosition));
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            const newPosition = {
                x: touch.clientX - dragStart.x,
                y: touch.clientY - dragStart.y
            };
            setPosition(constrainPosition(newPosition));
        }
    };

    const handleEnd = () => {
        setIsDragging(false);
    };

    // windw resizin
    const handleResize = () => {
        setPosition(prevPosition => constrainPosition(prevPosition));
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, dragStart]);

    // resize listener 
    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPosition(prevPosition => constrainPosition(prevPosition));
        }, 100); // Small delay to ensure element is rendered
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            ref={elementRef}
            className="fixed bg-white rounded-lg shadow-lg cursor-move z-50 select-none"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="leading-none font-medium">AI Assistant</h4>
                            <p className="text-muted-foreground text-sm">
                                Toggle AI suggestions and get workout recommendations.
                            </p>
                        </div>
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="ai-toggle">AI Auto Suggestions</Label>
                                <ToggleGroup
                                    type="single"
                                    value={aiState}
                                    onValueChange={(value) => setAiState(value as AIState)}
                                    className="justify-end"
                                >
                                    <ToggleGroupItem value="off" size="sm">
                                        Off
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="on" size="sm">
                                        On
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                            
                                <Button 
                                    onClick={fetchAISuggestion}
                                    className="w-full bg-[#7F96FF] hover:bg-[#320E3B]"
                                >
                                    <Dumbbell className="h-4 w-4 mr-2" />
                                    Get Workout Suggestion
                                </Button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}