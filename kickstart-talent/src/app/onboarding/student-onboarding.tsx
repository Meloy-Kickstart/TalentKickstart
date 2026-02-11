"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
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
  FileText,
  Upload,
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
  // Engineering & Technical (Software)
  { value: 'frontend', label: 'Frontend Engineering', category: 'tech' },
  { value: 'backend', label: 'Backend Engineering', category: 'tech' },
  { value: 'fullstack', label: 'Full Stack Engineering', category: 'tech' },
  { value: 'mobile', label: 'Mobile Development', category: 'tech' },
  { value: 'devops', label: 'DevOps / Infrastructure', category: 'tech' },
  { value: 'ml', label: 'Machine Learning / AI', category: 'tech' },
  { value: 'data', label: 'Data Science / Analytics', category: 'tech' },
  { value: 'security', label: 'Security Engineering', category: 'tech' },

  // Engineering & Technical (Traditional)
  { value: 'mechanical', label: 'Mechanical Engineering', category: 'tech' },
  { value: 'electrical', label: 'Electrical Engineering', category: 'tech' },
  { value: 'hardware', label: 'Hardware Engineering', category: 'tech' },
  { value: 'civil', label: 'Civil Engineering', category: 'tech' },
  { value: 'aerospace', label: 'Aerospace Engineering', category: 'tech' },
  { value: 'biomedical', label: 'Biomedical Engineering', category: 'tech' },

  // Product & Design
  { value: 'design', label: 'Product Design / UX', category: 'product' },
  { value: 'pm', label: 'Product Management', category: 'product' },
  { value: 'research', label: 'User Research', category: 'product' },

  // Business & Operations
  { value: 'marketing', label: 'Marketing / Growth', category: 'business' },
  { value: 'sales', label: 'Sales / Business Development', category: 'business' },
  { value: 'finance', label: 'Finance / Accounting', category: 'business' },
  { value: 'investment_banking', label: 'Investment Banking', category: 'business' },
  { value: 'vc_pe', label: 'Venture Capital / Private Equity', category: 'business' },
  { value: 'consulting', label: 'Management Consulting', category: 'business' },
  { value: 'operations', label: 'Operations / Strategy', category: 'business' },
  { value: 'supply_chain', label: 'Supply Chain / Logistics', category: 'business' },
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

const STARTUP_QUICK_PICKS = [
  // Business & Sales
  { name: 'Growth Hacking', category: 'business' },
  { name: 'B2B Sales', category: 'business' },
  { name: 'Pitching', category: 'business' },
  { name: 'Financial Modeling', category: 'business' },
  { name: 'Market Analysis', category: 'business' },
  { name: 'CRM Management', category: 'business' },
  { name: 'Viral Marketing', category: 'business' },

  // Tech & Engineering (Next-gen)
  { name: 'Prompt Engineering', category: 'tech' },
  { name: 'LLM Integration', category: 'tech' },
  { name: 'Cloud Native', category: 'tech' },
  { name: 'No-Code (Webflow/Bubble)', category: 'tech' },
  { name: 'Zapier Automation', category: 'tech' },
  { name: 'Data Visualization', category: 'tech' },
  { name: 'Security Auditing', category: 'tech' },

  // Design & Creative
  { name: 'Product Design', category: 'creative' },
  { name: 'Branding', category: 'creative' },
  { name: 'Motion Graphics', category: 'creative' },
  { name: 'Content Strategy', category: 'creative' },
  { name: 'Video Production', category: 'creative' },

  // High-Performance Work
  { name: 'Agile Management', category: 'soft' },
  { name: 'Public Speaking', category: 'soft' },
  { name: 'Rapid Prototyping', category: 'soft' },
  { name: 'Team Building', category: 'soft' },
  { name: 'Strategic Planning', category: 'soft' },
]

export function StudentOnboarding({ skills: initialSkills }: StudentOnboardingProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [skills, setSkills] = useState(initialSkills)

  // Form state
  // ... (no changes to formData structure)
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
    resumeUrl: '',
  })

  const [skillSearch, setSkillSearch] = useState('')

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
        // Block adding more than 10 skills
        if (field === 'selectedSkills' && arr.length >= 10) return prev
        return { ...prev, [field]: [...arr, value] }
      }
    })
  }

  const addCustomSkill = (name: string) => {
    if (!name.trim()) return
    if (formData.selectedSkills.length >= 10) return
    const exists = skills.find(s => s.name.toLowerCase() === name.toLowerCase())
    if (exists) {
      if (!formData.selectedSkills.includes(exists.id)) {
        toggleArrayItem('selectedSkills', exists.id)
      }
    } else {
      const customId = `custom:${name.trim()}`
      if (!formData.selectedSkills.includes(customId)) {
        toggleArrayItem('selectedSkills', customId)
        setSkills(prev => [...prev, { id: customId, name: name.trim(), category: 'custom' }])
      }
    }
    setSkillSearch('')
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
          resumeUrl: formData.resumeUrl,
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

  const isCSMajor = (major: string) => {
    if (!major) return false
    const csTerms = ['computer', 'software', 'cs', 'cse', 'it', 'information technology', 'cyber', 'data science', 'programming']
    return csTerms.some(term => major.toLowerCase().includes(term))
  }

  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-[#1a0a0d]">
      {/* Ambient Background - Organic Floating Blobs */}
      <div className="fixed inset-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute inset-0 bg-tech-grid opacity-30"></div>
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] blob-soft rounded-full animate-blob opacity-60"></div>
        <div className="absolute bottom-[-5%] right-[10%] w-[400px] h-[400px] blob-maroon rounded-full animate-blob animation-delay-2000 opacity-50"></div>
        <div className="absolute top-[40%] left-[-10%] w-[300px] h-[300px] blob-gold rounded-full animate-blob animation-delay-4000 opacity-30"></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b-0 rounded-none bg-white/40">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="KickStart Talent"
                width={32}
                height={32}
                className="hover:scale-105 transition-transform"
              />
              <span className="font-semibold text-[#500000]">KickStart Talent</span>
            </div>
            <div className="text-sm text-[#500000]/60 font-medium">
              Step {step} of {STEPS.length}
            </div>
          </div>
          <Progress value={progress} className="mt-4 h-1 bg-[#500000]/10" />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="border-b border-[#500000]/5 bg-white/20 backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex justify-between max-w-4xl mx-auto">
            {STEPS.map((s) => {
              const Icon = s.icon
              const isActive = step >= s.id
              const isCurrent = step === s.id

              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex flex-col items-center gap-2 transition-all duration-300",
                    isActive ? "text-[#500000]" : "text-[#500000]/30"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-300 shadow-sm",
                      isCurrent
                        ? "border-[#500000] bg-[#500000] text-white scale-110 shadow-lg shadow-[#500000]/20"
                        : isActive
                          ? "border-[#500000]/30 bg-[#500000]/10 text-[#500000]"
                          : "border-[#500000]/10 bg-white/40"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={cn(
                    "text-xs font-medium hidden sm:block",
                    isCurrent ? "font-bold" : ""
                  )}>{s.title}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12 pb-24">
        <div className="max-w-3xl mx-auto glass-panel p-8 md:p-12 relative">
          {error && (
            <div className="mb-8 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600">
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
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#1a0a0d] mb-2">Let&apos;s start with the basics</h1>
                    <p className="text-[#500000]/60">Tell us a bit about yourself</p>
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
                    <p className="text-muted-foreground mt-1">Tell us about your academic background</p>
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
                      <p className="text-sm text-muted-foreground">
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
                    <p className="text-muted-foreground mt-1">What kind of roles are you interested in?</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label>What job functions interest you? * (Select all that apply)</Label>

                      {/* Engineering & Technical */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Engineering & Technical</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {JOB_FUNCTIONS.filter(f => f.category === 'tech').map((func) => (
                            <button
                              key={func.value}
                              type="button"
                              onClick={() => toggleArrayItem('jobFunctions', func.value)}
                              className={cn(
                                "flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all duration-200",
                                formData.jobFunctions.includes(func.value)
                                  ? "border-[#500000] bg-[#500000]/5 shadow-md shadow-[#500000]/5"
                                  : "border-[#500000]/10 hover:border-[#500000]/30 hover:bg-white/50 glass"
                              )}
                            >
                              <div className={cn(
                                "h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
                                formData.jobFunctions.includes(func.value)
                                  ? "border-[#500000] bg-[#500000]"
                                  : "border-[#500000]/30"
                              )}>
                                {formData.jobFunctions.includes(func.value) && (
                                  <div className="h-2 w-2 rounded-full bg-white" />
                                )}
                              </div>
                              {func.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Product & Design */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Product & Design</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {JOB_FUNCTIONS.filter(f => f.category === 'product').map((func) => (
                            <button
                              key={func.value}
                              type="button"
                              onClick={() => toggleArrayItem('jobFunctions', func.value)}
                              className={cn(
                                "flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all duration-200",
                                formData.jobFunctions.includes(func.value)
                                  ? "border-[#500000] bg-[#500000]/5 shadow-md shadow-[#500000]/5"
                                  : "border-[#500000]/10 hover:border-[#500000]/30 hover:bg-white/50 glass"
                              )}
                            >
                              <div className={cn(
                                "h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
                                formData.jobFunctions.includes(func.value)
                                  ? "border-[#500000] bg-[#500000]"
                                  : "border-[#500000]/30"
                              )}>
                                {formData.jobFunctions.includes(func.value) && (
                                  <div className="h-2 w-2 rounded-full bg-white" />
                                )}
                              </div>
                              {func.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Business & Operations */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Business & Operations</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {JOB_FUNCTIONS.filter(f => f.category === 'business').map((func) => (
                            <button
                              key={func.value}
                              type="button"
                              onClick={() => toggleArrayItem('jobFunctions', func.value)}
                              className={cn(
                                "flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all duration-200",
                                formData.jobFunctions.includes(func.value)
                                  ? "border-[#500000] bg-[#500000]/5 shadow-md shadow-[#500000]/5"
                                  : "border-[#500000]/10 hover:border-[#500000]/30 hover:bg-white/50 glass"
                              )}
                            >
                              <div className={cn(
                                "h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
                                formData.jobFunctions.includes(func.value)
                                  ? "border-[#500000] bg-[#500000]"
                                  : "border-[#500000]/30"
                              )}>
                                {formData.jobFunctions.includes(func.value) && (
                                  <div className="h-2 w-2 rounded-full bg-white" />
                                )}
                              </div>
                              {func.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Creative & Content */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Creative & Content</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {JOB_FUNCTIONS.filter(f => f.category === 'creative').map((func) => (
                            <button
                              key={func.value}
                              type="button"
                              onClick={() => toggleArrayItem('jobFunctions', func.value)}
                              className={cn(
                                "flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all duration-200",
                                formData.jobFunctions.includes(func.value)
                                  ? "border-[#500000] bg-[#500000]/5 shadow-md shadow-[#500000]/5"
                                  : "border-[#500000]/10 hover:border-[#500000]/30 hover:bg-white/50 glass"
                              )}
                            >
                              <div className={cn(
                                "h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
                                formData.jobFunctions.includes(func.value)
                                  ? "border-[#500000] bg-[#500000]"
                                  : "border-[#500000]/30"
                              )}>
                                {formData.jobFunctions.includes(func.value) && (
                                  <div className="h-2 w-2 rounded-full bg-white" />
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
                          <div
                            key={size.value}
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleArrayItem('preferredCompanySizes', size.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                toggleArrayItem('preferredCompanySizes', size.value)
                              }
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#500000] focus-visible:ring-offset-2",
                              formData.preferredCompanySizes.includes(size.value)
                                ? "border-[#500000] bg-[#500000]/5"
                                : "border-[#500000]/10 hover:border-[#500000]/30 hover:bg-white/50 glass"
                            )}
                          >
                            <Checkbox
                              checked={formData.preferredCompanySizes.includes(size.value)}
                              onCheckedChange={() => toggleArrayItem('preferredCompanySizes', size.value)}
                              className="pointer-events-none"
                            />
                            {size.label}
                          </div>
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
                    <p className="text-muted-foreground mt-1">
                      Pick your top 10 strongest skills (minimum 3)
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn("text-muted-foreground", formData.selectedSkills.length >= 10 && "text-[#500000] font-semibold")}>
                        {formData.selectedSkills.length} / 10 skills selected
                        {formData.selectedSkills.length >= 10 && " (max reached)"}
                      </span>
                      {formData.selectedSkills.length < 3 && (
                        <span className="text-[#500000]/60">Select {3 - formData.selectedSkills.length} more to continue</span>
                      )}
                    </div>

                    {/* Selected Skills Pills */}
                    {formData.selectedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-[#500000]/5 border border-[#500000]/10">
                        {formData.selectedSkills.map(skillId => {
                          const skill = skills.find(s => s.id === skillId)
                          if (!skill) return null
                          return (
                            <button
                              key={skill.id}
                              onClick={() => toggleArrayItem('selectedSkills', skill.id)}
                              className="group flex items-center gap-1.5 rounded-full bg-[#500000] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-[#700000]"
                            >
                              {skill.name}
                              <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {isCSMajor(formData.major) ? (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        {['language', 'framework', 'tool', 'business', 'soft'].map((category) => {
                          const categorySkills = skills.filter(s => s.category === category)
                          if (categorySkills.length === 0) return null

                          return (
                            <div key={category} className="space-y-2">
                              <h3 className="text-xs font-bold uppercase tracking-wider text-[#500000]/40 px-1">
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
                                      "rounded-xl px-4 py-2 text-sm transition-all duration-200 border",
                                      formData.selectedSkills.includes(skill.id)
                                        ? "bg-[#500000] text-white border-[#500000] shadow-md shadow-[#500000]/20"
                                        : "bg-white/40 text-[#500000]/70 border-[#500000]/10 hover:border-[#500000]/30 hover:bg-white/60",
                                      formData.selectedSkills.length >= 10 &&
                                      !formData.selectedSkills.includes(skill.id) &&
                                      "opacity-30 grayscale cursor-not-allowed"
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
                    ) : (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="relative">
                          <Input
                            placeholder="Search or add a custom skill (e.g. Graphic Design, Pitching...)"
                            value={skillSearch}
                            onChange={(e) => setSkillSearch(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addCustomSkill(skillSearch)
                              }
                            }}
                            className="bg-white/40 border-[#500000]/10 focus:border-[#500000]/30 h-14 pl-12 text-lg rounded-2xl"
                            disabled={formData.selectedSkills.length >= 10}
                          />
                          <Code className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-[#500000]/30" />
                          {skillSearch && (
                            <button
                              type="button"
                              disabled={formData.selectedSkills.length >= 10}
                              onClick={() => addCustomSkill(skillSearch)}
                              className={cn(
                                "absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl text-sm font-medium transition-colors",
                                formData.selectedSkills.length >= 10
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-[#500000] text-white hover:bg-[#700000]"
                              )}
                            >
                              {formData.selectedSkills.length >= 10 ? 'Max 10 reached' : 'Add Custom'}
                            </button>
                          )}
                        </div>

                        {/* Quick Picks / Filtered Results */}
                        <div className="space-y-6">
                          {skillSearch === '' ? (
                            <div className="space-y-4">
                              <h3 className="text-sm font-bold uppercase tracking-wider text-[#500000]/40 px-1">Startup Quick Picks</h3>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {STARTUP_QUICK_PICKS.filter(pick =>
                                  !formData.selectedSkills.some(id =>
                                    (skills.find(s => s.id === id)?.name || id.replace('custom:', '')).toLowerCase() === pick.name.toLowerCase()
                                  )
                                ).slice(0, 15).map((pick) => (
                                  <button
                                    key={pick.name}
                                    type="button"
                                    disabled={formData.selectedSkills.length >= 10}
                                    onClick={() => addCustomSkill(pick.name)}
                                    className={cn(
                                      "flex items-center justify-between p-3 rounded-xl border border-[#500000]/5 bg-white/20 hover:bg-white/60 hover:border-[#500000]/20 transition-all text-left group",
                                      formData.selectedSkills.length >= 10 && "opacity-40 cursor-not-allowed hover:bg-white/20 hover:border-[#500000]/5"
                                    )}
                                  >
                                    <span className="text-sm font-medium text-[#500000]/80">{pick.name}</span>
                                    <Plus className="h-4 w-4 text-[#500000]/30 group-hover:text-[#500000] transition-colors" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                              {skills
                                .filter(s =>
                                  !formData.selectedSkills.includes(s.id) &&
                                  s.name.toLowerCase().includes(skillSearch.toLowerCase())
                                )
                                .slice(0, 20)
                                .map((skill) => (
                                  <button
                                    key={skill.id}
                                    type="button"
                                    disabled={formData.selectedSkills.length >= 10}
                                    onClick={() => {
                                      toggleArrayItem('selectedSkills', skill.id)
                                      setSkillSearch('')
                                    }}
                                    className={cn(
                                      "flex items-center justify-between p-4 rounded-xl border border-[#500000]/5 bg-white/20 hover:bg-white/60 hover:border-[#500000]/20 transition-all text-left group w-full",
                                      formData.selectedSkills.length >= 10 && "opacity-40 cursor-not-allowed hover:bg-white/20 hover:border-[#500000]/5"
                                    )}
                                  >
                                    <span className="text-base font-medium text-[#500000]/80">{skill.name}</span>
                                    <Plus className="h-5 w-5 text-[#500000]/30 group-hover:text-[#500000] transition-colors" />
                                  </button>
                                ))}

                              {!skills.some(s => s.name.toLowerCase() === skillSearch.toLowerCase()) && (
                                <button
                                  type="button"
                                  disabled={formData.selectedSkills.length >= 10}
                                  onClick={() => addCustomSkill(skillSearch)}
                                  className={cn(
                                    "flex items-center gap-3 p-4 rounded-xl border border-dashed border-[#500000]/20 bg-[#500000]/5 hover:bg-[#500000]/10 transition-all text-left w-full group",
                                    formData.selectedSkills.length >= 10 && "opacity-40 cursor-not-allowed hover:bg-[#500000]/5"
                                  )}
                                >
                                  <div className="h-10 w-10 rounded-full bg-[#500000]/10 flex items-center justify-center text-[#500000]">
                                    <Plus className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-[#500000]">Add &quot;{skillSearch}&quot;</div>
                                    <div className="text-xs text-[#500000]/60">Add this as a custom skill to your profile</div>
                                  </div>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Experience */}
              {step === 5 && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold">Work Experience</h1>
                    <p className="text-muted-foreground mt-1">
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
                            <p className="text-sm text-muted-foreground">{exp.companyName}</p>
                            <p className="text-xs text-dim mt-1">
                              {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExperience(index)}
                            className="text-dim hover:text-muted-foreground"
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
                      variant="ghost"
                      onClick={addExperience}
                      disabled={!newExperience.companyName || !newExperience.title}
                      className="w-full border border-dashed border-[#500000]/20 text-[#500000]/60 hover:text-[#500000] hover:bg-[#500000]/5 hover:border-[#500000]/40"
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
                    <p className="text-muted-foreground mt-1">
                      Help startups understand who you are and what you&apos;re looking for
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="headline">
                        Describe yourself in a short phrase. e.g. &quot;Recent EE college grad specializing in Photonics&quot;, &quot;DevOps engineer who scaled a site to 10M+ users&quot; *
                      </Label>
                      <Input
                        id="headline"
                        value={formData.headline}
                        onChange={(e) => updateFormData('headline', e.target.value)}
                        placeholder='e.g., "Marketing strategist with data-driven approach", "Finance major passionate about startups", "Creative designer with UX focus"'
                      />
                      <p className="text-xs text-muted-foreground">
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
                      <p className="text-xs text-muted-foreground">
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

                    <div className="space-y-4 pt-4 border-t border-[#500000]/10">
                      <div className="space-y-2">
                        <Label htmlFor="resume">Resume (Link or Upload)</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              id="resumeUrl"
                              value={formData.resumeUrl}
                              onChange={(e) => updateFormData('resumeUrl', e.target.value)}
                              placeholder="https://..."
                              className="pl-10"
                            />
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#500000]/40" />
                          </div>
                          <div className="relative">
                            <input
                              type="file"
                              id="resume-upload"
                              className="hidden"
                              accept=".pdf,.doc,.docx"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return

                                setUploadingResume(true)
                                try {
                                  // We'll use a client-side supabase client here
                                  const { createClient } = await import('@/lib/supabase/client')
                                  const supabase = createClient()

                                  const fileExt = file.name.split('.').pop()
                                  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
                                  const filePath = `resumes/${fileName}`

                                  const { error: uploadError } = await supabase.storage
                                    .from('resumes')
                                    .upload(filePath, file)

                                  if (uploadError) throw uploadError

                                  const { data: { publicUrl } } = supabase.storage
                                    .from('resumes')
                                    .getPublicUrl(filePath)

                                  updateFormData('resumeUrl', publicUrl)
                                } catch (err: any) {
                                  console.error('Error uploading resume:', err)
                                  setError(err.message || 'Failed to upload resume')
                                } finally {
                                  setUploadingResume(false)
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              disabled={uploadingResume}
                              onClick={() => document.getElementById('resume-upload')?.click()}
                              className="whitespace-nowrap"
                            >
                              {uploadingResume ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Upload className="h-4 w-4 mr-2" />
                              )}
                              Upload PDF
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Provide a link to your resume (Google Drive, Dropbox) or upload a PDF
                        </p>
                      </div>
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
                className="btn-maroon-glass px-8"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="btn-maroon-glass px-8 w-full sm:w-auto"
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
