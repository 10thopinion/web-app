"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Upload, Image as ImageIcon, AlertCircle } from "lucide-react"
import { PatientData, UploadedImage } from "@/types/medical"
import { motion, AnimatePresence } from "framer-motion"

interface PatientFormProps {
  onSubmit: (data: PatientData) => void
  isLoading?: boolean
}

export function PatientForm({ onSubmit, isLoading }: PatientFormProps) {
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [currentSymptom, setCurrentSymptom] = useState("")
  const [description, setDescription] = useState("")
  const [medicalHistory, setMedicalHistory] = useState("")
  const [medications, setMedications] = useState<string[]>([])
  const [currentMedication, setCurrentMedication] = useState("")
  const [allergies, setAllergies] = useState<string[]>([])
  const [currentAllergy, setCurrentAllergy] = useState("")
  const [age, setAge] = useState("")
  const [biologicalSex, setBiologicalSex] = useState<"male" | "female" | "other">("other")
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        type: 'other' as const,
        file
      }))
      setUploadedImages(prev => [...prev, ...newImages])
    }
  })

  const addItem = (item: string, setItems: React.Dispatch<React.SetStateAction<string[]>>, setCurrent: React.Dispatch<React.SetStateAction<string>>) => {
    if (item.trim()) {
      setItems(prev => [...prev, item.trim()])
      setCurrent("")
    }
  }

  const removeItem = (index: number, setItems: React.Dispatch<React.SetStateAction<string[]>>) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const patientData: PatientData = {
      id: Math.random().toString(36).substr(2, 9),
      symptoms,
      description,
      medicalHistory: medicalHistory || undefined,
      medications: medications.length > 0 ? medications : undefined,
      allergies: allergies.length > 0 ? allergies : undefined,
      age: age ? parseInt(age) : undefined,
      biologicalSex: biologicalSex as "male" | "female" | "other",
      images: uploadedImages,
      timestamp: new Date()
    }
    
    onSubmit(patientData)
  }

  const isFormValid = symptoms.length > 0 && description.trim().length > 0

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Patient Information</CardTitle>
        <CardDescription>
          Provide detailed information about your symptoms for analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Symptoms */}
          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms *</Label>
            <div className="flex gap-2">
              <Input
                id="symptoms"
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(currentSymptom, setSymptoms, setCurrentSymptom))}
                placeholder="Enter a symptom and press Enter"
              />
              <Button
                type="button"
                onClick={() => addItem(currentSymptom, setSymptoms, setCurrentSymptom)}
                disabled={!currentSymptom.trim()}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <AnimatePresence>
                {symptoms.map((symptom, index) => (
                  <motion.div
                    key={symptom}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge variant="secondary" className="pr-1">
                      {symptom}
                      <button
                        type="button"
                        onClick={() => removeItem(index, setSymptoms)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your symptoms in detail, including when they started, severity, and any patterns you've noticed"
              rows={4}
              required
            />
          </div>

          {/* Medical History */}
          <div className="space-y-2">
            <Label htmlFor="medical-history">Medical History</Label>
            <Textarea
              id="medical-history"
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder="Previous conditions, surgeries, or relevant medical history"
              rows={3}
            />
          </div>

          {/* Demographics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                min="0"
                max="150"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Biological Sex</Label>
              <select
                id="sex"
                value={biologicalSex}
                onChange={(e) => setBiologicalSex(e.target.value as "male" | "female" | "other")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="other">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          {/* Medications */}
          <div className="space-y-2">
            <Label htmlFor="medications">Current Medications</Label>
            <div className="flex gap-2">
              <Input
                id="medications"
                value={currentMedication}
                onChange={(e) => setCurrentMedication(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(currentMedication, setMedications, setCurrentMedication))}
                placeholder="Enter medication name"
              />
              <Button
                type="button"
                onClick={() => addItem(currentMedication, setMedications, setCurrentMedication)}
                disabled={!currentMedication.trim()}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {medications.map((medication, index) => (
                <Badge key={index} variant="outline" className="pr-1">
                  {medication}
                  <button
                    type="button"
                    onClick={() => removeItem(index, setMedications)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <div className="flex gap-2">
              <Input
                id="allergies"
                value={currentAllergy}
                onChange={(e) => setCurrentAllergy(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(currentAllergy, setAllergies, setCurrentAllergy))}
                placeholder="Enter allergy"
              />
              <Button
                type="button"
                onClick={() => addItem(currentAllergy, setAllergies, setCurrentAllergy)}
                disabled={!currentAllergy.trim()}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {allergies.map((allergy, index) => (
                <Badge key={index} variant="outline" className="pr-1">
                  {allergy}
                  <button
                    type="button"
                    onClick={() => removeItem(index, setAllergies)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Medical Images (Optional)</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? "Drop the images here..."
                  : "Drag & drop medical images here, or click to select"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports PNG, JPG, JPEG (max 5MB per file)
              </p>
            </div>
            
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt="Medical image"
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setUploadedImages(prev => prev.filter(img => img.id !== image.id))}
                      className="absolute top-1 right-1 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="flex items-start gap-2 p-4 bg-muted rounded-lg">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Privacy & Security</p>
              <p>Your data is encrypted and processed securely. No personal information is stored permanently. This is for informational purposes only and not a substitute for professional medical advice.</p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>Initializing Protocol<span className="thinking ml-2" /></>
            ) : (
              "Start Analysis"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
