'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { createRole, updateRole } from '@/lib/actions/startup'
import {
  Save,
  Loader2,
  X,
  ArrowLeft,
  Plus,
} from 'lucide-react'
import Link from 'next/link'

interface Skill {
  id: string
  name: string
  category?: string | null
}

interface RoleFormProps {
  allSkills: Skill[]
  startup: {
    id: string
    company_name: string
    location?: string | null
  }
  role?: {
    id: string
    title: string
    description?: string | null
    requirements?: string | null
    role_type?: string | null
    location?: string | null
    is_remote: boolean | null
    salary_min?: number | null
    salary_max?: number | null
    equity_min?: number | null
    equity_max?: number | null
    is_active: boolean | null
  }
  currentSkillIds?: string[]
}

const roleTypes = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
]

export function RoleForm({ allSkills, startup, role, currentSkillIds = [] }: RoleFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedSkills, setSelectedSkills] = useState<string[]>(currentSkillIds)
  const [customSkills, setCustomSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isRemote, setIsRemote] = useState(role?.is_remote || false)
  const [isActive, setIsActive] = useState(role?.is_active !== false)

  // Filter skills for autocomplete
  const filteredSkills = useMemo(() => {
    if (!skillInput.trim()) return []
    const searchTerm = skillInput.toLowerCase()
    return allSkills
      .filter(skill => 
        skill.name.toLowerCase().includes(searchTerm) &&
        !selectedSkills.includes(skill.id)
      )
      .slice(0, 8)
  }, [skillInput, allSkills, selectedSkills])

  const addSkill = (skillId: string) => {
    if (selectedSkills.length + customSkills.length < 10 && !selectedSkills.includes(skillId)) {
      setSelectedSkills([...selectedSkills, skillId])
    }
    setSkillInput('')
    setShowSuggestions(false)
  }

  const addCustomSkill = (skillName: string) => {
    const trimmed = skillName.trim()
    if (trimmed && selectedSkills.length + customSkills.length < 10 && !customSkills.includes(trimmed)) {
      // Check if this skill exists in allSkills
      const existingSkill = allSkills.find(s => s.name.toLowerCase() === trimmed.toLowerCase())
      if (existingSkill && !selectedSkills.includes(existingSkill.id)) {
        setSelectedSkills([...selectedSkills, existingSkill.id])
      } else if (!existingSkill) {
        setCustomSkills([...customSkills, trimmed])
      }
    }
    setSkillInput('')
    setShowSuggestions(false)
  }

  const removeSkill = (skillId: string) => {
    setSelectedSkills(selectedSkills.filter(id => id !== skillId))
  }

  const removeCustomSkill = (skillName: string) => {
    setCustomSkills(customSkills.filter(name => name !== skillName))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredSkills.length > 0) {
        addSkill(filteredSkills[0].id)
      } else if (skillInput.trim()) {
        addCustomSkill(skillInput)
      }
    }
  }

  const handleSubmit = async (formData: FormData) => {
    formData.append('skill_ids', JSON.stringify(selectedSkills))
    formData.append('custom_skills', JSON.stringify(customSkills))
    formData.append('is_remote', isRemote.toString())
    formData.append('is_active', isActive.toString())

    startTransition(async () => {
      if (role) {
        await updateRole(role.id, formData)
      } else {
        await createRole(formData)
      }
      router.push('/startup/roles')
    })
  }

  const selectedSkillNames = selectedSkills
    .map(id => allSkills.find(s => s.id === id)?.name)
    .filter(Boolean) as string[]

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Role Details</CardTitle>
          <CardDescription>
            Basic information about the position
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Role Title *</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={role?.title}
              placeholder="e.g., Full-Stack Engineer, Product Designer"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="role_type">Role Type</Label>
              <select
                id="role_type"
                name="role_type"
                defaultValue={role?.role_type || 'full_time'}
                className="flex h-10 w-full rounded-md border border-edge bg-card px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-maroon-700 focus:ring-offset-2 text-foreground"
              >
                {roleTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={role?.location || startup.location || ''}
                placeholder="e.g., College Station, TX"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_remote"
              checked={isRemote}
              onCheckedChange={setIsRemote}
            />
            <Label htmlFor="is_remote" className="font-normal">
              Remote work is possible
            </Label>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              required
              defaultValue={role?.description || ''}
              placeholder="Describe the role, responsibilities, and what a typical day looks like..."
              rows={6}
            />
          </div>

          <div>
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              name="requirements"
              defaultValue={role?.requirements || ''}
              placeholder="List any specific requirements, qualifications, or nice-to-haves..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Compensation */}
      <Card>
        <CardHeader>
          <CardTitle>Compensation</CardTitle>
          <CardDescription>
            Optional salary and equity information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="salary_min">Salary Min ($/year)</Label>
              <Input
                id="salary_min"
                name="salary_min"
                type="number"
                defaultValue={role?.salary_min || ''}
                placeholder="50000"
                min={0}
              />
            </div>
            <div>
              <Label htmlFor="salary_max">Salary Max ($/year)</Label>
              <Input
                id="salary_max"
                name="salary_max"
                type="number"
                defaultValue={role?.salary_max || ''}
                placeholder="80000"
                min={0}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="equity_min">Equity Min (%)</Label>
              <Input
                id="equity_min"
                name="equity_min"
                type="number"
                defaultValue={role?.equity_min || ''}
                placeholder="0.1"
                min={0}
                max={100}
                step={0.01}
              />
            </div>
            <div>
              <Label htmlFor="equity_max">Equity Max (%)</Label>
              <Input
                id="equity_max"
                name="equity_max"
                type="number"
                defaultValue={role?.equity_max || ''}
                placeholder="0.5"
                min={0}
                max={100}
                step={0.01}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Required Skills</CardTitle>
          <CardDescription>
            Add skills that are relevant for this role (up to 10). Type to search or add custom skills.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Selected Skills */}
            {(selectedSkillNames.length > 0 || customSkills.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {selectedSkillNames.map((name, idx) => (
                  <Badge
                    key={selectedSkills[idx]}
                    variant="default"
                    className="cursor-pointer pr-1"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => removeSkill(selectedSkills[idx])}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {customSkills.map((name) => (
                  <Badge
                    key={name}
                    variant="secondary"
                    className="cursor-pointer pr-1"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => removeCustomSkill(name)}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Skill Input */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a skill (e.g., React, Marketing, Excel)..."
                    value={skillInput}
                    onChange={(e) => {
                      setSkillInput(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={handleKeyDown}
                    disabled={selectedSkills.length + customSkills.length >= 10}
                  />
                  
                  {/* Autocomplete Suggestions */}
                  {showSuggestions && filteredSkills.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-card border border-edge rounded-md shadow-lg max-h-48 overflow-auto">
                      {filteredSkills.map((skill) => (
                        <button
                          key={skill.id}
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-card-hover flex items-center justify-between"
                          onMouseDown={() => addSkill(skill.id)}
                        >
                          <span>{skill.name}</span>
                          <span className="text-xs text-dim">{skill.category}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => skillInput.trim() && addCustomSkill(skillInput)}
                  disabled={!skillInput.trim() || selectedSkills.length + customSkills.length >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted mt-2">
                {selectedSkills.length + customSkills.length}/10 skills added. Press Enter to add or click the + button.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      {role && (
        <Card>
          <CardHeader>
            <CardTitle>Role Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="is_active" className="font-normal">
                Role is active and accepting applications
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link href="/startup/roles">
          <Button type="button" variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {role ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {role ? 'Update Role' : 'Post Role'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
