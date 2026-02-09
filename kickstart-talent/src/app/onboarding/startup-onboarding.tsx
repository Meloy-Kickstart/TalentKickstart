"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { completeStartupOnboarding } from "@/lib/actions/startup"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Building2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Linkedin,
  Globe,
} from "lucide-react"

const STAGES = [
  { value: 'idea', label: 'Idea Stage' },
  { value: 'pre-seed', label: 'Pre-Seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'series-a', label: 'Series A' },
  { value: 'series-b', label: 'Series B' },
  { value: 'growth', label: 'Growth Stage' },
]

const INDUSTRIES = [
  'AI / Machine Learning',
  'B2B Software',
  'Consumer',
  'Developer Tools',
  'E-commerce',
  'Education',
  'Enterprise',
  'Fintech',
  'Healthcare',
  'Hardware',
  'Marketplace',
  'SaaS',
  'Social',
  'Real Estate',
  'Food & Beverage',
  'Retail',
  'Manufacturing',
  'Logistics',
  'Media & Entertainment',
  'Sports',
  'Travel & Hospitality',
  'Agriculture',
  'Clean Tech / Sustainability',
  'Legal Tech',
  'Insurance',
  'Non-Profit',
  'Other',
]

const TEAM_SIZES = [
  { value: '1-5', label: '1-5 people' },
  { value: '6-10', label: '6-10 people' },
  { value: '11-25', label: '11-25 people' },
  { value: '26-50', label: '26-50 people' },
  { value: '51-100', label: '51-100 people' },
  { value: '100+', label: '100+ people' },
]

const STEPS = [
  { id: 1, title: 'Your Info', icon: User },
  { id: 2, title: 'Company', icon: Building2 },
]

export function StartupOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    // Personal Info
    fullName: '',
    phone: '',
    linkedinUrl: '',
    
    // Company Info
    companyName: '',
    tagline: '',
    description: '',
    website: '',
    stage: '',
    industry: '',
    teamSize: '',
    location: '',
  })

  const progress = (step / STEPS.length) * 100

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await completeStartupOnboarding({
        profile: {
          fullName: formData.fullName,
          phone: formData.phone,
          linkedinUrl: formData.linkedinUrl,
        },
        startup: {
          companyName: formData.companyName,
          tagline: formData.tagline,
          description: formData.description,
          website: formData.website,
          stage: formData.stage,
          industry: formData.industry,
          teamSize: formData.teamSize,
          location: formData.location,
        },
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
        return (
          formData.companyName.trim() !== '' &&
          formData.tagline.trim() !== '' &&
          formData.stage !== ''
        )
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
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold">Tell us about yourself</h1>
                    <p className="text-muted mt-1">
                      We&apos;ll use this to connect you with talent
                    </p>
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
                  </div>
                </div>
              )}

              {/* Step 2: Company Info */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold">About your startup</h1>
                    <p className="text-muted mt-1">
                      Help students understand what you&apos;re building
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) => updateFormData('companyName', e.target.value)}
                        placeholder="Acme Inc"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tagline">One-line Description *</Label>
                      <Input
                        id="tagline"
                        value={formData.tagline}
                        onChange={(e) => updateFormData('tagline', e.target.value)}
                        placeholder="We're building the future of..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Full Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        placeholder="Tell students more about what you're building, your mission, and your team culture..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Website
                        </div>
                      </Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => updateFormData('website', e.target.value)}
                        placeholder="https://acme.com"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stage">Stage *</Label>
                        <Select
                          value={formData.stage}
                          onValueChange={(value) => updateFormData('stage', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            {STAGES.map((stage) => (
                              <SelectItem key={stage.value} value={stage.value}>
                                {stage.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teamSize">Team Size</Label>
                        <Select
                          value={formData.teamSize}
                          onValueChange={(value) => updateFormData('teamSize', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {TEAM_SIZES.map((size) => (
                              <SelectItem key={size.value} value={size.value}>
                                {size.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select
                          value={INDUSTRIES.includes(formData.industry) ? formData.industry : (formData.industry ? 'Other' : '')}
                          onValueChange={(value) => {
                            if (value === 'Other') {
                              updateFormData('industry', '')
                            } else {
                              updateFormData('industry', value)
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDUSTRIES.map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {(!INDUSTRIES.includes(formData.industry) || formData.industry === '') && (
                          <Input
                            id="customIndustry"
                            value={formData.industry === 'Other' ? '' : formData.industry}
                            onChange={(e) => updateFormData('industry', e.target.value)}
                            placeholder="Enter your industry"
                            className="mt-2"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => updateFormData('location', e.target.value)}
                          placeholder="San Francisco, CA"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-amber-950/30 border border-amber-900/50 p-4">
                    <p className="text-sm text-amber-300">
                      <strong>Note:</strong> Your startup profile will need to be verified by our team before it becomes visible to students. This usually takes 1-2 business days.
                    </p>
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
                Complete Setup
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
