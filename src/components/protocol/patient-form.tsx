"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Upload, Stethoscope, Pill, Shield, Sparkles } from "lucide-react"
import { PatientData, UploadedImage } from "@/types/medical"
import { SystemSymptom } from "@/types/symptom-checklist"
import { motion, AnimatePresence } from "framer-motion"
import { SymptomChecklist } from "./symptom-checklist"
import Image from "next/image"

interface PatientFormProps {
  onSubmit: (data: PatientData) => void
  isLoading?: boolean
}

export function PatientForm({ onSubmit, isLoading }: PatientFormProps) {
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [currentSymptom, setCurrentSymptom] = useState("")
  const [structuredSymptoms, setStructuredSymptoms] = useState<SystemSymptom[]>([])
  const [description, setDescription] = useState("")
  const [medicalHistory, setMedicalHistory] = useState("")
  const [medications, setMedications] = useState<string[]>([])
  const [currentMedication, setCurrentMedication] = useState("")
  const [allergies, setAllergies] = useState<string[]>([])
  const [currentAllergy, setCurrentAllergy] = useState("")
  const [age, setAge] = useState("")
  const [biologicalSex, setBiologicalSex] = useState<"male" | "female" | "other">("other")
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: async (acceptedFiles) => {
      // Generate a session ID for organizing uploads
      const sessionId = Math.random().toString(36).substr(2, 9)
      
      setIsUploading(true)
      
      // Upload each file to S3
      const uploadPromises = acceptedFiles.map(async (file) => {
        try {
          // First, get presigned URL from our API
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              contentType: file.type,
              fileSize: file.size,
              sessionId
            })
          })
          
          if (!response.ok) {
            throw new Error('Failed to get upload URL')
          }
          
          const { uploadUrl, key } = await response.json()
          
          // Upload directly to S3
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            }
          })
          
          if (!uploadResponse.ok) {
            throw new Error('Failed to upload file')
          }
          
          // Create image object with S3 key
          return {
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file), // Keep local preview
            s3Key: key,
            type: 'other' as const,
            file,
            description: ''
          }
        } catch (error) {
          console.error('Upload failed:', error)
          // Fallback to local URL if upload fails
          return {
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file),
            type: 'other' as const,
            file,
            description: ''
          }
        }
      })
      
      const newImages = await Promise.all(uploadPromises)
      setUploadedImages(prev => [...prev, ...newImages])
      setIsUploading(false)
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
      structuredSymptoms: structuredSymptoms.length > 0 ? structuredSymptoms : undefined,
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

  const isFormValid = (symptoms.length > 0 || structuredSymptoms.length > 0) && description.trim().length > 0

  return (
    <motion.div
      id="patient-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-4xl mx-auto tenth-form-card">
        <CardHeader className="relative overflow-hidden">
          <motion.div 
            className="absolute top-4 right-4 opacity-20"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Image
              src="/tentin-mascot-lg.png"
              alt="Tentin"
              width={64}
              height={64}
              className="object-contain"
            />
          </motion.div>
          <div className="flex items-center gap-4">
            <motion.div 
              className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Stethoscope className="h-8 w-8 text-primary" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl md:text-3xl tenth-heading-3">Patient Information</CardTitle>
              <CardDescription className="text-base tenth-body">
                Your symptoms will be analyzed from 10 different medical perspectives
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Symptom Checklist */}
          <SymptomChecklist 
            selectedSymptoms={structuredSymptoms}
            onSymptomsChange={setStructuredSymptoms}
          />

          {/* Additional Symptoms */}
          <div className="space-y-2">
            <Label htmlFor="symptoms">Additional Symptoms (Optional)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              If your symptoms aren't listed above, add them here
            </p>
            <div className="flex gap-2">
              <Input
                id="symptoms"
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(currentSymptom, setSymptoms, setCurrentSymptom))}
                placeholder="Enter a symptom and press Enter"
                className="tenth-input"
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
                    <Badge variant="secondary" className="pr-1 tenth-badge bg-primary/10 text-primary border-primary/20">
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
              className="tenth-input"
              autoFocus={false}
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
                <Badge key={index} variant="outline" className="pr-1 tenth-badge bg-transparent">
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
              className={`border-3 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all tenth-card hover:border-primary/50 ${
                isDragActive ? "border-primary bg-primary/10 scale-102" : 
                isUploading ? "border-primary/50 bg-primary/5 cursor-wait" : 
                "border-muted-foreground/30"
              } ${isUploading ? "pointer-events-none" : ""}`}
            >
              <input {...getInputProps()} disabled={isUploading} />
              {isUploading ? (
                <>
                  <div className="mx-auto h-12 w-12 text-primary mb-2 animate-pulse">
                    <Upload className="h-full w-full" />
                  </div>
                  <p className="text-sm font-medium">Uploading images...</p>
                  <p className="text-xs text-muted-foreground mt-1">Please wait</p>
                </>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive
                      ? "Drop the images here..."
                      : "Drag & drop medical images here, or click to select"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports PNG, JPG, JPEG (max 5MB per file)
                  </p>
                </>
              )}
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
          <motion.div 
            className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-500/10 to-transparent rounded-xl border-2 border-green-500/20"
            whileHover={{ scale: 1.01 }}
          >
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold mb-1 text-green-700 dark:text-green-300">Privacy & Security</p>
              <p className="tenth-body">Your data is encrypted and processed securely. No personal information is stored permanently. This is for informational purposes only and not a substitute for professional medical advice.</p>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            whileHover={{ scale: isFormValid && !isLoading ? 1.02 : 1 }}
            whileTap={{ scale: isFormValid && !isLoading ? 0.98 : 1 }}
          >
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full tenth-button-primary relative overflow-hidden group"
              size="lg"
            >
              {isLoading ? (
                <>
                  <motion.div
                    className="flex items-center gap-2"
                    animate={{ opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Sparkles className="h-5 w-5" />
                    Initializing Protocol
                    <span className="thinking ml-1" />
                  </motion.div>
                </>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Start Analysis
                </span>
              )}
              
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10"
                initial={{ x: '-100%' }}
                whileHover={{
                  x: '100%',
                  transition: { duration: 0.6, ease: "easeInOut" }
                }}
              />
            </Button>
          </motion.div>
        </form>
      </CardContent>
    </Card>
    </motion.div>
  )
}
