"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Camera, X, Plus, Upload, Activity, Mail } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { PatientData } from "@/types/medical"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"

interface MobilePatientFormProps {
  onSubmit: (data: PatientData & { email?: string }) => void
  networkQuality?: "excellent" | "good" | "fair" | "poor"
}

const COMMON_SYMPTOMS = [
  "Fever", "Cough", "Headache", "Fatigue", "Nausea",
  "Chest pain", "Shortness of breath", "Dizziness",
  "Sore throat", "Body aches", "Runny nose", "Vomiting"
]

export function MobilePatientForm({ onSubmit, networkQuality }: MobilePatientFormProps) {
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [description, setDescription] = useState("")
  const [age, setAge] = useState("")
  const [biologicalSex, setBiologicalSex] = useState<string>("other")
  const [uploadedImages, setUploadedImages] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [emailDelivery, setEmailDelivery] = useState(networkQuality === "poor")
  const [email, setEmail] = useState("")

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setIsUploading(true)
    const newImages = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // For mobile demo, just create local URL
      const imageUrl = URL.createObjectURL(file)
      newImages.push({
        id: Math.random().toString(36).substr(2, 9),
        url: imageUrl,
        type: 'symptom' as const,
        file,
        description: ''
      })
    }

    setUploadedImages(prev => [...prev, ...newImages])
    setIsUploading(false)
    
    // Vibrate on successful capture
    if ('vibrate' in navigator) {
      navigator.vibrate(100)
    }
  }

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    )
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const patientData: PatientData & { email?: string } = {
      id: Math.random().toString(36).substr(2, 9),
      symptoms,
      description,
      age: age ? parseInt(age) : undefined,
      biologicalSex: biologicalSex as "male" | "female" | "other",
      images: uploadedImages,
      timestamp: new Date(),
      ...(emailDelivery && email ? { email } : {})
    }
    
    onSubmit(patientData)
  }

  const isFormValid = symptoms.length > 0 && description.trim().length > 0

  return (
    <Card className="w-full">
      <CardHeader className="space-y-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Patient Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Camera Upload - Prominent for mobile */}
          <div className="space-y-2">
            <Label>Take Photo of Symptoms (Optional)</Label>
            <div className="flex gap-2">
              <label htmlFor="camera-input" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-20 text-base"
                  disabled={isUploading}
                >
                  <Camera className="h-6 w-6 mr-2" />
                  {isUploading ? "Processing..." : "Open Camera"}
                </Button>
              </label>
              <input
                id="camera-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageCapture}
                className="hidden"
                multiple
              />
              <label htmlFor="gallery-input" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-20 text-base"
                  disabled={isUploading}
                >
                  <Upload className="h-6 w-6 mr-2" />
                  From Gallery
                </Button>
              </label>
              <input
                id="gallery-input"
                type="file"
                accept="image/*"
                onChange={handleImageCapture}
                className="hidden"
                multiple
              />
            </div>
            
            {/* Image Preview */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {uploadedImages.map((img) => (
                  <div key={img.id} className="relative aspect-square">
                    <Image
                      src={img.url}
                      alt="Symptom"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Symptom Selection */}
          <div className="space-y-2">
            <Label>Select Your Symptoms *</Label>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_SYMPTOMS.map((symptom) => (
                <Button
                  key={symptom}
                  type="button"
                  variant={symptoms.includes(symptom) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSymptom(symptom)}
                  className="justify-start text-left"
                >
                  {symptom}
                </Button>
              ))}
            </div>
            
            {/* Display selected symptoms */}
            {symptoms.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {symptoms.map((symptom) => (
                  <Badge key={symptom} variant="secondary" className="text-xs">
                    {symptom}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Description - Larger text area for mobile */}
          <div className="space-y-2">
            <Label htmlFor="description">Describe Your Symptoms *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe your symptoms in detail..."
              className="min-h-[120px] text-base"
              required
            />
          </div>

          {/* Basic Info - Simplified for mobile */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                min="1"
                max="120"
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Biological Sex</Label>
              <Select value={biologicalSex} onValueChange={setBiologicalSex}>
                <SelectTrigger className="text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Email Delivery Option */}
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <Label htmlFor="email-delivery" className="text-base">Email Results</Label>
              </div>
              <Switch
                id="email-delivery"
                checked={emailDelivery}
                onCheckedChange={setEmailDelivery}
              />
            </div>
            {emailDelivery && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  type="email"
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-base"
                  required={emailDelivery}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Get your analysis results via email - perfect for limtied network conditions
                </p>
              </motion.div>
            )}
          </div>

          {/* Submit Button - Large and prominent */}
          <Button 
            type="submit" 
            className="w-full h-14 text-lg"
            disabled={!isFormValid || (emailDelivery && !email)}
          >
            Start AI Analysis
          </Button>
          
          {!isFormValid && (
            <p className="text-sm text-muted-foreground text-center">
              Please select symptoms and describe them to continue
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}