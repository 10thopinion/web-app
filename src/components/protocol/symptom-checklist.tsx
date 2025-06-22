"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Search, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Activity,
  X
} from "lucide-react"
import { BODY_SYSTEMS, type SystemSymptom } from "@/types/symptom-checklist"
import "./symptom-checklist-overrides.css"

interface SymptomChecklistProps {
  selectedSymptoms: SystemSymptom[]
  onSymptomsChange: (symptoms: SystemSymptom[]) => void
}

export function SymptomChecklist({ selectedSymptoms, onSymptomsChange }: SymptomChecklistProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedSystems, setExpandedSystems] = useState<string[]>([])
  const [showSystemView, setShowSystemView] = useState(true)
  
  // Auto-expand systems that have selected symptoms
  useEffect(() => {
    const systemsWithSymptoms = BODY_SYSTEMS
      .filter(system => 
        system.symptoms.some(symptom => 
          selectedSymptoms.some(s => s.id === symptom.id)
        )
      )
      .map(system => system.id);
    
    setExpandedSystems(prev => [...new Set([...prev, ...systemsWithSymptoms])]);
  }, [selectedSymptoms]);

  const handleSymptomToggle = (symptom: SystemSymptom) => {
    const isSelected = selectedSymptoms.some(s => s.id === symptom.id)
    if (isSelected) {
      onSymptomsChange(selectedSymptoms.filter(s => s.id !== symptom.id))
    } else {
      onSymptomsChange([...selectedSymptoms, symptom])
    }
    // Prevent any focus changes
    const currentElement = document.activeElement as HTMLElement;
    if (currentElement && currentElement.blur) {
      currentElement.blur();
    }
  }

  const toggleSystem = (systemId: string) => {
    // Save current scroll position
    const scrollY = window.scrollY;
    
    setExpandedSystems(prev => 
      prev.includes(systemId) 
        ? prev.filter(id => id !== systemId)
        : [...prev, systemId]
    )
    
    // Prevent any automatic scrolling and restore position
    setTimeout(() => {
      window.scrollTo(0, scrollY);
      const element = document.activeElement as HTMLElement;
      if (element && element.blur) {
        element.blur();
      }
    }, 0);
  }

  const toggleAllSystems = () => {
    if (expandedSystems.length === BODY_SYSTEMS.length) {
      setExpandedSystems([])
    } else {
      setExpandedSystems(BODY_SYSTEMS.map(s => s.id))
    }
  }

  // Filter symptoms based on search
  const filteredSystems = BODY_SYSTEMS.map(system => ({
    ...system,
    symptoms: system.symptoms.filter(symptom => 
      symptom.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(system => 
    searchTerm === "" || system.symptoms.length > 0
  )

  // Get all symptoms for list view
  const allFilteredSymptoms = filteredSystems.flatMap(system => system.symptoms)

  return (
    <div className="symptom-checklist-container space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl tenth-heading-4">Symptom Checklist</CardTitle>
                <CardDescription>
                  Select all symptoms you're currently experiencing
                </CardDescription>
              </div>
            </div>
            {selectedSymptoms.length > 0 && (
              <Badge variant="secondary">
                {selectedSymptoms.length} selected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 tenth-input"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <Tabs value={showSystemView ? "systems" : "list"} onValueChange={(v) => setShowSystemView(v === "systems")}>
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="systems">By System</TabsTrigger>
                <TabsTrigger value="list">All</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {showSystemView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAllSystems}
                className="text-xs"
              >
                {expandedSystems.length === BODY_SYSTEMS.length ? "Collapse All" : "Expand All"}
              </Button>
            )}
          </div>

          {/* Help Text */}
          {selectedSymptoms.length === 0 && (
            <Alert className="tenth-alert">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select symptoms from the categories below. This helps our 10 specialized agents provide more accurate analysis.
              </AlertDescription>
            </Alert>
          )}

          {/* Symptom Lists */}
          {showSystemView ? (
            <div className="space-y-3">
              {filteredSystems.map((system) => (
                <div key={system.id}>
                  <Card className="overflow-hidden border-2 border-border/50">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSystem(system.id);
                      }}
                      className="w-full text-left p-4 hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{system.icon}</span>
                          <div>
                            <h3 className="font-semibold tenth-heading-5">{system.name}</h3>
                            <p className="text-sm text-muted-foreground">{system.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {system.symptoms.some(s => selectedSymptoms.some(ss => ss.id === s.id)) && (
                            <Badge variant="secondary">
                              {system.symptoms.filter(s => selectedSymptoms.some(ss => ss.id === s.id)).length}
                            </Badge>
                          )}
                          {expandedSystems.includes(system.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </button>
                    
                    {expandedSystems.includes(system.id) && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {system.symptoms.map((symptom) => (
                            <label
                              key={symptom.id}
                              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                checked={selectedSymptoms.some(s => s.id === symptom.id)}
                                onCheckedChange={() => handleSymptomToggle(symptom)}
                                className="tenth-checkbox"
                              />
                              <span className="text-sm">{symptom.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {allFilteredSymptoms.map((symptom) => (
                <label
                  key={symptom.id}
                  className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedSymptoms.some(s => s.id === symptom.id)}
                    onCheckedChange={() => handleSymptomToggle(symptom)}
                    className="tenth-checkbox"
                  />
                  <span className="text-sm flex-1">{symptom.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {BODY_SYSTEMS.find(s => s.symptoms.some(sy => sy.id === symptom.id))?.name}
                  </Badge>
                </label>
              ))}
            </div>
          )}

          {/* Selected Symptoms Summary */}
          {selectedSymptoms.length > 0 && (
            <div className="mt-6">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Selected Symptoms Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((symptom) => (
                      <Badge
                        key={symptom.id}
                        variant="secondary"
                        className="pr-1"
                      >
                        {symptom.label}
                        <button
                          onClick={() => handleSymptomToggle(symptom)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
