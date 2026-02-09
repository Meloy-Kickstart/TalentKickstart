'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { SkillBadge } from '@/components/cards/skill-badge'
import {
  updateProfile,
  updateStudentProfile,
  updateStudentSkills,
  toggleAvailability,
  addExperience,
  deleteExperience,
} from '@/lib/actions/student'
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  Github,
  Linkedin,
  Globe,
  X,
  Check,
} from 'lucide-react'

interface Skill {
  id: string
  name: string
  category?: string | null
}

interface Experience {
  id: string
  company: string
  title: string
  start_date: string
  end_date?: string | null
  is_current: boolean
  description?: string | null
}

interface ProfileEditorProps {
  profile: {
    id: string
    full_name?: string | null
    avatar_url?: string | null
  } | null
  student: {
    id: string
    headline?: string | null
    bio?: string | null
    university?: string | null
    major?: string | null
    graduation_year?: number | null
    github_url?: string | null
    linkedin_url?: string | null
    portfolio_url?: string | null
    resume_url?: string | null
    is_available: boolean | null
    looking_for?: string | null
    proud_project?: string | null
    preferred_company_size?: string[] | null
    preferred_role_types?: string[] | null
  } | null
  experiences: Experience[]
  allSkills: Skill[]
  currentSkillIds: string[]
}

export function ProfileEditor({
  profile,
  student,
  experiences,
  allSkills,
  currentSkillIds,
}: ProfileEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedSkills, setSelectedSkills] = useState<string[]>(currentSkillIds)
  const [showSkillPicker, setShowSkillPicker] = useState(false)
  const [showAddExperience, setShowAddExperience] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Group skills by category
  const skillsByCategory = allSkills.reduce((acc, skill) => {
    const category = skill.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  const handleSaveProfile = async (formData: FormData) => {
    setSaveStatus('saving')
    startTransition(async () => {
      await updateProfile(formData)
      await updateStudentProfile(formData)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
      router.refresh()
    })
  }

  const handleSaveSkills = () => {
    startTransition(async () => {
      await updateStudentSkills(selectedSkills)
      setShowSkillPicker(false)
      router.refresh()
    })
  }

  const toggleSkill = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter(id => id !== skillId))
    } else if (selectedSkills.length < 10) {
      setSelectedSkills([...selectedSkills, skillId])
    }
  }

  const handleAddExperience = async (formData: FormData) => {
    startTransition(async () => {
      await addExperience(formData)
      setShowAddExperience(false)
      router.refresh()
    })
  }

  const handleDeleteExperience = async (experienceId: string) => {
    if (!confirm('Delete this experience?')) return
    startTransition(async () => {
      await deleteExperience(experienceId)
      router.refresh()
    })
  }

  const handleToggleAvailability = async () => {
    startTransition(async () => {
      await toggleAvailability()
      router.refresh()
    })
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="text-muted">
            Update your profile to help startups find you
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">Available</span>
            <Switch
              checked={student?.is_available || false}
              onCheckedChange={handleToggleAvailability}
            />
          </div>
        </div>
      </div>

      <form action={handleSaveProfile} className="space-y-8">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Your name and headline that appears on your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={profile?.full_name || ''}
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                name="headline"
                defaultValue={student?.headline || ''}
                placeholder="e.g., Full-stack developer interested in fintech"
                maxLength={100}
              />
              <p className="text-xs text-dim mt-1">
                A short description that appears under your name
              </p>
            </div>
            <div>
              <Label htmlFor="bio">About You</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={student?.bio || ''}
                placeholder="Tell startups about yourself, your interests, and what makes you unique..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                name="university"
                defaultValue={student?.university || 'Texas A&M University'}
                placeholder="Texas A&M University"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="major">Major</Label>
                <Input
                  id="major"
                  name="major"
                  defaultValue={student?.major || ''}
                  placeholder="Computer Science"
                />
              </div>
              <div>
                <Label htmlFor="graduation_year">Graduation Year</Label>
                <Input
                  id="graduation_year"
                  name="graduation_year"
                  type="number"
                  defaultValue={student?.graduation_year || ''}
                  placeholder="2025"
                  min={2020}
                  max={2030}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* YC-Style Questions */}
        <Card>
          <CardHeader>
            <CardTitle>About Your Goals</CardTitle>
            <CardDescription>
              Help startups understand what you're looking for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="looking_for">What are you looking for in your next role?</Label>
              <Textarea
                id="looking_for"
                name="looking_for"
                defaultValue={student?.looking_for || ''}
                placeholder="I'm looking for a role where I can..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="proud_project">Tell us about a project you're proud of</Label>
              <Textarea
                id="proud_project"
                name="proud_project"
                defaultValue={student?.proud_project || ''}
                placeholder="Describe a project, what you built, and what you learned..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
            <CardDescription>
              Add links to help startups learn more about you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="github_url" className="flex items-center gap-2">
                <Github className="h-4 w-4" /> GitHub
              </Label>
              <Input
                id="github_url"
                name="github_url"
                type="url"
                defaultValue={student?.github_url || ''}
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </Label>
              <Input
                id="linkedin_url"
                name="linkedin_url"
                type="url"
                defaultValue={student?.linkedin_url || ''}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <Label htmlFor="portfolio_url" className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> Portfolio Website
              </Label>
              <Input
                id="portfolio_url"
                name="portfolio_url"
                type="url"
                defaultValue={student?.portfolio_url || ''}
                placeholder="https://yoursite.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Skills Section */}
      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Skills</CardTitle>
            <CardDescription>
              Select up to 10 skills that best describe your expertise
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSkillPicker(!showSkillPicker)}
          >
            {showSkillPicker ? 'Cancel' : 'Edit Skills'}
          </Button>
        </CardHeader>
        <CardContent>
          {showSkillPicker ? (
            <div className="space-y-6">
              <div className="text-sm text-muted">
                {selectedSkills.length}/10 skills selected
              </div>
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category}>
                  <h4 className="font-medium mb-2">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill.id)
                      return (
                        <Badge
                          key={skill.id}
                          variant={isSelected ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleSkill(skill.id)}
                        >
                          {skill.name}
                          {isSelected && <X className="h-3 w-3 ml-1" />}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              ))}
              <div className="flex justify-end">
                <Button onClick={handleSaveSkills} disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Skills
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentSkillIds.length > 0 ? (
                allSkills
                  .filter(s => currentSkillIds.includes(s.id))
                  .map(skill => (
                    <SkillBadge key={skill.id} name={skill.name} />
                  ))
              ) : (
                <p className="text-dim text-sm">No skills added yet</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience Section */}
      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Experience</CardTitle>
            <CardDescription>
              Add your work experience, internships, or projects
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddExperience(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Experience
          </Button>
        </CardHeader>
        <CardContent>
          {showAddExperience && (
            <form action={handleAddExperience} className="mb-6 p-4 border rounded-lg">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="exp_company">Company</Label>
                  <Input
                    id="exp_company"
                    name="company"
                    required
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <Label htmlFor="exp_title">Title</Label>
                  <Input
                    id="exp_title"
                    name="title"
                    required
                    placeholder="Your role"
                  />
                </div>
                <div>
                  <Label htmlFor="exp_start_date">Start Date</Label>
                  <Input
                    id="exp_start_date"
                    name="start_date"
                    type="date"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="exp_end_date">End Date</Label>
                  <Input
                    id="exp_end_date"
                    name="end_date"
                    type="date"
                    placeholder="Leave blank if current"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="exp_description">Description</Label>
                <Textarea
                  id="exp_description"
                  name="description"
                  placeholder="What did you work on? What did you accomplish?"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="exp_is_current"
                  name="is_current"
                  className="rounded"
                />
                <Label htmlFor="exp_is_current" className="font-normal">
                  I currently work here
                </Label>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddExperience(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add
                </Button>
              </div>
            </form>
          )}

          {experiences.length > 0 ? (
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="flex items-start justify-between py-4 border-b last:border-0">
                  <div>
                    <h4 className="font-medium">{exp.title}</h4>
                    <p className="text-sm text-muted">{exp.company}</p>
                    <p className="text-xs text-dim">
                      {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      {' - '}
                      {exp.is_current
                        ? 'Present'
                        : exp.end_date
                          ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                          : 'Present'}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-muted mt-2">{exp.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteExperience(exp.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : !showAddExperience && (
            <p className="text-dim text-sm">No experience added yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
