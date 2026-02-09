"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { completeOnboarding } from "@/lib/actions/student"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  User,
  MapPin,
  Briefcase,
  Code,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Plus,
  X,
  Github,
  Linkedin,
} from "lucide-react"

interface Skill {
  id: string
  name: string
  category: string | null
}

interface StudentOnboardingProps {
  skills: Skill[]
}

const JOB_FUNCTIONS = [
  // Engineering & Technical
  { value: 'frontend', label: 'Frontend Engineering', category: 'tech' },
  { value: 'backend', label: 'Backend Engineering', category: 'tech' },
  { value: 'fullstack', label: 'Full Stack Engineering', category: 'tech' },
  { value: 'mobile', label: 'Mobile Development', category: 'tech' },
  { value: 'devops', label: 'DevOps / Infrastructure', category: 'tech' },
  { value: 'ml', label: 'Machine Learning / AI', category: 'tech' },
  { value: 'data', label: 'Data Science / Analytics', category: 'tech' },
  { value: 'security', label: 'Security Engineering', category: 'tech' },
  
  // Product & Design
  { value: 'design', label: 'Product Design / UX', category: 'product' },
  { value: 'pm', label: 'Product Management', category: 'product' },
  { value: 'research', label: 'User Research', category: 'product' },
  
  // Business & Operations
  { value: 'marketing', label: 'Marketing / Growth', category: 'business' },
  { value: 'sales', label: 'Sales / Business Development', category: 'business' },
  { value: 'finance', label: 'Finance / Accounting', category: 'business' },
  { value: 'operations', label: 'Operations / Strategy', category: 'business' },
  { value: 'hr', label: 'People / HR', category: 'business' },
  { value: 'legal', label: 'Legal / Compliance', category: 'business' },
  { value: 'customer_success', label: 'Customer Success / Support', category: 'business' },
  
  // Creative & Content
  { value: 'content', label: 'Content / Copywriting', category: 'creative' },
  { value: 'social_media', label: 'Social Media Management', category: 'creative' },
  { value: 'video', label: 'Video / Multimedia Production', category: 'creative' },
  { value: 'brand', label: 'Brand / Graphic Design', category: 'creative' },
]

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees (early stage)' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
]

const STEPS = [
  { id: 1, title: 'Basic Info', icon: User },
  { id: 2, title: 'Education', icon: GraduationCap },
  { id: 3, title: 'Preferences', icon: MapPin },
  { id: 4, title: 'Skills', icon: Code },
  { id: 5, title: 'Experience', icon: Briefcase },
  { id: 6, title: 'About You', icon: User },
]

export function StudentOnboarding({ skills }: StudentOnboardingProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    fullName: '',
    phone: '',
    linkedinUrl: '',
    location: '',
    
    // Education
    major: '',
    graduationYear: new Date().getFullYear() + 1,
    
    // Preferences
    willingToRelocate: false,
    requiresSponsorship: false,
    preferredCompanySizes: [] as string[],
    jobFunctions: [] as string[],
    interestedRoles: [] as string[],
    
    // Skills
    selectedSkills: [] as string[],
    
    // Experience
    experiences: [] as {
      companyName: string
      title: string
      description: string
      startDate: string
      endDate: string
      isCurrent: boolean
    }[],
    
    // About You
    headline: '',
    githubUrl: '',
    lookingFor: '',
    proudProject: '',
  })

  const [newExperience, setNewExperience] = useState({
    companyName: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
  })

  const progress = (step / STEPS.length) * 100

  const updateFormData = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: string, value: string) => {
    setFormData(prev => {
      const arr = prev[field as keyof typeof prev] as string[]
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter(v => v !== value) }
      } else {
        return { ...prev, [field]: [...arr, value] }
      }
    })
  }

  const addExperience = () => {
    if (newExperience.companyName && newExperience.title) {
      setFormData(prev => ({
        ...prev,
        experiences: [...prev.experiences, { ...newExperience }]
      }))
      setNewExperience({
        companyName: '',
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
      })
    }
  }

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await completeOnboarding({
        profile: {
          fullName: formData.fullName,
          phone: formData.phone,
          linkedinUrl: formData.linkedinUrl,
          location: formData.location,
        },
        student: {
          headline: formData.headline,
          major: formData.major,
          graduationYear: formData.graduationYear,
          willingToRelocate: formData.willingToRelocate,
          requiresSponsorship: formData.requiresSponsorship,
          preferredCompanySizes: formData.preferredCompanySizes,
          jobFunctions: formData.jobFunctions,
          interestedRoles: formData.interestedRoles,
          githubUrl: formData.githubUrl,
          lookingFor: formData.lookingFor,
          proudProject: formData.proudProject,
        },
        skillIds: formData.selectedSkills,
        experiences: formData.experiences,
      })
      if (result?.redirect) {
        router.push(result.redirect)
        return
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.fullName.trim() !== ''
      case 2:
        return formData.major.trim() !== '' && formData.graduationYear > 0
      case 3:
        return formData.jobFunctions.length > 0
      case 4:
        return formData.selectedSkills.length >= 3
      case 5:
        return true // Experience is optional
      case 6:
        return formData.headline.trim() !== '' && formData.lookingFor.trim() !== ''
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-edge bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-maroon-800 text-white font-bold text-sm">
                MK
              </div>
              <span className="font-semibold text-foreground">Meloy Kickstart</span>
            </div>
            <div className="text-sm text-muted">
              Step {step} of {STEPS.length}
            </div>
          </div>
          <Progress value={progress} className="mt-4 h-1" />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="border-b border-edge bg-card">
        <div className="container py-4">
          <div className="flex justify-between">
            {STEPS.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex flex-col items-center gap-1",
                    step >= s.id ? "text-foreground" : "text-dim"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      step > s.id
                        ? "border-green-500 bg-green-500 text-white"
                        : step === s.id
                        ? "border-maroon-700 bg-maroon-700 text-white"
                        : "border-edge"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{s.title}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-6 rounded-xl bg-red-950/30 border border-red-900/50 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold">Let&apos;s start with the basics</h1>
                    <p className="text-muted mt-1">Tell us a bit about yourself</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => updateFormData('fullName', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedinUrl">
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn Profile URL
                        </div>
                      </Label>
                      <Input
                        id="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={(e) => updateFormData('linkedinUrl', e.target.value)}
                        placeholder="https://linkedin.com/in/johndoe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => updateFormData('location', e.target.value)}
                        placeholder="College Station, TX"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Education */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold">Education</h1>
                    <p className="text-muted mt-1">Tell us about your academic background</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="major">Major / Field of Study *</Label>
                      <Input
                        id="major"
                        value={formData.major}
                        onChange={(e) => updateFormData('major', e.target.value)}
                        placeholder="Computer Science"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">Expected Graduation Year *</Label>
                      <Select
                        value={formData.graduationYear.toString()}
                        onValueChange={(value) => updateFormData('graduationYear', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + i - 2).map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="rounded-xl bg-card-hover p-4">
                      <p className="text-sm text-muted">
                        <span className="font-medium">University:</span> Texas A&M University
                      </p>
                    </div>

                    <div className="space-y-3 pt-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="requiresSponsorship"
                          checked={formData.requiresSponsorship}
                          onCheckedChange={(checked) => updateFormData('requiresSponsorship', checked)}
                        />
                        <Label htmlFor="requiresSponsorship" className="font-normal">
                          I require visa sponsorship now or in the future to work in the US
                        </Label>
                      </div>

                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="willingToRelocate"
                          checked={formData.willingToRelocate}
                          onCheckedChange={(checked) => updateFormData('willingToRelocate', checked)}
                        />
                        <Label htmlFor="willingToRelocate" className="font-normal">
                          I am willing to relocate for the right opportunity
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Preferences */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold">Job Preferences</h1>
                    <p className="text-muted mt-1">What kind of roles are you interested in?</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label>What job functions interest you? * (Select all that apply)</Label>
                      
                      {/* Engineering & Technical */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted">Engineering & Technical</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {JOB_FUNCTIONS.filter(f => f.category === 'tech').map((func) => (
                            <button
                              key={func.value}
                              type="button"
                              onClick={() => toggleArrayItem('jobFunctions', func.value)}
                              className={cn(
                                "flex items-center gap-2 rounded-xl border-2 p-3 text-left text-sm transition-colors",
                                formData.jobFunctions.includes(func.value)
                                  ? "border-maroon-700 bg-maroon-950"
                                  : "border-edge hover:border-muted"
                              )}
                            >
                              <div className={cn(
                                "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                                formData.jobFunctions.includes(func.value)
                                  ? "border-maroon-700 bg-maroon-700"
                                  : "border-dim"
                              )}>
                                {formData.jobFunctions.includes(func.value) && (
                                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                )}
                              </div>
                              {func.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Product & Design */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted">Product & Design</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {JOB_FUNCTIONS.filter(f => f.category === 'product').map((func) => (
                            <button
                              key={func.value}
                              type="button"
                              onClick={() => toggleArrayItem('jobFunctions', func.value)}
                              className={cn(
                                "flex items-center gap-2 rounded-xl border-2 p-3 text-left text-sm transition-colors",
                                formData.jobFunctions.includes(func.value)
                                  ? "border-maroon-700 bg-maroon-950"
                                  : "border-edge hover:border-muted"
                              )}
                            >
                              <div className={cn(
                                "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                                formData.jobFunctions.includes(func.value)
                                  ? "border-maroon-700 bg-maroon-700"
                                  : "border-dim"
                              )}>
                                {formData.jobFunctions.includes(func.value) && (
                                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                )}
                              </div>
                              {func.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Business & Operations */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted">Business & Operations</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {JOB_FUNCTIONS.filter(f => f.category === 'business').map((func) => (
                            <button
                              key={func.value}
                              type="button"
                              onClick={() => toggleArrayItem('jobFunctions', func.value)}
                              className={cn(
                                "flex items-center gap-2 rounded-xl border-2 p-3 text-left text-sm transition-colors",
                                formData.jobFunctions.includes(func.value)
                                  ? "border-maroon-700 bg-maroon-950"
                                  : "border-edge hover:border-muted"
                              )}
                            >
                              <div className={cn(
                                "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                                formData.jobFunctions.includes(func.value)
                                  ? "border-maroon-700 bg-maroon-700"
                                  : "border-dim"
                              )}>
                                {formData.jobFunctions.includes(func.value) && (
                                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                )}
                              </div>
                              {func.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Creative & Content */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted">Creative & Content</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {JOB_FUNCTIONS.filter(f => f.category === 'creative').map((func) => (
                            <button
                              key={func.value}
                              type="button"
                              onClick={() => toggleArrayItem('jobFunctions', func.value)}
                              className={cn(
                                "flex items-center gap-2 rounded-xl border-2 p-3 text-left text-sm transition-colors",
                                formData.jobFunctions.includes(func.value)
                                  ? "border-maroon-700 bg-maroon-950"
                                  : "border-edge hover:border-muted"
                              )}
                            >
                              <div className={cn(
                                "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                                formData.jobFunctions.includes(func.value)
                                  ? "border-maroon-700 bg-maroon-700"
                                  : "border-dim"
                              )}>
                                {formData.jobFunctions.includes(func.value) && (
                                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                )}
                              </div>
                              {func.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>What size company would you like to work at?</Label>
                      <div className="space-y-2">
                        {COMPANY_SIZES.map((size) => (
                          <button
                            key={size.value}
                            type="button"
                            onClick={() => toggleArrayItem('preferredCompanySizes', size.value)}
                            className={cn(
                              "w-full flex items-center gap-3 rounded-xl border-2 p-3 text-left text-sm transition-colors",
                              formData.preferredCompanySizes.includes(size.value)
                                ? "border-maroon-700 bg-maroon-950"
                                : "border-edge hover:border-muted"
                            )}
                          >
                            <Checkbox
                              checked={formData.preferredCompanySizes.includes(size.value)}
                              className="pointer-events-none"
                            />
                            {size.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Skills */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold">Your Skills</h1>
                    <p className="text-muted mt-1">
                      Select up to 10 skills that best represent your expertise (minimum 3)
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">
                        {formData.selectedSkills.length} / 10 skills selected
                      </span>
                      {formData.selectedSkills.length < 3 && (
                        <span className="text-maroon-400">Select at least 3</span>
                      )}
                    </div>

                    {['language', 'framework', 'tool', 'business', 'soft'].map((category) => {
                      const categorySkills = skills.filter(s => s.category === category)
                      if (categorySkills.length === 0) return null
                      
                      return (
                        <div key={category} className="space-y-2">
                          <h3 className="font-medium capitalize">
                            {category === 'language' ? 'Programming Languages' : 
                             category === 'framework' ? 'Frameworks & Libraries' : 
                             category === 'tool' ? 'Tools & Technologies' :
                             category === 'business' ? 'Business & Marketing' :
                             'Soft Skills'}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {categorySkills.map((skill) => (
                              <button
                                key={skill.id}
                                type="button"
                                disabled={
                                  formData.selectedSkills.length >= 10 && 
                                  !formData.selectedSkills.includes(skill.id)
                                }
                                onClick={() => toggleArrayItem('selectedSkills', skill.id)}
                                className={cn(
                                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                                  formData.selectedSkills.includes(skill.id)
                                    ? "bg-maroon-800 text-white"
                                    : "bg-card-hover text-muted hover:bg-elevated",
                                  formData.selectedSkills.length >= 10 && 
                                  !formData.selectedSkills.includes(skill.id) &&
                                  "opacity-50 cursor-not-allowed"
                                )}
                              >
                                {skill.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Step 5: Experience */}
              {step === 5 && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold">Work Experience</h1>
                    <p className="text-muted mt-1">
                      Add any relevant work experience, internships, or projects (optional)
                    </p>
                  </div>

                  {/* Existing experiences */}
                  {formData.experiences.length > 0 && (
                    <div className="space-y-3">
                      {formData.experiences.map((exp, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between rounded-xl border p-4"
                        >
                          <div>
                            <h4 className="font-medium">{exp.title}</h4>
                            <p className="text-sm text-muted">{exp.companyName}</p>
                            <p className="text-xs text-dim mt-1">
                              {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExperience(index)}
                            className="text-dim hover:text-muted"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new experience form */}
                  <div className="rounded-xl border p-4 space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Experience
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expCompany">Company</Label>
                        <Input
                          id="expCompany"
                          value={newExperience.companyName}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, companyName: e.target.value }))}
                          placeholder="Company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expTitle">Title</Label>
                        <Input
                          id="expTitle"
                          value={newExperience.title}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Marketing Intern, Engineer, Analyst"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expDescription">Description</Label>
                      <Textarea
                        id="expDescription"
                        value={newExperience.description}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="What did you work on?"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expStart">Start Date</Label>
                        <Input
                          id="expStart"
                          type="month"
                          value={newExperience.startDate}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expEnd">End Date</Label>
                        <Input
                          id="expEnd"
                          type="month"
                          value={newExperience.endDate}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}
                          disabled={newExperience.isCurrent}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="expCurrent"
                        checked={newExperience.isCurrent}
                        onCheckedChange={(checked) => setNewExperience(prev => ({ ...prev, isCurrent: !!checked }))}
                      />
                      <Label htmlFor="expCurrent" className="font-normal">
                        I currently work here
                      </Label>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addExperience}
                      disabled={!newExperience.companyName || !newExperience.title}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Experience
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 6: About You */}
              {step === 6 && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold">Tell us about yourself</h1>
                    <p className="text-muted mt-1">
                      Help startups understand who you are and what you&apos;re looking for
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="headline">
                        Describe yourself in a short phrase *
                      </Label>
                      <Input
                        id="headline"
                        value={formData.headline}
                        onChange={(e) => updateFormData('headline', e.target.value)}
                        placeholder='e.g., "Marketing strategist with data-driven approach", "Finance major passionate about startups", "Creative designer with UX focus"'
                      />
                      <p className="text-xs text-muted">
                        This will be the first thing startups see about you
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="githubUrl">
                        <div className="flex items-center gap-2">
                          <Github className="h-4 w-4" />
                          Portfolio / GitHub URL (optional)
                        </div>
                      </Label>
                      <Input
                        id="githubUrl"
                        value={formData.githubUrl}
                        onChange={(e) => updateFormData('githubUrl', e.target.value)}
                        placeholder="https://github.com/johndoe or https://yourportfolio.com"
                      />
                      <p className="text-xs text-muted">
                        Share your GitHub, portfolio, Behance, Dribbble, or any relevant work samples
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lookingFor">
                        What are you looking for in your next role? *
                      </Label>
                      <Textarea
                        id="lookingFor"
                        value={formData.lookingFor}
                        onChange={(e) => updateFormData('lookingFor', e.target.value)}
                        placeholder="What would you like to find? What would you like to avoid? Include aspects like technologies, industries, team dynamics, software development practices — whatever is important to you."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="proudProject">
                        Describe a project or accomplishment you&apos;re proud of (optional)
                      </Label>
                      <Textarea
                        id="proudProject"
                        value={formData.proudProject}
                        onChange={(e) => updateFormData('proudProject', e.target.value)}
                        placeholder="Describe a project, campaign, initiative, or achievement from start to finish. This could be a technical project, marketing campaign, event you organized, research you conducted, or any work you're proud of. Be specific about your personal contribution and the impact."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-edge">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1 || loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {step < STEPS.length ? (
              <Button
                type="button"
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                variant="orange"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Complete Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
